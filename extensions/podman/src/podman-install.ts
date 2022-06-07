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
import * as extensionApi from '@tmpwip/extension-api';
import { promisify } from 'node:util';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn } from 'node:child_process';

import * as podmanTool from './podman.json';
import { getPodmanInstallation } from './podman-cli';
import { isDev, isWindows } from './util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export function getBundledPodmanVersion(): string {
  return podmanTool.version;
}

export interface PodmanInfo {
  podmanVersion: string;
  lastUpdateCheck: number;
}

export class PodmanInfoImpl implements PodmanInfo {
  constructor(private podmanInfo: PodmanInfo, private readonly storagePath: string) {
    if (!podmanInfo) {
      this.podmanInfo = { lastUpdateCheck: 0 } as PodmanInfo;
    }
  }

  set podmanVersion(version: string) {
    if (this.podmanInfo.podmanVersion !== version) {
      this.podmanInfo.podmanVersion = version;
      this.writeInfo();
    }
  }

  get podmanVersion(): string {
    return this.podmanInfo.podmanVersion;
  }

  set lastUpdateCheck(lastCheck: number) {
    if (this.podmanInfo.lastUpdateCheck !== lastCheck) {
      this.podmanInfo.lastUpdateCheck = lastCheck;
      this.writeInfo();
    }
  }

  get lastUpdateCheck(): number {
    return this.podmanInfo.lastUpdateCheck;
  }

  private async writeInfo(): Promise<void> {
    try {
      const podmanInfoPath = path.resolve(this.storagePath, 'podman-ext.json');
      await writeFile(podmanInfoPath, JSON.stringify(this.podmanInfo));
    } catch (err) {
      console.error(err);
    }
  }
}

interface Installer {
  install(): Promise<boolean>;
}

export class PodmanInstall {
  private podmanInfo: PodmanInfo;

  private installers = new Map<string, Installer>();

  constructor(private readonly storagePath: string) {
    this.installers.set('win32', new WinInstaller());
    //TODO: add Mac(darwin) installer
  }

  async checkAndInstallPodman(): Promise<void> {
    // check that we have installer for current OS
    if (!this.isAbleToInstall()) {
      return;
    }
    const podmanInfoRaw = await this.getLastRunInfo();
    this.podmanInfo = new PodmanInfoImpl(podmanInfoRaw, this.storagePath);
    const bundledPodmanVersion = getBundledPodmanVersion();

    if (!podmanInfoRaw) {
      const installedPodman = await getPodmanInstallation();
      if (!installedPodman) {
        const dialogResult = await extensionApi.window.showInformationMessage(
          `Podman is not installed on this system, would you like to install Podman ${bundledPodmanVersion}?`,
          'Yes',
          'No',
        );
        if (dialogResult === 'Yes') {
          await this.installBundledPodman();
          const newInstalledPodman = await getPodmanInstallation();
          // write podman version
          if (newInstalledPodman) {
            this.podmanInfo.podmanVersion = newInstalledPodman.version;
          }
        } else {
          return; // exiting as without podman this extension useless
        }
      } else {
        //TODO: check if podman requires update
      }
    } else {
      //TODO: check if podman requires update
    }
  }

  isAbleToInstall(): boolean {
    return this.installers.has(os.platform());
  }

  private async installBundledPodman(): Promise<boolean> {
    const installer = this.installers.get(os.platform());
    if (installer) {
      return installer.install();
    }
    return false;
  }

  async getLastRunInfo(): Promise<PodmanInfo | undefined> {
    const podmanInfoPath = path.resolve(this.storagePath, 'podman-ext.json');
    if (!fs.existsSync(this.storagePath)) {
      await promisify(fs.mkdir)(this.storagePath);
    }

    if (!fs.existsSync(podmanInfoPath)) {
      return undefined;
    }

    try {
      const infoBuffer = await readFile(podmanInfoPath);
      return JSON.parse(infoBuffer.toString('utf8'));
    } catch (err) {
      console.error(err);
    }

    return undefined;
  }
}

abstract class BaseInstaller implements Installer {
  abstract install(): Promise<boolean>;

  protected getAssetsFolder(): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (isDev()) {
      return path.resolve(__dirname, '..', 'assets');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return path.resolve((process as any).resourcesPath, 'extensions', 'podman', 'builtin', 'podman.cdix', 'assets');
    }
  }
}

class WinInstaller extends BaseInstaller {
  install(): Promise<boolean> {
    return extensionApi.window.withProgress({ location: extensionApi.ProgressLocation.APP_ICON }, async progress => {
      progress.report({ increment: 5 });
      const msiPath = path.resolve(this.getAssetsFolder(), `podman-v${podmanTool.version}.msi`);
      try {
        if (fs.existsSync(msiPath)) {
          await this.executeInstaller('msiexec', ['/i', msiPath, '/qb', '/norestart']);
          progress.report({ increment: 80 });
          await extensionApi.window.showInformationMessage('Podman is successfully installed.', 'OK');
          return true;
        } else {
          throw new Error(`Can't find Podman msi package! Path: ${msiPath} doesn't exists.`);
        }
      } catch (err) {
        console.error('Error during install!');
        console.error(err);
        await extensionApi.window.showErrorMessage('Unexpected error, during Podman installation: ' + err, 'OK');
        return false;
      } finally {
        progress.report({ increment: -1 });
      }
    });
  }

  executeInstaller(installCmd: string, args: string[]): Promise<string> {
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
}
