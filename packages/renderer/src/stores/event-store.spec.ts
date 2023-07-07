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

import { beforeEach, expect, test, vi } from 'vitest';
import { EventStore } from './event-store';
import { get, writable, type Writable } from 'svelte/store';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

Object.defineProperty(global, 'window', {
  value: {
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeEach(() => {
  callbacks.clear();
  vi.clearAllMocks();
});

interface MyCustomTypeInfo {
  name: string;
}

test('should call fetch method using window event', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowEventName = 'my-custom-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new EventStore('my-test', myStoreInfo, checkForUpdateMock, [windowEventName], [], updater);

  // callbacks are empty
  expect(callbacks.size).toBe(0);

  // now call the setup
  const eventStoreInfo = eventStore.setup();

  // check we have callbacks
  expect(callbacks.size).toBe(1);

  // now we call the listener
  const callback = callbacks.get(windowEventName);
  expect(callback).toBeDefined();

  const myCustomTypeInfo: MyCustomTypeInfo = {
    name: 'my-custom-type',
  };
  updater.mockResolvedValue([myCustomTypeInfo]);

  await callback();

  // check the updater is called
  expect(updater).toHaveBeenCalled();

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBe(1);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('name', windowEventName);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('skipped', false);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('args', undefined);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('length', 1);
});

test('should call fetch method using listener event', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowListenerEventName = 'my-custom-listener-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new EventStore(
    'my-listener-test',
    myStoreInfo,
    checkForUpdateMock,
    [],
    [windowListenerEventName],
    updater,
  );

  // callbacks are empty
  expect(callbacks.size).toBe(0);

  // now call the setup
  const eventStoreInfo = eventStore.setup();

  expect(eventStoreInfo.bufferEvents.length).toBe(0);

  // check we have callbacks
  expect(callbacks.size).toBe(1);

  // now we call the listener
  const callback = callbacks.get(windowListenerEventName);
  expect(callback).toBeDefined();

  const myCustomTypeInfo: MyCustomTypeInfo = {
    name: 'my-custom-type',
  };
  updater.mockResolvedValue([myCustomTypeInfo]);

  await callback();

  // wait updater being called
  while (updater.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // check the updater is called
  expect(updater).toHaveBeenCalled();

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBe(1);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('name', windowListenerEventName);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('skipped', false);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('args', undefined);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('length', 1);
});
