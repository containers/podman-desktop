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

import { ExperimentalSettings } from '/@api/docker-compatibility-info.js';

import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry.js';

export class DockerCompatibility {
  static readonly ENABLED_FULL_KEY = `${ExperimentalSettings.SectionName}.${ExperimentalSettings.Enabled}`;

  #configurationRegistry: ConfigurationRegistry;

  constructor(configurationRegistry: ConfigurationRegistry) {
    this.#configurationRegistry = configurationRegistry;
  }

  init(): void {
    const appearanceConfiguration: IConfigurationNode = {
      id: 'preferences.experimental.dockerCompatibility',
      title: 'Experimental (Docker Compatibility)',
      type: 'object',
      properties: {
        [DockerCompatibility.ENABLED_FULL_KEY]: {
          description: 'Enable the section for Docker compatibility.',
          type: 'boolean',
          hidden: true,
          default: false,
        },
      },
    };

    this.#configurationRegistry.registerConfigurations([appearanceConfiguration]);
  }
}
