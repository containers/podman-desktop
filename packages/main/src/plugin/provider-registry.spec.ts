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

import type { ContainerProviderConnection, KubernetesProviderConnection, ProviderCleanup } from '@podman-desktop/api';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import type { ProviderContainerConnectionInfo, ProviderKubernetesConnectionInfo } from './api/provider-info.js';
import type { AutostartEngine } from './autostart-engine.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import { LifecycleContextImpl } from './lifecycle-context.js';
import type { ProviderImpl } from './provider-impl.js';
import { ProviderRegistry } from './provider-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';

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

test('should reset state if initialization fails', async () => {
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

  const updateStatusMock = vi.spyOn(provider, 'updateStatus');

  const error = new Error('error');

  provider.setContainerProviderConnectionFactory({
    initialize: async () => Promise.reject(error),
    create: async () => {},
  });

  expect(providerInternalId).toBeDefined();
  await expect(providerRegistry.initializeProvider(providerInternalId)).rejects.toThrowError(error);

  expect(updateStatusMock).toHaveBeenCalledWith('configuring');
  expect(updateStatusMock).toHaveBeenCalledWith('installed');
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

  let onBeforeDidUpdateContainerConnectionCalled = false;
  providerRegistry.onBeforeDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('started');
    onBeforeDidUpdateContainerConnectionCalled = true;
  });
  let onDidUpdateContainerConnectionCalled = false;
  providerRegistry.onDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('started');
    onDidUpdateContainerConnectionCalled = true;
  });
  let onAfterDidUpdateContainerConnectionCalled = false;
  providerRegistry.onAfterDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('started');
    onAfterDidUpdateContainerConnectionCalled = true;
  });

  await providerRegistry.startProviderConnection('0', connection);

  expect(startMock).toBeCalled();
  expect(stopMock).not.toBeCalled();
  expect(onBeforeDidUpdateContainerConnectionCalled).toBeTruthy();
  expect(onDidUpdateContainerConnectionCalled).toBeTruthy();
  expect(onAfterDidUpdateContainerConnectionCalled).toBeTruthy();
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

  let onBeforeDidUpdateContainerConnectionCalled = false;
  providerRegistry.onBeforeDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('stopped');
    onBeforeDidUpdateContainerConnectionCalled = true;
  });
  let onDidUpdateContainerConnectionCalled = false;
  providerRegistry.onDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('stopped');
    onDidUpdateContainerConnectionCalled = true;
  });
  let onAfterDidUpdateContainerConnectionCalled = false;
  providerRegistry.onAfterDidUpdateContainerConnection(event => {
    expect(event.connection.name).toBe(connection.name);
    expect(event.connection.type).toBe(connection.type);
    expect(event.status).toBe('stopped');
    onAfterDidUpdateContainerConnectionCalled = true;
  });

  await providerRegistry.stopProviderConnection('0', connection);

  expect(stopMock).toBeCalled();
  expect(startMock).not.toBeCalled();
  expect(onBeforeDidUpdateContainerConnectionCalled).toBeTruthy();
  expect(onDidUpdateContainerConnectionCalled).toBeTruthy();
  expect(onAfterDidUpdateContainerConnectionCalled).toBeTruthy();
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

test('should register a cleanup', async () => {
  const fakeProviderImpl = { internalId: '123' } as ProviderImpl;

  const myCleanup: ProviderCleanup = {
    getActions: vi.fn(),
  };
  const disposable = providerRegistry.registerCleanup(fakeProviderImpl, myCleanup);

  expect(disposable).toBeDefined();
  expect(disposable.dispose).toBeDefined();

  vi.mocked(myCleanup.getActions).mockResolvedValue([{ name: 'foo', execute: vi.fn() }]);

  // ok check we can call the cleanup
  const actions = await providerRegistry.getCleanupActionsFromProvider(fakeProviderImpl.internalId);
  expect(actions).toBeDefined();
  expect(actions).lengthOf(1);
  expect(myCleanup.getActions).toBeCalled();

  // check we can dispose
  disposable.dispose();
  const actions2 = await providerRegistry.getCleanupActionsFromProvider(fakeProviderImpl.internalId);
  // should not be there anymore
  expect(actions2).toStrictEqual([]);
});

test('should retrieve cleanup actions without provider Id', async () => {
  const provider1 = providerRegistry.createProvider('id', 'name', {
    id: 'internal1',
    name: 'internal1',
    status: 'installed',
  });
  const provider2 = providerRegistry.createProvider('id', 'name', {
    id: 'internal2',
    name: 'internal2',
    status: 'installed',
  });

  const myCleanup1: ProviderCleanup = {
    getActions: vi.fn(),
  };
  const myCleanup2: ProviderCleanup = {
    getActions: vi.fn(),
  };
  provider1.registerCleanup(myCleanup1);
  provider2.registerCleanup(myCleanup2);

  const allActions = await providerRegistry.getCleanupActions();

  expect(myCleanup1.getActions).toBeCalled();
  expect(myCleanup2.getActions).toBeCalled();

  expect(allActions).toBeDefined();
  expect(allActions).lengthOf(2);
  expect(allActions[0].providerName).toBe('internal1');
  expect(allActions[1].providerName).toBe('internal2');
});

test('should retrieve cleanup actions with a given provider Id', async () => {
  const provider1 = providerRegistry.createProvider('id', 'name', {
    id: 'internal1',
    name: 'internal1',
    status: 'installed',
  }) as ProviderImpl;
  const provider2 = providerRegistry.createProvider('id', 'name', {
    id: 'internal2',
    name: 'internal2',
    status: 'installed',
  });

  const myCleanup1: ProviderCleanup = {
    getActions: vi.fn(),
  };
  const myCleanup2: ProviderCleanup = {
    getActions: vi.fn(),
  };
  provider1.registerCleanup(myCleanup1);
  provider2.registerCleanup(myCleanup2);

  const allActions = await providerRegistry.getCleanupActions([provider1.internalId]);

  // should return only the actions of provider1
  expect(myCleanup1.getActions).toBeCalled();

  expect(allActions).toBeDefined();
  expect(allActions).lengthOf(1);
  expect(allActions[0].providerName).toBe('internal1');
});

test('should execute actions', async () => {
  const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };

  // mock getCleanupActions
  const getCleanupActionsMock = vi.spyOn(providerRegistry, 'getCleanupActions');

  const myCleanup1: ProviderCleanup = {
    getActions: vi.fn(),
  };

  const info = {
    providerId: '123',
    providerName: 'foo',
    actions: Promise.resolve([{ name: 'hello', execute: vi.fn() }]),
    instance: myCleanup1,
  };

  getCleanupActionsMock.mockResolvedValue([info]);

  // execute actions
  await providerRegistry.executeCleanupActions(logger, []);

  // check no error
  expect(logger.error).not.toBeCalled();

  // check logs
  expect(logger.log).toBeCalledWith('executing action ', 'hello');

  // check telemetry
  expect(telemetryTrackMock).toBeCalledWith('executeCleanupActions', { success: true });
});

test('should execute actions with error', async () => {
  const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };

  // mock getCleanupActions
  const getCleanupActionsMock = vi.spyOn(providerRegistry, 'getCleanupActions');

  const myCleanup1: ProviderCleanup = {
    getActions: vi.fn(),
  };

  const executeMock = vi.fn();
  executeMock.mockRejectedValue(new Error('fake error'));

  const info = {
    providerId: '123',
    providerName: 'foo',
    actions: Promise.resolve([{ name: 'hello', execute: executeMock }]),
    instance: myCleanup1,
  };

  getCleanupActionsMock.mockResolvedValue([info]);

  // execute actions
  await providerRegistry.executeCleanupActions(logger, []);

  // check no error
  expect(logger.error).toBeCalledWith('Error while executing cleanup action hello: Error: fake error');

  // check logs
  expect(logger.log).toBeCalledWith('executing action ', 'hello');

  // check telemetry should have an error and success false
  expect(telemetryTrackMock).toBeCalledWith('executeCleanupActions', { success: false, error: ['Error: fake error'] });
});
