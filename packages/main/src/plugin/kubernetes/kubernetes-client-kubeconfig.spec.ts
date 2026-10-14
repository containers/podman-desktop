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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Cluster, Context, KubeConfig, User } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ExperimentalConfigurationManager } from '/@/plugin/experimental-configuration-manager.js';
import type { FeatureRegistry } from '/@/plugin/feature-registry.js';
import { FilesystemMonitoring } from '/@/plugin/filesystem-monitoring.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import { KubernetesClient } from './kubernetes-client.js';

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
  public setCurrentContext(name: string): void {
    this.currentContextName = name;
  }
}

describe('context tests', () => {
  const originalUsers = [{ name: 'user1' }, { name: 'user2' }];
  const originalClusters = [
    { name: 'cluster1', server: 'server1' } as Cluster,
    { name: 'cluster2', server: 'server2' } as Cluster,
  ];
  const originalContexts = [
    { name: 'ctx1', user: 'user1', cluster: 'cluster1', currentContext: true, namespace: 'namespace1' },
    { name: 'ctx1bis', user: 'user1', cluster: 'cluster1' },
  ];

  let client: TestKubernetesClient;

  const apiSendMock = vi.fn();
  const experimentalConfigurationManager: ExperimentalConfigurationManager = {
    isExperimentalConfigurationEnabled: vi.fn(),
  } as unknown as ExperimentalConfigurationManager;
  const featureRegistry: FeatureRegistry = {} as unknown as FeatureRegistry;

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

    const client = new TestKubernetesClient(
      apiSender,
      configurationRegistry,
      fileSystemMonitoring,
      telemetry,
      experimentalConfigurationManager,
      featureRegistry,
    );

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
    vi.resetAllMocks();
    client = createClient();
  });

  test('should delete context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[1]?.name) {
      throw new Error('originalContexts[1].name should be defined');
    }

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

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.deleteContext(originalContexts[0].name);

    if (!originalContexts[1]?.name) {
      throw new Error('originalContexts[1].name should be defined');
    }

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
      throw new Error('an error');
    });

    const originalContextName = originalContexts[0]?.name;
    if (!originalContextName) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await expect(async () => await client.deleteContext(originalContextName)).rejects.toThrow('an error');
    expect(client.getContexts().length).toBe(2);
    expect(client.getUsers().length).toBe(2);
    expect(client.getClusters().length).toBe(2);
  });

  test('should duplicate context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.duplicateContext(originalContexts[0].name);
    let contexts = client.getContexts();
    expect(contexts.length).toBe(3);
    expect(client.getContexts().length).toBe(3);

    await client.duplicateContext(originalContexts[0].name);
    contexts = client.getContexts();
    expect(contexts.length).toBe(4);
    expect(client.getContexts().length).toBe(4);
  });

  test('should create unique context name', () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    let newContextName = client.findNewContextName(originalContexts[0].name);
    expect(newContextName).toBe('ctx1-1');

    const newContext1 = { name: 'ctx1-1', user: 'user1', cluster: 'cluster1', currentContext: true };
    const newContext2 = { name: 'ctx1-2', user: 'user1', cluster: 'cluster1', currentContext: true };
    client.setContexts([newContext1]);

    newContextName = client.findNewContextName(originalContexts[0].name);
    expect(newContextName).toBe('ctx1-2');

    client.setContexts([newContext2]);

    newContextName = client.findNewContextName(newContext2.name);
    expect(newContextName).toBe('ctx1-2-1');

    newContextName = client.findNewContextName(newContextName);
    expect(newContextName).toBe('ctx1-2-1-1');
  });

  test('should update context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.updateContext(originalContexts[0].name, 'new-name', 'new-namespace', '', '');
    const contexts = client.getContexts();
    expect(contexts.length).toBe(2);
    expect(client.getContexts().length).toBe(2);

    if (!contexts[0]?.name) {
      throw new Error('contexts[0].name should be defined');
    }

    expect(contexts[0].name).toBe('new-name');
    expect(contexts[0].namespace).toBe('new-namespace');
  });

  test('should remove the namespace when updating context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.updateContext(originalContexts[0].name, originalContexts[0].name, '', '', '');
    const contexts = client.getContexts();
    expect(contexts.length).toBe(2);
    expect(client.getContexts().length).toBe(2);

    if (!contexts[0]?.name) {
      throw new Error('contexts[0].name should be defined');
    }

    expect(contexts[0].name).toBe(originalContexts[0].name);
    expect(contexts[0].namespace).toBeUndefined();
  });

  test('should update the cluster updating context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.updateContext(originalContexts[0].name, originalContexts[0].name, 'namespace', 'cluster2', 'user1');
    const contexts = client.getContexts();
    expect(contexts.length).toBe(2);
    expect(client.getContexts().length).toBe(2);

    if (!contexts[0]?.name) {
      throw new Error('contexts[0].name should be defined');
    }

    expect(contexts[0].cluster).toBe('cluster2');
  });

  test('should update the user updating context from config', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }

    await client.updateContext(originalContexts[0].name, originalContexts[0].name, 'namespace', 'cluster1', 'user2');
    const contexts = client.getContexts();
    expect(contexts.length).toBe(2);
    expect(client.getContexts().length).toBe(2);

    if (!contexts[0]?.name) {
      throw new Error('contexts[0].name should be defined');
    }

    expect(contexts[0].user).toBe('user2');
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

    if (!originalContexts[0]?.name) {
      throw new Error('originalContexts[0].name should be defined');
    }
    if (!originalContexts[1]?.name) {
      throw new Error('originalContexts[1].name should be defined');
    }

    client.setCurrentContext(originalContexts[0].name);

    await client.deleteContext(originalContexts[1].name);
    expect(client.getCurrentContextName()).toBe(originalContexts[0].name);
  });

  test('test that setContext updates the current context since it also modified the .kube/config file', async () => {
    client.saveKubeConfig = vi.fn().mockImplementation((_config: KubeConfig) => {});

    if (!originalContexts[1]) {
      throw new Error('originalContexts[1] should be defined');
    }

    // Set the current context to something else and then check that it is the current context via getCurrentContextName
    await client.setContext(originalContexts[1].name);
    expect(client.getCurrentContextName()).toBe(originalContexts[1].name);

    // We also want to check that it has also been set for currentContext in the detailed contexts retrieval
    const contexts = client.getDetailedContexts();
    // The first context should be false since it is not the current context anymore
    expect(contexts[0]?.currentContext).toBe(false);
    // The second context should be true since it is the current context
    expect(contexts[1]?.currentContext).toBe(true);

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
