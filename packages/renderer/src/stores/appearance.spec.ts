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

import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { AppearanceSettings } from '../../../main/src/plugin/appearance-settings';
import { isDark } from './appearance';
import { configurationProperties } from './configurationProperties';

// mock window.getConfigurationValue
const getConfigurationValueMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
});

test('Expect light mode using system when OS is set to light', async () => {
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);
  configurationProperties.set([]);

  // expect to have class being "light" as OS is using light
  await vi.waitFor(() => expect(get(isDark)).toBe(false));
});

test('Expect dark mode using system when OS is set to dark', async () => {
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);
  configurationProperties.set([]);

  // expect to have class being "dark" as OS is using dark
  await vi.waitFor(() => expect(get(isDark)).toBe(true));
});

test('Expect light mode using light configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(false));
});

test('Expect dark mode using dark configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(true));
});
