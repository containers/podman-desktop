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

import type { IConfigurationNode, IConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { WindowSettings } from './window-settings.js';

/**
 * Save/Restore the window size and position.
 */
export class WindowInit {
  readonly #configurationRegistry: IConfigurationRegistry;

  constructor(configurationRegistry: IConfigurationRegistry) {
    this.#configurationRegistry = configurationRegistry;
  }

  init(): void {
    const heightKey = `${WindowSettings.SectionName}.${WindowSettings.Height}`;
    const widthKey = `${WindowSettings.SectionName}.${WindowSettings.Width}`;
    const xPositionKey = `${WindowSettings.SectionName}.${WindowSettings.XPosition}`;
    const yPositionKey = `${WindowSettings.SectionName}.${WindowSettings.YPosition}`;
    const restorePosition = `${WindowSettings.SectionName}.${WindowSettings.RestorePosition}`;

    const windowConfiguration: IConfigurationNode = {
      id: 'preferences.window',
      title: 'Window',
      type: 'object',
      properties: {
        [heightKey]: {
          description: 'Height of the window',
          type: 'number',
          hidden: true,
        },
        [widthKey]: {
          description: 'Width of the window',
          type: 'number',
          hidden: true,
        },
        [xPositionKey]: {
          description: 'x position of the window',
          type: 'number',
          hidden: true,
        },
        [yPositionKey]: {
          description: 'y position of the window',
          type: 'number',
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
