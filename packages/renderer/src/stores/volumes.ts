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
import type { VolumeListInfo } from '../../../main/src/plugin/api/volume-info';
import { findMatchInLeaves } from './search-util';

let readyToUpdate = false;
export let volumesInitialized = false;

export async function fetchVolumes() {
  if (!readyToUpdate) {
    return;
  }
  const result = await window.listVolumes();
  volumeListInfos.set(result);
  volumesInitialized = true;
}

export const volumeListInfos: Writable<VolumeListInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, volumeListInfos], ([$searchPattern, $volumeListInfos]) => {
  // returned object
  return $volumeListInfos.map(volumeInfo => {
    // list of volumes is filtered
    const filteredVolumes = volumeInfo.Volumes.filter(volume =>
      findMatchInLeaves(volume, $searchPattern.toLowerCase()),
    );

    return {
      ...volumeInfo,
      Volumes: filteredVolumes,
    };
  });
});

export function initWindowFetchVolumes() {
  // need to refresh when extension is started or stopped
  window?.events?.receive('extension-started', async () => {
    await fetchVolumes();
  });
  window?.events?.receive('extension-stopped', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('provider-change', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('container-stopped-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('container-die-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('container-kill-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('container-started-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('container-removed-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('volume-event', async () => {
    await fetchVolumes();
  });

  window?.events?.receive('extensions-started', async () => {
    // make it ready to update
    readyToUpdate = true;
  });

  window.addEventListener('extensions-already-started', async () => {
    // make it ready to update
    readyToUpdate = true;
  });
}

initWindowFetchVolumes();
