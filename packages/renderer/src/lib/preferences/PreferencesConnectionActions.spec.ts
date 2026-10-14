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

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import type { IConnectionStatus } from './Util';

const containerProviderInfo: ProviderInfo = {
  id: 'provider',
  name: 'provider',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  containerConnections: [],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: [],
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionInitialization: false,
  extensionId: '',
  cleanupSupport: false,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  canStart: false,
  canStop: false,
};

const containerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'machine',
  displayName: 'machine',
  status: 'started',
  endpoint: {
    socketPath: 'socket',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
  canStart: true,
  canStop: true,
  canEdit: false,
  canDelete: true,
  type: 'podman',
};

const kubernetesConnection: ProviderKubernetesConnectionInfo = {
  connectionType: 'kubernetes',
  name: 'machine',
  status: 'started',
  endpoint: {
    apiURL: 'url',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
  canStart: true,
  canStop: true,
  canEdit: false,
  canDelete: true,
};

const updateConnectionStatus = (): void => {
  //nothing
};

const addConnectionToRestartingQueue = (): void => {
  //nothing
};

const connectionStatus: IConnectionStatus = {
  status: 'started',
  inProgress: false,
};

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: undefined });
});

test('if container connection has start lifecycle method, start button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'podman' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: containerConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const button = screen.getByRole('button', { name: 'Start' });
  expect(button).toBeInTheDocument();
});

test('if container connection has stop lifecycle method, stop button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'podman' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: containerConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const button = screen.getByRole('button', { name: 'Stop' });
  expect(button).toBeInTheDocument();
});

test('if container connection has start and stop lifecycle methods, restart button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'podman' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: containerConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
});

describe('delete', () => {
  test('if container connection has delete lifecycle method, delete button has to be visible', () => {
    const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'podman' };

    render(PreferencesConnectionActions, {
      connectionStatus,
      provider: customProviderInfo,
      connection: containerConnection,
      updateConnectionStatus,
      addConnectionToRestartingQueue,
    });
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeInTheDocument();
  });

  test('delete button should call window.showMessageBox to ask confirmation', async () => {
    const { getByRole } = render(PreferencesConnectionActions, {
      connectionStatus,
      provider: containerProviderInfo,
      connection: containerConnection,
      updateConnectionStatus,
      addConnectionToRestartingQueue,
    });
    const button = getByRole('button', { name: 'Delete' });

    await fireEvent.click(button);

    await vi.waitFor(() => {
      expect(window.showMessageBox).toHaveBeenCalledExactlyOnceWith({
        title: 'Delete Connection?',
        message: `Are you sure you want to delete ${containerConnection.name}?`,
        buttons: ['Delete', 'Cancel'],
        type: 'danger',
      });
    });
  });

  test('delete button with user confirmation should call window.deleteProviderConnectionLifecycle', async () => {
    const stoppedConnection: ProviderContainerConnectionInfo = {
      ...containerConnection,
      status: 'stopped',
    };
    // mock Yes
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });

    const { getByRole } = render(PreferencesConnectionActions, {
      connectionStatus,
      provider: containerProviderInfo,
      connection: stoppedConnection,
      updateConnectionStatus,
      addConnectionToRestartingQueue,
    });
    const button = getByRole('button', { name: 'Delete' });

    await fireEvent.click(button);

    await vi.waitFor(() => {
      expect(window.deleteProviderConnectionLifecycle).toHaveBeenCalledExactlyOnceWith(
        containerProviderInfo.internalId,
        stoppedConnection,
        expect.any(Symbol),
        expect.any(Function),
      );
    });
  });
});

test.each([
  { buttonName: 'Start', lifecycle: 'start' },
  { buttonName: 'Stop', lifecycle: 'stop' },
  { buttonName: 'Delete', lifecycle: 'delete' },
])(
  'if kubernetes connection has $lifecycle lifecycle method, $buttonName button has to be visible',
  ({ buttonName }) => {
    const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'kube' };

    render(PreferencesConnectionActions, {
      connectionStatus,
      provider: customProviderInfo,
      connection: kubernetesConnection,
      updateConnectionStatus,
      addConnectionToRestartingQueue,
    });
    const button = screen.getByRole('button', { name: buttonName });
    expect(button).toBeInTheDocument();
  },
);

test('if kubernetes connection has start and stop lifecycle methods, restart button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'kube' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: kubernetesConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
});
