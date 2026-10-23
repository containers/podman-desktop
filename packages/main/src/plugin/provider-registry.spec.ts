/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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
  CheckStatus,
  PreflightChecksCallback,
  ProviderConnectionInfo,
  ProviderContainerConnectionInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
} from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type {
  AutostartContext,
  CancellationToken,
  CheckResult,
  ConnectionFactory,
  ConnectionFactoryDetails,
  ContainerProviderConnection,
  InstallCheck,
  KubernetesProviderConnection,
  Logger,
  Provider,
  ProviderCleanup,
  ProviderConnectionShellAccess,
  ProviderConnectionShellAccessSession,
  ProviderConnectionStatus,
  ProviderImages,
  ProviderInstallation,
  ProviderLifecycle,
  ProviderUpdate,
  UpdateVmConnectionEvent,
  VmProviderConnection,
} from '@desktop-framework/extension-api';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import type { AutostartEngine } from './autostart-engine.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import { LifecycleContextImpl } from './lifecycle-context.js';
import type { ProviderImpl } from './provider-impl.js';
import { ProviderRegistry } from './provider-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';

let providerRegistry: TestProviderRegistry;
let autostartEngine: AutostartEngine;

const apiSenderSendMock = vi.fn();

let containerRegistry: ContainerProviderRegistry;

class TestProviderRegistry extends ProviderRegistry {
  getKubernetesProviders(): Map<string, KubernetesProviderConnection> {
    return this.kubernetesProviders;
  }
  getVmProviders(): Map<string, VmProviderConnection> {
    return this.vmProviders;
  }

  override getMatchingProvider(internalId: string): ProviderImpl {
    return super.getMatchingProvider(internalId);
  }
}

const telemetry: Telemetry = {
  track: vi.fn(),
  aggregateTrack: vi.fn(),
} as unknown as Telemetry;

let configurationRegistry: IConfigurationRegistry;
const getConfigurationMock = vi.fn();

beforeEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  containerRegistry = {
    registerContainerConnection: vi.fn(),
    isApiAttached: vi.fn(),
    onApiAttached: vi.fn(),
  } as unknown as ContainerProviderRegistry;
  getConfigurationMock.mockReturnValue({ get: () => ['*'] });
  configurationRegistry = {
    registerConfigurations: vi.fn(),
    getConfiguration: getConfigurationMock,
  } as unknown as IConfigurationRegistry;
  providerRegistry = new TestProviderRegistry(apiSender, containerRegistry, telemetry, configurationRegistry);
  autostartEngine = {
    registerProvider: vi.fn(),
  } as unknown as AutostartEngine;
});

test('should initialize provider if there is kubernetes connection provider', async () => {
  let providerInternalId: string | undefined;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = String(data);
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

  if (providerInternalId) {
    await providerRegistry.initializeProvider(providerInternalId);

    expect(telemetry.aggregateTrack).toHaveBeenNthCalledWith(1, 'createProviders', {
      name: 'internal',
      status: 'installed',
    });

    expect(initalizeCalled).toBe(true);
    expect(apiSenderSendMock).toBeCalled();
  } else {
    assert.fail('providerInternalId not initialized');
  }
});

test('onDidSetConnectionFactory is called when a container connection factory is set and onDidUnsetConnectionFactory is called when the disposable is disposed', async () => {
  const onDidSetConnectionFactoryMock: (e: ConnectionFactoryDetails) => void = vi.fn();
  providerRegistry.onDidSetConnectionFactory(onDidSetConnectionFactoryMock);

  const onDidUnsetConnectionFactoryMock: (e: ConnectionFactory) => void = vi.fn();
  providerRegistry.onDidUnsetConnectionFactory(onDidUnsetConnectionFactoryMock);

  const images = {
    icon: {
      light: 'a light image',
      dark: 'a dark image',
    },
    logo: {
      light: 'a light image',
      dark: 'a dark image',
    },
  } as ProviderImages;
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'aProviderId',
    name: 'aProviderName',
    status: 'installed',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description',
    images,
  });

  const disposable = provider.setContainerProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });

  expect(onDidSetConnectionFactoryMock).toHaveBeenCalledWith({
    type: 'container',
    providerId: 'aProviderId',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description',
    images,
  });

  disposable.dispose();
  expect(onDidUnsetConnectionFactoryMock).toHaveBeenCalledWith({
    type: 'container',
    providerId: 'aProviderId',
  });
});

test('should initialize provider if there is VM connection provider', async () => {
  const providerInternalId = '0';

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  const initializeMock = vi.fn();
  (provider as ProviderImpl).setVmProviderConnectionFactory({
    initialize: initializeMock,
  });

  await providerRegistry.initializeProvider(providerInternalId);

  expect(telemetry.aggregateTrack).toHaveBeenNthCalledWith(1, 'createProviders', {
    name: 'internal',
    status: 'installed',
  });

  expect(initializeMock).toHaveBeenCalled();
  expect(apiSenderSendMock).toHaveBeenCalledWith('provider-create', '0');
});

test('should send version event if update', async () => {
  let providerInternalId: string | undefined;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(['provider-create', 'provider:update-version', 'provider-change']).toContain(message);
    if (message === 'provider-create') {
      providerInternalId = String(data);
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
  if (providerInternalId) {
    await providerRegistry.updateProvider(providerInternalId);

    expect(telemetry.aggregateTrack).toHaveBeenNthCalledWith(1, 'createProviders', {
      name: 'internal',
      status: 'installed',
    });

    expect(updateCalled).toBe(true);
    expect(apiSenderSendMock).toBeCalledTimes(3);
  } else {
    assert.fail('providerInternalId not initialized');
  }
});

test('should send status update event on status change', async () => {
  const providerListenerMock = vi.fn();
  providerRegistry.addProviderListener(providerListenerMock);

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internalId',
    name: 'internalName',
    status: 'installed',
  });

  provider.updateStatus('started');

  expect(providerListenerMock).toHaveBeenCalledWith(
    'provider:update-status',
    expect.objectContaining({ id: 'internalId', name: 'internalName', status: 'started' }),
  );
});

test('should initialize provider if there is container connection provider', async () => {
  let providerInternalId: string | undefined;

  apiSenderSendMock.mockImplementation((message, data) => {
    expect(message).toBe('provider-create');
    providerInternalId = String(data);
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
  if (providerInternalId) {
    await providerRegistry.initializeProvider(providerInternalId);

    expect(telemetry.aggregateTrack).toHaveBeenNthCalledWith(1, 'createProviders', {
      name: 'internal',
      status: 'installed',
    });

    expect(initalizeCalled).toBe(true);
    expect(apiSenderSendMock).toBeCalled();
  } else {
    assert.fail('providerInternalId not initialized');
  }
});

test('onDidSetConnectionFactory is called when a kubernetes connection factory is set and onDidUnsetConnectionFactory is called when the disposable is disposed', async () => {
  const onDidSetConnectionFactoryMock: (e: ConnectionFactoryDetails) => void = vi.fn();
  providerRegistry.onDidSetConnectionFactory(onDidSetConnectionFactoryMock);

  const onDidUnsetConnectionFactoryMock: (e: ConnectionFactory) => void = vi.fn();
  providerRegistry.onDidUnsetConnectionFactory(onDidUnsetConnectionFactoryMock);

  const images = {
    icon: {
      light: 'a light image',
      dark: 'a dark image',
    },
    logo: {
      light: 'a light image',
      dark: 'a dark image',
    },
  } as ProviderImages;
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'aProviderId',
    name: 'aProviderName',
    status: 'installed',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description',
    images,
  });

  const disposable = provider.setKubernetesProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });

  expect(onDidSetConnectionFactoryMock).toHaveBeenCalledWith({
    type: 'kubernetes',
    providerId: 'aProviderId',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description',
    images,
  });

  disposable.dispose();
  expect(onDidUnsetConnectionFactoryMock).toHaveBeenCalledWith({
    type: 'kubernetes',
    providerId: 'aProviderId',
  });
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
  let providerInternalId: string | undefined;

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
  if (providerInternalId) {
    await expect(providerRegistry.initializeProvider(providerInternalId)).rejects.toThrowError(error);

    expect(updateStatusMock).toHaveBeenCalledWith('configuring');
    expect(updateStatusMock).toHaveBeenCalledWith('installed');
  } else {
    assert.fail('providerInternalId not initialized');
  }
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
    connectionType: 'container',
    name: 'connection',
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    lifecycleMethods: undefined,
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'started',
  };
  const res = providerRegistry.isProviderContainerConnection(connection);
  expect(res).toBe(true);
});

test('expect isProviderContainerConnection returns false with a ProviderKubernetesConnectionInfo', async () => {
  const connection: ProviderKubernetesConnectionInfo = {
    connectionType: 'kubernetes',
    name: 'connection',
    endpoint: {
      apiURL: 'url',
    },
    lifecycleMethods: undefined,
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'started',
  };
  const res = providerRegistry.isProviderContainerConnection(connection);
  expect(res).toBe(false);
});

describe('getMatchingConnectionFromProvider', () => {
  test('should return container connection for connectionType: container', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });

    const containerConnection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'test-container',
      displayName: 'Test Container',
      type: 'docker',
      endpoint: { socketPath: '/test.sock' },
      status: 'started',
    } as ProviderContainerConnectionInfo;

    provider.registerContainerProviderConnection({
      name: 'test-container',
      displayName: 'Test Container',
      type: 'docker',
      endpoint: { socketPath: '/test.sock' },
      status: () => 'started',
    });

    const connection = providerRegistry.getMatchingConnectionFromProvider(
      (provider as unknown as { internalId: string }).internalId,
      containerConnection,
    );
    expect(connection).toBeDefined();
    expect(providerRegistry.isContainerConnection(connection)).toBe(true);
  });

  test('should return kubernetes connection for connectionType: kubernetes', async () => {
    const provider = providerRegistry.createProvider('id2', 'name2', {
      id: 'internal2',
      name: 'internal2',
      status: 'installed',
    });

    const kubernetesConnection: ProviderKubernetesConnectionInfo = {
      connectionType: 'kubernetes',
      name: 'test-k8s',
      endpoint: { apiURL: 'https://localhost:6443' },
      status: 'started',
    } as ProviderKubernetesConnectionInfo;

    provider.registerKubernetesProviderConnection({
      name: 'test-k8s',
      endpoint: { apiURL: 'https://localhost:6443' },
      status: () => 'started',
    });

    const connection = providerRegistry.getMatchingConnectionFromProvider(
      (provider as unknown as { internalId: string }).internalId,
      kubernetesConnection,
    );
    expect(connection).toBeDefined();
    expect(providerRegistry.isKubernetesConnection(connection)).toBe(true);
  });

  test('should return vm connection for connectionType: vm', async () => {
    const provider = providerRegistry.createProvider('id3', 'name3', {
      id: 'internal3',
      name: 'internal3',
      status: 'installed',
    });

    const vmConnection: ProviderVmConnectionInfo = {
      connectionType: 'vm',
      name: 'test-vm',
      status: 'started',
    } as ProviderVmConnectionInfo;

    provider.registerVmProviderConnection({
      name: 'test-vm',
      status: () => 'started',
    });

    const connection = providerRegistry.getMatchingConnectionFromProvider(
      (provider as unknown as { internalId: string }).internalId,
      vmConnection,
    );
    expect(connection).toBeDefined();
    expect(providerRegistry.isContainerConnection(connection)).toBe(false);
    expect(providerRegistry.isKubernetesConnection(connection)).toBe(false);
  });

  test('should throw error for missing connectionType', async () => {
    const provider = providerRegistry.createProvider('id4', 'name4', {
      id: 'internal4',
      name: 'internal4',
      status: 'installed',
    });

    const invalidConnection = {
      name: 'test-invalid',
      status: 'started',
    } as ProviderConnectionInfo;

    expect(() => {
      providerRegistry.getMatchingConnectionFromProvider(
        (provider as unknown as { internalId: string }).internalId,
        invalidConnection,
      );
    }).toThrow('Unable to determine connection type');
  });

  test('should throw error when connection not found', async () => {
    const provider = providerRegistry.createProvider('id5', 'name5', {
      id: 'internal5',
      name: 'internal5',
      status: 'installed',
    });

    provider.registerContainerProviderConnection({
      name: 'existing-container',
      displayName: 'Existing',
      type: 'docker',
      endpoint: { socketPath: '/existing.sock' },
      status: () => 'started',
    });

    const nonExistentConnection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'non-existent',
      displayName: 'Non Existent',
      type: 'docker',
      endpoint: { socketPath: '/nonexistent.sock' },
      status: 'started',
    } as ProviderContainerConnectionInfo;

    expect(() => {
      providerRegistry.getMatchingConnectionFromProvider(
        (provider as unknown as { internalId: string }).internalId,
        nonExistentConnection,
      );
    }).toThrow();
  });
});
describe('isProviderVmConnectionInfo', () => {
  test('should return true for VM connection info', async () => {
    const connection: ProviderVmConnectionInfo = {
      connectionType: 'vm',
      name: 'test-vm',
      status: 'started',
    } as ProviderVmConnectionInfo;
    const result = providerRegistry.isProviderVmConnectionInfo(connection);
    expect(result).toBe(true);
  });

  test('should return false for container connection info', async () => {
    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'test-container',
      displayName: 'Test',
      type: 'docker',
      endpoint: { socketPath: '/test.sock' },
      status: 'started',
    } as ProviderContainerConnectionInfo;
    const result = providerRegistry.isProviderVmConnectionInfo(connection);
    expect(result).toBe(false);
  });

  test('should return false for kubernetes connection info', async () => {
    const connection: ProviderKubernetesConnectionInfo = {
      connectionType: 'kubernetes',
      name: 'test-k8s',
      endpoint: { apiURL: 'https://localhost:6443' },
      status: 'started',
    } as ProviderKubernetesConnectionInfo;
    const result = providerRegistry.isProviderVmConnectionInfo(connection);
    expect(result).toBe(false);
  });
});

describe('a Kubernetes provider is registered', async () => {
  let provider: Provider;
  let disposable: Disposable;
  let connection: KubernetesProviderConnection;

  beforeEach(() => {
    vi.useFakeTimers();
    provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    connection = {
      name: 'connection',
      endpoint: {
        apiURL: 'url',
      },
      lifecycle: undefined,
      status: (): ProviderConnectionStatus => 'started',
    };

    disposable = providerRegistry.registerKubernetesConnection(provider, connection);
  });

  test('should send telemetry and be added to registry', async () => {
    expect(telemetry.track).toHaveBeenLastCalledWith('registerKubernetesProviderConnection', {
      name: 'connection',
      total: 1,
    });

    expect(providerRegistry.getKubernetesProviders().keys()).toContain('internal.connection');
  });

  test('should be removed from registry when disposed', async () => {
    disposable.dispose();
    expect(providerRegistry.getKubernetesProviders().keys()).not.toContain('internal.connection');
  });

  test('should send provider-change when status of vm changes', async () => {
    // status unchanged, do not send event
    vi.advanceTimersByTime(2005);
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    connection.status = (): ProviderConnectionStatus => 'stopped';

    // status changed, send event
    vi.advanceTimersByTime(2000);
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});
  });

  test('should send provider-change when Kubernetes provider disposed', async () => {
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    disposable.dispose();
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});
  });

  test('should not send provider-change when Kubernetes provider disposed and status changes', async () => {
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    disposable.dispose();
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});

    apiSenderSendMock.mockClear();
    connection.status = (): ProviderConnectionStatus => 'stopped';

    // status changed, do not send event
    vi.advanceTimersByTime(20_000);
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', {});
  });

  test('should retrieve provider info for Kubernetes provider without factory', async () => {
    provider.registerKubernetesProviderConnection({
      name: 'conn1',
      endpoint: { apiURL: 'url' },
      status: () => 'stopped',
    });

    const provider1 = providerRegistry.getProviderInfo('0');

    expect(provider1).toBeDefined();

    expect(provider1?.id).toBe('internal');
    expect(provider1?.name).toBe('internal');
    expect(provider1?.extensionId).toBe('id');

    expect(provider1?.kubernetesConnections).toHaveLength(1);
    expect(provider1?.kubernetesConnections[0]?.name).toEqual('conn1');
    expect(provider1?.kubernetesConnections[0]?.endpoint?.apiURL).toEqual('url');
    expect(provider1?.kubernetesConnections[0]?.status).toEqual('stopped');
    expect(provider1?.kubernetesProviderConnectionCreation).toBeFalsy();
    expect(provider1?.kubernetesProviderConnectionInitialization).toBeFalsy();
    expect(provider1?.kubernetesProviderConnectionCreationButtonTitle).toBeUndefined();
    expect(provider1?.kubernetesProviderConnectionCreationDisplayName).toBeUndefined();
  });

  test('should retrieve provider info for Kubernetes provider with factory', async () => {
    provider.registerKubernetesProviderConnection({
      name: 'conn1',
      endpoint: { apiURL: 'url' },
      status: () => 'stopped',
    });
    provider.setKubernetesProviderConnectionFactory({
      create: async () => {},
      initialize: async () => {},
      creationButtonTitle: 'my create',
      creationDisplayName: 'my display name',
    });
    const provider1 = providerRegistry.getProviderInfo('0');

    expect(provider1).toBeDefined();

    expect(provider1?.id).toBe('internal');
    expect(provider1?.name).toBe('internal');
    expect(provider1?.extensionId).toBe('id');

    expect(provider1?.kubernetesConnections).toHaveLength(1);
    expect(provider1?.kubernetesConnections[0]?.name).toEqual('conn1');
    expect(provider1?.kubernetesConnections[0]?.endpoint?.apiURL).toEqual('url');
    expect(provider1?.kubernetesConnections[0]?.status).toEqual('stopped');
    expect(provider1?.kubernetesProviderConnectionCreation).toBeTruthy();
    expect(provider1?.kubernetesProviderConnectionInitialization).toBeTruthy();
    expect(provider1?.kubernetesProviderConnectionCreationButtonTitle).toBe('my create');
    expect(provider1?.kubernetesProviderConnectionCreationDisplayName).toBe('my display name');
  });
});

describe('registerVmProviderConnection is called on ProviderImpl', async () => {
  let provider: ProviderImpl;
  let connection: VmProviderConnection;
  let disposable: Disposable;

  beforeEach(() => {
    provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    }) as ProviderImpl;

    connection = {
      name: 'connection',
      lifecycle: undefined,
      status: (): ProviderConnectionStatus => 'started',
    };

    vi.spyOn(providerRegistry, 'registerVmConnection');
    vi.spyOn(providerRegistry, 'onDidRegisterVmConnectionCallback');
    vi.spyOn(providerRegistry, 'onDidUnregisterVmConnectionCallback');
    disposable = provider.registerVmProviderConnection(connection);
  });

  test('registerVmConnection is called on registry and provider added to set', async () => {
    expect(providerRegistry.registerVmConnection).toHaveBeenCalled();
    expect(providerRegistry.onDidRegisterVmConnectionCallback).toHaveBeenCalled();
    expect(provider.vmConnections).toHaveLength(1);
  });

  test('should be removed from set when disposed', async () => {
    disposable.dispose();
    expect(provider.vmConnections).toHaveLength(0);
    expect(providerRegistry.onDidUnregisterVmConnectionCallback).toHaveBeenCalled();
  });
});

describe('a vm provider is registered', async () => {
  let provider: Provider;
  let disposable: Disposable;
  let connection: VmProviderConnection;

  beforeEach(() => {
    vi.useFakeTimers();
    provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    connection = {
      name: 'connection',
      lifecycle: undefined,
      status: (): ProviderConnectionStatus => 'started',
    };

    disposable = providerRegistry.registerVmConnection(provider, connection);
  });

  test('should send telemetry and be added to registry', async () => {
    expect(telemetry.track).toHaveBeenLastCalledWith('registerVmProviderConnection', {
      name: 'connection',
      total: 1,
    });

    expect(providerRegistry.getVmProviders().keys()).toContain('internal.connection');
  });

  test('should be removed from registry when disposed', async () => {
    disposable.dispose();
    expect(providerRegistry.getVmProviders().keys()).not.toContain('internal.connection');
  });

  test('should send provider-change when status of vm changes', async () => {
    // status unchanged, do not send event
    vi.advanceTimersByTime(2005);
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    connection.status = (): ProviderConnectionStatus => 'stopped';

    // status changed, send event
    vi.advanceTimersByTime(2000);
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});
  });

  test('should send provider-change when vm provider disposed', async () => {
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    disposable.dispose();
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});
  });

  test('should not send provider-change when vm provider disposed and status changes', async () => {
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', expect.anything());

    disposable.dispose();
    expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});

    apiSenderSendMock.mockClear();
    connection.status = (): ProviderConnectionStatus => 'stopped';

    // status changed, do not send event
    vi.advanceTimersByTime(20_000);
    expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', {});
  });

  test('should retrieve provider info for VM provider without factory', async () => {
    (provider as ProviderImpl).registerVmProviderConnection({
      name: 'conn1',
      status: () => 'stopped',
    });

    const provider1 = providerRegistry.getProviderInfo('0');

    expect(provider1).toBeDefined();

    expect(provider1?.id).toBe('internal');
    expect(provider1?.name).toBe('internal');
    expect(provider1?.extensionId).toBe('id');

    expect(provider1?.vmConnections).toHaveLength(1);
    expect(provider1?.vmConnections[0]?.name).toEqual('conn1');
    expect(provider1?.vmConnections[0]?.status).toEqual('stopped');
    expect(provider1?.vmProviderConnectionCreation).toBeFalsy();
    expect(provider1?.vmProviderConnectionInitialization).toBeFalsy();
    expect(provider1?.vmProviderConnectionCreationButtonTitle).toBeUndefined();
    expect(provider1?.vmProviderConnectionCreationDisplayName).toBeUndefined();
  });

  test('should fail when creating VM provider connection without factory', async () => {
    const params = { key1: 'value1', key2: 42 };
    const logHandler = {} as Logger;
    const token = {} as CancellationToken;
    await expect(() => providerRegistry.createVmProviderConnection('0', params, logHandler, token)).rejects.toThrow();
  });

  describe('factory is set', () => {
    const factory = {
      create: vi.fn(),
      initialize: vi.fn(),
      creationButtonTitle: 'my create',
      creationDisplayName: 'my display name',
    };
    beforeEach(() => {
      (provider as ProviderImpl).registerVmProviderConnection({
        name: 'conn1',
        status: () => 'stopped',
      });
      (provider as ProviderImpl).setVmProviderConnectionFactory(factory);
    });

    test('should retrieve provider info for VM provider with factory', async () => {
      const provider1 = providerRegistry.getProviderInfo('0');

      expect(provider1).toBeDefined();

      expect(provider1?.id).toBe('internal');
      expect(provider1?.name).toBe('internal');
      expect(provider1?.extensionId).toBe('id');

      expect(provider1?.vmConnections).toHaveLength(1);
      expect(provider1?.vmConnections[0]?.name).toEqual('conn1');
      expect(provider1?.vmConnections[0]?.status).toEqual('stopped');
      expect(provider1?.vmProviderConnectionCreation).toBeTruthy();
      expect(provider1?.vmProviderConnectionInitialization).toBeTruthy();
      expect(provider1?.vmProviderConnectionCreationButtonTitle).toBe('my create');
      expect(provider1?.vmProviderConnectionCreationDisplayName).toBe('my display name');
    });

    test('should create VM provider connection', async () => {
      const params = { key1: 'value1', key2: 42 };
      const logHandler = {} as Logger;
      const token = {} as CancellationToken;
      await providerRegistry.createVmProviderConnection('0', params, logHandler, token);
      expect(factory.create).toHaveBeenCalledWith(params, logHandler, token);
    });

    test('onDidSetConnectionFactory is called when a vm connection factory is set and onDidUnsetConnectionFactory is called when the disposable is disposed', async () => {
      const onDidSetConnectionFactoryMock: (e: ConnectionFactoryDetails) => void = vi.fn();
      providerRegistry.onDidSetConnectionFactory(onDidSetConnectionFactoryMock);

      const onDidUnsetConnectionFactoryMock: (e: ConnectionFactory) => void = vi.fn();
      providerRegistry.onDidUnsetConnectionFactory(onDidUnsetConnectionFactoryMock);

      const images = {
        icon: {
          light: 'a light image',
          dark: 'a dark image',
        },
        logo: {
          light: 'a light image',
          dark: 'a dark image',
        },
      } as ProviderImages;
      const provider = providerRegistry.createProvider('id', 'name', {
        id: 'aProviderId',
        name: 'aProviderName',
        status: 'installed',
        emptyConnectionMarkdownDescription: 'an empty connection markdown description',
        images,
      });

      const disposable = provider.setVmProviderConnectionFactory({
        initialize: async () => {},
        create: async () => {},
        creationDisplayName: 'a creation Display Name',
        creationButtonTitle: 'a creation Button Title',
      });

      expect(onDidSetConnectionFactoryMock).toHaveBeenCalledWith({
        type: 'vm',
        providerId: 'aProviderId',
        creationDisplayName: 'a creation Display Name',
        creationButtonTitle: 'a creation Button Title',
        emptyConnectionMarkdownDescription: 'an empty connection markdown description',
        images,
      });

      disposable.dispose();
      expect(onDidUnsetConnectionFactoryMock).toHaveBeenCalledWith({
        type: 'vm',
        providerId: 'aProviderId',
      });
    });
  });
});

describe('should send events when starting a container connection', async () => {
  const startMock = vi.fn();
  const stopMock = vi.fn();
  let connection: ProviderContainerConnectionInfo;

  beforeEach(() => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    connection = {
      connectionType: 'container',
      name: 'connection',
      displayName: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      status: 'started',
      vmType: {
        id: 'libkrun',
        name: 'libkrun',
      },
    };

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
  });

  test('when api is directly attached', async () => {
    vi.mocked(containerRegistry.isApiAttached).mockReturnValue(true);

    let onBeforeDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onBeforeDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onBeforeDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onBeforeDidUpdateContainerConnectionCalled++;
    });
    let onDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onDidUpdateContainerConnectionCalled++;
    });
    let onAfterDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onAfterDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onAfterDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onAfterDidUpdateContainerConnectionCalled++;
    });

    await providerRegistry.startProviderConnection('0', connection);

    expect(startMock).toBeCalled();
    expect(stopMock).not.toBeCalled();
    expect(onBeforeDidUpdateContainerConnectionCalled).toBe(2);
    expect(onDidUpdateContainerConnectionCalled).toBe(2);
    expect(onAfterDidUpdateContainerConnectionCalled).toBe(2);
  });

  test('when api is eventually attached', async () => {
    vi.mocked(containerRegistry.isApiAttached).mockReturnValue(false);
    vi.mocked(containerRegistry.onApiAttached).mockImplementation(c => {
      setTimeout(() => {
        c('internal.connection');
      }, 10);
      return Disposable.noop();
    });

    let onBeforeDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onBeforeDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onBeforeDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onBeforeDidUpdateContainerConnectionCalled++;
    });
    let onDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onDidUpdateContainerConnectionCalled++;
    });
    let onAfterDidUpdateContainerConnectionCalled = 0;
    providerRegistry.onAfterDidUpdateContainerConnection(event => {
      expect(event.connection.name).toBe(connection.name);
      expect(event.connection.type).toBe(connection.type);
      expect(event.status).toBe(onAfterDidUpdateContainerConnectionCalled ? 'started' : 'starting');
      onAfterDidUpdateContainerConnectionCalled++;
    });

    await providerRegistry.startProviderConnection('0', connection);

    expect(startMock).toBeCalled();
    expect(stopMock).not.toBeCalled();
    expect(onBeforeDidUpdateContainerConnectionCalled).toBe(1);
    expect(onDidUpdateContainerConnectionCalled).toBe(1);
    expect(onAfterDidUpdateContainerConnectionCalled).toBe(1);

    await vi.waitFor(() => {
      expect(onBeforeDidUpdateContainerConnectionCalled).toBe(2);
      expect(onDidUpdateContainerConnectionCalled).toBe(2);
      expect(onAfterDidUpdateContainerConnectionCalled).toBe(2);
    });
  });
});

test('should send events when starting a Kubernetes connection', async () => {
  const startMock = vi.fn();
  const stopMock = vi.fn();

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderKubernetesConnectionInfo = {
    connectionType: 'kubernetes',
    name: 'connection',
    endpoint: { apiURL: 'endpoint' },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'started',
  };

  provider.registerKubernetesProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      apiURL: 'endpoint',
    },
    status() {
      return 'started';
    },
  });

  const onDidUpdateKubernetesConnectionMock = vi.fn<(e: UpdateVmConnectionEvent) => void>();
  providerRegistry.onDidUpdateKubernetesConnection(onDidUpdateKubernetesConnectionMock);

  await providerRegistry.startProviderConnection('0', connection);

  expect(startMock).toBeCalled();
  expect(stopMock).not.toBeCalled();
  expect(onDidUpdateKubernetesConnectionMock).toHaveBeenCalledOnce();
  expect(onDidUpdateKubernetesConnectionMock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      connection: expect.objectContaining({
        name: connection.name,
      }),
      status: 'started',
    }),
  );
  const event = onDidUpdateKubernetesConnectionMock.mock.calls[0]?.[0];
  expect(event?.connection.status()).toEqual('started');
});

test('should send events when starting a VM connection', async () => {
  const startMock = vi.fn();
  const stopMock = vi.fn();

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderVmConnectionInfo = {
    connectionType: 'vm',
    name: 'connection',
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'started',
  };

  (provider as ProviderImpl).registerVmProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    status() {
      return 'started';
    },
  });

  const onDidUpdateVmConnectionMock = vi.fn<(e: UpdateVmConnectionEvent) => void>();
  providerRegistry.onDidUpdateVmConnection(onDidUpdateVmConnectionMock);

  await providerRegistry.startProviderConnection('0', connection);

  expect(startMock).toBeCalled();
  expect(stopMock).not.toBeCalled();
  expect(onDidUpdateVmConnectionMock).toHaveBeenCalledOnce();
  expect(onDidUpdateVmConnectionMock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      connection: expect.objectContaining({
        name: connection.name,
      }),
      status: 'started',
    }),
  );
  const event = onDidUpdateVmConnectionMock.mock.calls[0]?.[0];
  expect(event?.connection.status()).toEqual('started');
});

test('should persist error in connectionErrors map when start fails', async () => {
  const startMock = vi.fn().mockRejectedValue(new Error('Connection refused'));
  const stopMock = vi.fn();

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'connection',
    displayName: 'connection',
    endpoint: { socketPath: '/endpoint1.sock' },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'stopped',
    type: 'podman',
  };

  provider.registerContainerProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    type: 'podman',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status() {
      return 'stopped';
    },
  });

  const onDidUpdateMock = vi.fn();
  providerRegistry.onDidUpdateContainerConnection(onDidUpdateMock);

  await expect(providerRegistry.startProviderConnection('0', connection)).rejects.toThrow('Connection refused');

  expect(onDidUpdateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'starting',
      error: 'Connection refused',
    }),
  );
});

test('should clear error from connectionErrors map when start succeeds', async () => {
  const startMock = vi.fn();
  const stopMock = vi.fn();

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  provider.registerKubernetesProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      apiURL: 'endpoint',
    },
    status() {
      return 'started';
    },
  });

  const connection: ProviderKubernetesConnectionInfo = {
    connectionType: 'kubernetes',
    name: 'connection',
    endpoint: { apiURL: 'endpoint' },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'stopped',
  };

  const onDidUpdateMock = vi.fn();
  providerRegistry.onDidUpdateKubernetesConnection(onDidUpdateMock);

  await providerRegistry.startProviderConnection('0', connection);

  expect(onDidUpdateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'started',
    }),
  );
  expect(onDidUpdateMock).not.toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.any(String),
    }),
  );
});

describe('when auto-starting a container connection', async () => {
  let connection: ProviderContainerConnectionInfo;
  let provider: Provider;
  const containerProviderConnection: ContainerProviderConnection = {
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
    status(): ProviderConnectionStatus {
      return 'started';
    },
    vmType: 'libkrun',
  };

  beforeEach(() => {
    provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    connection = {
      connectionType: 'container',
      name: 'connection',
      displayName: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      status: 'started',
      vmType: {
        id: 'libkrun',
        name: 'libkrun',
      },
    };

    providerRegistry.registerAutostartEngine(autostartEngine);
  });

  describe('when provider calls updateContainerConnection with non-registered connection', () => {
    beforeEach(() => {
      provider.registerAutostart({
        start: async (_logger: Logger, context?: AutostartContext) => {
          context?.updateContainerConnection(containerProviderConnection);
        },
      });
    });

    test('an error should be thrown', async () => {
      await expect(() => providerRegistry.runAutostart('0')).rejects.toThrowError(
        'container connection connection is not registered by provider internal',
      );
    });
  });

  describe('when provider calls updateContainerConnection with registered connection', () => {
    beforeEach(() => {
      provider.registerContainerProviderConnection(containerProviderConnection);

      provider.registerAutostart({
        start: async (_logger: Logger, context?: AutostartContext) => {
          context?.updateContainerConnection(containerProviderConnection);
        },
      });
    });

    test('should send events when api is directly attached', async () => {
      vi.mocked(containerRegistry.isApiAttached).mockReturnValue(true);

      const onBeforeDidUpdateContainerConnectionListenerMock = vi.fn();
      providerRegistry.onBeforeDidUpdateContainerConnection(onBeforeDidUpdateContainerConnectionListenerMock);

      const onDidUpdateContainerConnectionListenerMock = vi.fn();
      providerRegistry.onDidUpdateContainerConnection(onDidUpdateContainerConnectionListenerMock);

      const onAfterDidUpdateContainerConnectionListenerMock = vi.fn();
      providerRegistry.onAfterDidUpdateContainerConnection(onAfterDidUpdateContainerConnectionListenerMock);

      await providerRegistry.runAutostart('0');

      expect(onBeforeDidUpdateContainerConnectionListenerMock).toHaveBeenCalledTimes(2);
      expect(onBeforeDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'starting',
        }),
      );
      expect(onBeforeDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'started',
        }),
      );

      expect(onDidUpdateContainerConnectionListenerMock).toHaveBeenCalledTimes(2);
      expect(onDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'starting',
        }),
      );
      expect(onDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'started',
        }),
      );

      expect(onAfterDidUpdateContainerConnectionListenerMock).toHaveBeenCalledTimes(2);
      expect(onAfterDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'starting',
        }),
      );
      expect(onAfterDidUpdateContainerConnectionListenerMock).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          connection: expect.objectContaining({
            name: connection.name,
            type: connection.type,
          }),
          status: 'started',
        }),
      );
    });

    test('should send events when api is eventually attached', async () => {
      vi.mocked(containerRegistry.isApiAttached).mockReturnValue(false);
      vi.mocked(containerRegistry.onApiAttached).mockImplementation(c => {
        setTimeout(() => {
          c('internal.connection');
        }, 10);
        return Disposable.noop();
      });

      let onBeforeDidUpdateContainerConnectionCalled = 0;
      providerRegistry.onBeforeDidUpdateContainerConnection(event => {
        expect(event.connection.name).toBe(connection.name);
        expect(event.connection.type).toBe(connection.type);
        expect(event.status).toBe(onBeforeDidUpdateContainerConnectionCalled ? 'started' : 'starting');
        onBeforeDidUpdateContainerConnectionCalled++;
      });
      let onDidUpdateContainerConnectionCalled = 0;
      providerRegistry.onDidUpdateContainerConnection(event => {
        expect(event.connection.name).toBe(connection.name);
        expect(event.connection.type).toBe(connection.type);
        expect(event.status).toBe(onDidUpdateContainerConnectionCalled ? 'started' : 'starting');
        onDidUpdateContainerConnectionCalled++;
      });
      let onAfterDidUpdateContainerConnectionCalled = 0;
      providerRegistry.onAfterDidUpdateContainerConnection(event => {
        expect(event.connection.name).toBe(connection.name);
        expect(event.connection.type).toBe(connection.type);
        expect(event.status).toBe(onAfterDidUpdateContainerConnectionCalled ? 'started' : 'starting');
        onAfterDidUpdateContainerConnectionCalled++;
      });

      await providerRegistry.runAutostart('0');

      expect(onBeforeDidUpdateContainerConnectionCalled).toBe(1);
      expect(onDidUpdateContainerConnectionCalled).toBe(1);
      expect(onAfterDidUpdateContainerConnectionCalled).toBe(1);

      await vi.waitFor(() => {
        expect(onBeforeDidUpdateContainerConnectionCalled).toBe(2);
        expect(onDidUpdateContainerConnectionCalled).toBe(2);
        expect(onAfterDidUpdateContainerConnectionCalled).toBe(2);
      });
    });
  });
});

test('should send events when stopping a container connection', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'connection',
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
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

test('should send events when container connection status change', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'connection',
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'stopped',
    vmType: {
      id: 'libkrun',
      name: 'libkrun',
    },
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  const containerProviderConnection: ContainerProviderConnection = {
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
  };
  provider.registerContainerProviderConnection(containerProviderConnection);

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
  let providerContainerConnectionLifecycleListenerCalled = false;
  providerRegistry.addProviderContainerConnectionLifecycleListener((name, providerInfo, providerConnectionInfo) => {
    expect(name).toBe('provider-container-connection:update-status');
    expect(providerInfo.name).toBe('internal');
    expect(providerConnectionInfo.name).toBe('connection');
    providerContainerConnectionLifecycleListenerCalled = true;
  });
  containerProviderConnection.status = (): ProviderConnectionStatus => 'stopped';
  providerRegistry.onDidChangeContainerProviderConnectionStatus(
    providerRegistry.getMatchingProvider('0'),
    containerProviderConnection,
  );

  expect(providerContainerConnectionLifecycleListenerCalled).toBeTruthy();
  expect(onBeforeDidUpdateContainerConnectionCalled).toBeFalsy();
  expect(onDidUpdateContainerConnectionCalled).toBeTruthy();
  expect(onAfterDidUpdateContainerConnectionCalled).toBeTruthy();
});

test('should send events when stopping a Kubernetes connection', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderKubernetesConnectionInfo = {
    connectionType: 'kubernetes',
    name: 'connection',
    endpoint: {
      apiURL: 'endpoint1',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'stopped',
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  const onDidUpdateKubernetesConnectionMock = vi.fn<(e: UpdateVmConnectionEvent) => void>();

  provider.registerKubernetesProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    endpoint: {
      apiURL: 'endpoint1',
    },
    status() {
      return 'stopped';
    },
  });

  providerRegistry.onDidUpdateKubernetesConnection(onDidUpdateKubernetesConnectionMock);

  await providerRegistry.stopProviderConnection('0', connection);

  expect(stopMock).toBeCalled();
  expect(startMock).not.toBeCalled();
  expect(onDidUpdateKubernetesConnectionMock).toHaveBeenCalledOnce();
  expect(onDidUpdateKubernetesConnectionMock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      connection: expect.objectContaining({
        name: connection.name,
      }),
      status: 'stopped',
    }),
  );
  const event = onDidUpdateKubernetesConnectionMock.mock.calls[0]?.[0];
  expect(event?.connection.status()).toEqual('stopped');
});

test('should send events when stopping a VM connection', async () => {
  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });
  const connection: ProviderVmConnectionInfo = {
    connectionType: 'vm',
    name: 'connection',
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
    status: 'stopped',
  };

  const startMock = vi.fn();
  const stopMock = vi.fn();
  const onDidUpdateVmConnectionMock = vi.fn<(e: UpdateVmConnectionEvent) => void>();

  (provider as ProviderImpl).registerVmProviderConnection({
    name: 'connection',
    lifecycle: {
      start: startMock,
      stop: stopMock,
    },
    status() {
      return 'stopped';
    },
  });

  providerRegistry.onDidUpdateVmConnection(onDidUpdateVmConnectionMock);

  await providerRegistry.stopProviderConnection('0', connection);

  expect(stopMock).toBeCalled();
  expect(startMock).not.toBeCalled();
  expect(onDidUpdateVmConnectionMock).toHaveBeenCalledOnce();
  expect(onDidUpdateVmConnectionMock).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      connection: expect.objectContaining({
        name: connection.name,
      }),
      status: 'stopped',
    }),
  );
  const event = onDidUpdateVmConnectionMock.mock.calls[0]?.[0];
  expect(event?.connection.status()).toEqual('stopped');
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
    connectionType: 'container',
    name: 'connection',
    displayName: 'connection',
    type: 'docker',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
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
  let providerInternalId: string | undefined;

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
  if (providerInternalId) {
    await providerRegistry.initializeProvider(providerInternalId!);

    const connection: ProviderKubernetesConnectionInfo = {
      connectionType: 'kubernetes',
      name: 'connection',
      endpoint: {
        apiURL: 'url',
      },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
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
  } else {
    assert.fail('providerInternalId not initialized');
  }
});

test('should retrieve context of VM provider', async () => {
  let providerInternalId: string | undefined;

  apiSenderSendMock.mockImplementation((_message, data) => {
    providerInternalId = data;
  });

  const provider = providerRegistry.createProvider('id', 'name', {
    id: 'internal',
    name: 'internal',
    status: 'installed',
  });

  let initalizeCalled = false;
  (provider as ProviderImpl).setVmProviderConnectionFactory({
    initialize: async () => {
      initalizeCalled = true;
    },
  });

  expect(providerInternalId).toBeDefined();
  if (providerInternalId) {
    await providerRegistry.initializeProvider(providerInternalId!);

    const connection: ProviderVmConnectionInfo = {
      connectionType: 'vm',
      name: 'connection',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      status: 'stopped',
    };

    const startMock = vi.fn();
    const stopMock = vi.fn();
    (provider as ProviderImpl).registerVmProviderConnection({
      name: 'connection',
      lifecycle: {
        start: startMock,
        stop: stopMock,
      },
      status() {
        return 'stopped';
      },
    });

    const context = providerRegistry.getMatchingConnectionLifecycleContext('0', connection);
    expect(context instanceof LifecycleContextImpl).toBeTruthy();

    expect(initalizeCalled).toBe(true);
    expect(apiSenderSendMock).toBeCalled();
  } else {
    assert.fail('providerInternalId not initialized');
  }
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
  expect(telemetry.track).toBeCalledWith('executeCleanupActions', { success: true });
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
  expect(telemetry.track).toBeCalledWith('executeCleanupActions', { success: false, error: ['Error: fake error'] });
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

test('registerUpdate should not store update when providers.allowUpdate is empty', () => {
  getConfigurationMock.mockReturnValue({ get: () => [] });

  const provider = providerRegistry.createProvider('podman-desktop.podman', 'Podman Desktop', {
    id: 'podman',
    name: 'Podman',
    status: 'installed',
  });

  apiSenderSendMock.mockClear();
  const disposable = providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    { version: '2.0.0', update: vi.fn() } as unknown as ProviderUpdate,
  );

  expect(disposable).toBeDefined();
  expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', {});

  const providerInfo = providerRegistry.getProviderInfos();
  const info = providerInfo.find(p => p.internalId === (provider as unknown as ProviderImpl).internalId);
  expect(info?.updateInfo).toBeUndefined();
});

test('registerUpdate should not store update when extension id is not in providers.allowUpdate', () => {
  getConfigurationMock.mockReturnValue({ get: () => ['podman-desktop.lima'] });

  const provider = providerRegistry.createProvider('podman-desktop.podman', 'Podman Desktop', {
    id: 'podman',
    name: 'Podman',
    status: 'installed',
  });

  apiSenderSendMock.mockClear();
  const disposable = providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    { version: '2.0.0', update: vi.fn() } as unknown as ProviderUpdate,
  );

  expect(disposable).toBeDefined();
  expect(apiSenderSendMock).not.toHaveBeenCalledWith('provider-change', {});

  const providerInfo = providerRegistry.getProviderInfos();
  const info = providerInfo.find(p => p.internalId === (provider as unknown as ProviderImpl).internalId);
  expect(info?.updateInfo).toBeUndefined();
});

test('registerUpdate should store update when extension id is in providers.allowUpdate', () => {
  getConfigurationMock.mockReturnValue({ get: () => ['podman-desktop.podman'] });

  const provider = providerRegistry.createProvider('podman-desktop.podman', 'Podman Desktop', {
    id: 'podman',
    name: 'Podman',
    status: 'installed',
  });

  apiSenderSendMock.mockClear();
  providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    { version: '2.0.0', update: vi.fn() } as unknown as ProviderUpdate,
  );

  expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});

  const providerInfo = providerRegistry.getProviderInfos();
  const info = providerInfo.find(p => p.internalId === (provider as unknown as ProviderImpl).internalId);
  expect(info?.updateInfo?.version).toBe('2.0.0');
});

test('registerUpdate should store update when providers.allowUpdate contains wildcard', () => {
  getConfigurationMock.mockReturnValue({ get: () => ['*'] });

  const provider = providerRegistry.createProvider('podman-desktop.podman', 'Podman Desktop', {
    id: 'podman',
    name: 'Podman',
    status: 'installed',
  });

  apiSenderSendMock.mockClear();
  providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    { version: '2.0.0', update: vi.fn() } as unknown as ProviderUpdate,
  );

  expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});

  const providerInfo = providerRegistry.getProviderInfos();
  const info = providerInfo.find(p => p.internalId === (provider as unknown as ProviderImpl).internalId);
  expect(info?.updateInfo?.version).toBe('2.0.0');
});

test('registerUpdate should store update when providers.allowUpdate is undefined', () => {
  getConfigurationMock.mockReturnValue({ get: () => undefined });

  const provider = providerRegistry.createProvider('podman-desktop.podman', 'Podman Desktop', {
    id: 'podman',
    name: 'Podman',
    status: 'installed',
  });

  apiSenderSendMock.mockClear();
  providerRegistry.registerUpdate(
    provider as unknown as ProviderImpl,
    { version: '2.0.0', update: vi.fn() } as unknown as ProviderUpdate,
  );

  expect(apiSenderSendMock).toHaveBeenCalledWith('provider-change', {});

  const providerInfo = providerRegistry.getProviderInfos();
  const info = providerInfo.find(p => p.internalId === (provider as unknown as ProviderImpl).internalId);
  expect(info?.updateInfo?.version).toBe('2.0.0');
});

test('init should register the providers configuration', () => {
  providerRegistry.init();

  expect(configurationRegistry.registerConfigurations).toHaveBeenCalledWith([
    expect.objectContaining({
      id: 'preferences.providers',
      properties: expect.objectContaining({
        'providers.allowUpdate': expect.objectContaining({
          type: 'array',
          default: ['*'],
          hidden: true,
        }),
      }),
    }),
  ]);
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
  test('return true when check fails with warning severity', async () => {
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
                  successful: false,
                  severity: 'warning',
                  description: 'WSL not enabled',
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
      successful: false,
      severity: 'warning',
      description: 'WSL not enabled',
    });
    expect(run).toBeTruthy();
  });
  test('return false when check fails without severity (backward compat)', async () => {
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
                  successful: false,
                  description: 'hard failure',
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
    const run = await providerRegistry.runPreflightChecks('id', callback, true);
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

  test('if the provider has one VM connection with the start lifecycle, execute the start action', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const startMock = vi.fn();
    (provider as ProviderImpl).registerVmProviderConnection({
      name: 'connection',
      lifecycle: {
        start: startMock,
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
  test('connection without shell access should have falsy info shellAccess', () => {
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
        return 'started';
      },
      vmType: 'libkrun',
    });

    const connections = providerRegistry.getContainerConnections();
    expect(connections).toHaveLength(1);
    assert(connections[0], 'connection should be defined');

    const { shellAccess } = providerRegistry.getProviderContainerConnectionInfo(connections[0].connection);
    expect(shellAccess).toBeFalsy();
  });

  test('connection with shell access should have truthy info shellAccess', () => {
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
      shellAccess: {
        open: vi.fn(),
      },
      status() {
        return 'started';
      },
      vmType: 'libkrun',
    });

    const connections = providerRegistry.getContainerConnections();
    expect(connections).toHaveLength(1);
    assert(connections[0], 'connection should be defined');

    const { shellAccess } = providerRegistry.getProviderContainerConnectionInfo(connections[0].connection);
    expect(shellAccess).toBeTruthy();
  });

  test('check if are all listeners disposed before calling close with container connection', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'connection',
      displayName: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
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

  test('check if are all listeners disposed before calling close with VM connection', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });
    const connection: ProviderVmConnectionInfo = {
      connectionType: 'vm',
      name: 'connection',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      status: 'started',
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

    (provider as ProviderImpl).registerVmProviderConnection({
      name: 'connection',
      lifecycle: {
        start: vi.fn(),
        stop: vi.fn(),
      },
      shellAccess: shellAccess,
      status() {
        return 'started';
      },
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

test('getConnectionFactories should return an empty array if there are no providers', async () => {
  const connectionFactories = providerRegistry.getConnectionFactories();
  expect(connectionFactories).toHaveLength(0);
});

test('getConnectionFactories should return the connection factories', async () => {
  const provider1Images = {
    icon: {
      light: 'a light image 1',
      dark: 'a dark image 1',
    },
    logo: {
      light: 'a light image 1',
      dark: 'a dark image 1',
    },
  } as ProviderImages;
  const provider1 = providerRegistry.createProvider('id', 'name', {
    id: 'provider1',
    name: 'Provider1',
    status: 'installed',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 1',
    images: provider1Images,
  });

  provider1.setContainerProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });
  provider1.setKubernetesProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });
  provider1.setVmProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });

  const provider2Images = {
    icon: {
      light: 'a light image 2',
      dark: 'a dark image 2',
    },
    logo: {
      light: 'a light image 2',
      dark: 'a dark image 2',
    },
  } as ProviderImages;

  const provider2 = providerRegistry.createProvider('id', 'name', {
    id: 'provider2',
    name: 'Provider2',
    status: 'installed',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 2',
    images: provider2Images,
  });
  provider2.setContainerProviderConnectionFactory({
    initialize: async () => {},
    create: async () => {},
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
  });
  const connectionFactories = providerRegistry.getConnectionFactories();
  expect(connectionFactories).toHaveLength(4);
  expect(connectionFactories).toContainEqual({
    type: 'container',
    providerId: 'provider1',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 1',
    images: provider1Images,
  });
  expect(connectionFactories).toContainEqual({
    type: 'kubernetes',
    providerId: 'provider1',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 1',
    images: provider1Images,
  });
  expect(connectionFactories).toContainEqual({
    type: 'vm',
    providerId: 'provider1',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 1',
    images: provider1Images,
  });
  expect(connectionFactories).toContainEqual({
    type: 'container',
    providerId: 'provider2',
    creationDisplayName: 'a creation Display Name',
    creationButtonTitle: 'a creation Button Title',
    emptyConnectionMarkdownDescription: 'an empty connection markdown description for provider 2',
    images: provider2Images,
  });
});

describe('provider connection started property', () => {
  test('started timestamp is set when connection status is started', () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });

    const conn = {
      name: 'connection',
      displayName: 'connection',
      type: 'podman' as const,
      endpoint: { socketPath: '/endpoint.sock' },
      status: (): ProviderConnectionStatus => 'started',
    };
    provider.registerContainerProviderConnection(conn);

    const info = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(info.started).toBeTypeOf('number');
    expect(info.started).toBeGreaterThan(0);
  });

  test('started timestamp is undefined when connection status is stopped', () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    });

    const conn = {
      name: 'connection',
      displayName: 'connection',
      type: 'podman' as const,
      endpoint: { socketPath: '/endpoint.sock' },
      status: (): ProviderConnectionStatus => 'stopped',
    };
    provider.registerContainerProviderConnection(conn);

    const info = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(info.started).toBeUndefined();
  });

  test('handles explicit started property as number, Date, string, and function', () => {
    const fixedEpoch = 1710000000000;
    const fixedIso = '2025-01-01T12:00:00.000Z';
    const fixedDate = new Date(fixedIso);

    // Number
    const connNumber = {
      name: 'conn-num',
      displayName: 'conn-num',
      type: 'podman' as const,
      endpoint: { socketPath: '/1.sock' },
      status: (): ProviderConnectionStatus => 'started',
      started: fixedEpoch,
    };
    expect(providerRegistry.getProviderContainerConnectionInfo(connNumber).started).toBe(fixedEpoch);

    // Date
    const connDate = {
      name: 'conn-date',
      displayName: 'conn-date',
      type: 'podman' as const,
      endpoint: { socketPath: '/2.sock' },
      status: (): ProviderConnectionStatus => 'started',
      started: fixedDate,
    };
    expect(providerRegistry.getProviderContainerConnectionInfo(connDate).started).toBe(fixedDate.getTime());

    // ISO string
    const connString = {
      name: 'conn-str',
      displayName: 'conn-str',
      type: 'podman' as const,
      endpoint: { socketPath: '/3.sock' },
      status: (): ProviderConnectionStatus => 'started',
      started: fixedIso,
    };
    expect(providerRegistry.getProviderContainerConnectionInfo(connString).started).toBe(Date.parse(fixedIso));

    // Function
    const connFn = {
      name: 'conn-fn',
      displayName: 'conn-fn',
      type: 'podman' as const,
      endpoint: { socketPath: '/4.sock' },
      status: (): ProviderConnectionStatus => 'started',
      started: (): number => fixedEpoch,
    };
    expect(providerRegistry.getProviderContainerConnectionInfo(connFn).started).toBe(fixedEpoch);
  });

  test('handles started accessor function throwing an error safely', () => {
    const connThrowing = {
      name: 'conn-throw',
      displayName: 'conn-throw',
      type: 'podman' as const,
      endpoint: { socketPath: '/throw.sock' },
      status: (): ProviderConnectionStatus => 'started',
      started: (): number => {
        throw new Error('Failure accessing start time');
      },
    };
    const info = providerRegistry.getProviderContainerConnectionInfo(connThrowing);
    expect(info.started).toBeTypeOf('number');
    expect(info.started).toBeGreaterThan(0);
  });

  test('kubernetes and vm connections also resolve started', () => {
    const fixedIso = '2025-02-01T10:00:00.000Z';
    const k8sConn = {
      name: 'k8s-1',
      endpoint: { apiURL: 'https://localhost:6443' },
      status: (): ProviderConnectionStatus => 'started',
      started: fixedIso,
    };
    const k8sInfo = providerRegistry.getProviderKubernetesConnectionInfo(k8sConn);
    expect(k8sInfo.started).toBe(Date.parse(fixedIso));

    const vmConn = {
      name: 'vm-1',
      status: (): ProviderConnectionStatus => 'started',
    };
    const vmInfo = providerRegistry.getProviderVmConnectionInfo(vmConn);
    expect(vmInfo.started).toBeTypeOf('number');
  });

  test('startProviderConnection and stopProviderConnection maintain started lifecycle', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    }) as ProviderImpl;

    let currentStatus: ProviderConnectionStatus = 'stopped';
    const conn: ContainerProviderConnection = {
      name: 'lifecycle-conn',
      displayName: 'lifecycle-conn',
      type: 'podman',
      endpoint: { socketPath: '/endpoint.sock' },
      status: () => currentStatus,
      lifecycle: {
        start: async () => {
          currentStatus = 'started';
        },
        stop: async () => {
          currentStatus = 'stopped';
        },
      },
    };
    provider.registerContainerProviderConnection(conn);

    const infoBefore = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(infoBefore.started).toBeUndefined();

    await providerRegistry.startProviderConnection(provider.internalId, infoBefore);
    const infoStarted = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(infoStarted.started).toBeTypeOf('number');

    await providerRegistry.stopProviderConnection(provider.internalId, infoStarted);
    const infoStopped = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(infoStopped.started).toBeUndefined();
  });

  test('preserves fallback started time when stopping a connection fails', async () => {
    const provider = providerRegistry.createProvider('id', 'name', {
      id: 'internal',
      name: 'internal',
      status: 'installed',
    }) as ProviderImpl;
    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);
    const conn: ContainerProviderConnection = {
      name: 'lifecycle-conn',
      displayName: 'lifecycle-conn',
      type: 'podman',
      endpoint: { socketPath: '/endpoint.sock' },
      status: () => 'started',
      lifecycle: {
        stop: async () => {
          throw new Error('stop failed');
        },
      },
    };
    provider.registerContainerProviderConnection(conn);

    const infoStarted = providerRegistry.getProviderContainerConnectionInfo(conn);
    expect(infoStarted.started).toBe(1000);

    dateNow.mockReturnValue(2000);
    await providerRegistry.stopProviderConnection(provider.internalId, infoStarted);

    expect(providerRegistry.getProviderContainerConnectionInfo(conn).started).toBe(1000);
  });
});
