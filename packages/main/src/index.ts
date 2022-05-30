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

import { ipcMain, app, Tray, dialog } from 'electron';
import './security-restrictions';
import { restoreOrCreateWindow } from '/@/mainWindow';
import { TrayMenu } from './tray-menu';
import { findWindow, isMac } from './util';
import { AnimatedTray } from './tray-animate-icon';

/**
 * Prevent multiple instances
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration for more power-save
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
 */
app.on('activate', restoreOrCreateWindow);

/**
 * Create app window when background process will be ready
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

/**
 * Install some other devtools in development mode only
 */
/*
if (import.meta.env.DEV) {
  app.whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({default: installExtension, VUEJS3_DEVTOOLS}) => installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    }))
    .catch(e => console.error('Failed install extension:', e));
}
*/

/**
 * Check new app version in production mode only
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch(e => console.error('Failed check updates:', e));
}

let tray: Tray | null = null;

app.whenReady().then(() => {
  const animatedTray = new AnimatedTray();
  tray = new Tray(animatedTray.getDefaultImage());
  animatedTray.setTray(tray);
  new TrayMenu(tray, animatedTray);
});

ipcMain.on('dialog:show-error', (_, param: { title: string; body: string }): void => {
  dialog.showErrorBox(param.title, param.body);
});

ipcMain.handle(
  'dialog:show-dialog',
  async (_, param: { type: string; title: string; message: string; items: string[] }): Promise<string | undefined> => {
    const window = findWindow();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = await dialog.showMessageBox(window!, {
      title: param.title,
      message: param.message,
      buttons: param.items,
      type: param.type,
    });
    if (result) {
      return param.items[result.response];
    }

    return undefined;
  },
);

ipcMain.on('window:set-progress', (_, param: { message: string; increment: number }) => {
  const window = findWindow();
  if (window) {
    window.setProgressBar(param.increment / 100, { mode: 'normal' });
  }
});
