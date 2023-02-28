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
import * as path from 'node:path';
import { existsSync, promises } from 'node:fs';
import * as extensionApi from '@tmpwip/extension-api';
import type { Detect } from './detect';
import type { ComposeGitHubReleases } from './compose-github-releases';
import type { OS } from './os';
import { platform, arch } from 'node:os';
import type { PodmanComposeGenerator } from './podman-compose-generator';

export class ComposeExtension {
  public static readonly COMPOSE_INSTALL_COMMAND = 'compose.install';
  public static readonly COMPOSE_CHECKS_COMMAND = 'compose.checks';

  public static readonly ICON_CHECK = 'fa fa-check';
  public static readonly ICON_DOWNLOAD = 'fa fa-download';
  public static readonly ICON_WARNING = 'fa fa-exclamation-triangle';

  private statusBarItem: extensionApi.StatusBarItem | undefined;

  protected currentInformation: string;

  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly detect: Detect,
    private readonly composeGitHubReleases: ComposeGitHubReleases,
    private readonly os: OS,
    private podmanComposeGenerator: PodmanComposeGenerator,
  ) {}

  async runChecks(firstCheck: boolean): Promise<void> {
    this.currentInformation = undefined;

    // reset status bar information
    const statusBarChangesToApply = {
      iconClass: '',
      tooltip: '',
      command: ComposeExtension.COMPOSE_CHECKS_COMMAND,
    };

    // detect if podman-compose is installed
    const podmanComposeInstalled = await this.detect.checkForPythonPodmanCompose();

    // in that case, report an issue in status bar
    if (podmanComposeInstalled) {
      // create a status bar item
      statusBarChangesToApply.iconClass = ComposeExtension.ICON_WARNING;
      this.currentInformation =
        'This extension does not work with Python Podman Compose. It will collide with the CLI named podman-desktop You need to uninstall Python Podman Compose before using Docker Compose v2.';
      statusBarChangesToApply.tooltip = this.currentInformation;
    } else {
      // check for docker-compose
      const dockerComposeInstalled = await this.detect.checkForDockerCompose();
      if (dockerComposeInstalled) {
        // check if podman-compose alias is in the PATH
        const extensionBinFolderInPath = await this.detect.checkStoragePath();
        if (extensionBinFolderInPath) {
          // it's installed so we're good
          statusBarChangesToApply.iconClass = ComposeExtension.ICON_CHECK;
          statusBarChangesToApply.tooltip = 'Docker Compose is installed';
        } else {
          // not there, ask the user to setup the PATH
          statusBarChangesToApply.iconClass = ComposeExtension.ICON_WARNING;
          statusBarChangesToApply.tooltip = 'Path problem for Podman Compose';
          this.currentInformation = `Please add the Podman Compose bin folder to your PATH environment variable. Value is ${path.resolve(
            this.extensionContext.storagePath,
            'bin',
          )}`;
        }
      } else {
        // not installed, propose to install it
        statusBarChangesToApply.iconClass = ComposeExtension.ICON_DOWNLOAD;
        statusBarChangesToApply.tooltip = 'Install Docker Compose';
        statusBarChangesToApply.command = ComposeExtension.COMPOSE_INSTALL_COMMAND;
      }
    }
    // apply status bar changes
    this.statusBarItem.iconClass = statusBarChangesToApply.iconClass;
    this.statusBarItem.tooltip = statusBarChangesToApply.tooltip;
    this.statusBarItem.command = statusBarChangesToApply.command;

    this.notifyOnChecks(firstCheck);
  }

  protected notifyOnChecks(firstCheck: boolean): void {
    if (this.currentInformation && !firstCheck) {
      this.showCurrentInformation();
    }
  }

  async activate(): Promise<void> {
    if (!this.statusBarItem) {
      // create a status bar item
      this.statusBarItem = extensionApi.window.createStatusBarItem(extensionApi.StatusBarAlignLeft, 100);
      this.statusBarItem.text = 'Compose';
      this.statusBarItem.command = ComposeExtension.COMPOSE_CHECKS_COMMAND;
      this.statusBarItem.show();
      this.extensionContext.subscriptions.push(this.statusBarItem);
    }

    // run init checks
    await this.runChecks(true);

    const disposableInstall = extensionApi.commands.registerCommand(ComposeExtension.COMPOSE_INSTALL_COMMAND, () =>
      this.installDockerCompose(),
    );
    const disposableShowInfo = extensionApi.commands.registerCommand(ComposeExtension.COMPOSE_CHECKS_COMMAND, () =>
      this.runChecks(false),
    );
    this.extensionContext.subscriptions.push(disposableInstall, disposableShowInfo);
  }

  async installDockerCompose(): Promise<void> {
    // grab latest assets
    const lastReleases = await this.composeGitHubReleases.grabLatestsReleases();

    // display a choice to the user with quickpick
    const selectedRelease = await extensionApi.window.showQuickPick(lastReleases, {
      placeHolder: 'Select docker compose version to install',
    });

    // get asset id
    const assetId = await this.composeGitHubReleases.getReleaseAssetId(selectedRelease.id, platform(), arch());

    // get storage data
    const storageData = await this.extensionContext.storagePath;
    const storageBinFolder = path.resolve(storageData, 'bin');
    if (!existsSync(storageBinFolder)) {
      // create the folder
      await promises.mkdir(storageBinFolder, { recursive: true });
    }
    // path
    const dockerComposeDownloadLocation = path.resolve(storageBinFolder, 'docker-compose');

    // download the asset
    await this.composeGitHubReleases.downloadReleaseAsset(assetId, dockerComposeDownloadLocation);

    // make it executable
    await this.makeExecutable(dockerComposeDownloadLocation);

    extensionApi.window.showInformationMessage(`Docker Compose ${selectedRelease.label} installed`);

    // add wrapper script
    this.addPodmanCompose();

    // update checks
    this.runChecks(false);
  }

  // add script that is redirecting to docker-compose and configuring the socket using DOCKER_HOST
  async addPodmanCompose(): Promise<void> {
    // get storage data
    const storageData = await this.extensionContext.storagePath;
    const storageBinFolder = path.resolve(storageData, 'bin');

    // create the script file
    const podmanComposeScript = path.resolve(storageBinFolder, 'podman-compose');

    await this.podmanComposeGenerator.generate(podmanComposeScript);

    // make it executable
    await this.makeExecutable(podmanComposeScript);
  }

  showCurrentInformation(): void {
    extensionApi.window.showInformationMessage(this.currentInformation);
  }

  async makeExecutable(filePath: string): Promise<void> {
    if (this.os.isLinux() || this.os.isMac()) {
      await promises.chmod(filePath, 0o755);
    }
  }

  async deactivate(): Promise<void> {
    console.log('stopping compose extension');
  }
}
