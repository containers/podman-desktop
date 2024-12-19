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
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { containerTerminals } from '/@/stores/container-terminal-store';

import ContainerDetailsTerminal from './ContainerDetailsTerminal.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

vi.mock('xterm', () => {
  return {
    Terminal: vi.fn(),
  };
});

beforeAll(() => {
  // we cannot define on global because terminal is doing some magic with the window value
  Object.defineProperties(window, {
    getConfigurationValue: {
      value: vi.fn(),
    },
    shellInContainer: {
      value: vi.fn(),
    },
    shellInContainerResize: {
      value: vi.fn(),
    },
    matchMedia: {
      value: vi.fn(),
    },
  });
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.matchMedia).mockReturnValue({
    addListener: vi.fn(),
    removeListener: vi.fn(),
  } as unknown as MediaQueryList);

  // reset
  containerTerminals.set([]);
});

test('expect being able to reconnect ', async () => {
  const container: ContainerInfoUI = {
    id: 'myContainer',
    state: 'RUNNING',
    engineId: 'podman',
  } as unknown as ContainerInfoUI;

  let onDataCallback: (data: Buffer) => void = () => {};

  const sendCallbackId = 12345;
  vi.mocked(window.shellInContainer).mockImplementation(
    async (
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
  let renderObject = render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait shellInContainerMock is called
  await waitFor(() => expect(window.shellInContainer).toHaveBeenCalled());

  // write some data on the terminal
  onDataCallback(Buffer.from('hello\nworld'));

  // ensure the terminal has render our text
  await waitFor(() => {
    const div = renderObject.getByText('hello world');
    expect(div).toBeDefined();
  });

  // should be no terminal being stored
  const terminals = get(containerTerminals);
  expect(terminals.length).toBe(0);

  // destroy the object
  renderObject.unmount();

  // now, check that we have a terminal that is in the store
  const terminalsAfterDestroy = get(containerTerminals);
  expect(terminalsAfterDestroy.length).toBe(1);

  // ok, now render a new terminal widget, it should reuse data from the store
  renderObject = render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait shellInContainerMock is called
  await waitFor(() => expect(window.shellInContainer).toHaveBeenCalledTimes(2));

  // ensure the terminal has render our text
  await waitFor(() => {
    const div = renderObject.getByText('hello world');
    expect(div).toBeDefined();
  });

  // creating a new terminal requires new shellInContainer call
  expect(window.shellInContainer).toHaveBeenCalledTimes(2);
});

test('terminal active/ restarts connection after stopping and starting a container', async () => {
  const container: ContainerInfoUI = {
    id: 'myContainer',
    state: 'RUNNING',
    engineId: 'podman',
  } as unknown as ContainerInfoUI;

  let onDataCallback: (data: Buffer) => void = () => {};

  const sendCallbackId = 12345;
  vi.mocked(window.shellInContainer).mockImplementation(
    async (
      _engineId: string,
      _containerId: string,
      onData: (data: Buffer) => void,
      _onError: (error: string) => void,
      onEnd: () => void,
    ) => {
      onDataCallback = onData;
      setTimeout(() => {
        onEnd();
      }, 500);
      // return a callback id
      return sendCallbackId;
    },
  );

  // render the component with a terminal
  const renderObject = render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait shellInContainerMock is called
  await waitFor(() => expect(window.shellInContainer).toHaveBeenCalled());

  // write some data on the terminal
  onDataCallback(Buffer.from('hello\nworld'));

  // ensure the terminal has render our text
  await waitFor(() => {
    const div = renderObject.getByText('hello world');
    expect(div).toBeDefined();
  });

  container.state = 'EXITED';

  await renderObject.rerender({ container: container, screenReaderMode: true });

  await tick();

  await waitFor(() => expect(renderObject.queryByText('Container is not running')).toBeInTheDocument());

  container.state = 'STARTING';

  await renderObject.rerender({ container: container, screenReaderMode: true });

  await tick();

  container.state = 'RUNNING';

  await renderObject.rerender({ container: container, screenReaderMode: true });

  await tick();

  await waitFor(() => expect(window.shellInContainer).toHaveBeenCalledTimes(10), { timeout: 2000 });
});

test('terminal active/ restarts connection after restarting a container', async () => {
  const container: ContainerInfoUI = {
    id: 'myContainer',
    state: 'RUNNING',
    engineId: 'podman',
  } as unknown as ContainerInfoUI;

  let onDataCallback: (data: Buffer) => void = () => {};

  const sendCallbackId = 12345;
  vi.mocked(window.shellInContainer).mockImplementation(
    async (
      _engineId: string,
      _containerId: string,
      onData: (data: Buffer) => void,
      _onError: (error: string) => void,
      onEnd: () => void,
    ) => {
      onDataCallback = onData;
      setTimeout(() => {
        onEnd();
      }, 500);
      // return a callback id
      return sendCallbackId;
    },
  );

  // render the component with a terminal
  const renderObject = render(ContainerDetailsTerminal, { container, screenReaderMode: true });

  // wait shellInContainerMock is called
  await waitFor(() => expect(window.shellInContainer).toHaveBeenCalled());

  // write some data on the terminal
  onDataCallback(Buffer.from('hello\nworld'));

  // ensure the terminal has render our text
  await waitFor(() => {
    const div = renderObject.getByText('hello world');
    expect(div).toBeDefined();
  });

  container.state = 'RESTARTING';

  await renderObject.rerender({ container: container, screenReaderMode: true });

  await tick();

  container.state = 'RUNNING';

  await renderObject.rerender({ container: container, screenReaderMode: true });

  await tick();

  expect(window.shellInContainer).toHaveBeenCalledTimes(2);
});
