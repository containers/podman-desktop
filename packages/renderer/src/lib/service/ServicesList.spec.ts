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

import '@testing-library/jest-dom/vitest';

import type { V1Service } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesCurrentContextServices } from '/@/stores/kubernetes-contexts-state';

import ServicesList from './ServicesList.svelte';

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesRegisterGetCurrentContextResources = kubernetesRegisterGetCurrentContextResourcesMock;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  (window as any).kubernetesGetContextsGeneralState = () => Promise.resolve(new Map());
  (window as any).kubernetesGetCurrentContextGeneralState = () => Promise.resolve({});
  (window as any).window.kubernetesUnregisterGetCurrentContextResources = () => Promise.resolve(undefined);
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(ServicesList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect service empty screen', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  render(ServicesList);
  const noServices = screen.getByRole('heading', { name: 'No services' });
  expect(noServices).toBeInTheDocument();
});

test('Expect services list', async () => {
  const service: V1Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my-service',
    },
    spec: {
      selector: {},
      ports: [],
      externalName: 'serve',
    },
  };
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([service]);

  // wait while store is populated
  while (get(kubernetesCurrentContextServices).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const serviceName = screen.getByRole('cell', { name: 'my-service' });
  expect(serviceName).toBeInTheDocument();
});

test('Expect filter empty screen', async () => {
  const service: V1Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: 'my-service',
    },
    spec: {
      selector: {},
      ports: [],
      externalName: 'serve',
    },
  };
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([service]);

  // wait while store is populated
  while (get(kubernetesCurrentContextServices).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
