/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
 ********************************************************************/
import type { App as ElectronApp, BrowserWindow } from 'electron';

import type { WindowConfig } from '/@/mainWindow.js';
import { createNewWindow, restoreWindow } from '/@/mainWindow.js';
import type { AppPlugin } from '/@/plugin/app-ready/app-plugin.js';
import { isMac } from '/@/util.js';

export class WindowPlugin implements AppPlugin {
  constructor(
    private readonly app: ElectronApp,
    private readonly resolve: (window: BrowserWindow) => void,
    private readonly config?: WindowConfig,
  ) {}

  dispose(): void {}

  async onReady(): Promise<void> {
    // We must create the window first before initialization so that we can load the
    // configuration as well as plugins
    // The window is hiddenly created and shown when ready

    // Platforms: Linux, macOS, Windows
    // Create the main window
    createNewWindow(this.config)
      .then(this.resolve)
      .catch((error: unknown) => {
        console.error('Error creating window', error);
      });

    // Platforms: macOS
    // Required for macOS to start the app correctly (this is will be shown in the dock)
    // We use 'activate' within whenReady in order to gracefully start on macOS, see this link:
    // https://www.electronjs.org/docs/latest/tutorial/quick-start#open-a-window-if-none-are-open-macos
    this.app.on('activate', (_event, hasVisibleWindows) => {
      createNewWindow(this.config)
        .then(this.resolve)
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
  }
}
