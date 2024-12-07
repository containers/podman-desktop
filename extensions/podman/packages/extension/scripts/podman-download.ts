/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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
import { Octokit } from 'octokit';
import type { OctokitOptions } from '@octokit/core/dist-types/types';
import { hashFile } from 'hasha';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';

export enum DiskType {
  WSL = 'wsl',
  Applehv = 'applehv',
}

// to make this file a module
export class PodmanDownload {
  #podmanVersion: string;

  #downloadAndCheck: DownloadAndCheck;
  #podman5DownloadMachineOS: Podman5DownloadMachineOS;

  #shaCheck: ShaCheck;

  #octokit: Octokit;
  #platform: string;
  #assetsFolder: string;

  #artifactsToDownload: {
    version: string;
    downloadName: string;
    artifactName: string;
  }[] = [];

  constructor(
    podmanJSON: {
      version: string;
      platform: {
        win32: { version: string; fileName: string };
        darwin: {
          version: string;
          arch: { x64: { fileName: string }; arm64: { fileName: string }; universal?: { fileName: string } };
        };
      };
    },
    private airgapSupport: boolean,
  ) {
    const octokitOptions: OctokitOptions = {};
    if (process.env.GITHUB_TOKEN) {
      octokitOptions.auth = process.env.GITHUB_TOKEN;
    }
    this.#octokit = new Octokit(octokitOptions);
    this.#platform = process.platform;

    this.#podmanVersion = podmanJSON.version;

    const dirname = path.dirname(fileURLToPath(import.meta.url));
    this.#assetsFolder = path.resolve(dirname, '..', 'assets');

    if (this.#platform === 'win32') {
      const tagVersion = podmanJSON.platform.win32.version;
      const downloadName = podmanJSON.platform.win32.fileName;
      this.#artifactsToDownload.push({
        version: tagVersion,
        downloadName,
        artifactName: `podman-${this.#podmanVersion}-setup.exe`,
      });
    } else if (this.#platform === 'darwin') {
      const tagVersion = podmanJSON.platform.darwin.version;
      const downloadNameAmd64 = podmanJSON.platform.darwin.arch.x64.fileName;
      this.#artifactsToDownload.push({
        version: tagVersion,
        downloadName: downloadNameAmd64,
        artifactName: 'podman-installer-macos-amd64.pkg',
      });

      const downloadNameArm64 = podmanJSON.platform.darwin.arch.arm64.fileName;
      this.#artifactsToDownload.push({
        version: tagVersion,
        downloadName: downloadNameArm64,
        artifactName: 'podman-installer-macos-arm64.pkg',
      });

      if (podmanJSON.platform.darwin.arch.universal) {
        const downloadUniversalName = podmanJSON.platform.darwin.arch.universal.fileName;
        this.#artifactsToDownload.push({
          version: tagVersion,
          downloadName: downloadUniversalName,
          artifactName: 'podman-installer-macos-universal.pkg',
        });
      }
    }
    this.#shaCheck = new ShaCheck();
    this.#downloadAndCheck = new DownloadAndCheck(this.#octokit, this.#shaCheck, this.#assetsFolder);

    if (!fs.existsSync(this.#assetsFolder)) {
      fs.mkdirSync(this.#assetsFolder);
    }

    // grab only first 2 digits from the version
    const majorMinorVersion = podmanJSON.version.split('.').slice(0, 2).join('.');
    this.#podman5DownloadMachineOS = new Podman5DownloadMachineOS(
      majorMinorVersion,
      this.#shaCheck,
      this.#assetsFolder,
    );
  }

  protected getPodman5DownloadMachineOS(): Podman5DownloadMachineOS {
    return this.#podman5DownloadMachineOS;
  }

  protected getShaCheck(): ShaCheck {
    return this.#shaCheck;
  }

  protected getArtifactsToDownload(): {
    version: string;
    downloadName: string;
    artifactName: string;
  }[] {
    return this.#artifactsToDownload;
  }

  protected getDownloadAndCheck(): DownloadAndCheck {
    return this.#downloadAndCheck;
  }

  async downloadBinaries(): Promise<void> {
    // fetch from GitHub releases
    for (const artifact of this.#artifactsToDownload) {
      await this.#downloadAndCheck.downloadAndCheckSha(artifact.version, artifact.downloadName, artifact.artifactName);
    }

    // fetch binaries in case of AirGap
    await this.downloadAirGapBinaries();
  }

  protected async downloadAirGapBinaries(): Promise<void> {
    if (!this.airgapSupport || !process.env.AIRGAP_DOWNLOAD) {
      return;
    }

    await this.#podman5DownloadMachineOS?.setAndDownload(this.#platform);
  }
}

export class DownloadAndCheck {
  readonly MAX_DOWNLOAD_ATTEMPT = 3;
  #downloadAttempt = 0;
  #octokit: Octokit;
  #shaCheck: ShaCheck;
  #assetsFolder: string;

  constructor(
    readonly octokit: Octokit,
    readonly shaCheck: ShaCheck,
    readonly assetsFolder: string,
  ) {
    this.#octokit = octokit;
    this.#shaCheck = shaCheck;
    this.#assetsFolder = assetsFolder;
  }

  public async downloadAndCheckSha(
    tagVersion: string,
    fileName: string,
    artifactName: string,
    owner: string = 'containers',
    repo: string = 'podman',
  ): Promise<void> {
    if (this.#downloadAttempt >= this.MAX_DOWNLOAD_ATTEMPT) {
      console.error('Max download attempt reached, exiting...');
      process.exit(1);
    }

    const release = await this.#octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
      owner,
      repo,
      tag: tagVersion,
    });

    let artifactRelease;
    let shasums;
    for (const asset of release.data.assets) {
      if (asset.name === artifactName) {
        artifactRelease = asset;
      }
      if (asset.name === 'shasums') {
        shasums = asset;
      }
    }

    if (!artifactRelease && !shasums) {
      throw new Error(`Can't find assets to download and verify for ${tagVersion}`);
    }

    const shasumAsset = await this.#octokit.rest.repos.getReleaseAsset({
      asset_id: shasums.id,
      owner,
      repo,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    const shaFileContent = new TextDecoder().decode(shasumAsset.data as unknown as ArrayBuffer);
    const shaArr = shaFileContent.split('\n');
    let msiSha = '';

    for (const shaLine of shaArr) {
      if (shaLine.trim().endsWith(artifactName)) {
        msiSha = shaLine.split(' ')[0];
        break;
      }
    }
    if (!msiSha) {
      console.error(`Can't find SHA256 sum for ${artifactName} in:\n${shaFileContent}`);
      process.exit(1);
    }

    const destFile = path.resolve(this.#assetsFolder, fileName);
    if (!fs.existsSync(destFile)) {
      console.log(`⚡️ Downloading artifact from ${artifactRelease.browser_download_url}`);
      // await downloadFile(url, destFile);
      const artifactAsset = await this.#octokit.rest.repos.getReleaseAsset({
        asset_id: artifactRelease.id,
        owner,
        repo,
        headers: {
          accept: 'application/octet-stream',
        },
      });

      fs.appendFileSync(destFile, Buffer.from(artifactAsset.data as unknown as ArrayBuffer));
      console.log(`📔 Downloaded to ${destFile}`);
    } else {
      console.log(`⏭️  Skipping ${artifactName} (already downloaded)`);
    }

    if (!(await this.#shaCheck.checkFile(destFile, msiSha))) {
      console.warn(`❌ Invalid checksum for ${fileName} downloading again...`);
      fs.rmSync(destFile);
      this.#downloadAttempt++;
      await this.downloadAndCheckSha(tagVersion, fileName, artifactName);
    } else {
      console.log(`✅ Valid checksum for ${fileName}`);
    }

    this.#downloadAttempt = 0;
  }
}

export class ShaCheck {
  async checkFile(filePath: string, shaSum: string): Promise<boolean> {
    const sha256sum: string = await hashFile(filePath, { algorithm: 'sha256' });
    return sha256sum === shaSum;
  }
}

export class Podman5DownloadMachineOS {
  #version: string;
  #shaCheck: ShaCheck;
  #assetsFolder: string;
  #ociRegistryProjectLink: string;

  constructor(
    readonly version: string,
    readonly shaCheck: ShaCheck,
    readonly assetsFolder: string,
  ) {
    this.#version = version;
    this.#shaCheck = shaCheck;
    this.#assetsFolder = assetsFolder;
  }

  async getManifest(manifestUrl: string): Promise<any> {
    const response = await fetch(manifestUrl, {
      method: 'GET',
      headers: {
        'docker-distribution-api-version': 'registry/2.0',
        Accept: 'application/vnd.oci.image.manifest.v1+json, application/vnd.oci.image.index.v1+json',
      },
    });
    return response.json();
  }

  protected async pipe(
    title: string,
    total: number,
    stream: ReadableStream<Uint8Array>,
    writableStream: WritableStream<Uint8Array>,
  ) {
    let loaded = 0;

    var progress = new TransformStream({
      transform(chunk, controller) {
        loaded += chunk.length;

        // 20 chars = 100%
        const i = Math.floor((loaded / total) * 20);
        const dots = '.'.repeat(i);
        const left = 20 - i;
        const empty = ' '.repeat(left);

        process.stdout.write(`\r⚡️ Downloading ${title} [${dots}${empty}] ${i * 5}%`);
        controller.enqueue(chunk);
      },
    });

    await stream.pipeThrough(progress).pipeTo(writableStream);
  }

  async downloadZstdFromManifest(
    title: string,
    filename: string,
    layer: { digest: string; size: number },
  ): Promise<void> {
    const blobURL = `${this.#ociRegistryProjectLink}/blobs/${layer.digest}`;

    const blobResponse = await fetch(blobURL);
    const total = layer.size;
    const outputFile = path.resolve(this.#assetsFolder, filename);
    // digest is using the format : sha256:checksum
    // extract the checksum
    const checksum = layer.digest.split(':')[1];

    // check if the file exists and has the expected checksum
    if (fs.existsSync(outputFile)) {
      // check now the checksum
      const valid = await this.#shaCheck.checkFile(outputFile, checksum);
      if (valid) {
        console.log(`⏭️  Skipping ${title} (already downloaded to ${filename})`);
        return;
      }
    }

    const writer = fs.createWriteStream(outputFile);
    const writableStream = Writable.toWeb(writer);

    if (!blobResponse.body) {
      throw new Error(`❌ Cannot get blob for ${title}`);
    }

    await this.pipe(title, total, blobResponse.body, writableStream);

    process.stdout.write(`\r📔 ${title} downloaded to ${filename}\n`);

    // verify the checksum
    const valid = await this.#shaCheck.checkFile(outputFile, checksum);
    if (valid) {
      console.log(`✅ Valid checksum for ${filename}`);
    } else {
      throw new Error(`❌ Invalid checksum for ${filename}`);
    }
  }

  async setAndDownload(platform: string): Promise<void> {
    this.#ociRegistryProjectLink = 'https://quay.io/v2/podman/machine-os';
    // download the podman 5 machines OS
    if (platform === 'win32') {
      // Here add downloading of HyperV
      this.#ociRegistryProjectLink = 'https://quay.io/v2/podman/machine-os-wsl';
      await this.download(DiskType.WSL);
    } else {
      await this.download(DiskType.Applehv);
    }
  }

  // For Windows WSL, need to grab images from quay.io/podman/machine-os-wsl repository
  // Otherwise grab images from quay.io/podman/machine-os repository
  async download(diskType: DiskType): Promise<void> {
    const manifestUrl = `${this.#ociRegistryProjectLink}/manifests/${this.#version}`;

    // get first level of manifests
    const rootManifest = await this.getManifest(manifestUrl);

    if (rootManifest.errors) {
      console.error(`❌ Cannot get manifest for ${manifestUrl}`, rootManifest.errors);
      throw new Error(`❌ Cannot get manifest for ${manifestUrl}`);
    }

    const manifests = rootManifest.manifests;

    // grab applehv as annotations / disktype
    const keepManifests = manifests.filter(manifest => {
      const annotations = manifest.annotations;
      return (
        annotations &&
        ((diskType === DiskType.WSL && annotations.disktype === 'wsl') ||
          (diskType === DiskType.Applehv && annotations.disktype === 'applehv'))
      );
    });

    // should have aarch64 for arm64 and x86_64 for x64
    const amd64Manifest = keepManifests.find(
      manifest => manifest.platform.architecture === 'x86_64' && manifest.platform.os === 'linux',
    );
    const arm64Manifest = keepManifests.find(
      manifest => manifest.platform.architecture === 'aarch64' && manifest.platform.os === 'linux',
    );

    if (!amd64Manifest || !arm64Manifest) {
      throw new Error('❌ Cannot find amd64 or arm64 manifest');
    }

    // now get the zstd entry from the arch manifest
    const amd64ZstdManifest = await this.getManifest(
      `${this.#ociRegistryProjectLink}/manifests/${amd64Manifest.digest}`,
    );
    const arm64ZstdManifest = await this.getManifest(
      `${this.#ociRegistryProjectLink}/manifests/${arm64Manifest.digest}`,
    );

    // download the zstd layers
    await this.downloadZstdFromManifest(
      `${manifestUrl} for arm64`,
      'podman-image-arm64.zst',
      arm64ZstdManifest.layers[0],
    );
    await this.downloadZstdFromManifest(
      `${manifestUrl} for amd64`,
      'podman-image-x64.zst',
      amd64ZstdManifest.layers[0],
    );
  }
}
