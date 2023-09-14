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

import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { findMatchInLeaves } from './search-util';
import type { ServiceUIInfo } from '../../../main/src/plugin/api/kubernetes-info';
import type { V1Service } from '@kubernetes/client-node';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';

let readyToUpdate = false;

// Create function that converts an array of V1Service to ServiceUIInfo
function convertServicesToServiceUIInfo(services: V1Service[]): ServiceUIInfo[] {
  const result: ServiceUIInfo[] = [];
  services.forEach(service => {
    const serviceUIInfo: ServiceUIInfo = {
      name: service.metadata?.name || '',
      namespace: service.metadata?.namespace || '',
      age: humanizeAge((service.metadata?.creationTimestamp || '').toString()),
      type: service.spec?.type || '',
      clusterIP: service.spec?.clusterIP || '',
      externalIP: service.spec?.externalIPs?.join(', ') || '',
      ports: service.spec?.ports?.map(port => `${port.port}/${port.protocol}`) || [],
    };
    result.push(serviceUIInfo);
  });
  return result;
}

function humanizeAge(started: string): string {
  // get start time in ms
  const uptimeInMs = moment().diff(started);
  // make it human friendly
  return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
}

export async function fetchServices() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  console.log('Fetching services');
  // Retrieve the services from
  const services = await window.kubernetesListServices();
  kubernetesServicesInfos.set(convertServicesToServiceUIInfo(services));
}

export const kubernetesServicesInfos: Writable<ServiceUIInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, kubernetesServicesInfos], ([$searchPattern, $infos]) => {
  return $infos.filter(serviceInfo => findMatchInLeaves(serviceInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchServices();
});
window.events?.receive('extension-stopped', async () => {
  await fetchServices();
});

window.events?.receive('provider-change', async () => {
  await fetchServices();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchServices();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchServices().catch((error: unknown) => {
    console.error('Failed to fetch services', error);
  });
});
