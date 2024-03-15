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

import { type Writable, writable } from 'svelte/store';

import type { ContainerInfo } from '../../../main/src/plugin/api/container-info';
import ContainerIcon from '../lib/images/ContainerIcon.svelte';
import { EventStore } from './event-store';

const windowEvents = [
  'extension-started',
  'container-stopped-event',
  'container-die-event',
  'container-kill-event',
  'container-init-event',
  'container-created-event',
  'container-started-event',
  'container-removed-event',
  'provider-change',
  'pod-event',
  'extensions-started',
];
const windowListeners = ['tray:update-provider', 'extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const containersInfos: Writable<ContainerInfo[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listContainers = (): Promise<ContainerInfo[]> => {
  return window.listContainers();
};

export const containersEventStore = new EventStore<ContainerInfo[]>(
  'containers',
  containersInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listContainers,
  ContainerIcon,
);
containersEventStore.setupWithDebounce();
