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
import type { PodInfo } from '../../../main/src/plugin/api/pod-info';
import { findMatchInLeaves } from './search-util';

let readyToUpdate = false;

export async function fetchPods() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }
  let result = await window.listPods();
  try {
    const pods = await window.kubernetesListPods();
    result = result.concat(pods);
  } finally {
    podsInfos.set(result);
  }
}

export const podsInfos: Writable<PodInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, podsInfos], ([$searchPattern, $imagesInfos]) => {
  return $imagesInfos.filter(podInfo => findMatchInLeaves(podInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchPods();
});
window.events?.receive('extension-stopped', async () => {
  await fetchPods();
});

window.events?.receive('container-stopped-event', async () => {
  await fetchPods();
});

window.events?.receive('container-die-event', async () => {
  await fetchPods();
});

window.events?.receive('container-kill-event', async () => {
  await fetchPods();
});

window.events?.receive('container-started-event', async () => {
  await fetchPods();
});

window.events?.receive('provider-change', async () => {
  await fetchPods();
});

window.events?.receive('pod-event', async () => {
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
