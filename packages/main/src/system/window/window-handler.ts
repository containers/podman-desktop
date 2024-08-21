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

import { type BrowserWindow, type Rectangle, screen } from 'electron';

import type { ConfigurationRegistry, IConfigurationNode } from '/@/plugin/configuration-registry.js';

import { WindowSettings } from './window-settings.js';

/**
 * Handle save and restore of the window position and size.
 */
export class WindowHandler {
  readonly #browserWindow: BrowserWindow;
  readonly #configurationRegistry: ConfigurationRegistry;

  #debounceSaveTimeout: NodeJS.Timeout | undefined;

  constructor(configurationRegistry: ConfigurationRegistry, browserWindow: BrowserWindow) {
    this.#browserWindow = browserWindow;
    this.#configurationRegistry = configurationRegistry;
  }

  // sets the bounds of the Window
  protected resizeWindow(bounds: Rectangle): void {
    // we do not use setBounds as it seems it's setting/keeping data per screen
    this.#browserWindow.setSize(bounds.width, bounds.height);
    this.#browserWindow.setPosition(bounds.x, bounds.y);
  }

  // try to restore the window position and size
  restore(initialBounds: Rectangle): void {
    // grab value of the width and height from the configuration
    const windowPreferences = this.#configurationRegistry.getConfiguration(WindowSettings.SectionName);
    const restore = windowPreferences.get<boolean>(WindowSettings.RestorePosition);
    if (!restore) {
      return;
    }
    const bounds = windowPreferences.get<Rectangle>(WindowSettings.Bounds);

    if (
      bounds &&
      typeof bounds.width === 'number' &&
      typeof bounds.height === 'number' &&
      typeof bounds.x === 'number' &&
      typeof bounds.y === 'number'
    ) {
      const screenArea = screen.getDisplayMatching(bounds).workArea;
      if (
        bounds.x > screenArea.x + screenArea.width ||
        bounds.x < screenArea.x ||
        bounds.y < screenArea.y ||
        bounds.y > screenArea.y + screenArea.height
      ) {
        // Previous stored location is no longer available, restore window into an initial state

        // check if we can restore using the current width and height
        const centeredBounds = {
          x: Math.floor(screenArea.x + (screenArea.width - bounds.width) / 2),
          y: Math.floor(screenArea.y + (screenArea.height - bounds.height) / 2),
          width: bounds.width,
          height: bounds.height,
        };
        const newScreenArea = screen.getDisplayMatching(centeredBounds).workArea;

        // does it fit ?
        if (
          centeredBounds.x > newScreenArea.x + newScreenArea.width ||
          centeredBounds.x < newScreenArea.x ||
          centeredBounds.y < newScreenArea.y ||
          centeredBounds.y > newScreenArea.y + newScreenArea.height
        ) {
          // no, restore to initial bounds (default size and location)
          this.resizeWindow(initialBounds);
        } else {
          // restore it centered but using the saved width and height
          this.resizeWindow(centeredBounds);
        }
      } else {
        // restore the window position and size to its saved state
        this.resizeWindow(bounds);
      }
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
    const bounds = this.#browserWindow.getBounds();
    const windowPreferences = this.#configurationRegistry.getConfiguration(WindowSettings.SectionName);
    await windowPreferences?.update(WindowSettings.Bounds, bounds);
  }

  init(): void {
    const boundsKey = `${WindowSettings.SectionName}.${WindowSettings.Bounds}`;
    const restorePosition = `${WindowSettings.SectionName}.${WindowSettings.RestorePosition}`;

    const windowConfiguration: IConfigurationNode = {
      id: 'preferences.savePosition',
      title: 'Window',
      type: 'object',
      properties: {
        // hidden property to store the bounds of the window
        [boundsKey]: {
          description: 'bounds of the window',
          type: 'object',
          hidden: true,
        },
        [restorePosition]: {
          description: 'Restore position and size of the window after a restart',
          type: 'boolean',
          default: true,
          hidden: false,
        },
      },
    };

    this.#configurationRegistry.registerConfigurations([windowConfiguration]);
  }
}
