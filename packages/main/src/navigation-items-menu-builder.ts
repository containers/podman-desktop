/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import type { DisplayItem, MessageBoxOptions, MessageBoxReturnValue } from '@desktop-framework/api';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import { CONFIGURATION_DEFAULT_SCOPE } from '@desktop-framework/api/configuration';
import type { Configuration } from '@desktop-framework/extension-api';
import type { ContextMenuParams, MenuItemConstructorOptions } from 'electron';

import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

// items that can't be hidden
const EXCLUDED_ITEMS = ['Accounts', 'Settings'];

// buttons of the confirmation shown the first time an item is hidden
const HIDE_BUTTON = 'Hide';
const DONT_SHOW_AGAIN_BUTTON = `Don't show again`;
const CANCEL_BUTTON = 'Cancel';

/**
 * Shows the in-app message box. Electron's native dialog is deliberately not used: every
 * confirmation in Podman Desktop goes through the application's own dialog component.
 */
export type ShowMessageBoxFn = (options: MessageBoxOptions) => Promise<MessageBoxReturnValue>;

const EXPANDED_WIDTH = 160;

const GROUP_SEPARATOR = ' > ';
const isGroupedName = (name: string): boolean => name.includes(GROUP_SEPARATOR);
function leafName(name: string): string {
  const separatorIndex = name.lastIndexOf(GROUP_SEPARATOR);
  return separatorIndex === -1 ? name : name.slice(separatorIndex + GROUP_SEPARATOR.length);
}

// This class is responsible of creating the items to hide/pin a given selected item of the left navigation bar
// and also display a list of all items with the ability to toggle the visibility of each item.
export class NavigationItemsMenuBuilder {
  private navigationItems: DisplayItem[] = [];

  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private showMessageBox: ShowMessageBoxFn,
  ) {}

  receiveNavigationItems(data: DisplayItem[]): void {
    this.navigationItems = data;
  }

  protected getNavbarConfiguration(): Configuration {
    return this.configurationRegistry.getConfiguration('navbar');
  }

  protected getItemOrder(): string[] {
    return this.getNavbarConfiguration().get<string[]>('itemOrder', []);
  }

  protected async setItemOrder(order: string[]): Promise<void> {
    await this.configurationRegistry.updateConfigurationValue('navbar.itemOrder', order, CONFIGURATION_DEFAULT_SCOPE);
  }

  protected getDisabledItems(): string[] {
    return this.getNavbarConfiguration().get<string[]>('disabledItems', []);
  }

  protected async setDisabledItems(items: string[]): Promise<void> {
    await this.configurationRegistry.updateConfigurationValue(
      'navbar.disabledItems',
      items,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }

  /**
   * True when the item leads to the page currently displayed. Such an item must stay in the
   * navigation bar, otherwise the user would hide the page they are looking at and lose the
   * way back to it.
   */
  protected isActiveItem(itemName: string): boolean {
    return this.navigationItems.some(item => item.name === itemName && item.active === true);
  }

  /**
   * Items that must stay in the navigation bar: the ones the application always needs, and the
   * one leading to the page on screen. Extensions and webviews contribute names freely, so an
   * item can carry a protected name without the menu having put it there.
   */
  protected isProtectedItem(itemName: string): boolean {
    return EXCLUDED_ITEMS.includes(itemName) || this.isActiveItem(itemName);
  }

  protected async updateNavbarHiddenItem(itemName: string, visible: boolean): Promise<void> {
    // defense in depth: the menu never offers this, but never hide a protected item
    if (!visible && this.isProtectedItem(itemName)) {
      return;
    }

    let items = this.getDisabledItems();
    if (visible) {
      items = items.filter(i => i !== itemName);
    } else if (!items.includes(itemName)) {
      items.push(itemName);
    }
    await this.setDisabledItems(items);
  }

  protected isHideConfirmationDismissed(): boolean {
    return this.getNavbarConfiguration().get<boolean>('hideConfirmationDismissed', false) === true;
  }

  protected async dismissHideConfirmation(): Promise<void> {
    await this.configurationRegistry.updateConfigurationValue(
      'navbar.hideConfirmationDismissed',
      true,
      CONFIGURATION_DEFAULT_SCOPE,
    );
  }

  /**
   * Asks the user to confirm the very first hide, so the item does not just vanish with no hint
   * of how to bring it back. Answers to `Don't show again` are remembered and skip it from then on.
   *
   * @param itemName the plain item name; it is rendered by the in-app dialog and so must not be
   * run through {@link escapeLabel}, which only exists for Electron menu labels
   * @returns whether the item may be hidden
   */
  protected async confirmHide(itemName: string): Promise<boolean> {
    if (this.isHideConfirmationDismissed()) {
      return true;
    }

    const { response } = await this.showMessageBox({
      type: 'question',
      title: 'Hide From Navigation Bar',
      message: `Hide "${itemName}" from the navigation bar?`,
      detail: 'Right-click the navigation bar to show it again, or to reset the navigation bar entirely.',
      buttons: [HIDE_BUTTON, DONT_SHOW_AGAIN_BUTTON, CANCEL_BUTTON],
      defaultId: 0,
      cancelId: 2,
    });

    // allowlist: `response` is undefined when the dialog is dismissed, and anything
    // unrecognised must not be read as consent to hide
    if (response !== HIDE_BUTTON && response !== DONT_SHOW_AGAIN_BUTTON) {
      return false;
    }

    if (response === DONT_SHOW_AGAIN_BUTTON) {
      await this.dismissHideConfirmation();
    }

    return true;
  }

  /**
   * Single entry point for every visibility change the context menu offers, so the confirmation
   * cannot be bypassed by reaching for one hide path rather than the other. Restoring an item is
   * not destructive and never prompts.
   */
  protected async setItemVisibility(itemName: string, visible: boolean): Promise<void> {
    // bail out ahead of the confirmation: asking about a hide that `updateNavbarHiddenItem` will
    // refuse would let a `Don't show again` answer persist as the side effect of a no-op
    if (!visible && this.isProtectedItem(itemName)) {
      return;
    }
    if (!visible && !(await this.confirmHide(itemName))) {
      return;
    }
    await this.updateNavbarHiddenItem(itemName, visible);
  }

  /** True when the item is currently present in the main nav (has an index / is in itemOrder). */
  protected isPinnedToNav(item: DisplayItem): boolean {
    if (item.index !== undefined) {
      return true;
    }
    return this.getItemOrder().includes(item.name);
  }

  protected async pinItemToNav(item: DisplayItem): Promise<void> {
    let order = this.getItemOrder();
    if (order.includes(item.name)) {
      return;
    }
    // Materialize current default order (top-level indexed items) before inserting.
    if (order.length === 0) {
      order = this.navigationItems
        .filter(i => !isGroupedName(i.name) && i.index !== undefined)
        .toSorted((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map(i => i.name);
    }
    await this.setItemOrder([item.name, ...order]);
  }

  protected async unpinItemFromNav(item: DisplayItem): Promise<void> {
    await this.setItemOrder(this.getItemOrder().filter(i => i !== item.name));
  }

  protected escapeLabel(label: string): string {
    return label.replace('&', '&&');
  }

  protected computeItemName(rawItemName: string): string {
    // need to filter any counter from the item name
    // it's at the end with parenthesis like itemName (2)
    const itemName = rawItemName.replace(/\s\(\d+\)$/, '');

    // Electron sends the whole element text including sub elements, each level separated by '\n'
    return itemName.split('\n')[0] ?? itemName;
  }

  protected buildHideMenuItem(linkText: string): MenuItemConstructorOptions | undefined {
    const rawItemName = linkText;

    // need to filter any counter from the item name
    // it's at the end with parenthesis like itemName (2)
    const itemName = this.computeItemName(rawItemName);

    if (isGroupedName(itemName) || this.isProtectedItem(itemName)) {
      return undefined;
    }

    // on electron, need to esccape the & character to show it
    const itemDisplayName = this.escapeLabel(itemName);

    const item: MenuItemConstructorOptions = {
      label: `Hide ${itemDisplayName}`,
      visible: true,
      click: (): void => {
        this.setItemVisibility(itemName, false).catch((e: unknown) => console.error('error disabling item', e));
      },
    };
    return item;
  }

  /**
   * Match a settings/submenu child by linkText.
   * Prefixed names ("Kubernetes > Pods") always match exactly.
   * Leaf-only text ("Pods", "Resources") is only used outside the main nav
   * (settings/submenu sidebars) so top-level "Pods" / "Kubernetes" are not
   * mistaken for "Kubernetes > Pods".
   */
  protected findGroupedItemByLinkText(linkText: string, allowLeafMatch: boolean): DisplayItem | undefined {
    const itemName = this.computeItemName(linkText);
    const exact = this.navigationItems.find(item => isGroupedName(item.name) && item.name === itemName);
    if (exact) {
      return exact;
    }
    if (!allowLeafMatch || isGroupedName(itemName)) {
      return undefined;
    }
    return this.navigationItems.find(item => isGroupedName(item.name) && leafName(item.name) === itemName);
  }

  /** Pin / Unpin for a promoted (Settings/submenu) item matched by linkText. */
  protected buildGroupedPinMenuItem(
    linkText: string | undefined,
    allowLeafMatch = true,
  ): MenuItemConstructorOptions | undefined {
    if (!linkText) {
      return undefined;
    }
    const item = this.findGroupedItemByLinkText(linkText, allowLeafMatch);
    if (!item) {
      return undefined;
    }

    const pinned = this.isPinnedToNav(item);
    const itemDisplayName = this.escapeLabel(leafName(item.name));

    return {
      label: pinned ? `Unpin ${itemDisplayName}` : `Pin ${itemDisplayName} to Navigation`,
      visible: true,
      click: (): void => {
        const action = pinned ? this.unpinItemFromNav(item) : this.pinItemToNav(item);
        action.catch((e: unknown) => console.error('error updating pinned navigation item', e));
      },
    };
  }

  protected buildNavigationToggleMenuItems(): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = [];

    // add all navigation items to be able to show/hide them
    const hideableItems = this.navigationItems.filter(item => !isGroupedName(item.name));

    const menuForNavItems: Electron.MenuItemConstructorOptions[] = hideableItems.map(item => ({
      label: this.escapeLabel(item.name),
      type: 'checkbox',
      checked: item.visible,
      // a protected item cannot be unchecked; a hidden one stays restorable even while protected
      enabled: !(item.visible && this.isProtectedItem(item.name)),
      click: (): void => {
        // send the item to the frontend to show/hide it
        this.setItemVisibility(item.name, !item.visible).catch((e: unknown) =>
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

  /**
   * A single entry restoring the navigation bar to its defaults. Order and visibility used to be
   * two separate entries, which made the user guess which of them held the customization they
   * wanted gone; one entry covering both is what "reset" means to them.
   *
   * Offered only when something was actually customized, so the menu stays empty-handed otherwise.
   */
  protected buildResetNavigationBarMenuItem(): MenuItemConstructorOptions | undefined {
    if (this.getItemOrder().length === 0 && this.getDisabledItems().length === 0) {
      return undefined;
    }
    return {
      label: 'Reset Navigation Bar',
      visible: true,
      click: (): void => {
        this.resetNavigationBar().catch((e: unknown) => console.error('error resetting the navigation bar', e));
      },
    };
  }

  protected async resetNavigationBar(): Promise<void> {
    // the `don't ask again` answer is a preference about being prompted, not part of the
    // navigation bar layout, so it deliberately survives a reset
    await this.setItemOrder([]);
    await this.setDisabledItems([]);
  }

  protected getNavWidth(): number {
    const configuration = this.configurationRegistry.getConfiguration(AppearanceSettings.SectionName);
    return configuration.get<number>(AppearanceSettings.NavigationBarWidth, EXPANDED_WIDTH);
  }

  buildNavigationMenu(parameters: ContextMenuParams): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = [];
    const navWidth = this.getNavWidth();
    const inMainNav = parameters.x < navWidth;

    // Pin/Unpin: leaf names only from settings/submenu sidebars; main nav needs the prefixed name.
    const pinMenu = this.buildGroupedPinMenuItem(parameters.linkText, !inMainNav);
    if (pinMenu) {
      items.push(pinMenu);
    } else if (parameters.linkText && inMainNav && parameters.y > 76) {
      // allow to hide the top-level item being selected
      const menu = this.buildHideMenuItem(parameters.linkText);
      if (menu) {
        items.push(menu);
      }
    }
    if (inMainNav) {
      const resetMenu = this.buildResetNavigationBarMenuItem();
      if (resetMenu) {
        items.push(resetMenu);
      }
      items.push(...this.buildNavigationToggleMenuItems());
    }
    return items;
  }
}
