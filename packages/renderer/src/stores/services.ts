/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { writable, derived, type Writable } from 'svelte/store';
import type { V1Service } from '@kubernetes/client-node';

import { findMatchInLeaves } from './search-util';
import { EventStore } from './event-store';
import ServiceIcon from '../lib/images/ServiceIcon.svelte';

const windowEvents = ['extension-started', 'extension-stopped', 'provider-change', 'extensions-started'];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const services: Writable<V1Service[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, services], ([$searchPattern, $serviceInfos]) =>
  $serviceInfos.filter(service => findMatchInLeaves(service, $searchPattern.toLowerCase())),
);

export const servicesEventStore = new EventStore<V1Service[]>(
  'services',
  services,
  checkForUpdate,
  windowEvents,
  windowListeners,
  grabAllServices,
  ServiceIcon,
);
const servicesEventStoreInfo = servicesEventStore.setupWithDebounce();

export async function grabAllServices(): Promise<V1Service[]> {
  return window.kubernetesListServices();
}

export const fetchServicesWithData = async () => {
  await servicesEventStoreInfo.fetch('fetchUsage');
};
