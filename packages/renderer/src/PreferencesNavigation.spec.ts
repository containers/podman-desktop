/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { TinroRouteMeta } from 'tinro';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { settingsNavigationEntries } from './PreferencesNavigation';
import PreferencesNavigation from './PreferencesNavigation.svelte';
import { configurationProperties } from './stores/configurationProperties';
import { onDidChangeRegisteredFeatures, registeredFeatures } from './stores/registered-features';

const DEFAULT_META = {
  url: '/',
} as unknown as TinroRouteMeta;

const LONG_CONFIG: IConfigurationPropertyRecordedSchema = {
  id: 'dummy-config',
  title: 'A Very Long Preference Entry',
  default: false,
  parentId: 'preferences.long-entry',
  type: 'boolean',
  scope: 'DEFAULT',
};

function renderPreferencesNavigation(): void {
  render(PreferencesNavigation, {
    meta: DEFAULT_META,
  });
}

async function waitForNavigationWidth(width: string): Promise<void> {
  await vi.waitFor(() => {
    expect(screen.getByRole('navigation', { name: 'PreferencesNavigation' })).toHaveStyle({ width });
  });
}

function mockNavigationMeasurements(options: {
  minWidth?: string;
  rowNonTitleWidth?: number;
  titleWidths?: Record<string, number>;
  innerWidth?: number;
  withRequestAnimationFrame?: boolean;
}): void {
  const { minWidth = '170px', rowNonTitleWidth = 24, titleWidths = {}, innerWidth = 1024 } = options;

  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: innerWidth,
  });

  Object.defineProperty(window, 'getComputedStyle', {
    configurable: true,
    value: vi.fn((element: Element) => {
      const htmlElement = element as HTMLElement;
      return {
        minWidth: htmlElement.getAttribute('aria-label') === 'PreferencesNavigation' ? minWidth : '',
        whiteSpace: htmlElement.dataset.settingsNavTitle !== undefined ? 'nowrap' : 'normal',
        font: '',
        fontSize: '',
        fontWeight: '',
        fontFamily: '',
        letterSpacing: '',
        textTransform: '',
      };
    }),
  });

  if (options.withRequestAnimationFrame) {
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });
  }

  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return titleWidths[this.textContent ?? ''] ?? 0;
  });

  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute('aria-label') === 'PreferencesNavigation') {
      return Number.parseFloat(minWidth);
    }
    return titleWidths[this.textContent ?? ''] ?? 0;
  });

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const width =
      this.dataset.settingsNavRow !== undefined ? rowNonTitleWidth : (titleWidths[this.textContent ?? ''] ?? 0);

    return {
      x: 0,
      y: 0,
      width,
      height: 0,
      top: 0,
      right: width,
      bottom: 0,
      left: 0,
      toJSON: (): object => ({}),
    };
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  registeredFeatures.set([]);
  configurationProperties.set([]);
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(global, 'window', {
    value: {
      getConfigurationValue: vi.fn(),
      events: {
        receive: (_channel: string, func: () => void): void => {
          func();
        },
      },
    },
    writable: true,
  });
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValue(true);
});

test('Test rendering of the preferences navigation bar and its items', () => {
  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
  expect(navigationBar).toBeVisible();

  const resources = screen.getByRole('link', { name: 'Resources' });
  expect(resources).toBeVisible();
  const proxy = screen.getByRole('link', { name: 'Proxy' });
  expect(proxy).toBeVisible();
  const registries = screen.getByRole('link', { name: 'Registries' });
  expect(registries).toBeVisible();
  const authentication = screen.getByRole('link', { name: 'Authentication' });
  expect(authentication).toBeVisible();
  // ToDo: adding configuration section/items mocks for preferences, issue #2966
});

test('Test rendering of the compatibility docker pag if config is available', async () => {
  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  // wait docker compatibility is being set
  await tick();

  // expect getConfigurationValue to be called
  expect(window.getConfigurationValue).toBeCalledWith('dockerCompatibility.enabled');

  const dockerCompatLink = screen.getByRole('link', { name: 'Docker Compatibility' });
  expect(dockerCompatLink).toBeVisible();
});

test('Test rendering of the compatibility docker page is hidden if disabled', async () => {
  // mock window.getConfigurationValue
  vi.mocked(window.getConfigurationValue<boolean>).mockReset();
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValue(false);

  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  // wait docker compatibility is being set
  await tick();

  // expect getConfigurationValue to be called
  expect(window.getConfigurationValue).toBeCalledWith('dockerCompatibility.enabled');

  // should not be displayed
  const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });
  expect(dockerCompatLink).toBeNull();
});

test('Test rendering of the compatibility docker page does change if config changes from enabled to disabled', async () => {
  // mock window.getConfigurationValue
  vi.mocked(window.getConfigurationValue<boolean>).mockClear();
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValueOnce(true);
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValue(false);

  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  // wait docker compatibility is being set
  await tick();

  // expect getConfigurationValue to be called
  expect(window.getConfigurationValue).toBeCalledWith('dockerCompatibility.enabled');

  const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });

  expect(dockerCompatLink).not.toBeNull();

  // wait docker compatibility is being set
  configurationProperties.set([]);
  await vi.waitFor(() => {
    const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });
    expect(dockerCompatLink).toBeNull();
  });
});

test('Test rendering of the compatibility docker page does change if config changes from disabled to enabled', async () => {
  // mock window.getConfigurationValue
  vi.mocked(window.getConfigurationValue<boolean>).mockClear();
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValueOnce(false);
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValue(true);

  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  // wait docker compatibility is being set
  await tick();

  // expect getConfigurationValue to be called
  expect(window.getConfigurationValue).toBeCalledWith('dockerCompatibility.enabled');

  const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });

  expect(dockerCompatLink).toBeNull();

  // wait docker compatibility is being set
  configurationProperties.set([]);
  await vi.waitFor(() => {
    const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });
    expect(dockerCompatLink).not.toBeNull();
  });
});

test('Test rendering of the compatibility docker page does change if config changes when other config settings is updated', async () => {
  // mock window.getConfigurationValue
  vi.mocked(window.getConfigurationValue<boolean>).mockClear();
  vi.mocked(window.getConfigurationValue<boolean>).mockResolvedValueOnce(true);

  render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  // wait docker compatibility is being set
  await tick();

  // expect getConfigurationValue to be called
  expect(window.getConfigurationValue).toBeCalledWith('dockerCompatibility.enabled');

  const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });

  expect(dockerCompatLink).not.toBeNull();

  // Simultaing other preferences being set - undefined value (should not change the visibility)
  configurationProperties.set([]);
  await vi.waitFor(() => {
    const dockerCompatLink = screen.queryByRole('link', { name: 'Docker Compatibility' });
    expect(dockerCompatLink).not.toBeNull();
  });
});

const EXPERIMENTAL_CONFIG: IConfigurationPropertyRecordedSchema = {
  experimental: {
    githubDiscussionLink: '',
  },
  id: 'dummy-config',
  title: 'Dummy Config',
  default: false,
  parentId: 'preferences.potatoes',
  type: 'boolean',
  scope: 'DEFAULT',
};

test('experimental configuration should be visible if one property has experimental property', async () => {
  configurationProperties.set([EXPERIMENTAL_CONFIG]);
  const { getByRole } = render(PreferencesNavigation, {
    meta: {
      url: '/',
    } as unknown as TinroRouteMeta,
  });

  await vi.waitFor(() => {
    const experimental = getByRole('link', { name: 'Experimental' });
    expect(experimental).toBeDefined();
  });
});

describe('Kubernetes menu visibility based on kubernetes-contexts-manager feature', () => {
  test('should be visible by default', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Kubernetes' })).toBeVisible();
    });
  });

  test('should be hidden when kubernetes-contexts-manager feature is already registered', async () => {
    registeredFeatures.set(['kubernetes-contexts-manager']);
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Kubernetes' })).toBeNull();
    });
  });

  test('should be hidden when kubernetes-contexts-manager feature is added via event', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Kubernetes' })).toBeVisible();
    });

    onDidChangeRegisteredFeatures.dispatchEvent(new CustomEvent('kubernetes-contexts-manager', { detail: true }));
    await vi.waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Kubernetes' })).toBeNull();
    });
  });

  test('should reappear when kubernetes-contexts-manager feature is removed via event', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Kubernetes' })).toBeVisible();
    });

    onDidChangeRegisteredFeatures.dispatchEvent(new CustomEvent('kubernetes-contexts-manager', { detail: true }));
    await vi.waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Kubernetes' })).toBeNull();
    });

    onDidChangeRegisteredFeatures.dispatchEvent(new CustomEvent('kubernetes-contexts-manager', { detail: false }));
    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Kubernetes' })).toBeVisible();
    });
  });
});

describe('Navigation width measurement and calculation', () => {
  test('should render navigation container with correct structure', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await tick();
    const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    expect(navigationBar).toBeVisible();
    expect(navigationBar).toHaveClass('flex-col');
    expect(navigationBar).toHaveClass('justify-between');
  });

  test('should calculate navigation width based on label lengths', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await tick();
    const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    expect(navigationBar).toBeInTheDocument();

    // Verify links are present and properly measured
    const resourcesLink = screen.getByRole('link', { name: 'Resources' });
    expect(resourcesLink).toBeInTheDocument();
  });

  test('should update width styling when navigation items change', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await tick();

    const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    expect(navigationBar).toBeVisible();

    // Re-render with updated configuration
    configurationProperties.set([EXPERIMENTAL_CONFIG]);
    await tick();

    const updatedNav = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    expect(updatedNav).toBeVisible();
  });

  test('should apply width-related CSS classes to navigation', async () => {
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await tick();

    const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    // Verify it has the expected size-related classes from the squashed commit
    expect(navigationBar.className).toContain('min-w-leftsidebar');
    expect(navigationBar.className).toContain('w-leftsidebar');
    expect(navigationBar.className).toContain('max-w-none');
  });

  test('should handle section expansion with navigation width stability', async () => {
    configurationProperties.set([EXPERIMENTAL_CONFIG]);
    render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await tick();

    // Navigate to trigger section rendering
    const experimentalLink = await screen.findByRole('link', { name: 'Experimental' });
    expect(experimentalLink).toBeVisible();

    // Verify navigation dimensions remain stable
    const navigationBar = screen.getByRole('navigation', { name: 'PreferencesNavigation' });
    expect(navigationBar).toBeVisible();
    expect(navigationBar.className).toContain('flex');
  });

  test('should expand navigation width to fit a visible child preference label', async () => {
    mockNavigationMeasurements({
      titleWidths: {
        'A Very Long Preference Entry': 260,
      },
    });
    configurationProperties.set([LONG_CONFIG]);

    renderPreferencesNavigation();

    await fireEvent.click(await screen.findByRole('link', { name: 'preferences' }));

    expect(await screen.findByRole('link', { name: 'A Very Long Preference Entry' })).toBeVisible();
    await waitForNavigationWidth('292px');
  });

  test('should clamp navigation width to keep content visible', async () => {
    mockNavigationMeasurements({
      innerWidth: 260,
      minWidth: '100px',
      titleWidths: {
        'A Very Long Preference Entry': 500,
      },
    });
    configurationProperties.set([LONG_CONFIG]);

    renderPreferencesNavigation();

    await fireEvent.click(await screen.findByRole('link', { name: 'preferences' }));

    await waitForNavigationWidth('180px');
  });

  test('should clear widened navigation width when the expanded section disappears', async () => {
    mockNavigationMeasurements({
      titleWidths: {
        'A Very Long Preference Entry': 260,
      },
    });
    configurationProperties.set([LONG_CONFIG]);

    renderPreferencesNavigation();

    await fireEvent.click(await screen.findByRole('link', { name: 'preferences' }));
    await waitForNavigationWidth('292px');

    configurationProperties.set([]);

    await vi.waitFor(() => {
      expect(screen.queryByRole('link', { name: 'preferences' })).toBeNull();
      expect(
        screen.getByRole('navigation', { name: 'PreferencesNavigation' }).getAttribute('style') ?? '',
      ).not.toContain('width');
    });
  });

  test('should update navigation width when the window is resized', async () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    Object.assign(window, {
      addEventListener,
      removeEventListener,
    });
    const titleWidths: Record<string, number> = {};
    mockNavigationMeasurements({
      titleWidths,
    });

    const { unmount } = render(PreferencesNavigation, {
      meta: {
        url: '/preferences/docker',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function)));

    const resizeListener = addEventListener.mock.calls.find(([eventName]) => eventName === 'resize')?.[1] as
      | (() => void)
      | undefined;
    expect(resizeListener).toBeDefined();

    titleWidths.Resources = 260;
    resizeListener?.();

    await waitForNavigationWidth('292px');

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('resize', resizeListener);
  });

  test('should observe parent resize and disconnect observer on unmount', async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class MockResizeObserver {
      observe = observe;
      disconnect = disconnect;
    }

    Object.defineProperty(global, 'ResizeObserver', {
      configurable: true,
      value: MockResizeObserver,
    });
    mockNavigationMeasurements({});

    const { unmount } = render(PreferencesNavigation, {
      meta: {
        url: '/',
      } as unknown as TinroRouteMeta,
    });

    await vi.waitFor(() => expect(observe).toHaveBeenCalled());

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

describe('Static navigation entry children', () => {
  let originalLength: number;

  beforeEach(() => {
    originalLength = settingsNavigationEntries.length;
    settingsNavigationEntries.push({
      title: 'Test Parent',
      href: '/preferences/test-parent',
      visible: true,
      children: [
        { title: 'Child One', href: '/preferences/test-parent/child-one', visible: true },
        { title: 'Child Two', href: '/preferences/test-parent/child-two', visible: true },
        { title: 'Hidden Child', href: '/preferences/test-parent/hidden', visible: false },
      ],
    });
  });

  afterEach(() => {
    settingsNavigationEntries.length = originalLength;
  });

  test('should start expanded when entry has expanded set to true', async () => {
    settingsNavigationEntries.push({
      title: 'Auto Expanded',
      href: '/preferences/auto-expanded',
      visible: true,
      expanded: true,
      children: [{ title: 'Auto Child', href: '/preferences/auto-expanded/child', visible: true }],
    });

    renderPreferencesNavigation();

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Auto Expanded' })).toBeVisible();
      expect(screen.getByRole('link', { name: 'Auto Child' })).toBeVisible();
    });
  });

  test('should render parent entry with children as a link', async () => {
    renderPreferencesNavigation();

    const parentLink = await screen.findByRole('link', { name: 'Test Parent' });
    expect(parentLink).toBeVisible();
  });

  test('should not show children before parent is expanded', async () => {
    renderPreferencesNavigation();

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Test Parent' })).toBeVisible();
    });

    expect(screen.queryByRole('link', { name: 'Child One' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Child Two' })).toBeNull();
  });

  test('should show visible children when parent section is expanded', async () => {
    renderPreferencesNavigation();

    await fireEvent.click(await screen.findByRole('link', { name: 'Test Parent' }));

    expect(await screen.findByRole('link', { name: 'Child One' })).toBeVisible();
    expect(await screen.findByRole('link', { name: 'Child Two' })).toBeVisible();
  });

  test('should filter out children with visible set to false', async () => {
    renderPreferencesNavigation();

    await fireEvent.click(await screen.findByRole('link', { name: 'Test Parent' }));

    await vi.waitFor(() => {
      expect(screen.getByRole('link', { name: 'Child One' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Hidden Child' })).toBeNull();
    });
  });

  test('should not select parent when current URL matches a child href', async () => {
    render(PreferencesNavigation, {
      meta: { url: '/preferences/test-parent/child-one' } as unknown as TinroRouteMeta,
    });

    await fireEvent.click(await screen.findByRole('link', { name: 'Test Parent' }));

    await vi.waitFor(() => {
      const parentRow = screen.getByRole('link', { name: 'Test Parent' }).querySelector('[data-settings-nav-row]');
      expect(parentRow).not.toHaveClass('bg-[var(--pd-secondary-nav-selected-bg)]');

      const childRow = screen.getByRole('link', { name: 'Child One' }).querySelector('[data-settings-nav-row]');
      expect(childRow).toHaveClass('bg-[var(--pd-secondary-nav-selected-bg)]');
    });
  });

  test('should select parent when URL matches parent href and no child matches', async () => {
    render(PreferencesNavigation, {
      meta: { url: '/preferences/test-parent' } as unknown as TinroRouteMeta,
    });

    await fireEvent.click(await screen.findByRole('link', { name: 'Test Parent' }));

    await vi.waitFor(() => {
      const parentRow = screen.getByRole('link', { name: 'Test Parent' }).querySelector('[data-settings-nav-row]');
      expect(parentRow).toHaveClass('bg-[var(--pd-secondary-nav-selected-bg)]');

      const childRow = screen.getByRole('link', { name: 'Child One' }).querySelector('[data-settings-nav-row]');
      expect(childRow).not.toHaveClass('bg-[var(--pd-secondary-nav-selected-bg)]');
    });
  });
});
