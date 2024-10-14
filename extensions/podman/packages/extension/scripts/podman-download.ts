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

  #podman5DownloadMachineOS: Podman5DownloadMachineOS;

  #shaCheck: ShaCheck;
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

    if (!fs.existsSync(this.#assetsFolder)) {
      fs.mkdirSync(this.#assetsFolder);
    }

    // grab only first 2 digits from the version
    const majorMinorVersion = podmanJSON.version.split('.').slice(0, 2).join('.');

    const diskType = this.#platform === 'win32' ? DiskType.WSL : DiskType.Applehv;
    this.#podman5DownloadMachineOS = new Podman5DownloadMachineOS(
      majorMinorVersion,
      this.#shaCheck,
      this.#assetsFolder,
      diskType,
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

  async downloadBinaries(): Promise<void> {
    // fetch binaries in case of AirGap
    await this.downloadAirGapBinaries();
  }

  protected async downloadAirGapBinaries(): Promise<void> {
    if (!this.airgapSupport || !process.env.AIRGAP_DOWNLOAD) {
      return;
    }

    // download the podman 5 machines OS
    await this.#podman5DownloadMachineOS?.download();
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
  #diskType: DiskType;
  #ociRegistryProjectLink: string;

  constructor(
    readonly version: string,
    readonly shaCheck: ShaCheck,
    readonly assetsFolder: string,
    readonly diskType: DiskType,
  ) {
    this.#diskType = diskType;
    this.#version = version;
    this.#shaCheck = shaCheck;
    this.#assetsFolder = assetsFolder;
    // Windows uses WSL => machine-os-wsl ; MacOS uses Applehv => machine-os
    this.#ociRegistryProjectLink = `https://quay.io/v2/podman/${diskType === DiskType.WSL ? 'machine-os-wsl' : 'machine-os'}`;
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

  // For macOS, need to grab images from quay.io/podman/machine-os repository
  // For Windos, need to grab images from quay.io/podman/machine-os-wsl repository
  async download(): Promise<void> {
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
        ((this.#diskType === DiskType.WSL && annotations.disktype === 'wsl') ||
          (this.#diskType === DiskType.Applehv && annotations.disktype === 'applehv'))
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
