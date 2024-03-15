/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { ImageCheckerInfo } from '../../../main/src/plugin/api/image-checker-info';
import { EventStore } from './event-store';

const windowEvents = ['image-checker-provider-update', 'image-checker-provider-remove'];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const imageCheckerProviders: Writable<readonly ImageCheckerInfo[]> = writable([]);

const getImageCheckerProvidersInfo = (): Promise<readonly ImageCheckerInfo[]> => {
  return window.getImageCheckerProviders();
};

const eventStore = new EventStore<readonly ImageCheckerInfo[]>(
  'image checker providers',
  imageCheckerProviders,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getImageCheckerProvidersInfo,
);
eventStore.setup();
