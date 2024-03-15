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

import { existsSync, promises } from 'node:fs';
import { arch, platform } from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import type { KubectlGithubReleaseArtifactMetadata, KubectlGitHubReleases } from './kubectl-github-releases';
import type { OS } from './os';
import { makeExecutable } from './utils';

export class KubectlDownload {
  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly kubectlGitHubReleases: KubectlGitHubReleases,
    private readonly os: OS,
  ) {}

  // Get the latest version of kubectl from GitHub Releases
  // and return the artifact metadata
  async getLatestVersionAsset(): Promise<KubectlGithubReleaseArtifactMetadata> {
    const latestReleases = await this.kubectlGitHubReleases.grabLatestsReleasesMetadata();
    return latestReleases[0];
  }

  // Create a "quickpick" prompt to ask the user which version of kubectl they want to download
  async promptUserForVersion(): Promise<KubectlGithubReleaseArtifactMetadata> {
    // Get the latest releases
    const lastReleasesMetadata = await this.kubectlGitHubReleases.grabLatestsReleasesMetadata();

    // Show the quickpick
    const selectedRelease = await extensionApi.window.showQuickPick(lastReleasesMetadata, {
      placeHolder: 'Select kubectl version to download',
    });

    if (selectedRelease) {
      return selectedRelease;
    } else {
      throw new Error('No version selected');
    }
  }

  // Download kubectl from the artifact metadata: KubectlGithubReleaseArtifactMetadata
  // this will download it to the storage bin folder as well as make it executable
  async download(release: KubectlGithubReleaseArtifactMetadata): Promise<void> {
    // Get asset id
    const url = await this.kubectlGitHubReleases.getReleaseAssetURL(release.tag, platform(), arch());

    // Get the storage and check to see if it exists before we download kubectl
    const storageData = this.extensionContext.storagePath;
    const storageBinFolder = path.resolve(storageData, 'bin');
    if (!existsSync(storageBinFolder)) {
      await promises.mkdir(storageBinFolder, { recursive: true });
    }

    // Correct the file extension and path resolution
    let fileExtension = '';
    if (this.os.isWindows()) {
      fileExtension = '.exe';
    }
    const kubectlDownloadLocation = path.resolve(storageBinFolder, `kubectl${fileExtension}`);

    // Download the asset and make it executable
    await this.kubectlGitHubReleases.downloadReleaseAsset(url, kubectlDownloadLocation);
    await makeExecutable(kubectlDownloadLocation);
  }
}
