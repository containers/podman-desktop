/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import type { V1Ingress } from '@kubernetes/client-node';
import IngressesRoutesList from './IngressesRoutesList.svelte';
import { ingresses, ingressesEventStore } from '/@/stores/ingresses';
import { routes, routesEventStore } from '/@/stores/routes';
import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';

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
  vi.resetAllMocks();
  vi.clearAllMocks();
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(IngressesRoutesList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect ingress&routes empty screen', async () => {
  render(IngressesRoutesList);
  const noIngressesNorRoutes = screen.getByRole('heading', { name: 'No ingresses or routes' });
  expect(noIngressesNorRoutes).toBeInTheDocument();
});

test('Expect element in ingresses list', async () => {
  const ingress = {
    metadata: {
      name: 'my-ingress',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;
  const route = {
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
  } as V1Route;

  ingressesEventStore.setup();
  routesEventStore.setup();

  const ingressAddCallback = callbacks.get('kubernetes-ingress-add');
  expect(ingressAddCallback).toBeDefined();
  await ingressAddCallback(ingress);

  const routeAddCallback = callbacks.get('kubernetes-route-add');
  expect(routeAddCallback).toBeDefined();
  await routeAddCallback(route);

  // wait while store is populated
  while (get(ingresses).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(routes).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const ingressName = screen.getByRole('cell', { name: 'my-ingress' });
  expect(ingressName).toBeInTheDocument();
  const routeName = screen.getByRole('cell', { name: 'my-route' });
  expect(routeName).toBeInTheDocument();
});

test('Expect filter empty screen if no match', async () => {
  const ingress = {
    metadata: {
      name: 'my-ingress',
      namespace: 'test-namespace',
    },
    spec: {
      rules: [
        {
          host: 'foo.bar.com',
          http: {
            paths: [
              {
                path: '/foo',
                pathType: 'Prefix',
                backend: {
                  resource: {
                    name: 'bucket',
                    kind: 'StorageBucket',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  } as V1Ingress;

  ingressesEventStore.setup();

  const ingressAddCallback = callbacks.get('kubernetes-ingress-add');
  expect(ingressAddCallback).toBeDefined();
  await ingressAddCallback(ingress);

  // wait while store is populated
  while (get(ingresses).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
