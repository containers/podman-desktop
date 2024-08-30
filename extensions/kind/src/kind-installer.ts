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

import type { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';

export interface AssetInfo {
  id: number;
  name: string;
}

export interface KindGithubReleaseArtifactMetadata extends extensionApi.QuickPickItem {
  tag: string;
  id: number;
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
  private readonly KIND_GITHUB_OWNER = 'kubernetes-sigs';
  private readonly KIND_GITHUB_REPOSITORY = 'kind';
  private assetNames = new Map<string, string>();

  constructor(
    private readonly storagePath: string,
    private telemetryLogger: extensionApi.TelemetryLogger,
    private readonly octokit: Octokit,
  ) {
    this.assetNames.set(WINDOWS_X64_PLATFORM, WINDOWS_X64_ASSET_NAME);
    this.assetNames.set(LINUX_X64_PLATFORM, LINUX_X64_ASSET_NAME);
    this.assetNames.set(LINUX_ARM64_PLATFORM, LINUX_ARM64_ASSET_NAME);
    this.assetNames.set(MACOS_X64_PLATFORM, MACOS_X64_ASSET_NAME);
    this.assetNames.set(MACOS_ARM64_PLATFORM, MACOS_ARM64_ASSET_NAME);
  }

  // Provides last 5 majors releases from GitHub using the GitHub API
  // return name, tag and id of the release
  async grabLatestsReleasesMetadata(): Promise<KindGithubReleaseArtifactMetadata[]> {
    // Grab last 5 majors releases from GitHub using the GitHub API

    const lastReleases = await this.octokit.repos.listReleases({
      owner: this.KIND_GITHUB_OWNER,
      repo: this.KIND_GITHUB_REPOSITORY,
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

  async promptUserForVersion(currentKindTag?: string): Promise<KindGithubReleaseArtifactMetadata> {
    // Get the latest releases
    let lastReleasesMetadata = await this.grabLatestsReleasesMetadata();
    // if the user already has an installed version, we remove it from the list
    if (currentKindTag) {
      lastReleasesMetadata = lastReleasesMetadata.filter(release => release.tag.slice(1) !== currentKindTag);
    }

    // Show the quickpick
    const selectedRelease = await extensionApi.window.showQuickPick(lastReleasesMetadata, {
      placeHolder: 'Select Kind version to download',
    });

    if (selectedRelease) {
      return selectedRelease;
    } else {
      throw new Error('No version selected');
    }
  }

  // Get the asset id of a given release number for a given operating system and architecture
  // operatingSystem: win32, darwin, linux (see os.platform())
  // arch: x64, arm64 (see os.arch())
  async getReleaseAssetId(releaseId: number, operatingSystem: string, arch: string): Promise<number> {
    if (operatingSystem === 'win32') {
      operatingSystem = 'windows';
    }
    if (arch === 'x64') {
      arch = 'amd64';
    }

    const listOfAssets = await this.octokit.repos.listReleaseAssets({
      owner: this.KIND_GITHUB_OWNER,
      repo: this.KIND_GITHUB_REPOSITORY,
      release_id: releaseId,
    });

    const searchedAssetName = `kind-${operatingSystem}-${arch}`;

    // search for the right asset
    const asset = listOfAssets.data.find(asset => searchedAssetName === asset.name);
    if (!asset) {
      throw new Error(`No asset found for ${operatingSystem} and ${arch}`);
    }

    return asset.id;
  }

  getKindCliStoragePath(): string {
    const storageBinFolder = path.resolve(this.storagePath, 'bin');
    let fileExtension = '';
    if (extensionApi.env.isWindows) {
      fileExtension = '.exe';
    }
    return path.resolve(storageBinFolder, `kind${fileExtension}`);
  }

  async download(release: KindGithubReleaseArtifactMetadata): Promise<void> {
    // Get asset id
    const assetId = await this.getReleaseAssetId(release.id, os.platform(), os.arch());

    // Get the storage and check to see if it exists before we download Kind
    const storageBinFolder = path.resolve(this.storagePath, 'bin');
    if (!fs.existsSync(storageBinFolder)) {
      await fs.promises.mkdir(storageBinFolder, { recursive: true });
    }

    const kindDownloadLocation = this.getKindCliStoragePath();

    // Download the asset and make it executable
    await this.downloadReleaseAsset(assetId, kindDownloadLocation);
    // make executable
    if (extensionApi.env.isLinux || extensionApi.env.isMac) {
      // eslint-disable-next-line sonarjs/file-permissions
      await fs.promises.chmod(kindDownloadLocation, 0o755);
    }
  }

  async downloadReleaseAsset(assetId: number, destination: string): Promise<void> {
    const asset = await this.octokit.repos.getReleaseAsset({
      owner: this.KIND_GITHUB_OWNER,
      repo: this.KIND_GITHUB_REPOSITORY,
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
