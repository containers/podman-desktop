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
import type { PVCUIInfo } from '../../../main/src/plugin/api/kubernetes-info';
import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';

let readyToUpdate = false;

// Create function that converts an array of V1PVC to PVCUIInfo
function convertPVCsToPVCUIInfo(pvcs: V1PersistentVolumeClaim[]): PVCUIInfo[] {
  const result: PVCUIInfo[] = [];
  pvcs.forEach(pvc => {
    const pvcUIInfo: PVCUIInfo = {
      name: pvc.metadata?.name || '',
      namespace: pvc.metadata?.namespace || '',
      age: humanizeAge((pvc.metadata?.creationTimestamp || '').toString()),
      size: pvc.spec?.resources?.requests?.storage || '',
      storageClass: pvc.spec?.storageClassName || '',
    };
    result.push(pvcUIInfo);
  });
  return result;
}

function humanizeAge(started: string): string {
  // get start time in ms
  const uptimeInMs = moment().diff(started);
  // make it human friendly
  return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
}

export async function fetchPVCs() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  console.log('Fetching pvcs');
  // Retrieve the pvcs from
  const pvcs = await window.kubernetesListPVCs();
  kubernetesPVCsInfos.set(convertPVCsToPVCUIInfo(pvcs));
}

export const kubernetesPVCsInfos: Writable<PVCUIInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, kubernetesPVCsInfos], ([$searchPattern, $infos]) => {
  return $infos.filter(pvcInfo => findMatchInLeaves(pvcInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchPVCs();
});
window.events?.receive('extension-stopped', async () => {
  await fetchPVCs();
});

window.events?.receive('provider-change', async () => {
  await fetchPVCs();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchPVCs();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchPVCs().catch((error: unknown) => {
    console.error('Failed to fetch pvcs', error);
  });
});
