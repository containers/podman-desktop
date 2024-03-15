/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { V1Ingress } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';
import { IngressRouteUtils } from './ingress-route-utils';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';

let ingressRouteUtils: IngressRouteUtils;

beforeEach(() => {
  vi.clearAllMocks();
  ingressRouteUtils = new IngressRouteUtils();
});

const ingressUI: IngressUI = {
  name: 'my-ingress',
  namespace: 'test-namespace',
  status: 'RUNNING',
  rules: [
    {
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
  selected: false,
};

const ingressUIWith2Paths: IngressUI = {
  name: 'my-ingress',
  namespace: 'test-namespace',
  status: 'RUNNING',
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
          {
            path: '/foo2',
            pathType: 'Prefix',
            backend: {
              service: {
                name: 'bucket-2',
                port: {
                  number: 80,
                },
              },
            },
          },
        ],
      },
    },
  ],
  selected: false,
};

const routeUI: RouteUI = {
  name: 'my-route',
  namespace: 'test-namespace',
  status: 'RUNNING',
  host: 'foo.bar.com',
  port: '80',
  to: {
    kind: 'Service',
    name: 'service',
  },
  tlsEnabled: true,
  selected: false,
};

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

test('expect isIngress returns true with IngressUI object', async () => {
  const result = ingressRouteUtils.isIngress(ingressUI);
  expect(result).toBeTruthy();
});

test('expect isIngress returns false with RouteUI object', async () => {
  const result = ingressRouteUtils.isIngress(routeUI);
  expect(result).toBeFalsy();
});

test('expect to return one hostPathObject with ingress that has one host/path', async () => {
  const ingressUI: IngressUI = {
    name: 'my-ingress',
    namespace: 'test-namespace',
    status: 'RUNNING',
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
    selected: false,
  };
  const result = ingressRouteUtils.getIngressHostPaths(ingressUI);
  expect(result.length).toBe(1);
  expect(result[0].label).toEqual('foo.bar.com/foo');
  expect(result[0].url).toEqual('https://foo.bar.com/foo');
});

test('expect to return one hostPathObject with ingress that has multiple host/path', async () => {
  const result = ingressRouteUtils.getIngressHostPaths(ingressUIWith2Paths);
  expect(result.length).toBe(2);
  expect(result[0].label).toEqual('foo.bar.com/foo');
  expect(result[0].url).toEqual('https://foo.bar.com/foo');
  expect(result[1].label).toEqual('foo.bar.com/foo2');
  expect(result[1].url).toEqual('https://foo.bar.com/foo2');
});

test('expect to return one hostPathObject without any link if ingress has no host defined', async () => {
  const result = ingressRouteUtils.getIngressHostPaths(ingressUI);
  expect(result.length).toBe(1);
  expect(result[0].label).toEqual('/foo');
  expect(result[0].url).toBeUndefined();
});

test('expect to return one hostPathObject if item is route', async () => {
  const result = ingressRouteUtils.getRouteHostPaths(routeUI);
  expect(result.length).toBe(1);
  expect(result[0].label).toEqual('foo.bar.com');
  expect(result[0].url).toEqual('https://foo.bar.com');
});

test('expect getIngressHostPaths is called with IngressUI object', async () => {
  const getIngressHostPathMock = vi.spyOn(ingressRouteUtils, 'getIngressHostPaths');
  const getRouteHostPathMock = vi.spyOn(ingressRouteUtils, 'getRouteHostPaths');
  ingressRouteUtils.getHostPaths(ingressUI);
  expect(getIngressHostPathMock).toBeCalledWith(ingressUI);
  expect(getRouteHostPathMock).not.toBeCalled();
});

test('expect getIngressHostPaths is called with RouteUI object', async () => {
  const getIngressHostPathMock = vi.spyOn(ingressRouteUtils, 'getIngressHostPaths');
  const getRouteHostPathMock = vi.spyOn(ingressRouteUtils, 'getRouteHostPaths');
  ingressRouteUtils.getHostPaths(routeUI);
  expect(getRouteHostPathMock).toBeCalledWith(routeUI);
  expect(getIngressHostPathMock).not.toBeCalled();
});

test('expect getIngressBackends is called with IngressUI object', async () => {
  const getIngressBackendsMock = vi.spyOn(ingressRouteUtils, 'getIngressBackends');
  ingressRouteUtils.getBackends(ingressUI);
  expect(getIngressBackendsMock).toBeCalledWith(ingressUI);
});

test('expect getIngressBackends is not called with RouteUI object', async () => {
  const getIngressBackendsMock = vi.spyOn(ingressRouteUtils, 'getIngressBackends');
  const result = ingressRouteUtils.getBackends(routeUI);
  expect(getIngressBackendsMock).not.toBeCalled();
  expect(result.length).toBe(1);
  expect(result[0]).toEqual('Service service');
});

test('expect to return one item array with ingress that has one host/path', async () => {
  const result = ingressRouteUtils.getIngressBackends(ingressUI);
  expect(result.length).toBe(1);
  expect(result[0]).toEqual('StorageBucket bucket');
});

test('expect to return one hostPathObject with ingress that has multiple path', async () => {
  const result = ingressRouteUtils.getIngressBackends(ingressUIWith2Paths);
  expect(result.length).toBe(2);
  expect(result[0]).toEqual('StorageBucket bucket');
  expect(result[1]).toEqual('bucket-2:80');
});

test('expect tls on route', async () => {
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
      tls: {
        termination: 'edge',
      },
      to: {
        kind: 'Service',
        name: 'service',
      },
    },
  } as V1Route;
  const routeUI = ingressRouteUtils.getRouteUI(route);
  expect(routeUI.tlsEnabled).toBeTruthy();
});

test('expect no tls on route', async () => {
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
  expect(routeUI.tlsEnabled).toBeFalsy();
});
