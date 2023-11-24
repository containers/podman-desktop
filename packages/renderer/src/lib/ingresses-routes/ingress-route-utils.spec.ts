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

import { beforeEach, expect, test, vi } from 'vitest';
import { IngressRouteUtils } from './ingress-route-utils';
import type { V1Ingress } from '@kubernetes/client-node';
import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';

let ingressRouteUtils: IngressRouteUtils;

beforeEach(() => {
  vi.clearAllMocks();
  ingressRouteUtils = new IngressRouteUtils();
});

test('expect basic UI conversion for ingress', async () => {
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
  const ingressUI = ingressRouteUtils.getIngressUI(ingress);
  expect(ingressUI.name).toEqual('my-ingress');
  expect(ingressUI.namespace).toEqual('test-namespace');
  expect(ingressUI.rules).toBeDefined();
  expect(ingressUI.rules).equal(ingress.spec?.rules);
});

test('expect basic UI conversion for route with port', async () => {
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
  const routeUI = ingressRouteUtils.getRouteUI(route);
  expect(routeUI.name).toEqual('my-route');
  expect(routeUI.namespace).toEqual('test-namespace');
  expect(routeUI.host).toEqual(route.spec.host);
  expect(routeUI.port).toEqual(route.spec.port?.targetPort);
  expect(routeUI.path).toBeUndefined();
  expect(routeUI.to.kind).toEqual(route.spec.to.kind);
  expect(routeUI.to.name).toEqual(route.spec.to.name);
});

test('expect basic UI conversion for route with path', async () => {
  const route = {
    metadata: {
      name: 'my-route',
      namespace: 'test-namespace',
    },
    spec: {
      host: 'foo.bar.com',
      path: '/test',
      to: {
        kind: 'Service',
        name: 'service',
      },
    },
  } as V1Route;
  const routeUI = ingressRouteUtils.getRouteUI(route);
  expect(routeUI.name).toEqual('my-route');
  expect(routeUI.namespace).toEqual('test-namespace');
  expect(routeUI.host).toEqual(route.spec.host);
  expect(routeUI.port).toBeUndefined();
  expect(routeUI.path).toEqual(route.spec.path);
  expect(routeUI.to.kind).toEqual(route.spec.to.kind);
  expect(routeUI.to.name).toEqual(route.spec.to.name);
});
