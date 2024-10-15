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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { nativeTheme } from 'electron';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import { AppearanceInit } from './appearance-init.js';
import { AppearanceSettings } from './appearance-settings.js';
import type { IConfigurationChangeEvent } from './configuration-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { Directories } from './directories.js';

let configurationRegistry: ConfigurationRegistry;

vi.mock('electron', () => {
  return {
    nativeTheme: {},
  };
});

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  configurationRegistry = new ConfigurationRegistry({} as ApiSenderType, {} as Directories);
  configurationRegistry.registerConfigurations = vi.fn();
  configurationRegistry.deregisterConfigurations = vi.fn();
});

test('Expect appearance configuration change to update native theme', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
  const spyOnUpdateNativeTheme = vi.spyOn(appearanceInit, 'updateNativeTheme');

  appearanceInit.init();

  expect(spyOnDidChange).toHaveBeenCalled();
  // grab the anonymous function that is the first argument of the first call
  const callback = spyOnDidChange.mock.calls[0]?.[0];
  expect(callback).toBeDefined();

  // call the callback
  callback?.({
    key: `${AppearanceSettings.SectionName}.${AppearanceSettings.Appearance}`,
  } as unknown as IConfigurationChangeEvent);

  // check we have called updateNativeTheme
  expect(spyOnUpdateNativeTheme).toHaveBeenCalled();
});

test('Expect unrelated configuration change not to update native theme', async () => {
  const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
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

test('Expect native theme to be set to light', async () => {
  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
  appearanceInit.updateNativeTheme('light');

  expect(nativeTheme.themeSource).toEqual('light');
});

test('Expect native theme to be set to dark', async () => {
  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
  appearanceInit.updateNativeTheme('dark');

  expect(nativeTheme.themeSource).toEqual('dark');
});

test('Expect native theme to be set to system', async () => {
  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
  appearanceInit.updateNativeTheme('system');

  expect(nativeTheme.themeSource).toEqual('system');
});

test('Expect unknown theme to be set to system', async () => {
  const appearanceInit: AppearanceInit = new AppearanceInit(configurationRegistry);
  appearanceInit.updateNativeTheme('unknown');

  expect(nativeTheme.themeSource).toEqual('system');
});

test('should register a configuration', async () => {
  const appearanceInit = new AppearanceInit(configurationRegistry);
  appearanceInit.init();

  expect(configurationRegistry.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.appearance');
  expect(configurationNode?.title).toBe('Appearance');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(2);
  expect(configurationNode?.properties?.['preferences.zoomLevel']).toBeDefined();
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.markdownDescription).toBeDefined();
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.type).toBe('number');
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.default).toBe(0);
  expect(configurationNode?.properties?.['preferences.zoomLevel']?.step).toBe(0.1);
});
