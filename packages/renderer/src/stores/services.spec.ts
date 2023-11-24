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
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';
import type { V1Service } from '@kubernetes/client-node';
import { fetchServicesWithData, services, servicesEventStore } from './services';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listServicesMock: Mock<any, Promise<V1Service[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    kubernetesListServices: listServicesMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test('services should be updated in case of a extension is removed', async () => {
  // initial services
  listServicesMock.mockResolvedValue([
    {
      metadata: {
        name: 'my-service',
        namespace: 'test-namespace',
      },
      spec: {},
    } as unknown as V1Service,
  ]);
  servicesEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch services
  await fetchServicesWithData();

  // now get list
  const listServices = get(services);
  expect(listServices.length).toBe(1);
  expect(listServices[0].metadata?.name).toBe('my-service');

  // ok now mock the listServices function to return an empty list
  listServicesMock.mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait debounce
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the services are updated
  const services2 = get(services);
  expect(services2.length).toBe(0);
});
