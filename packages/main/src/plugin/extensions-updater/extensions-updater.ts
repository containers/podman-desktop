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

import { compareVersions } from 'compare-versions';
import { app } from 'electron';
import { coerce, satisfies } from 'semver';

import type { ConfigurationRegistry, IConfigurationNode } from '/@/plugin/configuration-registry.js';
import type { ExtensionLoader } from '/@/plugin/extension-loader.js';
import type { ExtensionsCatalog } from '/@/plugin/extensions-catalog/extensions-catalog.js';
import type { ExtensionInstaller } from '/@/plugin/install/extension-installer.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { ExtensionUpdateInfo } from '/@api/extension-info.js';

import { ExtensionsUpdaterSettings } from './extensions-updater-settings.js';

export class ExtensionsUpdater {
  static readonly CHECK_FOR_UPDATES_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

  private intervalChecker: NodeJS.Timeout | undefined;

  constructor(
    private extensionCatalog: ExtensionsCatalog,
    private extensionLoader: ExtensionLoader,
    private configurationRegistry: ConfigurationRegistry,
    private extensionInstaller: ExtensionInstaller,
    private telemetry: Telemetry,
  ) {}

  async init(): Promise<void> {
    const autoCheckUpdatesKey = `${ExtensionsUpdaterSettings.SectionName}.${ExtensionsUpdaterSettings.AutoCheckUpdates}`;
    const autoUpdateKey = `${ExtensionsUpdaterSettings.SectionName}.${ExtensionsUpdaterSettings.AutoUpdate}`;

    const extensionLoaderConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [autoCheckUpdatesKey]: {
          description:
            'When enabled, automatically checks extensions for updates. The updates are fetched from registry.podman-desktop.io.',
          type: 'boolean',
          default: true,
        },
        [autoUpdateKey]: {
          description: 'Download and install updates automatically for all extensions.',
          type: 'boolean',
          default: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([extensionLoaderConfiguration]);

    // check on configuration change
    this.configurationRegistry.onDidChangeConfiguration(async event => {
      if (event.key === autoCheckUpdatesKey && event.value === true) {
        await this.checkForUpdates();
      }

      if (event.key === autoUpdateKey && event.value === true) {
        await this.checkForUpdates();
      }
    });

    // setup recurring check
    this.intervalChecker = setInterval(() => {
      this.checkForUpdates().catch((err: unknown) => {
        console.error('Error while checking for updates', err);
      });
    }, ExtensionsUpdater.CHECK_FOR_UPDATES_INTERVAL);

    // check on startup
    await this.checkForUpdates();
  }

  async stop(): Promise<void> {
    if (this.intervalChecker) {
      clearInterval(this.intervalChecker);
    }
  }

  isAutoCheckUpdatesEnabled(): boolean {
    const config = this.configurationRegistry.getConfiguration(ExtensionsUpdaterSettings.SectionName);
    return config.get(ExtensionsUpdaterSettings.AutoCheckUpdates) === true;
  }

  isAutoUpdateEnabled(): boolean {
    const config = this.configurationRegistry.getConfiguration(ExtensionsUpdaterSettings.SectionName);
    return config.get(ExtensionsUpdaterSettings.AutoUpdate) === true;
  }

  async checkForUpdates(): Promise<void> {
    if (this.isAutoCheckUpdatesEnabled() || this.isAutoUpdateEnabled()) {
      try {
        await this.doCheckForUpdates();
      } catch (err) {
        console.error('Error while checking for updates', err);
      }
    }
  }

  // check if some extensions can be updated or not
  async doCheckForUpdates(): Promise<void> {
    // grab list of extensions
    const availableExtensions = await this.extensionCatalog.getExtensions();

    // now, grab list of installed extensions
    const installedExtensions = await this.extensionLoader.listExtensions();

    // now, for each installed extension that is not a built-in extension, check if there is a newer version available
    const extensionsToUpdate = installedExtensions
      .filter(extension => extension.removable === true)
      .map(installedExtension => {
        // find the extension in the list of available extensions
        const availableExtension = availableExtensions.find(extension => extension.id === installedExtension.id);
        // not found? skip
        if (!availableExtension) {
          console.log(
            `Skipping update for extension ${installedExtension.id} because it is not available in the registry`,
          );
          return undefined;
        }

        // if found compare versions
        const installedVersion = installedExtension.version;
        const appVersion = app.getVersion();

        // coerce the podman desktop Version
        const currentPodmanDesktopVersion = coerce(appVersion);

        // filter out versions non-compliant with this version of Podman Desktop
        const availableVersions = availableExtension.versions.filter(version => {
          const extensionRequirePodmanDesktopVersion = version.podmanDesktopVersion;
          if (extensionRequirePodmanDesktopVersion && currentPodmanDesktopVersion) {
            //  keep the versions that are compatible with this version of Podman Desktop
            return satisfies(currentPodmanDesktopVersion, extensionRequirePodmanDesktopVersion);
          } else {
            // if no version is specified, keep the version
            return true;
          }
        });

        const filteredPreviewVersions = availableVersions.filter(version => version.preview === false);
        // take latest version
        const latestAvailableVersion = filteredPreviewVersions?.[0];
        if (!latestAvailableVersion) {
          return undefined;
        }
        // now, compare versions
        // if installed version is greater or equal to latest available version, skip
        if (compareVersions(installedVersion, latestAvailableVersion.version) >= 0) {
          console.log(
            `Skipping update for extension ${installedExtension.id} because installed version ${installedVersion} is greater or equal to latest available version ${latestAvailableVersion.version}`,
          );
          return undefined;
        }

        const updateInfo: ExtensionUpdateInfo = {
          id: availableExtension.id,
          version: latestAvailableVersion.version,
          ociUri: latestAvailableVersion.ociUri,
        };

        return updateInfo;
      });

    // filter out undefined
    const extensionsToUpdateFiltered = extensionsToUpdate.filter(
      extension => extension !== undefined,
    ) as ExtensionUpdateInfo[];

    // if there are no extensions to update, skip
    if (extensionsToUpdateFiltered.length === 0) {
      return;
    }

    // if auto update is not enabled, flag the extensions as "can be updated"
    this.extensionLoader.setExtensionsUpdates(extensionsToUpdateFiltered);

    // if auto update is enabled, update all extensions
    if (this.isAutoUpdateEnabled()) {
      await this.updateExtensions(extensionsToUpdateFiltered, true);
    } else {
      // report in telemetry that user has updates available
      const telemetryOptions = {
        extensionsToUpdate: extensionsToUpdateFiltered,
      };
      this.telemetry.track('extensions-updates-available', telemetryOptions);
    }
  }

  async updateExtensions(extensionsToUpdate: ExtensionUpdateInfo[], internal?: boolean): Promise<void> {
    for (const extensionToUpdate of extensionsToUpdate) {
      await this.updateExtension(extensionToUpdate.id, extensionToUpdate.ociUri, internal);
    }
  }

  async updateExtension(extensionId: string, ociUri: string, internal?: boolean): Promise<void> {
    const telemetryOptions: {
      extensionId: string;
      ociUri: string;
      error?: unknown;
    } = {
      extensionId,
      ociUri,
    };

    let eventName: string;
    if (internal) {
      eventName = 'extension-update-auto';
    } else {
      eventName = 'extension-update-manual';
    }

    try {
      // uninstall the extension
      await this.extensionLoader.removeExtension(extensionId);

      const reportMessage = (message: string): void => {
        console.log(message);
      };

      // install the extension
      await this.extensionInstaller.installFromImage(reportMessage, reportMessage, reportMessage, ociUri);
    } catch (err) {
      console.error(`Error while updating extension ${extensionId}:`, err);
      telemetryOptions.error = err;
    } finally {
      this.telemetry.track(eventName, telemetryOptions);
    }
  }
}
