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

import * as os from 'node:os';

import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type { Configuration } from '@podman-desktop/api';
import { app } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import { StartupInstall } from './startup-install.js';

vi.mock(import('node:os'));

const windowsStartupMock = vi.hoisted(() => ({
  shouldEnable: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  syncStartupPreference: vi.fn(),
}));

vi.mock(import('./windows-startup.js'), async importOriginal => {
  const { WindowsStartup } = await importOriginal();
  return {
    WindowsStartup: class extends WindowsStartup {
      override shouldEnable(): boolean {
        return windowsStartupMock.shouldEnable();
      }

      override enable(forceEnable?: boolean): Promise<void> {
        return windowsStartupMock.enable(forceEnable);
      }

      override disable(): Promise<void> {
        return windowsStartupMock.disable();
      }

      override syncStartupPreference(): Promise<void> {
        return windowsStartupMock.syncStartupPreference();
      }
    },
  };
});

const macosStartupMock = vi.hoisted(() => ({
  shouldEnable: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
}));

vi.mock(import('./macos-startup.js'), async importOriginal => {
  const { MacosStartup } = await importOriginal();
  return {
    MacosStartup: class extends MacosStartup {
      override shouldEnable(): boolean {
        return macosStartupMock.shouldEnable();
      }

      override enable(): Promise<void> {
        return macosStartupMock.enable();
      }

      override disable(): Promise<void> {
        return macosStartupMock.disable();
      }
    },
  };
});

let startOnLogin: boolean;
let configurationRegistry: IConfigurationRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('PROD', true);
  vi.mocked(os.platform).mockReturnValue('win32');
  windowsStartupMock.shouldEnable.mockReturnValue(true);
  macosStartupMock.shouldEnable.mockReturnValue(true);
  startOnLogin = true;
  configurationRegistry = {
    registerConfigurations: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
    updateConfigurationValue: vi.fn(async (key, value) => {
      if (key === 'preferences.login.start') {
        startOnLogin = value as boolean;
      }
    }),
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn().mockImplementation(key => (key === 'start' ? startOnLogin : undefined)),
    } as unknown as Configuration),
  } as unknown as IConfigurationRegistry;
});

test('Windows startup preference is synchronized before applying startup configuration', async () => {
  windowsStartupMock.syncStartupPreference.mockImplementation(async () => {
    await configurationRegistry.updateConfigurationValue('preferences.login.start', false);
  });
  const startupInstall = new StartupInstall(configurationRegistry);

  await startupInstall.configure();

  expect(windowsStartupMock.syncStartupPreference).toHaveBeenCalledOnce();
  expect(windowsStartupMock.enable).not.toHaveBeenCalled();
});

test('Windows startup preference synchronization failure does not prevent startup configuration', async () => {
  const error = new Error('sync failed');
  windowsStartupMock.syncStartupPreference.mockRejectedValue(error);
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const startupInstall = new StartupInstall(configurationRegistry);

  await startupInstall.configure();

  expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to synchronize Windows startup preference', error);
  expect(configurationRegistry.onDidChangeConfiguration).toHaveBeenCalledOnce();
  expect(windowsStartupMock.enable).toHaveBeenCalledOnce();
});

test('Enabling startup from preferences re-enables the Windows startup item', async () => {
  const startupInstall = new StartupInstall(configurationRegistry);
  await startupInstall.configure();
  const configurationListener = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];

  await configurationListener?.({ key: 'preferences.login.start', value: true, scope: 'DEFAULT' });

  expect(windowsStartupMock.enable).toHaveBeenCalledTimes(2);
  expect(windowsStartupMock.enable).toHaveBeenLastCalledWith(true);
});

test('Changing minimize preference does not force the Windows startup item to be enabled', async () => {
  const startupInstall = new StartupInstall(configurationRegistry);
  await startupInstall.configure();
  const configurationListener = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];

  await configurationListener?.({ key: 'preferences.login.minimize', value: true, scope: 'DEFAULT' });

  expect(windowsStartupMock.enable).toHaveBeenCalledTimes(2);
  expect(windowsStartupMock.enable).toHaveBeenLastCalledWith(false);
});

test('Disabling startup from preferences disables the Windows startup item', async () => {
  const startupInstall = new StartupInstall(configurationRegistry);
  await startupInstall.configure();
  const configurationListener = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];

  await configurationListener?.({ key: 'preferences.login.start', value: false, scope: 'DEFAULT' });

  expect(windowsStartupMock.disable).toHaveBeenCalledOnce();
});

test('Enabling startup from preferences enables the macOS startup item', async () => {
  vi.mocked(os.platform).mockReturnValue('darwin');
  vi.mocked(app.getPath).mockReturnValue('/Users/user');
  const startupInstall = new StartupInstall(configurationRegistry);
  await startupInstall.configure();
  const configurationListener = vi.mocked(configurationRegistry.onDidChangeConfiguration).mock.calls[0]?.[0];

  await configurationListener?.({ key: 'preferences.login.start', value: true, scope: 'DEFAULT' });

  expect(macosStartupMock.enable).toHaveBeenCalledTimes(2);
  expect(windowsStartupMock.syncStartupPreference).not.toHaveBeenCalled();
  expect(windowsStartupMock.enable).not.toHaveBeenCalled();
});
