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

import type { Event } from '@desktop-framework/extension-api';
import type { Cluster, KubernetesObject, ObjectCache } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContextHealthState } from './context-health-checker.js';
import { ContextHealthChecker } from './context-health-checker.js';
import { ContextPermissionsChecker, type ContextResourcePermission } from './context-permissions-checker.js';
import { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { KubeConfigSingleContext } from './kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import type { CacheUpdatedEvent, OfflineEvent, ResourceInformer } from './resource-informer.js';

const onCacheUpdatedMock = vi.fn<Event<CacheUpdatedEvent>>();
const onOfflineMock = vi.fn<Event<OfflineEvent>>();
const startInformerMock = vi.fn();
const informerDisposeMock = vi.fn();

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
              start: startInformerMock,
              dispose: informerDisposeMock,
            } as unknown as ResourceInformer<KubernetesObject>;
          },
        })
        .setIsActive((resource: KubernetesObject): boolean => {
          return 'activeField' in resource && resource.activeField === true;
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
      new ResourceFactoryBase({
        resource: 'resource3',
      }).setPermissions({
        isNamespaced: false,
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

  public override async startMonitoring(config: KubeConfigSingleContext, contextName: string): Promise<void> {
    return super.startMonitoring(config, contextName);
  }

  public override stopMonitoring(contextName: string): void {
    return super.stopMonitoring(contextName);
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

vi.mock(import('./context-health-checker.js'), () => ({
  ContextHealthChecker: vi.fn(
    class {
      contextName: string;
      constructor(kubeConfig: KubeConfigSingleContext) {
        this.contextName = kubeConfig.getKubeConfig().currentContext;
      }
    },
  ) as unknown as typeof ContextHealthChecker,
}));
/**
 * During the test we need to know which constructor kubeConfig an instance of ContextPermissionsChecker has received
 * This is verified using the context name
 */
vi.mock(import('./context-permissions-checker.js'), () => ({
  ContextPermissionsChecker: vi.fn(
    class {
      contextName: string;
      constructor(_kubeconfig: KubeConfigSingleContext, contextName: string) {
        this.contextName = contextName;
      }
    },
  ) as unknown as typeof ContextPermissionsChecker,
}));

let kcWith2contexts: KubeConfig;

beforeEach(() => {
  vi.resetAllMocks();
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
    currentContext: 'context1',
  } as unknown as KubeConfig;

  // mock ContextHealthChecker prototype
  vi.mocked(ContextHealthChecker.prototype).onReachable = vi.fn();
  vi.mocked(ContextHealthChecker.prototype).onStateChange = vi.fn();
  vi.mocked(ContextHealthChecker.prototype).start = vi.fn();
  vi.mocked(ContextHealthChecker.prototype).dispose = vi.fn();
  vi.mocked(ContextHealthChecker.prototype).getState = vi.fn();

  // adding event properties on prototypes
  vi.mocked(ContextPermissionsChecker.prototype).onPermissionResult = vi.fn();
  vi.mocked(ContextPermissionsChecker.prototype).start = vi.fn();
  vi.mocked(ContextPermissionsChecker.prototype).dispose = vi.fn();
  vi.mocked(ContextPermissionsChecker.prototype).getPermissions = vi.fn();
});

describe('HealthChecker is built and start is called for each context the first time', async () => {
  let kc: KubeConfig;
  let manager: TestContextsManagerExperimental;

  beforeEach(async () => {
    kc = new KubeConfig();
    kc.loadFromOptions(kcWith2contexts);

    manager = new TestContextsManagerExperimental();
  });

  test('when context is not reachable', async () => {
    await manager.update(kc);
    expect(ContextHealthChecker).toHaveBeenCalledTimes(1); // current context only
    const kc1 = new KubeConfig();
    kc1.loadFromOptions(kcWithContext1asDefault);
    expect(ContextHealthChecker).toHaveBeenCalledWith(new KubeConfigSingleContext(kc1, context1));
    const kc2 = new KubeConfig();
    kc2.loadFromOptions(kcWithContext2asDefault);
    expect(ContextHealthChecker).toHaveBeenCalledWith(new KubeConfigSingleContext(kc2, context2));
    expect(ContextHealthChecker.prototype.start).toHaveBeenCalledTimes(1);

    expect(ContextHealthChecker.prototype.dispose).not.toHaveBeenCalled();

    expect(ContextPermissionsChecker).not.toHaveBeenCalled();
  });

  test('when context is reachable, persmissions checkers are created and started', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    const kcSingle2 = new KubeConfigSingleContext(kc, context2);
    let call = 0;
    vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
      call++;
      f({
        kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
        contextName: call === 1 ? 'context1' : 'context2',
        checking: false,
        reachable: true,
      } as ContextHealthState);
      return {
        dispose: vi.fn(),
      };
    });
    await manager.update(kc);

    // Once for namespaced resources, once for non-namespaced resources (on current context only)
    expect(ContextPermissionsChecker).toHaveBeenCalledTimes(2);
    expect(ContextPermissionsChecker).toHaveBeenCalledWith(kcSingle1, 'context1', expect.anything());

    expect(ContextPermissionsChecker.prototype.start).toHaveBeenCalledTimes(2);
    return {
      dispose: vi.fn(),
    };
  });
});

describe('HealthChecker pass and PermissionsChecker resturns a value', async () => {
  let kc: KubeConfig;
  let manager: TestContextsManagerExperimental;

  beforeEach(async () => {
    kc = new KubeConfig();
    kc.loadFromOptions(kcWith2contexts);

    manager = new TestContextsManagerExperimental();
  });

  test('permissions are correctly dispatched', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    let permissionCall = 0;
    vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
      f({
        kubeConfig: kcSingle1,
        contextName: 'context1',
        checking: false,
        reachable: true,
      } as ContextHealthState);
      return {
        dispose: vi.fn(),
      };
    });
    vi.mocked(ContextPermissionsChecker.prototype.onPermissionResult).mockImplementation(f => {
      permissionCall++;
      switch (permissionCall) {
        case 1:
        case 2:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource1', 'resource2'],
            permitted: true,
            attrs: {},
          });
          break;
        case 3:
        case 4:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource3'],
            permitted: true,
            attrs: {},
          });
          break;
      }
      return {
        dispose: vi.fn(),
      };
    });
    const permissions1: ContextResourcePermission[] = [
      {
        contextName: 'context1',
        resourceName: 'resource1',
        attrs: {},
        permitted: true,
      },
      {
        contextName: 'context1',
        resourceName: 'resource2',
        attrs: {},
        permitted: true,
      },
    ];
    const permissions2: ContextResourcePermission[] = [
      {
        contextName: 'context1',
        resourceName: 'resource3',
        attrs: {},
        permitted: true,
      },
    ];
    let getPermissionsCall = 0;
    vi.mocked(ContextPermissionsChecker.prototype.getPermissions).mockImplementation(() => {
      getPermissionsCall++;
      switch (getPermissionsCall) {
        case 1:
          return permissions1;
        case 2:
          return permissions2;
      }
      return [];
    });

    await manager.update(kc);
    const permissions = manager.getPermissions();
    expect(permissions).toEqual([...permissions1, ...permissions2]);
  });

  test('informer is started for each resource', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    const kcSingle2 = new KubeConfigSingleContext(kc, context2);
    let call = 0;
    let permissionCall = 0;
    vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
      call++;
      f({
        kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
        contextName: call === 1 ? 'context1' : 'context2',
        checking: false,
        reachable: true,
      } as ContextHealthState);
      return {
        dispose: vi.fn(),
      };
    });
    vi.mocked(ContextPermissionsChecker.prototype.onPermissionResult).mockImplementation(f => {
      permissionCall++;
      switch (permissionCall) {
        case 1:
        case 2:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource1', 'resource2'],
            permitted: true,
            attrs: {},
          });
          break;
        case 3:
        case 4:
          f({
            kubeConfig: kcSingle2,
            resources: ['resource1', 'resource2'],
            permitted: true,
            attrs: {},
          });
          break;
        case 5:
        case 6:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource3'],
            permitted: true,
            attrs: {},
          });
          break;
        case 7:
        case 8:
          f({
            kubeConfig: kcSingle2,
            resources: ['resource3'],
            permitted: true,
            attrs: {},
          });
          break;
      }
      return {
        dispose: vi.fn(),
      };
    });
    await manager.update(kc);
    expect(startInformerMock).toHaveBeenCalledTimes(2); // on resource1 for each context (resource2 and resource3 do not have informer declared)
  });

  test('informer is started for permitted resources only', async () => {
    const kcSingle1 = new KubeConfigSingleContext(kc, context1);
    const kcSingle2 = new KubeConfigSingleContext(kc, context2);
    let call = 0;
    let permissionCall = 0;
    vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
      call++;
      f({
        kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
        contextName: call === 1 ? 'context1' : 'context2',
        checking: false,
        reachable: true,
      } as ContextHealthState);
      return {
        dispose: vi.fn(),
      };
    });
    vi.mocked(ContextPermissionsChecker.prototype.onPermissionResult).mockImplementation(f => {
      permissionCall++;
      switch (permissionCall) {
        case 1:
        case 2:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource1', 'resource2'],
            permitted: true,
            attrs: {},
          });
          break;
        case 3:
        case 4:
          f({
            kubeConfig: kcSingle2,
            resources: ['resource1', 'resource2'],
            permitted: false,
            attrs: {},
          });
          break;
        case 5:
        case 6:
          f({
            kubeConfig: kcSingle1,
            resources: ['resource3'],
            permitted: true,
            attrs: {},
          });
          break;
        case 7:
        case 8:
          f({
            kubeConfig: kcSingle2,
            resources: ['resource3'],
            permitted: true,
            attrs: {},
          });
          break;
      }
      return {
        dispose: vi.fn(),
      };
    });
    await manager.update(kc);
    expect(startInformerMock).toHaveBeenCalledTimes(1); // on resource1 for context1 only (resource2 and resource3 do not have informer declared;, and resource1 is not permitted in context2)
  });

  describe('informer is started', async () => {
    let kcSingle1: KubeConfigSingleContext;
    let kcSingle2: KubeConfigSingleContext;
    beforeEach(async () => {
      kcSingle1 = new KubeConfigSingleContext(kc, context1);
      kcSingle2 = new KubeConfigSingleContext(kc, context2);
      let call = 0;
      let permissionCall = 0;
      vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
        call++;
        f({
          kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
          contextName: call === 1 ? 'context1' : 'context2',
          checking: false,
          reachable: call === 1,
        } as ContextHealthState);
        return {
          dispose: vi.fn(),
        };
      });
      vi.mocked(ContextPermissionsChecker.prototype.onPermissionResult).mockImplementation(f => {
        permissionCall++;
        switch (permissionCall) {
          case 1:
          case 2:
            f({
              kubeConfig: kcSingle1,
              resources: ['resource1', 'resource2'],
              permitted: true,
              attrs: {},
            });
            break;
          case 3:
          case 4:
            f({
              kubeConfig: kcSingle2,
              resources: ['resource1', 'resource2'],
              permitted: true,
              attrs: {},
            });
            break;
          case 5:
          case 6:
            f({
              kubeConfig: kcSingle1,
              resources: ['resource3'],
              permitted: true,
              attrs: {},
            });
            break;
          case 7:
          case 8:
            f({
              kubeConfig: kcSingle2,
              resources: ['resource3'],
              permitted: true,
              attrs: {},
            });
            break;
        }
        return {
          dispose: vi.fn(),
        };
      });
    });

    test('cache updated with a change on resource count', async () => {
      onCacheUpdatedMock.mockImplementation(f => {
        f({
          kubeconfig: kcSingle1,
          resourceName: 'resource1',
          countChanged: true,
        } as CacheUpdatedEvent);
        return {
          dispose: (): void => {},
        };
      });
      const onResourceUpdatedCB = vi.fn();
      const onResourceCountUpdatedCB = vi.fn();
      manager.onResourceUpdated(onResourceUpdatedCB);
      manager.onResourceCountUpdated(onResourceCountUpdatedCB);
      await manager.update(kc);
      // called twice: on resource1 for each context
      expect(startInformerMock).toHaveBeenCalledTimes(2);
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
        return {
          dispose: (): void => {},
        };
      });
      const onResourceUpdatedCB = vi.fn();
      const onResourceCountUpdatedCB = vi.fn();
      manager.onResourceUpdated(onResourceUpdatedCB);
      manager.onResourceCountUpdated(onResourceCountUpdatedCB);
      await manager.update(kc);
      // called twice: on resource1 for each context
      expect(startInformerMock).toHaveBeenCalledTimes(2);
      expect(onResourceUpdatedCB).toHaveBeenCalledTimes(2);
      expect(onResourceCountUpdatedCB).not.toHaveBeenCalled();
    });

    test('getResourcesCount', async () => {
      const listMock = vi.fn();
      startInformerMock.mockReturnValue({
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

    test('getActiveResourcesCount', async () => {
      const listMock = vi.fn();
      startInformerMock.mockReturnValue({
        list: listMock,
        get: vi.fn(),
      } as ObjectCache<KubernetesObject>);
      listMock.mockReturnValue([
        {
          activeField: true,
        },
        {
          activeField: false,
        },
      ]);
      await manager.update(kc);
      const counts = manager.getActiveResourcesCount();
      expect(counts).toEqual([
        {
          contextName: 'context1',
          resourceName: 'resource1',
          count: 1,
        },
        {
          contextName: 'context2',
          resourceName: 'resource1',
          count: 1,
        },
      ]);
    });

    test('getResources', async () => {
      const listMock = vi.fn();
      startInformerMock.mockReturnValue({
        list: listMock,
        get: vi.fn(),
      } as ObjectCache<KubernetesObject>);
      listMock.mockReturnValueOnce([{ metadata: { name: 'obj1' } }]);
      listMock.mockReturnValueOnce([{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }]);
      await manager.update(kc);
      const resources = manager.getResources(['context1', 'context2'], 'resource1');
      expect(resources).toEqual([
        {
          contextName: 'context1',
          items: [{ metadata: { name: 'obj1' } }],
        },
        {
          contextName: 'context2',
          items: [{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }],
        },
      ]);
    });

    test('one offline informer clears all caches', async () => {
      const listMock = vi.fn();
      startInformerMock.mockReturnValue({
        list: listMock,
        get: vi.fn(),
      } as ObjectCache<KubernetesObject>);
      listMock.mockReturnValueOnce([{ metadata: { name: 'obj1' } }]);
      listMock.mockReturnValueOnce([{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }]);
      await manager.update(kc);
      const resources = manager.getResources(['context1', 'context2'], 'resource1');
      // At this point, resources are in caches for both contexts
      expect(resources).toEqual([
        {
          contextName: 'context1',
          items: [{ metadata: { name: 'obj1' } }],
        },
        {
          contextName: 'context2',
          items: [{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }],
        },
      ]);

      expect(onOfflineMock).toHaveBeenCalledTimes(2);
      const onOfflineCB = onOfflineMock.mock.calls[0]?.[0];
      assert(onOfflineCB);

      // Let's declare informer for resource1 in context1 offline
      onOfflineCB({
        kubeconfig: kcSingle1,
        resourceName: 'resource1',
        offline: true,
        reason: 'because',
      });

      listMock.mockReturnValueOnce([{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }]);
      const resourcesAfter = manager.getResources(['context1', 'context2'], 'resource1');

      // Caches for context1 are removed
      expect(resourcesAfter).toEqual([
        {
          contextName: 'context2',
          items: [{ metadata: { name: 'obj2' } }, { metadata: { name: 'obj3' } }],
        },
      ]);

      // Let's declare informer for resource1 in context2 offline
      onOfflineCB({
        kubeconfig: kcSingle2,
        resourceName: 'resource1',
        offline: true,
        reason: 'because',
      });

      const resourcesAfter2 = manager.getResources(['context1', 'context2'], 'resource1');

      // Caches for context1 are removed
      expect(resourcesAfter2).toEqual([]);
    });
  });
});

test('nothing is done when called again and kubeconfig does not change', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  await manager.update(kc);

  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(ContextHealthChecker.prototype.start).mockClear();

  // check it is not called again if kubeconfig does not change
  await manager.update(kc);
  expect(ContextHealthChecker).not.toHaveBeenCalled();
  expect(ContextHealthChecker.prototype.start).not.toHaveBeenCalled();
  expect(ContextHealthChecker.prototype.dispose).not.toHaveBeenCalled();
});

test('HealthChecker is built and start is called for each context being changed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  await manager.update(kc);

  // check it is called again if kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(ContextHealthChecker.prototype.start).mockClear();

  kcWith2contexts.users[0]!.certFile = 'file';
  kc.loadFromOptions(kcWith2contexts);
  await manager.update(kc);
  expect(ContextHealthChecker.prototype.dispose).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker.prototype.start).toHaveBeenCalledTimes(1);
});

test('HealthChecker, PermissionsChecker and informers are disposed for each context being removed', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
    f({
      kubeConfig: {
        getNamespace: vi.fn().mockReturnValue(kcWith2contexts.currentContext),
      } as unknown as KubeConfigSingleContext,
      contextName: kcWith2contexts.currentContext,
      checking: false,
      reachable: true,
    });
    return {
      dispose: vi.fn(),
    };
  });

  vi.mocked(ContextPermissionsChecker.prototype.onPermissionResult).mockImplementation(function (
    this: ContextPermissionsChecker,
    f,
  ) {
    f({
      permitted: true,
      resources: ['resource1'],
      kubeConfig: new KubeConfigSingleContext(kcWith2contexts, this.contextName === 'context1' ? context1 : context2),
      attrs: {},
    });
    return {
      dispose: vi.fn(),
    };
  });

  await manager.update(kc);

  // check when kubeconfig changes
  vi.mocked(ContextHealthChecker).mockClear();
  vi.mocked(ContextHealthChecker.prototype.start).mockClear();
  vi.mocked(ContextPermissionsChecker).mockClear();
  vi.mocked(ContextPermissionsChecker.prototype.start).mockClear();
  vi.mocked(ContextPermissionsChecker.prototype.dispose).mockClear();

  // we remove context1 from kubeconfig
  const kc1 = {
    contexts: [kcWith2contexts.contexts[1]],
    clusters: [kcWith2contexts.clusters[1]],
    users: [kcWith2contexts.users[1]],
    currentContext: undefined,
  } as unknown as KubeConfig;
  kc.loadFromOptions(kc1);
  await manager.update(kc);
  expect(ContextHealthChecker.prototype.dispose).toHaveBeenCalledTimes(1);
  expect(ContextHealthChecker).toHaveBeenCalledTimes(0);
  expect(ContextHealthChecker.prototype.start).toHaveBeenCalledTimes(0);

  expect(ContextPermissionsChecker.prototype.dispose).toHaveBeenCalledTimes(2); // one for namespaced, one for non-namespaced

  expect(informerDisposeMock).toHaveBeenCalledTimes(1); // for resource1 on context1
});

test('getHealthCheckersStates calls getState for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  // TODO: cleanup
  vi.mocked(ContextHealthChecker.prototype.getState).mockImplementation(function (this: ContextHealthChecker) {
    return {
      kubeConfig: new KubeConfigSingleContext(kcWith2contexts, this.contextName === 'context1' ? context1 : context2),
      contextName: this.contextName,
      checking: this.contextName === 'context1' ? true : false,
      reachable: false,
    };
  });

  await manager.update(kc);

  const result = manager.getHealthCheckersStates();
  const expectedMap = new Map<string, ContextHealthState>();
  expectedMap.set('context1', {
    kubeConfig: new KubeConfigSingleContext(kcWith2contexts, context1),
    contextName: 'context1',
    checking: true,
    reachable: false,
  });
  expect(result).toEqual(expectedMap);
});

test('getPermissions calls getPermissions for each permissions checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const kcSingle1 = new KubeConfigSingleContext(kc, context1);
  const kcSingle2 = new KubeConfigSingleContext(kc, context2);
  let call = 0;
  vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
    call++;
    f({
      kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
      contextName: call === 1 ? 'context1' : 'context2',
      checking: false,
      reachable: true,
    } as ContextHealthState);
    return {
      dispose: vi.fn(),
    };
  });

  await manager.update(kc);

  manager.getPermissions();
  expect(ContextPermissionsChecker.prototype.getPermissions).toHaveBeenCalledTimes(2);
});

test('dispose calls dispose for each health checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  await manager.update(kc);

  manager.dispose();
  expect(ContextHealthChecker.prototype.dispose).toHaveBeenCalledTimes(1);
});

test('dispose calls dispose for each permissions checker', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();

  const kcSingle1 = new KubeConfigSingleContext(kc, context1);
  const kcSingle2 = new KubeConfigSingleContext(kc, context2);
  let call = 0;

  vi.mocked(ContextHealthChecker.prototype.onReachable).mockImplementation(f => {
    call++;
    f({
      kubeConfig: call === 1 ? kcSingle1 : kcSingle2,
      contextName: call === 1 ? 'context1' : 'context2',
      checking: false,
      reachable: true,
    } as ContextHealthState);
    return {
      dispose: vi.fn(),
    };
  });

  await manager.update(kc);

  manager.dispose();
  expect(ContextPermissionsChecker.prototype.dispose).toHaveBeenCalledTimes(2);
});

test('only current context is monitored', async () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const manager = new TestContextsManagerExperimental();
  vi.spyOn(manager, 'startMonitoring');
  vi.spyOn(manager, 'stopMonitoring');
  await manager.update(kc);
  expect(manager.startMonitoring).toHaveBeenCalledWith(expect.anything(), 'context1');

  // change current context from context1 to context2
  vi.mocked(manager.startMonitoring).mockClear();
  vi.mocked(manager.stopMonitoring).mockClear();
  const kcWith2contextsChangeCurrent = {
    ...kcWith2contexts,
    currentContext: 'context2',
  };
  kc.loadFromOptions(kcWith2contextsChangeCurrent);
  await manager.update(kc);
  expect(manager.stopMonitoring).toHaveBeenCalledWith('context1');
  expect(manager.startMonitoring).toHaveBeenCalledWith(expect.anything(), 'context2');

  // no more current context
  vi.mocked(manager.startMonitoring).mockClear();
  vi.mocked(manager.stopMonitoring).mockClear();
  const kcWith2contextsNoCurrent = {
    ...kcWith2contexts,
    currentContext: undefined,
  };
  kc.loadFromOptions(kcWith2contextsNoCurrent);
  await manager.update(kc);
  expect(manager.stopMonitoring).toHaveBeenCalledWith('context2');
  expect(manager.startMonitoring).not.toHaveBeenCalled();
});
