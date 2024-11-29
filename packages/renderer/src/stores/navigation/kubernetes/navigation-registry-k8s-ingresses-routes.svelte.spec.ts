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
import { beforeEach, expect, test, vi } from 'vitest';

import { createNavigationKubernetesIngressesRoutesEntry } from './navigation-registry-k8s-ingresses-routes.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'kubernetesRegisterGetCurrentContextResources', {
    value: kubernetesRegisterGetCurrentContextResourcesMock,
  });
});

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

test('createNavigationKubernetesIngressesRoutesEntry', async () => {
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
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue(nodes);

  const entry = createNavigationKubernetesIngressesRoutesEntry();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('Ingresses & Routes');
  expect(entry.link).toBe('/kubernetes/ingressesRoutes');
  expect(entry.tooltip).toBe('Ingresses & Routes');
  await vi.waitFor(() => {
    expect(entry.counter).toBe(2);
  });
});
