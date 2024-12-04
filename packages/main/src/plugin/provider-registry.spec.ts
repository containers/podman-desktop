/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type {
  CheckResult,
  ContainerProviderConnection,
  InstallCheck,
  KubernetesProviderConnection,
  ProviderCleanup,
  ProviderConnectionShellAccess,
  ProviderConnectionShellAccessSession,
  ProviderInstallation,
  ProviderLifecycle,
  ProviderUpdate,
} from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type {
  CheckStatus,
  PreflightChecksCallback,
  ProviderContainerConnectionInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info.js';

import type { ApiSenderType } from './api.js';
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
    expect(['provider-create', 'provider:update-version', 'provider-change']).toContain(message);
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
  expect(apiSenderSendMock).toBeCalledTimes(3);
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

test('connections should contain the display name provided when registering', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  expect(providerRegistry.getContainerConnections().length).toBe(0);

  const displayName = 'Podman Display Name';
  provider.registerContainerProviderConnection({
    name: 'podman-machine-default',
    displayName: displayName,
    type: 'podman',
    lifecycle: {},
    status: () => 'stopped',
    endpoint: {
      socketPath: 'dummy',
    },
  });

  const connections = providerRegistry.getContainerConnections();
  expect(connections.length).toBe(1);
  expect(connections[0]?.connection.displayName).toBe(displayName);
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
    displayName: 'connection',
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
    displayName: 'connection',
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
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'started',
    vmType: {
      id: 'libkrun',
      name: 'libkrun',
    },
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  provider.registerContainerProviderConnection({
    name: 'connection',
    displayName: 'connection',
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
    vmType: 'libkrun',
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
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'stopped',
    vmType: {
      id: 'libkrun',
      name: 'libkrun',
    },
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  provider.registerContainerProviderConnection({
    name: 'connection',
    displayName: 'connection',
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
    vmType: 'libkrun',
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
    displayName: 'connection',
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
    displayName: 'connection',
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
    displayName: 'connection',
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
  expect(allActions[0]?.providerName).toBe('internal1');
  expect(allActions[1]?.providerName).toBe('internal2');
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
  expect(allActions[0]?.providerName).toBe('internal1');
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

test('registerInstallation should notify when an installation is registered or unregistered', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  // clear the calls
  apiSenderSendMock.mockClear();
  const disposable = providerRegistry.registerInstallation(
    provider as unknown as ProviderImpl,
    {} as unknown as ProviderInstallation,
  );

  // check we have been notified
  expect(apiSenderSendMock).toBeCalledWith('provider-change', {});

  // clear the calls
  apiSenderSendMock.mockClear();

  // now dispose the installation
  disposable.dispose();

  // check we have been notified
  expect(apiSenderSendMock).toBeCalledWith('provider-change', {});
});

test('registerUpdate should notify when an update is registered or unregistered', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  // clear the calls
  apiSenderSendMock.mockClear();
  const disposable = providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    {} as unknown as ProviderUpdate,
  );

  // check we have been notified
  expect(apiSenderSendMock).toBeCalledWith('provider-change', {});

  // clear the calls
  apiSenderSendMock.mockClear();

  // now dispose the installation
  disposable.dispose();

  // check we have been notified
  expect(apiSenderSendMock).toBeCalledWith('provider-change', {});
});

describe('runPreflightChecks', () => {
  test('throw error if there is no installation for the provider', async () => {
    await expect(() =>
      providerRegistry.runPreflightChecks('id', {} as unknown as PreflightChecksCallback, true),
    ).rejects.toThrowError('No matching installation for provider id');
  });
  test('return true if there are no preflightChecks', async () => {
    providerRegistry.registerUpdate(
      {
        internalId: 'id',
      } as unknown as ProviderImpl,
      {
        version: 'next',
        preflightChecks: undefined,
        update: async () => {},
      },
    );
    const run = await providerRegistry.runPreflightChecks('id', {} as unknown as PreflightChecksCallback, true);
    expect(run).toBeTruthy();
  });
  test('callback called with checkResult having/not having docLinksDescription and return true if successful', async () => {
    providerRegistry.registerUpdate(
      {
        internalId: 'id',
      } as unknown as ProviderImpl,
      {
        version: 'next',
        preflightChecks: (): InstallCheck[] =>
          [
            {
              title: 'check-1',
              execute: (): CheckResult => {
                return {
                  title: 'title-1',
                  successful: true,
                  description: 'description-1',
                } as CheckResult;
              },
            },
            {
              title: 'check-2',
              execute: (): CheckResult => {
                return {
                  title: 'title-2',
                  successful: true,
                  description: 'description-2',
                  docLinksDescription: 'doc-description-2',
                  docLinks: [
                    {
                      title: 'link-2',
                      url: 'url-2',
                    },
                  ],
                } as CheckResult;
              },
            },
          ] as unknown as InstallCheck[],
        update: async () => {},
      },
    );
    const callback: PreflightChecksCallback = {
      startCheck: (_status: CheckStatus) => {},
      endCheck: (_status: CheckStatus) => {},
    };
    const startCheckMock = vi.spyOn(callback, 'startCheck');
    const endCheckMock = vi.spyOn(callback, 'endCheck');
    const run = await providerRegistry.runPreflightChecks('id', callback, true);

    expect(startCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
    });
    expect(endCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
      successful: true,
      description: 'description-1',
    });
    expect(startCheckMock).toHaveBeenNthCalledWith(2, {
      name: 'check-2',
    });
    expect(endCheckMock).toHaveBeenNthCalledWith(2, {
      name: 'check-2',
      successful: true,
      description: 'description-2',
      docLinksDescription: 'doc-description-2',
      docLinks: [
        {
          title: 'link-2',
          url: 'url-2',
        },
      ],
    });
    expect(run).toBeTruthy();
  });
  test('callback called with checkResult having/not having docLinksDescription and return false if not successful', async () => {
    providerRegistry.registerUpdate(
      {
        internalId: 'id',
      } as unknown as ProviderImpl,
      {
        version: 'next',
        preflightChecks: (): InstallCheck[] =>
          [
            {
              title: 'check-1',
              execute: (): CheckResult => {
                return {
                  title: 'title-1',
                  successful: true,
                  description: 'description-1',
                } as CheckResult;
              },
            },
            {
              title: 'check-2',
              execute: (): CheckResult => {
                return {
                  title: 'title-2',
                  successful: false,
                  description: 'description-2',
                  docLinksDescription: 'doc-description-2',
                  docLinks: [
                    {
                      title: 'link-2',
                      url: 'url-2',
                    },
                  ],
                } as CheckResult;
              },
            },
          ] as unknown as InstallCheck[],
        update: async () => {},
      },
    );
    const callback: PreflightChecksCallback = {
      startCheck: (_status: CheckStatus) => {},
      endCheck: (_status: CheckStatus) => {},
    };
    const startCheckMock = vi.spyOn(callback, 'startCheck');
    const endCheckMock = vi.spyOn(callback, 'endCheck');
    const run = await providerRegistry.runPreflightChecks('id', callback, true);

    expect(startCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
    });
    expect(endCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
      successful: true,
      description: 'description-1',
    });
    expect(startCheckMock).toHaveBeenNthCalledWith(2, {
      name: 'check-2',
    });
    expect(endCheckMock).toHaveBeenNthCalledWith(2, {
      name: 'check-2',
      successful: false,
      description: 'description-2',
      docLinksDescription: 'doc-description-2',
      docLinks: [
        {
          title: 'link-2',
          url: 'url-2',
        },
      ],
    });
    expect(run).toBeFalsy();
  });
  test('callback called with error checkResult if execution fails and return false', async () => {
    providerRegistry.registerUpdate(
      {
        internalId: 'id',
      } as unknown as ProviderImpl,
      {
        version: 'next',
        preflightChecks: (): InstallCheck[] =>
          [
            {
              title: 'check-1',
              execute: (): CheckResult => {
                throw new Error('error');
              },
            },
          ] as unknown as InstallCheck[],
        update: async () => {},
      },
    );
    const callback: PreflightChecksCallback = {
      startCheck: (_status: CheckStatus) => {},
      endCheck: (_status: CheckStatus) => {},
    };
    const startCheckMock = vi.spyOn(callback, 'startCheck');
    const endCheckMock = vi.spyOn(callback, 'endCheck');
    const run = await providerRegistry.runPreflightChecks('id', callback, true);

    expect(startCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
    });
    expect(endCheckMock).toHaveBeenNthCalledWith(1, {
      name: 'check-1',
      successful: false,
      description: 'error',
    });
    expect(run).toBeFalsy();
  });
});

describe('startProvider', () => {
  test('if providerLifecycles is registered for the provider call startProviderLifecycle', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const disposable = providerRegistry.registerLifecycle(provider as ProviderImpl, {} as ProviderLifecycle);
    const startProviderLifecycleMock = vi
      .spyOn(providerRegistry, 'startProviderLifecycle')
      .mockImplementation(_id => Promise.resolve());
    await providerRegistry.startProvider((provider as ProviderImpl).internalId);
    expect(startProviderLifecycleMock).toBeCalledWith((provider as ProviderImpl).internalId);
    disposable.dispose();
  });

  test('if the provider has no lifecycle and no connection, throw', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    await expect(() => providerRegistry.startProvider((provider as ProviderImpl).internalId)).rejects.toThrowError(
      'The provider does not have any connection to start',
    );
  });

  test('if the provider has one connection without the start lifecycle, throw', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    provider.registerContainerProviderConnection({
      name: 'connection',
      displayName: 'connection',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status() {
        return 'stopped';
      },
    });
    await expect(() => providerRegistry.startProvider((provider as ProviderImpl).internalId)).rejects.toThrowError(
      'The connection connection does not support start lifecycle',
    );
  });

  test('if the provider has one container connection with the start lifecycle, execute the start action', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const startMock = vi.fn();
    provider.registerContainerProviderConnection({
      name: 'connection',
      displayName: 'connection',
      type: 'podman',
      lifecycle: {
        start: startMock,
      },
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status() {
        return 'stopped';
      },
    });
    await providerRegistry.startProvider((provider as ProviderImpl).internalId);
    expect(startMock).toBeCalled();
  });

  test('if the provider has one kubernetes connection with the start lifecycle, execute the start action', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const startMock = vi.fn();
    provider.registerKubernetesProviderConnection({
      name: 'connection',
      lifecycle: {
        start: startMock,
      },
      endpoint: {
        apiURL: 'url',
      },
      status() {
        return 'stopped';
      },
    });
    await providerRegistry.startProvider((provider as ProviderImpl).internalId);
    expect(startMock).toBeCalled();
  });
});

describe('shellInProviderConnection', () => {
  test('check if are all listeners disposed before calling close', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const connection: ProviderContainerConnectionInfo = {
      name: 'connection',
      displayName: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: 'started',
      vmType: {
        id: 'libkrun',
        name: 'libkrun',
      },
    };

    const closeMock = vi.fn();
    const openMock = vi.fn();

    const disposeOnDataMock = vi.fn();
    const disposeOnErrorMock = vi.fn();
    const disposeOnEndMock = vi.fn();

    const onDataMock = vi.fn().mockImplementation((_listener, _thisArgs, disposableArray) => {
      const disposable = { dispose: disposeOnDataMock };
      disposableArray.push(disposable);
      return disposable;
    });
    const onErrorMock = vi.fn().mockImplementation((_listener, _thisArgs, disposableArray) => {
      const disposable = { dispose: disposeOnErrorMock };
      disposableArray.push(disposable);
      return disposable;
    });
    const onEndMock = vi.fn().mockImplementation((_listener, _thisArgs, disposableArray) => {
      const disposable = { dispose: disposeOnEndMock };
      disposableArray.push(disposable);
      return disposable;
    });

    const shellAccessSession: ProviderConnectionShellAccessSession = {
      onData: onDataMock,
      onError: onErrorMock,
      onEnd: onEndMock,
      close: closeMock,
    } as unknown as ProviderConnectionShellAccessSession;

    openMock.mockReturnValue(shellAccessSession);
    const shellAccess: ProviderConnectionShellAccess = {
      open: openMock,
    } as unknown as ProviderConnectionShellAccess;

    provider.registerContainerProviderConnection({
      name: 'connection',
      displayName: 'connection',
      type: 'docker',
      lifecycle: {
        start: vi.fn(),
        stop: vi.fn(),
      },
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      shellAccess: shellAccess,
      status() {
        return 'started';
      },
      vmType: 'libkrun',
    });

    // Call shellInProviderConnection
    const shellInProviderConnection = await providerRegistry.shellInProviderConnection(
      '0',
      connection,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    );

    // Check that all callbacks are set and session is created
    expect(openMock).toBeCalled();
    expect(onDataMock).toBeCalled();
    expect(onErrorMock).toBeCalled();
    expect(onEndMock).toBeCalled();

    // Check that close is called and listeners are disposed
    shellInProviderConnection.close();

    expect(disposeOnDataMock).toBeCalled();
    expect(disposeOnErrorMock).toBeCalled();
    expect(disposeOnEndMock).toBeCalled();
    expect(closeMock).toBeCalled();
  });
});

test('should retrieve provider info from provider internal id', async () => {
  providerRegistry.createProvider('id1', 'name1', {
    id: 'internal1',
    name: 'internal1name',
    status: 'installed',
  });

  providerRegistry.createProvider('id2', 'name2', {
    id: 'internal2',
    name: 'internal2name',
    status: 'installed',
  });

  const provider1 = providerRegistry.getProviderInfo('0');
  const provider2 = providerRegistry.getProviderInfo('1');
  const provider3 = providerRegistry.getProviderInfo('2');

  expect(provider1).toBeDefined();
  expect(provider2).toBeDefined();
  expect(provider3).toBeUndefined();

  expect(provider1?.id).toBe('internal1');
  expect(provider1?.name).toBe('internal1name');
  expect(provider1?.extensionId).toBe('id1');

  expect(provider2?.id).toBe('internal2');
  expect(provider2?.name).toBe('internal2name');
  expect(provider2?.extensionId).toBe('id2');
});
