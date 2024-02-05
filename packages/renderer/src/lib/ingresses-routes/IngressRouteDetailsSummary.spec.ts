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

import '@testing-library/jest-dom/vitest';
import { test, vi, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import IngressRouteDetailsSummary from './IngressRouteDetailsSummary.svelte';
import type { IngressUI } from './IngressUI';
import type { RouteUI } from './RouteUI';
import type { V1Ingress } from '@kubernetes/client-node';
import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';

const ingressUI: IngressUI = {
  name: 'my-ingress',
  namespace: 'default',
  status: 'RUNNING',
  selected: false,
};

const ingress: V1Ingress = {
  metadata: {
    name: 'my-ingress',
    namespace: 'default',
  },
  status: {},
};

const routeUI: RouteUI = {
  name: 'my-route',
  namespace: 'default',
  status: 'RUNNING',
  host: 'foo.bar.com',
  port: '80',
  to: {
    kind: 'Service',
    name: 'service',
  },
  selected: false,
  tlsEnabled: false,
};

const route: V1Route = {
  metadata: {
    name: 'my-route',
    namespace: 'default',
  },
  spec: {
    host: '',
    port: undefined,
    path: undefined,
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

const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedServiceMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesGetCurrentNamespace = kubernetesGetCurrentNamespaceMock;
  (window as any).kubernetesReadNamespacedService = kubernetesReadNamespacedServiceMock;
});

test('Expect basic ingress rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(ingress);

  render(IngressRouteDetailsSummary, { ingressRouteUI: ingressUI, ingressRoute: ingress });

  expect(screen.getByText(ingressUI.name)).toBeInTheDocument();
});

test('Expect basic route rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(route);

  render(IngressRouteDetailsSummary, { ingressRouteUI: routeUI, ingressRoute: route });

  expect(screen.getByText(routeUI.name)).toBeInTheDocument();
});

test('Check more ingress properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(undefined);

  render(IngressRouteDetailsSummary, { ingressRouteUI: ingressUI, ingressRoute: ingress });

  expect(screen.getByText(ingressUI.name)).toBeInTheDocument();
  expect(screen.getByText(ingressUI.namespace)).toBeInTheDocument();
});

test('Check more route properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(undefined);

  render(IngressRouteDetailsSummary, { ingressRouteUI: routeUI, ingressRoute: route });

  expect(screen.getByText(routeUI.name)).toBeInTheDocument();
  expect(screen.getByText(routeUI.namespace)).toBeInTheDocument();
});
