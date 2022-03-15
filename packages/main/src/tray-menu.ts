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

import { ipcMain, BrowserWindow, Menu } from 'electron';
import type { MenuItemConstructorOptions, Tray } from 'electron';
import * as path from 'node:path';

interface ContainerProvider {
  providerName: string;
  status: string;
}

interface ContainerProviderMenuItem extends ContainerProvider {
  childItems: MenuItemConstructorOptions[];
}

export class TrayMenu {
  private readonly menuTemplate: MenuItemConstructorOptions[] = [
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit' },
  ];
  private generatedMenuTemplate: MenuItemConstructorOptions[] = [];
  private menuItems = new Map<string, ContainerProviderMenuItem>();

  constructor(private readonly tray: Tray) {
    ipcMain.on('add-tray-menu-item', (_, param: { providerName: string; menuItem: MenuItemConstructorOptions }) => {
      param.menuItem.click = () => {
        const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
        if (window) {
          window.webContents.send('tray-menu-item-click', param.menuItem.id);
        }
      };
      const provider = this.menuItems.get(param.providerName);
      if (provider) {
        provider.childItems.push(param.menuItem);
        this.updateMenu();
      } else {
        this.menuItems.set(param.providerName, {
          childItems: [param.menuItem],
          providerName: 'temp',
          status: 'unknown',
        });
      }
    });

    ipcMain.on('add-tray-container-provider', (_, container: ContainerProvider) => {
      this.addContainerProviderItems(container);
    });

    ipcMain.on('update-tray-container-provider', (_, container: ContainerProvider) => {
      this.updateContainerProvider(container);
    });

    ipcMain.on('delete-tray-container-provider', (_, providerName) => {
      this.deleteContainerProvider(providerName);
    });

    // create menu first time
    this.updateMenu();
  }

  private addContainerProviderItems(cp: ContainerProvider): void {
    const providerItem: ContainerProviderMenuItem = {
      childItems: [],
      providerName: cp.providerName,
      status: cp.status,
    };

    const oldProvider = this.menuItems.get(cp.providerName);
    if (oldProvider && oldProvider.providerName === 'temp') {
      this.menuItems.delete(cp.providerName);
      providerItem.childItems.push(...oldProvider.childItems);
    }
    this.menuItems.set(cp.providerName, providerItem);
    this.updateMenu();
  }

  private updateContainerProvider(cp: ContainerProvider): void {
    const provider = this.menuItems.get(cp.providerName);
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
      label: item.providerName,
      icon: this.getStatusIcon(item.status),
      type: 'submenu',
      submenu: [],
    };

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Start',
      enabled: item.status !== 'started',
      click: () => {
        this.sendItemClick({ type: 'Start', providerName: item.providerName });
      },
    });

    (result.submenu as MenuItemConstructorOptions[]).push({
      label: 'Stop',
      enabled: item.status !== 'stopped',
      click: () => {
        this.sendItemClick({ type: 'Stop', providerName: item.providerName });
      },
    });
    (result.submenu as MenuItemConstructorOptions[]).push({ type: 'separator' });

    if(item.childItems.length > 0) {
      (result.submenu as MenuItemConstructorOptions[]).push(...item.childItems);
    }

    return result;
  }

  private getStatusIcon(status: string): string {
    return path.join(__dirname, '..', 'assets', `status-${status}.png`);
  }

  private sendItemClick(param: { type: string; providerName: string }): void {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (window) {
      window.webContents.send('tray-menu-provider-click', param);
    }
  }
}
