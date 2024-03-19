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
import * as https from 'node:https';
import { Octokit } from 'octokit';
import type { OctokitOptions } from '@octokit/core/dist-types/types';
import { hashFile } from 'hasha';
import { fileURLToPath } from 'node:url';

// to make this file a module
export class PodmanDownload {
  #podmanVersion: string;

  #podmanDownloadFcosImage: PodmanDownloadFcosImage;
  #podmanDownloadFedoraImage: PodmanDownloadFedoraImage;

  #shaCheck: ShaCheck;

  #httpsDownloader: HttpsDownloader;

  #octokit: Octokit;
  #platform: string;
  #assetsFolder: string;

  readonly MAX_DOWNLOAD_ATTEMPT = 3;
  #downloadAttempt = 0;

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
    this.#httpsDownloader = new HttpsDownloader();
    this.#podmanDownloadFcosImage = new PodmanDownloadFcosImage(
      this.#httpsDownloader,
      this.#shaCheck,
      this.#assetsFolder,
    );
    this.#podmanDownloadFedoraImage = new PodmanDownloadFedoraImage(
      this.#octokit,
      this.#httpsDownloader,
      this.#assetsFolder,
    );

    if (!fs.existsSync(this.#assetsFolder)) {
      fs.mkdirSync(this.#assetsFolder);
    }
  }

  protected getPodmanDownloadFcosImage(): PodmanDownloadFcosImage {
    return this.#podmanDownloadFcosImage;
  }
  protected getPodmanDownloadFedoraImage(): PodmanDownloadFedoraImage {
    return this.#podmanDownloadFedoraImage;
  }

  protected getShaCheck(): ShaCheck {
    return this.#shaCheck;
  }

  protected async downloadAndCheckSha(tagVersion: string, fileName: string, artifactName: string): Promise<void> {
    if (this.#downloadAttempt >= this.MAX_DOWNLOAD_ATTEMPT) {
      console.error('Max download attempt reached, exiting...');
      process.exit(1);
    }

    const release = await this.#octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
      owner: 'containers',
      repo: 'podman',
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
      owner: 'containers',
      repo: 'podman',
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
      console.log(`Downloading Podman package from ${artifactRelease.browser_download_url}`);
      // await downloadFile(url, destFile);
      const artifactAsset = await this.#octokit.rest.repos.getReleaseAsset({
        asset_id: artifactRelease.id,
        owner: 'containers',
        repo: 'podman',
        headers: {
          accept: 'application/octet-stream',
        },
      });

      fs.appendFileSync(destFile, Buffer.from(artifactAsset.data as unknown as ArrayBuffer));
      console.log(`Downloaded to ${destFile}`);
    } else {
      console.log(`Podman package ${artifactRelease.browser_download_url} already downloaded.`);
    }

    console.log(`Verifying ${fileName}...`);

    if (!(await this.#shaCheck.checkFile(destFile, msiSha))) {
      console.warn(`Checksum for downloaded ${destFile} is not match, downloading again...`);
      fs.rmSync(destFile);
      this.#downloadAttempt++;
      this.downloadAndCheckSha(tagVersion, fileName, artifactName);
    } else {
      console.log(`Checksum for ${fileName} is matching.`);
    }
  }

  async downloadBinaries(): Promise<void> {
    // fetch from GitHub releases
    for (const artifact of this.#artifactsToDownload) {
      this.downloadAndCheckSha(artifact.version, artifact.downloadName, artifact.artifactName);
    }

    // fetch optional binaries in case of AirGap
    await this.downloadAirGapBinaries();
  }

  protected async downloadAirGapBinaries(): Promise<void> {
    if (!this.airgapSupport || !process.env.AIRGAP_DOWNLOAD) {
      return;
    }

    if (this.#platform === 'win32') {
      // download the fedora image
      this.#podmanDownloadFedoraImage.download('podman-wsl-fedora', 'x64');
      this.#podmanDownloadFedoraImage.download('podman-wsl-fedora-arm', 'arm64');
    } else if (this.#platform === 'darwin') {
      // download the fedora core os images for both arches

      await this.#podmanDownloadFcosImage.download('x64');
      await this.#podmanDownloadFcosImage.download('arm64');
    }
  }
}

export class ShaCheck {
  async checkFile(filePath: string, shaSum: string): Promise<boolean> {
    const sha256sum: string = await hashFile(filePath, { algorithm: 'sha256' });
    return sha256sum === shaSum;
  }
}

export class HttpsDownloader {
  // grab the JSON from the given URL
  async downloadJson(url): Promise<unknown> {
    return new Promise((resolve, reject) => {
      https.get(url, res => {
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (error) {
            reject(error.message);
          }
        });

        res.on('error', error => {
          reject(error.message);
        });
      });
    });
  }

  // download the file from the given URL and store the content in destFile
  async downloadFile(url, destFile): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = https.get(url, async res => {
        // handle url redirect
        if (res.statusCode === 302) {
          await this.downloadFile(res.headers.location, destFile);
          resolve();
        }

        res.on('data', data => {
          fs.appendFileSync(destFile, data);
        });

        res.on('end', () => {
          try {
            resolve();
          } catch (error) {
            reject(error.message);
          }
        });

        res.on('error', error => {
          reject(error.message);
        });
      });
      request.end();
    });
  }
}

export class PodmanDownloadFcosImage {
  #downloadAttempt = 0;
  #httpsDownloader: HttpsDownloader;
  #shaCheck: ShaCheck;
  #assetsFolder: string;

  readonly MAX_DOWNLOAD_ATTEMPT = 3;

  constructor(
    readonly httpsDownloader: HttpsDownloader,
    readonly shaCheck: ShaCheck,
    readonly assetsFolder: string,
  ) {
    this.#httpsDownloader = httpsDownloader;
    this.#shaCheck = shaCheck;
    this.#assetsFolder = assetsFolder;
  }

  // For macOS, grab the qemu image from Fedora CoreOS
  async download(arch: string): Promise<void> {
    if (this.#downloadAttempt >= this.MAX_DOWNLOAD_ATTEMPT) {
      console.error('Max download attempt reached, exiting...');
      process.exit(1);
    }

    // download the JSON of testing Fedora CoreOS images at https://builds.coreos.fedoraproject.org/streams/testing.json
    const data = await this.#httpsDownloader.downloadJson(
      'https://builds.coreos.fedoraproject.org/streams/testing.json',
    );

    // get the file to download
    const qemuArch = arch === 'x64' ? 'x86_64' : 'aarch64';
    const qemuData = data?.['architectures'][qemuArch]['artifacts']['qemu'];

    // get disk object
    const disk = qemuData.formats['qcow2.xz'].disk;

    // get the disk location
    const diskLocation = disk.location;

    // get the sha2556
    const sha256 = disk.sha256;

    const filename = `podman-image-${arch}.qcow2.xz`;
    const destFile = path.resolve(this.#assetsFolder, filename);
    if (!fs.existsSync(destFile)) {
      // download the file from diskLocation
      console.log(`Downloading Podman package from ${diskLocation}`);
      await this.httpsDownloader.downloadFile(diskLocation, destFile);
      console.log(`Downloaded to ${destFile}`);
    } else {
      console.log(`Podman image ${filename} already downloaded.`);
    }

    if (!(await this.#shaCheck.checkFile(destFile, sha256))) {
      console.warn(`Checksum for downloaded ${destFile} is not matching, downloading again...`);
      fs.rmSync(destFile);
      this.#downloadAttempt++;
      // call the loop again
      this.download(arch);
    } else {
      console.log(`Checksum for ${filename} matched.`);
    }
  }
}

export class PodmanDownloadFedoraImage {
  readonly MAX_DOWNLOAD_ATTEMPT = 3;
  #downloadAttempt = 0;
  #octokit: Octokit;
  #assetsFolder: string;

  #httpsDownloader: HttpsDownloader;

  constructor(
    readonly octokit: Octokit,
    readonly httpsDownloader: HttpsDownloader,
    readonly assetsFolder: string,
  ) {
    this.#octokit = octokit;
    this.#httpsDownloader = httpsDownloader;
    this.#assetsFolder = assetsFolder;
  }

  // For Windows binaries, grab the latest release from GitHub repository
  async download(repo: string, arch: string): Promise<void> {
    if (this.#downloadAttempt >= this.MAX_DOWNLOAD_ATTEMPT) {
      console.error('Max download attempt reached, exiting...');
      process.exit(1);
    }

    // now, grab the files
    const release = await this.#octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: 'containers',
      repo,
    });

    const artifactRelease = release.data.assets.find(asset => asset.name === 'rootfs.tar.xz');

    if (!artifactRelease) {
      throw new Error(`Can't find assets to download and verify for podman image from repository ${repo}`);
    }

    const filename = `podman-image-${arch}.tar.xz`;
    const destFile = path.resolve(this.#assetsFolder, filename);
    if (!fs.existsSync(destFile)) {
      // download the file from diskLocation
      console.log(`Downloading Podman package from ${artifactRelease.browser_download_url}`);
      await this.#httpsDownloader.downloadFile(artifactRelease.browser_download_url, destFile);
      console.log(`Downloaded to ${destFile}`);
    } else {
      console.log(`Podman image ${filename} already downloaded.`);
    }
  }
}
