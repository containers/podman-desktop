/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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
import { derived, writable } from 'svelte/store';

import type { VolumeListInfo } from '../../../main/src/plugin/api/volume-info';
import VolumeIcon from '../lib/images/VolumeIcon.svelte';
import { EventStore } from './event-store';
import { findMatchInLeaves } from './search-util';

const windowEvents = [
  'extension-started',
  'extension-stopped',
  'provider-change',
  'container-stopped-event',
  'container-die-event',
  'container-kill-event',
  'container-init-event',
  'container-created-event',
  'container-started-event',
  'container-removed-event',
  'volume-event',
  'extensions-started',
];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const volumeListInfos: Writable<VolumeListInfo[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listVolumes = (...args: unknown[]): Promise<VolumeListInfo[]> => {
  const fetchUsage = args?.length > 0 && args[0] === 'fetchUsage';

  return window.listVolumes(fetchUsage);
};

export const volumesEventStore = new EventStore<VolumeListInfo[]>(
  'volumes',
  volumeListInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listVolumes,
  VolumeIcon,
);
const volumesEventStoreInfo = volumesEventStore.setupWithDebounce();

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

export const fetchVolumesWithData = async (): Promise<void> => {
  await volumesEventStoreInfo.fetch('fetchUsage');
};
