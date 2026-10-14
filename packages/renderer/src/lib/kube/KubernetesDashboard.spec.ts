/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { ContextGeneralState, ContextPermission, KubeContext, ResourceCount } from '@desktop-framework/api';
import type { KubernetesObject, V1Deployment } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { readable, writable } from 'svelte/store';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';
import { listenActiveResourcesCount } from '/@/lib/kube/active-resources-count-listen';
import { containersInfos } from '/@/stores/containers';
import * as kubernetesPermissions from '/@/stores/kubernetes-context-permission';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import * as kubernetesExperimental from '/@/stores/kubernetes-experimental';
import * as kubernetesNoCurrentContext from '/@/stores/kubernetes-no-current-context';
import * as kubernetesReourcesCount from '/@/stores/kubernetes-resources-count';

import KubernetesDashboard from './KubernetesDashboard.svelte';
import KubernetesDashboardResourceCard from './KubernetesDashboardResourceCard.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'));

vi.mock(import('/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte'));

vi.mock(import('./KubernetesDashboardResourceCard.svelte'));

vi.mock(import('/@/stores/kubernetes-experimental'));

vi.mock(import('/@/stores/kubernetes-resources-count'));

vi.mock(import('/@/lib/kube/active-resources-count-listen'));

vi.mock(import('/@/stores/kubernetes-context-permission'));
vi.mock(import('/@/stores/kubernetes-no-current-context'));

const openExternalMock = vi.fn();

// fake the window object
beforeAll(() => {
  Object.defineProperty(window, 'openExternal', {
    value: openExternalMock,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(false);
});

test('Verify basic page', async () => {
  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);

  render(KubernetesDashboard);

  const title = screen.getByText('Dashboard');
  expect(title).toBeInTheDocument();
});

test('Verify documentation link works', async () => {
  render(KubernetesDashboard);

  const docs = screen.getByText('Kubernetes documentation');
  expect(docs).toBeInTheDocument();

  expect(openExternalMock).not.toHaveBeenCalled();
  await userEvent.click(docs);
  expect(openExternalMock).toHaveBeenCalledWith('https://podman-desktop.io/docs/kubernetes');
});

test('Verify basic page with cluster', async () => {
  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);

  const mockContext: KubeContext = {
    name: 'context-name',
    cluster: 'cluster-name',
    user: 'user-name',
    currentContext: true,
    clusterInfo: {
      name: 'cluster-name',
      server: 'https://server-name',
    },
  };
  kubernetesContexts.set([mockContext]);

  render(KubernetesDashboard);

  const title = screen.getByText('Dashboard');
  expect(title).toBeInTheDocument();

  const guides = screen.getByText('Explore articles and blog posts');
  expect(guides).toBeInTheDocument();

  const guideCards = screen.queryAllByRole('button', { name: 'Read more' });
  expect(guideCards).toHaveLength(3);

  expect(KubernetesDashboardResourceCard).toHaveBeenCalledTimes(9);
});

describe('with current context', () => {
  beforeEach(() => {
    vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>(
      {} as ContextGeneralState,
    );

    const mockContext: KubeContext = {
      name: 'context-name',
      cluster: 'cluster-name',
      user: 'user-name',
      currentContext: true,
      clusterInfo: {
        name: 'cluster-name',
        server: 'https://server-name',
      },
    };
    kubernetesContexts.set([mockContext]);
  });

  describe('experimental mode', () => {
    beforeEach(() => {
      vi.mocked(kubernetesExperimental).isKubernetesExperimentalModeStore = writable<boolean>(true);
    });

    test('counts and active counts', async () => {
      const permissions = writable<ContextPermission[]>([]);
      vi.mocked(kubernetesPermissions).kubernetesContextsPermissions = permissions;
      vi.mocked(listenActiveResourcesCount).mockImplementation(
        async (f: (activeResourcesCounts: ResourceCount[]) => void) => {
          f([
            {
              contextName: 'context-name',
              resourceName: 'deployments',
              count: 2,
            },
            {
              contextName: 'context-name',
              resourceName: 'nodes',
              count: 3,
            },
          ]);
          return {
            dispose: (): void => {},
          };
        },
      );

      vi.mocked(kubernetesReourcesCount).kubernetesResourcesCount = writable<ResourceCount[]>([
        {
          contextName: 'context-name',
          resourceName: 'pods',
          count: 11,
        },
        {
          contextName: 'context-name',
          resourceName: 'deployments',
          count: 12,
        },
        {
          contextName: 'context-name',
          resourceName: 'nodes',
          count: 4,
        },
        {
          contextName: 'context-name',
          resourceName: 'nodes',
          count: 4,
        },
        {
          contextName: 'context-name',
          resourceName: 'ingresses',
          count: 1,
        },
        {
          contextName: 'context-name',
          resourceName: 'routes',
          count: 2,
        },
        {
          contextName: 'context-name',
          resourceName: 'configmaps',
          count: 3,
        },
        {
          contextName: 'context-name',
          resourceName: 'secrets',
          count: 5,
        },
      ]);
      render(KubernetesDashboard);

      expect(KubernetesDashboardResourceCard).toHaveBeenCalledTimes(9);
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 11,
          kind: 'Pod',
          type: 'Pods',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 2,
          count: 12,
          kind: 'Deployment',
          type: 'Deployments',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 3,
          count: 4,
          kind: 'Node',
          type: 'Nodes',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 3,
          kind: 'Ingress',
          type: 'Ingresses & Routes',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 8,
          kind: 'ConfigMap',
          type: 'ConfigMaps & Secrets',
          permitted: true,
        }),
      );
    });

    test('permissions', async () => {
      const permissions = writable<ContextPermission[]>([
        {
          contextName: 'context-name',
          resourceName: 'nodes',
          permitted: false,
        },
      ]);
      vi.mocked(kubernetesPermissions).kubernetesContextsPermissions = permissions;
      vi.mocked(listenActiveResourcesCount).mockImplementation(
        async (f: (activeResourcesCounts: ResourceCount[]) => void) => {
          f([
            {
              contextName: 'context-name',
              resourceName: 'deployments',
              count: 2,
            },
            {
              contextName: 'context-name',
              resourceName: 'nodes',
              count: 0,
            },
          ]);
          return {
            dispose: (): void => {},
          };
        },
      );

      vi.mocked(kubernetesReourcesCount).kubernetesResourcesCount = writable<ResourceCount[]>([
        {
          contextName: 'context-name',
          resourceName: 'pods',
          count: 11,
        },
        {
          contextName: 'context-name',
          resourceName: 'nodes',
          count: 0,
        },
      ]);
      render(KubernetesDashboard);

      expect(KubernetesDashboardResourceCard).toHaveBeenCalledTimes(9);
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 11,
          kind: 'Pod',
          type: 'Pods',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 2,
          count: 0,
          kind: 'Deployment',
          type: 'Deployments',
          permitted: true,
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 0,
          count: 0,
          kind: 'Node',
          type: 'Nodes',
          permitted: false,
        }),
      );
    });
  });

  describe('non-experimental mode', () => {
    beforeEach(() => {
      vi.mocked(kubernetesExperimental).isKubernetesExperimentalModeStore = writable<boolean>(false);
    });

    test('counts and active counts', async () => {
      vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([
        {
          spec: { replicas: 1 },
        } as V1Deployment,
        {},
        {},
      ]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([{}, {}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([{}, {}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([{}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([{}, {}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([{}, {}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([{}]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>(
        {} as ContextGeneralState,
      );

      render(KubernetesDashboard);

      expect(KubernetesDashboardResourceCard).toHaveBeenCalledTimes(9);
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 2,
          kind: 'Pod',
          type: 'Pods',
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 0,
          kind: 'Service',
          type: 'Services',
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 3,
          kind: 'Ingress',
          type: 'Ingresses & Routes',
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 3,
          kind: 'ConfigMap',
          type: 'ConfigMaps & Secrets',
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 1,
          count: 3,
          kind: 'Deployment',
          type: 'Deployments',
        }),
      );
      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          activeCount: 0,
          count: 2,
          kind: 'Node',
          type: 'Nodes',
        }),
      );
    });

    test('active node count reads the uppercased UI state and the raw container names', async () => {
      // regression guard: the containers store holds ContainerInfoUI, whose `state` is
      // uppercased and whose aliases live on `names`. Comparing against 'running', or
      // reaching for `name`, makes this count silently zero with no type error.
      vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([
        { metadata: { name: 'node-1' } },
        { metadata: { name: 'node-2' } },
      ]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
      vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>(
        {} as ContextGeneralState,
      );

      containersInfos.set([
        { id: 'c1', name: 'node-1', names: ['/node-1'], state: 'RUNNING' } as unknown as ContainerInfoUI,
        { id: 'c2', name: 'node-2', names: ['/node-2'], state: 'EXITED' } as unknown as ContainerInfoUI,
      ]);

      render(KubernetesDashboard);

      expect(KubernetesDashboardResourceCard).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          count: 2,
          activeCount: 1,
          kind: 'Node',
          type: 'Nodes',
        }),
      );
    });
  });
});
