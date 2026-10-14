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

import type { DisplayItem } from '@desktop-framework/api';
import type { BrowserWindow, ContextMenuParams, MenuItem, MenuItemConstructorOptions } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { NavigationItemsMenuBuilder } from './navigation-items-menu-builder.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

let navigationItemsMenuBuilder: TestNavigationItemsMenuBuilder;

const getConfigurationMock = vi.fn();
const configurationRegistryMock = {
  getConfiguration: getConfigurationMock,
  updateConfigurationValue: vi.fn(),
} as unknown as ConfigurationRegistry;

const browserWindowMock = {
  webContents: {},
} as unknown as BrowserWindow;

class TestNavigationItemsMenuBuilder extends NavigationItemsMenuBuilder {
  override buildHideMenuItem(linkText: string): MenuItemConstructorOptions | undefined {
    return super.buildHideMenuItem(linkText);
  }
  override buildGroupedPinMenuItem(
    linkText: string | undefined,
    allowLeafMatch = true,
  ): MenuItemConstructorOptions | undefined {
    return super.buildGroupedPinMenuItem(linkText, allowLeafMatch);
  }
  override buildNavigationToggleMenuItems(): MenuItemConstructorOptions[] {
    return super.buildNavigationToggleMenuItems();
  }
  override buildResetOrderMenuItem(): MenuItemConstructorOptions | undefined {
    return super.buildResetOrderMenuItem();
  }
  override buildShowAllMenuItem(): MenuItemConstructorOptions | undefined {
    return super.buildShowAllMenuItem();
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  navigationItemsMenuBuilder = new TestNavigationItemsMenuBuilder(configurationRegistryMock);
});

describe('buildHideMenuItem', async () => {
  test.each([
    { desc: 'plain item', input: 'Hello', expectedLabel: 'Hide Hello', expectedDisabledName: 'Hello' },
    { desc: 'item with line feed', input: 'Hello\nHallo', expectedLabel: 'Hide Hello', expectedDisabledName: 'Hello' },
  ])('builds hide item and clicking disables it ($desc)', async ({ input, expectedLabel, expectedDisabledName }) => {
    getConfigurationMock.mockReturnValue({ get: () => [] } as unknown as ConfigurationRegistry);

    const menu = navigationItemsMenuBuilder.buildHideMenuItem(input);
    expect(menu?.label).toBe(expectedLabel);
    expect(menu?.click).toBeDefined();
    expect(menu?.visible).toBe(true);

    // click on the menu
    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    expect(getConfigurationMock).toBeCalled();
    // if clicking it should send the item to the configuration as being disabled
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.disabledItems',
      [expectedDisabledName],
      'DEFAULT',
    );
  });

  test('should not create a menu item if in excluded list', async () => {
    getConfigurationMock.mockReturnValue({ get: () => [] } as unknown as ConfigurationRegistry);

    const menu = navigationItemsMenuBuilder.buildHideMenuItem('Accounts');
    expect(menu).toBeUndefined();
  });

  test('should not create a hide menu item for grouped (pinned) names', async () => {
    getConfigurationMock.mockReturnValue({ get: () => [] } as unknown as ConfigurationRegistry);
    expect(navigationItemsMenuBuilder.buildHideMenuItem('Settings > Resources')).toBeUndefined();
  });

  test('hiding a top-level item does not touch navbar.itemOrder', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? ['Pods', 'Volumes'] : []),
    } as unknown as ConfigurationRegistry);

    const menu = navigationItemsMenuBuilder.buildHideMenuItem('Pods');
    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.disabledItems',
      ['Pods'],
      'DEFAULT',
    );
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.itemOrder',
      expect.anything(),
      'DEFAULT',
    );
  });
});

describe('buildGroupedPinMenuItem', () => {
  const resources: DisplayItem = {
    name: 'Settings > Resources',
    visible: true,
  };
  const pinnedResources: DisplayItem = { ...resources, index: 0 };

  test('offers Pin to Navigation for an unpinned settings item via linkText', () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? [] : 160),
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }, resources]);

    const menu = navigationItemsMenuBuilder.buildGroupedPinMenuItem('Resources');
    expect(menu?.label).toBe('Pin Resources to Navigation');

    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.itemOrder',
      ['Settings > Resources', 'Pods'],
      'DEFAULT',
    );
  });

  test('offers Unpin for a pinned main-nav item via linkText', () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? ['Settings > Resources', 'Pods'] : 160),
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([pinnedResources, { name: 'Pods', visible: true, index: 1 }]);

    const menu = navigationItemsMenuBuilder.buildGroupedPinMenuItem('Settings > Resources');
    expect(menu?.label).toBe('Unpin Resources');

    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.itemOrder', ['Pods'], 'DEFAULT');
  });

  test('returns undefined for top-level (non-grouped) items', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }]);
    expect(navigationItemsMenuBuilder.buildGroupedPinMenuItem('Pods')).toBeUndefined();
  });

  test('leaf match is disabled so main-nav Pods is not confused with Kubernetes > Pods', () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? [] : 160),
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0 },
      { name: 'Kubernetes', visible: true, index: 1 },
      { name: 'Kubernetes > Pods', visible: true },
    ]);

    expect(navigationItemsMenuBuilder.buildGroupedPinMenuItem('Pods', false)).toBeUndefined();
    expect(navigationItemsMenuBuilder.buildGroupedPinMenuItem('Kubernetes', false)).toBeUndefined();
    expect(navigationItemsMenuBuilder.buildGroupedPinMenuItem('Pods', true)?.label).toBe('Pin Pods to Navigation');
    expect(navigationItemsMenuBuilder.buildGroupedPinMenuItem('Kubernetes > Pods', false)?.label).toBe(
      'Pin Pods to Navigation',
    );
  });
});

describe('buildNavigationToggleMenuItems', async () => {
  test('build navigation toggle menu items', async () => {
    getConfigurationMock.mockReturnValue({ get: () => ['existing'] } as unknown as ConfigurationRegistry);

    // send 3 items, two being visible, one being hidden
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'A & A', visible: true, index: 0 },
      { name: 'B', visible: false, index: 1 },
      { name: 'C', visible: true, index: 2 },
      { name: 'Kubernetes > Pods', visible: true, index: 3 },
    ]);

    const menu = navigationItemsMenuBuilder.buildNavigationToggleMenuItems();

    // 4 items (first one being a separator)
    expect(menu.length).toBe(4);
    // check the first item is a separator
    expect(menu[0]?.type).toBe('separator');
    // label should be escaped as we have an &
    expect(menu[1]?.label).toBe('A && A');
    expect(menu[1]?.checked).toBe(true);
    expect(menu[2]?.label).toBe('B');
    expect(menu[2]?.checked).toBe(false);
    expect(menu[3]?.label).toBe('C');
    expect(menu[3]?.checked).toBe(true);

    // click on the A item
    menu[1]?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    expect(getConfigurationMock).toBeCalled();
    // if clicking it should send the item to the configuration as being disabled
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.disabledItems',
      // item A & A should not be escaped
      ['existing', 'A & A'],
      'DEFAULT',
    );

    // reset the calls
    vi.mocked(configurationRegistryMock.updateConfigurationValue).mockClear();

    // click on the B item should unhide it so disabled items should be empty
    menu[2]?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.disabledItems',
      ['existing'],
      'DEFAULT',
    );
  });

  test('unhiding (showing) an item does not touch navbar.itemOrder', async () => {
    getConfigurationMock.mockReturnValue({ get: () => ['Pods'] } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: false, index: 0 }]);

    const menu = navigationItemsMenuBuilder.buildNavigationToggleMenuItems();
    menu.find(i => i.label === 'Pods')?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.disabledItems', [], 'DEFAULT');
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.itemOrder',
      expect.anything(),
      'DEFAULT',
    );
  });
});

describe('buildResetOrderMenuItem', async () => {
  test('returns undefined when itemOrder is empty, returns a "Reset Order" item otherwise', async () => {
    getConfigurationMock.mockReturnValue({ get: () => [] } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0 },
      { name: 'Volumes', visible: true, index: 1 },
    ]);
    expect(navigationItemsMenuBuilder.buildResetOrderMenuItem()).toBeUndefined();

    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? ['Pods'] : []),
    } as unknown as ConfigurationRegistry);
    const menu = navigationItemsMenuBuilder.buildResetOrderMenuItem();
    expect(menu?.label).toBe('Reset Order');

    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.itemOrder', [], 'DEFAULT');
  });
});

describe('buildShowAllMenuItem', () => {
  test('returns undefined when nothing is hidden', () => {
    getConfigurationMock.mockReturnValue({
      get: () => [],
    } as unknown as ConfigurationRegistry);
    expect(navigationItemsMenuBuilder.buildShowAllMenuItem()).toBeUndefined();
  });

  test('clears disabledItems and does not touch itemOrder', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'disabledItems' ? ['Pods', 'Volumes'] : key === 'itemOrder' ? ['Pods'] : []),
    } as unknown as ConfigurationRegistry);

    const menu = navigationItemsMenuBuilder.buildShowAllMenuItem();
    expect(menu?.label).toBe('Show All');

    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.disabledItems', [], 'DEFAULT');
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.itemOrder',
      expect.anything(),
      'DEFAULT',
    );
  });
});

describe('buildNavigationMenu', async () => {
  test.each([
    { desc: 'no linkText', params: {} },
    { desc: 'outside range of navbar', params: { linkText: 'outside', x: 200, y: 0 } },
  ])('returns empty array when $desc', async ({ params }) => {
    getConfigurationMock.mockReturnValue({ get: () => 160 });
    navigationItemsMenuBuilder.receiveNavigationItems([]);
    const parameters = params as unknown as ContextMenuParams;

    const menu = navigationItemsMenuBuilder.buildNavigationMenu(parameters);

    expect(menu).toStrictEqual([]);
  });

  test('should build hide menu if inside range of navbar', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => {
        if (key === 'itemOrder') return [];
        if (key === 'disabledItems') return [];
        return 160;
      },
    } as unknown as ConfigurationRegistry);
    const hideMenuItem = { label: 'hide' } as MenuItemConstructorOptions;
    const hideSpyMock = vi.spyOn(navigationItemsMenuBuilder, 'buildHideMenuItem');
    hideSpyMock.mockReturnValue(hideMenuItem);
    const parameters = {
      linkText: 'inside',
      x: 30,
      y: 100,
    } as unknown as ContextMenuParams;

    const menu = navigationItemsMenuBuilder.buildNavigationMenu(parameters);

    expect(menu.length).toBe(1);
    expect(menu[0]).toBe(hideMenuItem);
    expect(hideSpyMock).toBeCalledWith('inside');
  });

  test('main-nav leaf names like Pods get Hide, not Pin for Kubernetes > Pods', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => {
        if (key === 'itemOrder') return [];
        if (key === 'disabledItems') return [];
        return 160;
      },
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0 },
      { name: 'Kubernetes > Pods', visible: true },
    ]);

    const menu = navigationItemsMenuBuilder.buildNavigationMenu({
      linkText: 'Pods',
      x: 30,
      y: 100,
    } as unknown as ContextMenuParams);

    expect(menu[0]?.label).toBe('Hide Pods');
    expect(menu.some(i => i.label?.includes('Pin'))).toBe(false);
  });

  test('Unpin appears before Reset Order when right-clicking a pinned main-nav item', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => {
        if (key === 'itemOrder') return ['Settings > Resources', 'Pods'];
        if (key === 'disabledItems') return [];
        return 160;
      },
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Settings > Resources', visible: true, index: 0 },
      { name: 'Pods', visible: true, index: 1 },
    ]);

    const menu = navigationItemsMenuBuilder.buildNavigationMenu({
      linkText: 'Settings > Resources',
      x: 30,
      y: 100,
    } as unknown as ContextMenuParams);

    expect(menu[0]?.label).toBe('Unpin Resources');
    expect(menu[1]?.label).toBe('Reset Order');
  });

  test('Reset Order and Show All placement: before checklist on bare nav, after hide on specific item', async () => {
    getConfigurationMock.mockReturnValue({
      get: (key: string) => {
        if (key === 'itemOrder') return ['Pods'];
        if (key === 'disabledItems') return ['Volumes'];
        return 160;
      },
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0 },
      { name: 'Volumes', visible: false, index: 1 },
    ]);

    const bgMenu = navigationItemsMenuBuilder.buildNavigationMenu({ x: 30, y: 0 } as unknown as ContextMenuParams);
    expect(bgMenu[0]?.label).toBe('Reset Order');
    expect(bgMenu[1]?.label).toBe('Show All');
    expect(bgMenu[2]?.type).toBe('separator');

    const itemMenu = navigationItemsMenuBuilder.buildNavigationMenu({
      linkText: 'Pods',
      x: 30,
      y: 100,
    } as unknown as ContextMenuParams);
    expect(itemMenu[0]?.label).toBe('Hide Pods');
    expect(itemMenu[1]?.label).toBe('Reset Order');
    expect(itemMenu[2]?.label).toBe('Show All');
    expect(itemMenu[3]?.type).toBe('separator');

    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? [] : key === 'disabledItems' ? [] : 160),
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }]);
    const noOrderMenu = navigationItemsMenuBuilder.buildNavigationMenu({ x: 30, y: 0 } as unknown as ContextMenuParams);
    expect(noOrderMenu.some(i => i.label === 'Reset Order')).toBe(false);
    expect(noOrderMenu.some(i => i.label === 'Show All')).toBe(false);
  });
});
