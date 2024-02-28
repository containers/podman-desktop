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

import type { IConfigurationNode, IConfigurationRegistry } from './configuration-registry.js';
import { TerminalSettings } from './terminal-settings.js';

export class TerminalInit {
  private static DEFAULT_LINE_HEIGHT = 1;

  constructor(private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const terminalPlatformConfiguration: IConfigurationNode = {
      id: 'preferences.terminal',
      title: 'Terminal',
      type: 'object',
      properties: {
        [TerminalSettings.SectionName + '.' + TerminalSettings.FontSize]: {
          description: 'Terminal font size, in pixels.',
          type: 'number',
          default: 10,
          minimum: 6,
          maximum: 100,
        },
        [TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight]: {
          description:
            'Line height of the terminal. This number is multiplied by the terminal font size to get the actual terminal height in pixels.',
          type: 'number',
          default: TerminalInit.DEFAULT_LINE_HEIGHT,
          minimum: 1,
          maximum: 4,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([terminalPlatformConfiguration]);
  }
}
