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

import type { IConfigurationChangeEvent, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type { App } from 'electron';
import { app, BrowserWindow, Menu } from 'electron';
import { aboutMenuItem } from 'electron-util/main';
import { afterEach, assert, beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';

import { mainWindowDeferred } from './index.js';
import { Emitter } from './plugin/events/emitter.js';
import { PluginSystem } from './plugin/index.js';
import * as util from './util.js';

const consoleLogMock = vi.fn();
const originalConsoleLog = console.log;

const constants = vi.hoisted(() => {
  let resolveFn: ((value: void | PromiseLike<void>) => void) | undefined = undefined;
  return {
    appReadyDeferredPromise: new Promise<void>(resolve => {
      resolveFn = resolve;
    }),
    resolveFn,
  };
});

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
vi.mock(import('electron-is-dev'), async () => {
  return {};
});
vi.mock(import('electron-context-menu'), async () => {
  return {
    default: vi.fn(),
  };
});
vi.mock(import('electron-util/main'), async () => {
  return {
    aboutMenuItem: vi.fn().mockReturnValue({ label: 'foo' }),
  };
});

const _onDidChangeConfiguration = new Emitter<IConfigurationChangeEvent>();
const configurationRegistryMock = {
  onDidChangeConfiguration: _onDidChangeConfiguration.event,
  registerConfigurations: vi.fn(),
  getConfigurationProperties: vi.fn().mockReturnValue({}),
  getConfiguration: vi.fn().mockReturnValue({
    get: vi.fn(),
  }),
} as unknown as IConfigurationRegistry;

const fakeWindow = {
  isDestroyed: vi.fn(),
  isMinimized: vi.fn().mockReturnValue(false),
  show: vi.fn(),
  focus: vi.fn(),
  restore: vi.fn(),
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

const extensionLoader = {
  getConfigurationRegistry: vi.fn(),
} as unknown as ExtensionLoader;

vi.mock(import('/@/plugin/app-ready/app-identity-plugin.js'));
vi.mock(import('./index.js'), async importOriginal => {
  const electron = await import('electron');
  vi.mocked(electron.app.whenReady).mockReturnValue(constants.appReadyDeferredPromise);
  vi.mocked(electron.app.requestSingleInstanceLock).mockReturnValue(true);
  return importOriginal();
});
vi.mock(import('./plugin/index.js'));
vi.mock(import('./util.js'), () => ({
  isWindows: vi.fn().mockReturnValue(false),
  isMac: vi.fn().mockReturnValue(false),
  isLinux: vi.fn().mockReturnValue(false),
}));

beforeEach(() => {
  console.log = consoleLogMock;
  vi.clearAllMocks();

  vi.mocked(PluginSystem.prototype.initExtensions).mockResolvedValue(extensionLoader);

  vi.mocked(app.whenReady).mockReturnValue(constants.appReadyDeferredPromise);
  vi.mocked(app.getPath).mockReturnValue('');
  vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([fakeWindow]);
  const newDefer = Promise.withResolvers<BrowserWindow>();
  if (mainWindowDeferred.promise !== undefined) {
    mainWindowDeferred.resolve = newDefer.resolve;
    mainWindowDeferred.promise = newDefer.promise;
    mainWindowDeferred.reject = newDefer.reject;
  }
  mainWindowDeferred.resolve(fakeWindow);
});

afterEach(() => {
  console.log = originalConsoleLog;
});

test('app-ready event with activate event', async () => {
  vi.mocked(util.isMac).mockReset();
  vi.mocked(util.isMac).mockReturnValue(true);

  // grab all windows
  const windows = BrowserWindow.getAllWindows();
  expect(windows).toHaveLength(1);

  const window = windows[0];
  if (!window) {
    assert.fail('window is undefined');
  }
  const spyShow = vi.spyOn(window, 'show');
  const spyFocus = vi.spyOn(window, 'focus');

  let activateCallback: ((event: unknown) => void) | undefined = undefined;

  // capture activate event
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  vi.mocked(app.on).mockImplementation((event: string, callback: Function): App => {
    if (event === 'activate') {
      activateCallback = callback as (event: unknown) => void;
    }
    return app;
  });

  if (constants.resolveFn) {
    const appReady: (value: void | Promise<void>) => void = constants.resolveFn;
    if (constants.resolveFn) {
      appReady();
    }
  } else {
    assert.fail('constants.resolveFn is undefined');
  }
  // wait activateCallback being set
  await vi.waitUntil(() => activateCallback !== undefined);
  // now, check that we called
  activateCallback!({});

  // expect show and focus have been called
  expect(spyShow).toHaveBeenCalled();
  expect(spyFocus).toHaveBeenCalled();

  // capture the pluginSystem.initExtensions call
  const initExtensionsCalls = vi.mocked(PluginSystem.prototype.initExtensions).mock.calls;
  expect(initExtensionsCalls).toHaveLength(1);

  // grab onDidConfigurationRegistry parameter
  const _onDidConfigurationRegistry = initExtensionsCalls?.[0]?.[0];
  // call the onDidConfigurationRegistry
  expect(_onDidConfigurationRegistry).toBeDefined();

  // cast as Emitter
  const onDidConfigurationRegistry = _onDidConfigurationRegistry as unknown as Emitter<IConfigurationRegistry>;

  // create a Menu
  vi.mocked(Menu.getApplicationMenu).mockReturnValue({
    items: [
      {
        role: 'help',
        submenu: {
          items: [],
        },
      },
    ],
  } as unknown as Menu);
  vi.mocked(aboutMenuItem).mockReturnValue({
    label: 'About',
  });
  vi.mocked(Menu.buildFromTemplate).mockReturnValue({} as unknown as Menu);

  onDidConfigurationRegistry.fire(configurationRegistryMock);

  // check we've called Menu.getApplicationMenu
  await vi.waitFor(() => expect(vi.mocked(Menu.getApplicationMenu)).toHaveBeenCalled());

  // and Menu.buildFromTemplate
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalled();

  // and Menu.setApplicationMenu
  expect(vi.mocked(Menu.setApplicationMenu)).toHaveBeenCalled();
});
