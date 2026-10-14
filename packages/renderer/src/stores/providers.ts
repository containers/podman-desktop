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

import type { ProviderInfo } from '@desktop-framework/api';
import { type Writable, writable } from 'svelte/store';
import { derived } from 'svelte/store';

import { EventStore } from './event-store';

const windowEvents = [
  'extension-started',
  'extension-stopped',
  'provider-lifecycle-change',
  'provider-change',
  'provider-create',
  'provider-delete',
  'provider:update-status',
  'provider:update-warnings',
  'provider:update-version',
  'provider-container-connection-update-status',
  'provider-register-kubernetes-connection',
  'provider-unregister-kubernetes-connection',
  'provider-register-vm-connection',
  'provider-unregister-vm-connection',
  'extensions-started',
];
const windowListeners = ['system-ready', 'provider-lifecycle-change'];

async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const providerInfos: Writable<ProviderInfo[]> = writable([]);

export const eventStore = new EventStore<ProviderInfo[]>(
  'providers',
  providerInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  fetchProviders,
);
eventStore.setup();

const updateProviderCallbacks: string[] = [];
export async function fetchProviders(): Promise<ProviderInfo[]> {
  const result = await window.getProviderInfos();
  providerInfos.set(result);
  result.forEach(providerInfo => {
    // register only if none for this provider id
    if (!updateProviderCallbacks.includes(providerInfo.internalId)) {
      window
        .onDidUpdateProviderStatus(providerInfo.internalId, () => {
          fetchProviders().catch((error: unknown) => {
            console.error('Failed to fetch providers', error);
          });
        })
        .catch((err: unknown) => {
          console.error('Failed to register onDidUpdateProviderStatus callback', err);
        });
      updateProviderCallbacks.push(providerInfo.internalId);
    }
  });
  return result;
}

/**
 * Counting the container connection per type is a small but
 * expensive iterative operation, creating a derived readable to avoid
 * recomputing it each time we need it.
 */
export const containerConnectionCount = derived([providerInfos], ([$providerInfos]) => {
  return $providerInfos.reduce(
    (acc, provider) => {
      provider.containerConnections.forEach(connection => {
        if (connection.status === 'stopped') return;

        switch (connection.type) {
          case 'podman':
            acc['podman'] = acc['podman'] + 1;
            break;
          case 'docker':
            acc['docker'] = acc['docker'] + 1;
            break;
        }
      });
      return acc;
    },
    { podman: 0, docker: 0 } as Record<'podman' | 'docker', number>,
  );
});
