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

import { fireEvent, render } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import PortForwardActions from '/@/lib/kubernetes-port-forward/PortForwardActions.svelte';
import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import { type ForwardConfig, WorkloadKind } from '/@api/kubernetes-port-forward-model';

vi.mock('/@/stores/kubernetes-contexts-state', async () => ({}));

const MOCKED_USER_FORWARD_CONFIG: ForwardConfig = {
  id: 'fake-id',
  name: 'dummy-pod-name',
  namespace: 'dummy-ns',
  kind: WorkloadKind.POD,
  forward: {
    localPort: 55_087,
    remotePort: 80,
  },
};

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([MOCKED_USER_FORWARD_CONFIG]);
  (window.openExternal as unknown) = vi.fn();
  (window.deleteKubernetesPortForward as unknown) = vi.fn();
  (window.showMessageBox as unknown) = vi.fn();

  // mock resolved `Yes`
  vi.mocked(window.showMessageBox).mockResolvedValue({
    response: 0,
  });
});

test('actions should be defined', () => {
  const { getByTitle } = render(PortForwardActions, {
    object: MOCKED_USER_FORWARD_CONFIG,
  });

  const openBtn = getByTitle('Open forwarded port');
  expect(openBtn).toBeDefined();

  const deleteBtn = getByTitle('Delete forwarded port');
  expect(deleteBtn).toBeDefined();
});

test('open should call openExternal', async () => {
  const { getByTitle } = render(PortForwardActions, {
    object: MOCKED_USER_FORWARD_CONFIG,
  });

  const openBtn = getByTitle('Open forwarded port');
  await fireEvent.click(openBtn);

  expect(window.openExternal).toHaveBeenCalledWith('http://localhost:55087');
});

test('remove should call deleteKubernetesPortForward', async () => {
  const { getByTitle } = render(PortForwardActions, {
    object: MOCKED_USER_FORWARD_CONFIG,
  });

  const deleteBtn = getByTitle('Delete forwarded port');
  await fireEvent.click(deleteBtn);

  expect(window.deleteKubernetesPortForward).toHaveBeenCalledWith(MOCKED_USER_FORWARD_CONFIG);
});
