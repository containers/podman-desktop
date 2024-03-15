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

import type { ComposeGithubReleaseArtifactMetadata, ComposeGitHubReleases } from './compose-github-releases';
import type { OS } from './os';
import { makeExecutable } from './utils';

export class ComposeDownload {
  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly composeGitHubReleases: ComposeGitHubReleases,
    private readonly os: OS,
  ) {}

  // Get the latest version of Compose from GitHub Releases
  // and return the artifact metadata
  async getLatestVersionAsset(): Promise<ComposeGithubReleaseArtifactMetadata> {
    const latestReleases = await this.composeGitHubReleases.grabLatestsReleasesMetadata();
    return latestReleases[0];
  }

  // Create a "quickpick" prompt to ask the user which version of Compose they want to download
  async promptUserForVersion(): Promise<ComposeGithubReleaseArtifactMetadata> {
    // Get the latest releases
    const lastReleasesMetadata = await this.composeGitHubReleases.grabLatestsReleasesMetadata();

    // Show the quickpick
    const selectedRelease = await extensionApi.window.showQuickPick(lastReleasesMetadata, {
      placeHolder: 'Select Compose version to download',
    });

    if (selectedRelease) {
      return selectedRelease;
    } else {
      throw new Error('No version selected');
    }
  }

  // Download compose from the artifact metadata: ComposeGithubReleaseArtifactMetadata
  // this will download it to the storage bin folder as well as make it executeable
  async download(release: ComposeGithubReleaseArtifactMetadata): Promise<void> {
    // Get asset id
    const assetId = await this.composeGitHubReleases.getReleaseAssetId(release.id, platform(), arch());

    // Get the storage and check to see if it exists before we download Compose
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
    const dockerComposeDownloadLocation = path.resolve(storageBinFolder, `docker-compose${fileExtension}`);

    // Download the asset and make it executable
    await this.composeGitHubReleases.downloadReleaseAsset(assetId, dockerComposeDownloadLocation);
    await makeExecutable(dockerComposeDownloadLocation);
  }
}
