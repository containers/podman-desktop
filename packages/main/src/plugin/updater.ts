/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import * as https from 'node:https';

import { app, shell } from 'electron';
import {
  autoUpdater,
  type ProgressInfo,
  type UpdateCheckResult,
  type UpdateDownloadedEvent,
  type UpdateInfo,
} from 'electron-updater';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { UPDATER_UPDATE_AVAILABLE_ICON } from '/@/plugin/index.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import type { Task } from '/@/plugin/tasks/tasks.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import { isLinux } from '/@/util.js';
import type { ReleaseNotesInfo } from '/@api/release-notes-info.js';

import { homepage, repository } from '../../../../package.json';
import type { ApiSenderType } from './api.js';
import type { TaskManager } from './tasks/task-manager.js';

/**
 * Represents an updater utility for Podman Desktop.
 */
export class Updater {
  #currentVersion: string;
  #nextVersion: string | undefined;

  #updateInProgress: boolean;
  #updateAlreadyDownloaded: boolean;
  #updateCheckResult: UpdateCheckResult | undefined;

  #downloadTask: Task | undefined;

  constructor(
    private messageBox: MessageBox,
    private configurationRegistry: ConfigurationRegistry,
    private statusBarRegistry: StatusBarRegistry,
    private commandRegistry: CommandRegistry,
    private taskManager: TaskManager,
    private apiSender: ApiSenderType,
  ) {
    this.#currentVersion = `v${app.getVersion()}`;
    this.#updateInProgress = false;
    this.#updateAlreadyDownloaded = false;
    this.#updateCheckResult = undefined;
  }

  public async openReleaseNotes(version: string): Promise<void> {
    if (version === 'current') {
      version = app.getVersion();
    } else if (version === 'latest') {
      version = this.#nextVersion?.substring(1) ?? '';
    }
    const urlVersionFormat = version.split('.', 2).join('.');
    let notesURL = `${homepage}/blog/podman-desktop-release-${urlVersionFormat}`;
    https.get(notesURL, res => {
      if (res.statusCode !== 200) {
        notesURL = `${repository}/releases/tag/v${version}`;
      }
      shell.openExternal(notesURL).catch(console.error);
    });
  }

  public async getReleaseNotes(): Promise<ReleaseNotesInfo> {
    let version = app.getVersion();
    if (import.meta.env.DEV && version.endsWith('-next')) {
      // use the latest release version published on GitHub
      const response = await fetch('https://api.github.com/repos/containers/podman-desktop/releases/latest');
      if (response.ok) {
        const latestRelease = await response.json();
        version = latestRelease.tag_name;
        // remove the 'v' prefix from the version
        if (version.startsWith('v')) {
          version = version.substring(1);
        }
      }
    }

    const urlVersionFormat = version.split('.', 2).join('.');

    const notesURL = `${homepage}/release-notes/${urlVersionFormat}.json`;
    let response = await fetch(notesURL);
    if (!response.ok) {
      response = await fetch(`${repository}/releases/tag/v${version}`);
      if (response.ok) {
        return { releaseNotesAvailable: false, notesURL: `${repository}/releases/tag/v${version}` };
      } else {
        return { releaseNotesAvailable: false, notesURL: '' };
      }
    } else {
      const notesInfo = await response.json();
      return {
        releaseNotesAvailable: true,
        notesURL: `${homepage}/blog/podman-desktop-release-${urlVersionFormat}`,
        notes: notesInfo,
      };
    }
  }

  /**
   * Sets the default version entry in the status bar.
   */
  private defaultVersionEntry(): void {
    this.statusBarRegistry.setEntry(
      'version',
      false,
      0,
      this.#currentVersion,
      `Using version ${this.#currentVersion}`,
      undefined,
      true,
      'version',
      undefined,
    );
  }

  /**
   * Sets the update available entry in the status bar.
   */
  private updateAvailableEntry(): void {
    // Update the 'version' entry in the status bar to show that an update is available
    // this uses setEntry to update the existing entry
    this.statusBarRegistry.setEntry(
      'version',
      false,
      0,
      this.#currentVersion,
      'Update available',
      UPDATER_UPDATE_AVAILABLE_ICON,
      true,
      'update',
      ['status-bar-entry'],
      true,
    );
  }

  private registerDefaultCommands(): void {
    // Show a "No update available" only for macOS and Windows users and on production builds
    let detailMessage: string;
    if (!isLinux() && import.meta.env.PROD) {
      detailMessage = 'No update available';
    }
    // Register command 'version' that will display the current version and say that no update is available.
    // Only show the "no update available" command for macOS and Windows users, not linux users.
    this.commandRegistry.registerCommand('version', async () => {
      const result = await this.messageBox.showMessageBox({
        type: 'info',
        title: 'Version',
        message: `Using version ${this.#currentVersion}`,
        detail: detailMessage,
        buttons: ['View release notes'],
      });
      if (result.response === 0) {
        await this.configurationRegistry.updateConfigurationValue(`releaseNotesBanner.show`, 'show');
        this.apiSender.send('show-release-notes');
      }
    });
  }
  /**
   * Registers commands related to version and update.
   */
  private registerCommands(): void {
    // Update will create a standard "autoUpdater" dialog / update process
    this.commandRegistry.registerCommand('update', async (context?: 'startup' | 'status-bar-entry') => {
      if (this.#updateAlreadyDownloaded) {
        const result = await this.messageBox.showMessageBox({
          type: 'info',
          title: 'Update',
          message: 'There is already an update downloaded. Please Restart Podman Desktop.',
          cancelId: 1,
          buttons: ['Restart', 'Cancel'],
        });
        if (result.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
        return;
      }

      if (this.#updateInProgress) {
        await this.messageBox.showMessageBox({
          type: 'info',
          title: 'Update',
          message: 'There is already an update in progress. Please wait until it is downloaded',
          buttons: ['OK'],
        });
        return;
      }

      // Get the version of the update
      const updateVersion = this.#nextVersion ?? '';

      let buttons: string[];
      if (context === 'startup') {
        buttons = ['Update now', 'View release notes', 'Remind me later', 'Do not show again'];
      } else {
        buttons = ['Update now', 'View release notes', 'Cancel'];
      }

      const result = await this.messageBox.showMessageBox({
        type: 'info',
        title: 'Update Available now',
        message: `A new version ${updateVersion} of Podman Desktop is available. Do you want to update your current version ${this.#currentVersion}?`,
        buttons: buttons,
        cancelId: 2,
      });
      if (result.response === 3) {
        this.updateConfigurationValue('never');
      } else if (result.response === 1) {
        await this.openReleaseNotes(updateVersion);
      } else if (result.response === 0) {
        this.#updateInProgress = true;
        this.#updateAlreadyDownloaded = false;

        // Download update and try / catch it and create a dialog if it fails
        // create a task
        this.#downloadTask = this.taskManager.createTask({ title: `Downloading ${updateVersion} update` });
        this.#downloadTask.progress = 0;

        try {
          await autoUpdater.downloadUpdate();
        } catch (error: unknown) {
          console.error('Update error: ', error);
          this.#downloadTask.status = 'success';
          this.#downloadTask.error = `Unable to download ${updateVersion} update: ${String(error)}`;
          await this.messageBox.showMessageBox({
            type: 'error',
            title: 'Update Failed',
            message: `An error occurred while trying to update to version ${updateVersion}. See the developer console for more information.`,
            buttons: ['OK'],
          });
        }
      }
    });
  }

  private getFormattedVersion(updateInfo?: UpdateInfo): string {
    return updateInfo?.version ? `v${updateInfo.version}` : '';
  }

  /**
   * Handler for update available event.
   */
  private onUpdateAvailable(updateInfo?: UpdateInfo): void {
    this.#nextVersion = this.getFormattedVersion(updateInfo);

    this.updateAvailableEntry();
    if (this.getConfigurationValue() === 'startup') {
      this.commandRegistry.executeCommand('update', 'startup').catch((err: unknown) => {
        console.error('Something went wrong while executing update command', err);
      });
    }
  }

  /**
   * Registers configuration settings for update preferences.
   */
  private registerConfiguration(): void {
    this.configurationRegistry.registerConfigurations([
      {
        id: 'preferences.update',
        title: 'Update',
        type: 'object',
        properties: {
          ['preferences.update.reminder']: {
            description: 'Configure whether you receive update reminders when starting Podman Desktop',
            type: 'string',
            default: 'startup',
            enum: ['startup', 'never'],
          },
        },
      },
    ]);
  }

  /**
   * Retrieves the value of the update reminder configuration.
   * @returns The value of the update reminder configuration.
   */
  private getConfigurationValue(): 'startup' | 'never' {
    return this.configurationRegistry
      .getConfiguration('preferences')
      .get<'startup' | 'never'>('update.reminder', 'startup');
  }

  /**
   * Updates the value of the update reminder configuration.
   * @param value - The new value for the update reminder configuration.
   */
  private updateConfigurationValue(value: 'startup' | 'never'): void {
    this.configurationRegistry
      .getConfiguration('preferences')
      .update('update.reminder', value)
      .catch((err: unknown) => {
        console.error('Something went wrong while trying to update update.reminder preference', err);
      });
  }

  /**
   * Handler for update not available event.
   */
  private onUpdateNotAvailable(): void {
    this.#updateInProgress = false;
    this.#updateAlreadyDownloaded = false;

    // Update the 'version' entry in the status bar to show that no update is available
    this.defaultVersionEntry();
  }

  /**
   * Handler for update downloaded event.
   */
  private onUpdateDownloaded(updatedDownloadedEvent: UpdateDownloadedEvent): void {
    console.debug(`The update file has been downloaded to ${updatedDownloadedEvent.downloadedFile}`);
    this.#updateInProgress = false;
    this.#updateAlreadyDownloaded = true;

    // progress is 100% when the file is downloaded
    if (this.#downloadTask) {
      this.#downloadTask.progress = 100;
      this.#downloadTask.name = `Update v${updatedDownloadedEvent.version} downloaded`;
      this.#downloadTask.status = 'success';
    }

    this.messageBox
      .showMessageBox({
        title: 'Update Downloaded',
        message: `v${updatedDownloadedEvent.version} update downloaded, Do you want to restart Podman Desktop ?`,
        cancelId: 1,
        type: 'info',
        buttons: ['Restart', 'Cancel'],
      })
      .then(result => {
        if (result.response === 0) {
          setImmediate(() => autoUpdater.quitAndInstall());
        }
      })
      .catch((error: unknown) => {
        console.error('unable to show message box', error);
      });
  }

  /**
   * Handler for update error event.
   * @param error - The error that occurred during update.
   */
  private onUpdateError(error: Error): void {
    this.#updateInProgress = false;
    // local build not pushed to GitHub so prevent any 'update'
    if (error?.message?.includes('No published versions on GitHub')) {
      console.log('Cannot check for updates, no published versions on GitHub');
      this.defaultVersionEntry();
      return;
    }
    console.error('unable to check for updates', error);
  }

  /**
   * Handler for the download progress.
   */
  private onUpdateDownloadProgress(progressInfo: ProgressInfo): void {
    // update download task
    if (this.#downloadTask) {
      this.#downloadTask.progress = Math.round(progressInfo.percent);
    }
  }

  /**
   * Checks for updates.
   */
  private checkForUpdates(): void {
    autoUpdater
      .checkForUpdates()
      .then(result => {
        this.#updateCheckResult = result ?? undefined;
        this.#nextVersion = this.getFormattedVersion(this.#updateCheckResult?.updateInfo);
      })
      .catch((error: unknown) => {
        console.log('unable to check for updates', error);
      });
  }

  public updateAvailable(): boolean {
    return this.#updateCheckResult !== undefined;
  }

  public init(): Disposable {
    // disable auto download
    autoUpdater.autoDownload = false;

    this.registerDefaultCommands();

    // Only check on production builds for Windows and macOS users
    if (!import.meta.env.PROD || isLinux()) {
      this.defaultVersionEntry();
      return Disposable.noop();
    }

    this.registerCommands();
    this.registerConfiguration();

    // setup the event listeners
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this));
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    autoUpdater.on('error', this.onUpdateError.bind(this));
    autoUpdater.on('download-progress', this.onUpdateDownloadProgress.bind(this));

    try {
      this.checkForUpdates();
    } catch (error: unknown) {
      console.error('unable to check for updates', error);
    }

    // Create an interval to check for updates every 12 hours
    const intervalId = setInterval(this.checkForUpdates.bind(this), 1000 * 60 * 60 * 12);

    return Disposable.create(() => {
      clearInterval(intervalId);
    });
  }
}
