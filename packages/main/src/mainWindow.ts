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

import { join } from 'node:path';
import { URL } from 'node:url';

import type { BrowserWindowConstructorOptions } from 'electron';
import { app, autoUpdater, BrowserWindow, ipcMain, Menu, nativeTheme, screen } from 'electron';
import contextMenu from 'electron-context-menu';
import { aboutMenuItem } from 'electron-util/main';

import { OpenDevTools } from './open-dev-tools.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import { isLinux, isMac, stoppedExtensions } from './util.js';

const openDevTools = new OpenDevTools();

async function createWindow(): Promise<BrowserWindow> {
  const INITIAL_APP_WIDTH = 1050;
  const INITIAL_APP_MIN_WIDTH = 640;
  const INITIAL_APP_HEIGHT = 700;
  const INITIAL_APP_MIN_HEIGHT = 600;

  // We have a "dark" background color in order to avoid the white flash when loading the app
  // this only occurs if the user clicks on the app icon milliseconds before the app is fully loaded.
  // We use the native theme to determine if we should use a dark background color or not.
  const INITIAL_APP_BACKGROUND_COLOR = nativeTheme.shouldUseDarkColors ? '#18181b' : '#ffffff';

  const browserWindowConstructorOptions: BrowserWindowConstructorOptions = {
    show: false, // Use 'ready-to-show' event to show window
    autoHideMenuBar: true, // This makes Podman Desktop look more like a native app
    width: INITIAL_APP_WIDTH,
    minWidth: INITIAL_APP_MIN_WIDTH,
    minHeight: INITIAL_APP_MIN_HEIGHT,
    height: INITIAL_APP_HEIGHT,
    backgroundColor: INITIAL_APP_BACKGROUND_COLOR,
    webPreferences: {
      webSecurity: false,
      //nativeWindowOpen: true,
      webviewTag: true, // The webview tag is not recommended. Consider alternatives like iframe or Electron's BrowserView. https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
  };

  // frameless window
  if (isLinux()) {
    browserWindowConstructorOptions.frame = false;
  } else {
    browserWindowConstructorOptions.titleBarStyle = 'hidden';
  }

  if (isMac()) {
    // change position of traffic light buttons
    browserWindowConstructorOptions.trafficLightPosition = { x: 20, y: 13 };
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
    // If started with --minimize flag, don't show the window and hide the dock icon on macOS
    if (isStartedMinimize()) {
      if (isMac()) {
        app.dock.hide();
      }
    } else {
      browserWindow.show();
    }
  });

  let configurationRegistry: ConfigurationRegistry;
  ipcMain.on('configuration-registry', (_, data) => {
    configurationRegistry = data;

    // open dev tools (if required)
    openDevTools.open(browserWindow, configurationRegistry);
  });

  // receive the message because an update is in progress and we need to quit the app
  let quitAfterUpdate = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autoUpdater.on('before-quit-for-update', () => {
    quitAfterUpdate = true;
  });

  browserWindow.on('close', e => {
    if (quitAfterUpdate) {
      browserWindow.destroy();
      app.quit();
      return;
    }

    const closeBehaviorConfiguration = configurationRegistry?.getConfiguration('preferences');
    let exitonclose = isLinux(); // default value, which we will use unless the user preference is available.
    if (closeBehaviorConfiguration) {
      exitonclose = closeBehaviorConfiguration.get<boolean>('ExitOnClose') === true;
    }

    e.preventDefault();
    if (!exitonclose) {
      browserWindow.hide();
      if (isMac()) {
        app.dock.hide();
      }
    } else {
      browserWindow.destroy();
      app.quit();
    }
  });

  let destroyed = false;
  app.on('before-quit', () => {
    if (destroyed || !stoppedExtensions.val) {
      return;
    }
    browserWindow.destroy();
    destroyed = true;
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
      // In development mode, show the "Open DevTools of Extension and Webviews" menu item
      if (import.meta.env.DEV) {
        let extensionId = '';
        if (parameters?.linkURL?.includes('/contribs')) {
          extensionId = parameters.linkURL.split('/contribs/')[1];
          return [
            {
              label: `Open DevTools of ${decodeURI(extensionId)} Extension`,
              // make it visible when link contains contribs and we're inside the extension
              visible:
                parameters.linkURL.includes('/contribs/') && parameters.pageURL.includes(`/contribs/${extensionId}`),
              click: (): void => {
                browserWindow.webContents.send('dev-tools:open-extension', extensionId.replaceAll('%20', '-'));
              },
            },
          ];
        } else if (parameters?.linkURL?.includes('/webviews/')) {
          const webviewId = parameters.linkURL.split('/webviews/')[1];
          return [
            {
              label: `Open DevTools of the webview`,
              visible:
                parameters.linkURL.includes('/webviews/') && parameters.pageURL.includes(`/webviews/${webviewId}`),
              click: (): void => {
                browserWindow.webContents.send('dev-tools:open-webview', webviewId);
              },
            },
          ];
        } else {
          return [];
        }
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

// Create a new window if there is no existing window
export async function createNewWindow(): Promise<BrowserWindow> {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }
  return window;
}

// Restore the window if it is minimized / not shown / there is already another instance running
export async function restoreWindow(): Promise<void> {
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

// Checks process args if it was started with the --minimize flag
function isStartedMinimize(): boolean {
  // We convert to string only because sometimes [node] will be the first argument in a packaged
  // environment, so instead of checking each element, simply convert to string and see if --minimize was included.
  const argv = process.argv.toString();
  return argv.includes('--minimize');
}
