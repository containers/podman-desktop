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

import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import {
  kubernetesCurrentContextPersistentVolumeClaims,
  kubernetesCurrentContextPersistentVolumeClaimsFiltered,
} from '/@/stores/kubernetes-contexts-state';

import PVCList from './PVCList.svelte';

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
  render(PVCList, { ...customProperties });
  // wait until the PVC list is populated
  while (get(kubernetesCurrentContextPersistentVolumeClaimsFiltered).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect PVC empty screen', async () => {
  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([]);
  render(PVCList);
  const noPVCS = screen.getByRole('heading', { name: 'No PVCs' });
  expect(noPVCS).toBeInTheDocument();
});

test('Expect PVC list', async () => {
  const pvc: V1PersistentVolumeClaim = {
    metadata: {
      name: 'pvc1',
      namespace: 'default',
    },
  } as V1PersistentVolumeClaim;

  kubernetesRegisterGetCurrentContextResourcesMock.mockResolvedValue([pvc]);

  // wait while store is populated
  while (get(kubernetesCurrentContextPersistentVolumeClaims).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const pvcName = screen.getByRole('cell', { name: 'pvc1' });
  expect(pvcName).toBeInTheDocument();

  const pvcNamespace = screen.getByRole('cell', { name: 'default' });
  expect(pvcNamespace).toBeInTheDocument();
});
