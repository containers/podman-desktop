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
import type { ContainerProviderRegistry } from './container-registry.js';

import { ProviderRegistry } from './provider-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { ContainerProviderConnection, KubernetesProviderConnection } from '@podman-desktop/api';
import type { ProviderContainerConnectionInfo, ProviderKubernetesConnectionInfo } from './api/provider-info.js';
import type { ApiSenderType } from './api.js';
import { LifecycleContextImpl } from './lifecycle-context.js';
import type { ProviderImpl } from './provider-impl.js';
import type { AutostartEngine } from './autostart-engine.js';

let providerRegistry: ProviderRegistry;
let autostartEngine: AutostartEngine;

const telemetryTrackMock = vi.fn();
const apiSenderSendMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  telemetryTrackMock.mockImplementation(() => Promise.resolve());
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
  autostartEngine = {
    registerProvider: vi.fn(),
  } as unknown as AutostartEngine;
});

test('should initialize provider if there is kubernetes connection provider', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let providerInternalId: any;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

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

test('should send version event if update', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let providerInternalId: any;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(['provider-create', 'provider:update-version']).toContain(message);
    if (message === 'provider-create') {
      providerInternalId = data;
    }
  });

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  let updateCalled = false;
  provider.registerUpdate({
    version: 'next',
    update: async () => {
      updateCalled = true;
      provider.updateVersion('next');
    },
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.updateProvider(providerInternalId);

  expect(telemetryTrackMock).toHaveBeenNthCalledWith(1, 'createProvider', {
    name: 'internal',
    status: 'installed',
  });

  expect(updateCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalledTimes(2);
});

test('should initialize provider if there is container connection provider', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let providerInternalId: any;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

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
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
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
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
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
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
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

test('runAutostartContainer should start container and send event', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  const autostartMock = vi.fn();

  let notified = false;
  providerRegistry.onDidUpdateProvider(event => {
    expect(event.id).toBe(provider.id);
    expect(event.status).toBe('installed');
    notified = true;
  });

  providerRegistry.registerAutostartEngine(autostartEngine);

  provider.registerAutostart({
    start: autostartMock,
  });

  await providerRegistry.runAutostart((provider as ProviderImpl).internalId);

  // check we have been notified
  expect(notified).toBeTruthy();

  // check that we have called the start method
  expect(autostartMock).toBeCalled();
});

test('should throw if provider try to register autostart but there is no engine registered', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  const autostartMock = vi.fn();

  expect(() =>
    provider.registerAutostart({
      start: autostartMock,
    }),
  ).toThrowError(new Error('no autostart engine has been registered. Autostart feature is disabled'));
});

test('should retrieve context of container provider', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
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

  const context = providerRegistry.getMatchingConnectionLifecycleContext('0', connection);
  expect(context instanceof LifecycleContextImpl).toBeTruthy();
});

test('should retrieve context of kubernetes provider', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let providerInternalId: any;

  apiSenderSendMock.mockImplementation((_message, data) => {
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  let initalizeCalled = false;
  provider.setKubernetesProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
  });

  expect(providerInternalId).toBeDefined();
  await providerRegistry.initializeProvider(providerInternalId);

  const connection: ProviderKubernetesConnectionInfo = {
    name: 'connection',
    endpoint: {
      apiURL: 'url',
    },
    status: 'stopped',
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  provider.registerKubernetesProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      apiURL: 'url',
    },
    status() {
      return 'stopped';
    },
  });

  const context = providerRegistry.getMatchingConnectionLifecycleContext('0', connection);
  expect(context instanceof LifecycleContextImpl).toBeTruthy();

  expect(initalizeCalled).toBe(true);
  expect(apiSenderSendMock).toBeCalled();
});

test('should retrieve provider internal id from id', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

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

  const internalId = providerRegistry.getMatchingProviderInternalId('internal');
  expect(internalId).toBe('0');
});

test('should throw error if no provider found with id', async () => {
  expect(() => providerRegistry.getMatchingProviderInternalId('internal')).toThrowError(
    'no provider matching provider id internal',
  );
});
