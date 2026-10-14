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

import { vi } from 'vitest';

vi.mock(import('electron'), async () => {
  class BrowserWindowMock {
    loadURL = vi.fn();
    setBounds = vi.fn();
    on = vi.fn();
    show = vi.fn();
    focus = vi.fn();
    isMinimized = vi.fn();
    isDestroyed = vi.fn();
    webContents = {
      send: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
    };
  }

  class TrayMock {
    setImage = vi.fn();
    setToolTip = vi.fn();
    setContextMenu = vi.fn();
    isDestroyed = vi.fn();
    on = vi.fn();
  }

  class NotificationMock {
    show = vi.fn();
    close = vi.fn();
  }

  return {
    app: {
      getAppPath: vi.fn().mockReturnValue(''),
      getVersion: vi.fn(),
      getPath: vi.fn(),
      getName: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      quit: vi.fn(),
      whenReady: vi.fn(),
      disableHardwareAcceleration: vi.fn(),
      requestSingleInstanceLock: vi.fn(),
      getLoginItemSettings: vi.fn(),
      setLoginItemSettings: vi.fn(),
      setAppUserModelId: vi.fn(),
      dock: {
        hide: vi.fn(),
        show: vi.fn(),
      },
    },
    ipcMain: {
      handle: vi.fn(),
      on: vi.fn(),
      emit: vi.fn(),
    },
    BrowserWindow: Object.assign(vi.fn(BrowserWindowMock), {
      getAllWindows: vi.fn(),
    }),
    shell: {
      openExternal: vi.fn(),
    },
    clipboard: {
      writeText: vi.fn(),
    },
    dialog: {
      showOpenDialog: vi.fn(),
      showMessageBox: vi.fn(),
      showSaveDialog: vi.fn(),
    },
    nativeTheme: {
      shouldUseDarkColors: false,
      on: vi.fn(),
      off: vi.fn(),
      themeSource: 'system',
    },
    nativeImage: {
      createFromBitmap: vi.fn(),
      createFromDataURL: vi.fn(),
      createFromBuffer: vi.fn(),
      createFromPath: vi.fn(),
    },
    screen: {
      getCursorScreenPoint: vi.fn(),
      getDisplayNearestPoint: vi.fn(),
      getDisplayMatching: vi.fn(),
    },
    Menu: Object.assign(vi.fn(), {
      buildFromTemplate: vi.fn(),
      getApplicationMenu: vi.fn(),
      setApplicationMenu: vi.fn(),
    }),
    MenuItem: vi.fn(),
    Tray: TrayMock,
    Notification: NotificationMock,
    safeStorage: {
      isEncryptionAvailable: vi.fn(),
      encryptString: vi.fn(),
      decryptString: vi.fn(),
    },
    autoUpdater: {
      on: vi.fn(),
    },
    webContents: {
      getAllWebContents: vi.fn(),
      fromId: vi.fn(),
    },
  } as unknown as typeof Electron;
});
