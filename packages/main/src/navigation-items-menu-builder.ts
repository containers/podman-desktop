/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { ContextMenuParams, MenuItemConstructorOptions } from 'electron';

import { CONFIGURATION_DEFAULT_SCOPE } from '/@api/configuration/constants.js';

import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

// items that can't be hidden
const EXCLUDED_ITEMS = ['Accounts', 'Settings'];

// This class is responsible of creating the items to hide a given selected item of the left navigation bar
// and also display a list of all items with the ability to toggle the visibility of each item.
export class NavigationItemsMenuBuilder {
  private navigationItems: { name: string; visible: boolean }[] = [];

  constructor(private configurationRegistry: ConfigurationRegistry) {}

  receiveNavigationItems(data: { name: string; visible: boolean }[]): void {
    this.navigationItems = data;
  }

  protected async updateNavbarHiddenItem(itemName: string, visible: boolean): Promise<void> {
    // grab the disabled items, and add the new one
    const configuration = this.configurationRegistry.getConfiguration('navbar');
    let items = configuration.get<string[]>('disabledItems', []);

    if (visible) {
      items = items.filter(i => i !== itemName);
    } else if (!items.includes(itemName)) {
      items.push(itemName);
    }
    await this.configurationRegistry.updateConfigurationValue(
      'navbar.disabledItems',
      items,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }

  protected escapeLabel(label: string): string {
    return label.replace('&', '&&');
  }

  protected buildHideMenuItem(linkText: string): MenuItemConstructorOptions | undefined {
    const rawItemName = linkText;

    // need to filter any counter from the item name
    // it's at the end with parenthesis like itemName (2)
    const itemName = rawItemName.replace(/\s\(\d+\)$/, '');

    if (EXCLUDED_ITEMS.includes(itemName)) {
      return undefined;
    }

    // on electron, need to esccape the & character to show it
    const itemDisplayName = this.escapeLabel(itemName);

    const item: MenuItemConstructorOptions = {
      label: `Hide '${itemDisplayName}'`,
      visible: true,
      click: (): void => {
        // flag the item as being disabled
        this.updateNavbarHiddenItem(itemName, false).catch((e: unknown) => console.error('error disabling item', e));
      },
    };
    return item;
  }

  protected buildNavigationToggleMenuItems(): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = [];

    // add all navigation items to be able to show/hide them
    const menuForNavItems: Electron.MenuItemConstructorOptions[] = this.navigationItems.map(item => ({
      label: this.escapeLabel(item.name),
      type: 'checkbox',
      checked: item.visible,
      click: (): void => {
        // send the item to the frontend to show/hide it
        this.updateNavbarHiddenItem(item.name, !item.visible).catch((e: unknown) =>
          console.error('error disabling item', e),
        );
      },
    }));
    if (menuForNavItems.length > 0) {
      // add separator
      items.push({ type: 'separator' });
      // add all items
      items.push(...menuForNavItems);
    }

    return items;
  }

  buildNavigationMenu(parameters: ContextMenuParams): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = [];
    // allow to hide the item being selected
    if (parameters.linkText && parameters.x < 48 && parameters.y > 76) {
      const menu = this.buildHideMenuItem(parameters.linkText);
      if (menu) {
        items.push(menu);
      }
    }
    if (parameters.x < 48) {
      // add all navigation items to be able to show/hide them
      items.push(...this.buildNavigationToggleMenuItems());
    }
    return items;
  }
}
