/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import type { App as ElectronApp } from 'electron';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { AppPlugin } from '/@/plugin/app-ready/app-plugin.js';
import { DefaultProtocolClient } from '/@/plugin/app-ready/default-protocol-client.js';
import { WindowPlugin } from '/@/plugin/app-ready/window-plugin.js';
import { SecurityRestrictions } from '/@/security-restrictions.js';
import { isLinux, isMac, isWindows } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import { Main } from './main.js';

vi.mock(import('/@/plugin/app-ready/app-identity-plugin.js'));
vi.mock(import('/@/plugin/app-ready/dev-icon-builder.js'));
vi.mock(import('/@/util.js'));
vi.mock(import('/@/security-restrictions.js'));
vi.mock(import('electron-context-menu'), () => ({
  default: vi.fn(),
}));

// App Plugin
vi.mock(import('/@/plugin/app-ready/default-protocol-client.js'));
vi.mock(import('/@/plugin/app-ready/window-plugin.js'));
vi.mock(import('/@product.json'));

const ELECTRON_APP_MOCK: ElectronApp = {
  name: 'dummy-electron-mock',
  getAppPath: vi.fn().mockReturnValue('/mock/app'),
  disableHardwareAcceleration: vi.fn(),
  requestSingleInstanceLock: vi.fn(),
  setAppUserModelId: vi.fn(),
  quit: vi.fn(),
  on: vi.fn(),
  whenReady: vi.fn(),
  setAsDefaultProtocolClient: vi.fn(),
  isReady: vi.fn(),
  commandLine: {
    appendSwitch: vi.fn(),
  },
} as unknown as ElectronApp;

let PROCESS_EXIT_ORIGINAL: typeof process.exit;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(product).appId = 'io.test_app.TestApp';

  // mock process.exit
  PROCESS_EXIT_ORIGINAL = process.exit;
  (process.exit as unknown) = vi.fn();

  // mock current being primary instance
  vi.mocked(ELECTRON_APP_MOCK.requestSingleInstanceLock).mockReturnValue(true);
});

afterEach(() => {
  // restore proper process.exit
  process.exit = PROCESS_EXIT_ORIGINAL;
});

test('running main for non-primary instance should quit application', () => {
  // mock current not primary instance
  vi.mocked(ELECTRON_APP_MOCK.requestSingleInstanceLock).mockReturnValue(false);

  const code = new Main(ELECTRON_APP_MOCK);
  code.main([]);

  expect(ELECTRON_APP_MOCK.quit).toHaveBeenCalledOnce();
  expect(process.exit).toHaveBeenCalledOnce();
});

test('hardware acceleration should be disabled', async () => {
  const code = new Main(ELECTRON_APP_MOCK);
  code.main([]);

  expect(ELECTRON_APP_MOCK.disableHardwareAcceleration).toHaveBeenCalledOnce();
});

test('security restriction should be initialized', async () => {
  const code = new Main(ELECTRON_APP_MOCK);
  code.main([]);

  expect(SecurityRestrictions.prototype.init).toHaveBeenCalledOnce();
});

test('on windows setAppUserModelId should be called', async () => {
  vi.mocked(isWindows).mockReturnValue(true);

  const code = new Main(ELECTRON_APP_MOCK);
  code.main([]);

  expect(ELECTRON_APP_MOCK.setAppUserModelId).toHaveBeenCalledWith('io.test_app.TestApp');
});

describe('gtk-version', () => {
  test('on linux gtk-version should be set to 3', () => {
    vi.mocked(isLinux).mockReturnValue(true);

    const code = new Main(ELECTRON_APP_MOCK);
    code.main([]);

    expect(ELECTRON_APP_MOCK.commandLine.appendSwitch).toHaveBeenCalledWith('gtk-version', '3');
  });

  test('non-linux platform should not define any gtk-version flag', async () => {
    vi.mocked(isLinux).mockReturnValue(false);

    const code = new Main(ELECTRON_APP_MOCK);
    code.main([]);

    expect(ELECTRON_APP_MOCK.commandLine.appendSwitch).not.toHaveBeenCalledWith('gtk-version', expect.anything());
  });
});

// Utility type definition for {@link ElectronApp.on} and {@link WebContents.on}
type Listener = (...args: unknown[]) => void;

/**
 * Utility function to get listener register in {@link ELECTRON_APP_MOCK.on}
 * @remarks cannot found any way to properly infer type based on event value (see https://github.com/microsoft/TypeScript/issues/53439)
 * @param event
 */
function findElectronAppListener(event: string): Listener | undefined {
  expect(ELECTRON_APP_MOCK.on).toHaveBeenCalledWith(event, expect.any(Function));
  return vi.mocked(ELECTRON_APP_MOCK.on).mock.calls.find(([mEvent]) => mEvent === event)?.[1];
}

/**
 * Based on {@link findElectronAppListener}, throw an error if the result is undefined
 * @param event
 */
function getElectronAppListener(event: string): Listener {
  const listener = findElectronAppListener(event);
  if (!listener) throw new Error(`cannot found listener for event ${event}`);
  return listener;
}

describe('ElectronApp#on window-all-closed', () => {
  let code: Main;
  beforeEach(() => {
    code = new Main(ELECTRON_APP_MOCK);
    code.main([]);
  });

  test('listener should be registered on init', () => {
    expect(ELECTRON_APP_MOCK.on).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
  });

  test('listener should be a valid function', () => {
    const listener = findElectronAppListener('window-all-closed');
    expect(listener).toBeDefined();
    expect(listener).toBeInstanceOf(Function);
  });

  test('listener should not call ElectronApp#quit on mac', () => {
    vi.mocked(isMac).mockReturnValue(true);

    const listener = getElectronAppListener('window-all-closed');
    listener();

    expect(ELECTRON_APP_MOCK.quit).not.toHaveBeenCalled();
  });

  test.each(['windows', 'linux'])('listener should not call ElectronApp#quit on %s', platform => {
    vi.mocked(isMac).mockReturnValue(false);
    vi.mocked(isWindows).mockReturnValue(platform === 'windows');
    vi.mocked(isLinux).mockReturnValue(platform === 'linux');

    const listener = getElectronAppListener('window-all-closed');
    listener();

    expect(ELECTRON_APP_MOCK.quit).toHaveBeenCalledOnce();
  });
});

describe('AppPlugin', () => {
  const plugins: Array<AppPlugin> = [DefaultProtocolClient.prototype, WindowPlugin.prototype];

  let promiseWithResolvers: PromiseWithResolvers<void>;

  beforeEach(() => {
    promiseWithResolvers = Promise.withResolvers<void>();

    // mock application as ready
    vi.mocked(ELECTRON_APP_MOCK.isReady).mockReturnValue(true);

    // mock the whenReady promise
    vi.mocked(ELECTRON_APP_MOCK.whenReady).mockReturnValue(promiseWithResolvers.promise);

    // start main
    const code = new Main(ELECTRON_APP_MOCK);
    code.main([]);
  });

  test('expect AppPlugin#onReady to be called when ElectronApp#whenReady resolved', async () => {
    // expect each plugin to have been instantiated
    plugins.forEach(plugin => {
      expect(plugin.onReady).not.toHaveBeenCalled();
    });

    // simulate on ready
    promiseWithResolvers.resolve();

    await vi.waitFor(() => {
      // expect each plugin to have been instantiated
      plugins.forEach(plugin => {
        expect(plugin.onReady).toHaveBeenCalled();
      });
    });
  });

  test('expect AppPlugin#dispose to be called when ElectronApp#on("before-quit") is emitted ', async () => {
    // expect each plugin to have been instantiated
    plugins.forEach(plugin => {
      expect(plugin.dispose).not.toHaveBeenCalled();
    });

    const listener = getElectronAppListener('before-quit');
    listener();

    await vi.waitFor(() => {
      // expect each plugin to be disposed
      plugins.forEach(plugin => {
        expect(plugin.dispose).toHaveBeenCalled();
      });
    });
  });
});
