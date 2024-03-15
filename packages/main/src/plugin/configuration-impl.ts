/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type * as containerDesktopAPI from '@podman-desktop/api';

import type { ApiSenderType } from './api.js';
import { CONFIGURATION_DEFAULT_SCOPE } from './configuration-registry-constants.js';

/**
 * Local view of the configuration values for a given scope
 */
export class ConfigurationImpl implements containerDesktopAPI.Configuration {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  private scope: containerDesktopAPI.ConfigurationScope;

  constructor(
    private apiSender: ApiSenderType,
    private updateCallback: (scope: containerDesktopAPI.ConfigurationScope) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private configurationValues: Map<string, any>,
    private globalSection?: string,
    paramScope?: containerDesktopAPI.ConfigurationScope,
  ) {
    if (!globalSection) {
      globalSection = '';
    }
    if (!paramScope) {
      this.scope = CONFIGURATION_DEFAULT_SCOPE;
    } else {
      this.scope = paramScope;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get<T>(section: any, defaultValue?: any): T | T | undefined {
    const localKey = this.getLocalKey(section);

    // now look if we have this value
    const localView = this.getLocalView();
    if (localView[localKey] !== undefined) {
      return localView[localKey];
    }
    return defaultValue;
  }

  has(section: string): boolean {
    const localKey = this.getLocalKey(section);

    // now look if we have this value
    const localView = this.getLocalView();
    return localView[localKey] !== undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(section: string, value: any): Promise<void> {
    const localKey = this.getLocalKey(section);

    // now look if we have this value
    const localView = this.getLocalView();

    // remove the value if undefined
    if (value === undefined) {
      if (localView[localKey]) {
        delete localView[section];
        delete this[localKey];
        this.apiSender.send('configuration-changed');
      }
    } else {
      localView[localKey] = value;
      this[section] = value;
      this.apiSender.send('configuration-changed');
    }
    // call only for default scope to save
    this.updateCallback(this.scope);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isContainerProviderConnection(obj: any): obj is containerDesktopAPI.ContainerProviderConnection {
    if (!obj) {
      return false;
    }
    return typeof obj.endpoint?.socketPath === 'string';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isKubernetesProviderConnection(obj: any): obj is containerDesktopAPI.KubernetesProviderConnection {
    if (!obj) {
      return false;
    }
    return typeof obj.endpoint?.apiURL === 'string';
  }

  getLocalKey(section?: string): string {
    // first we need to use the global section key
    let searchedKey = this.globalSection;
    if (!searchedKey || searchedKey === '') {
      if (section) {
        return section;
      } else {
        return '';
      }
    }
    if (section) {
      searchedKey = `${this.globalSection}.${section}`;
    }
    return searchedKey;
  }

  getConfigurationKey(): string {
    if (this.isContainerProviderConnection(this.scope)) {
      return `container-connection:${this.scope.name}.${this.scope.endpoint.socketPath}`;
    } else if (this.isKubernetesProviderConnection(this.scope)) {
      return `kubernetes-connection:${this.scope.endpoint.apiURL}`;
    } else {
      return CONFIGURATION_DEFAULT_SCOPE;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLocalView(): { [key: string]: any } {
    // first, grab values for the given scope
    // and initialize if not present
    const configurationKey = this.getConfigurationKey();
    if (!this.configurationValues.has(configurationKey)) {
      this.configurationValues.set(configurationKey, {});
    }
    return this.configurationValues.get(configurationKey);
  }
}
