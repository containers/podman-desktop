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
import { beforeAll, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DeploymentsList from './DeploymentsList.svelte';
import { get } from 'svelte/store';
import { deployments } from '/@/stores/deployments';

const listDeploymentsMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesListDeployments = listDeploymentsMock;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(DeploymentsList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect deployment empty screen', async () => {
  listDeploymentsMock.mockResolvedValue([]);
  render(DeploymentsList);
  const noDeployments = screen.getByRole('heading', { name: 'No deployments' });
  expect(noDeployments).toBeInTheDocument();
});

test('Expect deployments list', async () => {
  listDeploymentsMock.mockResolvedValue([
    {
      metadata: {
        name: 'my-deployment',
        namespace: 'test-namespace',
      },
      status: {
        replicas: 4,
        readyReplicas: 2,
      },
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait while store is populated
  while (get(deployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const deploymentName = screen.getByRole('cell', { name: 'my-deployment' });
  const deploymentNamespace = screen.getByRole('cell', { name: 'test-namespace' });
  expect(deploymentName).toBeInTheDocument();
  expect(deploymentNamespace).toBeInTheDocument();
});

test('Expect filter empty screen', async () => {
  listDeploymentsMock.mockResolvedValue([
    {
      metadata: {
        name: 'my-deployment',
        namespace: 'test-namespace',
      },
      status: {
        replicas: 4,
        readyReplicas: 2,
      },
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait while store is populated
  while (get(deployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
