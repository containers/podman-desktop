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

/* eslint-disable @typescript-eslint/no-empty-function */

import { beforeEach, expect, test, vi } from 'vitest';
import type { ContainerProviderRegistry } from './container-registry';

import { ProviderRegistry } from './provider-registry';
import type { Telemetry } from './telemetry/telemetry';
import type { ContainerProviderConnection, KubernetesProviderConnection } from '@podman-desktop/api';
import type { ProviderContainerConnectionInfo, ProviderKubernetesConnectionInfo } from './api/provider-info';
import type { ApiSenderType } from './api';

let providerRegistry: ProviderRegistry;

const telemetryTrackMock = vi.fn();
const apiSenderSendMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  const telemetry: Telemetry = {
    track: telemetryTrackMock,
  } as unknown as Telemetry;
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  const containerRegistry: ContainerProviderRegistry = {
    registerContainerConnection: vi.fn(),
  } as unknown as ContainerProviderRegistry;
  providerRegistry = new ProviderRegistry(apiSender, containerRegistry, telemetry);
});

test('should initialize provider if there is kubernetes connection provider', async () => {
  let providerInternalId;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });

  let initalizeCalled = false;
  provider.setKubernetesProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.initializeProvider(providerInternalId);

  expect(telemetryTrackMock).toHaveBeenNthCalledWith(1, 'createProvider', {
    name: 'internal',
    status: 'installed',
  });

  expect(initalizeCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalled();
});

test('should initialize provider if there is container connection provider', async () => {
  let providerInternalId;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });

  let initalizeCalled = false;
  provider.setContainerProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
    create: async () => {},
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.initializeProvider(providerInternalId);

  expect(telemetryTrackMock).toHaveBeenNthCalledWith(1, 'createProvider', {
    name: 'internal',
    status: 'installed',
  });

  expect(initalizeCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalled();
});

test('expect isContainerConnection returns true with a ContainerConnection', async () => {
  const connection: ContainerProviderConnection = {
    name: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    lifecycle: undefined,
    status: () => 'started',
  };
  const res = providerRegistry.isContainerConnection(connection);
  expect(res).toBe(true);
});

test('expect isContainerConnection returns false with a KubernetesConnection', async () => {
  const connection: KubernetesProviderConnection = {
    name: 'connection',
    endpoint: {
      apiURL: 'url',
    },
    lifecycle: undefined,
    status: () => 'started',
  };
  const res = providerRegistry.isContainerConnection(connection);
  expect(res).toBe(false);
});

test('expect isProviderContainerConnection returns true with a ProviderContainerConnection', async () => {
  const connection: ProviderContainerConnectionInfo = {
    name: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    lifecycleMethods: undefined,
    status: 'started',
  };
  const res = providerRegistry.isProviderContainerConnection(connection);
  expect(res).toBe(true);
});

test('expect isProviderContainerConnection returns false with a ProviderKubernetesConnectionInfo', async () => {
  const connection: ProviderKubernetesConnectionInfo = {
    name: 'connection',
    endpoint: {
      apiURL: 'url',
    },
    lifecycleMethods: undefined,
    status: 'started',
  };
  const res = providerRegistry.isProviderContainerConnection(connection);
  expect(res).toBe(false);
});

test('should register kubernetes provider', async () => {
  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });
  const connection: KubernetesProviderConnection = {
    name: 'connection',
    endpoint: {
      apiURL: 'url',
    },
    lifecycle: undefined,
    status: () => 'started',
  };

  providerRegistry.registerKubernetesConnection(provider, connection);

  expect(telemetryTrackMock).toHaveBeenLastCalledWith('registerKubernetesProviderConnection', {
    name: 'connection',
    total: 1,
  });
});

test('should send events when starting a container connection', async () => {
  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });
  const connection: ProviderContainerConnectionInfo = {
    name: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'started',
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  provider.registerContainerProviderConnection({
    name: 'connection',
    type: 'docker',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status() {
      return 'started';
    },
  });

  let onDidUpdateContainerConnectionCalled = false;
  providerRegistry.onDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('started');
    onDidUpdateContainerConnectionCalled = true;
  });

  await providerRegistry.startProviderConnection('0', connection);

  expect(startMock).toBeCalled();
  expect(stopMock).not.toBeCalled();
  expect(onDidUpdateContainerConnectionCalled).toBeTruthy();
});

test('should send events when stopping a container connection', async () => {
  const provider = providerRegistry.createProvider({ id: 'internal', name: 'internal', status: 'installed' });
  const connection: ProviderContainerConnectionInfo = {
    name: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'stopped',
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  provider.registerContainerProviderConnection({
    name: 'connection',
    type: 'docker',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status() {
      return 'stopped';
    },
  });

  let onDidUpdateContainerConnectionCalled = false;
  providerRegistry.onDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('stopped');
    onDidUpdateContainerConnectionCalled = true;
  });

  await providerRegistry.stopProviderConnection('0', connection);

  expect(stopMock).toBeCalled();
  expect(startMock).not.toBeCalled();
  expect(onDidUpdateContainerConnectionCalled).toBeTruthy();
});
