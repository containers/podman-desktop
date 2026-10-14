/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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
import type { Event } from '@desktop-framework/api';
import { app, ipcMain, Menu, Tray } from 'electron';

import { restoreWindow } from '/@/mainWindow.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';

import { ApplicationMenuBuilder } from './application-menu-builder.js';
import { type AdditionalData, Main } from './main.js';
import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import { Emitter } from './plugin/events/emitter.js';
import { PluginSystem } from './plugin/index.js';
import { readShowTrayIconSetting } from './plugin/util/read-tray-setting.js';
import { ZoomLevelHandler } from './plugin/zoom-level-handler.js';
import { StartupInstall } from './system/startup-install.js';
import { WindowHandler } from './system/window/window-handler.js';
import { AnimatedDevTray } from './tray-animate-dev-icon.js';
import { AnimatedTray } from './tray-animate-icon.js';
import { TrayMenu } from './tray-menu.js';
import { isMac, isWindows, stoppedExtensions } from './util.js';

let extensionLoader: ExtensionLoader | undefined;
let animatedTray: AnimatedTray | undefined;

// Main startup
const podmanDesktopMain = new Main(app);
podmanDesktopMain.main(process.argv);

// TODO: remove when index.spec.ts tests are migrated in podmanDesktopMain-main.spec
export const mainWindowDeferred = podmanDesktopMain.mainWindowDeferred;

// do not use _args as it may contain additional arguments
app.on('second-instance', (_event, _args, _workingDirectory, additionalData: unknown) => {
  // if we are on Windows, we need to handle the protocol
  if (isWindows() && additionalData && (additionalData as AdditionalData).argv) {
    podmanDesktopMain.protocolLauncher.handleAdditionalProtocolLauncherArgs((additionalData as AdditionalData).argv);
  }

  restoreWindow().catch((error: unknown) => {
    console.error('Error restoring window', error);
  });
});

app.on('will-quit', () => {
  // Clean up tray resources
  animatedTray?.dispose();
  tray?.destroy();
});
app.once('before-quit', event => {
  if (!extensionLoader) {
    stoppedExtensions.val = true;
    return;
  }
  event.preventDefault();
  extensionLoader
    .asyncDispose()
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

let tray: Tray | undefined;

// Handle the open-url event (macOS/Linux). For Windows, it needs to be handle in the second-instance event
app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    // delegate to the handler
    podmanDesktopMain.protocolLauncher.handleOpenUrl(url);
  });
});

app.whenReady().then(
  async () => {
    // Setup the default tray icon + menu items (skip if user disabled tray)
    const showTrayIcon = readShowTrayIconSetting();
    if (showTrayIcon) {
      animatedTray = import.meta.env.DEV ? new AnimatedDevTray() : new AnimatedTray();
      tray = new Tray(animatedTray.getDefaultImage());
      animatedTray.setTray(tray);
    }
    const trayMenu = new TrayMenu(tray, animatedTray);

    const _onDidCreatedConfigurationRegistry = new Emitter<ConfigurationRegistry>();
    const onDidCreatedConfigurationRegistry: Event<ConfigurationRegistry> = _onDidCreatedConfigurationRegistry.event;

    // Start extensions
    const pluginSystem = new PluginSystem(trayMenu, podmanDesktopMain.mainWindowDeferred);

    onDidCreatedConfigurationRegistry(async (configurationRegistry: ConfigurationRegistry) => {
      // If we've manually set the tray icon color, update the tray icon. This can only be done
      // after configurationRegistry is loaded. Windows or Linux support only for icon color change.
      if (!isMac()) {
        const color = configurationRegistry.getConfiguration('preferences').get('TrayIconColor');
        if (typeof color === 'string') {
          animatedTray?.setColor(color);
        }
      }

      // Share configuration registry with renderer process
      ipcMain.emit('configuration-registry', '', configurationRegistry);

      // Register the window configuration
      // This is used to save/restore the window size and position
      podmanDesktopMain.mainWindowDeferred.promise
        .then(browserWindow => {
          const windowHandler = new WindowHandler(configurationRegistry, browserWindow);
          windowHandler.init();

          // Configure the zoom level handler
          // handle zoom level
          const zoomLevelHandler = new ZoomLevelHandler(browserWindow, configurationRegistry);
          zoomLevelHandler.init();

          // sets the menu
          const applicationMenuBuilder = new ApplicationMenuBuilder(zoomLevelHandler);
          const menu = applicationMenuBuilder.build();

          if (menu) {
            Menu.setApplicationMenu(menu);
          }

          // send window Handler
          ipcMain.emit('window-handler', '', windowHandler);
        })
        .catch((error: unknown) => {
          console.error('Error initializing window handler', error);
        });

      // Configure automatic startup
      const automaticStartup = new StartupInstall(configurationRegistry);
      await automaticStartup.configure();
    });

    extensionLoader = await pluginSystem.initExtensions(_onDidCreatedConfigurationRegistry);
  },
  (e: unknown) => console.error('Failed to start app:', e),
);
