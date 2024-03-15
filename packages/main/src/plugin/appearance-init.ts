/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { AppearanceSettings } from './appearance-settings.js';
import type { IConfigurationNode, IConfigurationRegistry } from './configuration-registry.js';

export class AppearanceInit {
  constructor(private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const appearanceConfiguration: IConfigurationNode = {
      id: 'preferences.appearance',
      title: 'Appearance',
      type: 'object',
      properties: {
        [AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance]: {
          description: 'Appearance',
          type: 'string',
          enum: ['system', 'dark', 'light'],
          default: 'system',
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([appearanceConfiguration]);
  }
}
