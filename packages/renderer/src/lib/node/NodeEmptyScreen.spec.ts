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

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';
import NodeEmptyScreen from './NodeEmptyScreen.svelte';

const mocks = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  getCurrentKubeContextState: vi.fn(),

  // window mocks
  eventsMocks: vi.fn(),
}));

vi.mock('../../stores/kubernetes-contexts-state', () => ({
  kubernetesCurrentContextState: {
    subscribe: mocks.subscribeMock,
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.subscribeMock.mockImplementation(listener => {
    listener(mocks.getCurrentKubeContextState());
    return { unsubscribe: () => {} };
  });

  (window as any).events = mocks.eventsMocks;
  (window as any).kubernetesGetContextsGeneralState = mocks.getCurrentKubeContextState;
});

test('Expect deployment empty screen', async () => {
  render(NodeEmptyScreen);
  const noNodes = screen.getByRole('heading', { name: 'No nodes' });
  expect(noNodes).toBeInTheDocument();
});

test('If kubernetesCurrentContextState is not empty, expect that the empty screen say you do not have permission to view the nodes', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: undefined,
    reachable: true,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState);
  render(NodeEmptyScreen);
  const noNodes = screen.getByText('You may not have permission to view the nodes on your cluster');
  expect(noNodes).toBeInTheDocument();
});
