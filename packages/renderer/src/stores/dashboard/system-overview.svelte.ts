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

import type { ProviderConnectionInfo, SystemOverviewStatus } from '@desktop-framework/api';
import type { ProviderConnectionStatus } from '@desktop-framework/extension-api';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-regular-svg-icons';
import { faInfoCircle, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '@podman-desktop/ui-svelte';
import type { Component } from 'svelte';
import { type Writable, writable } from 'svelte/store';

import { EventStore } from '/@/stores/event-store';

export interface Status {
  status: SystemOverviewStatus;
  icon: IconDefinition | Component | string;
  priority: number; // Higher number = worse status
}

export interface SystemOverviewStoreData {
  status: Status;
  text: string;
}

// Priority levels: critical (3) > progressing (2) > stable (1) > healthy (0)
export const SYSTEM_OVERVIEW_STATUS: Record<SystemOverviewStatus, Status> = {
  healthy: { status: 'healthy', icon: faCheckCircle, priority: 0 },
  stable: { status: 'stable', icon: faInfoCircle, priority: 1 },
  progressing: { status: 'progressing', icon: Spinner, priority: 2 },
  critical: { status: 'critical', icon: faXmarkCircle, priority: 3 },
};

export function getSystemOverviewStatus(status: ProviderConnectionStatus, error?: string): Status {
  if (error) {
    return SYSTEM_OVERVIEW_STATUS.critical;
  }
  switch (status) {
    case 'started':
      return SYSTEM_OVERVIEW_STATUS.healthy;
    case 'stopped':
    case 'unknown':
      return SYSTEM_OVERVIEW_STATUS.stable;
    case 'starting':
    case 'stopping':
      return SYSTEM_OVERVIEW_STATUS.progressing;
    default:
      return SYSTEM_OVERVIEW_STATUS.stable;
  }
}

export function getConnectionDisplayName(connection: ProviderConnectionInfo): string {
  if (connection.connectionType === 'container') {
    return connection.displayName ?? connection.name;
  }
  return connection.name;
}

const windowEvents = ['dashboard:system-overview-status'];
const windowListeners = ['system-ready'];

async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const systemOverviewInfos: Writable<SystemOverviewStoreData> = writable({
  status: SYSTEM_OVERVIEW_STATUS.progressing,
  text: 'Initializing...',
});

async function fetchSystemOverviewStatus(): Promise<SystemOverviewStoreData> {
  const statusInfo = await window.getDashboardSystemOverviewStatus();
  const status = SYSTEM_OVERVIEW_STATUS[statusInfo.status] ?? SYSTEM_OVERVIEW_STATUS.stable;
  return { status, text: statusInfo.text };
}

const eventStore = new EventStore<SystemOverviewStoreData>(
  'system-overview',
  systemOverviewInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  fetchSystemOverviewStatus,
);
eventStore.setup();
