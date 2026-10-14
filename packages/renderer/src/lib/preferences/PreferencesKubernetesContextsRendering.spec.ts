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

import type { ContextGeneralState, KubeContext } from '@desktop-framework/api';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { kubernetesContextsHealths } from '/@/stores/kubernetes-context-health';
import { kubernetesContextsPermissions } from '/@/stores/kubernetes-context-permission';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import * as kubernetesContextsState from '/@/stores/kubernetes-contexts-state';
import { kubernetesResourcesCount } from '/@/stores/kubernetes-resources-count';

import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));

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

const mockContext4: KubeContext = {
  name: 'context-name4',
  cluster: 'cluster-name4',
  user: 'user-name4',
  namespace: 'namespace-name4',
  clusterInfo: {
    name: 'cluster-name4',
    server: 'https://server-name4',
  },
};

const mockContext5: KubeContext = {
  name: 'context-name5',
  cluster: 'cluster-name5',
  user: 'user-name5',
  namespace: 'namespace-name5',
  clusterInfo: {
    name: 'cluster-name5',
    server: 'https://server-name5',
  },
};

const kubernetesGetCurrentContextNameMock = vi.fn();

const kubernetesDuplicateContextMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesGetContextsGeneralState', {
    value: vi.fn().mockResolvedValue(new Map<string, ContextGeneralState>()),
  });
  Object.defineProperty(window, 'kubernetesGetCurrentContextName', { value: kubernetesGetCurrentContextNameMock });
  Object.defineProperty(window, 'kubernetesDuplicateContext', { value: kubernetesDuplicateContextMock });
});

beforeEach(() => {
  kubernetesContexts.set([mockContext1, mockContext2, mockContext3, mockContext4, mockContext5]);
  vi.resetAllMocks();
});

test('Expect context detail div to use invert-content-divider token', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  kubernetesGetCurrentContextNameMock.mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  const contextRow = await screen.findByRole('row', { name: 'context-name' });
  const detailDiv = contextRow.querySelector('[class*="divide-"]');
  expect(detailDiv).not.toBeNull();
  expect(detailDiv!.className).toContain('pd-invert-content-divider');
});

test('test that name, cluster and the server is displayed when rendering', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  kubernetesGetCurrentContextNameMock.mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('context-name')).toBeInTheDocument();
  expect(await screen.findByText('cluster-name')).toBeInTheDocument();
  expect(await screen.findByText('user-name')).toBeInTheDocument();
  expect(await screen.findByText('https://server-name')).toBeInTheDocument();
});

test('Test that namespace is displayed when available in the context', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('namespace-name3')).toBeInTheDocument();
});

test('If nothing is returned for contexts, expect that the page shows a message', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  kubernetesContexts.set([]);
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('No Kubernetes contexts found')).toBeInTheDocument();
});

test('Test that context-name2 is the current context', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  kubernetesGetCurrentContextNameMock.mockResolvedValue('context-name2');
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
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[1];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('Current Context');
  expect(label).toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(window.showMessageBox).toHaveBeenCalledOnce();
});

test('when deleting the non current context, no popup should ask confirmation', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[0];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('Current Context');
  expect(label).not.toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(window.showMessageBox).not.toHaveBeenCalled();
});

test('when editing context a modal dialog should be oppened', async () => {
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(new Map());
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  // Get first context
  const currentContext = screen.getAllByRole('row')[0];
  expect(currentContext).toBeInTheDocument();

  const editBtn = within(currentContext).getByRole('button', { name: 'Edit Context' });
  expect(editBtn).toBeInTheDocument();
  await fireEvent.click(editBtn);

  expect(screen.getByRole('dialog', { name: 'Edit Context' })).toBeVisible();
});

describe.each([
  {
    name: 'experimental states',
    implemented: {
      health: true,
      resourcesCount: true,
      undefinedCounts: true,
      permissions: true,
      offline: true,
      errorMessage: true,
    },
    initMocks: (): void => {
      Object.defineProperty(global, 'window', {
        value: {
          isExperimentalConfigurationEnabled: vi.fn(),
          telemetryTrack: vi.fn(),
          kubernetesRefreshContextState: vi.fn(),
        },
      });
      kubernetesResourcesCount.set([
        {
          contextName: 'context-name',
          resourceName: 'pods',
          count: 1,
        },
        {
          contextName: 'context-name',
          resourceName: 'deployments',
          count: 2,
        },
      ]);
      vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);
      kubernetesContextsHealths.set([
        {
          contextName: 'context-name',
          reachable: true,
          checking: false,
          offline: false,
        },
        {
          contextName: 'context-name2',
          reachable: false,
          checking: false,
          offline: false,
        },
        {
          contextName: 'context-name3',
          reachable: true,
          checking: false,
          offline: false,
        },
        {
          contextName: 'context-name4',
          reachable: true,
          checking: false,
          offline: true,
        },
        {
          contextName: 'context-name5',
          reachable: false,
          checking: false,
          offline: false,
          errorMessage: 'an error',
        },
      ]);
      kubernetesContextsPermissions.set([
        {
          contextName: 'context-name',
          resourceName: 'pods',
          permitted: true,
        },
        {
          contextName: 'context-name',
          resourceName: 'deployments',
          permitted: true,
        },
        {
          contextName: 'context-name3',
          resourceName: 'pods',
          permitted: true,
        },
        {
          contextName: 'context-name3',
          resourceName: 'deployments',
          permitted: true,
        },
        {
          contextName: 'context-name4',
          resourceName: 'pods',
          permitted: false,
        },
        {
          contextName: 'context-name4',
          resourceName: 'deployments',
          permitted: false,
        },
      ]);
    },
  },
  {
    name: 'non-experimental states',
    implemented: {
      health: true,
      resourcesCount: true,
      undefinedCounts: false,
      permissions: false,
      offline: false,
      errorMessage: false,
    },
    initMocks: (): void => {
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
      vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(
        new Map(),
      );
    },
  },
])('$name', ({ implemented, initMocks }) => {
  test('state and resources counts are displayed in contexts', async () => {
    initMocks();
    render(PreferencesKubernetesContextsRendering, {});
    const context1 = screen.getAllByRole('row')[0];
    const context2 = screen.getAllByRole('row')[1];
    const context3 = screen.getAllByRole('row')[2];
    const context4 = screen.getAllByRole('row')[3];
    if (implemented.health) {
      await vi.waitFor(() => {
        expect(within(context1).queryByText('REACHABLE')).toBeInTheDocument();
      });
    }
    expect(within(context1).queryByText('PODS')).toBeInTheDocument();
    expect(within(context1).queryByText('DEPLOYMENTS')).toBeInTheDocument();

    if (implemented.resourcesCount) {
      const checkCount = (el: HTMLElement, label: string, count: number): void => {
        const countEl = within(el).getByLabelText(label);
        expect(countEl).toBeInTheDocument();
        expect(within(countEl).queryByText(count)).toBeTruthy();
      };
      checkCount(context1, 'Context Pods Count', 1);
      checkCount(context1, 'Context Deployments Count', 2);
    }

    if (implemented.health) {
      expect(within(context2).queryByText('UNREACHABLE')).toBeInTheDocument();
    }
    expect(within(context2).queryByText('PODS')).not.toBeInTheDocument();
    expect(within(context2).queryByText('DEPLOYMENTS')).not.toBeInTheDocument();

    const podsCountContext2 = within(context2).queryByLabelText('Context Pods Count');
    expect(podsCountContext2).not.toBeInTheDocument();
    const deploymentsCountContext2 = within(context2).queryByLabelText('Context Deployments Count');
    expect(deploymentsCountContext2).not.toBeInTheDocument();

    if (implemented.undefinedCounts) {
      const checkNoCount = (el: HTMLElement, label: string): void => {
        const countEl = within(el).getByLabelText(label);
        expect(countEl).toBeInTheDocument();
        expect(countEl).toHaveTextContent('');
      };
      expect(within(context3).queryByText('PODS')).toBeInTheDocument();
      expect(within(context3).queryByText('DEPLOYMENTS')).toBeInTheDocument();
      checkNoCount(context3, 'Context Pods Count');
      checkNoCount(context3, 'Context Deployments Count');
    }

    if (implemented.permissions) {
      const checkNotPermitted = (el: HTMLElement, label: string): void => {
        const countEl = within(el).getByLabelText(label);
        expect(countEl).toBeInTheDocument();
        expect(countEl).toHaveTextContent('-');
      };
      expect(within(context4).queryByText('PODS')).toBeInTheDocument();
      expect(within(context4).queryByText('DEPLOYMENTS')).toBeInTheDocument();
      checkNotPermitted(context4, 'Context Pods Count');
      checkNotPermitted(context4, 'Context Deployments Count');
    }

    if (implemented.offline) {
      expect(within(context4).queryByText('CONNECTION LOST')).toBeInTheDocument();
    }

    if (implemented.errorMessage) {
      const context5 = screen.getAllByRole('row')[4];
      expect(within(context5).queryByText('ERROR')).toBeInTheDocument();
      expect(within(context5).queryByText('PODS')).not.toBeInTheDocument();
      expect(within(context5).queryByText('DEPLOYMENTS')).not.toBeInTheDocument();
    }
  });

  test.runIf(implemented.offline)('Connect button is displayed on offline contexts', async () => {
    initMocks();
    render(PreferencesKubernetesContextsRendering, {});

    await vi.waitFor(() => {
      const context1 = screen.getAllByRole('row')[0];
      expect(within(context1).queryByText('Connect')).not.toBeInTheDocument(); // reachable and not offline
    });

    const context2 = screen.getAllByRole('row')[1];
    expect(within(context2).queryByText('Connect')).toBeInTheDocument(); // not reachable

    const context3 = screen.getAllByRole('row')[2];
    expect(within(context3).queryByText('Connect')).not.toBeInTheDocument(); // reachable and not offline

    const context4 = screen.getAllByRole('row')[3];
    expect(within(context4).queryByText('Connect')).toBeInTheDocument(); // reachable and offline
  });
});

test('Connect button is displayed on contexts for which state is not known', () => {
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
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  const context3 = screen.getAllByRole('row')[2];

  expect(within(context3).queryByText('UNKNOWN')).toBeInTheDocument();
  expect(within(context3).queryByText('PODS')).not.toBeInTheDocument();
  expect(within(context3).queryByText('DEPLOYMENTS')).not.toBeInTheDocument();
  expect(within(context3).queryByText('Connect')).toBeInTheDocument();

  const context1 = screen.getAllByRole('row')[0];
  expect(within(context1).queryByText('Connect')).not.toBeInTheDocument();
  const context2 = screen.getAllByRole('row')[1];
  expect(within(context2).queryByText('Connect')).not.toBeInTheDocument();
});

test('Connecting for a context calls window.kubernetesRefreshContextState with context name', async () => {
  const state: Map<string, ContextGeneralState> = new Map();
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(state);
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  const context1 = screen.getAllByRole('row')[0];

  const button = within(context1).getByText('Connect');

  vi.mocked(window.kubernetesRefreshContextState).mockResolvedValue(undefined);
  await fireEvent.click(button);
  expect(window.kubernetesRefreshContextState).toHaveBeenCalledWith('context-name');
});

test('Connecting for a context sends telemetry', async () => {
  const state: Map<string, ContextGeneralState> = new Map();
  vi.mocked(kubernetesContextsState).kubernetesContextsState = readable<Map<string, ContextGeneralState>>(state);
  vi.mocked(kubernetesContextsState).kubernetesContextsCheckingStateDelayed = readable<Map<string, boolean>>(new Map());
  render(PreferencesKubernetesContextsRendering, {});
  const context2 = screen.getAllByRole('row')[1];

  const button = within(context2).getByText('Connect');

  vi.mocked(window.kubernetesRefreshContextState).mockResolvedValue(undefined);
  await fireEvent.click(button);
  expect(window.telemetryTrack).toHaveBeenCalledWith('kubernetes.monitoring.start.non-current');
});
