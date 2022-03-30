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

import type { Provider, ProviderConnectionStatus, ProviderLifecycle, ProviderStatus } from '@tmpwip/extension-api';
import { ipcRenderer } from 'electron';
import type { MenuItem } from './api/tray-menu-info';
import type { CommandRegistry } from './command-registry';
import type { ProviderRegistry } from './provider-registry';
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
  private providers = new Map<string, ProviderLifecycle>();
  constructor(private readonly commandRegistry: CommandRegistry, readonly providerRegistry: ProviderRegistry) {
    // add as listener
    providerRegistry.addProviderListener((name: string, provider: Provider) => {
      if (name === 'provider:update-status') {
        ipcRenderer.send('tray:update-provider', { name: provider.name, status: provider.status });
      }

      //this.registerProvider(provider.name, provider.);
    });
    providerRegistry.addProviderLifecycleListener((name: string, provider: Provider, lifecycle: ProviderLifecycle) => {
      this.registerProvider(provider.name, lifecycle);
    });

    ipcRenderer.on('tray:menu-item-click', (_, menuItemId: string) => {
      try {
        this.commandRegistry.executeCommand(menuItemId);
      } catch (err) {
        console.error(err);
      }
    });

    ipcRenderer.on('tray:menu-provider-click', (_, param: { type: string; providerName: string }) => {
      const provider = this.providers.get(param.providerName);
      if (provider) {
        if (param.type === 'Start') {
          provider.start();
        } else if (param.type === 'Stop') {
          provider.stop();
        }
      }
    });
  }

  registerMenuItem(providerName: string, menuItem: MenuItem): Disposable {
    this.menuItems.set(menuItem.id, menuItem);
    ipcRenderer.send('tray:add-menu-item', { providerName, menuItem });
    return Disposable.create(() => {
      this.menuItems.delete(menuItem.id);
      // TODO: notify main
    });
  }

  registerProvider(providerName: string, providerLifecycle: ProviderLifecycle): void {
    this.providers.set(providerName, providerLifecycle);
    ipcRenderer.send('tray:add-provider', { name: providerName, status: providerLifecycle.status() });
  }

  unregisterProvider(providerName: string) {
    this.providers.delete(providerName);
    ipcRenderer.send('tray:delete-provider', providerName);
  }
}
