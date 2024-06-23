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

import type { V1Node } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { NodeUtils } from './node-utils';

let nodeUtils: NodeUtils;

beforeEach(() => {
  vi.clearAllMocks();
  nodeUtils = new NodeUtils();
});

describe('Node UI conversion', () => {
  test('expect basic node UI conversion', async () => {
    const node = {
      metadata: {
        name: 'kube-node',
        labels: {
          'node-role.kubernetes.io/control-plane': '',
        },
      },
      status: {
        conditions: [{ type: 'Ready', status: 'True' }],
        nodeInfo: {
          kubeletVersion: 'v1.20.4',
          osImage: 'CentOS',
          kernelVersion: '5.4.0-42-generic',
          containerRuntimeVersion: 'containerd://1.2.3',
        },
      },
    } as unknown as V1Node;

    const nodeUI = nodeUtils.getNodeUI(node);

    expect(nodeUI.name).toEqual('kube-node');
    expect(nodeUI.status).toEqual('RUNNING');
    expect(nodeUI.role).toEqual('control-plane');
    expect(nodeUI.version).toEqual('v1.20.4');
    expect(nodeUI.osImage).toEqual('CentOS');
    expect(nodeUI.kernelVersion).toEqual('5.4.0-42-generic');
    expect(nodeUI.containerRuntime).toEqual('containerd://1.2.3');
  });

  test('expect node UI conversion with degraded status', async () => {
    const node = {
      metadata: {
        name: 'kube-node',
        labels: {},
      },
      status: {
        conditions: [{ type: 'Ready', status: 'False' }],
        nodeInfo: {
          kubeletVersion: 'v1.20.4',
        },
      },
    } as V1Node;

    const nodeUI = nodeUtils.getNodeUI(node);

    expect(nodeUI.name).toEqual('kube-node');
    expect(nodeUI.status).toEqual('DEGRADED');
    expect(nodeUI.role).toEqual('node'); // Default to node if no specific role label is found
    expect(nodeUI.version).toEqual('v1.20.4');
  });
});

test('if gpu.intel.com, nvidia.com/gpu or amd.com/gpu is present in the node labels expect hasGpu to be true', async () => {
  const node = {
    metadata: {
      name: 'kube-node',
    },
    status: {
      capacity: {
        'nvidia.com/gpu': '1',
      },
    },
  } as V1Node;

  expect(nodeUtils.hasGpu(node)).toEqual(true);

  const node2 = {
    metadata: {
      name: 'kube-node',
    },
    status: {
      capacity: {
        'amd.com/gpu': '1',
      },
    },
  } as V1Node;

  expect(nodeUtils.hasGpu(node2)).toEqual(true);

  const node3 = {
    metadata: {
      name: 'kube-node',
    },
    status: {
      capacity: {
        'gpu.intel.com/test123': '123',
      },
    },
  } as V1Node;

  expect(nodeUtils.hasGpu(node3)).toEqual(true);

  const node4 = {
    metadata: {
      name: 'kube-node',
    },
    status: {
      capacity: {},
    },
  } as V1Node;

  expect(nodeUtils.hasGpu(node4)).toEqual(false);
});
