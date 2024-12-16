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

import { render, waitFor } from '@testing-library/svelte';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeAll, expect, test, vi } from 'vitest';

import KubernetesTerminal from '/@/lib/pod/KubernetesTerminal.svelte';
import { terminalStates } from '/@/stores/kubernetes-terminal-state-store';

const getConfigurationValueMock = vi.fn();
const kubernetesExecMock = vi.fn();
const kubernetesExecResizeMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
  Object.defineProperty(window, 'kubernetesExec', { value: kubernetesExecMock });
  Object.defineProperty(window, 'kubernetesExecResize', { value: kubernetesExecResizeMock });
  Object.defineProperty(window, 'kubernetesExecSend', { value: vi.fn().mockResolvedValue(undefined) });

  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockReturnValue({
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }),
  });
});

test('Test should render the terminal and being able to reconnect', async () => {
  let onStdOutCallback: (data: Buffer) => void = () => {};
  const sendCallbackId = 1;
  kubernetesExecMock.mockImplementation(
    (
      _podName: string,
      _containerName: string,
      onStdOut: (data: Buffer) => void,
      _onStdErr: (data: Buffer) => void,
      _onClose: () => void,
    ) => {
      onStdOutCallback = onStdOut;
      return sendCallbackId;
    },
  );

  const renderObject = render(KubernetesTerminal, { podName: 'podName', containerName: 'containerName' });
  await tick();
  await waitFor(() => expect(kubernetesExecMock).toHaveBeenCalled());

  onStdOutCallback(Buffer.from('hello\nworld'));

  await new Promise(resolve => setTimeout(resolve, 1000));
  const terminalLinesLiveRegion = renderObject.container.querySelector('div[aria-live="assertive"]');
  expect(terminalLinesLiveRegion).toHaveTextContent('hello world');

  const terminals = get(terminalStates);
  expect(terminals.size).toBe(0);

  renderObject.unmount();
  const terminalsAfterDestroy = get(terminalStates);
  expect(terminalsAfterDestroy.size).toBe(1);

  render(KubernetesTerminal, { podName: 'podName', containerName: 'containerName' });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Called twice because we now create the terminal each session when we reconnect in order
  // to ensure that we have a fresh terminal with the previous history shown.
  expect(kubernetesExecMock).toHaveBeenCalledTimes(2);
});
