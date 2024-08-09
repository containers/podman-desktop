/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import { containerTerminals } from '/@/stores/container-terminal-store';

import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

const getConfigurationValueMock = vi.fn();
const shellInContainerMock = vi.fn();
const shellInContainerResizeMock = vi.fn();

beforeAll(() => {
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).shellInContainer = shellInContainerMock;
  (window as any).shellInContainerResize = shellInContainerResizeMock;

  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
});

test('expect being able to reconnect ', async () => {
  const container: ContainerInfoUI = {
    id: 'myContainer',
    state: 'RUNNING',
    engineId: 'podman',
  } as unknown as ContainerInfoUI;

  let onDataCallback: (data: Buffer) => void = () => {};

  const sendCallbackId = 12345;
  shellInContainerMock.mockImplementation(
    (
      _engineId: string,
      _containerId: string,
      onData: (data: Buffer) => void,
      _onError: (error: string) => void,
      _onEnd: () => void,
    ) => {
      onDataCallback = onData;
      // return a callback id
      return sendCallbackId;
    },
  );

  // render the component with a terminal
  const renderObject = render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait shellInContainerMock is called
  await waitFor(() => expect(shellInContainerMock).toHaveBeenCalled());

  // write some data on the terminal
  onDataCallback(Buffer.from('hello\nworld'));

  // wait 1s
  await new Promise(resolve => setTimeout(resolve, 1000));

  // search a div having aria-live="assertive" attribute
  const terminalLinesLiveRegion = renderObject.container.querySelector('div[aria-live="assertive"]');

  // check the content
  expect(terminalLinesLiveRegion).toHaveTextContent('hello world');

  // should be no terminal being stored
  const terminals = get(containerTerminals);
  expect(terminals.length).toBe(0);

  // destroy the object
  renderObject.unmount();

  // now, check that we have a terminal that is in the store
  const terminalsAfterDestroy = get(containerTerminals);
  expect(terminalsAfterDestroy.length).toBe(1);

  // ok, now render a new terminal widget, it should reuse data from the store
  render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait 1s that everything is done
  await new Promise(resolve => setTimeout(resolve, 1000));

  // no new call to shellInContainerMock should be done
  expect(shellInContainerMock).toHaveBeenCalledTimes(1);
});
