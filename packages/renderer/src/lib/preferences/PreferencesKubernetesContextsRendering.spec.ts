/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import * as kubernetesContextsState from '/@/stores/kubernetes-contexts-state';

import type { KubeContext } from '../../../../main/src/plugin/kubernetes-context';
import type { CheckingState, ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';
import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {
    kubernetesContextsState: vi.fn(),
  };
});

// Create a fake KubeContextUI
const mockContext1: KubeContext = {
  name: 'context-name',
  cluster: 'cluster-name',
  user: 'user-name',
  clusterInfo: {
    name: 'cluster-name',
    server: 'https://server-name',
  },
};

const mockContext2: KubeContext = {
  name: 'context-name2',
  cluster: 'cluster-name2',
  user: 'user-name2',
  clusterInfo: {
    name: 'cluster-name2',
    server: 'https://server-name2',
  },
  currentContext: true,
};

const mockContext3: KubeContext = {
  name: 'context-name3',
  cluster: 'cluster-name3',
  user: 'user-name3',
  namespace: 'namespace-name3',
  clusterInfo: {
    name: 'cluster-name3',
    server: 'https://server-name3',
  },
};

beforeEach(() => {
  kubernetesContexts.set([mockContext1, mockContext2, mockContext3]);
  (window as any).kubernetesGetContextsGeneralState = vi.fn().mockResolvedValue(new Map<string, ContextGeneralState>());
});

test('test that name, cluster and the server is displayed when rendering', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('context-name')).toBeInTheDocument();
  expect(await screen.findByText('cluster-name')).toBeInTheDocument();
  expect(await screen.findByText('user-name')).toBeInTheDocument();
  expect(await screen.findByText('https://server-name')).toBeInTheDocument();
});

test('Test that namespace is displayed when available in the context', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('namespace-name3')).toBeInTheDocument();
});

test('If nothing is returned for contexts, expect that the page shows a message', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  kubernetesContexts.set([]);
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('No Kubernetes contexts found')).toBeInTheDocument();
});

test('Test that context-name2 is the current context', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('context-name2');
  render(PreferencesKubernetesContextsRendering, {});

  // Get current-context by aria label
  // find "context-name" which is located within the same parent div as current-context
  // make sure the content is context-name2
  const currentContext = await screen.findByLabelText('Current Context');
  expect(currentContext).toBeInTheDocument();

  // Make sure that the span with the text "context-name2" is within the same parent div as current-context (to make sure that it is the current context)
  const spanContextName = await screen.findByText('context-name2');
  expect(spanContextName).toBeInTheDocument();
  expect(spanContextName.parentElement).toEqual(currentContext.parentElement);
});

test('when deleting the current context, a popup should ask confirmation', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ result: 1 });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[1];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('Current Context');
  expect(label).toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(showMessageBoxMock).toHaveBeenCalledOnce();
});

test('when deleting the non current context, no popup should ask confirmation', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ result: 1 });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[0];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('Current Context');
  expect(label).not.toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(showMessageBoxMock).not.toHaveBeenCalled();
});

test('state and resources counts are displayed in contexts', () => {
  const state: Map<string, ContextGeneralState> = new Map();
  state.set('context-name', {
    reachable: true,
    resources: {
      pods: 1,
      deployments: 2,
    },
  });
  state.set('context-name2', {
    reachable: false,
    resources: {
      pods: 0,
      deployments: 0,
    },
  });
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(state);
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingState = readable<Map<string, CheckingState>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  const context1 = screen.getAllByRole('row')[0];
  const context2 = screen.getAllByRole('row')[1];
  expect(within(context1).queryByText('REACHABLE')).toBeInTheDocument();
  expect(within(context1).queryByText('PODS')).toBeInTheDocument();
  expect(within(context1).queryByText('DEPLOYMENTS')).toBeInTheDocument();

  const checkCount = (el: HTMLElement, label: string, count: number) => {
    const countEl = within(el).getByLabelText(label);
    expect(countEl).toBeInTheDocument();
    expect(within(countEl).queryByText(count));
  };
  checkCount(context1, 'Context Pods Count', 1);
  checkCount(context1, 'Context Deployments Count', 2);

  expect(within(context2).queryByText('UNREACHABLE')).toBeInTheDocument();
  expect(within(context2).queryByText('PODS')).not.toBeInTheDocument();
  expect(within(context2).queryByText('DEPLOYMENTS')).not.toBeInTheDocument();

  const podsCountContext2 = within(context2).queryByLabelText('Context Pods Count');
  expect(podsCountContext2).not.toBeInTheDocument();
  const deploymentsCountContext2 = within(context2).queryByLabelText('Context Deployments Count');
  expect(deploymentsCountContext2).not.toBeInTheDocument();
});
