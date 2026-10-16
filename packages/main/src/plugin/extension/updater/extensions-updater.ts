/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ExtensionUpdateInfo } from '@desktop-framework/api';
import type { IConfigurationNode } from '@desktop-framework/api/configuration';
import { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable } from 'inversify';
import { compare } from 'semver';

import { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import { ExtensionInstaller } from '/@/plugin/extension/extension-installer.js';
import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { ExtensionsUpdaterSettings } from '/@/plugin/extension/updater/extensions-updater-settings.js';
import { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import product from '/@product.json' with { type: 'json' };

@injectable()
export class ExtensionsUpdater {
  static readonly CHECK_FOR_UPDATES_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

  private intervalChecker: NodeJS.Timeout | undefined;

  constructor(
    @inject(ExtensionsCatalog)
    private extensionCatalog: ExtensionsCatalog,
    @inject(ExtensionLoader)
    private extensionLoader: ExtensionLoader,
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(ExtensionInstaller)
    private extensionInstaller: ExtensionInstaller,
    @inject(Telemetry)
    private telemetry: Telemetry,
  ) {}

  async init(): Promise<void> {
    const autoCheckUpdatesKey = `${ExtensionsUpdaterSettings.SectionName}.${ExtensionsUpdaterSettings.AutoCheckUpdates}`;
    const autoUpdateKey = `${ExtensionsUpdaterSettings.SectionName}.${ExtensionsUpdaterSettings.AutoUpdate}`;
    const catalogTitle = new URL(product.catalog.default).hostname;
    const updateFetchedText = catalogTitle ? ` The updates are fetched from ${catalogTitle}` : '';

    const extensionLoaderConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [autoCheckUpdatesKey]: {
          description: `When enabled, automatically checks extensions for updates.${updateFetchedText}`,
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
    // grab list of compatible extensions
    const availableExtensions = await this.extensionCatalog.getExtensions();

    // now, grab list of installed extensions
    const installedExtensions = await this.extensionLoader.listExtensions();

    // now, for each installed extension that is not a built-in extension, check if there is a newer version available
    // an extension replacing a bundled one is not updated, like the bundled extension it replaces
    const extensionsToUpdate = installedExtensions
      .filter(extension => extension.removable === true && !extension.overrides)
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

        const filteredPreviewVersions = availableExtension.versions.filter(version => version.preview === false);
        // take latest version
        const latestAvailableVersion = filteredPreviewVersions?.[0];
        if (!latestAvailableVersion) {
          return undefined;
        }
        // now, compare versions
        // if installed version is greater or equal to latest available version, skip
        if (compare(installedVersion, latestAvailableVersion.version) >= 0) {
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
