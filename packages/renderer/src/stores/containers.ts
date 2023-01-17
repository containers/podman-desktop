/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

export async function fetchContainers() {
  const result = await window.listContainers();
  containersInfos.set(result);
}

export const containersInfos: Writable<ContainerInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, containersInfos], ([$searchPattern, $containersInfos]) =>
  $containersInfos.filter(containerInfo => findMatchInLeaves(containerInfo, $searchPattern.toLowerCase())),
);

// need to refresh when extension is started or stopped
window.addEventListener('extension-started', () => {
  fetchContainers();
});

window.addEventListener('tray:update-provider', () => {
  fetchContainers();
});
window.addEventListener('system-ready', () => {
  fetchContainers();
});

window.events?.receive('container-stopped-event', () => {
  fetchContainers();
});

window.events?.receive('container-die-event', () => {
  fetchContainers();
});

window.events?.receive('container-kill-event', () => {
  fetchContainers();
});

window.events?.receive('container-started-event', () => {
  fetchContainers();
});

window.events?.receive('container-removed-event', () => {
  fetchContainers();
});

window.events?.receive('provider-change', () => {
  fetchContainers();
});

window.events?.receive('pod-event', () => {
  fetchContainers();
});
