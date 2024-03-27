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

import * as fs from 'node:fs';
import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import type { Readable, Writable } from 'node:stream';

import {
  Exec,
  KubeConfig,
  type KubernetesObject,
  type V1Deployment,
  type V1Ingress,
  type V1Service,
  type V1Status,
  type Watch,
} from '@kubernetes/client-node';
import * as clientNode from '@kubernetes/client-node';
import type { FileSystemWatcher } from '@podman-desktop/api';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { ResizableTerminalWriter } from '/@/plugin/kubernetes-exec-transmitter.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import type { ApiSenderType } from './api.js';
import type { V1Route } from './api/openshift-types.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import { KubernetesClient } from './kubernetes-client.js';

const configurationRegistry: ConfigurationRegistry = {} as unknown as ConfigurationRegistry;
const fileSystemMonitoring: FilesystemMonitoring = new FilesystemMonitoring();
const telemetry: Telemetry = {
  track: vi.fn().mockImplementation(async () => {
    // do nothing
  }),
} as unknown as Telemetry;
const makeApiClientMock = vi.fn();
const getContextObjectMock = vi.fn();

const podAndDeploymentTestYAML = `apiVersion: v1
kind: Pod
metadata:
  name: my-pod
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-deployment
  template:
    metadata:
      labels:
        app: my-deployment
    spec:
      containers:
      - name: my-deployment
        image: my-deployment-image
        ports:
        - containerPort: 80
`;

class TestKubernetesClient extends KubernetesClient {
  public createWatchObject(): Watch {
    return super.createWatchObject();
  }

  public setCurrentNamespace(namespace: string): void {
    this.currentNamespace = namespace;
  }
}

function createTestClient(namespace?: string): TestKubernetesClient {
  const client = new TestKubernetesClient(apiSender, configurationRegistry, fileSystemMonitoring, telemetry);
  if (namespace) {
    client.setCurrentNamespace(namespace);
  }
  return client;
}

const apiSenderSendMock = vi.fn();
const apiSender: ApiSenderType = {
  send: apiSenderSendMock,
  receive: vi.fn(),
};

const execMock = vi.fn();
beforeAll(() => {
  vi.mock('@kubernetes/client-node', async () => {
    return {
      KubeConfig: vi.fn(),
      CoreV1Api: {},
      AppsV1Api: {},
      CustomObjectsApi: {},
      NetworkingV1Api: {},
      VersionApi: {},
      makeInformer: vi.fn(),
      KubernetesObjectApi: vi.fn(),
      HttpError: class HttpError extends Error {
        statusCode: number;
        constructor(statusCode: number, message: string) {
          super(message);
          this.statusCode = statusCode;
        }
      },
      Exec: vi.fn(),
      V1DeleteOptions: vi.fn(),
    };
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  KubeConfig.prototype.loadFromFile = vi.fn();
  KubeConfig.prototype.makeApiClient = makeApiClientMock;
  KubeConfig.prototype.getContextObject = getContextObjectMock;
  KubeConfig.prototype.currentContext = 'context';
  Exec.prototype.exec = execMock;
});

test('Create Kubernetes resources with empty should return ok', async () => {
  const client = createTestClient();
  await client.createResources('dummy', []);
  expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', { action: 'create', manifestsSize: 0 });
});

test('Create Kubernetes resources with v1 resource should return ok', async () => {
  const client = createTestClient();
  const readMock = vi.fn().mockRejectedValue(new Error('ResourceDoesntExistError'));
  const createMock = vi.fn().mockReturnValue({});
  makeApiClientMock.mockReturnValue({
    read: readMock,
    create: createMock,
  });
  await client.createResources('dummy', [{ apiVersion: 'v1', kind: 'Namespace' }]);
  expect(createMock).toHaveBeenCalled();
  expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', { action: 'create', manifestsSize: 1 });
});

describe.each([
  { manifest: { apiVersion: 'apps/v1', kind: 'Deployment' }, namespace: undefined, expectedNamespace: 'default' },
  { manifest: { apiVersion: 'apps/v1', kind: 'Deployment' }, namespace: 'defaultns', expectedNamespace: 'defaultns' },
  {
    manifest: { apiVersion: 'apps/v1', kind: 'Deployment', metadata: { namespace: 'demons' } },
    namespace: undefined,
    expectedNamespace: 'demons',
  },
])(
  'Create Kubernetes resources with apps/v1 resource should return ok',
  ({ manifest, namespace, expectedNamespace }) => {
    test(`should use namespace ${expectedNamespace}`, async () => {
      const client = createTestClient();
      const readMock = vi.fn().mockRejectedValue(new Error('ResourceDoesntExistError'));
      const createMock = vi.fn().mockReturnValue({});
      makeApiClientMock.mockReturnValue({
        read: readMock,
        create: createMock,
      });

      await client.createResources('dummy', [manifest], namespace);
      expect(readMock).toHaveBeenCalled();
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: expect.objectContaining({ namespace: expectedNamespace }) }),
      );
      expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
        action: 'create',
        manifestsSize: 1,
        namespace: namespace,
      });
    });
  },
);

describe.each([
  {
    manifest: { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress' },
    namespace: undefined,
    expectedNamespace: 'default',
  },
  {
    manifest: { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress' },
    namespace: 'defaultns',
    expectedNamespace: 'defaultns',
  },
  {
    manifest: { apiVersion: 'networking.k8s.io/v1', kind: 'Ingress', metadata: { namespace: 'demons' } },
    namespace: undefined,
    expectedNamespace: 'demons',
  },
])(
  'Create Kubernetes resources with networking.k8s.io/v1 resource should return ok',
  ({ manifest, namespace, expectedNamespace }) => {
    test(`should use namespace ${expectedNamespace}`, async () => {
      const client = createTestClient();
      const readMock = vi.fn().mockRejectedValue(new Error('ResourceDoesntExistError'));
      const createMock = vi.fn().mockReturnValue({});
      makeApiClientMock.mockReturnValue({
        read: readMock,
        create: createMock,
      });

      await client.createResources('dummy', [manifest], namespace);
      expect(readMock).toHaveBeenCalled();
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: expect.objectContaining({ namespace: expectedNamespace }) }),
      );
      expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
        action: 'create',
        manifestsSize: 1,
        namespace: namespace,
      });
    });
  },
);

test('Create Kubernetes resources with v1 resource in error should return error', async () => {
  const client = createTestClient();
  const spy = vi.spyOn(client, 'createV1Resource').mockRejectedValue(new Error('V1Error'));
  try {
    await client.createResources('dummy', [{ apiVersion: 'v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(spy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('V1Error');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
      action: 'create',
      manifestsSize: 1,
      error: new Error('V1Error'),
    });
  }
});

describe.each([
  {
    manifest: { apiVersion: 'group/v1', kind: 'Namespace' },
    namespace: undefined,
    expectedNamespace: 'default',
  },
  {
    manifest: { apiVersion: 'group/v1', kind: 'Namespace' },
    namespace: 'defaultns',
    expectedNamespace: 'defaultns',
  },
  {
    manifest: { apiVersion: 'group/v1', kind: 'Namespace', metadata: { namespace: 'demons' } },
    namespace: undefined,
    expectedNamespace: 'demons',
  },
])('Create custom Kubernetes resources should return ok', ({ manifest, namespace, expectedNamespace }) => {
  test(`should use namespace ${expectedNamespace}`, async () => {
    const client = createTestClient();
    const createMock = vi.fn().mockReturnValue({});
    const readMock = vi.fn().mockRejectedValue(new Error('ResourceDoesntExistError'));
    makeApiClientMock.mockReturnValue({
      read: readMock,
      create: createMock,
    });
    await client.createResources('dummy', [manifest], namespace);
    expect(readMock).toHaveBeenCalled();
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ namespace: expectedNamespace }) }),
    );
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
      action: 'create',
      manifestsSize: 1,
      namespace: namespace,
    });
  });
});

test('Create custom Kubernetes resources in error should return error', async () => {
  const client = createTestClient();
  const spy = vi.spyOn(client, 'createCustomResource').mockRejectedValue(new Error('CustomError'));
  vi.spyOn(client, 'getAPIResource').mockReturnValue(
    Promise.resolve({ name: 'namespaces', namespaced: true, kind: 'Namespace', singularName: 'namespace', verbs: [] }),
  );
  try {
    await client.createResources('dummy', [{ apiVersion: 'group/v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(spy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('CustomError');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
      action: 'create',
      manifestsSize: 1,
      error: new Error('CustomError'),
    });
  }
});

test('Create unknown custom Kubernetes resources should return error', async () => {
  const client = createTestClient();
  const createSpy = vi.spyOn(client, 'createCustomResource').mockResolvedValue(undefined);
  const pluralSpy = vi.spyOn(client, 'getAPIResource').mockRejectedValue(new Error('CustomError'));
  try {
    await client.createResources('dummy', [{ apiVersion: 'group/v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(createSpy).not.toBeCalled();
    expect(pluralSpy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('CustomError');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesSyncResources', {
      action: 'create',
      manifestsSize: 1,
      error: new Error('CustomError'),
    });
  }
});

test('Check connection to Kubernetes cluster', async () => {
  // Mock k8sApi.getCode() to return the version of the cluster
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
  });

  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const result = await client.checkConnection();
  expect(result).toBeTruthy();
});

test('Check connection to Kubernetes cluster in error', async () => {
  // Mock k8sApi.getCode() to return the version of the cluster
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const result = await client.checkConnection();
  expect(result).toBeFalsy();
});

test('Check update with empty kubeconfig file', async () => {
  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  const consoleErrorSpy = vi.spyOn(console, 'error');

  // provide empty kubeconfig file
  readFileMock.mockResolvedValue('');

  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  await client.refresh();
  expect(consoleErrorSpy).toBeCalledWith(expect.stringContaining('is empty. Skipping'));
});

test('kube watcher', () => {
  const client = createTestClient('fooNS');
  const path: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errorHandler: any;

  // mock TestKubernetesClient.createWatchObject
  const watchMethodMock = vi.fn().mockImplementation((pathMethod, _ignore1, _ignore2, c) => {
    path.push(pathMethod);
    errorHandler = c;
    return Promise.resolve();
  });

  const createWatchObjectSpy = vi
    .spyOn(client, 'createWatchObject')
    .mockReturnValue({ watch: watchMethodMock } as unknown as Watch);

  client.setupKubeWatcher();

  expect(path).toContain('/api/v1/namespaces/fooNS/pods');
  expect(path).toContain('/apis/apps/v1/namespaces/fooNS/deployments');
  expect(errorHandler).toBeDefined();

  // call the error Handler with undefined
  if (errorHandler !== undefined) {
    errorHandler(undefined);
  }

  expect(createWatchObjectSpy).toBeCalled();
});

// Deployment
test('should return empty deployment list if there is no active namespace', async () => {
  const client = createTestClient();

  const list = await client.listDeployments();
  expect(list.length).toBe(0);
});

test('should return empty deployment list if cannot connect to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listDeployments();
  expect(list.length).toBe(0);
});

test('should return empty deployment list if cannot execute call to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedDeployent: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listDeployments();
  expect(list.length).toBe(0);
});

test('should return deployment list if connection to cluster is ok', async () => {
  const v1Deployment: V1Deployment = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Deployment',
    metadata: {
      name: 'deployment',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedDeployment: () =>
      Promise.resolve({
        body: {
          items: [v1Deployment],
        },
      }),
  });

  const list = await client.listDeployments();
  expect(list.length).toBe(1);
  expect(list[0].metadata?.name).toEqual('deployment');
});

test('should throw error if cannot call the cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedDeployment: () => Promise.reject(new Error('K8sError')),
  });

  try {
    await client.readNamespacedDeployment('deployment', 'default');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(err).to.be.a('Error');
    expect(err.message).equal('K8sError');
  }
});

test('should return undefined if deployment does not exist', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedDeployment: () => Promise.resolve({}),
  });

  const deployment = await client.readNamespacedDeployment('deployment', 'default');
  expect(deployment).not.toBeDefined();
});

test('should return deployment if it exists', async () => {
  const v1Deployment: V1Deployment = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Deployment',
    metadata: {
      name: 'deployment',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedDeployment: () =>
      Promise.resolve({
        body: v1Deployment,
      }),
  });

  const deployment = await client.readNamespacedDeployment('deployment', 'default');
  expect(deployment).toBeDefined();
  expect(deployment?.metadata?.name).toEqual('deployment');
});

// Ingress
test('should return empty ingress list if there is no active namespace', async () => {
  const client = createTestClient();

  const list = await client.listIngresses();
  expect(list.length).toBe(0);
});

test('should return empty ingress list if cannot connect to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listIngresses();
  expect(list.length).toBe(0);
});

test('should return empty ingress list if cannot execute call to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedIngress: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listIngresses();
  expect(list.length).toBe(0);
});

test('should return ingress list if connection to cluster is ok', async () => {
  const v1Ingress: V1Ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: 'ingress',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedIngress: () =>
      Promise.resolve({
        body: {
          items: [v1Ingress],
        },
      }),
  });

  const list = await client.listIngresses();
  expect(list.length).toBe(1);
  expect(list[0].metadata?.name).toEqual('ingress');
});

test('should throw error if cannot call the cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedIngress: () => Promise.reject(new Error('K8sError')),
  });

  try {
    await client.readNamespacedIngress('ingress', 'default');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(err).to.be.a('Error');
    expect(err.message).equal('K8sError');
  }
});

test('should return undefined if ingress does not exist', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedIngress: () => Promise.resolve({}),
  });

  const ingress = await client.readNamespacedIngress('ingress', 'default');
  expect(ingress).not.toBeDefined();
});

test('should return ingress if it exists', async () => {
  const v1Ingress: V1Ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: 'ingress',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedIngress: () =>
      Promise.resolve({
        body: v1Ingress,
      }),
  });

  const ingress = await client.readNamespacedIngress('ingress', 'default');
  expect(ingress).toBeDefined();
  expect(ingress?.metadata?.name).toEqual('ingress');
});

// Routes
test('should return empty routes list if there is no active namespace', async () => {
  const client = createTestClient();

  const list = await client.listRoutes();
  expect(list.length).toBe(0);
});

test('should return empty routes list if cannot connect to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listRoutes();
  expect(list.length).toBe(0);
});

test('should return empty routes list if cannot execute call to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedCustomObject: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listRoutes();
  expect(list.length).toBe(0);
});

test('should return route list if connection to cluster is ok', async () => {
  const v1Route: V1Route = {
    apiVersion: 'route.openshift.io/v1',
    kind: 'Route',
    metadata: {
      name: 'route',
      namespace: 'default',
    },
    spec: {
      host: 'host',
      port: {
        targetPort: '80',
      },
      tls: {
        insecureEdgeTerminationPolicy: '',
        termination: '',
      },
      to: {
        kind: '',
        name: '',
        weight: 1,
      },
      wildcardPolicy: '',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedCustomObject: () =>
      Promise.resolve({
        body: [v1Route],
      }),
  });

  const list = await client.listRoutes();
  expect(list.length).toBe(1);
  expect(list[0].metadata?.name).toEqual('route');
});

test('should throw error if cannot call the cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    getNamespacedCustomObject: () => Promise.reject(new Error('K8sError')),
  });

  try {
    await client.readNamespacedRoute('route', 'default');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(err).to.be.a('Error');
    expect(err.message).equal('K8sError');
  }
});

test('should return undefined if route does not exist', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    getNamespacedCustomObject: () => Promise.resolve({}),
  });

  const route = await client.readNamespacedRoute('route', 'default');
  expect(route).not.toBeDefined();
});

test('should return route if it exists', async () => {
  const v1Route: V1Route = {
    apiVersion: 'route.openshift.io/v1',
    kind: 'Route',
    metadata: {
      name: 'route',
      namespace: 'default',
    },
    spec: {
      host: 'host',
      port: {
        targetPort: '80',
      },
      tls: {
        insecureEdgeTerminationPolicy: '',
        termination: '',
      },
      to: {
        kind: '',
        name: '',
        weight: 1,
      },
      wildcardPolicy: '',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    getNamespacedCustomObject: () =>
      Promise.resolve({
        body: v1Route,
      }),
  });

  const route = await client.readNamespacedRoute('route', 'default');
  expect(route).toBeDefined();
  expect(route?.metadata?.name).toEqual('route');
});

test('Expect deleteIngress is not called if there is no active namespace', async () => {
  const client = createTestClient();
  const deleteIngressMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedIngress: deleteIngressMock,
  });

  await client.deleteIngress('name');
  expect(deleteIngressMock).not.toBeCalled();
});

test('Expect deleteIngress is not called if there is no active connection', async () => {
  const client = createTestClient('default');
  const deleteIngressMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
    deleteNamespacedIngress: deleteIngressMock,
  });

  await client.deleteIngress('name');
  expect(deleteIngressMock).not.toBeCalled();
});

test('Expect deleteIngress to be called if there is active connection', async () => {
  const client = createTestClient('default');
  const deleteIngressMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedIngress: deleteIngressMock,
  });

  await client.deleteIngress('name');
  expect(deleteIngressMock).toBeCalled();
});

test('Expect deleteRoute is not called if there is no active namespace', async () => {
  const client = createTestClient();
  const deleteRouteMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedCustomObject: deleteRouteMock,
  });

  await client.deleteRoute('name');
  expect(deleteRouteMock).not.toBeCalled();
});

test('Expect deleteRoute is not called if there is no active connection', async () => {
  const client = createTestClient('default');
  const deleteRouteMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
    deleteNamespacedCustomObject: deleteRouteMock,
  });

  await client.deleteRoute('name');
  expect(deleteRouteMock).not.toBeCalled();
});

test('Expect deleteRoute to be called if there is active connection', async () => {
  const client = createTestClient('default');
  const deleteRouteMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedCustomObject: deleteRouteMock,
  });

  await client.deleteRoute('name');
  expect(deleteRouteMock).toBeCalled();
});

test('should return empty service list if there is no active namespace', async () => {
  const client = createTestClient();

  const list = await client.listServices();
  expect(list.length).toBe(0);
});

test('should return empty service list if cannot connect to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listServices();
  expect(list.length).toBe(0);
});

test('should return empty service list if cannot execute call to cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedService: () => Promise.reject(new Error('K8sError')),
  });

  const list = await client.listServices();
  expect(list.length).toBe(0);
});

test('should return service list if connection to cluster is ok', async () => {
  const v1Service: V1Service = {
    apiVersion: 'k8s.io/v1',
    kind: 'Service',
    metadata: {
      name: 'service',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    listNamespacedService: () =>
      Promise.resolve({
        body: {
          items: [v1Service],
        },
      }),
  });

  const list = await client.listServices();
  expect(list.length).toBe(1);
  expect(list[0].metadata?.name).toEqual('service');
});

test('should throw error if cannot call the cluster', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedService: () => Promise.reject(new Error('K8sError')),
  });

  try {
    await client.readNamespacedService('service', 'default');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(err).to.be.a('Error');
    expect(err.message).equal('K8sError');
  }
});

test('should return undefined if service does not exist', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedService: () => Promise.resolve({}),
  });

  const service = await client.readNamespacedService('service', 'default');
  expect(service).not.toBeDefined();
});

test('should return service if it exists', async () => {
  const v1Service: V1Service = {
    apiVersion: 'k8s.io/v1',
    kind: 'Service',
    metadata: {
      name: 'service',
    },
  };
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedService: () =>
      Promise.resolve({
        body: v1Service,
      }),
  });

  const service = await client.readNamespacedService('service', 'default');
  expect(service).toBeDefined();
  expect(service?.metadata?.name).toEqual('service');
});

test('Expect deleteService is not called if there is no active namespace', async () => {
  const client = createTestClient();
  const deleteServiceMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedService: deleteServiceMock,
  });

  await client.deleteService('name');
  expect(deleteServiceMock).not.toBeCalled();
});

test('Expect deleteService is not called if there is no active connection', async () => {
  const client = createTestClient('default');
  const deleteServiceMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
    deleteNamespacedService: deleteServiceMock,
  });

  await client.deleteService('name');
  expect(deleteServiceMock).not.toBeCalled();
});

test('Expect deleteService to be called if there is an active connection', async () => {
  const client = createTestClient('default');
  const deleteServiceMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedService: deleteServiceMock,
  });

  await client.deleteService('name');
  expect(deleteServiceMock).toBeCalled();
});

test('Expect apply with invalid file should error', async () => {
  const client = createTestClient('default');
  let expectedError: unknown;
  try {
    await client.applyResourcesFromFile('default', 'missing-file.yaml');
  } catch (err: unknown) {
    expectedError = err;
  }
  expect(expectedError).to.be.a('Error');
  expect((expectedError as Error).message).equal('File missing-file.yaml does not exist');
});

test('Expect apply with empty yaml should throw error', async () => {
  const client = createTestClient('default');
  vi.spyOn(client, 'loadManifestsFromFile').mockResolvedValue([]);
  let expectedError: unknown;
  try {
    await client.applyResourcesFromFile('default', 'missing-file.yaml');
  } catch (err: unknown) {
    expectedError = err;
  }
  expect(expectedError).to.be.a('Error');
  expect((expectedError as Error).message).equal('No valid Kubernetes resources found in file');
});

test('Expect apply should create if object does not exist', async () => {
  const client = createTestClient('default');
  const manifests = { kind: test, metadata: { annotations: test } } as unknown as KubernetesObject;
  const createdObj = { kind: 'created' };
  vi.spyOn(client, 'loadManifestsFromFile').mockResolvedValue([manifests]);
  makeApiClientMock.mockReturnValue({
    create: vi.fn().mockReturnValue({ body: createdObj }),
  });

  const objects = await client.applyResourcesFromFile('default', 'some-file.yaml');

  expect(objects).toHaveLength(1);
  expect(objects[0]).toEqual(createdObj);
});

test('Expect apply should patch if object exists', async () => {
  const client = createTestClient('default');
  const manifests = { kind: test, metadata: { annotations: test } } as unknown as KubernetesObject;
  const patchedObj = { kind: 'patched' };
  vi.spyOn(client, 'loadManifestsFromFile').mockResolvedValue([manifests]);
  const patchMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    read: vi.fn(),
    patch: patchMock.mockReturnValue({ body: patchedObj }),
  });

  const objects = await client.applyResourcesFromFile('default', 'some-file.yaml');

  expect(objects).toHaveLength(1);
  expect(objects[0]).toEqual(patchedObj);
  expect(patchMock).toHaveBeenCalledWith(expect.any(Object), undefined, undefined, 'podman-desktop');
});

test('Expect apply should patch with specific field manager', async () => {
  const client = createTestClient('default');
  const manifests = { kind: test, metadata: { annotations: test } } as unknown as KubernetesObject;
  const patchedObj = { kind: 'patched' };
  vi.spyOn(client, 'loadManifestsFromFile').mockResolvedValue([manifests]);
  const patchMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    read: vi.fn(),
    patch: patchMock.mockReturnValue({ body: patchedObj }),
  });

  await client.applyResourcesFromFile('default', 'some-file.yaml');
  expect(patchMock).toHaveBeenCalledWith(expect.any(Object), undefined, undefined, 'podman-desktop');
});

test('If Kubernetes returns a http error, output the http body message error.', async () => {
  const client = createTestClient();
  makeApiClientMock.mockReturnValue({
    read: vi.fn().mockReturnValue({}),
    create: vi
      .fn()
      .mockRejectedValue(
        new clientNode.HttpError(
          new IncomingMessage(new Socket()),
          { body: { message: 'A K8sError within message body' } },
          500,
        ),
      ),
  });
  try {
    await client.createResources('dummy', [{ apiVersion: 'v1' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.log(err);
    // Check that the error is clientNode.HttpError
    expect(err).to.be.a('Error');
    expect(err.message).contain('A K8sError within message body');
  }
});

test('Expect loadManifestsFromYAML to correctly return a KubernetesObject[] from a valid YAML string', async () => {
  const client = createTestClient();
  const expectedObjects = [
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: 'my-pod',
      },
    },
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment',
        namespace: 'default',
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: 'my-deployment',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'my-deployment',
            },
          },
          spec: {
            containers: [
              {
                name: 'my-deployment',
                image: 'my-deployment-image',
                ports: [
                  {
                    containerPort: 80,
                  },
                ],
              },
            ],
          },
        },
      },
    },
  ];
  const objects = await client.loadManifestsFromYAML(podAndDeploymentTestYAML);
  expect(objects).toEqual(expectedObjects);
});

test('Expect applyResourcesFromYAML to correctly call applyResources after loading the YAML', async () => {
  const client = createTestClient();
  const expectedObjects = [
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: 'my-pod',
      },
    },
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: 'my-deployment',
        namespace: 'default',
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            app: 'my-deployment',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'my-deployment',
            },
          },
          spec: {
            containers: [
              {
                name: 'my-deployment',
                image: 'my-deployment-image',
                ports: [
                  {
                    containerPort: 80,
                  },
                ],
              },
            ],
          },
        },
      },
    },
  ];
  const applyResourcesSpy = vi.spyOn(client, 'applyResources').mockResolvedValue(expectedObjects);
  const objects = await client.applyResourcesFromYAML('default', podAndDeploymentTestYAML);
  expect(objects).toEqual(expectedObjects);
  expect(applyResourcesSpy).toHaveBeenCalledWith('default', expectedObjects, 'apply');
});

test('setupWatcher sends kubernetes-context-update when kubeconfig file changes', async () => {
  const client = createTestClient();
  const fileSystemMonitoringSpy = vi.spyOn(fileSystemMonitoring, 'createFileSystemWatcher');
  const onDidChangeMock = vi.fn();
  vi.spyOn(client, 'refresh').mockResolvedValue(undefined);
  fileSystemMonitoringSpy.mockReturnValue({
    onDidChange: onDidChangeMock,
    onDidCreate: vi.fn(),
    onDidDelete: vi.fn(),
  } as unknown as FileSystemWatcher);
  onDidChangeMock.mockImplementation(f => {
    f();
  });
  client.setupWatcher('/path/to/kube/config');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-context-update');
});

test('setupWatcher sends kubernetes-context-update when kubeconfig file is created', async () => {
  const client = createTestClient();
  const fileSystemMonitoringSpy = vi.spyOn(fileSystemMonitoring, 'createFileSystemWatcher');
  const onDidCreateMock = vi.fn();
  vi.spyOn(client, 'refresh').mockResolvedValue(undefined);
  fileSystemMonitoringSpy.mockReturnValue({
    onDidChange: vi.fn(),
    onDidCreate: onDidCreateMock,
    onDidDelete: vi.fn(),
  } as unknown as FileSystemWatcher);
  onDidCreateMock.mockImplementation(f => {
    f();
  });
  client.setupWatcher('/path/to/kube/config');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-context-update');
});

test('setupWatcher sends kubernetes-context-update when kubeconfig file is deleted', async () => {
  const client = createTestClient();
  const fileSystemMonitoringSpy = vi.spyOn(fileSystemMonitoring, 'createFileSystemWatcher');
  const onDidDeleteMock = vi.fn();
  vi.spyOn(client, 'refresh').mockResolvedValue(undefined);
  fileSystemMonitoringSpy.mockReturnValue({
    onDidChange: vi.fn(),
    onDidCreate: vi.fn(),
    onDidDelete: onDidDeleteMock,
  } as unknown as FileSystemWatcher);
  onDidDeleteMock.mockImplementation(f => {
    f();
  });
  client.setupWatcher('/path/to/kube/config');
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(apiSenderSendMock).toHaveBeenCalledWith('kubernetes-context-update');
});

test('Test should exec into container ', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
  });

  let stdout = '';
  const onStdOutFn = (data: Buffer): void => {
    stdout += data.toString();
  };

  let stderr = '';
  const onStdErrFn = (data: Buffer): void => {
    stderr += data.toString();
  };

  const onCloseFn = vi.fn();

  execMock.mockImplementation(
    (
      namespace: string,
      podName: string,
      containerName: string,
      command: string | string[],
      stdout: Writable | null,
      stderr: Writable | null,
      stdin: Readable | null,
      tty: boolean,
      _?: (status: V1Status) => void,
    ) => {
      expect(namespace).toBe('default');
      expect(podName).toBe('test-pod');
      expect(containerName).toBe('test-container');
      expect(tty).toBeTruthy();
      expect(command).toEqual(['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then bash; else sh; fi']);

      if (stdout) {
        stdout.write('stdOut output');

        stdout.on('resize', () => {
          expect(stdout).instanceOf(ResizableTerminalWriter);
          const { width, height } = (stdout as ResizableTerminalWriter).getDimension();
          expect(width).toBe(1);
          expect(height).toBe(1);
        });
      }
      if (stderr) {
        stderr.write('stdErr output');
      }

      if (stdin) {
        stdin.on('data', chunk => expect(chunk.toString()).toEqual('stdIn input'));
      }

      return { on: vi.fn() };
    },
  );

  const execResp = await client.execIntoContainer('test-pod', 'test-container', onStdOutFn, onStdErrFn, onCloseFn);

  expect(stdout).toBe('stdOut output');
  expect(stderr).toBe('stdErr output');

  execResp.onStdIn('stdIn input');
  execResp.onResize(1, 1);
});

test('Test should throw an exception during exec command if resize parameters are wrong', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
  });

  const execResp = await client.execIntoContainer(
    'test-pod',
    'test-container',
    () => {},
    () => {},
    () => {},
  );

  expect(() => execResp.onResize(-1, -1)).toThrow('resizing must be done using positive cols and rows');
  expect(() => execResp.onResize(0, 0)).toThrow('resizing must be done using positive cols and rows');
  expect(() => execResp.onResize(Number.NaN, Number.NaN)).toThrow('resizing must be done using positive cols and rows');
  expect(() => execResp.onResize(Infinity, Infinity)).toThrow('resizing must be done using positive cols and rows');
});

test('Test should throw an exception during exec command if internal kube method fails', async () => {
  const client = createTestClient('default');
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
  });

  await expect(
    client.execIntoContainer(
      'test-pod',
      'test-container',
      () => {},
      () => {},
      () => {},
    ),
  ).rejects.toThrowError('not active connection');
});

test('Expect pod to be restarted', async () => {
  const client = createTestClient('default');
  client.readNamespacedPod = vi.fn().mockResolvedValue({ metadata: {} });
  const deleteNamespacedPodMock = vi.fn();
  const createNamespacedPodMock = vi.fn();

  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedPod: deleteNamespacedPodMock,
    createNamespacedPod: createNamespacedPodMock,
    // eslint-disable-next-line prefer-promise-reject-errors
    readNamespacedPodStatus: () => Promise.reject({ response: { statusCode: 404 } }),
  });

  await client.restartPod('dummy');
  expect(deleteNamespacedPodMock).toBeCalled();
  expect(createNamespacedPodMock).toBeCalled();
});

test('Expect pod fails to restart', async () => {
  const client = createTestClient('default');
  client.readNamespacedPod = vi.fn().mockResolvedValue({ metadata: {} });
  const deleteNamespacedPodMock = vi.fn();
  const createNamespacedPodMock = vi.fn();

  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedPod: deleteNamespacedPodMock,
    createNamespacedPod: createNamespacedPodMock,
    // eslint-disable-next-line prefer-promise-reject-errors
    readNamespacedPodStatus: () => Promise.resolve({ body: { status: { phase: 'Running' } } }),
  });

  await expect(client.restartPod('dummy', 0, 0)).rejects.toThrow(
    new Error('Request timed out while deleting the Pod.'),
  );
});
