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
import * as compareVersions from 'compare-versions';

import * as podmanTool from './podman.json';
import type { InstalledPodman } from './podman-cli';
import { execPromise } from './podman-cli';
import { getPodmanInstallation } from './podman-cli';
import { isDev, isWindows } from './util';
import { getDetectionChecks } from './detection-checks';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export function getBundledPodmanVersion(): string {
  return podmanTool.version;
}

export interface PodmanInfo {
  podmanVersion: string;
  lastUpdateCheck: number;
  ignoreVersionUpdate?: string;
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

  get ignoreVersionUpdate(): string {
    return this.podmanInfo.ignoreVersionUpdate;
  }

  set ignoreVersionUpdate(version: string) {
    if (this.podmanInfo.ignoreVersionUpdate !== version) {
      this.podmanInfo.ignoreVersionUpdate = version;
      this.writeInfo();
    }
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
  getPreflightChecks(): extensionApi.InstallCheck[] | undefined;
  install(): Promise<boolean>;
  requireUpdate(installedVersion: string): boolean;
  update(): Promise<boolean>;
}
interface UpdateCheck {
  hasUpdate: boolean;
  installedVersion: string;
  bundledVersion: string;
}

export class PodmanInstall {
  private podmanInfo: PodmanInfo;

  private installers = new Map<string, Installer>();

  constructor(private readonly storagePath: string) {
    this.installers.set('win32', new WinInstaller());
    //TODO: add Mac(darwin) installer
  }

  public async doInstallPodman(provider: extensionApi.Provider): Promise<void> {
    const dialogResult = await extensionApi.window.showInformationMessage(
      `Podman is not installed on this system, would you like to install Podman ${getBundledPodmanVersion()}?`,
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
      // update detections checks
      provider.updateDetectionChecks(getDetectionChecks(newInstalledPodman));
    } else {
      return; // exiting as without podman this extension is useless
    }
  }

  public async checkForUpdate(installedPodman: InstalledPodman | undefined): Promise<UpdateCheck> {
    const podmanInfoRaw = await this.getLastRunInfo();
    this.podmanInfo = new PodmanInfoImpl(podmanInfoRaw, this.storagePath);

    let installedVersion = this.podmanInfo.podmanVersion;
    if (!installedPodman) {
      return { installedVersion: undefined, hasUpdate: false, bundledVersion: undefined };
    } else if (this.podmanInfo.podmanVersion !== installedPodman.version) {
      installedVersion = installedPodman.version;
    }
    const installer = this.getInstaller();
    const bundledVersion = getBundledPodmanVersion();

    if (
      installer &&
      installer.requireUpdate(installedVersion) &&
      this.podmanInfo.ignoreVersionUpdate !== bundledVersion
    ) {
      return { installedVersion, hasUpdate: true, bundledVersion };
    }
    return { installedVersion, hasUpdate: false, bundledVersion };
  }

  public async performUpdate(
    provider: extensionApi.Provider,
    installedPodman: InstalledPodman | undefined,
  ): Promise<void> {
    const updateInfo = await this.checkForUpdate(installedPodman);
    if (updateInfo.hasUpdate) {
      const answer = await extensionApi.window.showInformationMessage(
        `You have Podman ${updateInfo.installedVersion}.\nDo you want to update to ${updateInfo.bundledVersion}?`,
        'Yes',
        'No',
        'Ignore',
      );
      if (answer === 'Yes') {
        await this.getInstaller().update();
        this.podmanInfo.podmanVersion = updateInfo.bundledVersion;
        provider.updateDetectionChecks(getDetectionChecks(installedPodman));
        provider.updateVersion(updateInfo.bundledVersion);
        this.podmanInfo.ignoreVersionUpdate = undefined;
      } else if (answer === 'Ignore') {
        this.podmanInfo.ignoreVersionUpdate = updateInfo.bundledVersion;
      }
    }
  }

  getInstallChecks(): extensionApi.InstallCheck[] | undefined {
    const installer = this.getInstaller();
    if (installer) {
      return installer.getPreflightChecks();
    }
    return undefined;
  }

  isAbleToInstall(): boolean {
    return this.installers.has(os.platform());
  }

  private getInstaller(): Installer | undefined {
    return this.installers.get(os.platform());
  }

  private async installBundledPodman(): Promise<boolean> {
    const installer = this.getInstaller();
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

  abstract update(): Promise<boolean>;

  abstract getPreflightChecks(): extensionApi.InstallCheck[];

  requireUpdate(installedVersion: string): boolean {
    return compareVersions.compare(installedVersion, getBundledPodmanVersion(), '<');
  }

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
  getPreflightChecks(): extensionApi.InstallCheck[] {
    return [new WinBitCheck(), new WinVersionCheck(), new WinMemoryCheck(), new HyperVCheck(), new WSL2Check()];
  }

  update(): Promise<boolean> {
    return this.install();
  }

  install(): Promise<boolean> {
    return extensionApi.window.withProgress({ location: extensionApi.ProgressLocation.APP_ICON }, async progress => {
      progress.report({ increment: 5 });
      const msiPath = path.resolve(this.getAssetsFolder(), `podman-v${podmanTool.version}.msi`);
      try {
        if (fs.existsSync(msiPath)) {
          await this.executeInstaller('msiexec', ['/i', msiPath, '/qb', '/norestart']);
          progress.report({ increment: 80 });
          extensionApi.window.showNotification({ body: 'Podman is successfully installed.' });
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

abstract class BaseCheck implements extensionApi.InstallCheck {
  abstract title: string;
  abstract execute(): Promise<extensionApi.CheckResult>;

  protected createFailureResult(description?: string): extensionApi.CheckResult {
    return { successful: false, description };
  }

  protected createSuccessfulResult(): extensionApi.CheckResult {
    return { successful: true };
  }
}

class WinBitCheck extends BaseCheck {
  title = 'Windows x64';
  private ARCH = 'x64';
  async execute(): Promise<extensionApi.CheckResult> {
    const currentArch = process.arch;
    if (this.ARCH === currentArch) {
      return this.createSuccessfulResult();
    } else {
      return this.createFailureResult('WSL2 works only on 64bit OS.');
    }
  }
}

class WinVersionCheck extends BaseCheck {
  title = 'Windows Version';

  private MIN_BUILD = 18362;
  async execute(): Promise<extensionApi.CheckResult> {
    const winRelease = os.release();
    if (winRelease.startsWith('10.0.')) {
      const splitRelease = winRelease.split('.');
      const winBuild = splitRelease[2];
      if (Number.parseInt(winBuild) >= this.MIN_BUILD) {
        return { successful: true };
      } else {
        return this.createFailureResult(
          'To be able to run WSL2 you need Windows 10 Build 18362 or later. See https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
        );
      }
    } else {
      return this.createFailureResult('WSL2 works only on Windows 10 and newest OS');
    }
  }
}

class WinMemoryCheck extends BaseCheck {
  title = 'RAM';
  private REQUIRED_MEM = 6 * 1024 * 1024 * 1024; // 6Gb

  async execute(): Promise<extensionApi.CheckResult> {
    const totalMem = os.totalmem();
    if (this.REQUIRED_MEM <= totalMem) {
      return this.createSuccessfulResult();
    } else {
      return this.createFailureResult('You need at least 6GB to run Podman.');
    }
  }
}

class HyperVCheck extends BaseCheck {
  title = 'Hyper-V Enabled';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      const res = await execPromise('powershell.exe', ['(Get-Service vmcompute).DisplayName']);
      if (res === 'Hyper-V Host Compute Service') {
        return this.createSuccessfulResult();
      }
    } catch (err) {
      // ignore error, this means that hyper-v not enabled
    }
    return this.createFailureResult('Hyper-V should be enabled to be able to run Podman. See https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v');
  }
}

class WSL2Check extends BaseCheck {
  title = 'WSL2 Installed';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      const res = await execPromise('wsl', ['-l', '-v']);
      if (!res.startsWith('Usage: wsl.exe [Argument]')) {
        return this.createSuccessfulResult();
      }
    } catch (err) {
      if(typeof err === 'string' && err.indexOf('Windows Subsystem for Linux has no installed distributions.') !== -1) {
        // WSL2 installed, it just doesn't have any distro installed.
        return this.createSuccessfulResult();
      }
    }
    return this.createFailureResult('WSL2 is not installed. Call "wsl --install" in terminal.');
  }
}
