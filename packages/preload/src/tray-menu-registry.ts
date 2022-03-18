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

import type { ProviderLifecycle } from '@tmpwip/extension-api';
import { ipcRenderer } from 'electron';
import type { MenuItem } from './api/tray-menu-info';
import type { CommandRegistry } from './command-registry';
import { Disposable } from './types/disposable';

export class TrayMenuRegistry {
  private menuItems = new Map<string, MenuItem>();
  private containerProviders = new Map<string, ProviderLifecycle>();

  constructor(private readonly commandRegistry: CommandRegistry) {
    ipcRenderer.on('tray-menu-item-click', (_, menuItemId: string) => {
      try {
        this.commandRegistry.executeCommand(menuItemId);
      } catch (err) {
        console.error(err);
      }
    });

    ipcRenderer.on('tray-menu-provider-click', (_, param: { type: string; providerName: string }) => {
      const provider = this.containerProviders.get(param.providerName);
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
    ipcRenderer.send('add-tray-menu-item', { providerName, menuItem });
    return Disposable.create(() => {
      this.menuItems.delete(menuItem.id);
      // TODO: notify main
    });
  }

  addContainerProviderLifecycle(providerName: string, crl: ProviderLifecycle): void {
    this.containerProviders.set(providerName, crl);
    ipcRenderer.send('add-tray-container-provider', { providerName, status: crl.status() });
    crl.handleLifecycleChange(() => {
      ipcRenderer.send('update-tray-container-provider', { providerName, status: crl.status() });
    });
  }

  removeContainerProviderLifecycle(providerName: string) {
    this.containerProviders.delete(providerName);
    ipcRenderer.send('delete-tray-container-provider', providerName);
  }
}
