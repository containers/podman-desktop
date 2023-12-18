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
import type { V1Route } from '../../../main/src/plugin/api/openshift-types';
import { routes, routesEventStore } from './routes';

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

beforeAll(() => {
  vi.clearAllMocks();
});

const v1Route: V1Route = {
  apiVersion: 'v1',
  kind: 'Route',
  metadata: {
    name: 'route',
    namespace: 'default',
  },
  spec: {
    host: 'a',
    tls: {
      insecureEdgeTerminationPolicy: '',
      termination: '',
    },
    to: {
      kind: '',
      name: '',
      weight: 0,
    },
    wildcardPolicy: '',
  },
};

const v2Route: V1Route = {
  apiVersion: 'v1',
  kind: 'Route',
  metadata: {
    name: 'route',
    namespace: 'default',
  },
  spec: {
    host: 'b',
    tls: {
      insecureEdgeTerminationPolicy: '',
      termination: '',
    },
    to: {
      kind: '',
      name: '',
      weight: 0,
    },
    wildcardPolicy: '',
  },
};

test('routes should be updated when informer sends signals', async () => {
  routesEventStore.setup();

  // get list
  const listRoutes = get(routes);
  expect(listRoutes.length).toBe(0);

  // call 'kubernetes-route-add' event
  const RouteAddCallback = callbacks.get('kubernetes-route-add');
  expect(RouteAddCallback).toBeDefined();
  await RouteAddCallback(v1Route);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the routes are updated
  const routes2 = get(routes);
  expect(routes2.length).toBe(1);
  expect(routes2[0].metadata?.name).equal('route');
  expect(routes2[0].spec?.host).equal('a');

  // call 'kubernetes-route-update' event - update the route
  const RouteUpdateCallback = callbacks.get('kubernetes-route-update');
  expect(RouteUpdateCallback).toBeDefined();
  await RouteUpdateCallback(v2Route);

  // check if the routes are updated
  const routes3 = get(routes);
  expect(routes3.length).toBe(1);
  expect(routes3[0].metadata?.name).equal('route');
  expect(routes3[0].spec?.host).equal('b');

  // call 'kubernetes-route-deleted' event
  const RouteDeleteCallback = callbacks.get('kubernetes-route-deleted');
  expect(RouteDeleteCallback).toBeDefined();
  await RouteDeleteCallback(v1Route);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the routes are updated
  const routes4 = get(routes);
  expect(routes4.length).toBe(0);
});
