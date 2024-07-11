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

import { render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import KubernetesTerminal from '/@/lib/pod/KubernetesTerminal.svelte';
import { terminalStates } from '/@/stores/kubernetes-terminal-state-store';

const kubernetesExecMock = vi.fn();

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).kubernetesExec = kubernetesExecMock;
  (window as any).kubernetesExecResize = vi.fn();

  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

test('Test should check saved terminal state after destroying terminal window', async () => {
  const sendCallbackId = 1;
  kubernetesExecMock.mockImplementation(
    (
      _podName: string,
      _containerName: string,
      _: (data: Buffer) => void,
      _onStdErr: (data: Buffer) => void,
      _onClose: () => void,
    ) => {
      return sendCallbackId;
    },
  );

  const renderObject = render(KubernetesTerminal, { podName: 'podName', containerName: 'containerName' });
  await waitFor(() => expect(kubernetesExecMock).toHaveBeenCalled());

  const terminals = get(terminalStates);
  expect(terminals.size).toBe(0);

  renderObject.unmount();
  const terminalsAfterDestroy = get(terminalStates);
  expect(terminalsAfterDestroy.size).toBe(1);

  const state = terminalsAfterDestroy.get('podName-containerName');

  expect(state.id).toBe(sendCallbackId);
  expect(state.terminal).toBeDefined();
});
