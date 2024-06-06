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

import type { KubernetesObject, V1Node } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import NodeDetails from './NodeDetails.svelte';

const node: V1Node = {
  apiVersion: 'v1',
  kind: 'Node',
  metadata: {
    name: 'my-node',
    namespace: 'default',
  },
} as V1Node;

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    kubernetesCurrentContextNodes: vi.fn(),
  };
});

beforeAll(() => {
  (window as any).kubernetesReadNode = vi.fn();
});

test('Confirm renders node details', async () => {
  // mock object store
  const nodes = writable<KubernetesObject[]>([node]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = nodes;

  render(NodeDetails, { name: 'my-node' });

  expect(screen.getByText('my-node')).toBeInTheDocument();
});
