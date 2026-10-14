/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { PreferredRegistriesSettings } from '@desktop-framework/api';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable } from 'inversify';

@injectable()
export class RegistryInit {
  constructor(@inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry) {}

  init(): void {
    const registryConfiguration: IConfigurationNode = {
      id: 'preferences.registries',
      title: 'Registries',
      type: 'object',
      properties: {
        [`${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`]: {
          markdownDescription:
            'String of preferred registries for pulling images. Registries are used in the order specified. Use registry URLs without `https://` prefix (e.g., `docker.io`, `quay.io`, `ghcr.io`). Separate multiple registries with commas.',
          type: 'string',
          default: 'docker.io',
          placeholder: 'quay.io, ghcr.io',
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([registryConfiguration]);
  }
}
