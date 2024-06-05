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

export interface KubectlGithubReleaseArtifactMetadata extends QuickPickItem {
  tag: string;
  id: number;
}

// Allows to interact with Kubectl Releases on GitHub
export class KubectlGitHubReleases {
  private static readonly KUBECTL_GITHUB_OWNER = 'kubernetes';
  private static readonly KUBECTL_GITHUB_REPOSITORY = 'kubernetes';
  private static readonly DOWNLOAD_URL_PREFIX = 'https://dl.k8s.io/release';

  constructor(private readonly octokit: Octokit) {}

  // Provides last 5 majors releases from GitHub using the GitHub API
  // return name, tag and id of the release
  async grabLatestsReleasesMetadata(): Promise<KubectlGithubReleaseArtifactMetadata[]> {
    // Grab last 5 majors releases from GitHub using the GitHub API

    const lastReleases = await this.octokit.repos.listReleases({
      owner: KubectlGitHubReleases.KUBECTL_GITHUB_OWNER,
      repo: KubectlGitHubReleases.KUBECTL_GITHUB_REPOSITORY,
      per_page: 10, // limit to last 5 releases
    });

    return lastReleases.data
      .filter(release => !release.prerelease)
      .map(release => {
        return {
          label: release.name ?? release.tag_name,
          tag: release.tag_name,
          id: release.id,
        };
      })
      .slice(0, 5);
  }

  // Get the asset id of a given release number for a given operating system and architecture
  // operatingSystem: win32, darwin, linux (see os.platform())
  // arch: x64, arm64 (see os.arch())
  async getReleaseAssetURL(version: string, operatingSystem: string, arch: string): Promise<string> {
    let extension = '';
    if (operatingSystem === 'win32') {
      operatingSystem = 'windows';
      extension = '.exe';
    }
    if (arch === 'x64') {
      arch = 'amd64';
    }

    return `${KubectlGitHubReleases.DOWNLOAD_URL_PREFIX}/${version}/bin/${operatingSystem}/${arch}/kubectl${extension}`;
  }

  // download the given asset id
  async downloadReleaseAsset(url: string, destination: string): Promise<void> {
    // check the parent folder exists
    const parentFolder = path.dirname(destination);

    if (!fs.existsSync(parentFolder)) {
      await fs.promises.mkdir(parentFolder, { recursive: true });
    }

    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      console.error(`Error downloading file: ${destination} ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const abuffer = await response.arrayBuffer();
    await fs.promises.writeFile(destination, Buffer.from(abuffer));
  }
}
