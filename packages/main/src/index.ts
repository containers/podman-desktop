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

import './security-restrictions';

import dns from 'node:dns';

import type { BrowserWindow } from 'electron';
import { app, ipcMain, Tray } from 'electron';

import { createNewWindow, restoreWindow } from '/@/mainWindow.js';

import type { ExtensionLoader } from './plugin/extension-loader.js';
import { PluginSystem } from './plugin/index.js';
import { Deferred } from './plugin/util/deferred.js';
import { StartupInstall } from './system/startup-install.js';
import { AnimatedTray } from './tray-animate-icon.js';
import { TrayMenu } from './tray-menu.js';
import { isMac, isWindows, stoppedExtensions } from './util.js';

let extensionLoader: ExtensionLoader | undefined;

type AdditionalData = {
  argv: string[];
};

export const mainWindowDeferred = new Deferred<BrowserWindow>();

const argv = process.argv.slice(2);
const additionalData: AdditionalData = {
  argv: argv,
};

/**
 * Prevent multiple instances
 */
// provide additional data to the second instance
const isSingleInstance = app.requestSingleInstanceLock(additionalData);
if (!isSingleInstance) {
  console.warn('An instance of Podman Desktop is already running. Stopping');
  app.quit();
  process.exit(0);
}

// if arg starts with 'podman-desktop://extension', replace it with 'podman-desktop:extension'
export function sanitizeProtocolForExtension(url: string): string {
  if (url.startsWith('podman-desktop://extension/')) {
    url = url.replace('podman-desktop://extension/', 'podman-desktop:extension/');
  }

  return url;
}

export const handleAdditionalProtocolLauncherArgs = (args: ReadonlyArray<string>): void => {
  // On Windows protocol handler will call the app with '<url>' args
  // on macOS it's done with 'open-url' event
  if (isWindows()) {
    // now search if we have 'open-url' in the list of args and give it to the handler
    for (const arg of args) {
      const analyzedArg = sanitizeProtocolForExtension(arg);
      if (analyzedArg.startsWith('podman-desktop:extension/')) {
        handleOpenUrl(analyzedArg);
      }
    }
  }
};

export const handleOpenUrl = (url: string): void => {
  // if the url starts with podman-desktop:extension/<id>
  // we need to install the extension

  // if url starts with 'podman-desktop://extension', replace it with 'podman-desktop:extension'
  url = sanitizeProtocolForExtension(url);

  if (!url.startsWith('podman-desktop:extension/')) {
    console.log(`url ${url} does not start with podman-desktop:extension/, skipping.`);
    return;
  }
  // grab the extension id
  const extensionId = url.substring('podman-desktop:extension/'.length);

  // wait that the window is ready
  mainWindowDeferred.promise
    .then(w => {
      w.webContents.send('podman-desktop-protocol:install-extension', extensionId);
    })
    .catch((error: unknown) => {
      console.error('Error sending open-url event to webcontents', error);
    });
};

// do not use _args as it may contain additional arguments
app.on('second-instance', (_event, _args, _workingDirectory, additionalData: unknown) => {
  // if we are on Windows, we need to handle the protocol
  if (isWindows() && additionalData && (additionalData as AdditionalData).argv) {
    handleAdditionalProtocolLauncherArgs((additionalData as AdditionalData).argv);
  }

  restoreWindow().catch((error: unknown) => {
    console.error('Error restoring window', error);
  });
});

/**
 * Disable Hardware Acceleration for more power-save
 */
app.disableHardwareAcceleration();

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (!isMac()) {
    app.quit();
  }
});

app.once('before-quit', event => {
  if (!extensionLoader) {
    stoppedExtensions.val = true;
    return;
  }
  event.preventDefault();
  extensionLoader
    ?.stopAllExtensions()
    .then(() => {
      console.log('Stopped all extensions');
    })
    .catch((error: unknown) => {
      console.log('Error stopping extensions', error);
    })
    .finally(() => {
      stoppedExtensions.val = true;
      app.quit();
    });
});
/**
 *  @see https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows
 */
if (isWindows()) {
  app.setAppUserModelId(app.name);
}

let tray: Tray;

// Handle the open-url event (macOS/Linux). For Windows, it needs to be handle in the second-instance event
app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    // delegate to the handler
    handleOpenUrl(url);
  });
});

app.whenReady().then(
  async () => {
    if (import.meta.env.PROD) {
      if (isWindows()) {
        app.setAsDefaultProtocolClient('podman-desktop', process.execPath, process.argv);
      } else {
        app.setAsDefaultProtocolClient('podman-desktop');
      }
    }

    // We must create the window first before initialization so that we can load the
    // configuration as well as plugins
    // The window is hiddenly created and shown when ready

    // Platforms: Linux, macOS, Windows
    // Create the main window
    createNewWindow()
      .then(w => mainWindowDeferred.resolve(w))
      .catch((error: unknown) => {
        console.error('Error creating window', error);
      });

    // Platforms: macOS
    // Required for macOS to start the app correctly (this is will be shown in the dock)
    // We use 'activate' within whenReady in order to gracefully start on macOS, see this link:
    // https://www.electronjs.org/docs/latest/tutorial/quick-start#open-a-window-if-none-are-open-macos
    app.on('activate', (_event, hasVisibleWindows) => {
      createNewWindow()
        .then(w => mainWindowDeferred.resolve(w))
        .catch((error: unknown) => {
          console.log('Error creating window', error);
        });

      // try to restore the window if it's not visible
      // for example user click on the dock icon
      if (isMac() && !hasVisibleWindows) {
        restoreWindow().catch((error: unknown) => {
          console.error('Error restoring window', error);
        });
      }
    });

    // prefer ipv4 over ipv6
    // TODO: Needs to be there until Happy Eyeballs(https://en.wikipedia.org/wiki/Happy_Eyeballs) is implemented
    // which is the case in Node.js 20+ https://github.com/nodejs/node/issues/41625
    dns.setDefaultResultOrder('ipv4first');

    // Setup the default tray icon + menu items
    const animatedTray = new AnimatedTray();
    tray = new Tray(animatedTray.getDefaultImage());
    animatedTray.setTray(tray);
    const trayMenu = new TrayMenu(tray, animatedTray);

    // Start extensions
    const pluginSystem = new PluginSystem(trayMenu, mainWindowDeferred);
    extensionLoader = await pluginSystem.initExtensions();

    // Get the configuration registry (saves all our settings)
    const configurationRegistry = extensionLoader.getConfigurationRegistry();

    // If we've manually set the tray icon color, update the tray icon. This can only be done
    // after configurationRegistry is loaded. Windows or Linux support only for icon color change.
    if (!isMac()) {
      const color = configurationRegistry.getConfiguration('preferences').get('TrayIconColor');
      if (typeof color === 'string') {
        animatedTray.setColor(color);
      }
    }

    // Share configuration registry with renderer process
    ipcMain.emit('configuration-registry', '', configurationRegistry);

    // Configure automatic startup
    const automaticStartup = new StartupInstall(configurationRegistry);
    await automaticStartup.configure();
  },
  (e: unknown) => console.error('Failed to start app:', e),
);
