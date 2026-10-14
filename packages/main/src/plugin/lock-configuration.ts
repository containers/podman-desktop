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

import {
  CONFIGURATION_LOCKED_KEY,
  CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE,
} from '@desktop-framework/api/configuration';

/**
 * Handles any "locked" configuration values managed by the managed-by configuration scopes.
 */
export class LockedKeys {
  constructor(private configurationValues: Map<string, { [key: string]: unknown }>) {}

  private getLockedKeysArray(): string[] | undefined {
    const lockedConfig = this.configurationValues.get(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE);
    if (!lockedConfig?.[CONFIGURATION_LOCKED_KEY] || !Array.isArray(lockedConfig[CONFIGURATION_LOCKED_KEY])) {
      return undefined;
    }
    return lockedConfig[CONFIGURATION_LOCKED_KEY] as string[];
  }

  /**
   * Gets all locked keys as a Set
   *
   * @returns Set of locked configuration keys, or empty Set if none
   */
  getAllKeys(): Set<string> {
    return new Set(this.getLockedKeysArray());
  }

  /**
   * Checks if a config key is locked and returns its managed value instead
   * of the user-defined one.
   *
   * @param localKey - Configuration key to check
   * @returns return the managed value if locked, undefined otherwise
   */
  get<T>(localKey: string): T | undefined {
    // Bail early if this key isn't in the locked list
    if (!this.getLockedKeysArray()?.includes(localKey)) {
      return undefined;
    }

    // This key IS locked - grab the managed default value for it
    const managedDefaults = this.configurationValues.get(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE);
    if (managedDefaults?.[localKey] !== undefined) {
      return managedDefaults[localKey] as T;
    }

    return undefined;
  }
}
