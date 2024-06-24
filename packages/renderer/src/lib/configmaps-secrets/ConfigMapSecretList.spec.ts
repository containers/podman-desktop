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

import type { V1ConfigMap, V1Secret } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { kubernetesCurrentContextConfigMaps } from '/@/stores/kubernetes-contexts-state';

import ConfigMapSecretList from './ConfigMapSecretList.svelte';

const kubernetesRegisterGetCurrentContextResourcesMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesRegisterGetCurrentContextResources = kubernetesRegisterGetCurrentContextResourcesMock;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
  (window as any).kubernetesGetContextsGeneralState = () => Promise.resolve(new Map());
  (window as any).kubernetesGetCurrentContextGeneralState = () => Promise.resolve({});
  (window as any).window.kubernetesUnregisterGetCurrentContextResources = () => Promise.resolve(undefined);
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(ConfigMapSecretList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect configmap empty screen', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  render(ConfigMapSecretList);
  const noNodes = screen.getByRole('heading', { name: 'No configmaps or secrets' });
  expect(noNodes).toBeInTheDocument();
});

test('Expect configmap and secrets list', async () => {
  const configMap: V1ConfigMap = {
    metadata: {
      name: 'my-configmap',
      namespace: 'my-namespace',
    },
    data: {
      key1: 'value1',
      key2: 'value2',
    },
  };

  const secret: V1Secret = {
    metadata: {
      name: 'my-secret',
      namespace: 'my-namespace',
    },
    data: {
      secretkey1: 'value1',
      secretkey2: 'value2',
    },
    type: 'Opaque',
  };

  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([configMap, secret]);

  // wait while store is populated
  while (get(kubernetesCurrentContextConfigMaps).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const configMapName = screen.getByRole('cell', { name: 'my-configmap' });
  expect(configMapName).toBeInTheDocument();
  // Expect ConfigMap type
  const configMapType = screen.getByRole('cell', { name: 'ConfigMap' });
  expect(configMapType).toBeInTheDocument();

  const secretName = screen.getByRole('cell', { name: 'my-secret' });
  expect(secretName).toBeInTheDocument();
  // Expect Opaque type
  const secretType = screen.getByRole('cell', { name: 'Opaque' });
  expect(secretType).toBeInTheDocument();
});
