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
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { components } from '@octokit/openapi-types';
import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';
import { ProgressLocation } from '@podman-desktop/api';

import { installBinaryToSystem, isWindows } from './util';

const githubOrganization = 'kubernetes-sigs';
const githubRepo = 'kind';

type GitHubRelease = components['schemas']['release'];

export interface AssetInfo {
  id: number;
  name: string;
}

const WINDOWS_X64_PLATFORM = 'win32-x64';

const LINUX_X64_PLATFORM = 'linux-x64';

const LINUX_ARM64_PLATFORM = 'linux-arm64';

const MACOS_X64_PLATFORM = 'darwin-x64';

const MACOS_ARM64_PLATFORM = 'darwin-arm64';

const WINDOWS_X64_ASSET_NAME = 'kind-windows-amd64';

const LINUX_X64_ASSET_NAME = 'kind-linux-amd64';

const LINUX_ARM64_ASSET_NAME = 'kind-linux-arm64';

const MACOS_X64_ASSET_NAME = 'kind-darwin-amd64';

const MACOS_ARM64_ASSET_NAME = 'kind-darwin-arm64';

export class KindInstaller {
  private assetNames = new Map<string, string>();

  private assetPromise: Promise<AssetInfo>;

  constructor(
    private readonly storagePath: string,
    private telemetryLogger: extensionApi.TelemetryLogger,
  ) {
    this.assetNames.set(WINDOWS_X64_PLATFORM, WINDOWS_X64_ASSET_NAME);
    this.assetNames.set(LINUX_X64_PLATFORM, LINUX_X64_ASSET_NAME);
    this.assetNames.set(LINUX_ARM64_PLATFORM, LINUX_ARM64_ASSET_NAME);
    this.assetNames.set(MACOS_X64_PLATFORM, MACOS_X64_ASSET_NAME);
    this.assetNames.set(MACOS_ARM64_PLATFORM, MACOS_ARM64_ASSET_NAME);
  }

  findAssetInfo(data: GitHubRelease[], assetName: string): AssetInfo {
    for (const release of data) {
      for (const asset of release.assets) {
        if (asset.name === assetName) {
          return {
            id: asset.id,
            name: assetName,
          };
        }
      }
    }
    return undefined;
  }

  async getAssetInfo(): Promise<AssetInfo> {
    if (!(await this.assetPromise)) {
      const assetName = this.assetNames.get(os.platform().concat('-').concat(os.arch()));
      const octokit = new Octokit();
      this.assetPromise = octokit.repos
        .listReleases({ owner: githubOrganization, repo: githubRepo })
        .then(response => this.findAssetInfo(response.data, assetName))
        .catch((error: unknown) => {
          console.error(error);
          return undefined;
        });
    }
    return this.assetPromise;
  }

  async isAvailable(): Promise<boolean> {
    const assetInfo = await this.getAssetInfo();
    return assetInfo !== undefined;
  }

  async performInstall(): Promise<boolean> {
    this.telemetryLogger.logUsage('install-kind-prompt');
    const dialogResult = await extensionApi.window.showInformationMessage(
      'The kind binary is required for local Kubernetes development, would you like to download it?',
      'Yes',
      'Cancel',
    );
    if (dialogResult === 'Yes') {
      this.telemetryLogger.logUsage('install-kind-prompt-yes');
      return extensionApi.window.withProgress(
        { location: ProgressLocation.TASK_WIDGET, title: 'Installing kind' },
        async progress => {
          progress.report({ increment: 5 });
          try {
            const assetInfo = await this.getAssetInfo();
            if (assetInfo) {
              const octokit = new Octokit();
              const asset = await octokit.repos.getReleaseAsset({
                owner: githubOrganization,
                repo: githubRepo,
                asset_id: assetInfo.id,
                headers: {
                  accept: 'application/octet-stream',
                },
              });
              progress.report({ increment: 80 });
              if (asset) {
                const destFile = path.resolve(this.storagePath, isWindows() ? assetInfo.name + '.exe' : assetInfo.name);
                if (!fs.existsSync(this.storagePath)) {
                  fs.mkdirSync(this.storagePath);
                }
                fs.appendFileSync(destFile, Buffer.from(asset.data as unknown as ArrayBuffer));
                if (!isWindows()) {
                  const stat = fs.statSync(destFile);
                  fs.chmodSync(destFile, stat.mode | fs.constants.S_IXUSR);
                }
                // Explain to the user that the binary has been successfully installed to the storage path
                // prompt and ask if they want to install it system-wide (copied to /usr/bin/, or AppData for Windows)
                const result = await extensionApi.window.showInformationMessage(
                  `Kind binary has been successfully downloaded to ${destFile}.\n\nWould you like to install it system-wide for accessibility on the command line? This will require administrative privileges.`,
                  'Yes',
                  'Cancel',
                );
                if (result === 'Yes') {
                  try {
                    // Move the binary file to the system from destFile and rename to 'kind'
                    await installBinaryToSystem(destFile, 'kind');
                    await extensionApi.window.showInformationMessage(
                      'Kind binary has been successfully installed system-wide.',
                    );
                  } catch (error) {
                    console.error(error);
                    await extensionApi.window.showErrorMessage(`Unable to install kind binary: ${error}`);
                  }
                }
                this.telemetryLogger.logUsage('install-kind-downloaded');
                extensionApi.window.showNotification({ body: 'Kind is successfully installed.' });
                return true;
              }
            }
          } finally {
            progress.report({ increment: -1 });
          }
        },
      );
    } else {
      this.telemetryLogger.logUsage('install-kind-prompt-no');
    }
    return false;
  }
}
