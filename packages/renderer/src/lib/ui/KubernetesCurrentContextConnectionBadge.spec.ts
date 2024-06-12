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

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';

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

test('expect no badges shown as no context has been provided.', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue(undefined); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const status = screen.queryByRole('status');
  expect(status).toBeNull();
});

test('expect badges to show as there is a context', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: undefined,
    reachable: true,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const status = screen.getByRole('status');
  expect(status).toBeInTheDocument();
});

test('expect badges to be green when reachable', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: undefined,
    reachable: true,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const status = screen.getByRole('status');
  expect(status.firstChild).toHaveClass('bg-[var(--pd-status-connected)]');
});

test('expect badges to be gray when not reachable', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: undefined,
    reachable: false,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const status = screen.getByRole('status');
  expect(status.firstChild).toHaveClass('bg-[var(--pd-status-disconnected)]');
});

test('expect no tooltip when no error', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: undefined,
    reachable: false,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const tooltip = screen.queryByLabelText('tooltip');
  expect(tooltip).toBeNull();
});

test('expect tooltip when error', async () => {
  mocks.getCurrentKubeContextState.mockReturnValue({
    error: 'error message',
    reachable: false,
    resources: {
      pods: 0,
      deployments: 0,
    },
  } as ContextGeneralState); // no current ContextState
  render(KubernetesCurrentContextConnectionBadge);

  expect(mocks.getCurrentKubeContextState).toHaveBeenCalled();
  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
});
