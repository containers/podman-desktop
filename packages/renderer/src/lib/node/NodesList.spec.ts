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

import type { V1Node } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import {
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextNodesFiltered,
} from '/@/stores/kubernetes-contexts-state';

import NodesList from './NodesList.svelte';

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
  render(NodesList, { ...customProperties });
  // wait until the node list is populated
  while (get(kubernetesCurrentContextNodesFiltered).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect node empty screen', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  render(NodesList);
  const noNodes = screen.getByRole('heading', { name: 'No nodes' });
  expect(noNodes).toBeInTheDocument();
});

test('Expect nodes list', async () => {
  const node: V1Node = {
    metadata: {
      name: 'node1',
      labels: {
        'kubernetes.io/role': 'master',
      },
    },
    status: {
      conditions: [
        {
          type: 'Ready',
          status: 'True',
        },
      ],
    },
  } as V1Node;
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([node]);

  // wait while store is populated
  while (get(kubernetesCurrentContextNodes).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const nodeName = screen.getByRole('cell', { name: 'node1' });
  expect(nodeName).toBeInTheDocument();

  const nodeRole = screen.getByRole('cell', { name: 'Control Plane' });
  expect(nodeRole).toBeInTheDocument();
});
