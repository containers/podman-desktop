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

import type { KubernetesObject } from '@kubernetes/client-node';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import KubeIcon from '/@/lib/images/KubeIcon.svelte';
import { type ContextGeneralState, NO_CURRENT_CONTEXT_ERROR } from '/@api/kubernetes-contexts-states';

import * as kubeContextStore from '../kubernetes-contexts-state';
import { createNavigationKubernetesGroup } from './navigation-registry-kubernetes.svelte';

vi.mock('../kubernetes-contexts-state', async () => {
  return {};
});

beforeEach(() => {
  vi.resetAllMocks();
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
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);

  const entry = createNavigationKubernetesGroup();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Kubernetes');
  expect(entry.icon.iconComponent).toBe(KubeIcon);

  // should have 6 items
  await vi.waitFor(() => {
    expect(entry.items?.length).toBe(6);
  });
});

test('createNavigationImageEntry without current context', async () => {
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({
    error: NO_CURRENT_CONTEXT_ERROR,
  } as ContextGeneralState);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);

  const entry = createNavigationKubernetesGroup();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Kubernetes');
  expect(entry.icon.iconComponent).toBe(KubeIcon);

  // should have 0 items
  await vi.waitFor(() => {
    expect(entry.items?.length).toBe(0);
  });
});
