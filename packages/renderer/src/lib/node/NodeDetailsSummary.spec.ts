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

import type { V1Node } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import NodeDetailsSummary from './NodeDetailsSummary.svelte';

const node: V1Node = {
  apiVersion: 'v1',
  kind: 'Node',
  metadata: {
    name: 'node-01',
    namespace: 'default',
  },
  spec: {
    podCIDR: '192.168.1.0/24',
    providerID: 'provider-123',
  },
  status: {
    conditions: [
      {
        type: 'Ready',
        status: 'True',
        lastHeartbeatTime: new Date(),
        lastTransitionTime: new Date(),
      },
    ],
    addresses: [
      {
        type: 'InternalIP',
        address: '192.168.1.100',
      },
    ],
    nodeInfo: {
      machineID: 'machine-123',
      systemUUID: 'system-uuid-123',
      bootID: 'boot-123',
      kernelVersion: '5.4',
      osImage: 'CentOS',
      containerRuntimeVersion: 'containerd://foobar',
      kubeletVersion: 'v1.19.3',
      kubeProxyVersion: 'v1.19.3',
      operatingSystem: 'linux',
      architecture: 'amd64',
    },
  },
};

const kubeError = 'Error retrieving node details';

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect to render node details when node data is available', async () => {
  render(NodeDetailsSummary, { node: node });

  expect(screen.getByText('node-01')).toBeInTheDocument();
  expect(screen.getByText('provider-123')).toBeInTheDocument();
  expect(screen.getByText('Ready')).toBeInTheDocument();
});

test('Expect to show error message when there is a kube error', async () => {
  render(NodeDetailsSummary, { node: node, kubeError: kubeError });

  const errorMessage = screen.getByText(kubeError);
  expect(errorMessage).toBeInTheDocument();
});

test('Expect to show loading indicator when node data is not available', async () => {
  render(NodeDetailsSummary, {});

  const loadingMessage = screen.getByText('Loading ...');
  expect(loadingMessage).toBeInTheDocument();
});
