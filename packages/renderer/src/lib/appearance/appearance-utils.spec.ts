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

import { AppearanceSettings } from '@desktop-framework/api/appearance';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';

import { AppearanceUtil } from './appearance-util';

const appearanceUtil: AppearanceUtil = new AppearanceUtil();

const matchMediaMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });
});

beforeEach(() => {
  vi.resetAllMocks();
  matchMediaMock.mockReturnValue({
    matches: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

test('Expect standard icon using dark configuration', async () => {
  const img = 'icon.png';
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkEnumValue);

  expect(appearanceUtil.getImage(img)).toBe(img);
});

test('Expect standard icon using light configuration', async () => {
  const img = 'icon.png';
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightEnumValue);

  expect(appearanceUtil.getImage(img)).toBe(img);
});

test('Expect dark icon using dark configuration', async () => {
  const img = { light: 'light.png', dark: 'dark.png' };
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(async () => expect(appearanceUtil.getImage(img)).toBe(img.dark));
});

test('Expect light icon using light configuration', async () => {
  const img = { light: 'light.png', dark: 'dark.png' };
  vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightEnumValue);
  configurationProperties.set([]);

  await vi.waitFor(async () => expect(appearanceUtil.getImage(img)).toBe(img.light));
});

describe('getTheme', () => {
  test('should return dark if OS is set to dark and theme is set to system ', async () => {
    matchMediaMock.mockReturnValue({ matches: true });
    vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.SystemEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('dark');
  });

  test('should return light if OS is set to light and theme is set to system ', async () => {
    matchMediaMock.mockReturnValue({ matches: false });
    vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.SystemEnumValue);

    const theme = await appearanceUtil.getTheme();

    expect(theme).toBe('light');
  });

  test('should return dark if value is dark even if os is light', async () => {
    matchMediaMock.mockReturnValue({ matches: false });
    vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.DarkEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('dark');
  });

  test('should return light if value is light even if os is dark', async () => {
    matchMediaMock.mockReturnValue({ matches: true });
    vi.mocked(window.getConfigurationValue).mockResolvedValue(AppearanceSettings.LightEnumValue);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe('light');
  });

  test('should return custom value even if os is dark', async () => {
    matchMediaMock.mockReturnValue({ matches: true });
    const customTheme = 'fooTheme';
    vi.mocked(window.getConfigurationValue).mockResolvedValue(customTheme);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe(customTheme);
  });

  test('should return custom value even if os is dark when matches found', async () => {
    matchMediaMock.mockReturnValue({ matches: false });

    const customTheme = 'fooTheme';
    vi.mocked(window.getConfigurationValue).mockResolvedValue(customTheme);

    const theme = await appearanceUtil.getTheme();
    expect(theme).toBe(customTheme);
  });
});
