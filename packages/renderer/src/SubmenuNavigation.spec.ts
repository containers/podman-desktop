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

import { SettingsNavItem } from '@podman-desktop/ui-svelte';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';
import { expect, test, vi } from 'vitest';

import { lastSubmenuPages } from './stores/breadcrumb';
import type { NavigationRegistryEntry } from './stores/navigation/navigation-registry';
import SubmenuNavigation from './SubmenuNavigation.svelte';

vi.mock('@podman-desktop/ui-svelte', () => ({
  SettingsNavItem: vi.fn(),
}));

test('SubmenuNavigation displays a title and builds SettingsNavItem components', async () => {
  const SettingsNavItemMock = vi.mocked(SettingsNavItem);
  render(SubmenuNavigation, {
    title: 'A title',
    items: [
      {
        tooltip: 'entry 1',
        link: '/link1',
      } as unknown as NavigationRegistryEntry,
      {
        tooltip: 'entry 2',
        link: '/link2',
      } as unknown as NavigationRegistryEntry,
    ],
    meta: {
      url: '/link1/subpath',
    } as TinroRouteMeta,
    link: '/link',
  });

  // title should be displayed
  const title = screen.getByText('A title');
  expect(title).toBeDefined();

  expect(SettingsNavItemMock).toHaveBeenCalledTimes(2);
  expect(SettingsNavItemMock).toHaveBeenNthCalledWith(1, expect.anything(), {
    title: 'entry 1',
    href: '/link1',
    selected: true,
    onClick: expect.any(Function),
  });
  expect(SettingsNavItemMock).toHaveBeenNthCalledWith(2, expect.anything(), {
    title: 'entry 2',
    href: '/link2',
    selected: false,
    onClick: expect.any(Function),
  });
});

test('set up and update lastSubmenuPages store for each submenu', async () => {
  lastSubmenuPages.set({});
  render(SubmenuNavigation, {
    title: 'page 1',
    items: [],
    meta: {
      url: '/link1/subpath',
    } as TinroRouteMeta,
    link: '/page1',
  });
  await tick();

  expect(get(lastSubmenuPages)['page 1']).toBe('/page1');
});

test('set up kubernetes nodes page as the first default kubernetes page', async () => {
  lastSubmenuPages.set({});
  render(SubmenuNavigation, {
    title: 'Kubernetes',
    items: [],
    meta: {
      url: '/link1/subpath',
    } as TinroRouteMeta,
    link: '/kubernetes',
  });
  await tick();

  expect(get(lastSubmenuPages)['Kubernetes']).toBe('/kubernetes/nodes');
});
