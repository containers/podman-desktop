/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { ProviderStatus } from '@podman-desktop/api';
import type { MenuItemConstructorOptions, NativeImage, Tray } from 'electron';
import { app, ipcMain, Menu, nativeImage } from 'electron';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info.js';

import statusBusy from './assets/status-busy.png';
import statusStarted from './assets/status-started.png';
import statusStopped from './assets/status-stopped.png';
import statusUnknown from './assets/status-unknown.png';
import type { AnimatedTray, TrayIconStatus } from './tray-animate-icon.js';
import { findWindow, isMac, isWindows } from './util.js';

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

  private readonly startMenuTemplate: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    { label: 'Dashboard', click: this.showMainWindow.bind(this) },
  ];
  private readonly endMenuTemplate: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit' },
  ];

  private menuProviderItems = new Map<string, ProviderMenuItem>();
  private menuCustomItems = new Map<string, MenuItemConstructorOptions>();
  private menuContainerProviderConnectionItems = new Map<string, ProviderContainerConnectionInfoMenuItem>();

  constructor(
    private readonly tray: Tray,
    private readonly animatedTray: AnimatedTray,
  ) {
    ipcMain.on(
      'tray:add-provider-menu-item',
      (_, param: { providerId: string; menuItem: MenuItemConstructorOptions }) => {
        param.menuItem.click = (): void => {
          ipcMain.emit('tray:menu-item-click', '', param.menuItem.id);
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
            detectionChecks: [],
            version: '',
            links: [],
            images: {},
            warnings: [],
            installationSupport: false,
            containerProviderConnectionCreation: false,
            kubernetesProviderConnectionCreation: false,
            containerProviderConnectionInitialization: false,
            kubernetesProviderConnectionInitialization: false,
            cleanupSupport: false,
            extensionId: '',
          });
        }
        this.updateMenu();
      },
    );

    ipcMain.on('tray:delete-menu-item', (_, id: string) => {
      this.menuCustomItems.delete(id);
      this.updateMenu();
    });

    ipcMain.on('tray:add-menu-item', (_, param: { menuItem: MenuItemConstructorOptions }) => {
      param.menuItem.click = (): void => {
        ipcMain.emit('tray:menu-item-click', '', param.menuItem.id, param.menuItem.label);
      };

      // add also the click on all submenu items
      if (Array.isArray(param.menuItem.submenu)) {
        param.menuItem.submenu.forEach(item => {
          item.click = (): void => {
            ipcMain.emit('tray:menu-item-click', '', item.id, item.label);
          };
        });
      }
      this.menuCustomItems.set(param.menuItem.id ?? 'default', param.menuItem);

      // create menu first time
      this.updateMenu();
    });

    if (isWindows()) {
      tray.on('click', this.showMainWindow.bind(this));
    }

    // create menu first time
    this.updateMenu();
  }

  public deleteProviderItem(providerId: string, itemId: string): void {
    const provider = Array.from(this.menuProviderItems.values()).find(item => item.id === providerId);
    if (provider) {
      provider.childItems = provider.childItems.filter(it => it.id !== itemId);
      this.updateMenu();
    } else {
      console.error(`Cannot find provider ${providerId}`);
    }
  }

  // Handle provider container connection
  handleConnection(
    action: string,
    providerInfo: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
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
  }

  public addProviderContainerConnectionItems(
    providerInfo: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    const providerContainerConnectionInfoMenuItem: ProviderContainerConnectionInfoMenuItem = {
      ...providerContainerConnectionInfo,
      providerInfo,
      childItems: [],
    };
    this.menuContainerProviderConnectionItems.set(
      `${providerContainerConnectionInfoMenuItem.name}.${providerContainerConnectionInfoMenuItem.endpoint.socketPath}`,
      providerContainerConnectionInfoMenuItem,
    );
    this.updateMenu();
  }

  public updateProviderContainerConnectionItems(
    _provider: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    const menuProviderItem = this.menuContainerProviderConnectionItems.get(
      `${providerContainerConnectionInfo.name}.${providerContainerConnectionInfo.endpoint.socketPath}`,
    );
    if (menuProviderItem) {
      menuProviderItem.status = providerContainerConnectionInfo.status;
    }
    this.updateMenu();
  }

  public deleteProviderContainerConnectionItems(
    _provider: ProviderInfo,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    this.menuContainerProviderConnectionItems.delete(
      `${providerContainerConnectionInfo.name}.${providerContainerConnectionInfo.endpoint.socketPath}`,
    );
    this.updateMenu();
  }

  public addProviderItems(provider: ProviderInfo): void {
    const providerMenuItem: ProviderMenuItem = {
      ...provider,
      childItems: [],
    };

    const oldProvider = this.menuProviderItems.get(providerMenuItem.internalId);
    if (oldProvider) {
      providerMenuItem.childItems.push(...oldProvider.childItems);
    }
    this.menuProviderItems.set(provider.internalId, providerMenuItem);
    this.updateMenu();
  }

  public updateProvider(provider: ProviderInfo): void {
    const menuProviderItem =
      this.menuProviderItems.get(provider.internalId) ??
      Array.from(this.menuProviderItems.values()).find(item => item.id === provider.id);
    if (menuProviderItem) {
      menuProviderItem.status = provider.status;
    }
    this.updateMenu();
  }

  public deleteProvider(provider: ProviderInfo): void {
    this.menuProviderItems.delete(provider.internalId);
    this.updateMenu();
  }

  private updateMenu(): void {
    const generatedMenuTemplate: MenuItemConstructorOptions[] = [];
    for (const [, item] of this.menuProviderItems) {
      generatedMenuTemplate.push(this.createProviderMenuItem(item));
    }
    for (const [, item] of this.menuContainerProviderConnectionItems) {
      const createdItem = this.createProviderConnectionMenuItem(item);
      if (createdItem) {
        generatedMenuTemplate.push(createdItem);
      }
    }

    // add top menu
    generatedMenuTemplate.push(...this.startMenuTemplate);

    // needs to add an extra separator in case we had custom menu items
    if (this.menuCustomItems.size > 0) {
      generatedMenuTemplate.push({ type: 'separator' });
    }

    // add custom items
    for (const [, item] of this.menuCustomItems) {
      generatedMenuTemplate.push(item);
    }

    // needs to add an extra separator in case we had custom menu items
    if (this.menuCustomItems.size > 0) {
      generatedMenuTemplate.push({ type: 'separator' });
    }

    // add end of the menu (quit)
    generatedMenuTemplate.push(...this.endMenuTemplate);

    const contextMenu = Menu.buildFromTemplate(generatedMenuTemplate);
    this.tray.setContextMenu(contextMenu);

    // update animated tray status
    this.updateGlobalStatus();
  }

  protected updateGlobalStatus(): void {
    // do we have any provider or any connection ?
    const hasOneProviderBeingStarted = Array.from(this.menuProviderItems.values()).find(
      item => item.status === 'started',
    );
    const hasOneProviderConnectionBeingStarted = Array.from(this.menuContainerProviderConnectionItems.values()).find(
      item => item.status === 'started',
    );

    const hasOneStarted = hasOneProviderBeingStarted ?? hasOneProviderConnectionBeingStarted;
    // is that one provider is being stopped or being started
    const hasOneProviderStartingOrStopping = Array.from(this.menuProviderItems.values()).find(
      item => item.status === 'starting' || item.status === 'stopping',
    );
    const hasOneProviderConnectionStartingOrStopping = Array.from(
      this.menuContainerProviderConnectionItems.values(),
    ).find(item => item.status === 'starting' || item.status === 'stopping');
    const hasOneStartingOrStopping = hasOneProviderStartingOrStopping ?? hasOneProviderConnectionStartingOrStopping;

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
      enabled: item.status === 'stopped' || item.status === 'configured',
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
  ): MenuItemConstructorOptions | undefined {
    if (!providerContainerConnectionInfoMenuItem.lifecycleMethods) {
      return {
        label: providerContainerConnectionInfoMenuItem.name,
        icon: this.getStatusIcon(providerContainerConnectionInfoMenuItem.status),
      };
    }

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
      case 'configured':
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
    // send empty event
    ipcMain.emit('tray:menu-provider-click', '', param);
  }

  private sendProviderContainerConnectionInfoMenuItemClick(param: {
    action: string;
    providerInfo: ProviderInfo;
    providerContainerConnectionInfo: ProviderContainerConnectionInfo;
  }): void {
    ipcMain.emit('tray:menu-provider-container-connection-click', '', param);
  }

  private showMainWindow(): void {
    const window = findWindow();

    if (window?.isMinimized()) {
      window.restore();
    }
    window?.show();
    if (isMac()) {
      app.dock.show().catch((error: unknown) => {
        console.error('Error while showing dock', error);
      });
    }
    window?.focus();
    window?.moveTop();
  }
}
