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

import type { IConfigurationNode, IConfigurationRegistry } from '../configuration-registry.js';
import { LibpodApiSettings } from './libpod-api-settings.js';

export class LibpodApiInit {
  constructor(private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const libpodApiPlatformConfiguration: IConfigurationNode = {
      id: `preferences.${LibpodApiSettings.SectionName}`,
      title: 'LibpodApi',
      type: 'object',
      properties: {
        [`${LibpodApiSettings.SectionName}.${LibpodApiSettings.ForImageList}`]: {
          description: 'Enable using libpod API for image listing instead of compatibility api',
          type: 'boolean',
          default: true,
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([libpodApiPlatformConfiguration]);
  }
}
