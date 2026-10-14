/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { ProviderConnectionInfo, ProviderInfo, SystemOverviewStatus } from '@desktop-framework/api';
import type { ProviderConnectionStatus, ProviderStatus } from '@desktop-framework/extension-api';
import type { ButtonType } from '@podman-desktop/ui-svelte';

import {
  type ConnectionCallback,
  eventCollect,
  registerConnectionCallback,
} from '/@/lib/preferences/preferences-connection-rendering-task';

export const STATUS_TEXT_CLASS: Record<SystemOverviewStatus, string> = {
  healthy: 'text-[var(--pd-status-running)]',
  stable: 'text-[var(--pd-status-stopped)]',
  progressing: 'text-[var(--pd-status-starting)]',
  critical: 'text-[var(--pd-status-terminated)]',
} as const;

export const STATUS_BG_CLASS: Record<SystemOverviewStatus, string> = {
  healthy: 'bg-[var(--pd-status-running-bg)]',
  stable: 'bg-[var(--pd-status-stopped-bg)]',
  progressing: 'bg-[var(--pd-status-starting-bg)]',
  critical: 'bg-[var(--pd-status-terminated-bg)]',
} as const;

export interface ConnectionStatusConfig {
  label: string;
  buttonText: string;
  buttonType: ButtonType;
}

export function hasStartLifecycle(provider: ProviderInfo): boolean {
  return provider.canStart;
}

const CONNECTION_STATUS_LABELS: Record<ProviderConnectionStatus, string> = {
  started: 'Running',
  stopped: 'Stopped',
  unknown: 'Unknown',
  starting: 'Starting',
  stopping: 'Stopping',
};

export function getConnectionStatusConfig(
  status: ProviderConnectionStatus | ProviderStatus,
  provider: ProviderInfo,
  error?: string,
): ConnectionStatusConfig {
  const label = error ? 'Error' : (CONNECTION_STATUS_LABELS[status as ProviderConnectionStatus] ?? status);

  if (error && hasStartLifecycle(provider))
    return { label, buttonText: `Retry ${provider.name}`, buttonType: 'danger' };
  if ((status === 'stopped' || status === 'configured') && hasStartLifecycle(provider))
    return { label, buttonText: `Start ${provider.name}`, buttonType: 'primary' };
  if (status === 'unknown') return { label, buttonText: 'See Details in Resources', buttonType: 'danger' };
  if (status === 'started' || status === 'starting' || status === 'stopping' || status === 'stopped')
    return { label, buttonText: 'View', buttonType: 'secondary' };
  if (status !== 'configured') return { label, buttonText: `Set up ${provider.name}`, buttonType: 'primary' };
  return { label, buttonText: 'View', buttonType: 'secondary' };
}

function createNoopLogger(): ConnectionCallback {
  return { log: (): void => {}, warn: (): void => {}, error: (): void => {}, onEnd: (): void => {} };
}

export async function startConnection(
  providerInternalId: string,
  connectionSnapshot: ProviderConnectionInfo,
): Promise<symbol> {
  const loggerHandlerKey = registerConnectionCallback(createNoopLogger());
  await window.startProviderConnectionLifecycle(providerInternalId, connectionSnapshot, loggerHandlerKey, eventCollect);
  return loggerHandlerKey;
}
