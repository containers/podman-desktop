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
import type { PodUIInfo } from '../../../main/src/plugin/api/kubernetes-info';
import type { V1Pod } from '@kubernetes/client-node';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';

let readyToUpdate = false;

// Create function that converts an array of V1Pod to PodUIInfo
function convertPodsToPodUIInfo(pods: V1Pod[]): PodUIInfo[] {
  const result: PodUIInfo[] = [];
  pods.forEach(pod => {
    const podUIInfo: PodUIInfo = {
      name: pod.metadata?.name || '',
      namespace: pod.metadata?.namespace || '',
      node: pod.spec?.nodeName || '',
      restarts: pod.status?.containerStatuses?.reduce((acc, container) => acc + (container.restartCount || 0), 0) || 0,
      // Number of containers
      containers:
        pod.spec?.containers?.map(container => {
          return {
            name: container.name || '',
            image: container.image || '',
            // Check in pod.status.containerStatuses for the container status, if it matches the container.name add it to the UIInfo
            // if running exists, pass in 'running',
            // if terminated exists, pass in 'terminated',
            // if waiting exists, pass in 'waiting',
            // otherwise pass in undefined
            // TODO refactor
            state: pod.status?.containerStatuses?.find(containerStatus => containerStatus.name === container.name)
              ?.state?.running
              ? 'running'
              : pod.status?.containerStatuses?.find(containerStatus => containerStatus.name === container.name)?.state
                  ?.terminated
              ? 'terminated'
              : pod.status?.containerStatuses?.find(containerStatus => containerStatus.name === container.name)?.state
                  ?.waiting
              ? 'waiting'
              : undefined,
          };
        }) || [],
      // Status
      status: pod.status?.phase || '',
      age: humanizeAge((pod.metadata?.creationTimestamp || '').toString()),
      // Qos
      qos: pod.status?.qosClass || '',
      // Pods do not have a "Terminating" status and rather Kubernetes sets a deletionTimestamp
      // when a pod is terminating. We use this to determine if a pod is terminating or not (true / false).
      terminating: pod.metadata?.deletionTimestamp ? true : false,
    };
    result.push(podUIInfo);
  });
  return result;
}

function humanizeAge(started: string): string {
  // get start time in ms
  const uptimeInMs = moment().diff(started);
  // make it human friendly
  return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
}

export async function fetchPods() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  console.log('Fetching pods');
  // Retrieve the pods from
  const pods = await window.kubernetesListRawPods();
  kubernetesPodsInfos.set(convertPodsToPodUIInfo(pods));
}

export const kubernetesPodsInfos: Writable<PodUIInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, kubernetesPodsInfos], ([$searchPattern, $infos]) => {
  return $infos.filter(podInfo => findMatchInLeaves(podInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchPods();
});
window.events?.receive('extension-stopped', async () => {
  await fetchPods();
});

window.events?.receive('provider-change', async () => {
  await fetchPods();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchPods();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchPods().catch((error: unknown) => {
    console.error('Failed to fetch pods', error);
  });
});

// FOR TESTING PURPOSES ONLY
setInterval(() => {
  fetchPods().catch((error: unknown) => {
    console.error('Failed to fetch pods', error);
  });
}, 3000);
