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
import type { IngressUIInfo } from '../../../main/src/plugin/api/kubernetes-info';
import type { V1Ingress } from '@kubernetes/client-node';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';

let readyToUpdate = false;

// Create function that converts an array of V1Ingress to IngressUIInfo
function convertIngressesToIngressUIInfo(ingresses: V1Ingress[]): IngressUIInfo[] {
  const result: IngressUIInfo[] = [];
  ingresses.forEach(ingress => {
    const ingressUIInfo: IngressUIInfo = {
      name: ingress.metadata?.name || '',
      namespace: ingress.metadata?.namespace || '',
      age: humanizeAge((ingress.metadata?.creationTimestamp || '').toString()),
      loadBalancers: ingress.status?.loadBalancer?.ingress?.map(ingress => ingress.ip || '') || [],
      // Create list of hosts. If it has tls, add https:// to the link, if not, add http://
      hosts: ingress.spec?.rules?.map(rule => 'https://'.concat(rule.host) || '') || [],
    };

    result.push(ingressUIInfo);
  });
  return result;
}

function humanizeAge(started: string): string {
  // get start time in ms
  const uptimeInMs = moment().diff(started);
  // make it human friendly
  return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
}

export async function fetchIngresses() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  console.log('Fetching ingresses');
  // Retrieve the ingresses from
  const ingresses = await window.kubernetesListIngresses();
  kubernetesIngressesInfos.set(convertIngressesToIngressUIInfo(ingresses));
}

export const kubernetesIngressesInfos: Writable<IngressUIInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, kubernetesIngressesInfos], ([$searchPattern, $infos]) => {
  return $infos.filter(ingressInfo => findMatchInLeaves(ingressInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchIngresses();
});
window.events?.receive('extension-stopped', async () => {
  await fetchIngresses();
});

window.events?.receive('provider-change', async () => {
  await fetchIngresses();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchIngresses();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchIngresses().catch((error: unknown) => {
    console.error('Failed to fetch ingresses', error);
  });
});
