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

import { createNavigationKubernetesConfigMapSecretsEntry } from './navigation-registry-k8s-configmap-secrets.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'kubernetesRegisterGetCurrentContextResources', {
    value: kubernetesRegisterGetCurrentContextResourcesMock,
  });
});

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

test('createNavigationKubernetesConfigMapSecretsEntry', async () => {
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

  const entry = createNavigationKubernetesConfigMapSecretsEntry();

  expect(entry).toBeDefined();
  expect(entry.name).toBe('ConfigMaps & Secrets');
  expect(entry.link).toBe('/kubernetes/configmapsSecrets');
  expect(entry.tooltip).toBe('ConfigMaps & Secrets');
  await vi.waitFor(() => {
    // receive 2 and 2
    expect(entry.counter).toBe(4);
  });
});
