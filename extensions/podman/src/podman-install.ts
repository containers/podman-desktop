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

import { downloadFile, fetchJson, isMac, isWindows } from './util';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import * as extensionApi from '@tmpwip/extension-api';
import { rcompare } from 'semver';

import * as podmanTool from './podman.json';

interface PodmanAsset {
  name: string;
  browser_download_url: string;
}

interface PodmanRelease {
  body: string;
  name: string;
  assets: PodmanAsset[];
}

export async function installBundledPodman(): Promise<boolean> {
  if (isWindows) {
    return installWinBundledPodman();
  } else if (isMac) {
    return installMacBundledPodman();
  } else {
    //TODO: support podman installation on Linux OS
    return false;
  }
}

export async function installPodman(release: PodmanRelease): Promise<boolean> {
  if (isWindows) {
    return installWinPodman(release);
  } else if (isMac) {
    // return installMacPodman(release);
  } else {
    //TODO: support podman installation on Linux OS
    return false;
  }
}

export function getBundledPodmanVersion(): string {
  return podmanTool.version;
}

export async function fetchLatestPodmanVersion(): Promise<PodmanRelease | undefined> {
  const releases = await fetchLatestReleases();
  return getLatestV4Release(releases);
}

function getAssetsFolder(): string {
  const dirName = __dirname;
  // this is temporary, as process.resourcesPath is not available in preload scripts
  if (dirName.includes('app.asar')) {
    const resourcesPath = dirName.substring(0, dirName.indexOf('app.asar'));
    return path.resolve(resourcesPath, 'extensions', 'podman', 'builtin', 'podman.cdix', 'assets');
  } else {
    return path.resolve(__dirname, '..', 'assets');
  }
}

async function installWinBundledPodman(): Promise<boolean> {
  return extensionApi.window.withProgress(async progress => {
    progress.report({ increment: 5 });
    const msiPath = path.resolve(getAssetsFolder(), `podman-v${podmanTool.version}.msi`);
    try {
      if (fs.existsSync(msiPath)) {
        await executeInstaller('msiexec', ['/i', msiPath, '/qb', '/norestart']);
        progress.report({ increment: 80 });
        await extensionApi.window.showInformationMessage('Podman', 'Podman is successfully installed.', 'OK');
        return true;
      } else {
        throw new Error(`Can't find Podman msi package! Path: ${msiPath} doesn't exists.`);
      }
    } catch (err) {
      console.error('Error during install!');
      console.error(err);
      await extensionApi.window.showErrorMessage(
        'Podman Error',
        'Unexpected error, during Podman installation: ' + err,
        'OK',
      );
      return false;
    } finally {
      progress.report({ increment: -1 });
    }
  });
}

async function installWinPodman(release: PodmanRelease): Promise<boolean> {
  return extensionApi.window.withProgress(async progress => {
    progress.report({ increment: 5 });
    const latestMsi = release.assets.find(it => it.name.endsWith('.msi'));
    if (!latestMsi) {
      progress.report({ increment: -1 });
      throw new Error("Can't find latest MSI bundle");
    }

    const msiPath = path.resolve(os.tmpdir(), latestMsi.name);
    try {
      progress.report({ increment: 15 });
      await downloadFile(latestMsi.browser_download_url, msiPath);
      progress.report({ increment: 60 });
    } catch (err) {
      console.error(err);
      progress.report({ increment: -1 });
      return false;
    }

    try {
      if (fs.existsSync(msiPath)) {
        await executeInstaller('msiexec', ['/i', msiPath, '/qb', '/norestart']);
        progress.report({ increment: 80 });
        await extensionApi.window.showInformationMessage('Podman', 'Podman is successfully installed.', 'OK');
        return true;
      }
    } catch (err) {
      console.error('Error during install!');
      console.error(err);
      await extensionApi.window.showErrorMessage(
        'Podman Error',
        'Unexpected error, during Podman installation: ' + err,
        'OK',
      );
      return false;
    } finally {
      fs.unlink(msiPath, () => {
        // ignore
      });
      progress.report({ increment: -1 });
    }
  });
}

function getLatestV4Release(releases: PodmanRelease[]): PodmanRelease | undefined {
  let v4releases = releases.filter(it => it.name.startsWith('v4.'));

  if (v4releases.length === 0) {
    return undefined;
  }
  v4releases = v4releases.sort((a, b) => rcompare(a.name, b.name));

  return v4releases[0];
}

async function installMacBundledPodman(): Promise<boolean> {
  throw new Error('installMacPodman is not implemented!');
}

async function fetchLatestReleases(): Promise<PodmanRelease[]> {
  return await fetchJson('https://api.github.com/repos/containers/podman/releases?per_page=10');
}

function executeInstaller(installCmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    const process = spawn(installCmd, args, { shell: isWindows });
    process.on('error', err => {
      reject(err);
    });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      output += data;
      console.log(data);
    });
    process.stderr.setEncoding('utf8');
    process.stderr.on('data', data => {
      err += data;
      console.error(data);
    });

    process.on('close', exitCode => {
      if (exitCode !== 0) {
        reject(err);
      }
      resolve(output.trim());
    });
  });
}
