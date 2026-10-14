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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import type { IConfigurationChangeEvent } from '@desktop-framework/api/configuration';
import { nativeTheme } from 'electron';
import { beforeAll, expect, test, vi } from 'vitest';

import { AppearanceInit } from './appearance-init.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { DefaultConfiguration } from './default-configuration.js';
import type { Directories } from './directories.js';
import type { LockedConfiguration } from './locked-configuration.js';

let configurationRegistry: ConfigurationRegistry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  configurationRegistry = new ConfigurationRegistry(
    {} as ApiSenderType,
    {} as Directories,
    {} as DefaultConfiguration,
    {} as LockedConfiguration,
  );
  configurationRegistry.registerConfigurations = vi.fn();
  configurationRegistry.deregisterConfigurations = vi.fn();
});

test('Expect appearance configuration change to update native theme', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  const spyOnUpdateNativeTheme = vi.spyOn(appearanceInit, 'updateNativeTheme');

  appearanceInit.init();

  expect(spyOnDidChange).toHaveBeenCalled();
  // grab the anonymous function that is the first argument of the first call
  const callback = spyOnDidChange.mock.calls[0]?.[0];
  expect(callback).toBeDefined();

  // call the callback
  callback?.({
    key: `${AppearanceSettings.SectionName}.${AppearanceSettings.Appearance}`,
    value: 'dark',
  } as unknown as IConfigurationChangeEvent);

  // check we have called updateNativeTheme
  expect(spyOnUpdateNativeTheme).toHaveBeenCalled();
});

test('Expect unrelated configuration change not to update native theme', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  const spyOnUpdateNativeTheme = vi.spyOn(appearanceInit, 'updateNativeTheme');

  appearanceInit.init();

  expect(spyOnDidChange).toHaveBeenCalled();
  // grab the anonymous function that is the first argument of the first call
  const callback = spyOnDidChange.mock.calls[0]?.[0];
  expect(callback).toBeDefined();

  // call the callback
  callback?.({
    key: `dummyKey`,
  } as unknown as IConfigurationChangeEvent);

  // check we have not called updateNativeTheme
  expect(spyOnUpdateNativeTheme).not.toHaveBeenCalled();
});

test('Expect appearance configuration change to update searchbar when enabled', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  const spyOnSend = vi.spyOn(apiSender, 'send');

  appearanceInit.init();

  expect(spyOnDidChange).toHaveBeenCalled();
  // grab the anonymous function that is the first argument of the first call
  const callback = spyOnDidChange.mock.calls[0]?.[0];
  expect(callback).toBeDefined();

  // call the callback
  callback?.({
    key: `titleBar.${AppearanceSettings.SearchBar}`,
    value: {},
  } as unknown as IConfigurationChangeEvent);

  // check we have called updateNativeTheme
  expect(spyOnSend).toHaveBeenCalled();
});

test('Expect appearance configuration change to update searchbar when disabled', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  const spyOnSend = vi.spyOn(apiSender, 'send');

  appearanceInit.init();

  expect(spyOnDidChange).toHaveBeenCalled();
  // grab the anonymous function that is the first argument of the first call
  const callback = spyOnDidChange.mock.calls[0]?.[0];
  expect(callback).toBeDefined();

  // call the callback
  callback?.({
    key: `titleBar.${AppearanceSettings.SearchBar}`,
    value: undefined,
  } as unknown as IConfigurationChangeEvent);

  // check we have called updateNativeTheme
  expect(spyOnSend).toHaveBeenCalled();
});

test.each([
  { inputTheme: 'light', expectedTheme: 'light', description: 'Expect native theme to be set to light' },
  { inputTheme: 'dark', expectedTheme: 'dark', description: 'Expect native theme to be set to dark' },
  { inputTheme: 'system', expectedTheme: 'system', description: 'Expect native theme to be set to system' },
  {
    inputTheme: 'hc-light',
    expectedTheme: 'light',
    description: 'Expect native theme to be set to light for hc-light',
  },
  { inputTheme: 'hc-dark', expectedTheme: 'dark', description: 'Expect native theme to be set to dark for hc-dark' },
  { inputTheme: 'unknown', expectedTheme: 'system', description: 'Expect unknown theme to be set to system' },
])('$description', async ({ inputTheme, expectedTheme }) => {
  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  appearanceInit.updateNativeTheme(inputTheme);

  expect(nativeTheme.themeSource).toEqual(expectedTheme);
});

test('should register a configuration', async () => {
  const appearanceInit = new AppearanceInit(configurationRegistry, apiSender);
  appearanceInit.init();

  expect(configurationRegistry.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.appearance');
  expect(configurationNode?.title).toBe('Appearance');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(3);
  expect(configurationNode?.properties?.['preferences.zoomLevel']).toBeDefined();
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.markdownDescription).toBeDefined();
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.type).toBe('number');
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.default).toBe(0);
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.step).toBeCloseTo(0.1);

  expect(configurationNode?.properties?.['preferences.navigationBarWidth']).toBeDefined();
  expect(configurationNode?.properties?.['preferences.navigationBarWidth']?.description).toBeDefined();
  expect(configurationNode?.properties?.['preferences.navigationBarWidth']?.type).toBe('number');
  expect(configurationNode?.properties?.['preferences.navigationBarWidth']?.minimum).toBe(50);
  expect(configurationNode?.properties?.['preferences.navigationBarWidth']?.maximum).toBe(240);
  expect(configurationNode?.properties?.['preferences.navigationBarWidth']?.default).toBe(160);
});
