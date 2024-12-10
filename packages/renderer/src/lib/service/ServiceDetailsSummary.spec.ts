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

import type { V1Service } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import ServiceDetailsSummary from './ServiceDetailsSummary.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => ({}));

const service: V1Service = {
  metadata: {
    name: 'my-service',
    namespace: 'default',
  },
  spec: {
    clusterIP: '10.10.10.1',
    ports: [
      {
        name: 'http',
        port: 8080,
        targetPort: 8080,
      },
    ],
  },
  status: {},
};

const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedServiceMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesGetCurrentNamespace', { value: kubernetesGetCurrentNamespaceMock });
  Object.defineProperty(window, 'kubernetesReadNamespacedService', { value: kubernetesReadNamespacedServiceMock });
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([]);
});

test('Expect basic rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(service);

  render(ServiceDetailsSummary, { service: service });

  expect(screen.getByText('my-service')).toBeInTheDocument();
});

test('Check more properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedServiceMock.mockResolvedValue(undefined);

  render(ServiceDetailsSummary, { service: service });

  expect(screen.getByText('my-service')).toBeInTheDocument();
  expect(screen.getByText('default')).toBeInTheDocument();
  expect(screen.getByText('10.10.10.1')).toBeInTheDocument();
});
