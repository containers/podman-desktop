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

import type { DisplayItem } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';

import {
  fetchNavigationRegistries,
  findActiveItems,
  navigationRegistry,
  type NavigationRegistryEntry,
} from './navigation-registry';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getKubernetesPortForwards).mockResolvedValue([]);
});

test('check navigation registry items', async () => {
  vi.mocked(window.kubernetesRegisterGetCurrentContextResources).mockResolvedValue([]);
  vi.mocked(window.kubernetesGetCurrentContextGeneralState).mockResolvedValue({
    reachable: true,
    resources: { pods: 0, deployments: 0 },
  });
  await fetchNavigationRegistries();
  const registries = get(navigationRegistry);
  // expect 8 items in the registry
  expect(registries.length).equal(8);
});

test('check update properties', async () => {
  // first, check that all items are visible
  const items = get(navigationRegistry);
  items.forEach(item => {
    expect(item.hidden).toBeFalsy();
  });

  // Say that Containers and Pods are hidden by the configuration
  vi.mocked(window.getConfigurationValue).mockResolvedValue(['Containers', 'Pods']);

  // do an update to force the update
  configurationProperties.set([]);

  // wait that the update is done asynchronously
  await new Promise(resolve => setTimeout(resolve, 500));

  // and now check the hidden values
  const hidden = get(navigationRegistry);

  const allItemsExceptContainersAndPods = hidden.filter(item => item.name !== 'Containers' && item.name !== 'Pods');
  allItemsExceptContainersAndPods.forEach(item => {
    expect(item.hidden).toBeFalsy();
  });

  const containersAndPods = hidden.filter(item => item.name === 'Containers' || item.name === 'Pods');
  containersAndPods.forEach(item => {
    expect(item.hidden).toBeTruthy();
  });
});

describe('findActiveItems', () => {
  function entry(name: string, link: string, extra: Partial<NavigationRegistryEntry> = {}): NavigationRegistryEntry {
    return { name, link, icon: {}, tooltip: name, counter: 0, destinations: [], type: 'entry', ...extra };
  }

  const entries: NavigationRegistryEntry[] = [entry('Pods', '/pods'), entry('Volumes', '/volumes')];

  test('marks the entry matching the route', () => {
    expect([...findActiveItems(entries, '/pods')]).toEqual(['Pods']);
  });

  test('marks the entry when on one of its child routes', () => {
    expect([...findActiveItems(entries, '/pods/podman/foo')]).toEqual(['Pods']);
  });

  test('marks nothing when no entry matches', () => {
    expect([...findActiveItems(entries, '/unknown')]).toEqual([]);
  });

  test('marks a group as active when one of its children is, so it cannot be hidden either', () => {
    const grouped = [
      entry('Kubernetes', '/kubernetes', {
        type: 'group',
        items: [entry('Nodes', '/kubernetes/nodes'), entry('Services', '/kubernetes/services')],
      }),
      entry('Pods', '/pods'),
    ];

    expect(findActiveItems(grouped, '/kubernetes/nodes')).toEqual(new Set(['Nodes', 'Kubernetes']));
  });

  test('matches the navigation bar highlight for the root route', () => {
    // the main Dashboard is rendered outside the registry, so '/' marks no registry entry
    expect([...findActiveItems(entries, '/')]).toEqual([]);
  });
});

describe('active item tracking', () => {
  beforeEach(async () => {
    vi.mocked(window.kubernetesRegisterGetCurrentContextResources).mockResolvedValue([]);
    vi.mocked(window.kubernetesGetCurrentContextGeneralState).mockResolvedValue({
      reachable: true,
      resources: { pods: 0, deployments: 0 },
    });
    await fetchNavigationRegistries();
  });

  function lastSentItems(): DisplayItem[] {
    const call = vi.mocked(window.sendNavigationItems).mock.lastCall;
    expect(call).toBeDefined();
    return call?.[0] ?? [];
  }

  test('derives the active item from the tinro router rather than window.location', async () => {
    // production runs tinro in memory mode (see App.svelte), so window.location never
    // reflects the route — reading it would protect nothing at all
    router.mode.memory();
    vi.mocked(window.sendNavigationItems).mockClear();

    router.goto('/pods');

    await vi.waitFor(() => {
      expect(lastSentItems().find(item => item.name === 'Pods')?.active).toBe(true);
    });

    expect(lastSentItems().find(item => item.name === 'Containers')?.active).toBe(false);
    expect(window.location.pathname).not.toBe('/pods');
  });

  test('re-sends the items when navigating, so the protected item follows the route', async () => {
    router.mode.memory();
    router.goto('/pods');
    await vi.waitFor(() => {
      expect(lastSentItems().find(item => item.name === 'Pods')?.active).toBe(true);
    });

    router.goto('/containers');

    await vi.waitFor(() => {
      expect(lastSentItems().find(item => item.name === 'Containers')?.active).toBe(true);
    });
    expect(lastSentItems().find(item => item.name === 'Pods')?.active).toBe(false);
  });

  test('does not send again while the active item is unchanged', async () => {
    router.mode.memory();
    router.goto('/pods');
    await vi.waitFor(() => {
      expect(lastSentItems().find(item => item.name === 'Pods')?.active).toBe(true);
    });

    vi.mocked(window.sendNavigationItems).mockClear();
    // a child route of the same entry keeps Pods active
    router.goto('/pods/podman/foo');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(window.sendNavigationItems).not.toHaveBeenCalled();
  });
});
