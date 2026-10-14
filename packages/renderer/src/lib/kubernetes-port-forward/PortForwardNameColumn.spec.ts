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

import '@testing-library/jest-dom/vitest';

import { type PortMapping, WorkloadKind } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { fireEvent, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as store from '/@/stores/kubernetes-contexts-state'; // Adjust the import path as necessary

import PodNameColumn from './PortForwardNameColumn.svelte';

const DUMMY_MAPPING: PortMapping = {
  localPort: 55_501,
  remotePort: 80,
};

vi.mock(import('/@/stores/kubernetes-contexts-state'), async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(store).kubernetesCurrentContextPods = writable<KubernetesObject[]>([]);
});

test('name should be visible', () => {
  vi.mocked(store).kubernetesCurrentContextPods = writable<KubernetesObject[]>([
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'dummy-pod-name', namespace: 'dummy-ns' },
    },
  ]);

  const { getByText } = render(PodNameColumn, {
    object: {
      id: '',
      name: 'dummy-pod-name',
      namespace: 'dummy-ns',
      kind: WorkloadKind.POD,
      forward: DUMMY_MAPPING,
    },
  });

  const div = getByText('dummy-pod-name');
  expect(div).toBeDefined();
});

test('click on name should redirect to pod page', async () => {
  vi.mocked(store).kubernetesCurrentContextPods = writable<KubernetesObject[]>([
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'dummy-pod-name', namespace: 'dummy-ns' },
    },
  ]);

  const { getByTitle } = render(PodNameColumn, {
    object: {
      name: 'dummy-pod-name',
      namespace: 'dummy-ns',
      kind: WorkloadKind.POD,
      id: '',
      forward: DUMMY_MAPPING,
    },
  });

  const openBtn = getByTitle('Open pod details');
  expect(openBtn).toBeDefined();

  await fireEvent.click(openBtn);

  expect(window.navigateToRoute).toBeCalledWith('kubernetes', {
    kind: 'Pod',
    name: 'dummy-pod-name',
    namespace: 'dummy-ns',
  });
});
