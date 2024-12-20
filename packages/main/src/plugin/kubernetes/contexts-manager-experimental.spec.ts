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

import type { Cluster, KubernetesObject, ObjectCache } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContextHealthState } from './context-health-checker.js';
import { ContextHealthChecker } from './context-health-checker.js';
import { ContextPermissionsChecker } from './context-permissions-checker.js';
import { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import type { CacheUpdatedEvent, ResourceInformer } from './resource-informer.js';

const onCacheUpdatedMock = vi.fn();
const onOfflineMock = vi.fn();
const startMock = vi.fn();

class TestContextsManagerExperimental extends ContextsManagerExperimental {
  override getResourceFactories(): ResourceFactory[] {
    return [
      new ResourceFactoryBase({
        resource: 'resource1',
      })
        .setPermissions({
          isNamespaced: true,
          permissionsRequests: [
            {
              group: '*',
              resource: '*',
              verb: 'watch',
            },
          ],
        })
        .setInformer({
          createInformer: (_kubeconfig: KubeConfigSingleContext): ResourceInformer<KubernetesObject> => {
            return {
              onCacheUpdated: onCacheUpdatedMock,
              onOffline: onOfflineMock,
              start: startMock,
            } as unknown as ResourceInformer<KubernetesObject>;
          },
        }),
      new ResourceFactoryBase({
        resource: 'resource2',
      }).setPermissions({
        isNamespaced: true,
        permissionsRequests: [
          {
            group: '*',
            resource: '*',
            verb: 'watch',
          },
        ],
      }),
    ];
  }
}

const context1 = {
  name: 'context1',
  cluster: 'cluster1',
  user: 'user1',
  namespace: 'ns1',
};

const kcWithContext1asDefault = {
  contexts: [context1],
  clusters: [
    {
      name: 'cluster1',
    },
  ],
  users: [
    {
      name: 'user1',
    },
  ],
  currentContext: 'context1',
};

const context2 = {
  name: 'context2',
  cluster: 'cluster2',
  user: 'user2',
  namespace: 'ns2',
};
const kcWithContext2asDefault = {
  contexts: [context2],
  clusters: [
    {
      name: 'cluster2',
    },
  ],
  users: [
    {
      name: 'user2',
    },
  ],
  currentContext: 'context2',
};

vi.mock('./context-health-checker.js');
vi.mock('./context-permissions-checker.js');

let kcWith2contexts: KubeConfig;

beforeEach(() => {
  vi.clearAllMocks();
  kcWith2contexts = {
    contexts: [
      {
        name: 'context1',
        cluster: 'cluster1',
        user: 'user1',
        namespace: 'ns1',
      },
      {
        name: 'context2',
        cluster: 'cluster2',
        user: 'user2',
        namespace: 'ns2',
      },
    ],
    clusters: [
      {
        name: 'cluster1',
      } as Cluster,
      {
        name: 'cluster2',
      } as Cluster,
    ],
    users: [
      {
        name: 'user1',
      },
      {
        name: 'user2',
      },
    ],
  } as unknown as KubeConfig;

  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(ContextPermissionsChecker).mockClear();
});

describe('HealthChecker is built and start is called for each context the first time', async () => {
  let kc: KubeConfig;
  let manager: TestContextsManagerExperimental;
  const healthStartMock = vi.fn();
  const healthDisposeMock = vi.fn();
  const onStateChangeMock = vi.fn();
  const onreachableMock = vi.fn();
  const permissionsStartMock = vi.fn();

  beforeEach(async () => {
    kc = new KubeConfig();
    kc.loadFromOptions(kcWith2contexts);

    vi.mocked(ContextHealthChecker).mockImplementation(
      () =>
        ({
          start: healthStartMock,
          dispose: healthDisposeMock,
          onStateChange: onStateChangeMock,
          onReachable: onreachableMock,
        }) as unknown as ContextHealthChecker,
    );

    vi.mocked(ContextPermissionsChecker).mockImplementation(
      () =>
        ({
          start: permissionsStartMock,
          onPermissionResult: vi.fn(),
        }) as unknown as ContextPermissionsChecker,
    );
    manager = new TestContextsManagerExperimental();
  });

  test('when context is not reachable', async () => {
    await manager.update(kc);
    expect(ContextHealthChecker).toHaveBeenCalledTimes(2);
    const kc1 = new KubeConfig();
    kc1.loadFromOptions(kcWithContext1asDefault);
    expect(ContextHealthChecker).toHaveBeenCalledWith(new KubeConfigSingleContext(kc1, context1));
    const kc2 = new KubeConfig();
    kc2.loadFromOptions(kcWithContext2asDefault);
    expect(ContextHealthChecker).toHaveBeenCalledWith(new KubeConfigSingleContext(kc2, context2));
    expect(healthStartMock).toHaveBeenCalledTimes(2);

    expect(healthDisposeMock).not.toHaveBeenCalled();

    expect(ContextPermissionsChecker).not.toHaveBeenCalled();
  });

  test('when context is reachable, persmissions checkers are created and started', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    const kcSingle2 = new KubeConfigSingleContext(kc, context2);
    let call = 0;
    onreachableMock.mockImplementation(f => {
      call++;
      f({
        kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
        contextName: call === 1 ? 'context1' : 'context2',
        checking: false,
        reachable: true,
      } as ContextHealthState);
    });
    await manager.update(kc);

    expect(ContextPermissionsChecker).toHaveBeenCalledTimes(2);
    expect(ContextPermissionsChecker).toHaveBeenCalledWith(kcSingle1, expect.anything());
    expect(ContextPermissionsChecker).toHaveBeenCalledWith(kcSingle2, expect.anything());

    expect(permissionsStartMock).toHaveBeenCalledTimes(2);
  });
});

describe('HealthChecker pass and PermissionsChecker resturns a value', async () => {
  let kc: KubeConfig;
  let manager: TestContextsManagerExperimental;
  const healthStartMock = vi.fn();
  const healthDisposeMock = vi.fn();
  const onStateChangeMock = vi.fn();
  const onreachableMock = vi.fn();
  const permissionsStartMock = vi.fn();
  const onPermissionResultMock = vi.fn();

  beforeEach(async () => {
    kc = new KubeConfig();
    kc.loadFromOptions(kcWith2contexts);

    vi.mocked(ContextHealthChecker).mockImplementation(
      () =>
        ({
          start: healthStartMock,
          dispose: healthDisposeMock,
          onStateChange: onStateChangeMock,
          onReachable: onreachableMock,
        }) as unknown as ContextHealthChecker,
    );

    vi.mocked(ContextPermissionsChecker).mockImplementation(
      () =>
        ({
          start: permissionsStartMock,
          onPermissionResult: onPermissionResultMock,
        }) as unknown as ContextPermissionsChecker,
    );
    manager = new TestContextsManagerExperimental();
  });

  test('informer is started for each resource', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    const kcSingle2 = new KubeConfigSingleContext(kc, context2);
    let call = 0;
    onreachableMock.mockImplementation(f => {
      call++;
      f({
        kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
        contextName: call === 1 ? 'context1' : 'context2',
        checking: false,
        reachable: true,
      } as ContextHealthState);
    });
    onPermissionResultMock.mockImplementation(f =>
      f({
        kubeConfig: kcSingle1,
        resources: ['resource1', 'resource2'],
        permitted: true,
      }),
    );
    await manager.update(kc);
    expect(startMock).toHaveBeenCalledTimes(2); // on resource1 for each context (resource2 does not have informer declared)
  });

  describe('informer is started', async () => {
    let kcSingle1: KubeConfigSingleContext;
    let kcSingle2: KubeConfigSingleContext;
    beforeEach(async () => {
      kcSingle1 = new KubeConfigSingleContext(kc, context1);
      kcSingle2 = new KubeConfigSingleContext(kc, context2);
      let call = 0;
      onreachableMock.mockImplementation(f => {
        call++;
        f({
          kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
          contextName: call === 1 ? 'context1' : 'context2',
          checking: false,
          reachable: call === 1,
        } as ContextHealthState);
      });
      onPermissionResultMock.mockImplementation(f =>
        f({
          kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
          resources: ['resource1', 'resource2'],
          permitted: true,
        }),
      );
    });

    test('cache updated with a change on resource count', async () => {
      onCacheUpdatedMock.mockImplementation(f => {
        f({
          kubeconfig: kcSingle1,
          resourceName: 'resource1',
          countChanged: true,
        } as CacheUpdatedEvent);
      });
      const onResourceUpdatedCB = vi.fn();
      const onResourceCountUpdatedCB = vi.fn();
      manager.onResourceUpdated(onResourceUpdatedCB);
      manager.onResourceCountUpdated(onResourceCountUpdatedCB);
      await manager.update(kc);
      // called twice: on resource1 for each context
      expect(startMock).toHaveBeenCalledTimes(2);
      expect(onResourceUpdatedCB).toHaveBeenCalledTimes(2);
      expect(onResourceCountUpdatedCB).toHaveBeenCalledTimes(2);
    });

    test('cache updated without a change on resource count', async () => {
      onCacheUpdatedMock.mockImplementation(f => {
        f({
          kubeconfig: kcSingle1,
          resourceName: 'resource1',
          countChanged: false,
        } as CacheUpdatedEvent);
      });
      const onResourceUpdatedCB = vi.fn();
      const onResourceCountUpdatedCB = vi.fn();
      manager.onResourceUpdated(onResourceUpdatedCB);
      manager.onResourceCountUpdated(onResourceCountUpdatedCB);
      await manager.update(kc);
      // called twice: on resource1 for each context
      expect(startMock).toHaveBeenCalledTimes(2);
      expect(onResourceUpdatedCB).toHaveBeenCalledTimes(2);
      expect(onResourceCountUpdatedCB).not.toHaveBeenCalled();
    });

    test('getResourcesCount', async () => {
      const listMock = vi.fn();
      startMock.mockReturnValue({
        list: listMock,
        get: vi.fn(),
      } as ObjectCache<KubernetesObject>);
      listMock.mockReturnValue([{}, {}]);
      await manager.update(kc);
      const counts = manager.getResourcesCount();
      expect(counts).toEqual([
        {
          contextName: 'context1',
          resourceName: 'resource1',
          count: 2,
        },
        {
          contextName: 'context2',
          resourceName: 'resource1',
          count: 2,
        },
      ]);
    });
  });
});

test('nothing is done when called again and kubeconfig does not change', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: vi.fn(),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(startMock).mockClear();

  // check it is not called again if kubeconfig does not change
  await manager.update(kc);
  expect(ContextHealthChecker).not.toHaveBeenCalled();
  expect(startMock).not.toHaveBeenCalled();
  expect(disposeMock).not.toHaveBeenCalled();
});

test('HealthChecker is built and start is called for each context being changed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: vi.fn(),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  // check it is called again if kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(startMock).mockClear();

  kcWith2contexts.users[0]!.certFile = 'file';
  kc.loadFromOptions(kcWith2contexts);
  await manager.update(kc);
  expect(disposeMock).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(1);
  expect(startMock).toHaveBeenCalledTimes(1);
});

test('HealthChecker and PermissionsChecker are disposed for each context being removed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const healthStartMock = vi.fn();
  const healthDisposeMock = vi.fn();
  const onStateChangeMock = vi.fn();
  const permissionsStartMock = vi.fn();
  const permissionsDisposeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: healthStartMock,
        dispose: healthDisposeMock,
        onStateChange: onStateChangeMock,
        onReachable: vi.fn().mockImplementation(f =>
          f({
            kubeConfig: {
              getNamespace: vi.fn().mockReturnValue('context2'),
            } as unknown as KubeConfigSingleContext,
            contextName: 'context2',
            checking: false,
            reachable: true,
          } as ContextHealthState),
        ),
      }) as unknown as ContextHealthChecker,
  );

  vi.mocked(ContextPermissionsChecker).mockImplementation(
    () =>
      ({
        start: permissionsStartMock,
        dispose: permissionsDisposeMock,
      }) as unknown as ContextPermissionsChecker,
  );

  await manager.update(kc);

  // check when kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(healthStartMock).mockClear();
  vi.mocked(ContextPermissionsChecker).mockClear();
  vi.mocked(permissionsStartMock).mockClear();
  vi.mocked(permissionsDisposeMock).mockClear();

  const kc1 = {
    contexts: [kcWith2contexts.contexts[0]],
    clusters: [kcWith2contexts.clusters[0]],
    users: [kcWith2contexts.users[0]],
  } as unknown as KubeConfig;
  kc.loadFromOptions(kc1);
  await manager.update(kc);
  expect(healthDisposeMock).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(0);
  expect(healthStartMock).toHaveBeenCalledTimes(0);

  expect(permissionsDisposeMock).toHaveBeenCalledTimes(1);
});

test('getHealthCheckersStates calls getState for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    (kubeConfig: KubeConfigSingleContext) =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: vi.fn(),
        getState: vi.fn().mockImplementation(() => {
          return {
            kubeConfig: new KubeConfigSingleContext(
              kcWith2contexts,
              kubeConfig.getKubeConfig().currentContext === 'context1' ? context1 : context2,
            ),
            contextName: kubeConfig.getKubeConfig().currentContext,
            checking: kubeConfig.getKubeConfig().currentContext === 'context1' ? true : false,
            reachable: false,
          };
        }),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  const result = manager.getHealthCheckersStates();
  const expectedMap = new Map<string, ContextHealthState>();
  expectedMap.set('context1', {
    kubeConfig: new KubeConfigSingleContext(kcWith2contexts, context1),
    contextName: 'context1',
    checking: true,
    reachable: false,
  });
  expectedMap.set('context2', {
    kubeConfig: new KubeConfigSingleContext(kcWith2contexts, context2),
    contextName: 'context2',
    checking: false,
    reachable: false,
  });
  expect(result).toEqual(expectedMap);
});

test('getPermissions calls getPermissions for each permissions checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();
  const onReachableMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: onReachableMock,
        getState: vi.fn(),
      }) as unknown as ContextHealthChecker,
  );

  const kcSingle1 = new KubeConfigSingleContext(kc, context1);
  const kcSingle2 = new KubeConfigSingleContext(kc, context2);
  let call = 0;
  onReachableMock.mockImplementation(f => {
    call++;
    f({
      kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
      contextName: call === 1 ? 'context1' : 'context2',
      checking: false,
      reachable: true,
    } as ContextHealthState);
  });

  const getPermissionsMock = vi.fn();
  vi.mocked(ContextPermissionsChecker).mockImplementation(
    () =>
      ({
        start: vi.fn(),
        getPermissions: getPermissionsMock,
        onPermissionResult: vi.fn(),
      }) as unknown as ContextPermissionsChecker,
  );

  await manager.update(kc);

  manager.getPermissions();
  expect(getPermissionsMock).toHaveBeenCalledTimes(2);
});

test('dispose calls dispose for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: vi.fn(),
      }) as unknown as ContextHealthChecker,
  );

  await manager.update(kc);

  manager.dispose();
  expect(disposeMock).toHaveBeenCalledTimes(2);
});

test('dispose calls dispose for each permissions checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const startMock = vi.fn();
  const disposeMock = vi.fn();
  const onStateChangeMock = vi.fn();
  const onReachableMock = vi.fn();

  vi.mocked(ContextHealthChecker).mockImplementation(
    () =>
      ({
        start: startMock,
        dispose: disposeMock,
        onStateChange: onStateChangeMock,
        onReachable: onReachableMock,
      }) as unknown as ContextHealthChecker,
  );

  const kcSingle1 = new KubeConfigSingleContext(kc, context1);
  const kcSingle2 = new KubeConfigSingleContext(kc, context2);
  let call = 0;
  onReachableMock.mockImplementation(f => {
    call++;
    f({
      kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
      contextName: call === 1 ? 'context1' : 'context2',
      checking: false,
      reachable: true,
    } as ContextHealthState);
  });

  const getPermissionsMock = vi.fn();
  const permissionsDisposeMock = vi.fn();

  vi.mocked(ContextPermissionsChecker).mockImplementation(
    () =>
      ({
        start: vi.fn(),
        getPermissions: getPermissionsMock,
        onPermissionResult: vi.fn(),
        dispose: permissionsDisposeMock,
      }) as unknown as ContextPermissionsChecker,
  );

  await manager.update(kc);

  manager.dispose();
  expect(permissionsDisposeMock).toHaveBeenCalledTimes(2);
});
