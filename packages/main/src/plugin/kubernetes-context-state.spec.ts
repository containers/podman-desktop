import { expect, test, vi } from 'vitest';
import type { ContextState } from './kubernetes-context-state.js';
import { ContextsState } from './kubernetes-context-state.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ApiSenderType } from './api.js';
import type { Configuration } from '@podman-desktop/api';
import { FakeInformer } from './testutils/fake-informer.js';
import * as kubeclient from '@kubernetes/client-node';

const kubernetesConfigurationGetMock = vi.fn();
const kubernetesConfiguration: Configuration = {
  get: kubernetesConfigurationGetMock,
} as unknown as Configuration;

const configurationRegistryGetConfigurationMock = vi.fn();
const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: configurationRegistryGetConfigurationMock,
} as unknown as ConfigurationRegistry;

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
  receive: vi.fn(),
};

// fakeMakeInformer describes how many resources are in the different namespaces and if cluster is reachable
function fakeMakeInformer(
  kubeconfig: kubeclient.KubeConfig,
  path: string,
  _listPromiseFn: kubeclient.ListPromise<kubeclient.KubernetesObject>,
) {
  let connectResult: Error | undefined;
  switch (kubeconfig.currentContext) {
    case 'context1':
      connectResult = new Error('connection error');
      break;
    default:
      connectResult = undefined;
  }
  switch (path) {
    case '/api/v1/namespaces/ns1/pods':
      return new FakeInformer(1, connectResult);
    case '/api/v1/namespaces/ns2/pods':
      return new FakeInformer(2, connectResult);
    case '/api/v1/namespaces/default/pods':
      return new FakeInformer(9, connectResult);

    case '/apis/apps/v1/namespaces/ns1/deployments':
      return new FakeInformer(11, connectResult);
    case '/apis/apps/v1/namespaces/ns2/deployments':
      return new FakeInformer(12, connectResult);
    case '/apis/apps/v1/namespaces/default/deployments':
      return new FakeInformer(19, connectResult);

    case '/apis/apps/v1/namespaces/ns1/replicasets':
      return new FakeInformer(21, connectResult);
    case '/apis/apps/v1/namespaces/ns2/replicasets':
      return new FakeInformer(22, connectResult);
    case '/apis/apps/v1/namespaces/default/replicasets':
      return new FakeInformer(29, connectResult);
  }
  return new FakeInformer(0, connectResult);
}

vi.mock('@kubernetes/client-node', async importOriginal => {
  const actual = await importOriginal<typeof kubeclient>();
  return {
    ...actual,
    makeInformer: fakeMakeInformer,
  };
});

test('should send info of resources in all reachable contexts and nothing in non reachable', async () => {
  const client = new ContextsState(configurationRegistry, apiSender);
  const kubeConfig = new kubeclient.KubeConfig();
  kubeConfig.loadFromOptions({
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
  });
  kubernetesConfigurationGetMock.mockReturnValue(true);
  configurationRegistryGetConfigurationMock.mockReturnValue(kubernetesConfiguration);
  await client.update(true, kubeConfig);
  let expectedMap = new Map<string, ContextState>();
  expectedMap.set('context1', {
    reachable: false,
    podsCount: 0,
    deploymentsCount: 0,
    replicasetsCount: 0,
  } as ContextState);
  expectedMap.set('context2', {
    reachable: true,
    podsCount: 9,
    deploymentsCount: 19,
    replicasetsCount: 29,
  } as ContextState);
  expectedMap.set('context2-1', {
    reachable: true,
    podsCount: 1,
    deploymentsCount: 11,
    replicasetsCount: 21,
  } as ContextState);
  expectedMap.set('context2-2', {
    reachable: true,
    podsCount: 2,
    deploymentsCount: 12,
    replicasetsCount: 22,
  } as ContextState);
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-state-update', expectedMap);

  // => removing contexts, should remving clusters from sent info
  kubeConfig.loadFromOptions({
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
    ],
    currentContext: 'context2-1',
  });

  vi.clearAllMocks();
  await client.update(true, kubeConfig);
  expectedMap = new Map<string, ContextState>();
  expectedMap.set('context2', {
    reachable: true,
    podsCount: 9,
    deploymentsCount: 19,
    replicasetsCount: 29,
  } as ContextState);
  expectedMap.set('context2-1', {
    reachable: true,
    podsCount: 1,
    deploymentsCount: 11,
    replicasetsCount: 21,
  } as ContextState);
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-state-update', expectedMap);

  // => disabling feature, should send empty map
  vi.clearAllMocks();
  await client.update(false, kubeConfig);
  expectedMap = new Map<string, ContextState>();
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-contexts-state-update', expectedMap);
});
