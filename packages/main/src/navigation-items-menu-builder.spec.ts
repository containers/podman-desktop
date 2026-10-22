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

import { NavigationItemsMenuBuilder, type ShowMessageBoxFn } from './navigation-items-menu-builder.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

let navigationItemsMenuBuilder: TestNavigationItemsMenuBuilder;

const showMessageBoxMock = vi.fn<ShowMessageBoxFn>();

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
  override buildResetNavigationBarMenuItem(): MenuItemConstructorOptions | undefined {
    return super.buildResetNavigationBarMenuItem();
  }
  override updateNavbarHiddenItem(itemName: string, visible: boolean): Promise<void> {
    return super.updateNavbarHiddenItem(itemName, visible);
  }
}

/** Stub the navbar configuration, falling back to the caller's default for unlisted keys. */
function mockConfiguration(values: Record<string, unknown>): void {
  getConfigurationMock.mockReturnValue({
    get: (key: string, defaultValue?: unknown) => (key in values ? values[key] : defaultValue),
  } as unknown as ConfigurationRegistry);
}

beforeEach(() => {
  vi.resetAllMocks();
  showMessageBoxMock.mockResolvedValue({ response: 'Hide' });
  navigationItemsMenuBuilder = new TestNavigationItemsMenuBuilder(configurationRegistryMock, showMessageBoxMock);
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
    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.disabledItems',
        [expectedDisabledName],
        'DEFAULT',
      );
    });
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

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.disabledItems',
        ['Pods'],
        'DEFAULT',
      );
    });
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.itemOrder',
      expect.anything(),
      'DEFAULT',
    );
  });
});

describe('hide confirmation', () => {
  function clickHide(itemName = 'Pods'): void {
    const menu = navigationItemsMenuBuilder.buildHideMenuItem(itemName);
    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
  }

  test('asks for confirmation through the in-app message box before the first hide', async () => {
    mockConfiguration({ disabledItems: [] });

    clickHide();

    await vi.waitFor(() => {
      expect(showMessageBoxMock).toBeCalledWith(
        expect.objectContaining({
          type: 'question',
          title: 'Hide From Navigation Bar',
          message: 'Hide "Pods" from the navigation bar?',
          buttons: ['Hide', `Don't show again`, 'Cancel'],
          cancelId: 2,
        }),
      );
    });
  });

  test('prompts with the plain name, not the Electron-escaped menu label', async () => {
    // `escapeLabel` doubles `&` so Electron renders it instead of reading it as a mnemonic;
    // the in-app dialog renders plain text and would show the doubled character verbatim
    mockConfiguration({ disabledItems: [] });

    clickHide('R&D');

    await vi.waitFor(() => expect(showMessageBoxMock).toBeCalled());
    expect(showMessageBoxMock.mock.calls[0]?.[0]?.message).toBe('Hide "R&D" from the navigation bar?');
  });

  describe('from the toggle list', () => {
    function clickToggle(name: string): void {
      const items = navigationItemsMenuBuilder.buildNavigationToggleMenuItems();
      const entry = items.find(item => item.label === name);
      expect(entry).toBeDefined();
      entry?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);
    }

    test('unchecking an item asks for confirmation just like the Hide menu entry', async () => {
      mockConfiguration({ disabledItems: [] });
      navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }]);

      clickToggle('Pods');

      await vi.waitFor(() => {
        expect(showMessageBoxMock).toBeCalledWith(
          expect.objectContaining({ message: 'Hide "Pods" from the navigation bar?' }),
        );
      });
      await vi.waitFor(() => {
        expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
          'navbar.disabledItems',
          ['Pods'],
          'DEFAULT',
        );
      });
    });

    test('cancelling leaves the item visible', async () => {
      mockConfiguration({ disabledItems: [] });
      showMessageBoxMock.mockResolvedValue({ response: 'Cancel' });
      navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }]);

      clickToggle('Pods');

      await vi.waitFor(() => expect(showMessageBoxMock).toBeCalled());
      expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
    });

    test('restoring a hidden item is not destructive and never prompts', async () => {
      mockConfiguration({ disabledItems: ['Pods'] });
      navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: false, index: 0 }]);

      clickToggle('Pods');

      await vi.waitFor(() => {
        expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
          'navbar.disabledItems',
          [],
          'DEFAULT',
        );
      });
      expect(showMessageBoxMock).not.toBeCalled();
    });

    test.each([
      { desc: 'an excluded name', items: [{ name: 'Settings', visible: true, index: 0 }], target: 'Settings' },
      { desc: 'the active item', items: [{ name: 'Pods', visible: true, index: 0, active: true }], target: 'Pods' },
    ])('never prompts for $desc, whose hide is refused anyway', async ({ items, target }) => {
      // extensions and webviews contribute names freely, so an item can land in the checklist
      // under a protected name; prompting there would ask about something that cannot happen
      mockConfiguration({ disabledItems: [] });
      showMessageBoxMock.mockResolvedValue({ response: `Don't show again` });
      navigationItemsMenuBuilder.receiveNavigationItems(items);

      clickToggle(target);

      // let anything the click started settle before asserting that nothing happened
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(showMessageBoxMock).not.toBeCalled();
      // the dismissal is global: recording it here would silence the prompt for every other item
      expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
    });
  });

  test('does not point the user at the dropped Show Hidden Items submenu', async () => {
    mockConfiguration({ disabledItems: [] });

    clickHide();

    await vi.waitFor(() => expect(showMessageBoxMock).toBeCalled());
    expect(showMessageBoxMock.mock.calls[0]?.[0]?.detail).not.toContain('Show Hidden Items');
  });

  test('hides the item when confirmed', async () => {
    mockConfiguration({ disabledItems: [] });
    showMessageBoxMock.mockResolvedValue({ response: 'Hide' });

    clickHide();

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.disabledItems',
        ['Pods'],
        'DEFAULT',
      );
    });
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.hideConfirmationDismissed',
      expect.anything(),
      'DEFAULT',
    );
  });

  test('keeps the item when cancelled', async () => {
    mockConfiguration({ disabledItems: [] });
    showMessageBoxMock.mockResolvedValue({ response: 'Cancel' });

    clickHide();

    await vi.waitFor(() => expect(showMessageBoxMock).toBeCalled());
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
  });

  // the dialog resolves to `undefined` when dismissed with Escape, and an unrecognised
  // answer must never be read as consent to hide
  test.each([
    { desc: 'dismissed with Escape', response: undefined },
    { desc: 'an unexpected answer', response: 'Something else' },
  ])('keeps the item when the dialog returns $desc', async ({ response }) => {
    mockConfiguration({ disabledItems: [] });
    showMessageBoxMock.mockResolvedValue({ response });

    clickHide();

    await vi.waitFor(() => expect(showMessageBoxMock).toBeCalled());
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
  });

  test(`hides the item and remembers the choice on "Don't show again"`, async () => {
    mockConfiguration({ disabledItems: [] });
    showMessageBoxMock.mockResolvedValue({ response: `Don't show again` });

    clickHide();

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.hideConfirmationDismissed',
        true,
        'DEFAULT',
      );
    });
    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
      'navbar.disabledItems',
      ['Pods'],
      'DEFAULT',
    );
  });

  test('skips the dialog once the user asked not to be prompted again', async () => {
    mockConfiguration({ disabledItems: [], hideConfirmationDismissed: true });

    clickHide();

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.disabledItems',
        ['Pods'],
        'DEFAULT',
      );
    });
    expect(showMessageBoxMock).not.toBeCalled();
  });
});

describe('active item protection', () => {
  beforeEach(() => {
    getConfigurationMock.mockReturnValue({ get: () => [] } as unknown as ConfigurationRegistry);
  });

  test('does not offer a hide menu item for the active item', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0, active: true },
      { name: 'Volumes', visible: true, index: 1 },
    ]);

    expect(navigationItemsMenuBuilder.buildHideMenuItem('Pods')).toBeUndefined();
    expect(navigationItemsMenuBuilder.buildHideMenuItem('Volumes')?.label).toBe('Hide Volumes');
  });

  test('protects the active item even when its label carries a counter', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0, active: true }]);

    expect(navigationItemsMenuBuilder.buildHideMenuItem('Pods (2)')).toBeUndefined();
  });

  test('protects the group containing the active item', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Kubernetes', visible: true, index: 0, active: true },
      { name: 'Pods', visible: true, index: 1 },
    ]);

    expect(navigationItemsMenuBuilder.buildHideMenuItem('Kubernetes')).toBeUndefined();
  });

  test('disables the active item in the toggle list, leaving the others enabled', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0, active: true },
      { name: 'Volumes', visible: true, index: 1 },
    ]);

    const menu = navigationItemsMenuBuilder.buildNavigationToggleMenuItems();

    expect(menu.find(item => item.label === 'Pods')?.enabled).toBe(false);
    expect(menu.find(item => item.label === 'Volumes')?.enabled).toBe(true);
  });

  test('disables an excluded name in the toggle list', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Settings', visible: true, index: 0 },
      { name: 'Volumes', visible: true, index: 1 },
    ]);

    const menu = navigationItemsMenuBuilder.buildNavigationToggleMenuItems();

    expect(menu.find(item => item.label === 'Settings')?.enabled).toBe(false);
    expect(menu.find(item => item.label === 'Volumes')?.enabled).toBe(true);
  });

  test('keeps the active item checked so it still reads as visible', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0, active: true }]);

    expect(
      navigationItemsMenuBuilder.buildNavigationToggleMenuItems().find(item => item.label === 'Pods')?.checked,
    ).toBe(true);
  });

  test('leaves a hidden item restorable even while it is the active one', () => {
    // reachable by navigating to a hidden page from a link: the toggle must not trap the user
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: false, index: 0, active: true }]);

    const podsItem = navigationItemsMenuBuilder.buildNavigationToggleMenuItems().find(item => item.label === 'Pods');
    expect(podsItem?.enabled).toBe(true);
    expect(podsItem?.checked).toBe(false);
  });

  test('updateNavbarHiddenItem refuses to hide the active item', async () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0, active: true }]);

    await navigationItemsMenuBuilder.updateNavbarHiddenItem('Pods', false);

    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
  });

  test('updateNavbarHiddenItem refuses to hide an excluded item', async () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Settings', visible: true, index: 0 }]);

    await navigationItemsMenuBuilder.updateNavbarHiddenItem('Settings', false);

    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalled();
  });

  test('updateNavbarHiddenItem still restores a protected item', async () => {
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: false, index: 0, active: true }]);

    await navigationItemsMenuBuilder.updateNavbarHiddenItem('Pods', true);

    expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.disabledItems', [], 'DEFAULT');
  });

  test('hides normally when nothing is flagged active', () => {
    navigationItemsMenuBuilder.receiveNavigationItems([
      { name: 'Pods', visible: true, index: 0 },
      { name: 'Volumes', visible: true, index: 1 },
    ]);

    expect(navigationItemsMenuBuilder.buildHideMenuItem('Pods')?.label).toBe('Hide Pods');
    expect(
      navigationItemsMenuBuilder.buildNavigationToggleMenuItems().find(item => item.label === 'Pods')?.enabled,
    ).toBe(true);
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
    // if clicking it should send the item to the configuration as being disabled,
    // once the hide confirmation has been answered
    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith(
        'navbar.disabledItems',
        // item A & A should not be escaped
        ['existing', 'A & A'],
        'DEFAULT',
      );
    });

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

describe('buildResetNavigationBarMenuItem', () => {
  test('returns undefined when nothing has been customized', () => {
    mockConfiguration({ itemOrder: [], disabledItems: [] });

    expect(navigationItemsMenuBuilder.buildResetNavigationBarMenuItem()).toBeUndefined();
  });

  test.each([
    { desc: 'only the order was changed', itemOrder: ['Pods'], disabledItems: [] },
    { desc: 'only items were hidden', itemOrder: [], disabledItems: ['Volumes'] },
    { desc: 'both were changed', itemOrder: ['Pods'], disabledItems: ['Volumes'] },
  ])('is offered when $desc', ({ itemOrder, disabledItems }) => {
    mockConfiguration({ itemOrder, disabledItems });

    expect(navigationItemsMenuBuilder.buildResetNavigationBarMenuItem()?.label).toBe('Reset Navigation Bar');
  });

  test('clicking clears both the order and the hidden items', async () => {
    mockConfiguration({ itemOrder: ['Pods'], disabledItems: ['Volumes'] });

    const menu = navigationItemsMenuBuilder.buildResetNavigationBarMenuItem();
    menu?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.itemOrder', [], 'DEFAULT');
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.disabledItems', [], 'DEFAULT');
    });
  });

  test('resetting keeps the answer to the hide confirmation, which is not part of the layout', async () => {
    mockConfiguration({ itemOrder: ['Pods'], disabledItems: [], hideConfirmationDismissed: true });

    navigationItemsMenuBuilder
      .buildResetNavigationBarMenuItem()
      ?.click?.({} as MenuItem, browserWindowMock, {} as unknown as KeyboardEvent);

    await vi.waitFor(() => {
      expect(configurationRegistryMock.updateConfigurationValue).toBeCalledWith('navbar.itemOrder', [], 'DEFAULT');
    });
    expect(configurationRegistryMock.updateConfigurationValue).not.toBeCalledWith(
      'navbar.hideConfirmationDismissed',
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

  test('Unpin appears before Reset Navigation Bar when right-clicking a pinned main-nav item', async () => {
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
    expect(menu[1]?.label).toBe('Reset Navigation Bar');
  });

  test('Reset Navigation Bar placement: before checklist on bare nav, after hide on specific item', async () => {
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
    expect(bgMenu[0]?.label).toBe('Reset Navigation Bar');
    expect(bgMenu[1]?.type).toBe('separator');

    const itemMenu = navigationItemsMenuBuilder.buildNavigationMenu({
      linkText: 'Pods',
      x: 30,
      y: 100,
    } as unknown as ContextMenuParams);
    expect(itemMenu[0]?.label).toBe('Hide Pods');
    expect(itemMenu[1]?.label).toBe('Reset Navigation Bar');
    expect(itemMenu[2]?.type).toBe('separator');

    getConfigurationMock.mockReturnValue({
      get: (key: string) => (key === 'itemOrder' ? [] : key === 'disabledItems' ? [] : 160),
    } as unknown as ConfigurationRegistry);
    navigationItemsMenuBuilder.receiveNavigationItems([{ name: 'Pods', visible: true, index: 0 }]);
    const noOrderMenu = navigationItemsMenuBuilder.buildNavigationMenu({ x: 30, y: 0 } as unknown as ContextMenuParams);
    expect(noOrderMenu.some(i => i.label === 'Reset Navigation Bar')).toBe(false);
  });
});
