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

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { providerTerminals } from '/@/stores/provider-terminal-store';

import PreferencesConnectionDetailsTerminal from './PreferencesConnectionDetailsTerminal.svelte';

const getConfigurationValueMock = vi.fn();
const shellInProviderConnectionMock = vi.fn();
const shellInProviderConnectionResizeMock = vi.fn();
const shellInProviderConnectionCloseMock = vi.fn();
const receiveEndCallbackMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  getConfigurationValueMock.mockImplementation((key: string) => {
    if (key === 'terminal.integrated.scrollback') {
      return 1000; // A standard default value for scrollback
    }
    return undefined;
  });
  Object.defineProperties(window, {
    getConfigurationValue: {
      value: getConfigurationValueMock,
    },
    shellInProviderConnection: {
      value: shellInProviderConnectionMock,
    },
    shellInProviderConnectionResize: {
      value: shellInProviderConnectionResizeMock,
    },
    shellInProviderConnectionClose: {
      value: shellInProviderConnectionCloseMock,
    },
    receiveEndCallback: {
      value: receiveEndCallbackMock,
    },
  });
});

test('expect being able to reconnect ', async () => {
  const provider: ProviderInfo = {
    id: 'myProvider',
    internalId: 'myInternalProvider',
    status: 'started',
  } as unknown as ProviderInfo;

  const connectionInfo: ProviderContainerConnectionInfo = {
    name: 'myConnection',
    status: 'started',
    endpoint: {
      socketPath: '/socket/path',
    },
  } as unknown as ProviderContainerConnectionInfo;

  let onDataCallback: (data: string) => void = () => {};

  const sendCallbackId = 12345;
  shellInProviderConnectionMock.mockImplementation(
    (
      _providerId: string,
      _providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      onData: (data: string) => void,
      _onError: (error: string) => void,
      _onEnd: () => void,
    ) => {
      onDataCallback = onData;
      // return a callback id
      return Promise.resolve(sendCallbackId);
    },
  );

  // render the component with a terminal
  let renderObject = render(PreferencesConnectionDetailsTerminal, { provider, connectionInfo, screenReaderMode: true });

  // wait shellInProviderMock is called
  await waitFor(() => expect(shellInProviderConnectionMock).toHaveBeenCalled());

  // write some data on the terminal
  onDataCallback('hello\nworld');

  // search a div having aria-live="assertive" attribute
  const terminalLinesLiveRegion = renderObject.container.querySelector('div[aria-live="assertive"]');

  // check the content
  await waitFor(() => expect(terminalLinesLiveRegion).toHaveTextContent('hello world'));

  // should be no terminal being stored
  const terminals = get(providerTerminals);
  expect(terminals.length).toBe(0);

  // destroy the object
  renderObject.unmount();

  // now, check that we have a terminal that is in the store
  const terminalsAfterDestroy = get(providerTerminals);
  expect(terminalsAfterDestroy.length).toBe(1);

  // ok, now render a new terminal widget, it should reuse data from the store
  renderObject = render(PreferencesConnectionDetailsTerminal, { provider, connectionInfo, screenReaderMode: true });

  // wait shellInProviderMock is called
  await waitFor(() => expect(shellInProviderConnectionMock).toHaveBeenCalledTimes(2));

  const terminalLinesLiveRegion2 = renderObject.container.querySelector('div[aria-live="assertive"]');

  // check the content
  await waitFor(() => expect(terminalLinesLiveRegion2).toHaveTextContent('hello world'));

  // creating a new terminal requires new shellInProvider call
  expect(shellInProviderConnectionMock).toHaveBeenCalledTimes(2);
});

test('connectionInfo passed to shellInProviderConnection survives structuredClone (IPC guard)', async () => {
  const provider: ProviderInfo = {
    id: 'myProvider',
    internalId: 'myInternalProvider',
    status: 'started',
  } as unknown as ProviderInfo;

  const connectionInfo: ProviderContainerConnectionInfo = {
    name: 'myConnection',
    status: 'started',
    endpoint: {
      socketPath: '/socket/path',
    },
  } as unknown as ProviderContainerConnectionInfo;

  shellInProviderConnectionMock.mockResolvedValue(12345);
  shellInProviderConnectionResizeMock.mockResolvedValue(undefined);

  render(PreferencesConnectionDetailsTerminal, { provider, connectionInfo, screenReaderMode: true });

  await waitFor(() => expect(shellInProviderConnectionMock).toHaveBeenCalled());

  const passedConnectionInfo = shellInProviderConnectionMock.mock.calls[0][1];
  expect(() => structuredClone(passedConnectionInfo)).not.toThrow();
});

test('terminal active/ restarts connection after stopping and starting a provider', async () => {
  const provider: ProviderInfo = {
    id: 'myProvider',
    internalId: 'myInternalProvider',
    status: 'started',
  } as unknown as ProviderInfo;

  const connectionInfo: ProviderContainerConnectionInfo = {
    name: 'myConnection',
    status: 'started',
    endpoint: {
      socketPath: '/socket/path',
    },
  } as unknown as ProviderContainerConnectionInfo;

  let onDataCallback: (data: string) => void = () => {};
  let onEndCallback: () => void = () => {};

  const sendCallbackId = 12345;
  shellInProviderConnectionMock.mockImplementation(
    (
      _providerId: string,
      _providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      onData: (data: string) => void,
      _onError: (error: string) => void,
      onEnd: () => void,
    ) => {
      onDataCallback = onData;
      onEndCallback = onEnd;
      // return a callback id
      return Promise.resolve(sendCallbackId);
    },
  );

  shellInProviderConnectionCloseMock.mockResolvedValue(undefined);
  shellInProviderConnectionResizeMock.mockResolvedValue(undefined);

  // render the component with a terminal
  const renderObject = render(PreferencesConnectionDetailsTerminal, {
    provider,
    connectionInfo,
    screenReaderMode: true,
  });

  // wait shellInProviderMock is called
  await waitFor(() => {
    expect(shellInProviderConnectionMock).toHaveBeenCalled();
    expect(shellInProviderConnectionResizeMock).toHaveBeenCalled();
  });

  // write some data on the terminal
  onDataCallback('hello\nworld');

  await waitFor(() => renderObject.container.querySelector('div[aria-live="assertive"]'));

  // search a div having aria-live="assertive" attribute
  const terminalLinesLiveRegion = renderObject.container.querySelector('div[aria-live="assertive"]');

  // check the content
  await waitFor(() => expect(terminalLinesLiveRegion).toHaveTextContent('hello world'));

  connectionInfo.status = 'stopped';

  onEndCallback();

  await waitFor(() => {
    expect(shellInProviderConnectionMock).toHaveBeenCalledTimes(2);
    expect(shellInProviderConnectionCloseMock).toHaveBeenCalledTimes(1);
  });

  await renderObject.rerender({ provider, connectionInfo, screenReaderMode: true });

  await waitFor(() => expect(screen.queryByText('Provider engine is not running')).toBeInTheDocument());

  connectionInfo.status = 'starting';

  await renderObject.rerender({ provider, connectionInfo, screenReaderMode: true });

  connectionInfo.status = 'started';

  await renderObject.rerender({ provider, connectionInfo, screenReaderMode: true });

  await waitFor(
    () => {
      expect(shellInProviderConnectionMock).toHaveBeenCalledTimes(3);
      expect(shellInProviderConnectionCloseMock).toHaveBeenCalledTimes(2);
      expect(shellInProviderConnectionResizeMock).toHaveBeenCalledTimes(3);
    },
    { timeout: 2000 },
  );
});
