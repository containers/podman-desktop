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
import { Menu } from 'electron';
import { BrowserWindow, ipcMain, app, dialog, screen } from 'electron';
import contextMenu from 'electron-context-menu';
const { aboutMenuItem } = require('electron-util');
import { join } from 'path';
import { URL } from 'url';
import type { ConfigurationRegistry } from './plugin/configuration-registry';
import { isLinux, isMac } from './util';

async function createWindow() {
  const INITIAL_APP_WIDTH = 1050;
  const INITIAL_APP_MIN_WIDTH = 640;
  const INITIAL_APP_HEIGHT = 600;
  const INITIAL_APP_MIN_HEIGHT = 600;
  // We have a "dark" background color in order to avoid the white flash when loading the app
  // this only occurs if the user clicks on the app icon milliseconds before the app is fully loaded.
  const INITIAL_APP_BACKGROUND_COLOR = '#18181b';

  const browserWindowConstructorOptions: BrowserWindowConstructorOptions = {
    show: false, // Use 'ready-to-show' event to show window
    autoHideMenuBar: true, // This makes Podman Desktop look more like a native app
    width: INITIAL_APP_WIDTH,
    minWidth: INITIAL_APP_MIN_WIDTH,
    minHeight: INITIAL_APP_MIN_HEIGHT,
    height: INITIAL_APP_HEIGHT,
    backgroundColor: INITIAL_APP_BACKGROUND_COLOR, // Use a darker background color to match initial dark theme when loading the app
    webPreferences: {
      webSecurity: false,
      //nativeWindowOpen: true,
      webviewTag: true, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  };

  if (isMac) {
    // This property is not available on Linux.
    browserWindowConstructorOptions.titleBarStyle = 'hiddenInset';
  }

  let configurationRegistry: ConfigurationRegistry;
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
    const startMinimized = didUserSetMinimized(configurationRegistry);

    // Linux support + edge cases of macOS / Windows to ensure it starts minimized rather than showing.
    // If the user preference is set to start minimized, then minimize the window, otherwise simply show it.
    if (startMinimized) {
      browserWindow?.minimize();
    } else {
      // This is the main "show" call for the window. This is only loaded when we're ready to show
      // after loading the plugins, etc. You can always "unminimize" or click on the tray / dock icon to view
      // the window while loading.
      browserWindow?.show();
    }
    if (isMac && !startMinimized) {
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

  ipcMain.on('configuration-registry', (_, data) => {
    configurationRegistry = data;
  });

  browserWindow.on('close', e => {
    const closeBehaviorConfiguration = configurationRegistry?.getConfiguration('preferences');
    let exitonclose = isLinux; // default value, which we will use unless the user preference is available.
    if (closeBehaviorConfiguration) {
      exitonclose = closeBehaviorConfiguration.get<boolean>('ExitOnClose') == true;
    }

    if (!exitonclose) {
      e.preventDefault();
      browserWindow.hide();
      if (isMac) {
        app.dock.hide();
      }
    } else {
      browserWindow.destroy();
      app.quit();
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
    prepend: (_defaultActions, parameters) => {
      // In development mode, show the "Open DevTools of Extension" menu item
      if (import.meta.env.DEV) {
        let extensionId = '';
        if (parameters.linkURL && parameters.linkURL.includes('/contribs')) {
          extensionId = parameters.linkURL.split('/contribs/')[1];
        }
        return [
          {
            label: `Open DevTools of ${decodeURI(extensionId)} Extension`,
            // make it visible when link contains contribs and we're inside the extension
            visible:
              parameters.linkURL.includes('/contribs/') && parameters.pageURL.includes(`/contribs/${extensionId}`),
            click: () => {
              browserWindow.webContents.send('dev-tools:open-extension', extensionId.replaceAll('%20', '-'));
            },
          },
        ];
      } else {
        return [];
      }
    },
  });

  // Add help/about menu entry
  const menu = Menu.getApplicationMenu(); // get default menu
  if (menu) {
    // build a new menu based on default one but adding about entry in the help menu
    const newmenu = Menu.buildFromTemplate(
      menu.items.map(i => {
        // add the About entry only in the help menu
        if (i.role === 'help' && i.submenu) {
          const aboutMenuSubItem = aboutMenuItem({});
          aboutMenuSubItem.label = 'About';

          // create new submenu
          // also add a separator before the About entry
          const newSubMenu = Menu.buildFromTemplate([...i.submenu.items, { type: 'separator' }, aboutMenuSubItem]);
          return Object.assign({}, i, { submenu: newSubMenu });
        }
        return i;
      }),
    );

    Menu.setApplicationMenu(newmenu);
  }

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
export async function restoreOrCreateWindow(configurationRegistry: ConfigurationRegistry) {
  // Find the window, and if for some reason the window has destroyed (closed during loading?),
  // create a new one.
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
  if (window === undefined) {
    window = await createWindow();
  }

  // If the user has set the preference to start minimized, don't focus / restore the window / show
  if (!didUserSetMinimized(configurationRegistry)) {
    // If the window is minimized or not visible, restore it.
    if (window.isMinimized()) {
      window.restore();
    }

    // For historical reasons, we used to show the window if it wasn't visible. However, sometimes
    // we didn't completely load the plugins / extensions yet / there's a white screen
    // We use the browserWindow.on('ready-to-show') in mainWindow.ts to show the window when it's ready.
    // more gracefully. See: https://www.electronjs.org/docs/latest/api/browser-window#showing-the-window-gracefully
    /*
    if (!window.isVisible()) {
     window.show();
    }
    */

    // Bring focus to the window on loading
    window.focus();
  }
}

// Create a new window if there is no existing window
export async function createNewWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }
}

// Restore the window if it is minimized / not shown / there is already another instance running
export async function restoreWindow() {
  const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  // Only restore the window if we were able to find it
  if (window) {
    if (window.isMinimized()) {
      window.restore();
    }

    window.show();
    window.focus();
  }
}

// Checks the configuration registry and returns true if the user has set the preference to start minimized
function didUserSetMinimized(configurationRegistry: ConfigurationRegistry): boolean {
  const minimizeBehaviorConfiguration = configurationRegistry?.getConfiguration('preferences');
  let startMinimized = false;
  if (minimizeBehaviorConfiguration) {
    startMinimized = minimizeBehaviorConfiguration.get<boolean>('StartMinimized') == true;
  }
  return startMinimized;
}
