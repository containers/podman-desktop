/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type { BrowserWindowConstructorOptions, FileFilter } from 'electron';
import { BrowserWindow, ipcMain, app, dialog, screen } from 'electron';
import contextMenu from 'electron-context-menu';
import { join } from 'path';
import { URL } from 'url';
import { isLinux, isMac } from './util';

async function createWindow() {
  const INITIAL_APP_WIDTH = 1050;
  const INITIAL_APP_MIN_WIDTH = 640;
  const INITIAL_APP_HEIGHT = 600;
  const INITIAL_APP_MIN_HEIGHT = 600;

  const browserWindowConstructorOptions: BrowserWindowConstructorOptions = {
    show: false, // Use 'ready-to-show' event to show window
    width: INITIAL_APP_WIDTH,
    minWidth: INITIAL_APP_MIN_WIDTH,
    minHeight: INITIAL_APP_MIN_HEIGHT,
    height: INITIAL_APP_HEIGHT,
    webPreferences: {
      webSecurity: false,
      //nativeWindowOpen: true,
      webviewTag: true, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  };
  // On Linux keep title bar as we may not have any tray icon
  // being displayed
  if (isMac) {
    browserWindowConstructorOptions.titleBarStyle = 'hiddenInset';
  }

  const browserWindow = new BrowserWindow(browserWindowConstructorOptions);
  const { getCursorScreenPoint, getDisplayNearestPoint } = screen;
  const workArea = getDisplayNearestPoint(getCursorScreenPoint()).workArea;

  const x = Math.round(workArea.width / 2 - INITIAL_APP_WIDTH / 2 + workArea.x);
  const y = Math.round(workArea.height / 2 - INITIAL_APP_HEIGHT / 2);

  browserWindow.setBounds({
    x: x,
    y: y,
    width: browserWindowConstructorOptions.width,
    height: browserWindowConstructorOptions.height,
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
    if (isMac) {
      app.dock.show();
    }

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });

  // select a file using native widget
  ipcMain.on('dialog:openFile', async (_, param: { dialogId: string; message: string; filter: FileFilter }) => {
    const response = await dialog.showOpenDialog(browserWindow, {
      properties: ['openFile'],
      filters: [param.filter],
      message: param.message,
    });
    // send the response back
    browserWindow.webContents.send('dialog:open-file-or-folder-response', param.dialogId, response);
  });

  // select a folder using native widget
  ipcMain.on('dialog:openFolder', async (_, param: { dialogId: string; message: string }) => {
    const response = await dialog.showOpenDialog(browserWindow, {
      properties: ['openDirectory'],
      message: param.message,
    });
    // send the response back
    browserWindow.webContents.send('dialog:open-file-or-folder-response', param.dialogId, response);
  });

  browserWindow.on('close', e => {
    if (!isLinux) {
      e.preventDefault();
      browserWindow.hide();
      if (isMac) {
        app.dock.hide();
      }
    }
  });

  app.on('before-quit', () => {
    browserWindow.destroy();
  });

  contextMenu({
    showLearnSpelling: false,
    showLookUpSelection: false,
    showSearchWithGoogle: false,
    showCopyImage: false,
    showCopyImageAddress: false,
    showSaveImage: false,
    showSaveImageAs: false,
    showSaveLinkAs: false,
    showInspectElement: import.meta.env.DEV,
    showServices: false,
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  if (!window.isVisible()) {
    window.show();
  }

  window.focus();
}
