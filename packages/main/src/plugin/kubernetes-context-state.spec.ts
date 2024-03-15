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

import type { ErrorCallback, KubernetesObject, ObjectCallback } from '@kubernetes/client-node';
import * as kubeclient from '@kubernetes/client-node';
import { KubeConfig, makeInformer } from '@kubernetes/client-node';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import type { ContextGeneralState, ResourceName } from './kubernetes-context-state.js';
import { ContextsManager, ContextsStates } from './kubernetes-context-state.js';

interface InformerEvent {
  delayMs: number;
  verb: string;
  object: KubernetesObject;
}

interface InformerErrorEvent {
  delayMs: number;
  verb: string;
  error: string;
}

const informerStopMock = vi.fn();

export class FakeInformer {
  private onCb: Map<string, ObjectCallback<KubernetesObject>>;
  private offCb: Map<string, ObjectCallback<KubernetesObject>>;
  private onErrorCb: Map<string, ErrorCallback>;

  constructor(
    private contextName: string,
    private path: string,
    private resourcesCount: number,
    private connectResponse: Error | undefined,
    private events: InformerEvent[],
    private errorEvents: InformerErrorEvent[],
  ) {
    this.onCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.offCb = new Map<string, ObjectCallback<KubernetesObject>>();
    this.onErrorCb = new Map<string, ErrorCallback>();
  }
  async start(): Promise<void> {
    this.onErrorCb.get('connect')?.();
    if (this.connectResponse) {
      this.onErrorCb.get('error')?.(this.connectResponse);
    }
    if (this.connectResponse === undefined) {
      for (let i = 0; i < this.resourcesCount; i++) {
        this.onCb.get('add')?.({});
      }
      this.events.forEach(event => {
        setTimeout(() => {
          this.onCb.get(event.verb)?.(event.object);
        }, event.delayMs);
      });
      this.errorEvents.forEach(event => {
        setTimeout(() => {
          this.onErrorCb.get(event.verb)?.(event.error);
        }, event.delayMs);
      });
    }
  }
  async stop(): Promise<void> {
    informerStopMock(this.contextName, this.path);
  }
  on(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ): void {
    switch (verb) {
      case 'error':
      case 'connect':
        this.onErrorCb.set(verb, cb as ErrorCallback);
        break;
      default:
        this.onCb.set(verb, cb as ObjectCallback<KubernetesObject>);
    }
  }
  off(
    verb: 'change' | 'add' | 'update' | 'delete' | 'error' | 'connect',
    cb: ErrorCallback | ObjectCallback<KubernetesObject>,
  ): void {
    this.offCb.set(verb, cb);
  }
  get(): KubernetesObject {
    return {};
  }

  list(): KubernetesObject[] {
    return [];
  }
}

const PODS_NS1 = 1;
const PODS_NS2 = 2;
const PODS_DEFAULT = 3;
const DEPLOYMENTS_NS1 = 4;
const DEPLOYMENTS_NS2 = 5;
const DEPLOYMENTS_DEFAULT = 6;

// fakeMakeInformer describes how many resources are in the different namespaces and if cluster is reachable
function fakeMakeInformer(
  kubeconfig: kubeclient.KubeConfig,
  path: string,
  _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
): kubeclient.Informer<kubeclient.KubernetesObject> & kubeclient.ObjectCache<kubeclient.KubernetesObject> {
  let connectResult: Error | undefined;

  const buildFakeInformer = (quantity: number): FakeInformer =>
    new FakeInformer(kubeconfig.currentContext, path, quantity, connectResult, [], []);

  switch (kubeconfig.currentContext) {
    case 'context1':
      connectResult = new Error('connection error');
      break;
    default:
      connectResult = undefined;
  }
  switch (path) {
    case '/api/v1/namespaces/ns1/pods':
      return buildFakeInformer(PODS_NS1);
    case '/api/v1/namespaces/ns2/pods':
      return buildFakeInformer(PODS_NS2);
    case '/api/v1/namespaces/default/pods':
      return buildFakeInformer(PODS_DEFAULT);

    case '/apis/apps/v1/namespaces/ns1/deployments':
      return buildFakeInformer(DEPLOYMENTS_NS1);
    case '/apis/apps/v1/namespaces/ns2/deployments':
      return buildFakeInformer(DEPLOYMENTS_NS2);
    case '/apis/apps/v1/namespaces/default/deployments':
      return buildFakeInformer(DEPLOYMENTS_DEFAULT);
  }
  return buildFakeInformer(0);
}

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
  receive: vi.fn(),
};

vi.mock('@kubernetes/client-node', async importOriginal => {
  const actual = await importOriginal<typeof kubeclient>();
  return {
    ...actual,
    makeInformer: vi.fn(),
  };
});

// Needs to mock these values to make the backoff much longer than other timeouts, so connection are never retried during the tests
vi.mock('./kubernetes-context-state-constants.js', () => {
  return {
    connectTimeout: 1,
    backoffInitialValue: 10000,
    backoffLimit: 1000,
    backoffJitter: 0,
    dispatchTimeout: 1,
  };
});

const originalConsoleDebug = console.debug;
const consoleDebugMock = vi.fn();

beforeEach(() => {
  console.debug = consoleDebugMock;
  vi.useFakeTimers();
});

afterEach(() => {
  console.debug = originalConsoleDebug;
  vi.resetAllMocks();
});

describe('update', async () => {
  let client: ContextsManager;

  afterEach(() => {
    client?.dispose();
  });
  test('should send info of resources in all reachable contexts and nothing in non reachable', async () => {
    vi.mocked(makeInformer).mockImplementation(fakeMakeInformer);
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
        {
          name: 'cluster2',
          server: 'server2',
        },
      ],
      users: [
        {
          name: 'user1',
        },
        {
          name: 'user2',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
        },
        {
          name: 'context2',
          cluster: 'cluster2',
          user: 'user2',
        },
        {
          name: 'context2-1',
          cluster: 'cluster2',
          user: 'user2',
          namespace: 'ns1',
        },
        {
          name: 'context2-2',
          cluster: 'cluster2',
          user: 'user2',
          namespace: 'ns2',
        },
      ],
      currentContext: 'context2-1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    let expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: false,
      error: 'Error: connection error',
      resources: {
        pods: 0,
        deployments: 0,
      },
    } as ContextGeneralState);
    expectedMap.set('context2', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_DEFAULT,
        deployments: DEPLOYMENTS_DEFAULT,
      },
    } as ContextGeneralState);
    expectedMap.set('context2-1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_NS1,
        deployments: DEPLOYMENTS_NS1,
      },
    } as ContextGeneralState);
    expectedMap.set('context2-2', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_NS2,
        deployments: DEPLOYMENTS_NS2,
      },
    } as ContextGeneralState);
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_NS1,
        deployments: DEPLOYMENTS_NS1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', Array(PODS_NS1).fill({}));
    expect(apiSenderSendMock).toHaveBeenCalledWith(
      'kubernetes-current-context-deployments-update',
      Array(DEPLOYMENTS_NS1).fill({}),
    );

    // switching to unreachable context
    kubeConfig.loadFromOptions({
      clusters: config.clusters,
      users: config.users,
      contexts: config.contexts,
      currentContext: 'context1',
    });

    apiSenderSendMock.mockReset();
    await client.update(kubeConfig);

    vi.advanceTimersToNextTimer();
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: false,
      error: 'Error: connection error',
      resources: {
        pods: 0,
        deployments: 0,
      },
    });
    // no pods/deployment are sent, as the context is not reachable
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', []);

    // => removing context, should remove context from sent info
    kubeConfig.loadFromOptions({
      clusters: config.clusters,
      users: config.users,
      contexts: config.contexts.filter(ctx => ctx.name !== 'context2-2'),
      currentContext: 'context2-1',
    });

    apiSenderSendMock.mockReset();
    await client.update(kubeConfig);
    expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: false,
      error: 'Error: connection error',
      resources: {
        pods: 0,
        deployments: 0,
      },
    } as ContextGeneralState);
    expectedMap.set('context2', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_DEFAULT,
        deployments: DEPLOYMENTS_DEFAULT,
      },
    } as ContextGeneralState);
    expectedMap.set('context2-1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_NS1,
        deployments: DEPLOYMENTS_NS1,
      },
    } as ContextGeneralState);

    vi.advanceTimersToNextTimer();
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: PODS_NS1,
        deployments: DEPLOYMENTS_NS1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', Array(PODS_NS1).fill({}));
    expect(apiSenderSendMock).toHaveBeenCalledWith(
      'kubernetes-current-context-deployments-update',
      Array(DEPLOYMENTS_NS1).fill({}),
    );
  });

  test('should write logs when connection fails', async () => {
    vi.mocked(makeInformer).mockImplementation(fakeMakeInformer);
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    kubeConfig.loadFromOptions({
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
        },
      ],
      currentContext: 'context1',
    });
    await client.update(kubeConfig);
    expect(consoleDebugMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /Trying to watch pods on the kubernetes context named "context1" but got a connection refused, retrying the connection in [0-9]*s. Error: connection error/,
      ),
    );
  });

  test('should send new deployment when a new one is created', async () => {
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = undefined;
        switch (path) {
          case '/api/v1/namespaces/ns1/pods':
            return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
          case '/apis/apps/v1/namespaces/ns1/deployments':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [
                {
                  delayMs: 5,
                  verb: 'add',
                  object: { metadata: { name: 'deploy1' } },
                },
              ],
              [],
            );
        }
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer(); // reachable
    vi.advanceTimersToNextTimer(); // add
    vi.advanceTimersToNextTimer(); // reachable now
    const expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 0,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 0,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', []);

    apiSenderSendMock.mockReset();
    vi.advanceTimersToNextTimer(); // add event
    vi.advanceTimersToNextTimer(); // dispatches
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledTimes(3);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [
      { metadata: { name: 'deploy1' } },
    ]);
  });

  test('should delete deployment when deleted from context', async () => {
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = undefined;
        switch (path) {
          case '/api/v1/namespaces/ns1/pods':
            return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
          case '/apis/apps/v1/namespaces/ns1/deployments':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [
                {
                  delayMs: 0,
                  verb: 'add',
                  object: { metadata: { uid: 'deploy1' } },
                },
                {
                  delayMs: 0,
                  verb: 'add',
                  object: { metadata: { uid: 'deploy2' } },
                },
                {
                  delayMs: 5,
                  verb: 'delete',
                  object: { metadata: { uid: 'deploy1' } },
                },
              ],
              [],
            );
        }
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer(); // add events
    vi.advanceTimersToNextTimer(); // reachable
    vi.advanceTimersToNextTimer(); // delete
    const expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [
      { metadata: { uid: 'deploy1' } },
      { metadata: { uid: 'deploy2' } },
    ]);

    apiSenderSendMock.mockReset();
    vi.advanceTimersToNextTimer(); // 'delete' event
    vi.advanceTimersToNextTimer(); // dispatches

    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledTimes(3);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 1,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [
      { metadata: { uid: 'deploy2' } },
    ]);
  });

  test('should update deployment when updated on context', async () => {
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = undefined;
        switch (path) {
          case '/api/v1/namespaces/ns1/pods':
            return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
          case '/apis/apps/v1/namespaces/ns1/deployments':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [
                {
                  delayMs: 0,
                  verb: 'add',
                  object: { metadata: { uid: 'deploy1', name: 'name1' } },
                },
                {
                  delayMs: 0,
                  verb: 'add',
                  object: { metadata: { uid: 'deploy2', name: 'name2' } },
                },
                {
                  delayMs: 5,
                  verb: 'update',
                  object: { metadata: { uid: 'deploy1', name: 'name1new' } },
                },
              ],
              [],
            );
        }
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer(); // add events
    vi.advanceTimersToNextTimer(); // reachable
    vi.advanceTimersToNextTimer(); // update
    const expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [
      { metadata: { uid: 'deploy1', name: 'name1' } },
      { metadata: { uid: 'deploy2', name: 'name2' } },
    ]);

    apiSenderSendMock.mockReset();
    vi.advanceTimersToNextTimer(); // update event
    vi.advanceTimersToNextTimer(); // dispatches
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledTimes(3);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [
      { metadata: { uid: 'deploy2', name: 'name2' } },
      { metadata: { uid: 'deploy1', name: 'name1new' } },
    ]);
  });

  test('should send appropriate data when context becomes unreachable', async () => {
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = undefined;
        switch (path) {
          case '/api/v1/namespaces/ns1/pods':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [],
              [
                {
                  delayMs: 5,
                  verb: 'error',
                  error: 'connection error',
                },
              ],
            );
          case '/apis/apps/v1/namespaces/ns1/deployments':
            return new FakeInformer(kubeconfig.currentContext, path, 2, connectResult, [], []);
        }
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer(); // add deployments
    vi.advanceTimersToNextTimer(); // dispatches
    vi.advanceTimersToNextTimer(); // reachable now
    const expectedMap = new Map<string, ContextGeneralState>();
    expectedMap.set('context1', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: true,
      error: undefined,
      resources: {
        pods: 0,
        deployments: 2,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', [{}, {}]);

    apiSenderSendMock.mockReset();
    vi.advanceTimersToNextTimer(); // error event
    vi.advanceTimersToNextTimer(); // dispatches
    vi.advanceTimersToNextTimer(); // reachable now
    // This time, we do not check the number of calls, as the connection will be retried, and calls will be done after each retry
    expectedMap.set('context1', {
      reachable: false,
      error: 'connection error',
      resources: {
        pods: 0,
        deployments: 0,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
      reachable: false,
      error: 'connection error',
      resources: {
        pods: 0,
        deployments: 0,
      },
    });
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', []);
  });

  const secondaryInformers = [
    {
      resource: 'services',
      informerPath: '/api/v1/namespaces/ns1/services',
    },
    {
      resource: 'ingresses',
      informerPath: '/apis/networking.k8s.io/v1/namespaces/ns1/ingresses',
    },
    {
      resource: 'routes',
      informerPath: '/apis/route.openshift.io/v1/namespaces/ns1/routes',
    },
  ];

  function createInformer(
    kubeConfig: kubeclient.KubeConfig,
    client: ContextsManager,
    ctx: kubeclient.Context | undefined,
    resource: string,
  ): void {
    switch (resource) {
      case 'services':
        client.createServiceInformer(kubeConfig, 'ns1', ctx!);
        break;
      case 'ingresses':
        client.createIngressInformer(kubeConfig, 'ns1', ctx!);
        break;
      case 'routes':
        client.createRouteInformer(kubeConfig, 'ns1', ctx!);
        break;
    }
  }

  describe.each(secondaryInformers)(`Secondary informer $resource`, ({ resource, informerPath }) => {
    test('createInformer should send data for added resource', async () => {
      vi.useFakeTimers();
      vi.mocked(makeInformer).mockImplementation(
        (
          kubeconfig: kubeclient.KubeConfig,
          path: string,
          _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
        ) => {
          const connectResult = undefined;
          switch (path) {
            case informerPath:
              return new FakeInformer(kubeconfig.currentContext, path, 1, connectResult, [], []);
          }
          return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
        },
      );
      client = new ContextsManager(apiSender);
      const kubeConfig = new kubeclient.KubeConfig();
      const config = {
        clusters: [
          {
            name: 'cluster1',
            server: 'server1',
          },
        ],
        users: [
          {
            name: 'user1',
          },
        ],
        contexts: [
          {
            name: 'context1',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns1',
          },
        ],
        currentContext: 'context1',
      };
      kubeConfig.loadFromOptions(config);
      await client.update(kubeConfig);
      const ctx = kubeConfig.contexts.find(c => c.name === 'context1');
      expect(ctx).not.toBeUndefined();
      createInformer(kubeConfig, client, ctx, resource);
      vi.advanceTimersToNextTimer();
      vi.advanceTimersToNextTimer();
      vi.advanceTimersToNextTimer();
      const expectedMap = new Map<string, ContextGeneralState>();
      expectedMap.set('context1', {
        reachable: true,
        error: undefined,
        resources: {
          pods: 0,
          deployments: 0,
        },
      });
      expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expectedMap);
      expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-general-state-update', {
        reachable: true,
        resources: {
          pods: 0,
          deployments: 0,
        },
      });
      expect(apiSenderSendMock).toHaveBeenCalledWith(`kubernetes-current-context-${resource}-update`, [{}]);
    });

    test('createInformer should send data for deleted and updated resource', async () => {
      vi.useFakeTimers();
      vi.mocked(makeInformer).mockImplementation(
        (
          kubeconfig: kubeclient.KubeConfig,
          path: string,
          _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
        ) => {
          const connectResult = undefined;
          switch (path) {
            case informerPath:
              return new FakeInformer(
                kubeconfig.currentContext,
                path,
                0,
                connectResult,
                [
                  {
                    delayMs: 100,
                    verb: 'add',
                    object: { metadata: { uid: 'svc1' } },
                  },
                  {
                    delayMs: 200,
                    verb: 'add',
                    object: { metadata: { uid: 'svc2' } },
                  },
                  {
                    delayMs: 300,
                    verb: 'delete',
                    object: { metadata: { uid: 'svc1' } },
                  },
                  {
                    delayMs: 400,
                    verb: 'update',
                    object: { metadata: { uid: 'svc2', name: 'name2' } },
                  },
                ],
                [],
              );
          }
          return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
        },
      );
      client = new ContextsManager(apiSender);
      const kubeConfig = new kubeclient.KubeConfig();
      const config = {
        clusters: [
          {
            name: 'cluster1',
            server: 'server1',
          },
        ],
        users: [
          {
            name: 'user1',
          },
        ],
        contexts: [
          {
            name: 'context1',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns1',
          },
        ],
        currentContext: 'context1',
      };
      kubeConfig.loadFromOptions(config);
      await client.update(kubeConfig);
      const ctx = kubeConfig.contexts.find(c => c.name === 'context1');
      expect(ctx).not.toBeUndefined();
      createInformer(kubeConfig, client, ctx, resource);
      vi.advanceTimersByTime(120);
      expect(apiSenderSendMock).toHaveBeenCalledWith(`kubernetes-current-context-${resource}-update`, [
        { metadata: { uid: 'svc1' } },
      ]);

      apiSenderSendMock.mockReset();
      vi.advanceTimersByTime(100);
      expect(apiSenderSendMock).toHaveBeenCalledTimes(1); // do not send general information
      expect(apiSenderSendMock).toHaveBeenCalledWith(`kubernetes-current-context-${resource}-update`, [
        { metadata: { uid: 'svc1' } },
        { metadata: { uid: 'svc2' } },
      ]);

      apiSenderSendMock.mockReset();
      vi.advanceTimersByTime(100);
      expect(apiSenderSendMock).toHaveBeenCalledTimes(1);
      expect(apiSenderSendMock).toHaveBeenCalledWith(`kubernetes-current-context-${resource}-update`, [
        { metadata: { uid: 'svc2' } },
      ]);

      apiSenderSendMock.mockReset();
      vi.advanceTimersByTime(100);
      expect(apiSenderSendMock).toHaveBeenCalledTimes(1);
      expect(apiSenderSendMock).toHaveBeenCalledWith(`kubernetes-current-context-${resource}-update`, [
        { metadata: { uid: 'svc2', name: 'name2' } },
      ]);
    });

    test('update should not start informer', async () => {
      const makeInformerMock = vi.mocked(makeInformer);
      makeInformerMock.mockImplementation(
        (
          kubeconfig: kubeclient.KubeConfig,
          path: string,
          _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
        ) => {
          const connectResult = undefined;
          switch (path) {
            case informerPath:
              return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
          }
          return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
        },
      );
      client = new ContextsManager(apiSender);
      const kubeConfig = new kubeclient.KubeConfig();
      const config = {
        clusters: [
          {
            name: 'cluster1',
            server: 'server1',
          },
        ],
        users: [
          {
            name: 'user1',
          },
        ],
        contexts: [
          {
            name: 'context1',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns1',
          },
        ],
        currentContext: 'context1',
      };
      kubeConfig.loadFromOptions(config);
      await client.update(kubeConfig);
      // makeInformer is called for pod and deployment only
      expect(makeInformerMock).toHaveBeenCalledTimes(2);
      expect(makeInformerMock).toHaveBeenCalledWith(
        expect.any(KubeConfig),
        '/apis/apps/v1/namespaces/ns1/deployments',
        expect.anything(),
      );
      expect(makeInformerMock).toHaveBeenCalledWith(
        expect.any(KubeConfig),
        '/api/v1/namespaces/ns1/pods',
        expect.anything(),
      );
    });

    test('calling registerGetCurrentContextResources should start informer, the first time only', async () => {
      vi.useFakeTimers();
      const makeInformerMock = vi.mocked(makeInformer);
      makeInformerMock.mockImplementation(
        (
          kubeconfig: kubeclient.KubeConfig,
          path: string,
          _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
        ) => {
          return new FakeInformer(kubeconfig.currentContext, path, 0, undefined, [], []);
        },
      );
      client = new ContextsManager(apiSender);
      const kubeConfig = new kubeclient.KubeConfig();
      const config = {
        clusters: [
          {
            name: 'cluster1',
            server: 'server1',
          },
        ],
        users: [
          {
            name: 'user1',
          },
        ],
        contexts: [
          {
            name: 'context1',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns1',
          },
        ],
        currentContext: 'context1',
      };
      kubeConfig.loadFromOptions(config);
      await client.update(kubeConfig);
      vi.advanceTimersToNextTimer();

      makeInformerMock.mockClear();
      client.registerGetCurrentContextResources(resource as ResourceName);
      expect(makeInformerMock).toHaveBeenCalledTimes(1);
      expect(makeInformerMock).toHaveBeenCalledWith(expect.any(KubeConfig), informerPath, expect.anything());

      makeInformerMock.mockClear();
      client.registerGetCurrentContextResources(resource as ResourceName);
      expect(makeInformerMock).not.toHaveBeenCalled();
    });

    test('changing context should stop informer on previous current context and clear state', async () => {
      vi.useFakeTimers();
      const makeInformerMock = vi.mocked(makeInformer);
      makeInformerMock.mockImplementation(
        (
          kubeconfig: kubeclient.KubeConfig,
          path: string,
          _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
        ) => {
          return new FakeInformer(kubeconfig.currentContext, path, 1, undefined, [], []);
        },
      );
      client = new ContextsManager(apiSender);
      const kubeConfig = new kubeclient.KubeConfig();
      const config = {
        clusters: [
          {
            name: 'cluster1',
            server: 'server1',
          },
        ],
        users: [
          {
            name: 'user1',
          },
        ],
        contexts: [
          {
            name: 'context1',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns1',
          },
          {
            name: 'context2',
            cluster: 'cluster1',
            user: 'user1',
            namespace: 'ns2',
          },
        ],
        currentContext: 'context1',
      };
      kubeConfig.loadFromOptions(config);
      await client.update(kubeConfig);
      vi.advanceTimersToNextTimer();

      makeInformerMock.mockClear();

      // informer is started
      client.registerGetCurrentContextResources(resource as ResourceName);
      expect(makeInformerMock).toHaveBeenCalledTimes(1);
      expect(makeInformerMock).toHaveBeenCalledWith(expect.any(KubeConfig), informerPath, expect.anything());

      expect(client.getContextResources('context1', resource as ResourceName).length).toBe(1);

      makeInformerMock.mockClear();

      config.currentContext = 'context2';
      kubeConfig.loadFromOptions(config);

      expect(informerStopMock).not.toHaveBeenCalled();

      await client.update(kubeConfig);

      expect(informerStopMock).toHaveBeenCalledTimes(1);
      expect(informerStopMock).toHaveBeenCalledWith('context1', informerPath);
      expect(client.getContextResources('context1', resource as ResourceName).length).toBe(0);
    });
  });

  test('changing context should start service informer on current context if watchers have subscribed', async () => {
    vi.useFakeTimers();
    const makeInformerMock = vi.mocked(makeInformer);
    makeInformerMock.mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        return new FakeInformer(kubeconfig.currentContext, path, 0, undefined, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
        {
          name: 'context2',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns2',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();

    makeInformerMock.mockClear();

    // service informer is started
    client.registerGetCurrentContextResources('services');
    expect(makeInformerMock).toHaveBeenCalledTimes(1);
    expect(makeInformerMock).toHaveBeenCalledWith(
      expect.any(KubeConfig),
      '/api/v1/namespaces/ns1/services',
      expect.anything(),
    );

    makeInformerMock.mockClear();

    config.currentContext = 'context2';
    kubeConfig.loadFromOptions(config);

    expect(informerStopMock).not.toHaveBeenCalled();

    await client.update(kubeConfig);

    expect(informerStopMock).toHaveBeenCalledTimes(1);
    expect(informerStopMock).toHaveBeenCalledWith('context1', '/api/v1/namespaces/ns1/services');
    expect(makeInformerMock).toHaveBeenCalledTimes(1);
    expect(makeInformerMock).toHaveBeenCalledWith(
      expect.any(KubeConfig),
      '/api/v1/namespaces/ns2/services',
      expect.anything(),
    );
  });

  test('changing context should not start service informer on current context if no watchers have subscribed', async () => {
    vi.useFakeTimers();
    const makeInformerMock = vi.mocked(makeInformer);
    makeInformerMock.mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        return new FakeInformer(kubeconfig.currentContext, path, 0, undefined, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
        {
          name: 'context2',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns2',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    vi.advanceTimersToNextTimer();
    vi.advanceTimersToNextTimer();

    makeInformerMock.mockClear();

    // service informer is started
    client.registerGetCurrentContextResources('services');
    expect(makeInformerMock).toHaveBeenCalledTimes(1);
    expect(makeInformerMock).toHaveBeenCalledWith(
      expect.any(KubeConfig),
      '/api/v1/namespaces/ns1/services',
      expect.anything(),
    );

    makeInformerMock.mockClear();

    config.currentContext = 'context2';
    kubeConfig.loadFromOptions(config);

    expect(informerStopMock).not.toHaveBeenCalled();

    client.unregisterGetCurrentContextResources('services');

    await client.update(kubeConfig);

    expect(informerStopMock).toHaveBeenCalledTimes(1);
    expect(informerStopMock).toHaveBeenCalledWith('context1', '/api/v1/namespaces/ns1/services');
    expect(makeInformerMock).not.toHaveBeenCalled();
  });

  test('should not ignore events sent a short time before', async () => {
    vi.useFakeTimers();
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = undefined;
        switch (path) {
          case '/apis/networking.k8s.io/v1/namespaces/ns1/ingresses':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [
                {
                  delayMs: 1,
                  verb: 'add',
                  object: {},
                },
              ],
              [],
            );
          case '/api/v1/namespaces/ns1/services':
            return new FakeInformer(
              kubeconfig.currentContext,
              path,
              0,
              connectResult,
              [
                {
                  delayMs: 2,
                  verb: 'add',
                  object: {},
                },
              ],
              [],
            );
        }
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
        {
          name: 'context2',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns2',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    client.registerGetCurrentContextResources('services');
    client.registerGetCurrentContextResources('ingresses');
    await client.update(kubeConfig);
    vi.advanceTimersByTime(20);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-general-state-update', expect.anything());
    expect(apiSenderSendMock).toHaveBeenCalledWith(
      'kubernetes-current-context-general-state-update',
      expect.anything(),
    );
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-pods-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-deployments-update', []);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-services-update', [{}]);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-ingresses-update', [{}]);
    expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-current-context-routes-update', []);
  });

  test('dispose', async () => {
    vi.useFakeTimers();
    vi.mocked(makeInformer).mockImplementation(
      (
        kubeconfig: kubeclient.KubeConfig,
        path: string,
        _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
      ) => {
        const connectResult = new Error('err');
        return new FakeInformer(kubeconfig.currentContext, path, 0, connectResult, [], []);
      },
    );
    client = new ContextsManager(apiSender);
    const kubeConfig = new kubeclient.KubeConfig();
    const config = {
      clusters: [
        {
          name: 'cluster1',
          server: 'server1',
        },
      ],
      users: [
        {
          name: 'user1',
        },
      ],
      contexts: [
        {
          name: 'context1',
          cluster: 'cluster1',
          user: 'user1',
          namespace: 'ns1',
        },
      ],
      currentContext: 'context1',
    };
    kubeConfig.loadFromOptions(config);
    await client.update(kubeConfig);
    expect(vi.getTimerCount()).not.toBe(0);
    client.dispose();
    vi.advanceTimersByTime(20000);
    expect(apiSenderSendMock).not.toHaveBeenCalled();
  });
});

describe('ContextsStates tests', () => {
  test('hasInformer should check if informer exists for context', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(client.hasInformer('context1', 'pods')).toBeTruthy();
    expect(client.hasInformer('context1', 'deployments')).toBeFalsy();
    expect(client.hasInformer('context2', 'pods')).toBeFalsy();
    expect(client.hasInformer('context2', 'deployments')).toBeFalsy();
  });

  test('getContextsNames should return the names of contexts as array', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.setInformers(
      'context2',
      new Map([['pods', new FakeInformer('context2', '/path/to/resource', 0, undefined, [], [])]]),
    );
    expect(Array.from(client.getContextsNames())).toEqual(['context1', 'context2']);
  });

  test('isReachable', () => {
    const client = new ContextsStates();
    client.setInformers(
      'context1',
      new Map([['pods', new FakeInformer('context1', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.setInformers(
      'context2',
      new Map([['pods', new FakeInformer('context2', '/path/to/resource', 0, undefined, [], [])]]),
    );
    client.safeSetState('context1', state => (state.reachable = true));

    expect(client.isReachable('context1')).toBeTruthy();
    expect(client.isReachable('context2')).toBeFalsy();
    expect(client.isReachable('context3')).toBeFalsy();
  });
});
