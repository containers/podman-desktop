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

import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { expect, test, vi } from 'vitest';

import * as kubernetesContextsStore from '/@/stores/kubernetes-contexts';
import * as kubernetesContextsStateStore from '/@/stores/kubernetes-contexts-state';
import type { KubeContext } from '/@api/kubernetes-context';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';

import KubernetesCheckConnection from './KubernetesCheckConnection.svelte';

vi.mock('/@/stores/kubernetes-contexts-state');
vi.mock('/@/stores/kubernetes-contexts');

test('button is displayed and active if current context is defined and is not reachable', async () => {
  vi.mocked(kubernetesContextsStore).kubernetesContexts = writable<KubeContext[]>([
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
      currentContext: true,
    },
  ]);
  vi.mocked(kubernetesContextsStateStore).kubernetesCurrentContextState = writable<ContextGeneralState>({
    reachable: false,
    resources: { pods: 0, deployments: 0 },
  });
  vi.mocked(kubernetesContextsStateStore).kubernetesContextsCheckingStateDelayed = writable<Map<string, boolean>>();
  render(KubernetesCheckConnection);
  const button = screen.queryByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveProperty('disabled', false);
});

test('button is not displayed if current context is defined and is reachable', async () => {
  vi.mocked(kubernetesContextsStore).kubernetesContexts = writable<KubeContext[]>([
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
      currentContext: true,
    },
  ]);
  vi.mocked(kubernetesContextsStateStore).kubernetesCurrentContextState = writable<ContextGeneralState>({
    reachable: true,
    resources: { pods: 0, deployments: 0 },
  });
  vi.mocked(kubernetesContextsStateStore).kubernetesContextsCheckingStateDelayed = writable<Map<string, boolean>>();
  render(KubernetesCheckConnection);
  const button = screen.queryByRole('button');
  expect(button).toBeNull();
});

test('button is not displayed if no current context', async () => {
  vi.mocked(kubernetesContextsStore).kubernetesContexts = writable<KubeContext[]>([
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
      currentContext: false,
    },
  ]);
  vi.mocked(kubernetesContextsStateStore).kubernetesCurrentContextState = writable<ContextGeneralState>({
    reachable: false,
    resources: { pods: 0, deployments: 0 },
  });
  vi.mocked(kubernetesContextsStateStore).kubernetesContextsCheckingStateDelayed = writable<Map<string, boolean>>();
  render(KubernetesCheckConnection);
  const button = screen.queryByRole('button');
  expect(button).toBeNull();
});

test('button is displayed and disabled if current context is defined, is not reacahble and is being checked', async () => {
  vi.mocked(kubernetesContextsStore).kubernetesContexts = writable<KubeContext[]>([
    {
      name: 'context1',
      cluster: 'cluster1',
      user: 'user1',
      currentContext: true,
    },
  ]);
  vi.mocked(kubernetesContextsStateStore).kubernetesCurrentContextState = writable<ContextGeneralState>({
    reachable: false,
    resources: { pods: 0, deployments: 0 },
  });
  vi.mocked(kubernetesContextsStateStore).kubernetesContextsCheckingStateDelayed = writable<Map<string, boolean>>(
    new Map([['context1', true]]),
  );
  render(KubernetesCheckConnection);
  const button = screen.queryByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveProperty('disabled', true);
});
