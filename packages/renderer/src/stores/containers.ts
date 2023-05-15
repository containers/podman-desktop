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
import type { ContainerInfo } from '../../../main/src/plugin/api/container-info';
import { findMatchInLeaves } from './search-util';

let readyToUpdate = false;

export async function fetchContainers() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }
  const result = await window.listContainers();
  containersInfos.set(result);
}

export const containersInfos: Writable<ContainerInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, containersInfos], ([$searchPattern, $containersInfos]) =>
  $containersInfos.filter(containerInfo => findMatchInLeaves(containerInfo, $searchPattern.toLowerCase())),
);

// need to refresh when extension is started
window.events?.receive('extension-started', async () => {
  await fetchContainers();
});

window.addEventListener('tray:update-provider', async () => {
  await fetchContainers();
});

window.events?.receive('container-stopped-event', async () => {
  await fetchContainers();
});

window.events?.receive('container-die-event', async () => {
  await fetchContainers();
});

window.events?.receive('container-kill-event', async () => {
  await fetchContainers();
});

window.events?.receive('container-started-event', async () => {
  await fetchContainers();
});

window.events?.receive('container-removed-event', async () => {
  await fetchContainers();
});

window.events?.receive('provider-change', async () => {
  await fetchContainers();
});

window.events?.receive('pod-event', async () => {
  await fetchContainers();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchContainers();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', async () => {
  readyToUpdate = true;
  await fetchContainers();
});
