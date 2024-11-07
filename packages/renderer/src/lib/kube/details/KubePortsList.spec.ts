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

import { render, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import { WorkloadKind } from '/@api/kubernetes-port-forward-model';

import KubePortsList from './KubePortsList.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([]);
});

test('expect port title not to be visible when no ports provided', async () => {
  const { queryByText } = render(KubePortsList);

  const title = queryByText('Ports');
  expect(title).toBeNull();
});

test('expect port title to be visible when ports is defined', async () => {
  const { getByText } = render(KubePortsList, {
    resourceName: 'dummy-resource-name',
    namespace: 'dummy-ns',
    kind: WorkloadKind.POD,
    ports: [
      {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
    ],
  });

  const title = getByText('Ports');
  expect(title).toBeDefined();
});

test('expect multiple ports to be visible', async () => {
  const { getByText } = render(KubePortsList, {
    resourceName: 'dummy-resource-name',
    namespace: 'dummy-ns',
    kind: WorkloadKind.POD,
    ports: [
      {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      {
        displayValue: '100/TCP',
        value: 100,
        protocol: 'TCP',
      },
    ],
  });

  const port80 = getByText('80/TCP');
  expect(port80).toBeDefined();

  const port100 = getByText('100/TCP');
  expect(port100).toBeDefined();
});

test('expect only target remote port have open button', async () => {
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([
    {
      id: 'dummy-id',
      displayName: 'dummy',
      namespace: 'dummy-ns',
      kind: WorkloadKind.POD,
      forward: {
        localPort: 55_001,
        remotePort: 80,
      },
      name: 'dummy-resource-name',
    },
  ]);

  const { getByLabelText } = render(KubePortsList, {
    resourceName: 'dummy-resource-name',
    namespace: 'dummy-ns',
    kind: WorkloadKind.POD,
    ports: [
      {
        displayValue: '80/TCP',
        value: 80,
        protocol: 'TCP',
      },
      {
        displayValue: '100/TCP',
        value: 100,
        protocol: 'TCP',
      },
    ],
  });

  const div80 = getByLabelText('port 80');
  expect(div80).toBeDefined();
  const open80 = within(div80).getByTitle('Open in browser');
  expect(open80).toBeDefined();

  const div100 = getByLabelText('port 100');
  expect(div100).toBeDefined();
  const open100 = within(div100).queryByTitle('Open in browser');
  expect(open100).toBeNull();
});
