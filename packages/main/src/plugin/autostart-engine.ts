/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry.js';
import { CONFIGURATION_DEFAULT_SCOPE, CONFIGURATION_ONBOARDING_SCOPE } from './configuration-registry-constants.js';
import type { ProviderRegistry } from './provider-registry.js';
import { Disposable } from './types/disposable.js';

export class AutostartEngine {
  private providerExtension = new Map<string, string>();

  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private providerRegistry: ProviderRegistry,
  ) {}

  registerProvider(extensionId: string, extensionDisplayName: string, providerInternalId: string): Disposable {
    this.providerExtension.set(providerInternalId, extensionId);
    const autostartConfiguration = this.registerProviderConfiguration(extensionId, extensionDisplayName);
    return Disposable.create(() => {
      this.providerExtension.delete(providerInternalId);
      this.configurationRegistry.deregisterConfigurations([autostartConfiguration]);
    });
  }

  private registerProviderConfiguration(extensionId: string, extensionDisplayName: string): IConfigurationNode {
    const extensionConfiguration = this.configurationRegistry.getConfiguration(`preferences.${extensionId}`);
    const autostart = extensionConfiguration.get<boolean>('engine.autostart', true);

    const autoStartConfigurationNode: IConfigurationNode = {
      id: `preferences.${extensionId}.engine.autostart`,
      title: `Autostart ${extensionDisplayName} engine`,
      type: 'object',
      extension: {
        id: extensionId,
      },
      properties: {
        [`preferences.${extensionId}.engine.autostart`]: {
          description: `Autostart ${extensionDisplayName} engine when launching Podman Desktop`,
          type: 'boolean',
          default: autostart,
          scope: [CONFIGURATION_DEFAULT_SCOPE, CONFIGURATION_ONBOARDING_SCOPE],
        },
      },
    };

    this.configurationRegistry.registerConfigurations([autoStartConfigurationNode]);
    return autoStartConfigurationNode;
  }

  async start(): Promise<void> {
    this.providerExtension.forEach((extensionId, providerInternalId) => {
      // grab value
      const autoStartConfiguration = this.configurationRegistry.getConfiguration(`preferences.${extensionId}`);
      // if there is no value in the config, we use the default true value
      const autostart = autoStartConfiguration.get<boolean>('engine.autostart', true);
      if (autostart) {
        console.log(`Autostarting ${extensionId} container engine`);
        // send autostart
        this.providerRegistry.runAutostart(providerInternalId).catch((e: unknown) => {
          console.error(`Failed to autostart ${extensionId} container engine`, e);
        });
      }

      // start the engine if we toggle the property
      this.configurationRegistry.onDidChangeConfiguration(async e => {
        if (e.key === `preferences.${extensionId}.engine.autostart` && e.value === true) {
          await this.providerRegistry.runAutostart(providerInternalId);
        }
      });
    });
  }
}
