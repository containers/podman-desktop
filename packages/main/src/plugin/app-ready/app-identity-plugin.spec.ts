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
import { join, resolve } from 'node:path';

import type { App as ElectronApp } from 'electron';
import { nativeImage } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { isMac } from '/@/util.js';

import { AppIdentityDevPlugin } from './app-identity-plugin.js';
import type { DevIconBuilder } from './dev-icon-builder.js';

vi.mock(import('/@/util.js'));

const APP_ROOT_PATH = '/mock/appRoot';

const mockBuildIcon = vi.fn();
const mockIconBuilder = { buildIcon: mockBuildIcon } as unknown as DevIconBuilder;

function createMockApp(overrides?: Partial<ElectronApp>): ElectronApp {
  return {
    getPath: vi.fn().mockImplementation((name: string) => `/mock/${name}`),
    getAppPath: vi.fn().mockReturnValue(APP_ROOT_PATH),
    setPath: vi.fn(),
    dock: {
      setIcon: vi.fn(),
    },
    ...overrides,
  } as unknown as ElectronApp;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('onBeforeReady', () => {
  test('should redirect userData to the app launch folder', () => {
    import.meta.env['VITE_GIT_BRANCH'] = '';
    const app = createMockApp();
    const plugin = new AppIdentityDevPlugin(app, mockIconBuilder);

    plugin.onBeforeReady();

    expect(app.setPath).toHaveBeenCalledWith('userData', join(APP_ROOT_PATH, '.electron-user-data'));
  });
});

describe('onReady', () => {
  test('should build dynamic dock icon on macOS using last branch segment', async () => {
    import.meta.env['VITE_GIT_BRANCH'] = 'user/my-feature';
    vi.mocked(isMac).mockReturnValue(true);
    const mockBaseIcon = { mock: 'base' };
    const mockBuiltIcon = { mock: 'built' };
    vi.mocked(nativeImage.createFromPath).mockReturnValue(mockBaseIcon as never);
    mockBuildIcon.mockReturnValue(mockBuiltIcon);
    const app = createMockApp();
    const plugin = new AppIdentityDevPlugin(app, mockIconBuilder);

    plugin.onBeforeReady();
    await plugin.onReady();

    expect(nativeImage.createFromPath).toHaveBeenCalledWith(resolve(APP_ROOT_PATH, 'buildResources/icon.png'));
    expect(mockBuildIcon).toHaveBeenCalledWith(mockBaseIcon, 'my-featu');
    expect(app.dock?.setIcon).toHaveBeenCalledWith(mockBuiltIcon);
  });

  test('should fall back to DEV label when branch is unavailable', async () => {
    import.meta.env['VITE_GIT_BRANCH'] = '';
    vi.mocked(isMac).mockReturnValue(true);
    const mockBaseIcon = { mock: 'base' };
    vi.mocked(nativeImage.createFromPath).mockReturnValue(mockBaseIcon as never);
    mockBuildIcon.mockReturnValue(mockBaseIcon);
    const app = createMockApp();
    const plugin = new AppIdentityDevPlugin(app, mockIconBuilder);

    plugin.onBeforeReady();
    await plugin.onReady();

    expect(mockBuildIcon).toHaveBeenCalledWith(mockBaseIcon, 'DEV');
  });

  test('should not set dock icon on non-macOS', async () => {
    import.meta.env['VITE_GIT_BRANCH'] = '';
    vi.mocked(isMac).mockReturnValue(false);
    const app = createMockApp();
    const plugin = new AppIdentityDevPlugin(app, mockIconBuilder);

    await plugin.onReady();

    expect(nativeImage.createFromPath).not.toHaveBeenCalled();
    expect(mockBuildIcon).not.toHaveBeenCalled();
  });
});

describe('getWindowIcon', () => {
  function callWithBranch(branch: string): string {
    import.meta.env['VITE_GIT_BRANCH'] = branch;
    const mockBaseIcon = { mock: 'base' };
    vi.mocked(nativeImage.createFromPath).mockReturnValue(mockBaseIcon as never);
    mockBuildIcon.mockReturnValue(mockBaseIcon);
    const plugin = new AppIdentityDevPlugin(createMockApp(), mockIconBuilder);
    plugin.onBeforeReady();
    plugin.getWindowIcon();
    return mockBuildIcon.mock.calls[0]![1] as string;
  }

  test('should return a dynamically built dev icon', () => {
    import.meta.env['VITE_GIT_BRANCH'] = 'my-branch';
    const mockBaseIcon = { mock: 'base' };
    const mockBuiltIcon = { mock: 'built' };
    vi.mocked(nativeImage.createFromPath).mockReturnValue(mockBaseIcon as never);
    mockBuildIcon.mockReturnValue(mockBuiltIcon);
    const app = createMockApp();
    const plugin = new AppIdentityDevPlugin(app, mockIconBuilder);
    plugin.onBeforeReady();

    const result = plugin.getWindowIcon();

    expect(nativeImage.createFromPath).toHaveBeenCalledWith(resolve(APP_ROOT_PATH, 'buildResources/icon.png'));
    expect(mockBuildIcon).toHaveBeenCalledWith(mockBaseIcon, 'my-branc');
    expect(result).toBe(mockBuiltIcon);
  });

  test('should use DEV label when branch is empty', () => {
    expect(callWithBranch('')).toBe('DEV');
  });

  test('should take last slash segment and truncate to 8 chars', () => {
    expect(callWithBranch('feat/a-very-long-branch-name')).toBe('a-very-l');
  });

  test('should extract GH issue number with prefix from branch', () => {
    expect(callWithBranch('user/gh-1234-fix-something')).toBe('GH 1234');
  });

  test('should extract GH issue number without prefix from branch', () => {
    expect(callWithBranch('GH-5678')).toBe('GH 5678');
  });

  test('should extract PR number from branch', () => {
    expect(callWithBranch('pr-999-review')).toBe('PR 999');
  });
});
