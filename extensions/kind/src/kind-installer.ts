/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/
import * as extensionApi from '@tmpwip/extension-api';
import { downloadRelease } from '@terascope/fetch-github-release';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { Octokit } from '@octokit/rest';
import { isWindows } from './util';
import { Provider } from '@tmpwip/extension-api';

const githubOrganization = 'kubernetes-sigs';
const githubRepo = 'kind';

export class KindInstaller {
  private assetNames = new Map<string, string>();

  private assetPromise: Promise<string>;

  constructor(private readonly storagePath: string) {
    this.assetNames.set('win32-x64', 'kind-windows-amd64');
    this.assetNames.set('linux-x64', 'kind-linux-amd64');
    this.assetNames.set('linux-arm64', 'kind-linux-arm64');
    this.assetNames.set('darwin-x64', 'kind-darwin-amd64');
    this.assetNames.set('darwin-arm64', 'kind-darwin-arm64');
  }

  findAsset(data: any, assetName: string): string {
    for (const release of data) {
      for (const asset of release.assets) {
        if (asset.name === assetName) {
          return assetName;
        }
      }
    }
    return undefined;
  }

  async getAssetName(): Promise<string> {
    if (!this.assetPromise) {
      const assetName = this.assetNames.get(os.platform().concat('-').concat(os.arch()));
      const octokit = new Octokit();
      return octokit
        .request(`GET /repos/${githubOrganization}/${githubRepo}/releases`)
        .then(response => this.findAsset(response.data, assetName));
    }
    return this.assetPromise;
  }

  async isAvailable(): Promise<boolean> {
    const assetName = await this.getAssetName();
    return assetName !== undefined;
  }

  async performInstall(provider: Provider): Promise<void> {
    console.log('Installing kind');
    const dialogResult = await extensionApi.window.showInformationMessage(
      `kind is not installed on this system, would you like to install Kind ?`,
      'Yes',
      'No',
    );
    if (dialogResult === 'Yes') {
      const assetName = this.assetNames.get(os.platform().concat('-').concat(os.arch()));
      if (assetName) {
        await downloadRelease(
          githubOrganization,
          githubRepo,
          this.storagePath,
          release => !release.draft && !release.prerelease,
          asset => asset.name === assetName,
        ).then(assets => {
          assets.forEach(asset => {
            if (isWindows) {
              fs.renameSync(asset, asset + '.exe');
            } else {
              fs.chmodSync(asset, 'u+x');
            }
          });
          provider.updateStatus('ready');
        });
      }
    }
  }
}
