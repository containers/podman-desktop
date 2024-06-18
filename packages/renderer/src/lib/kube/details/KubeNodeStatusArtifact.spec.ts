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

import type { V1NodeStatus } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeNodeStatusArtifact from './KubeNodeStatusArtifact.svelte';

// A full V1NodeStatus object with all fields populated
const fakeNodeStatus = {
  capacity: {
    cpu: '4',
    memory: '16Gi',
    pods: '110',
  },
  allocatable: {
    cpu: '5',
    memory: '17Gi',
    pods: '111',
  },
  conditions: [
    {
      type: 'Ready',
      status: 'True',
      reason: 'KubeletReady',
      message: 'kubelet is posting ready status',
    },
    {
      type: 'OutOfDisk',
      status: 'False',
      reason: 'KubeletHasSufficientDisk',
      message: 'kubelet has sufficient disk space available',
    },
  ],
  addresses: [
    {
      type: 'InternalIP',
      address: '10.0.0.1',
    },
    {
      type: 'Hostname',
      address: 'node1',
    },
  ],
  nodeInfo: {
    architecture: 'amd64',
    operatingSystem: 'linux',
    osImage: 'Fedora 35',
    kernelVersion: '5.15.8',
    kubeletVersion: 'v1.23.2',
    containerRuntimeVersion: 'containerd://1.5.7',
    kubeProxyVersion: 'v1.23.3',
  },
} as unknown as V1NodeStatus;

test('Renders node status correctly', () => {
  render(KubeNodeStatusArtifact, { artifact: fakeNodeStatus });
  expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
  expect(screen.getByText('node1')).toBeInTheDocument();
  expect(screen.getByText('16Gi')).toBeInTheDocument();
  expect(screen.getByText('110')).toBeInTheDocument();
  expect(screen.getByText('Ready')).toBeInTheDocument();
  expect(screen.getByText('True')).toBeInTheDocument();
  expect(screen.getByText('kubelet is posting ready status')).toBeInTheDocument();
  expect(screen.getByText('amd64')).toBeInTheDocument();
  expect(screen.getByText('linux')).toBeInTheDocument();
  expect(screen.getByText('Fedora 35')).toBeInTheDocument();
  expect(screen.getByText('5.15.8')).toBeInTheDocument();
  expect(screen.getByText('v1.23.2')).toBeInTheDocument();
  expect(screen.getByText('containerd://1.5.7')).toBeInTheDocument();
});
