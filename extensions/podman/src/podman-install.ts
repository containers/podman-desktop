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
import { compare } from 'compare-versions';

import * as podmanTool from './podman.json';
import type { InstalledPodman } from './podman-cli';
import { execPromise } from './podman-cli';
import { getPodmanInstallation } from './podman-cli';
import { getAssetsFolder, runCliCommand } from './util';
import { getDetectionChecks } from './detection-checks';
import { BaseCheck } from './base-check';
import { MacCPUCheck, MacMemoryCheck, MacPodmanInstallCheck, MacVersionCheck } from './macos-checks';

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
  getUpdatePreflightChecks(): extensionApi.InstallCheck[] | undefined;
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

  private installers = new Map<NodeJS.Platform, Installer>();

  constructor(private readonly storagePath: string) {
    this.installers.set('win32', new WinInstaller());
    this.installers.set('darwin', new MacOSInstaller());
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

  getUpdatePreflightChecks(): extensionApi.InstallCheck[] | undefined {
    const installer = this.getInstaller();
    if (installer) {
      return installer.getUpdatePreflightChecks();
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

  abstract getUpdatePreflightChecks(): extensionApi.InstallCheck[];

  abstract getPreflightChecks(): extensionApi.InstallCheck[];

  requireUpdate(installedVersion: string): boolean {
    return compare(installedVersion, getBundledPodmanVersion(), '<');
  }
}

class WinInstaller extends BaseInstaller {
  getUpdatePreflightChecks(): extensionApi.InstallCheck[] {
    return [];
  }

  getPreflightChecks(): extensionApi.InstallCheck[] {
    return [
      new WinBitCheck(),
      new WinVersionCheck(),
      new WinMemoryCheck(),
      new VirtualMachinePlatformCheck(),
      new WSL2Check(),
    ];
  }

  update(): Promise<boolean> {
    return this.install();
  }
  // `podman-${tagVersion}-setup.exe`
  install(): Promise<boolean> {
    return extensionApi.window.withProgress({ location: extensionApi.ProgressLocation.APP_ICON }, async progress => {
      progress.report({ increment: 5 });
      const setupPath = path.resolve(getAssetsFolder(), `podman-${podmanTool.version}-setup.exe`);
      try {
        if (fs.existsSync(setupPath)) {
          const runResult = await runCliCommand(setupPath, ['/install', '/norestart']);
          if (runResult.exitCode !== 0) {
            throw new Error(runResult.stdErr);
          }
          progress.report({ increment: 80 });
          extensionApi.window.showNotification({ body: 'Podman is successfully installed.' });
          return true;
        } else {
          throw new Error(`Can't find Podman setup package! Path: ${setupPath} doesn't exists.`);
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
}

class MacOSInstaller extends BaseInstaller {
  install(): Promise<boolean> {
    return extensionApi.window.withProgress({ location: extensionApi.ProgressLocation.APP_ICON }, async progress => {
      progress.report({ increment: 5 });
      const pkgArch = process.arch === 'arm64' ? 'aarch64' : 'amd64';

      const pkgPath = path.resolve(getAssetsFolder(), `podman-installer-macos-${pkgArch}-v${podmanTool.version}.pkg`);
      try {
        if (fs.existsSync(pkgPath)) {
          const runResult = await runCliCommand('open', [pkgPath, '-W']);
          if (runResult.exitCode !== 0) {
            throw new Error(runResult.stdErr);
          }
          progress.report({ increment: 80 });
          // we cannot rely on exit code, as installer could be closed and it return '0' exit code
          // so just check that podman bin file exist.
          if (fs.existsSync('/opt/podman/bin/podman')) {
            extensionApi.window.showNotification({ body: 'Podman is successfully installed.' });
            return true;
          } else {
            return false;
          }
        } else {
          throw new Error(`Can't find Podman package! Path: ${pkgPath} doesn't exists.`);
        }
      } catch (err) {
        console.error('Error during install!');
        console.error(err);
        await extensionApi.window.showErrorMessage('Unexpected error, during Podman installation: ' + err, 'OK');
        return false;
      }
    });
  }
  update(): Promise<boolean> {
    return this.install();
  }

  getPreflightChecks(): extensionApi.InstallCheck[] {
    return [new MacCPUCheck(), new MacMemoryCheck(), new MacVersionCheck()];
  }

  getUpdatePreflightChecks(): extensionApi.InstallCheck[] {
    return [new MacPodmanInstallCheck()];
  }
}

class WinBitCheck extends BaseCheck {
  title = 'Windows 64bit';

  private ARCH_X64 = 'x64';
  private ARCH_ARM = 'arm64';

  async execute(): Promise<extensionApi.CheckResult> {
    const currentArch = process.arch;
    if (this.ARCH_X64 === currentArch || this.ARCH_ARM === currentArch) {
      return this.createSuccessfulResult();
    } else {
      return this.createFailureResult(
        'WSL2 works only on 64bit OS.',
        'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
      );
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
          'To be able to run WSL2 you need Windows 10 Build 18362 or later.',
          'WSL2 Install Manual',
          'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
        );
      }
    } else {
      return this.createFailureResult(
        'WSL2 works only on Windows 10 and newest OS',
        'WSL2 Install Manual',
        'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
      );
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

class VirtualMachinePlatformCheck extends BaseCheck {
  title = 'Virtual Machine Platform Enabled';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      // set CurrentUICulture to force output in english
      const res = await execPromise('powershell.exe', [
        '(Get-WmiObject -Query "Select * from Win32_OptionalFeature where InstallState = \'1\'").Name | select-string VirtualMachinePlatform',
      ]);
      if (res.indexOf('VirtualMachinePlatform') >= 0) {
        return this.createSuccessfulResult();
      }
    } catch (err) {
      // ignore error, this means that VirtualMachinePlatform not enabled
    }
    return this.createFailureResult(
      'Virtual Machine Platform should be enabled to be able to run Podman.',
      'Enable Virtual Machine Platform',
      'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
    );
  }
}

class WSL2Check extends BaseCheck {
  title = 'WSL2 Installed';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      const isAdmin = await this.isUserAdmin();
      const isWSL = await this.isWSLPresent();

      if (!isWSL) {
        if (isAdmin) {
          return this.createFailureResult(
            'WSL2 is not installed. Call "wsl --install" in a terminal.',
            'Install WSL',
            'https://learn.microsoft.com/en-us/windows/wsl/install',
          );
        } else {
          return this.createFailureResult(
            'WSL2 is not installed or you do not have permissions to run WSL2. Contact your Administrator to setup WSL2.',
            'More info',
            'https://learn.microsoft.com/en-us/windows/wsl/install',
          );
        }
      }
    } catch (err) {
      return this.createFailureResult(
        'Could not detect WSL2',
        'Install WSL',
        'https://learn.microsoft.com/en-us/windows/wsl/install',
      );
    }

    return this.createSuccessfulResult();
  }

  private normalizeOutput(out: string): string {
    // this is workaround, wsl2 some time send output in utf16le, but we treat that as utf8,
    // this code just eliminate every 'empty' character
    let str = '';
    for (let i = 0; i < out.length; i++) {
      if (out.charCodeAt(i) !== 0) {
        str += out.charAt(i);
      }
    }

    return str;
  }
  private async isUserAdmin(): Promise<boolean> {
    const res = await execPromise('powershell.exe', [
      '$null -ne (whoami /groups /fo csv | ConvertFrom-Csv | Where-Object {$_.SID -eq "S-1-5-32-544"})',
    ]);
    if (res.trim() === 'True') {
      return true;
    }

    return false;
  }

  private async isWSLPresent(): Promise<boolean> {
    try {
      const res = await execPromise('wsl', ['--set-default-version', '2'], { env: { WSL_UTF8: '1' } });
      const output = this.normalizeOutput(res);
      if (!output) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
