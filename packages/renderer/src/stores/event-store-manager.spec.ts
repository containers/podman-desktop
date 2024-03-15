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

import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import type { EventStoreInfo } from './event-store';
import { addStore, allEventStoresInfo, getStore, updateStore } from './event-store-manager';

beforeEach(() => {
  vi.clearAllMocks();
  allEventStoresInfo.set([]);
});

test('should add object into store-manager', async () => {
  expect(get(allEventStoresInfo).length).toBe(0);

  const eventStoreInfo: EventStoreInfo = {
    name: 'test',
    bufferEvents: [],
  } as unknown as EventStoreInfo;

  // add it
  addStore(eventStoreInfo);

  // check size
  expect(get(allEventStoresInfo).length).toBe(1);

  /// try to add it again
  addStore(eventStoreInfo);

  // check size (should be the same)
  expect(get(allEventStoresInfo).length).toBe(1);
});

test('should get object into store-manager', async () => {
  const eventStoreInfo: EventStoreInfo = {
    name: 'test',
    bufferEvents: [],
  } as unknown as EventStoreInfo;

  // add it
  addStore(eventStoreInfo);

  const foundStore = getStore('test');

  expect(foundStore).toBeDefined();
  expect(foundStore?.name).toBe('test');

  const notFoundStore = getStore('not-found');
  expect(notFoundStore).toBeUndefined();
});

test('should update object into store-manager', async () => {
  const eventStoreInfo: EventStoreInfo = {
    name: 'test-udpdate',
    size: 0,
    bufferEvents: [],
  } as unknown as EventStoreInfo;

  // add it
  addStore(eventStoreInfo);

  // grab objects from store
  const allEvents = get(allEventStoresInfo);
  expect(allEvents.length).toBe(1);
  // take first item
  const storeInfo = allEvents[0];
  // check the name
  expect(storeInfo.name).toBe('test-udpdate');
  expect(storeInfo.size).toBe(0);

  // create a new object with different size
  const updatedEventStoreInfo: EventStoreInfo = {
    name: 'test-udpdate',
    size: 1234,
  } as unknown as EventStoreInfo;
  updateStore(updatedEventStoreInfo);

  // grab objects from store
  const allEventsAfterUpdate = get(allEventStoresInfo);
  expect(allEventsAfterUpdate.length).toBe(1);
  // take first item
  const afterUpdateInfo = allEventsAfterUpdate[0];
  // check the name
  expect(afterUpdateInfo.name).toBe('test-udpdate');
  expect(afterUpdateInfo.size).toBe(1234);
});
