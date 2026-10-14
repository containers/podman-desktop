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

import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import { ConfigurationRegistry } from './configuration-registry.js';
import { Telemetry } from './telemetry/telemetry.js';

@injectable()
export class ExperimentalConfigurationManager {
  constructor(
    @inject(ConfigurationRegistry) private configurationRegistry: ConfigurationRegistry,
    @inject(Telemetry) private telemetry: Telemetry,
  ) {}

  /**
   * Parse a configuration key into section and property
   * @param key - Full configuration key (e.g., 'kubernetes.statesExperimental')
   * @returns Object with section and property
   */
  parseKey(key: string): { section: string; property: string } {
    const dotIndex = key.indexOf('.');
    // If is the '.' not found
    // if is the key '.property'
    // If is the key 'section.'
    if (dotIndex === -1 || dotIndex === 0 || dotIndex === key.length - 1) {
      return { section: '', property: '' };
    }

    const section = key.substring(0, dotIndex);
    const property = key.substring(dotIndex + 1);

    return { section, property };
  }

  /**
   * Update an experimental configuration (enable or disable based on config)
   * @param key - Full configuration key (e.g., 'kubernetes.statesExperimental')
   * @param config - Configuration object for the feature. If undefined, disables the feature. If object (empty or with properties), enables the feature.
   * @param scope - Configuration scope
   */
  async updateExperimentalConfigurationValue(
    key: string,
    config: unknown,
    scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
  ): Promise<void> {
    await this.configurationRegistry.updateConfigurationValue(key, config, scope);
    const enabled = typeof config === 'object' && !!config;
    this.telemetry.track('experimentalConfigurationUpdate', { key, enabled });
  }

  /**
   * Enable an experimental configuration by setting it to an object
   * @param key - Full configuration key (e.g., 'kubernetes.statesExperimental')
   * @param scope - Configuration scope
   */
  async enableExperimentalConfiguration(
    key: string,
    scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
  ): Promise<void> {
    const settings = {};

    if (Array.isArray(scope)) {
      for (const scopeItem of scope) {
        await this.configurationRegistry.updateConfigurationValue(key, settings, scopeItem);
      }
    } else {
      await this.configurationRegistry.updateConfigurationValue(key, settings, scope);
    }
  }

  /**
   * Disable an experimental configuration by setting it to undefined
   * @param key - Full configuration key (e.g., 'kubernetes.statesExperimental')
   * @param scope - Configuration scope
   */
  async disableExperimentalConfiguration(
    key: string,
    scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
  ): Promise<void> {
    if (Array.isArray(scope)) {
      for (const scopeItem of scope) {
        await this.configurationRegistry.updateConfigurationValue(key, false, scopeItem);
      }
    } else {
      await this.configurationRegistry.updateConfigurationValue(key, false, scope);
    }
  }

  /**
   * Check if an experimental configuration is enabled (has an object value)
   * @param key - Full configuration key (e.g., 'kubernetes.statesExperimental')
   * @param scope - Configuration scope
   * @returns true if feature is enabled (has object value), false otherwise
   */
  isExperimentalConfigurationEnabled(
    key: string,
    scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
  ): boolean {
    const { section, property } = this.parseKey(key);
    if (!section || !property) {
      return false;
    }

    if (Array.isArray(scope)) {
      for (const scopeItem of scope) {
        const config = this.configurationRegistry.getConfiguration(section, scopeItem).get(property);
        if (typeof config === 'object' && config !== null) return true;
      }
      return false;
    } else {
      const config = this.configurationRegistry.getConfiguration(section, scope).get(property);
      return (typeof config === 'object' && config !== null) || (typeof config === 'boolean' && config);
    }
  }
}
