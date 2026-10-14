/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type { MenuItem, ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { dialog, ipcMain } from 'electron';
import { inject, injectable } from 'inversify';

import { TrayMenu } from '/@/tray-menu.js';

import { CommandRegistry } from './command-registry.js';
import { ProviderRegistry } from './provider-registry.js';
import { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';

@injectable()
export class TrayMenuRegistry {
  private menuItems = new Map<string, MenuItem>();
  private providers = new Map<string, ProviderInfo>();

  constructor(
    @inject(TrayMenu)
    private trayMenu: TrayMenu,
    @inject(CommandRegistry)
    private readonly commandRegistry: CommandRegistry,
    @inject(ProviderRegistry)
    readonly providerRegistry: ProviderRegistry,
    @inject(Telemetry)
    private readonly telemetryService: Telemetry,
  ) {
    // add a listener
    providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
      if (name === 'provider:create') {
        this.providers.set(providerInfo.internalId, providerInfo);
      } else if (name === 'provider:delete') {
        this.providers.delete(providerInfo.internalId);
      }
      if (name === 'provider:update-status') {
        this.trayMenu.updateProvider(providerInfo);
      }
    });
    providerRegistry.addProviderLifecycleListener((_name: string, provider: ProviderInfo) => {
      this.registerProvider(provider);
    });

    providerRegistry.addProviderContainerConnectionLifecycleListener(
      (name: string, providerInfo: ProviderInfo, containerProviderConnectionInfo: ProviderContainerConnectionInfo) => {
        // notify tray menu registry
        if (name === 'provider-container-connection:register') {
          trayMenu.handleConnection('add', providerInfo, containerProviderConnectionInfo);
        }
        if (name === 'provider-container-connection:unregister') {
          trayMenu.handleConnection('delete', providerInfo, containerProviderConnectionInfo);
        }
        if (name === 'provider-container-connection:update-status') {
          trayMenu.handleConnection('update', providerInfo, containerProviderConnectionInfo);
        }
      },
    );

    ipcMain.on('tray:menu-item-click', (_, menuItemId: string, label: string) => {
      this.commandRegistry.executeCommand(menuItemId, label).catch((err: unknown) => {
        console.error(err);
      });
    });

    ipcMain.on('tray:menu-provider-click', (_, param: { action: string; providerInfo: ProviderInfo }) => {
      this.telemetryService.track('tray:menu-provider-click', { action: param.action, name: param.providerInfo.name });
      const provider = this.providers.get(param.providerInfo.internalId);
      if (provider) {
        if (param.action === 'Start') {
          providerRegistry.startProviderLifecycle(param.providerInfo.internalId).catch((err: unknown) => {
            console.error(`Error while starting ${param.providerInfo.name}`, '' + err);
          });
        } else if (param.action === 'Stop') {
          providerRegistry.stopProviderLifecycle(param.providerInfo.internalId).catch((err: unknown) => {
            console.error(`Error while starting ${param.providerInfo.name}`, '' + err);
          });
        }
      }
    });

    ipcMain.on(
      'tray:menu-provider-container-connection-click',
      (
        _,
        param: {
          action: string;
          providerInfo: ProviderInfo;
          providerContainerConnectionInfo: ProviderContainerConnectionInfo;
        },
      ) => {
        this.telemetryService.track('tray:menu-provider-container-connection-click', {
          action: param.action,
          name: param.providerContainerConnectionInfo.name,
        });

        const provider = this.providers.get(param.providerInfo.internalId);
        if (provider) {
          if (param.action === 'Start') {
            providerRegistry
              .startProviderConnection(param.providerInfo.internalId, param.providerContainerConnectionInfo)
              .catch((err: unknown) => {
                dialog.showErrorBox(`Error while starting ${param.providerContainerConnectionInfo.name}`, '' + err);
              });
          } else if (param.action === 'Stop') {
            providerRegistry
              .stopProviderConnection(param.providerInfo.internalId, param.providerContainerConnectionInfo)
              .catch((err: unknown) => {
                dialog.showErrorBox(`Error while stopping ${param.providerContainerConnectionInfo.name}`, '' + err);
              });
          }
        }
      },
    );
  }

  registerMenuItem(menuItem: MenuItem): Disposable {
    this.menuItems.set(menuItem.id, menuItem);
    ipcMain.emit('tray:add-menu-item', '', { menuItem });
    return Disposable.create(() => {
      ipcMain.emit('tray:delete-menu-item', '', menuItem.id);
      this.menuItems.delete(menuItem.id);
    });
  }

  registerProviderMenuItem(providerId: string, menuItem: MenuItem): Disposable {
    // Retrieve the provider info from the registry,
    // this is necessary so that we can pass in the provider information
    // in case we need to update / create a provider menu section.

    // Get the matching internal provider id
    const providerInternalId = this.providerRegistry.getMatchingProviderInternalId(providerId);
    const providerInfo = this.providerRegistry.getProviderInfo(providerInternalId);
    this.menuItems.set(menuItem.id, menuItem);
    ipcMain.emit('tray:add-provider-menu-item', '', { providerId, providerInfo, menuItem });
    return Disposable.create(() => {
      this.trayMenu.deleteProviderItem(providerId, menuItem.id);
      this.menuItems.delete(menuItem.id);
    });
  }

  registerProvider(providerInfo: ProviderInfo): void {
    this.trayMenu.addProviderItems(providerInfo);
  }

  unregisterProvider(providerInfo: ProviderInfo): void {
    this.trayMenu.deleteProvider(providerInfo);
  }
}
