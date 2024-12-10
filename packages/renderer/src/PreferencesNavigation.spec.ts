/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { TinroRouteMeta } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import PreferencesNavigation from './PreferencesNavigation.svelte';
import { configurationProperties } from './stores/configurationProperties';

// fake the window.events object
beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(global, 'window', {
    value: {
      getConfigurationValue: vi.fn(),
      events: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        receive: (_channel: string, func: any) => {
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
