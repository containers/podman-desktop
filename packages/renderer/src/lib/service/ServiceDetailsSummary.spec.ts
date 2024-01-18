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

import '@testing-library/jest-dom/vitest';
import { test, vi, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ServiceDetailsSummary from './ServiceDetailsSummary.svelte';
import type { ServiceUI } from './ServiceUI';
import type { V1Service } from '@kubernetes/client-node';

const serviceUI: ServiceUI = {
  name: 'my-service',
  status: 'RUNNING',
  namespace: 'default',
  selected: false,
  type: '',
  clusterIP: 'the-cluster-ip',
  ports: '80/TCP',
};

const service: V1Service = {
  metadata: {
    name: 'my-service',
    namespace: 'default',
  },
  status: {},
};

const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedServiceMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesGetCurrentNamespace = kubernetesGetCurrentNamespaceMock;
  (window as any).kubernetesReadNamespacedService = kubernetesReadNamespacedServiceMock;
});

test('Expect basic rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(service);

  render(ServiceDetailsSummary, { serviceUI: serviceUI, service: service });

  expect(screen.getByText(serviceUI.name)).toBeInTheDocument();
});

test('Check more properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(undefined);

  render(ServiceDetailsSummary, { serviceUI: serviceUI, service: service });

  expect(screen.getByText(serviceUI.name)).toBeInTheDocument();
  expect(screen.getByText(serviceUI.namespace)).toBeInTheDocument();
  expect(screen.getByText(serviceUI.clusterIP)).toBeInTheDocument();
  expect(screen.getByText(serviceUI.ports)).toBeInTheDocument();
});
