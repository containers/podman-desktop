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

import { type Writable, writable } from 'svelte/store';

import type { ProviderInfo } from '../../../main/src/plugin/api/provider-info';
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
  'provider-register-kubernetes-connection',
  'provider-unregister-kubernetes-connection',
  'extensions-started',
];
const windowListeners = ['system-ready', 'provider-lifecycle-change'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const providerInfos: Writable<ProviderInfo[]> = writable([]);

const eventStore = new EventStore<ProviderInfo[]>(
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
