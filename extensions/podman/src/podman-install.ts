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
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import * as extensionApi from '@podman-desktop/api';
import { compare } from 'compare-versions';

import { BaseCheck } from './base-check';
import { getDetectionChecks } from './detection-checks';
import {
  isRootfulMachineInitSupported,
  isStartNowAtMachineInitSupported,
  isUserModeNetworkingSupported,
  ROOTFUL_MACHINE_INIT_SUPPORTED_KEY,
  START_NOW_MACHINE_INIT_SUPPORTED_KEY,
  USER_MODE_NETWORKING_SUPPORTED_KEY,
} from './extension';
import { MacCPUCheck, MacMemoryCheck, MacPodmanInstallCheck, MacVersionCheck } from './macos-checks';
import type { InstalledPodman } from './podman-cli';
import { getPodmanInstallation } from './podman-cli';
import * as podman4Tool from './podman4.json';
import { getAssetsFolder, normalizeWSLOutput } from './util';
import { WslHelper } from './wsl-helper';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export function getBundledPodmanVersion(): string {
  return podman4Tool.version;
}

export interface PodmanInfo {
  podmanVersion: string;
  lastUpdateCheck: number;
  ignoreVersionUpdate?: string;
}

export class PodmanInfoImpl implements PodmanInfo {
  constructor(
    private podmanInfo: PodmanInfo,
    private readonly storagePath: string,
  ) {
    if (!podmanInfo) {
      this.podmanInfo = { lastUpdateCheck: 0 } as PodmanInfo;
    }
  }

  set podmanVersion(version: string) {
    if (this.podmanInfo.podmanVersion !== version) {
      this.podmanInfo.podmanVersion = version;
      this.writeInfo().catch((err: unknown) => console.error('Unable to write Podman Version', err));
    }
  }

  get podmanVersion(): string {
    return this.podmanInfo.podmanVersion;
  }

  set lastUpdateCheck(lastCheck: number) {
    if (this.podmanInfo.lastUpdateCheck !== lastCheck) {
      this.podmanInfo.lastUpdateCheck = lastCheck;
      this.writeInfo().catch((err: unknown) => console.error('Unable to write Podman Version', err));
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
      this.writeInfo().catch((err: unknown) => console.error('Unable to write Podman Version', err));
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

  private readonly storagePath: string;

  constructor(readonly extensionContext: extensionApi.ExtensionContext) {
    this.storagePath = extensionContext.storagePath;
    this.installers.set('win32', new WinInstaller(extensionContext));
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
        extensionApi.context.setValue(
          ROOTFUL_MACHINE_INIT_SUPPORTED_KEY,
          isRootfulMachineInitSupported(newInstalledPodman.version),
        );
        extensionApi.context.setValue(
          USER_MODE_NETWORKING_SUPPORTED_KEY,
          isUserModeNetworkingSupported(newInstalledPodman.version),
        );
        extensionApi.context.setValue(
          START_NOW_MACHINE_INIT_SUPPORTED_KEY,
          isStartNowAtMachineInitSupported(newInstalledPodman.version),
        );
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

    if (installer?.requireUpdate(installedVersion) && this.podmanInfo.ignoreVersionUpdate !== bundledVersion) {
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
        extensionApi.context.setValue(
          ROOTFUL_MACHINE_INIT_SUPPORTED_KEY,
          isRootfulMachineInitSupported(updateInfo.bundledVersion),
        );
        extensionApi.context.setValue(
          USER_MODE_NETWORKING_SUPPORTED_KEY,
          isUserModeNetworkingSupported(updateInfo.bundledVersion),
        );
        extensionApi.context.setValue(
          START_NOW_MACHINE_INIT_SUPPORTED_KEY,
          isStartNowAtMachineInitSupported(updateInfo.bundledVersion),
        );
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

  getInstallablePodmanVersion(): string {
    return podman4Tool.version;
  }
}

export class WinInstaller extends BaseInstaller {
  constructor(private extensionContext: extensionApi.ExtensionContext) {
    super();
  }

  getUpdatePreflightChecks(): extensionApi.InstallCheck[] {
    return [];
  }

  getPreflightChecks(): extensionApi.InstallCheck[] {
    return [
      new WinBitCheck(),
      new WinVersionCheck(),
      new WinMemoryCheck(),
      new VirtualMachinePlatformCheck(),
      new WSLVersionCheck(),
      new WSL2Check(this.extensionContext),
    ];
  }

  update(): Promise<boolean> {
    return this.install();
  }

  install(): Promise<boolean> {
    return extensionApi.window.withProgress({ location: extensionApi.ProgressLocation.APP_ICON }, async progress => {
      progress.report({ increment: 5 });
      const setupPath = path.resolve(getAssetsFolder(), `podman-${this.getInstallablePodmanVersion()}-setup.exe`);
      try {
        if (fs.existsSync(setupPath)) {
          try {
            await extensionApi.process.exec(setupPath, ['/install', '/norestart']);
            progress.report({ increment: 80 });
            extensionApi.window.showNotification({ body: 'Podman is successfully installed.' });
          } catch (err) {
            //check if user cancelled installation see https://learn.microsoft.com/en-us/previous-versions//aa368542(v=vs.85)
            if ((err as extensionApi.RunError) && err.exitCode !== 1602 && err.exitCode !== 0) {
              throw new Error(err.message);
            }
          }
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

      const pkgPath = path.resolve(
        getAssetsFolder(),
        `podman-installer-macos-${pkgArch}-v${this.getInstallablePodmanVersion()}.pkg`,
      );
      try {
        if (fs.existsSync(pkgPath)) {
          try {
            await extensionApi.process.exec('open', [pkgPath, '-W']);
          } catch (err) {
            throw new Error((err as extensionApi.RunError).stderr);
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
      return this.createFailureResult({
        description: 'WSL2 works only on 64bit OS.',
        docLinksDescription: 'Learn about WSL requirements:',
        docLinks: {
          url: 'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
          title: 'WSL2 Manual Installation Steps',
        },
      });
    }
  }
}

class WinVersionCheck extends BaseCheck {
  title = 'Windows Version';

  private MIN_BUILD = 19043; //it represents version 21H1 windows 10
  async execute(): Promise<extensionApi.CheckResult> {
    const winRelease = os.release();
    if (winRelease.startsWith('10.0.')) {
      const splitRelease = winRelease.split('.');
      const winBuild = splitRelease[2];
      if (Number.parseInt(winBuild) >= this.MIN_BUILD) {
        return { successful: true };
      } else {
        return this.createFailureResult({
          description: `To be able to run WSL2 you need Windows 10 Build ${this.MIN_BUILD} or later.`,
          docLinksDescription: 'Learn about WSL requirements:',
          docLinks: {
            url: 'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
            title: 'WSL2 Manual Installation Steps',
          },
        });
      }
    } else {
      return this.createFailureResult({
        description: 'WSL2 works only on Windows 10 and newest OS',
        docLinksDescription: 'Learn about WSL requirements:',
        docLinks: {
          url: 'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
          title: 'WSL2 Manual Installation Steps',
        },
      });
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
      return this.createFailureResult({
        description: 'You need at least 6GB to run Podman.',
      });
    }
  }
}

class VirtualMachinePlatformCheck extends BaseCheck {
  title = 'Virtual Machine Platform Enabled';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      // set CurrentUICulture to force output in english
      const { stdout: res } = await extensionApi.process.exec('powershell.exe', [
        '(Get-WmiObject -Query "Select * from Win32_OptionalFeature where InstallState = \'1\'").Name | select-string VirtualMachinePlatform',
      ]);
      if (res.indexOf('VirtualMachinePlatform') >= 0) {
        return this.createSuccessfulResult();
      }
    } catch (err) {
      // ignore error, this means that VirtualMachinePlatform not enabled
    }
    return this.createFailureResult({
      description: 'Virtual Machine Platform should be enabled to be able to run Podman.',
      docLinksDescription: 'Learn about how to enable the Virtual Machine Platform feature:',
      docLinks: {
        url: 'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
        title: 'Enable Virtual Machine Platform',
      },
    });
  }
}

class WSL2Check extends BaseCheck {
  title = 'WSL2 Installed';
  installWSLCommandId = 'podman.onboarding.installWSL';

  constructor(private extensionContext: extensionApi.ExtensionContext) {
    super();
  }

  async init(): Promise<void> {
    const wslCommand = extensionApi.commands.registerCommand(this.installWSLCommandId, async () => {
      const installSucceeded = await this.installWSL();
      if (installSucceeded) {
        // if action succeeded, do a re-check of all podman requirements so user can be moved forward if all missing pieces have been installed
        await extensionApi.commands.executeCommand('podman.onboarding.checkRequirementsCommand');
      }
    });
    this.extensionContext.subscriptions.push(wslCommand);
  }

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      const isAdmin = await this.isUserAdmin();
      const isWSL = await this.isWSLPresent();
      const isRebootNeeded = await this.isRebootNeeded();

      if (!isWSL) {
        if (isAdmin) {
          return this.createFailureResult({
            description: 'WSL2 is not installed.',
            docLinksDescription: `Call 'wsl --install --no-distribution' in a terminal.`,
            docLinks: {
              url: 'https://learn.microsoft.com/en-us/windows/wsl/install',
              title: 'WSL2 Manual Installation Steps',
            },
            fixCommand: {
              id: this.installWSLCommandId,
              title: 'Install WSL2',
            },
          });
        } else {
          return this.createFailureResult({
            description: 'WSL2 is not installed or you do not have permissions to run WSL2.',
            docLinksDescription: 'Contact your Administrator to setup WSL2.',
            docLinks: {
              url: 'https://learn.microsoft.com/en-us/windows/wsl/install',
              title: 'WSL2 Manual Installation Steps',
            },
          });
        }
      } else if (isRebootNeeded) {
        return this.createFailureResult({
          description:
            'WSL2 seems to be installed but the system needs to be restarted so the changes can take effect.',
        });
      }
    } catch (err) {
      return this.createFailureResult({
        description: 'Could not detect WSL2',
        docLinks: {
          url: 'https://learn.microsoft.com/en-us/windows/wsl/install',
          title: 'WSL2 Manual Installation Steps',
        },
      });
    }

    return this.createSuccessfulResult();
  }

  private async isUserAdmin(): Promise<boolean> {
    const { stdout: res } = await extensionApi.process.exec('powershell.exe', [
      '$null -ne (whoami /groups /fo csv | ConvertFrom-Csv | Where-Object {$_.SID -eq "S-1-5-32-544"})',
    ]);
    return res.trim() === 'True';
  }

  private async isWSLPresent(): Promise<boolean> {
    try {
      const { stdout: res } = await extensionApi.process.exec('wsl', ['--set-default-version', '2'], {
        env: { WSL_UTF8: '1' },
      });
      const output = normalizeWSLOutput(res);
      return !!output;
    } catch (error) {
      return false;
    }
  }

  private async installWSL(): Promise<boolean> {
    try {
      await extensionApi.process.exec('wsl', ['--install', '--no-distribution'], {
        env: { WSL_UTF8: '1' },
      });

      return true;
    } catch (error) {
      let message = error.message ? `${error.message}\n` : '';
      message += error.stdout || '';
      message += error.stderr || '';
      throw new Error(message);
    }
  }

  private async isRebootNeeded(): Promise<boolean> {
    try {
      await extensionApi.process.exec('wsl', ['-l'], {
        env: { WSL_UTF8: '1' },
      });
    } catch (error) {
      // we only return true for the WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED error code
      // as other errors may not be connected to a reboot, like
      // WSL_E_DEFAULT_DISTRO_NOT_FOUND = wsl was installed without the default distro
      if (error.stdout.includes('Wsl/WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED')) {
        return true;
      } else if (error.stdout.includes('Wsl/WSL_E_DEFAULT_DISTRO_NOT_FOUND')) {
        // treating this log differently as we install wsl without any distro
        console.log('WSL has been installed without the default distribution');
      } else {
        console.error(error);
      }
    }
    return false;
  }
}

class WSLVersionCheck extends BaseCheck {
  title = 'WSL Version';

  minVersion = '1.2.5';

  async execute(): Promise<extensionApi.CheckResult> {
    try {
      const wslHelper = new WslHelper();
      const wslVersionData = await wslHelper.getWSLVersionData();
      if (compare(wslVersionData.wslVersion, this.minVersion, '>=')) {
        return this.createSuccessfulResult();
      } else {
        return this.createFailureResult({
          description: `Your WSL version is ${wslVersionData.wslVersion} but it should be >= ${this.minVersion}.`,
          docLinksDescription: `Call 'wsl --update' to update your WSL installation. If you do not have access to the Windows store you can run 'wsl --update --web-download'. If you still receive an error please contact your IT administator as 'Windows Store Applications' may have been disabled.`,
        });
      }
    } catch (err) {
      // ignore error
    }
    return this.createFailureResult({
      description: `WSL version should be >= ${this.minVersion}.`,
      docLinksDescription: `Call 'wsl --version' in a terminal to check your wsl version.`,
    });
  }
}
