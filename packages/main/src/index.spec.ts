/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  handleAdditionalProtocolLauncherArgs,
  handleOpenUrl,
  mainWindowDeferred,
  sanitizeProtocolForExtension,
} from './index.js';
import type { BrowserWindow } from 'electron';
import { Deferred } from './plugin/util/deferred.js';
import * as util from './util.js';

const consoleLogMock = vi.fn();
const originalConsoleLog = console.log;

/* eslint-disable @typescript-eslint/no-empty-function */

vi.mock('electron-is-dev', async () => {
  return {};
});
vi.mock('electron-context-menu', async () => {
  return {
    default: vi.fn(),
  };
});
vi.mock('electron-util', async () => {
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

vi.mock('../util', async () => {
  return {
    isWindows: () => false,
  };
});

vi.mock('electron', async () => {
  class MyCustomWindow {
    constructor() {}

    loadURL() {}
    setBounds() {}

    on() {}

    static getAllWindows() {
      return [];
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
      getAppPath: () => 'a-custom-appPath',
      getPath: () => 'a-custom-path',
      disableHardwareAcceleration: vi.fn(),
      requestSingleInstanceLock: vi.fn().mockReturnValue(true),
      quit: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      whenReady: vi.fn().mockReturnValue(new Promise(() => {})),
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
