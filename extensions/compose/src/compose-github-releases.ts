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
import * as path from 'node:path';

import type { Octokit } from '@octokit/rest';
import type { QuickPickItem } from '@podman-desktop/api';

export interface ComposeGithubReleaseArtifactMetadata extends QuickPickItem {
  tag: string;
  id: number;
}

// Allows to interact with Compose Releases on GitHub
export class ComposeGitHubReleases {
  private static readonly COMPOSE_GITHUB_OWNER = 'docker';
  private static readonly COMPOSE_GITHUB_REPOSITORY = 'compose';

  constructor(private readonly octokit: Octokit) {}

  // Provides last 5 majors releases from GitHub using the GitHub API
  // return name, tag and id of the release
  async grabLatestsReleasesMetadata(): Promise<ComposeGithubReleaseArtifactMetadata[]> {
    // Grab last 5 majors releases from GitHub using the GitHub API

    const lastReleases = await this.octokit.repos.listReleases({
      owner: ComposeGitHubReleases.COMPOSE_GITHUB_OWNER,
      repo: ComposeGitHubReleases.COMPOSE_GITHUB_REPOSITORY,
    });

    // keep only releases and not pre-releases
    lastReleases.data = lastReleases.data.filter(release => !release.prerelease);

    // keep only the last 5 releases
    lastReleases.data = lastReleases.data.slice(0, 5);

    return lastReleases.data.map(release => {
      return {
        label: release.name ?? release.tag_name,
        tag: release.tag_name,
        id: release.id,
      };
    });
  }

  // Get the asset id of a given release number for a given operating system and architecture
  // operatingSystem: win32, darwin, linux (see os.platform())
  // arch: x64, arm64 (see os.arch())
  async getReleaseAssetId(releaseId: number, operatingSystem: string, arch: string): Promise<number> {
    let extension = '';
    if (operatingSystem === 'win32') {
      operatingSystem = 'windows';
      extension = '.exe';
    }
    if (arch === 'x64') {
      arch = 'x86_64';
    }
    if (arch === 'arm64') {
      arch = 'aarch64';
    }

    const listOfAssets = await this.octokit.repos.listReleaseAssets({
      owner: ComposeGitHubReleases.COMPOSE_GITHUB_OWNER,
      repo: ComposeGitHubReleases.COMPOSE_GITHUB_REPOSITORY,
      release_id: releaseId,
    });

    const searchedAssetName = `docker-compose-${operatingSystem}-${arch}${extension}`;

    // search for the right asset
    const asset = listOfAssets.data.find(asset => searchedAssetName === asset.name);
    if (!asset) {
      throw new Error(`No asset found for ${operatingSystem} and ${arch}`);
    }

    return asset.id;
  }

  // download the given asset id
  async downloadReleaseAsset(assetId: number, destination: string): Promise<void> {
    const asset = await this.octokit.repos.getReleaseAsset({
      owner: ComposeGitHubReleases.COMPOSE_GITHUB_OWNER,
      repo: ComposeGitHubReleases.COMPOSE_GITHUB_REPOSITORY,
      asset_id: assetId,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    // check the parent folder exists
    const parentFolder = path.dirname(destination);

    if (!fs.existsSync(parentFolder)) {
      await fs.promises.mkdir(parentFolder, { recursive: true });
    }
    // write the file
    await fs.promises.writeFile(destination, Buffer.from(asset.data as unknown as ArrayBuffer));
  }
}
