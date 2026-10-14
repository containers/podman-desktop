/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable } from 'inversify';

@injectable()
export class NavigationItemsInit {
  constructor(@inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const confirmationConfiguration: IConfigurationNode = {
      id: 'preferences.navBar',
      title: 'User Confirmation',
      type: 'object',
      properties: {
        ['navbar.disabledItems']: {
          description: 'Items being disabled in the navigation bar',
          type: ['boolean'],
          default: [],
          hidden: true,
        },
        ['navbar.itemOrder']: {
          description: 'User-defined order of navigation items',
          type: ['array'],
          default: [],
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([confirmationConfiguration]);
  }
}
