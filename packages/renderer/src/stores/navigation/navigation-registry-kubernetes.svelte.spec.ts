/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { ContextGeneralState, ForwardConfig } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { readable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import KubeIcon from '/@/lib/images/KubeIcon.svelte';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import * as kubernetesNoCurrentContext from '/@/stores/kubernetes-no-current-context';

import { createNavigationKubernetesGroup } from './navigation-registry-kubernetes.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'), async () => {
  return {};
});
vi.mock(import('/@/stores/kubernetes-no-current-context'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(false);
});

test('createNavigationImageEntry with current context', async () => {
  const nodes: KubernetesObject[] = [
    {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: 'node1',
      },
    },
    {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: 'node2',
      },
    },
  ];
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>(nodes);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<ForwardConfig[]>([]);

  const entry = createNavigationKubernetesGroup();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Kubernetes');
  expect(entry.icon.iconComponent).toBe(KubeIcon);

  // should have 11 items
  await vi.waitFor(() => {
    expect(entry.items?.length).toBe(11);
  });
});

test('createNavigationImageEntry without current context', async () => {
  vi.mocked(kubernetesNoCurrentContext).kubernetesNoCurrentContext = writable(true);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextCronJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextJobs = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPods = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<ForwardConfig[]>([]);

  const entry = createNavigationKubernetesGroup();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Kubernetes');
  expect(entry.icon.iconComponent).toBe(KubeIcon);

  // should have 0 items
  await vi.waitFor(() => {
    expect(entry.items?.length).toBe(0);
  });
});
