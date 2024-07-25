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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type { V1Service } from '@kubernetes/client-node';
import { fireEvent, render, screen } from '@testing-library/svelte';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
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
  (window as any).kubernetesDeleteService = vi.fn();
  vi.mocked(window.kubernetesDeleteService);
  (window as any).getConfigurationValue = vi.fn();
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
});

async function waitRender(customProperties: object): Promise<void> {
  render(ServicesList, { ...customProperties });
  await tick();
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
      namespace: 'test-namespace',
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

  const serviceName = screen.getByRole('cell', { name: 'my-service test-namespace' });
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

test('Expect user confirmation to pop up when preferences require', async () => {
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

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle service' });
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  (window as any).showMessageBox = vi.fn();
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 1 });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 0 });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  vi.waitFor(() => expect(window.kubernetesDeleteService).toHaveBeenCalled());
});
