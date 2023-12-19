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
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DeploymentsList from './DeploymentsList.svelte';
import { get } from 'svelte/store';
import { deployments, deploymentsEventStore } from '/@/stores/deployments';
import type { V1Deployment } from '@kubernetes/client-node';

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
  const result = render(DeploymentsList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect deployment empty screen', async () => {
  render(DeploymentsList);
  const noDeployments = screen.getByRole('heading', { name: 'No deployments' });
  expect(noDeployments).toBeInTheDocument();
});

test('Expect deployments list', async () => {
  const deployment: V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    spec: {
      replicas: 2,
      selector: {},
      template: {},
    },
  };

  deploymentsEventStore.setup();

  const DeploymentAddCallback = callbacks.get('kubernetes-deployment-add');
  expect(DeploymentAddCallback).toBeDefined();
  await DeploymentAddCallback(deployment);

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
  const deployment: V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'my-deployment',
      namespace: 'test-namespace',
    },
    spec: {
      replicas: 2,
      selector: {},
      template: {},
    },
  };

  deploymentsEventStore.setup();

  const DeploymentAddCallback = callbacks.get('kubernetes-deployment-add');
  expect(DeploymentAddCallback).toBeDefined();
  await DeploymentAddCallback(deployment);

  // wait while store is populated
  while (get(deployments).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});
