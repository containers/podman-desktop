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

import type { ProviderStatus } from '@tmpwip/extension-api';
import { app, ipcMain, BrowserWindow, Menu, nativeImage } from 'electron';
import type { MenuItemConstructorOptions, Tray, NativeImage } from 'electron';
import statusStarted from './assets/status-started.png';
import statusStopped from './assets/status-stopped.png';
import statusUnknown from './assets/status-unknown.png';
import { isMac } from './util';
import statusBusy from './assets/status-busy.png';
import type { ProviderInfo, ProviderContainerConnectionInfo } from '../../preload/src/api/provider-info';
import type { AnimatedTray, TrayIconStatus } from './tray-animate-icon';

// extends type from the plugin
interface ProviderMenuItem extends ProviderInfo {
  childItems: MenuItemConstructorOptions[];
}
interface ProviderContainerConnectionInfoMenuItem extends ProviderContainerConnectionInfo {
  providerInfo: ProviderInfo;
  childItems: MenuItemConstructorOptions[];
}

export class TrayMenu {
  private globalStatus: TrayIconStatus = 'initialized';

  private readonly menuTemplate: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    { label: 'Dashboard', click: this.showMainWindow.bind(this) },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit' },
  ];
  private menuProviderItems = new Map<string, ProviderMenuItem>();
  private menuContainerProviderConnectionItems = new Map<string, ProviderContainerConnectionInfoMenuItem>();

  constructor(private readonly tray: Tray, private readonly animatedTray: AnimatedTray) {
    ipcMain.on('tray:add-menu-item', (_, param: { providerId: string; menuItem: MenuItemConstructorOptions }) => {
      param.menuItem.click = () => {
        const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
        if (window) {
          window.webContents.send('tray:menu-item-click', param.menuItem.id);
        }
      };
      // grab matching provider
      const provider = Array.from(this.menuProviderItems.values()).find(item => item.id === param.providerId);
      if (provider) {
        provider.childItems.push(param.menuItem);
        this.updateMenu();
      } else {
        this.menuProviderItems.set(param.providerId, {
          id: param.providerId,
          internalId: '',
          childItems: [param.menuItem],
          name: 'temp',
          status: 'unknown',
          containerConnections: [],
          kubernetesConnections: [],
          lifecycleMethods: [],
          containerProviderConnectionCreation: false,
        });
      }
    });

    // Handle provider container connection
    ipcMain.on(
      'tray:container-provider-connection',
      (
        _,
        action: string,
        providerInfo: ProviderInfo,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): void => {
        // lifecycle on the provider, so do not add entry for the connection
        if (providerInfo.lifecycleMethods) {
          return;
        }

        if (action === 'add') {
          this.addProviderContainerConnectionItems(providerInfo, providerContainerConnectionInfo);
        } else if (action === 'update') {
          this.updateProviderContainerConnectionItems(providerInfo, providerContainerConnectionInfo);
        } else if (action === 'delete') {
          this.deleteProviderContainerConnectionItems(providerInfo, providerContainerConnectionInfo);
        }
      },
    );

    ipcMain.on('tray:provider', (_, action: string, provider: ProviderInfo): void => {
      if (action === 'add') {
        this.addProviderItems(provider);
      } else if (action === 'update') {
        this.updateProvider(provider);
      } else if (action === 'delete') {
        this.deleteProvider(provider);
      }
    });

    // create menu first time
    this.updateMenu();
  }

  private addProviderContainerConnectionItems(
    providerInfo: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    const providerContainerConnectionInfoMenuItem: ProviderContainerConnectionInfoMenuItem = {
      ...providerContainerConnectionInfo,
      providerInfo,
      childItems: [],
    };
    this.menuContainerProviderConnectionItems.set(
      providerContainerConnectionInfoMenuItem.endpoint.socketPath,
      providerContainerConnectionInfoMenuItem,
    );
    this.updateMenu();
  }

  private updateProviderContainerConnectionItems(
    _provider: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    const menuProviderItem = this.menuContainerProviderConnectionItems.get(
      providerContainerConnectionInfo.endpoint.socketPath,
    );
    if (menuProviderItem) {
      menuProviderItem.status = providerContainerConnectionInfo.status;
    }
    this.updateMenu();
  }

  private deleteProviderContainerConnectionItems(
    _provider: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    this.menuContainerProviderConnectionItems.delete(providerContainerConnectionInfo.endpoint.socketPath);
    this.updateMenu();
  }

  private addProviderItems(provider: ProviderInfo): void {
    const providerMenuItem: ProviderMenuItem = {
      ...provider,
      childItems: [],
    };

    const oldProvider = this.menuProviderItems.get(providerMenuItem.internalId);
    if (oldProvider && oldProvider.name === 'temp') {
      this.menuProviderItems.delete(provider.internalId);
      providerMenuItem.childItems.push(...oldProvider.childItems);
    }
    this.menuProviderItems.set(provider.internalId, providerMenuItem);
    this.updateMenu();
  }

  private updateProvider(provider: ProviderInfo): void {
    const menuProviderItem =
      this.menuProviderItems.get(provider.internalId) ||
      Array.from(this.menuProviderItems.values()).find(item => item.id === provider.id);
    if (menuProviderItem) {
      menuProviderItem.status = provider.status;
    }
    this.updateMenu();
  }

  private deleteProvider(provider: ProviderInfo): void {
    this.menuProviderItems.delete(provider.internalId);
    this.updateMenu();
  }

  private updateMenu(): void {
    const generatedMenuTemplate: MenuItemConstructorOptions[] = [];
    for (const [, item] of this.menuProviderItems) {
      generatedMenuTemplate.push(this.createProviderMenuItem(item));
    }
    for (const [, item] of this.menuContainerProviderConnectionItems) {
      generatedMenuTemplate.push(this.createProviderConnectionMenuItem(item));
    }

    generatedMenuTemplate.push(...this.menuTemplate);

    const contextMenu = Menu.buildFromTemplate(generatedMenuTemplate);
    this.tray.setContextMenu(contextMenu);

    // update animated tray status
    this.updateGlobalStatus();
  }

  protected updateGlobalStatus() {
    // do we have any provider or any connection ?
    const hasOneProviderBeingStarted = Array.from(this.menuProviderItems.values()).find(
      item => item.status === 'started',
    );
    const hasOneProviderConnectionBeingStarted = Array.from(this.menuContainerProviderConnectionItems.values()).find(
      item => item.status === 'started',
    );

    const hasOneStarted = hasOneProviderBeingStarted || hasOneProviderConnectionBeingStarted;
    // is that one provider is being stopped or being started
    const hasOneProviderStartingOrStopping = Array.from(this.menuProviderItems.values()).find(
      item => item.status === 'starting' || item.status === 'stopping',
    );
    const hasOneProviderConnectionStartingOrStopping = Array.from(
      this.menuContainerProviderConnectionItems.values(),
    ).find(item => item.status === 'starting' || item.status === 'stopping');
    const hasOneStartingOrStopping = hasOneProviderStartingOrStopping || hasOneProviderConnectionStartingOrStopping;

    if (hasOneStartingOrStopping !== undefined) {
      this.globalStatus = 'updating';
    } else if (hasOneStarted !== undefined) {
      this.globalStatus = 'ready';
    } else {
      this.globalStatus = 'initialized';
    }
    this.animatedTray.setStatus(this.globalStatus);
  }

  private createProviderMenuItem(item: ProviderMenuItem): MenuItemConstructorOptions {
    const result: MenuItemConstructorOptions = {
      label: item.name,
      icon: this.getStatusIcon(item.status),
      type: 'submenu',
      submenu: [],
    };

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Start',
      enabled: item.status === 'stopped',
      click: () => {
        this.sendItemClick({ action: 'Start', providerInfo: item });
      },
    });

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Stop',
      enabled: item.status === 'started',
      click: () => {
        this.sendItemClick({ action: 'Stop', providerInfo: item });
      },
    });
    (result.submenu as MenuItemConstructorOptions[]).push({ type: 'separator' });

    if (item.childItems.length > 0) {
      (result.submenu as MenuItemConstructorOptions[]).push(...item.childItems);
    }

    return result;
  }

  private createProviderConnectionMenuItem(
    providerContainerConnectionInfoMenuItem: ProviderContainerConnectionInfoMenuItem,
  ): MenuItemConstructorOptions {
    const result: MenuItemConstructorOptions = {
      label: providerContainerConnectionInfoMenuItem.name,
      icon: this.getStatusIcon(providerContainerConnectionInfoMenuItem.status),
      type: 'submenu',
      submenu: [],
    };

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Start',
      enabled: providerContainerConnectionInfoMenuItem.status === 'stopped',
      click: () => {
        this.sendProviderContainerConnectionInfoMenuItemClick({
          action: 'Start',
          providerInfo: providerContainerConnectionInfoMenuItem.providerInfo,
          providerContainerConnectionInfo: providerContainerConnectionInfoMenuItem,
        });
      },
    });

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Stop',
      enabled: providerContainerConnectionInfoMenuItem.status === 'started',
      click: () => {
        this.sendProviderContainerConnectionInfoMenuItemClick({
          action: 'Stop',
          providerInfo: providerContainerConnectionInfoMenuItem.providerInfo,
          providerContainerConnectionInfo: providerContainerConnectionInfoMenuItem,
        });
      },
    });
    (result.submenu as MenuItemConstructorOptions[]).push({ type: 'separator' });

    if (providerContainerConnectionInfoMenuItem.childItems.length > 0) {
      (result.submenu as MenuItemConstructorOptions[]).push(...providerContainerConnectionInfoMenuItem.childItems);
    }

    return result;
  }

  private getStatusIcon(status: ProviderStatus): NativeImage {
    let image;
    switch (status) {
      case 'started':
        image = statusStarted;
        break;
      case 'stopped':
        image = statusStopped;
        break;
      case 'starting':
      case 'stopping':
        image = statusBusy;
        break;
      default:
        image = statusUnknown;
    }
    return nativeImage.createFromDataURL(image);
  }

  private sendItemClick(param: { action: string; providerInfo: ProviderInfo }): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (window) {
      window.webContents.send('tray:menu-provider-click', param);
    }
  }

  private sendProviderContainerConnectionInfoMenuItemClick(param: {
    action: string;
    providerInfo: ProviderInfo;
    providerContainerConnectionInfo: ProviderContainerConnectionInfo;
  }): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (window) {
      window.webContents.send('tray:menu-provider-container-connection-click', param);
    }
  }

  private showMainWindow(): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window?.isMinimized()) {
      window.restore();
    }
    window?.show();
    if (isMac) {
      app.dock.show();
    }
    window?.focus();
    window?.moveTop();
  }
}
