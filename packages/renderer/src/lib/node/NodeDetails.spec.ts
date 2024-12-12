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

import type { CoreV1Event, KubernetesObject, V1Node } from '@kubernetes/client-node';
import { render, screen, waitFor } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { router } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import NodeDetails from './NodeDetails.svelte';
import * as nodeDetailsSummary from './NodeDetailsSummary.svelte';

const node: V1Node = {
  apiVersion: 'v1',
  kind: 'Node',
  metadata: {
    uid: '12345678',
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
  Object.defineProperty(window, 'kubernetesReadNode', { value: vi.fn() });
});

test('Confirm renders node details', async () => {
  // mock object store
  const nodes = writable<KubernetesObject[]>([node]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = nodes;

  render(NodeDetails, { name: 'my-node' });

  expect(screen.getByText('my-node')).toBeInTheDocument();
});

test('Expect NodeDetailsSummary to be called with related events only', async () => {
  const nodeDetailsSummarySpy = vi.spyOn(nodeDetailsSummary, 'default');
  // mock object stores
  const nodesStore = writable<KubernetesObject[]>([node]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = nodesStore;

  const events: CoreV1Event[] = [
    {
      metadata: {
        name: 'event1',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event2',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event3',
      },
      involvedObject: { uid: '1234' },
    },
  ];
  const eventsStore = writable<CoreV1Event[]>(events);
  vi.mocked(kubeContextStore).kubernetesCurrentContextEvents = eventsStore;

  vi.mocked(window.kubernetesReadNode).mockResolvedValue(node);

  render(NodeDetails, { name: 'my-node' });
  router.goto('summary');
  await waitFor(() => {
    expect(nodeDetailsSummarySpy).toHaveBeenCalledWith(expect.anything(), {
      node: node,
      events: [events[0], events[1]],
    });
  });
});
