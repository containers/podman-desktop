/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { ExtensionInfo, NavigationHistoryPushInfo } from '@desktop-framework/api';
import { writable } from 'svelte/store';
import { router, type TinroRoute } from 'tinro';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { extensionInfos } from '/@/stores/extensions';
import * as kubernetesNoCurrentContext from '/@/stores/kubernetes-no-current-context';
import { navigationRegistry, type NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';
import {
  getBackEntries,
  getForwardEntries,
  goBack,
  goForward,
  goToHistoryIndex,
  navigationHistory,
  replaceCurrentUrl,
} from '/@/stores/navigation-history.svelte';

// The store registers a `window.events.receive('navigation-history-push', ...)` listener at
// module-load time, so `window.events` must be patched before the module is first imported.
const { eventsReceiveMock } = vi.hoisted(() => {
  const eventsReceiveMock = vi.fn();
  Object.defineProperty(window, 'events', {
    value: { receive: eventsReceiveMock },
    configurable: true,
  });
  return { eventsReceiveMock };
});

let routerSubscribeCallback = vi.hoisted(() => {
  return vi.fn() as unknown as (navigation: TinroRoute) => void;
});

vi.mock(import('tinro'));

vi.mock(import('/@/stores/kubernetes-no-current-context'));
vi.mock(import('/@/stores/navigation/navigation-registry'));

vi.mock(import('/@/PreferencesNavigation'), () => ({
  settingsNavigationEntries: [],
}));

vi.mock(import('/@/stores/navigation/navigation-registry'), async () => {
  return {
    navigationRegistry: {
      subscribe: vi.fn((listener: (value: NavigationRegistryEntry[]) => void) => {
        listener([
          {
            name: 'Kubernetes',
            icon: {},
            link: '/kubernetes',
            tooltip: 'Kubernetes',
            counter: 0,
            type: 'submenu',
            items: [
              {
                name: 'Pods',
                icon: {},
                link: '/kubernetes/pods',
                tooltip: 'Pods',
                counter: 0,
                type: 'entry',
              },
              {
                name: 'ConfigMaps & Secrets',
                icon: {},
                link: '/kubernetes/configmapsSecrets',
                tooltip: 'ConfigMaps & Secrets',
                counter: 0,
                type: 'entry',
              },
            ],
          },
          {
            name: 'Containers',
            icon: {},
            link: '/containers',
            tooltip: 'Containers',
            counter: 0,
            type: 'entry',
          },
        ] as NavigationRegistryEntry[]);
        return vi.fn();
      }),
      set: vi.fn(),
      update: vi.fn(),
      unsubscribe: vi.fn(),
    },
  };
});

// Captured once: the listener the store registered via `window.events.receive('navigation-history-push', ...)`
let navigationHistoryPushCallback: (entry: NavigationHistoryPushInfo) => void;

beforeAll(() => {
  expect(router.subscribe).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
  routerSubscribeCallback = vi.mocked(router.subscribe).mock.calls[0][0];

  const pushCall = eventsReceiveMock.mock.calls.find(call => call[0] === 'navigation-history-push');
  expect(pushCall).toBeDefined();
  navigationHistoryPushCallback = pushCall?.[1] as (entry: NavigationHistoryPushInfo) => void;
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.telemetryTrack).mockResolvedValue(undefined);
  vi.mocked(window.navigateToExtensionHistoryEntry).mockResolvedValue(undefined);
  vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(true);
  extensionInfos.set([]);

  vi.mocked(navigationRegistry).set([
    { type: 'root', link: '/', title: 'Dashboard' } as unknown as NavigationRegistryEntry,
    { type: 'submenu', link: '/kubernetes', title: 'Kubernetes' } as unknown as NavigationRegistryEntry,
    {
      title: 'Kubernetes Dashboard',
      link: '/kubernetes/dashboard',
      type: 'entry',
    } as unknown as NavigationRegistryEntry,
  ]);

  // Reset navigation history state
  navigationHistory.stack = [];
  navigationHistory.index = -1;
});

describe('goBack', () => {
  beforeEach(() => {
    vi.spyOn(router, 'goto').mockReturnValue(undefined);
  });

  test('should not navigate when history is empty', () => {
    goBack();

    expect(router.goto).not.toHaveBeenCalled();
    expect(window.telemetryTrack).not.toHaveBeenCalled();
  });

  test('should not navigate when at first entry', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    goBack();

    expect(router.goto).not.toHaveBeenCalled();
    expect(window.telemetryTrack).not.toHaveBeenCalled();
  });

  test('should navigate to previous entry', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }];
    navigationHistory.index = 1;

    goBack();

    expect(navigationHistory.index).toBe(0);
    expect(router.goto).toHaveBeenCalledWith('/containers');
    expect(window.telemetryTrack).toHaveBeenCalledWith('navigation.back');
  });
});

describe('goForward', () => {
  beforeEach(() => {
    vi.spyOn(router, 'goto').mockReturnValue(undefined);
  });

  test('should not navigate when history is empty', () => {
    goForward();

    expect(router.goto).not.toHaveBeenCalled();
    expect(window.telemetryTrack).not.toHaveBeenCalled();
  });

  test('should not navigate when at last entry', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    goForward();

    expect(router.goto).not.toHaveBeenCalled();
    expect(window.telemetryTrack).not.toHaveBeenCalled();
  });

  test('should navigate to next entry', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }];
    navigationHistory.index = 0;

    goForward();

    expect(navigationHistory.index).toBe(1);
    expect(router.goto).toHaveBeenCalledWith('/images');
    expect(window.telemetryTrack).toHaveBeenCalledWith('navigation.forward');
  });
});

describe('replaceCurrentUrl', () => {
  beforeEach(() => {
    vi.spyOn(router, 'goto').mockReturnValue(undefined);
  });

  test('should replace current entry and navigate', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/containers/abc123/' }];
    navigationHistory.index = 1;

    replaceCurrentUrl('/containers/abc123/tty');
    routerSubscribeCallback({ url: '/containers/abc123/tty' } as TinroRoute);

    expect(navigationHistory.stack).toEqual([{ url: '/containers' }, { url: '/containers/abc123/tty' }]);
    expect(navigationHistory.index).toBe(1);
    expect(router.goto).toHaveBeenCalledWith('/containers/abc123/tty');
  });

  test('should not push a new entry when router subscription fires after replace', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/containers/abc123/' }];
    navigationHistory.index = 1;

    replaceCurrentUrl('/containers/abc123/tty');

    // Simulate router subscription firing for the replaced URL
    routerSubscribeCallback({ url: '/containers/abc123/tty' } as TinroRoute);

    // Stack should still have only 2 entries — the subscription must skip the push
    expect(navigationHistory.stack).toEqual([{ url: '/containers' }, { url: '/containers/abc123/tty' }]);
    expect(navigationHistory.index).toBe(1);
  });

  test('going back after replace should skip the redirect URL', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/containers/abc123/' }];
    navigationHistory.index = 1;

    replaceCurrentUrl('/containers/abc123/tty');
    routerSubscribeCallback({ url: '/containers/abc123/tty' } as TinroRoute);

    // Now go back — should land on /containers, not on /containers/abc123/
    goBack();
    routerSubscribeCallback({ url: '/containers' } as TinroRoute);

    expect(navigationHistory.index).toBe(0);
    expect(router.goto).toHaveBeenLastCalledWith('/containers');
  });

  test('should handle replace when stack is empty', () => {
    navigationHistory.stack = [];
    navigationHistory.index = -1;

    replaceCurrentUrl('/containers/abc123/tty');
    routerSubscribeCallback({ url: '/containers/abc123/tty' } as TinroRoute);

    // When stack is empty, nothing is replaced — the URL is pushed normally by the subscription
    expect(navigationHistory.stack).toEqual([{ url: '/containers/abc123/tty' }]);
    expect(navigationHistory.index).toBe(0);
    expect(router.goto).toHaveBeenCalledWith('/containers/abc123/tty');
  });

  test('should not preserve extensionEntry when replacing', () => {
    const extensionEntry = { extensionId: 'ext.a', id: 'entry-1', label: 'Entry 1' };
    navigationHistory.stack = [{ url: '/__extension__/ext.a/entry-1', extensionEntry }];
    navigationHistory.index = 0;

    replaceCurrentUrl('/containers/abc123/tty');
    routerSubscribeCallback({ url: '/containers/abc123/tty' } as TinroRoute);

    expect(navigationHistory.stack[0]).toEqual({ url: '/containers/abc123/tty' });
    expect(navigationHistory.stack[0].extensionEntry).toBeUndefined();
  });

  test('should no-op when replacement URL matches the current entry', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/containers/abc123/tty' }];
    navigationHistory.index = 1;

    replaceCurrentUrl('/containers/abc123/tty');

    expect(navigationHistory.stack).toEqual([{ url: '/containers' }, { url: '/containers/abc123/tty' }]);
    expect(navigationHistory.index).toBe(1);
    expect(router.goto).not.toHaveBeenCalled();
  });
});

describe('kubernetes dashboard submenu', () => {
  test('/kubernetes submenu base route should NOT be added to history stack when kubernetes context exists', () => {
    // When cluster exists (kubernetesNoCurrentContext = false)
    // /kubernetes route should be skipped because it redirects to /kubernetes/dashboard
    vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(false);

    routerSubscribeCallback({ url: '/' } as TinroRoute);
    routerSubscribeCallback({ url: '/kubernetes' } as TinroRoute);
    // Simulate redirect to /kubernetes/dashboard
    routerSubscribeCallback({ url: '/kubernetes/dashboard' } as TinroRoute);

    // Stack should contain / and /kubernetes/dashboard, but NOT /kubernetes
    expect(navigationHistory.stack).toEqual([{ url: '/' }, { url: '/kubernetes/dashboard' }]);
    expect(navigationHistory.index).toBe(1);
  });

  test('/kubernetes submenu base route SHOULD be added to history stack when kubernetes context does NOT exist', () => {
    // When no cluster exists (kubernetesNoCurrentContext = true)
    // /kubernetes route should be added because user stays on the empty page
    vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(true);

    routerSubscribeCallback({ url: '/' } as TinroRoute);
    routerSubscribeCallback({ url: '/kubernetes' } as TinroRoute);

    // Stack should contain both / and /kubernetes
    expect(navigationHistory.stack).toEqual([{ url: '/' }, { url: '/kubernetes' }]);
    expect(navigationHistory.index).toBe(1);
  });
});

describe('router navigation events', () => {
  test('should not store index.html in the history stack', () => {
    // Simulate navigation: /index.html -> / when starting the app in production mode
    // The /index.html route should not be stored in the navigation history
    routerSubscribeCallback({ url: '/index.html' } as TinroRoute);
    routerSubscribeCallback({ url: '/' } as TinroRoute);

    expect(navigationHistory.stack).not.toContainEqual({ url: '/index.html' });
    expect(navigationHistory.stack).toContainEqual({ url: '/' });
    expect(navigationHistory.index).toBe(0);
  });

  test('should not store /webviews/ URLs in the history stack', () => {
    // Extensions with their own history providers push their own entries via
    // navigation.pushHistoryEntry; the router-level /webviews/ URL change should be ignored.
    routerSubscribeCallback({ url: '/' } as TinroRoute);
    routerSubscribeCallback({ url: '/webviews/my-webview-id' } as TinroRoute);

    expect(navigationHistory.stack).toEqual([{ url: '/' }]);
    expect(navigationHistory.index).toBe(0);
  });

  test('should not store /contribs/ URLs in the history stack', () => {
    routerSubscribeCallback({ url: '/' } as TinroRoute);
    routerSubscribeCallback({ url: '/contribs/my-contrib/' } as TinroRoute);

    expect(navigationHistory.stack).toEqual([{ url: '/' }]);
    expect(navigationHistory.index).toBe(0);
  });
});

describe('goToHistoryIndex', () => {
  beforeEach(() => {
    vi.spyOn(router, 'goto').mockReturnValue(undefined);
  });

  test('should not navigate to invalid negative index', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;
    goToHistoryIndex(-1);

    expect(router.goto).not.toHaveBeenCalled();
  });

  test('should not navigate to index beyond stack', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    goToHistoryIndex(5);

    expect(router.goto).not.toHaveBeenCalled();
  });

  test('should not navigate to current index', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    goToHistoryIndex(0);

    expect(router.goto).not.toHaveBeenCalled();
  });

  test('should navigate to valid index', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }, { url: '/pods' }];
    navigationHistory.index = 2;

    goToHistoryIndex(0);

    expect(navigationHistory.index).toBe(0);
    expect(router.goto).toHaveBeenCalledWith('/containers');
  });

  test('should call window.navigateToExtensionHistoryEntry instead of router.goto for an extension-sourced entry', () => {
    // Uses a dedicated extensionId (not reused elsewhere) so this test doesn't leave the
    // module-level `extensionsNavigatingHistory` guard "dirty" for unrelated tests below.
    const extensionEntry: NavigationHistoryPushInfo = { extensionId: 'ext.goto-test', id: 'model-1', label: 'Model 1' };
    navigationHistory.stack = [{ url: '/__extension__/ext.goto-test/model-1', extensionEntry }, { url: '/containers' }];
    navigationHistory.index = 1;

    goToHistoryIndex(0);

    expect(navigationHistory.index).toBe(0);
    expect(window.navigateToExtensionHistoryEntry).toHaveBeenCalledWith('ext.goto-test', 'model-1');
    expect(router.goto).not.toHaveBeenCalled();
  });
});

describe('getBackEntries', () => {
  test('should return empty array when no history', () => {
    const entries = getBackEntries();
    expect(entries).toEqual([]);
  });

  test('should return empty array when at first entry', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    const entries = getBackEntries();
    expect(entries).toEqual([]);
  });

  test('should return previous entries in reverse order with computed names', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }, { url: '/pods' }];
    navigationHistory.index = 2;

    const entries = getBackEntries();

    expect(entries).toEqual([
      { index: 1, name: 'Images', icon: undefined },
      { index: 0, name: 'Containers', icon: {} },
    ]);
  });
});

describe('getForwardEntries', () => {
  test('should return empty array when no history', () => {
    const entries = getForwardEntries();
    expect(entries).toEqual([]);
  });

  test('should return empty array when at last entry', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    const entries = getForwardEntries();
    expect(entries).toEqual([]);
  });

  test('should return forward entries in order with computed names', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }, { url: '/pods' }];
    navigationHistory.index = 0;

    const entries = getForwardEntries();

    expect(entries).toEqual([
      { index: 1, name: 'Images', icon: undefined },
      { index: 2, name: 'Pods', icon: undefined },
    ]);
  });
});

describe('submenu navigation', () => {
  test('should show submenu parent → resource type breadcrumb', () => {
    // Simulate navigation: Dashboard -> Kubernetes Pods list -> Specific pod
    navigationHistory.stack = [
      { url: '/' },
      { url: '/kubernetes/pods' },
      { url: '/kubernetes/pods/nginx-pod/default/summary' },
    ];
    navigationHistory.index = 2;

    const backEntries = getBackEntries();

    expect(backEntries.length).toBe(2);
    // getBackEntries returns in reverse order, so [0] is index 1, [1] is index 0
    // backEntries[0] = '/kubernetes/pods' - should show full breadcrumb from registry
    expect(backEntries[0].name).toBe('Kubernetes → Pods');
    // backEntries[1] = '/' - should show Dashboard
    expect(backEntries[1].name).toBe('Dashboard');

    // The current entry (detail page) should show full breadcrumb with resource name
    const forwardEntries = getForwardEntries();
    expect(forwardEntries.length).toBe(0); // We're at the end
  });

  test('should preserve special characters in submenu breadcrumbs', () => {
    // Test ConfigMaps & Secrets with special character '&'
    navigationHistory.stack = [
      { url: '/' },
      { url: '/kubernetes/configmapsSecrets' },
      { url: '/kubernetes/configmapsSecrets/my-config/default/summary' },
    ];
    navigationHistory.index = 2;

    const backEntries = getBackEntries();

    expect(backEntries.length).toBe(2);
    // backEntries[0] = '/kubernetes/configmapsSecrets' base route
    // Should show proper name from registry with '&' preserved
    expect(backEntries[0].name).toBe('Kubernetes → ConfigMaps & Secrets');
    // backEntries[1] = '/' Dashboard
    expect(backEntries[1].name).toBe('Dashboard');
  });

  test('should show full breadcrumb for detail pages including tab', () => {
    // Test detail page shows: parent → resource type → resource name → tab
    navigationHistory.stack = [
      { url: '/kubernetes/configmapsSecrets/my-config/default/summary' },
      { url: '/kubernetes/configmapsSecrets' },
    ];
    navigationHistory.index = 1;

    const entries = getBackEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('Kubernetes → ConfigMaps & Secrets → my-config → Summary');
  });
});

describe('tab navigation for detail pages', () => {
  test('should add new entry for each tab change', () => {
    // Start by navigating to containers list
    routerSubscribeCallback({ url: '/containers' } as TinroRoute);
    expect(navigationHistory.stack).toEqual([{ url: '/containers' }]);
    expect(navigationHistory.index).toBe(0);

    // Navigate to container detail page summary tab (should add new entry)
    routerSubscribeCallback({ url: '/containers/abc123/summary' } as TinroRoute);
    expect(navigationHistory.stack).toEqual([{ url: '/containers' }, { url: '/containers/abc123/summary' }]);
    expect(navigationHistory.index).toBe(1);

    // Switch to logs tab (should ADD a new entry)
    routerSubscribeCallback({ url: '/containers/abc123/logs' } as TinroRoute);

    // Stack should now have 3 entries (each tab is a separate history entry)
    expect(navigationHistory.stack).toEqual([
      { url: '/containers' },
      { url: '/containers/abc123/summary' },
      { url: '/containers/abc123/logs' },
    ]);
    expect(navigationHistory.stack.length).toBe(3);
    expect(navigationHistory.index).toBe(2);
  });

  test('should show tab name in display for different tabs', () => {
    // Set up stack with different tabs
    navigationHistory.stack = [{ url: '/containers' }, { url: '/containers/abc123/inspect' }];
    navigationHistory.index = 0;

    const entries = getForwardEntries();

    // Should show resource name WITH tab name
    expect(entries).toEqual([{ index: 1, name: 'Containers → abc123 → Inspect', icon: {} }]);
    // Tab name should appear in display
    expect(entries[0].name).toContain('Inspect');
  });

  test('should show resource name with tab for submenu resources', () => {
    // Kubernetes pod with tab navigation
    navigationHistory.stack = [{ url: '/kubernetes/pods' }, { url: '/kubernetes/pods/nginx-pod/default/logs' }];
    navigationHistory.index = 0;

    const entries = getForwardEntries();

    expect(entries.length).toBe(1);
    expect(entries[0].name).toBe('Kubernetes → Pods → nginx-pod → Logs');
  });
});

describe('navigation-history-push event', () => {
  test('appends a new stack entry sourced from the extension and moves the index to it', () => {
    const pushInfo: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };

    navigationHistoryPushCallback(pushInfo);

    expect(navigationHistory.stack).toEqual([{ url: '/__extension__/ext.a/model-1', extensionEntry: pushInfo }]);
    expect(navigationHistory.index).toBe(0);
  });

  test('appends on top of existing router-based history', () => {
    navigationHistory.stack = [{ url: '/containers' }];
    navigationHistory.index = 0;

    const pushInfo: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };
    navigationHistoryPushCallback(pushInfo);

    expect(navigationHistory.stack).toEqual([
      { url: '/containers' },
      { url: '/__extension__/ext.a/model-1', extensionEntry: pushInfo },
    ]);
    expect(navigationHistory.index).toBe(1);
  });

  test('does not create a duplicate entry when the same extensionId+id is pushed twice in a row', () => {
    const pushInfo: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };

    navigationHistoryPushCallback(pushInfo);
    navigationHistoryPushCallback(pushInfo);

    expect(navigationHistory.stack).toEqual([{ url: '/__extension__/ext.a/model-1', extensionEntry: pushInfo }]);
    expect(navigationHistory.index).toBe(0);
  });

  test('still pushes a new entry when only the id differs from the current top entry', () => {
    const first: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };
    const second: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-2', label: 'Model 2' };

    navigationHistoryPushCallback(first);
    navigationHistoryPushCallback(second);

    expect(navigationHistory.stack).toEqual([
      { url: '/__extension__/ext.a/model-1', extensionEntry: first },
      { url: '/__extension__/ext.a/model-2', extensionEntry: second },
    ]);
    expect(navigationHistory.index).toBe(1);
  });

  test('truncates forward history when a push happens after navigating back', () => {
    navigationHistory.stack = [{ url: '/containers' }, { url: '/images' }, { url: '/pods' }];
    // Simulate having navigated back to '/containers' (forward history: '/images', '/pods')
    navigationHistory.index = 0;

    const pushInfo: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };
    navigationHistoryPushCallback(pushInfo);

    expect(navigationHistory.stack).toEqual([
      { url: '/containers' },
      { url: '/__extension__/ext.a/model-1', extensionEntry: pushInfo },
    ]);
    expect(navigationHistory.index).toBe(1);
    expect(getForwardEntries()).toEqual([]);
  });
});

describe('extensionsNavigatingHistory guard', () => {
  test('suppresses the first push from an extension right after navigating back/forward to one of its entries, then processes the next one normally', () => {
    const originalEntry: NavigationHistoryPushInfo = { extensionId: 'ext.guard', id: 'entry-1', label: 'Entry 1' };
    navigationHistory.stack = [
      { url: '/__extension__/ext.guard/entry-1', extensionEntry: originalEntry },
      { url: '/containers' },
    ];
    navigationHistory.index = 1;

    // Simulate the user clicking "back" to the extension's history entry
    goToHistoryIndex(0);
    expect(navigationHistory.index).toBe(0);
    expect(window.navigateToExtensionHistoryEntry).toHaveBeenCalledWith('ext.guard', 'entry-1');

    // The webview re-mounts and replays its initial route as a "push" - this is stale and must be ignored
    navigationHistoryPushCallback({ extensionId: 'ext.guard', id: 'entry-1', label: 'Entry 1' });

    expect(navigationHistory.stack).toHaveLength(2);
    expect(navigationHistory.index).toBe(0);

    // A subsequent, genuine push from the same extension is processed normally (guard only suppresses once)
    const nextEntry: NavigationHistoryPushInfo = { extensionId: 'ext.guard', id: 'entry-2', label: 'Entry 2' };
    navigationHistoryPushCallback(nextEntry);

    expect(navigationHistory.stack).toEqual([
      { url: '/__extension__/ext.guard/entry-1', extensionEntry: originalEntry },
      { url: '/__extension__/ext.guard/entry-2', extensionEntry: nextEntry },
    ]);
    expect(navigationHistory.index).toBe(1);
  });
});

describe('extension history entry display names', () => {
  afterEach(() => {
    extensionInfos.set([]);
  });

  test('formats extension entries with an arrow separator between displayName and label', () => {
    extensionInfos.set([{ id: 'ext.a', displayName: 'My Extension' } as ExtensionInfo]);
    const pushInfo: NavigationHistoryPushInfo = { extensionId: 'ext.a', id: 'model-1', label: 'Model 1' };
    navigationHistory.stack = [
      { url: '/__extension__/ext.a/model-1', extensionEntry: pushInfo },
      { url: '/containers' },
    ];
    navigationHistory.index = 1;

    expect(getBackEntries()).toEqual([{ index: 0, name: 'My Extension → Model 1', icon: undefined }]);
  });

  test('truncates long displayName and label parts to 24 characters', () => {
    extensionInfos.set([
      {
        id: 'ext.long',
        displayName: 'A Very Long Extension Display Name That Exceeds Limit',
      } as ExtensionInfo,
    ]);
    const pushInfo: NavigationHistoryPushInfo = {
      extensionId: 'ext.long',
      id: 'entry-1',
      label: 'An Extremely Long History Entry Label For Testing',
    };
    navigationHistory.stack = [
      { url: '/__extension__/ext.long/entry-1', extensionEntry: pushInfo },
      { url: '/containers' },
    ];
    navigationHistory.index = 1;

    expect(getBackEntries()).toEqual([
      {
        index: 0,
        name: 'A Very Long Extension Di... → An Extremely Long Histor...',
        icon: undefined,
      },
    ]);
  });

  test('falls back to truncated label when extension is not found', () => {
    const pushInfo: NavigationHistoryPushInfo = {
      extensionId: 'ext.missing',
      id: 'entry-1',
      label: 'An Extremely Long History Entry Label For Testing',
    };
    navigationHistory.stack = [
      { url: '/__extension__/ext.missing/entry-1', extensionEntry: pushInfo },
      { url: '/containers' },
    ];
    navigationHistory.index = 1;

    expect(getBackEntries()).toEqual([{ index: 0, name: 'An Extremely Long Histor...', icon: undefined }]);
  });
});
