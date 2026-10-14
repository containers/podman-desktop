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

import { existsSync, unlink } from 'node:fs';
import path from 'node:path';

import { app } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';

import { WindowsStartup } from './windows-startup.js';

vi.mock(import('node:fs'));

const minimizeOnStatup = vi.fn();
const configurationRegistry = {
  getConfiguration: () => ({
    get: minimizeOnStatup,
  }),
  updateConfigurationValue: vi.fn(),
} as unknown as ConfigurationRegistry;

function mockAppGetPath(exe = appExePath, temp = tempPath, appData = appDataPath): void {
  vi.mocked(app.getPath).mockImplementation(name => {
    switch (name) {
      case 'exe':
        return exe;
      case 'temp':
        return temp;
      case 'appData':
        return appData;
      default:
        throw new Error('Unsupported path');
    }
  });
}

function mockFsExists(exists: boolean): void {
  vi.mocked(existsSync).mockReturnValue(exists);
}

let windowsStartup: WindowsStartup;
const appExePath = path.join('app-name', 'Podman Desktop.exe');
const tempPath = 'temp';
const appDataPath = 'AppData';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  mockAppGetPath();
  minimizeOnStatup.mockReturnValue(true);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: false,
    wasOpenedAtLogin: false,
    status: 'not-registered',
    executableWillLaunchAtLogin: false,
    launchItems: [],
  });
});

test('Auto startup should not be enable for not portable installation in temp folder', async () => {
  vi.mocked(app.getPath).mockRestore();
  mockAppGetPath(path.join(tempPath, appExePath), tempPath);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();
  expect(app.setLoginItemSettings).not.toHaveBeenCalled();
});

test('Autostart should be enabled for portable installation', async () => {
  const portablePath = path.join('portable', 'location', 'Podman Desktop.exe');
  vi.spyOn(process, 'env', 'get').mockReturnValue({
    PORTABLE_EXECUTABLE_FILE: portablePath,
  });
  mockFsExists(false);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();
  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${portablePath}"`,
    args: ['--minimized'],
    enabled: true,
  });
});

test('Autostart should be enabled for updated application when present', async () => {
  mockFsExists(true);
  const resolvedUpdatedExecPath = path.join('Programs', 'Podman Desktop.exe');
  vi.spyOn(path, 'resolve').mockReturnValue(resolvedUpdatedExecPath);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();
  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${resolvedUpdatedExecPath}"`,
    args: ['--minimized'],
    enabled: true,
  });
});

test('Autostart enable call should setup startup at login for normal installation minimized', async () => {
  mockFsExists(false);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();
  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${appExePath}"`,
    args: ['--minimized'],
    enabled: true,
  });
});

test('Autostart enable call should setup startup at login for normal installation not minimized', async () => {
  mockFsExists(false);
  minimizeOnStatup.mockReturnValue(false);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();
  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${appExePath}"`,
    args: [],
    enabled: true,
  });
});

test('Autostart should be re-enabled from Podman Desktop settings', async () => {
  mockFsExists(false);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: true,
    wasOpenedAtLogin: false,
    status: 'enabled',
    executableWillLaunchAtLogin: false,
    launchItems: [
      {
        name: 'Podman Desktop',
        path: appExePath,
        args: ['--minimized'],
        scope: 'user',
        enabled: false,
      },
    ],
  });
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.enable(true);

  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${appExePath}"`,
    args: ['--minimized'],
    enabled: true,
  });
});

test('Autostart should be re-enabled when startup arguments change', async () => {
  mockFsExists(false);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: false,
    wasOpenedAtLogin: false,
    status: 'not-registered',
    executableWillLaunchAtLogin: false,
    launchItems: [
      {
        name: 'Podman Desktop',
        path: appExePath,
        args: [],
        scope: 'user',
        enabled: false,
      },
    ],
  });
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.enable(true);

  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${appExePath}"`,
    args: ['--minimized'],
    enabled: true,
  });
});

test('Autostart update should keep a disabled Windows startup item disabled', async () => {
  mockFsExists(false);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: false,
    wasOpenedAtLogin: false,
    status: 'enabled',
    executableWillLaunchAtLogin: false,
    launchItems: [
      {
        name: 'Podman Desktop',
        path: appExePath,
        args: [],
        scope: 'user',
        enabled: false,
      },
    ],
  });
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.enable();

  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: true,
    path: `"${appExePath}"`,
    args: ['--minimized'],
    enabled: false,
  });
});

test('Autostart preference should reflect a disabled Windows startup item with different arguments', async () => {
  mockFsExists(false);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: true,
    wasOpenedAtLogin: false,
    status: 'enabled',
    executableWillLaunchAtLogin: false,
    launchItems: [
      {
        name: 'Podman Desktop',
        path: appExePath,
        args: [],
        scope: 'user',
        enabled: false,
      },
    ],
  });
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.syncStartupPreference();

  expect(configurationRegistry.updateConfigurationValue).toBeCalledWith('preferences.login.start', false);
  expect(app.setLoginItemSettings).not.toHaveBeenCalled();
});

test('Autostart preference should reflect an enabled Windows startup item', async () => {
  mockFsExists(false);
  vi.mocked(app.getLoginItemSettings).mockReturnValue({
    openAtLogin: true,
    wasOpenedAtLogin: false,
    status: 'enabled',
    executableWillLaunchAtLogin: true,
    launchItems: [
      {
        name: 'Podman Desktop',
        path: appExePath,
        args: [],
        scope: 'user',
        enabled: true,
      },
    ],
  });
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.syncStartupPreference();

  expect(configurationRegistry.updateConfigurationValue).toBeCalledWith('preferences.login.start', true);
});

test('Autostart preference should be disabled when no Windows startup item exists', async () => {
  mockFsExists(false);
  windowsStartup = new WindowsStartup(configurationRegistry);

  await windowsStartup.syncStartupPreference();

  expect(configurationRegistry.updateConfigurationValue).toBeCalledWith('preferences.login.start', false);
  expect(app.setLoginItemSettings).not.toHaveBeenCalled();
});

test('Autostart enable call should remove existing startup file when present', async () => {
  // Mock that the startup file exists
  mockFsExists(true);
  const expectedStartupFilePath = path.resolve(
    appDataPath,
    'Microsoft/Windows/Start Menu/Programs/Startup',
    'podman-desktop.vbs',
  );

  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.enable();

  // Verify unlink was called with the correct path
  expect(unlink).toHaveBeenCalledWith(expectedStartupFilePath, expect.any(Function));
});

test('Autostart disable call should disable startup at login', async () => {
  mockFsExists(false);
  windowsStartup = new WindowsStartup(configurationRegistry);
  await windowsStartup.disable();
  expect(app.setLoginItemSettings).toBeCalledWith({
    openAtLogin: false,
    path: undefined,
    args: undefined,
  });
});
