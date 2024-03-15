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

import { get, type Writable, writable } from 'svelte/store';

import type { EventStoreInfo } from './event-store';

// This class manages access to different event stores

export const allEventStoresInfo: Writable<EventStoreInfo[]> = writable([]);

export function addStore(eventStoreInfo: EventStoreInfo) {
  const allEvents = get(allEventStoresInfo);

  // search if we have a matching store
  const index = allEvents.findIndex(storeInfo => storeInfo.name === eventStoreInfo.name);
  if (index === -1) {
    allEvents.push(eventStoreInfo);
    allEventStoresInfo.set(allEvents);
  }
}

export function getStore(name: string): EventStoreInfo | undefined {
  const allEvents = get(allEventStoresInfo);
  const storeInfo = allEvents.find(storeInfo => storeInfo.name === name);
  if (storeInfo) {
    return storeInfo;
  }
  return undefined;
}

export function updateStore(eventStoreInfo: EventStoreInfo): void {
  const allEvents = get(allEventStoresInfo);
  const storeInfoIndex = allEvents.findIndex(storeInfo => storeInfo.name === eventStoreInfo.name);
  if (storeInfoIndex !== -1) {
    allEvents[storeInfoIndex] = eventStoreInfo;
    allEventStoresInfo.set(allEvents);
  }
}
