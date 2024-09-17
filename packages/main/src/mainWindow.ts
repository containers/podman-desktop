/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type { BrowserWindowConstructorOptions, Rectangle } from 'electron';
import { app, autoUpdater, BrowserWindow, ipcMain, nativeTheme, screen } from 'electron';
import contextMenu from 'electron-context-menu';

import { buildDevelopmentMenu } from './development-menu-builder.js';
import { NavigationItemsMenuBuilder } from './navigation-items-menu-builder.js';
import { OpenDevTools } from './open-dev-tools.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import type { WindowHandler } from './system/window/window-handler.js';
import { isLinux, isMac, stoppedExtensions } from './util.js';

const openDevTools = new OpenDevTools();
let navigationItemsMenuBuilder: NavigationItemsMenuBuilder;

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

  const initialBounds: Rectangle = {
    x: x,
    y: y,
    width: INITIAL_APP_WIDTH,
    height: INITIAL_APP_HEIGHT,
  };
  browserWindow.setBounds(initialBounds);

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

    navigationItemsMenuBuilder = new NavigationItemsMenuBuilder(configurationRegistry);

    // open dev tools (if required)
    openDevTools.open(browserWindow, configurationRegistry);
  });

  let windowHandler: WindowHandler | undefined;
  ipcMain.on('window-handler', (_, windowHandlerParam) => {
    // try to restore the window position and size
    windowHandler = windowHandlerParam;
    windowHandler?.restore(initialBounds);
  });

  browserWindow.on('resize', () => {
    windowHandler?.savePositionAndSize();
  });

  browserWindow.on('move', () => {
    windowHandler?.savePositionAndSize();
  });

  // receive the navigation items
  ipcMain.handle('navigation:sendNavigationItems', (_, data) => {
    navigationItemsMenuBuilder?.receiveNavigationItems(data);
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
      return buildDevelopmentMenu(parameters, browserWindow, import.meta.env.DEV);
    },
    append: (_defaultActions, parameters) => {
      return navigationItemsMenuBuilder?.buildNavigationMenu(parameters) ?? [];
    },
    onClose: () => {
      browserWindow.webContents.send('context-menu:visible', false);
    },
    onShow: () => {
      browserWindow.webContents.send('context-menu:visible', true);
    },
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
