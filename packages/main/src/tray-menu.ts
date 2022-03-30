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

interface ContainerProvider {
  name: string;
  status: ProviderStatus;
}

interface ContainerProviderMenuItem extends ContainerProvider {
  childItems: MenuItemConstructorOptions[];
}

export class TrayMenu {
  private readonly menuTemplate: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    { label: 'Dashboard', click: this.showMainWindow.bind(this) },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit' },
  ];
  private menuItems = new Map<string, ContainerProviderMenuItem>();

  constructor(private readonly tray: Tray) {
    ipcMain.on('tray:add-menu-item', (_, param: { providerName: string; menuItem: MenuItemConstructorOptions }) => {
      param.menuItem.click = () => {
        const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
        if (window) {
          window.webContents.send('tray:menu-item-click', param.menuItem.id);
        }
      };
      const provider = this.menuItems.get(param.providerName);
      if (provider) {
        provider.childItems.push(param.menuItem);
        this.updateMenu();
      } else {
        this.menuItems.set(param.providerName, {
          childItems: [param.menuItem],
          name: 'temp',
          status: 'unknown',
        });
      }
    });

    ipcMain.on('tray:add-provider', (_, container: ContainerProvider) => {
      this.addContainerProviderItems(container);
    });

    ipcMain.on('tray:update-provider', (_, container: ContainerProvider) => {
      this.updateContainerProvider(container);
    });

    ipcMain.on('tray:delete-provider', (_, providerName) => {
      this.deleteContainerProvider(providerName);
    });

    // create menu first time
    this.updateMenu();
  }

  private addContainerProviderItems(cp: ContainerProvider): void {
    const providerItem: ContainerProviderMenuItem = {
      childItems: [],
      name: cp.name,
      status: cp.status,
    };

    const oldProvider = this.menuItems.get(cp.name);
    if (oldProvider && oldProvider.name === 'temp') {
      this.menuItems.delete(cp.name);
      providerItem.childItems.push(...oldProvider.childItems);
    }
    this.menuItems.set(cp.name, providerItem);
    this.updateMenu();
  }

  private updateContainerProvider(cp: ContainerProvider): void {
    const provider = this.menuItems.get(cp.name);
    if (provider) {
      provider.status = cp.status;
    }
    this.updateMenu();
  }

  private deleteContainerProvider(providerName: string): void {
    this.menuItems.delete(providerName);
    this.updateMenu();
  }

  private updateMenu(): void {
    const generatedMenuTemplate: MenuItemConstructorOptions[] = [];
    for (const [, item] of this.menuItems) {
      generatedMenuTemplate.push(this.createContainerProviderMenuItem(item));
    }

    generatedMenuTemplate.push(...this.menuTemplate);

    const contextMenu = Menu.buildFromTemplate(generatedMenuTemplate);
    this.tray.setContextMenu(contextMenu);
  }

  private createContainerProviderMenuItem(item: ContainerProviderMenuItem): MenuItemConstructorOptions {
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
        this.sendItemClick({ type: 'Start', providerName: item.name });
      },
    });

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Stop',
      enabled: item.status === 'started',
      click: () => {
        this.sendItemClick({ type: 'Stop', providerName: item.name });
      },
    });
    (result.submenu as MenuItemConstructorOptions[]).push({ type: 'separator' });

    if (item.childItems.length > 0) {
      (result.submenu as MenuItemConstructorOptions[]).push(...item.childItems);
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

  private sendItemClick(param: { type: string; providerName: string }): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (window) {
      window.webContents.send('tray:menu-provider-click', param);
    }
  }

  private showMainWindow(): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

    if (window?.isMinimized()) {
      window.restore();
    }

    if (!window?.isVisible()) {
      window?.show();
      if (isMac) {
        app.dock.show();
      }
    }
    window?.focus();
    window?.moveTop();
  }
}
