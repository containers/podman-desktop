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

import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry';

export class StartMinimized {
  constructor(private configurationRegistry: ConfigurationRegistry) {}

  async init(): Promise<void> {
    const startMinimizedConfigurationNode: IConfigurationNode = {
      id: 'preferences.login.minimized',
      title: 'Start Minimized',
      type: 'object',
      properties: {
        ['preferences.login.minimized']: {
          description: 'On startup, start the application minimized to the tray. (Requires restart)',
          type: 'boolean',
          default: 'false',
        },
      },
    };

    this.configurationRegistry.registerConfigurations([startMinimizedConfigurationNode]);
  }
}
