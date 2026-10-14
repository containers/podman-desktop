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

import { AppearanceSettings } from '@desktop-framework/api/appearance';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { isDark, isHighContrast } from './appearance';
import { configurationProperties } from './configurationProperties';

// mock window.getConfigurationValue
const getConfigurationValueMock = vi.fn();
const getThemeInfoMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
  Object.defineProperty(window, 'getThemeInfo', { value: getThemeInfoMock, configurable: true });
});

test('Expect light mode using system when OS is set to light', async () => {
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });

  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.SystemEnumValue);
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

  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.SystemEnumValue);
  configurationProperties.set([]);

  // expect to have class being "dark" as OS is using dark
  await vi.waitFor(() => expect(get(isDark)).toBe(true));
});

test('Expect light mode using light configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(false));
});

test('Expect dark mode using dark configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(true));
});

test('Expect light mode using hc-light configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightHCEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(false));
});

test('Expect dark mode using hc-dark configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkHCEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(true));
});

test('Expect not high contrast using light configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isHighContrast)).toBe(false));
});

test('Expect not high contrast using dark configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isHighContrast)).toBe(false));
});

test('Expect high contrast using hc-light configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightHCEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isHighContrast)).toBe(true));
});

test('Expect high contrast using hc-dark configuration', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkHCEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isHighContrast)).toBe(true));
});

test('Expect dark mode for custom theme with dark parent', async () => {
  getThemeInfoMock.mockResolvedValue({ isDark: true, isHighContrast: false });
  getConfigurationValueMock.mockResolvedValue('zenburn');
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(true));
  await vi.waitFor(() => expect(get(isHighContrast)).toBe(false));
  expect(getThemeInfoMock).toHaveBeenCalledWith('zenburn');
});

test('Expect light mode for custom theme with light parent', async () => {
  getThemeInfoMock.mockResolvedValue({ isDark: false, isHighContrast: false });
  getConfigurationValueMock.mockResolvedValue('solarized-light');
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(false));
  await vi.waitFor(() => expect(get(isHighContrast)).toBe(false));
  expect(getThemeInfoMock).toHaveBeenCalledWith('solarized-light');
});

test('Expect high contrast for custom theme with hc-dark parent', async () => {
  getThemeInfoMock.mockResolvedValue({ isDark: true, isHighContrast: true });
  getConfigurationValueMock.mockResolvedValue('my-hc-dark-theme');
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(true));
  await vi.waitFor(() => expect(get(isHighContrast)).toBe(true));
  expect(getThemeInfoMock).toHaveBeenCalledWith('my-hc-dark-theme');
});

test('Expect high contrast for custom theme with hc-light parent', async () => {
  getThemeInfoMock.mockResolvedValue({ isDark: false, isHighContrast: true });
  getConfigurationValueMock.mockResolvedValue('my-hc-light-theme');
  configurationProperties.set([]);

  await vi.waitFor(() => expect(get(isDark)).toBe(false));
  await vi.waitFor(() => expect(get(isHighContrast)).toBe(true));
  expect(getThemeInfoMock).toHaveBeenCalledWith('my-hc-light-theme');
});
