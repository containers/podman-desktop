/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { BrowserWindow } from 'electron';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { WindowSettings } from './window-settings.js';

/**
 * Handle save and restore of the window position and size.
 */
export class WindowHandler {
  readonly #browserWindow: BrowserWindow;
  readonly #configurationRegistry: ConfigurationRegistry;

  #debounceSaveTimeout: NodeJS.Timeout | undefined;

  constructor(browserWindow: BrowserWindow, configurationRegistry: ConfigurationRegistry) {
    this.#browserWindow = browserWindow;
    this.#configurationRegistry = configurationRegistry;
  }

  // try to restore the window position and size
  restore(): void {
    // grab value of the width and height from the configuration
    const windowPreferences = this.#configurationRegistry.getConfiguration(WindowSettings.SectionName);
    const restore = windowPreferences.get<boolean>(WindowSettings.RestorePosition);
    if (!restore) {
      return;
    }
    const width = windowPreferences.get<number>(WindowSettings.Width);
    const height = windowPreferences.get<number>(WindowSettings.Height);
    if (width && height && typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
      this.#browserWindow.setSize(width, height);
    }
    const xPosition = windowPreferences.get<number>(WindowSettings.XPosition);
    const yPosition = windowPreferences.get<number>(WindowSettings.YPosition);
    if (xPosition && yPosition && typeof xPosition === 'number' && typeof yPosition === 'number') {
      this.#browserWindow.setPosition(xPosition, yPosition);
    }
  }

  // save the window position but using debounce to avoid calling it too often
  savePositionAndSize(): void {
    if (this.#debounceSaveTimeout) {
      clearTimeout(this.#debounceSaveTimeout);
    }
    // call the doSavePositionAndSize after 300ms if no other call to savePositionAndSize is made
    this.#debounceSaveTimeout = setTimeout(() => {
      this.doSavePositionAndSize().catch((e: unknown) => {
        console.error('Error saving window position and size', e);
      });
    }, 300);
  }

  protected async doSavePositionAndSize(): Promise<void> {
    const [width, height] = this.#browserWindow.getSize();
    const [x, y] = this.#browserWindow.getPosition();
    const windowPreferences = this.#configurationRegistry.getConfiguration(WindowSettings.SectionName);
    await windowPreferences?.update(WindowSettings.Width, width);
    await windowPreferences?.update(WindowSettings.Height, height);
    await windowPreferences?.update(WindowSettings.XPosition, x);
    await windowPreferences?.update(WindowSettings.YPosition, y);
  }
}
