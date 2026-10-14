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

import { ExtensionLoaderSettings } from '@desktop-framework/api';

import type { ConfigurationRegistry } from './plugin/configuration-registry.js';
import { Emitter } from './plugin/events/emitter.js';

// track the changes of the development mode and provides a single event to update
export class DevelopmentModeTracker {
  // event that will be fired
  #onDidChangeDevelopmentMode: Emitter<boolean> = new Emitter<boolean>();
  onDidChangeDevelopmentMode = this.#onDidChangeDevelopmentMode.event;

  #configurationRegistry: ConfigurationRegistry;

  // default value is the development mode flag
  #currentValue: undefined | boolean = undefined;

  constructor(configurationRegistry: ConfigurationRegistry) {
    this.#configurationRegistry = configurationRegistry;
  }

  protected refreshConfigurationValue(): void {
    const newValue = this.#configurationRegistry
      .getConfiguration(ExtensionLoaderSettings.SectionName)
      .get<boolean>(ExtensionLoaderSettings.DevelopmentMode, import.meta.env.DEV);

    // first launch ? send the initial value as well
    // or when value is being changed
    if (this.#currentValue === undefined || this.#currentValue !== newValue) {
      this.#currentValue = newValue;
      this.#onDidChangeDevelopmentMode.fire(newValue);
    }
  }

  init(): void {
    this.refreshConfigurationValue();

    // refresh the value when the property is registered (with its default value)
    this.#configurationRegistry.onDidUpdateConfiguration(event => {
      if (
        event.properties.includes(`${ExtensionLoaderSettings.SectionName}.${ExtensionLoaderSettings.DevelopmentMode}`)
      ) {
        this.refreshConfigurationValue();
      }
    });

    // update when the value is being changed
    this.#configurationRegistry.onDidChangeConfiguration(event => {
      if (event.key === `${ExtensionLoaderSettings.SectionName}.${ExtensionLoaderSettings.DevelopmentMode}`) {
        this.refreshConfigurationValue();
      }
    });
  }
}
