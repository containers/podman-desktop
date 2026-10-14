/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import statusbarImage from '/@/assets/statusbarProviders.showProviders.webp';

@injectable()
export class StatusbarProvidersInit {
  constructor(@inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const statusbarProvidersConfiguration: IConfigurationNode = {
      id: 'preferences.experimental.statusbarProviders',
      title: 'Experimental (Status Bar Providers)',
      type: 'object',
      properties: {
        'statusbarProviders.showProviders': {
          description: 'Show providers in the status bar',
          type: 'object',
          default: {},
          experimental: {
            githubDiscussionLink: 'https://github.com/podman-desktop/podman-desktop/discussions/10802',
            image: statusbarImage,
          },
        },
      },
    };

    this.configurationRegistry.registerConfigurations([statusbarProvidersConfiguration]);
  }
}
