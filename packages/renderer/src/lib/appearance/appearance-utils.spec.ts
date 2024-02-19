/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AppearanceUtil } from './appearance-util';
import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';

const appearanceUtil: AppearanceUtil = new AppearanceUtil();

// mock window.getConfigurationValue
const getConfigurationValueMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (window as any).getConfigurationValue = getConfigurationValueMock;
});

// temporary as only dark mode is supported as rendering for now
// it should return empty later
test('Expect dark mode using system when OS is set to light', async () => {
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

  // expect to have class being "dark" as for now we force dark mode in system mode
  expect(await appearanceUtil.isDarkMode()).toBe(true);
});

test('Expect dark mode using system when OS is set to dark', async () => {
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

  // expect to have class being "dark" as OS is using dark
  expect(await appearanceUtil.isDarkMode()).toBe(true);
});

test('Expect light mode using light configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  expect(await appearanceUtil.isDarkMode()).toBe(false);
});

test('Expect dark mode using dark configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

  expect(await appearanceUtil.isDarkMode()).toBe(true);
});

test('Expect light mode using light configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  expect(await appearanceUtil.isDarkMode()).toBe(false);
});

test('Expect standard icon using dark configuration', async () => {
  const img = 'icon.png';
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

  expect(await appearanceUtil.getImage(img)).toBe(img);
});

test('Expect standard icon using light configuration', async () => {
  const img = 'icon.png';
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  expect(await appearanceUtil.getImage(img)).toBe(img);
});

test('Expect dark icon using dark configuration', async () => {
  const img = { light: 'light.png', dark: 'dark.png' };
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

  expect(await appearanceUtil.getImage(img)).toBe(img.dark);
});

test('Expect light icon using light configuration', async () => {
  const img = { light: 'light.png', dark: 'dark.png' };
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  expect(await appearanceUtil.getImage(img)).toBe(img.light);
});

describe('getTheme', () => {
  test('should return dark if OS is set to dark and theme is set to system ', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('dark');
  });

  test('should return light if OS is set to light and theme is set to system ', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('light');
  });

  test('should return dark if value is dark even if os is light', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('dark');
  });

  test('should return light if value is light even if os is dark', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('light');
  });

  test('should return custom value even if os is dark', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const customTheme = 'fooTheme';
    getConfigurationValueMock.mockResolvedValue(customTheme);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe(customTheme);
  });

  test('should return custom value even if os is dark', async () => {
    (window as any).matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const customTheme = 'fooTheme';
    getConfigurationValueMock.mockResolvedValue(customTheme);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe(customTheme);
  });
});
