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

import type { ProviderConnectionStatus, ProviderStatus } from '@podman-desktop/api';
import { ipcMain, dialog } from 'electron';
import type { TrayMenu } from '../tray-menu';
import type { ProviderContainerConnectionInfo, ProviderInfo } from './api/provider-info';
import type { MenuItem } from './api/tray-menu-info';
import type { CommandRegistry } from './command-registry';
import type { ProviderRegistry } from './provider-registry';
import type { Telemetry } from './telemetry/telemetry';
import { Disposable } from './types/disposable';

export interface TrayProviderConnectionInfo {
  name: string;
  status: ProviderConnectionStatus;
}

export interface TrayProviderInfo {
  name: string;
  status: ProviderStatus;
}

export class TrayMenuRegistry {
  private menuItems = new Map<string, MenuItem>();
  private providers = new Map<string, ProviderInfo>();

  constructor(
    private trayMenu: TrayMenu,
    private readonly commandRegistry: CommandRegistry,
    readonly providerRegistry: ProviderRegistry,
    private readonly telemetryService: Telemetry,
  ) {
    // add as listener
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
    providerRegistry.addProviderLifecycleListener((name: string, provider: ProviderInfo) => {
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
      try {
        this.commandRegistry.executeCommand(menuItemId, label);
      } catch (err) {
        console.error(err);
      }
    });

    ipcMain.on('tray:menu-provider-click', (_, param: { action: string; providerInfo: ProviderInfo }) => {
      this.telemetryService.track('tray:menu-provider-click', { action: param.action, name: param.providerInfo.name });
      const provider = this.providers.get(param.providerInfo.internalId);
      if (provider) {
        if (param.action === 'Start') {
          providerRegistry.startProviderLifecycle(param.providerInfo.internalId);
        } else if (param.action === 'Stop') {
          providerRegistry.stopProviderLifecycle(param.providerInfo.internalId);
        }
      }
    });

    ipcMain.on(
      'tray:menu-provider-container-connection-click',
      async (
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
            try {
              await providerRegistry.startProviderConnection(
                param.providerInfo.internalId,
                param.providerContainerConnectionInfo,
              );
            } catch (err) {
              dialog.showErrorBox(`Error while starting ${param.providerContainerConnectionInfo.name}`, '' + err);
            }
          } else if (param.action === 'Stop') {
            try {
              await providerRegistry.stopProviderConnection(
                param.providerInfo.internalId,
                param.providerContainerConnectionInfo,
              );
            } catch (err) {
              dialog.showErrorBox(`Error while stopping ${param.providerContainerConnectionInfo.name}`, '' + err);
            }
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
    this.menuItems.set(menuItem.id, menuItem);
    ipcMain.emit('tray:add-provider-menu-item', '', { providerId, menuItem });
    return Disposable.create(() => {
      this.trayMenu.deleteProviderItem(providerId, menuItem.id);
      this.menuItems.delete(menuItem.id);
    });
  }

  registerProvider(providerInfo: ProviderInfo): void {
    this.trayMenu.addProviderItems(providerInfo);
  }

  unregisterProvider(providerInfo: ProviderInfo) {
    this.trayMenu.deleteProvider(providerInfo);
  }
}
