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

import type { Cluster, Context, KubeConfig, User } from '@kubernetes/client-node';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import { KubernetesClient } from './kubernetes-client.js';
import type { Telemetry } from './telemetry/telemetry.js';

// WARNING: Do not import anything from kubernetes-client.spec.ts
// or it will execute the modules mocks from there, incompatibles with tests in this file

class TestKubernetesClient extends KubernetesClient {
  public setClusters(clusters: Cluster[]): void {
    this.kubeConfig.clusters = clusters;
  }
  public setUsers(users: User[]): void {
    this.kubeConfig.users = users;
  }
  public setContexts(contexts: Context[]): void {
    this.kubeConfig.contexts = contexts;
  }
  public getUsers(): User[] {
    return this.kubeConfig.users;
  }
  public setCurrentContext(name: string): void {
    this.currentContextName = name;
  }
}

describe('context tests', () => {
  const originalUsers = [{ name: 'user1' }, { name: 'user2' }];
  const originalClusters = [
    { name: 'cluster1', server: 'server1' },
    { name: 'cluster2', server: 'server2' },
  ];
  const originalContexts = [
    { name: 'ctx1', user: 'user1', cluster: 'cluster1', currentContext: true },
    { name: 'ctx1bis', user: 'user1', cluster: 'cluster1' },
  ];

  let client: TestKubernetesClient;

  const apiSendMock = vi.fn();

  function createClient(): TestKubernetesClient {
    const configurationRegistry: ConfigurationRegistry = {} as unknown as ConfigurationRegistry;
    const fileSystemMonitoring: FilesystemMonitoring = new FilesystemMonitoring();
    const telemetry: Telemetry = {
      track: vi.fn().mockImplementation(async () => {}),
    } as unknown as Telemetry;
    const apiSender: ApiSenderType = {
      send: apiSendMock,
      receive: vi.fn(),
    };

    const client = new TestKubernetesClient(apiSender, configurationRegistry, fileSystemMonitoring, telemetry);

    client.setUsers(originalUsers);
    client.setClusters(originalClusters);
    client.setContexts(originalContexts);

    const currentContext = originalContexts.find(context => context.currentContext);
    if (currentContext) {
      client.setCurrentContext(currentContext.name);
    }

    return client;
  }

  beforeEach(() => {
    client = createClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should delete context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    const contexts = await client.deleteContext(originalContexts[1].name);
    expect(contexts.length).toBe(1);
    expect(contexts[0]).toStrictEqual(originalContexts[0]);
    expect(client.getContexts().length).toBe(1);
    expect(client.getContexts()[0]).toStrictEqual(originalContexts[0]);
    expect(apiSendMock).toHaveBeenCalledTimes(1);
    expect(apiSendMock).toHaveBeenCalledWith('kubernetes-context-update');
  });

  test('should delete context from config and related user and cluster not referenced anymore', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    await client.deleteContext(originalContexts[0].name);
    const contexts = await client.deleteContext(originalContexts[1].name);
    expect(contexts.length).toBe(0);
    expect(client.getContexts().length).toBe(0);
    // user2 is not deleted, as it was already not referenced before
    expect(client.getUsers().length).toBe(1);
    expect(client.getUsers()[0]).toStrictEqual(originalUsers[1]);
    // cluster2 is not deleted, as it was already not referenced before
    expect(client.getClusters().length).toBe(1);
    expect(client.getClusters()[0]).toStrictEqual(originalClusters[1]);
  });

  test('should not delete context if saving to file fails', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {
      throw 'an error';
    });

    await expect(async () => await client.deleteContext(originalContexts[0].name)).rejects.toThrow('an error');
    expect(client.getContexts().length).toBe(2);
    expect(client.getUsers().length).toBe(2);
    expect(client.getClusters().length).toBe(2);
  });

  test('should be a no-op if the context name is not found', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    await client.deleteContext('unknown-context');
    expect(client.getContexts().length).toBe(2);
    expect(client.getUsers().length).toBe(2);
    expect(client.getClusters().length).toBe(2);
  });

  test('should keep the current context name when we delete the context (if not current)', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});
    client.setCurrentContext(originalContexts[0].name);

    await client.deleteContext(originalContexts[1].name);
    expect(client.getCurrentContextName()).toBe(originalContexts[0].name);
  });

  test('test that setContext updates the current context since it also modified the .kube/config file', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    // Set the current context to something else and then check that it is the current context via getCurrentContextName
    await client.setContext(originalContexts[1].name);
    expect(client.getCurrentContextName()).toBe(originalContexts[1].name);

    // We also want to check that it has also been set for currentContext in the detailed contexts retrieval
    const contexts = client.getDetailedContexts();
    // The first context should be false since it is not the current context anymore
    expect(contexts[0].currentContext).toBe(false);
    // The second context should be true since it is the current context
    expect(contexts[1].currentContext).toBe(true);

    expect(apiSendMock).toHaveBeenCalledTimes(1);
    expect(apiSendMock).toHaveBeenCalledWith('kubernetes-context-update');
  });

  test('should delete current context from config and remove current-context', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    const currentContext = client.getCurrentContextName();
    if (!currentContext) throw new Error('currentContext should be defined');

    const contexts = await client.deleteContext(currentContext);
    expect(contexts.length).toBe(1);

    expect(client.getCurrentContextName()).toBeUndefined();
  });
});
