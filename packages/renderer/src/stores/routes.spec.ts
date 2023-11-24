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
import type { V1Route } from '../../../main/src/plugin/api/openshift-types';
import { fetchRoutesWithData, routes, routesEventStore } from './routes';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listRoutesMock: Mock<any, Promise<V1Route[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    kubernetesListRoutes: listRoutesMock,
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

test('routes should be updated in case of a extension is removed', async () => {
  // initial routes
  listRoutesMock.mockResolvedValue([
    {
      metadata: {
        name: 'my-route',
        namespace: 'test-namespace',
      },
      spec: {
        host: 'foo.bar.com',
        port: {
          targetPort: '80',
        },
        to: {
          kind: 'Service',
          name: 'service',
        },
      },
    } as unknown as V1Route,
  ]);
  routesEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch routes
  await fetchRoutesWithData();

  // now get list
  const listRoutes = get(routes);
  expect(listRoutes.length).toBe(1);
  expect(listRoutes[0].metadata.name).toBe('my-route');

  // ok now mock the listRoutes function to return an empty list
  listRoutesMock.mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait debounce
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the routes are updated
  const routes2 = get(routes);
  expect(routes2.length).toBe(0);
});
