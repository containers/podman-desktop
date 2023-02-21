#!/usr/bin/env node
/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
import * as hasha from 'hasha';

const tools = require('../src/podman.json');

const platform = process.platform;

const MAX_DOWNLOAD_ATTEMPT = 3;
let downloadAttempt = 0;
let downloadAttemptFcos = 0;
const downloadAttemptFedora = 0;

const octokitOptions: OctokitOptions = {};
if (process.env.GITHUB_TOKEN) {
  octokitOptions.auth = process.env.GITHUB_TOKEN;
}
const octokit = new Octokit(octokitOptions);

// to make this file a module
export {};

async function checkFileSha(filePath: string, shaSum: string): Promise<boolean> {
  const sha256sum: string = await hasha.fromFile(filePath, { algorithm: 'sha256' });
  return sha256sum === shaSum;
}

async function downloadAndCheckSha(tagVersion: string, fileName: string, artifactName: string): Promise<void> {
  if (downloadAttempt >= MAX_DOWNLOAD_ATTEMPT) {
    console.error('Max download attempt reached, exiting...');
    process.exit(1);
  }

  const release = await octokit.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
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

  const shasumAsset = await octokit.rest.repos.getReleaseAsset({
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

  const destDir = path.resolve(__dirname, '..', 'assets');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }
  const destFile = path.resolve(destDir, fileName);
  if (!fs.existsSync(destFile)) {
    console.log(`Downloading Podman package from ${artifactRelease.browser_download_url}`);
    // await downloadFile(url, destFile);
    const artifactAsset = await octokit.rest.repos.getReleaseAsset({
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

  if (!(await checkFileSha(destFile, msiSha))) {
    console.warn(`Checksum for downloaded ${destFile} is not match, downloading again...`);
    fs.rmSync(destFile);
    downloadAttempt++;
    downloadAndCheckSha(tagVersion, fileName, artifactName);
  } else {
    console.log(`Checksum for ${fileName} is matched.`);
  }
}

// grab the JSON from the given URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function httpsJsonRequest(url): Promise<any> {
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
async function httpsDownloadFile(url, destFile): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, async res => {
      // handle url redirect
      if (res.statusCode === 302) {
        await httpsDownloadFile(res.headers.location, destFile);
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

// For Windows binaries, grab the latest release from GitHub repository
async function downloadFedoraImage(repo: string): Promise<void> {
  if (downloadAttemptFedora >= MAX_DOWNLOAD_ATTEMPT) {
    console.error('Max download attempt reached, exiting...');
    process.exit(1);
  }

  // download the file and check the sha256

  const destDir = path.resolve(__dirname, '..', 'assets');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  // now, grab the files

  const release = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
    owner: 'containers',
    repo,
  });

  const artifactRelease = release.data.assets.find(asset => asset.name === 'rootfs.tar.xz');

  if (!artifactRelease) {
    throw new Error(`Can't find assets to download and verify for podman image from repository ${repo}`);
  }

  const arch = 'x64';
  const filename = `podman-image-${arch}.tar.xz`;
  const destFile = path.resolve(destDir, filename);
  if (!fs.existsSync(destFile)) {
    // download the file from diskLocation
    console.log(`Downloading Podman package from ${artifactRelease.browser_download_url}`);
    await httpsDownloadFile(artifactRelease.browser_download_url, destFile);
    console.log(`Downloaded to ${destFile}`);
  } else {
    console.log(`Podman image ${filename} already downloaded.`);
  }
}

// For macOS, grab the qemu image from Fedora CoreOS
async function downloadFCosImage(arch: string): Promise<void> {
  if (downloadAttemptFcos >= MAX_DOWNLOAD_ATTEMPT) {
    console.error('Max download attempt reached, exiting...');
    process.exit(1);
  }

  // download the JSON of testing Fedora CoreOS images at https://builds.coreos.fedoraproject.org/streams/testing.json
  const data = await httpsJsonRequest('https://builds.coreos.fedoraproject.org/streams/testing.json');

  // get the file to download
  const qemuArch = arch === 'x64' ? 'x86_64' : 'aarch64';
  const qemuData = data['architectures'][qemuArch]['artifacts']['qemu'];

  // get disk object
  const disk = qemuData.formats['qcow2.xz'].disk;

  // get the disk location
  const diskLocation = disk.location;

  // get the sha2556
  const sha256 = disk.sha256;

  // download the file and check the sha256

  const destDir = path.resolve(__dirname, '..', 'assets');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  const filename = `podman-image-${arch}.qcow2.xz`;
  const destFile = path.resolve(destDir, filename);
  if (!fs.existsSync(destFile)) {
    // download the file from diskLocation
    console.log(`Downloading Podman package from ${diskLocation}`);
    await httpsDownloadFile(diskLocation, destFile);
    console.log(`Downloaded to ${destFile}`);
  } else {
    console.log(`Podman image ${filename} already downloaded.`);
  }

  if (!(await checkFileSha(destFile, sha256))) {
    console.warn(`Checksum for downloaded ${destFile} is not matching, downloading again...`);
    fs.rmSync(destFile);
    downloadAttemptFcos++;
    // call the loop again
    downloadFCosImage(arch);
  } else {
    console.log(`Checksum for ${filename} matched.`);
  }
}

let tagVersion: string, dlName: string;

if (platform === 'win32') {
  // eslint-disable-next-line prefer-const
  tagVersion = tools.platform.win32.version;
  // eslint-disable-next-line prefer-const
  dlName = tools.platform.win32.fileName;
  downloadAndCheckSha(tagVersion, dlName, `podman-${tools.version}-setup.exe`);

  // download the fedora image
  if (process.env.AIRGAP_DOWNLOAD) {
    downloadFedoraImage('podman-wsl-fedora');
  }
} else if (platform === 'darwin') {
  tagVersion = tools.platform.darwin.version;
  dlName = tools.platform.darwin.arch.x64.fileName;
  downloadAndCheckSha(tagVersion, dlName, 'podman-installer-macos-amd64.pkg');

  dlName = tools.platform.darwin.arch.arm64.fileName;
  downloadAndCheckSha(tagVersion, dlName, 'podman-installer-macos-arm64.pkg');

  // download the current testing image if AIRGAP_DOWNLOAD env variable is set
  if (process.env.AIRGAP_DOWNLOAD) {
    // download the fedora core os images for both arches
    downloadFCosImage('x64');
    downloadFCosImage('arm64');
  }
}
