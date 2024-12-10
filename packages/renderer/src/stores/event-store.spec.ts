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

import { get, type Writable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { EventStore, type EventStoreInfo } from './event-store';

// first, path window object
const callbacks = new Map<string, (arg?: unknown) => Promise<void>>();
const eventEmitter = {
  receive: (message: string, callback: (arg?: unknown) => Promise<void>) => {
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

class TestEventStore<T> extends EventStore<T> {
  public async performUpdate(
    needUpdate: boolean,
    eventStoreInfo: EventStoreInfo,
    eventName: string,
    args?: unknown[],
  ): Promise<void> {
    return super.performUpdate(needUpdate, eventStoreInfo, eventName, args);
  }
}

test('should call fetch method using window event', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowEventName = 'my-custom-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new TestEventStore('my-test', myStoreInfo, checkForUpdateMock, [windowEventName], [], updater);

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

  await callback?.();

  // check the updater is called
  await vi.waitFor(() => {
    expect(updater).toHaveBeenCalled();
  });

  // check the store is updated
  await vi.waitFor(() => {
    expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);
  });

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBe(1);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('name', windowEventName);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('skipped', false);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('args', []);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('length', 1);
});

test('should call fetch method using listener event', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowListenerEventName = 'my-custom-listener-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new TestEventStore(
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

  await callback?.();

  // check the updater is called
  await vi.waitFor(() => {
    expect(updater).toHaveBeenCalled();
  });

  // check the store is updated
  await vi.waitFor(() => {
    expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);
  });

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBe(1);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('name', windowListenerEventName);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('skipped', false);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('args', []);
  expect(eventStoreInfo.bufferEvents[0]).toHaveProperty('length', 1);
});

test('should call fetch with arguments', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new EventStore('my-listener-test', myStoreInfo, checkForUpdateMock, [], [], updater);
  // now call the setup
  const eventStoreInfo = eventStore.setup();

  expect(eventStoreInfo.bufferEvents.length).toBe(0);

  const args = ['my', 'list', 'of', 'arguments'];

  // do a manual fetch
  await eventStoreInfo.fetch(...args);

  // wait updater being called
  while (updater.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // check the updater is called
  expect(updater).toHaveBeenCalledWith(...args);
});

test('should call fetch method using window event and object argument', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowEventName = 'my-custom-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new TestEventStore('my-test', myStoreInfo, checkForUpdateMock, [windowEventName], [], updater);

  // callbacks are empty
  expect(callbacks.size).toBe(0);

  // now call the setup
  eventStore.setup();

  // check we have callbacks
  expect(callbacks.size).toBe(1);

  // now we call the listener
  const callback = callbacks.get(windowEventName);
  expect(callback).toBeDefined();

  const myCustomTypeInfo: MyCustomTypeInfo = {
    name: 'my-custom-type',
  };
  updater.mockResolvedValue([myCustomTypeInfo]);

  await callback?.({});

  // wait updater method being called
  while (updater.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // check the updater is called
  expect(updater).toHaveBeenCalledWith({});
});

test('Check debounce', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowEventName = 'my-custom-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new TestEventStore('my-test', myStoreInfo, checkForUpdateMock, [windowEventName], [], updater);

  // callbacks are empty
  expect(callbacks.size).toBe(0);

  // now call the setup with a debounce value of 200ms and no throttle
  const eventStoreInfo = eventStore.setupWithDebounce(200, 0);

  // spy performUpdate method
  const performUpdateSpy = vi.spyOn(eventStore, 'performUpdate');

  // check we have callbacks
  expect(callbacks.size).toBe(1);

  // now we call the listener
  const callback = callbacks.get(windowEventName);
  expect(callback).toBeDefined();

  const myCustomTypeInfo: MyCustomTypeInfo = {
    name: 'my-custom-type',
  };
  updater.mockResolvedValue([myCustomTypeInfo]);

  // now, perform 20 calls every 50ms
  for (let i = 0; i < 20; i++) {
    await callback?.();
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // wait debounce being called for 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // We did a lot of calls but with debounce, it should only be called once
  expect(updater).toHaveBeenCalledOnce();

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check we have called performUpdate only once
  expect(performUpdateSpy).toHaveBeenCalledOnce();

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBeGreaterThan(1);
});

// check that we're still calling the update method
// every throttle even if we have lot of calls and are postponing with debounce
test('Check debounce+delay', async () => {
  const myStoreInfo: Writable<MyCustomTypeInfo[]> = writable([]);
  const checkForUpdateMock = vi.fn();

  const windowEventName = 'my-custom-event';
  const updater = vi.fn();

  // return true to trigger the update
  checkForUpdateMock.mockResolvedValue(true);

  const eventStore = new EventStore('my-test', myStoreInfo, checkForUpdateMock, [windowEventName], [], updater);

  // callbacks are empty
  expect(callbacks.size).toBe(0);

  // now call the setup with a debounce value of 200ms and a throttle of 1s
  const eventStoreInfo = eventStore.setupWithDebounce(200, 1000);

  // check we have callbacks
  expect(callbacks.size).toBe(1);

  // now we call the listener
  const callback = callbacks.get(windowEventName);
  expect(callback).toBeDefined();

  const myCustomTypeInfo: MyCustomTypeInfo = {
    name: 'my-custom-type',
  };
  updater.mockResolvedValue([myCustomTypeInfo]);

  // now, perform 40 calls every 50ms
  for (let i = 0; i < 20; i++) {
    await callback?.();
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // wait debounce being called for 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));

  // We did a lot of calls but with debounce and throttle it should be only like 2 calls
  // get number of calls
  const calls = updater.mock.calls.length;
  expect(calls).toBeGreaterThan(1);
  expect(calls).toBeLessThanOrEqual(4);

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check the store is updated
  expect(get(myStoreInfo)).toStrictEqual([myCustomTypeInfo]);

  // check buffer events
  expect(eventStoreInfo.bufferEvents.length).toBeGreaterThan(1);
});
