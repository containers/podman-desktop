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

import { render, screen, waitFor } from '@testing-library/svelte';
import { type Writable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import * as kubeContextStore from '/@/stores/kubernetes-contexts';
import * as kubeContextStateStore from '/@/stores/kubernetes-contexts-state';
import type { KubeContext } from '/@api/kubernetes-context';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';

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

vi.mock('/@/stores/kubernetes-contexts');

let delayed: Writable<Map<string, boolean>>;
let contexts: Writable<KubeContext[]>;

beforeEach(() => {
  vi.resetAllMocks();
  mocks.subscribeMock.mockImplementation(listener => {
    listener(mocks.getCurrentKubeContextState());
    return { unsubscribe: () => {} };
  });

  (window as any).events = mocks.eventsMocks;
  (window as any).kubernetesGetContextsGeneralState = mocks.getCurrentKubeContextState;

  delayed = writable<Map<string, boolean>>();
  vi.mocked(kubeContextStateStore).kubernetesContextsCheckingStateDelayed = delayed;
  contexts = writable<KubeContext[]>();
  vi.mocked(kubeContextStore).kubernetesContexts = contexts;
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

test('spinner should be displayed when and only when the context connectivity is being checked', async () => {
  contexts.set([
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
      currentContext: true,
    },
  ]);
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
  let checking = screen.queryByLabelText('Loading');
  expect(checking).toBeNull();

  // context is being checked
  delayed.set(new Map<string, boolean>([['context1', true]]));

  // spinner should appear
  await waitFor(() => {
    checking = screen.queryByLabelText('Loading');
    expect(checking).not.toBeNull();
  });

  // context is not being checked anymore
  delayed.set(new Map<string, boolean>([['context1', false]]));

  // spinner should disappear
  await waitFor(() => {
    checking = screen.queryByLabelText('Loading');
    expect(checking).toBeNull();
  });
});
