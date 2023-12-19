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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';
import { EventStoreWithKubernetesInformer } from './kubernetes-informer-event-store';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const refreshInformerMock = vi.fn();
Object.defineProperty(global, 'window', {
  value: {
    events: {
      receive: eventEmitter.receive,
    },
    kubernetesRefreshInformer: refreshInformerMock,
  },
});

beforeAll(() => {
  vi.clearAllMocks();
});

interface MyCustomTypeInfo {
  name: string;
}

test('expect informerEvents call informerListener', async () => {
  const store: KubernetesInformerWritable<MyCustomTypeInfo[]> = customWritable([]);
  const informerEvents = ['a', 'b'];
  const informerRefreshEvents = ['c'];
  const informerListener = vi.fn();

  const eventStoreWithInformer = new EventStoreWithKubernetesInformer(
    store,
    informerEvents,
    informerRefreshEvents,
    informerListener,
  );
  eventStoreWithInformer.setup();

  // call 'a' event
  const informerEventCallback = callbacks.get('a');
  expect(informerEventCallback).toBeDefined();
  await informerEventCallback('d');

  expect(informerListener).toBeCalledWith('a', 'd');
});

test('expect informerRefreshEvents call kubernetesRefreshInformer', async () => {
  const store: KubernetesInformerWritable<MyCustomTypeInfo[]> = customWritable([]);
  vi.spyOn(store, 'getInformerId').mockReturnValue(1);
  const informerEvents = ['a', 'b'];
  const informerRefreshEvents = ['c'];
  const informerListener = vi.fn();

  const eventStoreWithInformer = new EventStoreWithKubernetesInformer(
    store,
    informerEvents,
    informerRefreshEvents,
    informerListener,
  );
  eventStoreWithInformer.setup();

  // call 'c' event
  const informerEventRefreshCallback = callbacks.get('c');
  expect(informerEventRefreshCallback).toBeDefined();
  await informerEventRefreshCallback();

  expect(refreshInformerMock).toBeCalledWith(1);
});

test('expect kubernetes-informer-refresh event empties the store', async () => {
  const store: KubernetesInformerWritable<MyCustomTypeInfo[]> = customWritable([
    {
      name: 'test',
    },
  ]);
  vi.spyOn(store, 'getInformerId').mockReturnValue(1);
  const informerEvents = ['a', 'b'];
  const informerRefreshEvents = ['c'];
  const informerListener = vi.fn();

  const eventStoreWithInformer = new EventStoreWithKubernetesInformer(
    store,
    informerEvents,
    informerRefreshEvents,
    informerListener,
  );
  eventStoreWithInformer.setup();

  // check if the list has 1 element
  const listInStore = get(store);
  expect(listInStore.length).toBe(1);

  // call 'kubernetes-informer-refresh' event
  const informerEventRefreshCallback = callbacks.get('kubernetes-informer-refresh');
  expect(informerEventRefreshCallback).toBeDefined();
  await informerEventRefreshCallback(1);

  // check if the list has been cleaned
  const listInStore1 = get(store);
  expect(listInStore1.length).toBe(0);
});
