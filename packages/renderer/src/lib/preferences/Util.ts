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

import type { ConfigurationScope } from '@podman-desktop/api';
import type { Terminal } from '@xterm/xterm';

import { CONFIGURATION_DEFAULT_SCOPE } from '/@api/configuration/constants.js';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';

export interface IProviderConnectionConfigurationPropertyRecorded extends IConfigurationPropertyRecordedSchema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  connection: string;
  providerId: string;
}

export interface ILoadingStatus {
  status: string;
  action?: string;
  inProgress: boolean;
}

export interface IConnectionStatus extends ILoadingStatus {
  error?: string;
}

export interface IConnectionRestart {
  provider: string;
  container: string;
  loggerHandlerKey: symbol;
}

export function writeToTerminal(xterm: Terminal, data: unknown, colorPrefix: string): void {
  if (Array.isArray(data)) {
    writeArrayToTerminal(xterm, data, colorPrefix);
  } else if (typeof data === 'string') {
    writeMultilineString(xterm, data, colorPrefix);
  }
}

function writeArrayToTerminal(xterm: Terminal, data: unknown[], colorPrefix: string) {
  for (const content of data) {
    if (Array.isArray(content)) {
      writeArrayToTerminal(xterm, content, colorPrefix);
    } else if (typeof content === 'string') {
      writeMultilineString(xterm, content, colorPrefix);
    }
  }
}

function writeMultilineString(xterm: Terminal, data: string, colorPrefix: string): void {
  if (data?.includes?.('\n')) {
    const toWrite = data.split('\n');
    for (const s of toWrite) {
      xterm.write(colorPrefix + s + '\n\r');
    }
  } else {
    xterm.write(colorPrefix + data + '\r');
  }
}

export function getProviderConnectionName(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): string {
  return `${provider.name}-${providerConnectionInfo.name}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNormalizedDefaultNumberValue(configurationKey: IConfigurationPropertyRecordedSchema): any {
  if (!configurationKey.maximum || typeof configurationKey.maximum !== 'number') {
    return configurationKey.default;
  }
  if (configurationKey.maximum > configurationKey.default) {
    return configurationKey.default;
  }
  return configurationKey.maximum;
}

export function isDefaultScope(scope?: ConfigurationScope | ConfigurationScope[]): boolean {
  return isTargetScope(CONFIGURATION_DEFAULT_SCOPE, scope);
}

export async function getInitialValue(property: IConfigurationPropertyRecordedSchema): Promise<unknown> {
  if (isDefaultScope(property.scope)) {
    if (property.id) {
      let value = await window.getConfigurationValue(property.id, CONFIGURATION_DEFAULT_SCOPE);
      if (property.type === 'boolean') {
        value = !!value;
      }
      return value;
    }
  } else if (property.default !== undefined) {
    return property.type === 'number' ? getNormalizedDefaultNumberValue(property) : property.default;
  } else if (property.type === 'string') {
    return '';
  } else if (property.type === 'number') {
    return 0;
  }
}

export function isTargetScope(
  targetScope: ConfigurationScope,
  scope?: ConfigurationScope | ConfigurationScope[],
): boolean {
  if (Array.isArray(scope) && scope.find(s => s === targetScope)) {
    return true;
  }
  return scope === targetScope;
}

export function isPropertyValidInContext(when: string | undefined, context: ContextUI): boolean {
  if (!when) {
    return true;
  }
  const expr = ContextKeyExpr.deserialize(when);

  // Only evaluate if context is not undefined
  if (expr && context !== undefined) {
    return expr.evaluate(context);
  }
  return false;
}

export function uncertainStringToNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value);
}

export function validateProxyAddress(value: string): string | undefined {
  if (value) {
    try {
      const u = new URL(value);
      if (!u.hostname) {
        return `Hostname missing from ${value}`;
      }
    } catch (err) {
      return `Value ${value} should be an URL`;
    }
  }
}

export function isContainerConnection(
  connection: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): connection is ProviderContainerConnectionInfo {
  return (connection as ProviderContainerConnectionInfo).endpoint.socketPath !== undefined;
}

export function calcHalfCpuCores(osCpu: string): number {
  const cores = parseInt(osCpu, 10);
  if (isNaN(cores) || cores <= 0) {
    return 1;
  }

  const hCores = Math.floor(cores / 2);
  return hCores === 0 ? 1 : hCores;
}
