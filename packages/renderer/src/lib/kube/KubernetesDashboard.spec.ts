/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { KubernetesObject } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { readable } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import type { KubeContext } from '/@api/kubernetes-context';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';

import KubernetesDashboard from './KubernetesDashboard.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {};
});

const openExternalMock = vi.fn();

// fake the window object
beforeAll(() => {
  //(window as any).events = eventsMock;
  //(window as any).getConfigurationValue = vi.fn();
  //(window as any).sendNavigationItems = vi.fn();
  (window as any).openExternal = openExternalMock;
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Verify basic page', async () => {
  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
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
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
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

  const metrics = screen.getByText('Metrics');
  expect(metrics).toBeInTheDocument();
  expect(metrics.nextElementSibling?.childElementCount).toBe(6);

  const guides = screen.getByText('Explore articles and blog posts');
  expect(guides).toBeInTheDocument();
  expect(guides.nextElementSibling?.childElementCount).toBe(3);
});
