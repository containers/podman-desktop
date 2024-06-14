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

import type { App } from 'electron';
import { app, BrowserWindow } from 'electron';
import { afterEach, assert, beforeEach, expect, test, vi } from 'vitest';

import {
  handleAdditionalProtocolLauncherArgs,
  handleOpenUrl,
  mainWindowDeferred,
  sanitizeProtocolForExtension,
} from './index.js';
import { Deferred } from './plugin/util/deferred.js';
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
vi.mock('electron-is-dev', async () => {
  return {};
});
vi.mock('electron-context-menu', async () => {
  return {
    default: vi.fn(),
  };
});
vi.mock('electron-util/main', async () => {
  return {
    aboutMenuItem: vi.fn(),
  };
});

vi.mock('./plugin', async () => {
  const extensionLoader = {
    getConfigurationRegistry: vi.fn(),
  };
  return {
    PluginSystem: vi.fn().mockImplementation(() => {
      return {
        initExtensions: vi.fn().mockImplementation(() => extensionLoader),
      };
    }),
  };
});

vi.mock('./util', async () => {
  return {
    isWindows: vi.fn().mockReturnValue(false),
    isMac: vi.fn().mockReturnValue(false),
    isLinux: vi.fn().mockReturnValue(false),
  };
});

vi.mock('electron', async () => {
  class MyCustomWindow {
    static singleton = new MyCustomWindow();
    constructor() {}

    loadURL(): void {}
    setBounds(): void {}

    on(): void {}

    show(): void {}
    focus(): void {}
    isMinimized(): boolean {
      return false;
    }
    isDestroyed(): boolean {
      return false;
    }

    static getAllWindows(): unknown[] {
      return [MyCustomWindow.singleton];
    }
  }

  return {
    autoUpdater: {
      on: vi.fn(),
    },

    screen: {
      getCursorScreenPoint: vi.fn(),
      getDisplayNearestPoint: vi.fn().mockImplementation(() => {
        const workArea = { x: 0, y: 0, width: 0, height: 0 };
        return { workArea };
      }),
    },
    app: {
      getAppPath: (): string => 'a-custom-appPath',
      getPath: (): string => 'a-custom-path',
      disableHardwareAcceleration: vi.fn(),
      requestSingleInstanceLock: vi.fn().mockReturnValue(true),
      quit: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      whenReady: vi.fn().mockReturnValue(constants.appReadyDeferredPromise),
      setAppUserModelId: vi.fn(),
    },
    ipcMain: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    },
    nativeTheme: {
      on: vi.fn(),
    },
    Menu: {
      buildFromTemplate: vi.fn(),
      getApplicationMenu: vi.fn(),
    },
    BrowserWindow: MyCustomWindow /*{
      getAllWindows: vi.fn().mockReturnValue([]),
    },*/,
    Tray: vi.fn().mockImplementation(() => {
      return {
        tray: vi.fn(),
        setImage: vi.fn(),
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
      };
    }),
  };
});

beforeEach(() => {
  console.log = consoleLogMock;
  vi.clearAllMocks();
  // reset the promise
  if (mainWindowDeferred.promise !== undefined) {
    mainWindowDeferred.promise = new Promise<BrowserWindow>((resolve, reject) => {
      mainWindowDeferred.resolve = resolve;
      mainWindowDeferred.reject = reject;
    });
  }
});

afterEach(() => {
  console.log = originalConsoleLog;
});

test('should send the URL to open when mainWindow is created', async () => {
  handleOpenUrl('podman-desktop:extension/my.extension');

  const deferredCall = new Deferred<boolean>();
  const sendMock = vi.fn().mockImplementation(() => {
    deferredCall.resolve(true);
  });
  const fakeWindow = {
    isDestroyed: vi.fn(),
    webContents: {
      send: sendMock,
    },
  } as unknown as BrowserWindow;

  mainWindowDeferred.resolve(fakeWindow);

  // wait sendMock being called
  await deferredCall.promise;

  expect(sendMock).toHaveBeenCalledWith('podman-desktop-protocol:install-extension', 'my.extension');
});

test('should send the URL to open when mainWindow is created with :// format', async () => {
  handleOpenUrl('podman-desktop://extension/my.extension');

  const deferredCall = new Deferred<boolean>();
  const sendMock = vi.fn().mockImplementation(() => {
    deferredCall.resolve(true);
  });
  const fakeWindow = {
    isDestroyed: vi.fn(),
    webContents: {
      send: sendMock,
    },
  } as unknown as BrowserWindow;

  mainWindowDeferred.resolve(fakeWindow);

  // wait sendMock being called
  await deferredCall.promise;

  expect(sendMock).toHaveBeenCalledWith('podman-desktop-protocol:install-extension', 'my.extension');
});

test('should not send the URL for invalid URLs', async () => {
  handleOpenUrl('podman-desktop:foobar');

  const sendMock = vi.fn();

  // expect an error
  expect(consoleLogMock).toHaveBeenCalledWith(
    'url podman-desktop:foobar does not start with podman-desktop:extension/, skipping.',
  );
  expect(sendMock).not.toHaveBeenCalled();
});

test('should handle podman-desktop:extension/ URL on Windows', async () => {
  vi.spyOn(util, 'isWindows').mockReturnValue(true);

  const deferredCall = new Deferred<boolean>();
  const sendMock = vi.fn().mockImplementation(() => {
    deferredCall.resolve(true);
  });

  const fakeWindow = {
    isDestroyed: vi.fn(),
    webContents: {
      send: sendMock,
    },
  } as unknown as BrowserWindow;
  mainWindowDeferred.resolve(fakeWindow);

  handleAdditionalProtocolLauncherArgs(['podman-desktop:extension/my.extension']);

  // wait sendMock being called
  await deferredCall.promise;

  // expect handleOpenUrl not be called
  expect(fakeWindow.webContents.send).toHaveBeenCalledWith('podman-desktop-protocol:install-extension', 'my.extension');
});

test('should handle podman-desktop://extension/my.extension format URL on Windows', async () => {
  vi.spyOn(util, 'isWindows').mockReturnValue(true);

  const deferredCall = new Deferred<boolean>();
  const sendMock = vi.fn().mockImplementation(() => {
    deferredCall.resolve(true);
  });

  const fakeWindow = {
    isDestroyed: vi.fn(),
    webContents: {
      send: sendMock,
    },
  } as unknown as BrowserWindow;
  mainWindowDeferred.resolve(fakeWindow);

  handleAdditionalProtocolLauncherArgs(['podman-desktop://extension/my.extension']);

  // wait sendMock being called
  await deferredCall.promise;

  // expect handleOpenUrl not be called
  expect(fakeWindow.webContents.send).toHaveBeenCalledWith('podman-desktop-protocol:install-extension', 'my.extension');
});

test('should not do anything with podman-desktop:extension/ URL on OS different than Windows', async () => {
  vi.spyOn(util, 'isWindows').mockReturnValue(false);

  // spy .promise field of mainWindowDeferred
  const spyWindowDefferedPromise = vi.spyOn(mainWindowDeferred, 'promise', 'get');

  handleAdditionalProtocolLauncherArgs(['podman-desktop:extension/my.extension']);
  // no called on it
  expect(spyWindowDefferedPromise).not.toHaveBeenCalled();
});

test('handle sanitizeProtocolForExtension', () => {
  const fakeLink = 'podman-desktop://extension/my.extension';
  const sanitizedLink = 'podman-desktop:extension/my.extension';
  expect(sanitizeProtocolForExtension(fakeLink)).toEqual(sanitizedLink);
});

test('handle sanitizeProtocolForExtension noop', () => {
  const sanitizedLink = 'podman-desktop:extension/my.extension';
  expect(sanitizeProtocolForExtension(sanitizedLink)).toEqual(sanitizedLink);
});

test('app-ready event with activate event', async () => {
  vi.mocked(util.isMac).mockReset();
  vi.mocked(util.isMac).mockReturnValue(true);

  // grab all windows
  const windows = BrowserWindow.getAllWindows();
  expect(windows).toHaveLength(1);

  const window = windows[0];
  const spyShow = vi.spyOn(window, 'show');
  const spyFocus = vi.spyOn(window, 'focus');

  let activateCallback: ((event: unknown) => void) | undefined = undefined;

  // capture activate event
  // eslint-disable-next-line @typescript-eslint/ban-types
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
});
