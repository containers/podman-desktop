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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
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
};

const containerConnection: ProviderContainerConnectionInfo = {
  name: 'machine',
  status: 'started',
  endpoint: {
    socketPath: 'socket',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
  type: 'podman',
};

const kubernetesConnection: ProviderKubernetesConnectionInfo = {
  name: 'machine',
  status: 'started',
  endpoint: {
    apiURL: 'url',
  },
  lifecycleMethods: ['start', 'stop', 'delete'],
};

const updateConnectionStatus = () => {
  //nothing
};

const addConnectionToRestartingQueue = () => {
  //nothing
};

const connectionStatus: IConnectionStatus = {
  status: 'started',
  inProgress: false,
};

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

test('if kubernetes connection has start lifecycle method, start button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'kube' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: kubernetesConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const button = screen.getByRole('button', { name: 'Start' });
  expect(button).toBeInTheDocument();
});

test('if kubernetes connection has stop lifecycle method, stop button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'kube' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: kubernetesConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const button = screen.getByRole('button', { name: 'Stop' });
  expect(button).toBeInTheDocument();
});

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

test('if kubernetes connection has delete lifecycle method, delete button has to be visible', () => {
  const customProviderInfo: ProviderInfo = { ...containerProviderInfo, name: 'kube' };

  render(PreferencesConnectionActions, {
    connectionStatus,
    provider: customProviderInfo,
    connection: kubernetesConnection,
    updateConnectionStatus,
    addConnectionToRestartingQueue,
  });
  const button = screen.getByRole('button', { name: 'Delete' });
  expect(button).toBeInTheDocument();
});
