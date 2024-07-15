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
  type AppsV1Api,
  BatchV1Api,
  CoreV1Api,
  Exec,
  KubeConfig,
  type KubernetesObject,
  type V1ConfigMap,
  type V1Deployment,
  type V1Ingress,
  type V1Job,
  type V1Node,
  type V1ObjectMeta,
  type V1OwnerReference,
  type V1Pod,
  type V1Secret,
  type V1Service,
  type V1Status,
  type Watch,
} from '@kubernetes/client-node';
import * as clientNode from '@kubernetes/client-node';
import type { FileSystemWatcher } from '@podman-desktop/api';
import { beforeAll, beforeEach, describe, expect, type Mock, test, vi } from 'vitest';

import { ResizableTerminalWriter } from '/@/plugin/kubernetes-exec-transmitter.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { V1Route } from '/@api/openshift-types.js';

import type { ApiSenderType } from './api.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { PodCreationSource, ScalableControllerType } from './kubernetes-client.js';
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
  declare kubeConfig;

  public declare currentNamespace: string | undefined;

  public createWatchObject(): Watch {
    return super.createWatchObject();
  }

  public setCurrentNamespace(namespace: string): void {
    this.currentNamespace = namespace;
  }

  public testGetPodController(podMetadata: V1ObjectMeta): V1OwnerReference | undefined {
    return this.getPodController(podMetadata);
  }

  public testCheckPodCreationSource(podMetadata: V1ObjectMeta): PodCreationSource {
    return this.checkPodCreationSource(podMetadata);
  }

  public testWaitForPodsDeletion(
    coreApi: CoreV1Api,
    namespace: string,
    selector: string,
    timeout?: number,
  ): Promise<boolean> {
    return this.waitForPodsDeletion(coreApi, namespace, selector, timeout);
  }

  public testWaitForJobDeletion(
    batchApi: BatchV1Api,
    namespace: string,
    name: string,
    timeout?: number,
  ): Promise<boolean> {
    return this.waitForJobDeletion(batchApi, namespace, name, timeout);
  }

  public testRestartJob(namespace: string, jobName: string): Promise<void> {
    return this.restartJob(namespace, jobName);
  }

  public testScaleController(
    appsApi: AppsV1Api,
    namespace: string,
    controllerName: string,
    controllerType: 'Deployment' | 'ReplicaSet' | 'StatefulSet',
    replicas: number,
  ): Promise<void> {
    return this.scaleController(appsApi, namespace, controllerName, controllerType, replicas);
  }

  public testScaleControllerToRestartPods(
    namespace: string,
    controllerName: string,
    controllerType: ScalableControllerType,
    timeout: number = 10000,
  ): Promise<void> {
    return this.scaleControllerToRestartPods(namespace, controllerName, controllerType, timeout);
  }

  public testWaitForPodDeletion(
    coreApi: CoreV1Api,
    name: string,
    namespace: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    return this.waitForPodDeletion(coreApi, name, namespace, timeout);
  }

  public testRestartManuallyCreatedPod(name: string, namespace: string, pod: V1Pod): Promise<void> {
    return this.restartManuallyCreatedPod(name, namespace, pod);
  }

  // need only to be mocked in several test methods
  public waitForPodDeletion(
    coreApi: CoreV1Api,
    name: string,
    namespace: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    return super.waitForPodDeletion(coreApi, name, namespace, timeout);
  }

  // need only to be mocked in several test methods
  public waitForPodsDeletion(
    coreApi: CoreV1Api,
    namespace: string,
    selector: string,
    timeout?: number,
  ): Promise<boolean> {
    return super.waitForPodsDeletion(coreApi, namespace, selector, timeout);
  }

  // need only to be mocked in several test methods
  public waitForJobDeletion(
    batchApi: BatchV1Api,
    name: string,
    namespace: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    return super.waitForJobDeletion(batchApi, name, namespace, timeout);
  }

  // need only to be mocked in several test methods
  public scaleController(
    appsApi: AppsV1Api,
    namespace: string,
    controllerName: string,
    controllerType: 'Deployment' | 'ReplicaSet' | 'StatefulSet',
    replicas: number,
  ): Promise<void> {
    return super.scaleController(appsApi, namespace, controllerName, controllerType, replicas);
  }

  // need only to be mocked in several test methods
  public checkPodCreationSource(podMetadata: V1ObjectMeta): PodCreationSource {
    return super.checkPodCreationSource(podMetadata);
  }

  // need only to be mocked in several test methods
  public restartManuallyCreatedPod(name: string, namespace: string, pod: V1Pod): Promise<void> {
    return super.restartManuallyCreatedPod(name, namespace, pod);
  }

  // need only to be mocked in several test methods
  public scaleControllerToRestartPods(
    namespace: string,
    controllerName: string,
    controllerType: ScalableControllerType,
    timeout: number = 10000,
  ): Promise<void> {
    return super.scaleControllerToRestartPods(namespace, controllerName, controllerType, timeout);
  }

  // need only to be mocked in several test methods
  public getPodController(podMetadata: V1ObjectMeta): V1OwnerReference | undefined {
    return super.getPodController(podMetadata);
  }

  // need only to be mocked in several test methods
  public restartJob(name: string, namespace: string): Promise<void> {
    return super.restartJob(name, namespace);
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
      BatchV1Api: {},
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
      V1Job: vi.fn(),
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
        body: { items: [v1Route] },
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
  expect(applyResourcesSpy).toHaveBeenCalledWith('default', expectedObjects);
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

describe('Tests that managedFields are removed from the object when using read', () => {
  test('Pod', async () => {
    const client = createTestClient('default');
    const v1Pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: 'pod',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNamespacedPod: () =>
        Promise.resolve({
          body: v1Pod,
        }),
    });

    const pod = await client.readNamespacedPod('pod', 'default');
    expect(pod).toBeDefined();
    expect(pod?.metadata?.managedFields).toBeUndefined();
  });

  test('Deployment', async () => {
    const client = createTestClient('default');
    const v1Deployment: V1Deployment = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Deployment',
      metadata: {
        name: 'deployment',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNamespacedDeployment: () =>
        Promise.resolve({
          body: v1Deployment,
        }),
    });

    const deployment = await client.readNamespacedDeployment('deployment', 'default');
    expect(deployment).toBeDefined();
    expect(deployment?.metadata?.managedFields).toBeUndefined();
  });

  test('Node', async () => {
    const client = createTestClient('default');
    const v1Node: V1Node = {
      apiVersion: 'v1',
      kind: 'Node',
      metadata: {
        name: 'node',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNode: () =>
        Promise.resolve({
          body: v1Node,
        }),
    });

    const node = await client.readNode('node');
    expect(node).toBeDefined();
    expect(node?.metadata?.managedFields).toBeUndefined();
  });

  test('Ingress', async () => {
    const client = createTestClient('default');
    const v1Ingress: V1Ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'ingress',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNamespacedIngress: () =>
        Promise.resolve({
          body: v1Ingress,
        }),
    });

    const ingress = await client.readNamespacedIngress('ingress', 'default');
    expect(ingress).toBeDefined();
    expect(ingress?.metadata?.managedFields).toBeUndefined();
  });

  test('Route', async () => {
    const client = createTestClient('default');
    const v1Route: V1Route = {
      apiVersion: 'route.openshift.io/v1',
      kind: 'Route',
      metadata: {
        name: 'route',
        namespace: 'default',
        managedFields: [{ manager: 'manager' }],
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
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      getNamespacedCustomObject: () =>
        Promise.resolve({
          body: v1Route,
        }),
    });

    const route = await client.readNamespacedRoute('route', 'default');
    expect(route).toBeDefined();
    expect(route?.metadata?.managedFields).toBeUndefined();
  });

  test('Service', async () => {
    const client = createTestClient('default');
    const v1Service: V1Service = {
      apiVersion: 'k8s.io/v1',
      kind: 'Service',
      metadata: {
        name: 'service',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNamespacedService: () =>
        Promise.resolve({
          body: v1Service,
        }),
    });

    const service = await client.readNamespacedService('service', 'default');
    expect(service).toBeDefined();
    expect(service?.metadata?.managedFields).toBeUndefined();
  });

  test('ConfigMap', async () => {
    const client = createTestClient('default');
    const v1ConfigMap: V1ConfigMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: 'configmap',
        managedFields: [{ manager: 'manager' }],
      },
    };
    makeApiClientMock.mockReturnValue({
      getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
      readNamespacedConfigMap: () =>
        Promise.resolve({
          body: v1ConfigMap,
        }),
    });

    const configMap = await client.readNamespacedConfigMap('configmap', 'default');
    expect(configMap).toBeDefined();
    expect(configMap?.metadata?.managedFields).toBeUndefined();
  });
});

test('Expect deleteConfigMap is not called if there is no active connection', async () => {
  const client = createTestClient('default');
  const deleteConfigMapMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
    deleteNamespacedConfigMap: deleteConfigMapMock,
  });

  await client.deleteConfigMap('name');
  expect(deleteConfigMapMock).not.toBeCalled();
});

test('Expect deleteConfigMap to be called if there is an active connection', async () => {
  const client = createTestClient('default');
  const deleteConfigMapMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedConfigMap: deleteConfigMapMock,
  });

  await client.deleteConfigMap('name');
  expect(deleteConfigMapMock).toBeCalled();
});

test('Expect deleteSecret to be called if there is no active connection', async () => {
  const client = createTestClient('default');
  const deleteSecretMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.reject(new Error('K8sError')),
    deleteNamespacedSecret: deleteSecretMock,
  });

  await client.deleteSecret('name');
  expect(deleteSecretMock).not.toBeCalled();
});

test('Expect deleteSecret to be called if there is an active connection', async () => {
  const client = createTestClient('default');
  const deleteSecretMock = vi.fn();
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    deleteNamespacedSecret: deleteSecretMock,
  });

  await client.deleteSecret('name');
  expect(deleteSecretMock).toBeCalled();
});

test('Expect readNamespacedSecret to return the secret', async () => {
  const client = createTestClient('default');
  const v1Secret: V1Secret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: 'secret',
    },
  };
  makeApiClientMock.mockReturnValue({
    getCode: () => Promise.resolve({ body: { gitVersion: 'v1.20.0' } }),
    readNamespacedSecret: () =>
      Promise.resolve({
        body: v1Secret,
      }),
  });

  const secret = await client.readNamespacedSecret('secret', 'default');
  expect(secret).toBeDefined();
  expect(secret?.metadata?.name).toEqual('secret');
});

test('Should return undefined if no ownerReferences', () => {
  const podMetadata: V1ObjectMeta = { ownerReferences: [] };
  const client = createTestClient('default');
  const result = client.testGetPodController(podMetadata);
  expect(result).toBeUndefined();
});

test('Should return undefined if ownerReferences present but no controller', () => {
  const ownerReference: V1OwnerReference = { controller: false } as unknown as V1OwnerReference;
  const podMetadata: V1ObjectMeta = { ownerReferences: [ownerReference] };
  const client = createTestClient('default');
  const result = client.testGetPodController(podMetadata);
  expect(result).toBeUndefined();
});

test('Should return controller if present in ownerReferences', () => {
  const ownerReference: V1OwnerReference = { controller: true } as unknown as V1OwnerReference;
  const podMetadata: V1ObjectMeta = { ownerReferences: [ownerReference] };
  const client = createTestClient('default');
  const result = client.testGetPodController(podMetadata);
  expect(result).toEqual(ownerReference);
});

test('Should detect manually created pod when there are no ownerReferences', () => {
  const podMetadata: V1ObjectMeta = { ownerReferences: [] };
  const client = createTestClient('default');
  const result = client.testCheckPodCreationSource(podMetadata);
  expect(result).toEqual({ isManuallyCreated: true, controllerType: undefined });
});

test('Should detect pod created by a controller', () => {
  const ownerReference: V1OwnerReference = { controller: true, kind: 'Deployment' } as unknown as V1OwnerReference;
  const podMetadata: V1ObjectMeta = { ownerReferences: [ownerReference] };
  const client = createTestClient('default');
  const result = client.testCheckPodCreationSource(podMetadata);
  expect(result).toEqual({ isManuallyCreated: false, controllerType: 'Deployment' });
});

test('Should return manually created if ownerReferences exist but none is a controller', () => {
  const ownerReferences: V1OwnerReference[] = [
    { controller: false, kind: 'Deployment' } as unknown as V1OwnerReference,
    { controller: false, kind: 'DaemonSet' } as unknown as V1OwnerReference,
  ];
  const podMetadata: V1ObjectMeta = { ownerReferences: ownerReferences };
  const client = createTestClient('default');
  const result = client.testCheckPodCreationSource(podMetadata);
  expect(result).toEqual({ isManuallyCreated: true, controllerType: undefined });
});

test('Should detect the controller among multiple ownerReferences', () => {
  const ownerReferences: V1OwnerReference[] = [
    { controller: false, kind: 'Deployment' } as unknown as V1OwnerReference,
    { controller: true, kind: 'StatefulSet' } as unknown as V1OwnerReference,
    { controller: false, kind: 'DaemonSet' } as unknown as V1OwnerReference,
  ];
  const podMetadata: V1ObjectMeta = { ownerReferences: ownerReferences };
  const client = createTestClient('default');
  const result = client.testCheckPodCreationSource(podMetadata);
  expect(result).toEqual({ isManuallyCreated: false, controllerType: 'StatefulSet' });
});

test('Should return true if pods are deleted within the timeout', async () => {
  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const selector = 'app=test-app';

  coreApiMock.listNamespacedPod = vi.fn().mockResolvedValueOnce({ body: { items: [] } });

  const result = await client.testWaitForPodsDeletion(coreApiMock, namespace, selector);
  expect(result).toBe(true);
});

test('Should return false if the timeout is reached but pods still exist', async () => {
  const existingPodMock = {
    metadata: {
      name: 'test-pod',
      namespace: 'test-namespace',
    },
    status: {
      phase: 'Running',
    },
  };

  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const selector = 'app=test-app';
  const timeout = 1000;

  coreApiMock.listNamespacedPod = vi.fn().mockResolvedValueOnce({ body: { items: [existingPodMock] } });

  const result = await client.testWaitForPodsDeletion(coreApiMock, namespace, selector, timeout);
  expect(result).toBe(false);
});

test('Should return true if the job is deleted within the timeout', async () => {
  const batchApiMock = vi.fn() as unknown as BatchV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const jobName = 'test-job';

  batchApiMock.readNamespacedJobStatus = vi.fn().mockRejectedValueOnce({ response: { statusCode: 404 } });

  const result = await client.testWaitForJobDeletion(batchApiMock, namespace, jobName);
  expect(result).toBe(true);
});

test('Should return false if the timeout is reached but the job still exists', async () => {
  const existingJobMock = {
    status: {
      conditions: [
        {
          type: 'Complete',
          status: 'True',
        },
      ],
    },
    metadata: {
      name: 'test-job',
      namespace: 'test-namespace',
    },
  };

  const batchApiMock = vi.fn() as unknown as BatchV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const jobName = 'test-job';
  const timeout = 1000;

  batchApiMock.readNamespacedJobStatus = vi.fn().mockResolvedValueOnce({ body: existingJobMock });

  const result = await client.testWaitForJobDeletion(batchApiMock, namespace, jobName, timeout);
  expect(result).toBe(false);
});

test('Should throw an exception if a non 404 error occurs during read namespaced job status API call', async () => {
  const batchApiMock = vi.fn() as unknown as BatchV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const jobName = 'test-job';

  batchApiMock.readNamespacedJobStatus = vi.fn().mockRejectedValue(new Error('Network error'));

  await expect(client.testWaitForJobDeletion(batchApiMock, namespace, jobName)).rejects.toThrow('Network error');
});

test('Should throw an exception if a read namespaced job status API call returns an error other than 404', async () => {
  const batchApiMock = vi.fn() as unknown as BatchV1Api;
  const client = createTestClient('default');
  const namespace = 'test-namespace';
  const jobName = 'test-job';

  const errorResponse = { response: { statusCode: 500 } };
  batchApiMock.readNamespacedJobStatus = vi.fn().mockRejectedValue(errorResponse);

  await expect(client.testWaitForJobDeletion(batchApiMock, namespace, jobName)).rejects.toThrow(
    expect.objectContaining(errorResponse),
  );
});

const mockV1Job: V1Job = {
  apiVersion: 'batch/v1',
  kind: 'Job',
  metadata: {
    name: 'demo-job',
    namespace: 'default',
    creationTimestamp: new Date(),
    resourceVersion: '12345',
    selfLink: '/apis/batch/v1/namespaces/default/jobs/demo-job',
    uid: 'abcde-12345-fghij',
    ownerReferences: [
      {
        apiVersion: 'batch/v1',
        kind: 'Job',
        name: 'owner-job',
        uid: 'owner-uid',
        controller: true,
        blockOwnerDeletion: false,
      },
    ],
  },
  spec: {
    template: {
      metadata: {
        labels: {
          'controller-uid': 'abcde-12345-fghij',
          'job-name': 'demo-job',
        },
      },
      spec: {
        containers: [
          {
            name: 'demo-container',
            image: 'demo-image',
          },
        ],
        restartPolicy: 'Never',
      },
    },
    selector: {
      matchLabels: {
        'job-name': 'demo-job',
      },
    },
  },
  status: {},
};

function configureClientToTestRestartJob(): {
  client: TestKubernetesClient;
  batchApiMock: BatchV1Api;
  coreApiMock: CoreV1Api;
} {
  const batchApiMock = vi.fn() as unknown as BatchV1Api;
  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  const client = createTestClient('default');
  batchApiMock.readNamespacedJob = vi.fn().mockResolvedValue({ body: mockV1Job });
  batchApiMock.deleteNamespacedJob = vi.fn().mockResolvedValue({});
  batchApiMock.createNamespacedJob = vi.fn().mockResolvedValue({});

  const kubeConfig = client?.kubeConfig;

  // @ts-expect-error api can be one of two types, due to using generic it is hard to detect what exact type is used
  vi.spyOn(kubeConfig, 'makeApiClient').mockImplementation(api => {
    if (api === CoreV1Api) {
      return coreApiMock;
    } else if (api === BatchV1Api) {
      return batchApiMock;
    }
  });

  vi.spyOn(client, 'waitForJobDeletion').mockResolvedValue(true);
  vi.spyOn(client, 'waitForPodsDeletion').mockResolvedValue(true);

  return { client, batchApiMock, coreApiMock };
}

test('Should restart a job', async () => {
  const { client, batchApiMock } = configureClientToTestRestartJob();

  await expect(client.testRestartJob('test-job', 'test-namespace')).resolves.not.toThrow();

  expect(batchApiMock.readNamespacedJob).toHaveBeenCalledWith('test-job', 'test-namespace');
  expect(batchApiMock.deleteNamespacedJob).toHaveBeenCalledWith(
    'test-job',
    'test-namespace',
    'true',
    undefined,
    undefined,
    undefined,
    'Background',
  );
  expect(batchApiMock.createNamespacedJob).toHaveBeenCalled();
});

test('Should throw an error if the job is not deleted within the expected timeframe', async () => {
  const { client } = configureClientToTestRestartJob();

  vi.spyOn(client, 'waitForJobDeletion').mockResolvedValue(false);

  await expect(client.testRestartJob('demo-job', 'default')).rejects.toThrow(
    'job "demo-job" in namespace "default" was not deleted within the expected timeframe',
  );
});

test('Should throw an error if not all pods are deleted within the expected timeframe', async () => {
  const { client } = configureClientToTestRestartJob();

  vi.spyOn(client, 'waitForPodsDeletion').mockResolvedValue(false);

  await expect(client.testRestartJob('demo-job', 'default')).rejects.toThrow(
    'not all pods with selector "job-name=demo-job" in namespace "default" were deleted within the expected timeframe',
  );
});

test('Should handle an error when reading the existing job fails', async () => {
  const { client, batchApiMock } = configureClientToTestRestartJob();

  (batchApiMock.readNamespacedJob as Mock).mockRejectedValue(new Error('Error reading job'));
  await expect(client.testRestartJob('demo-job', 'default')).rejects.toThrow('Error reading job');
});

test('Should handle an error when deleting the job fails', async () => {
  const { client, batchApiMock } = configureClientToTestRestartJob();

  (batchApiMock.deleteNamespacedJob as Mock).mockRejectedValue(new Error('Error deleting job'));
  await expect(client.testRestartJob('demo-job', 'default')).rejects.toThrow('Error deleting job');
});

test('Should handle an error when creating a new job fails', async () => {
  const { client, batchApiMock } = configureClientToTestRestartJob();

  (batchApiMock.createNamespacedJob as Mock).mockRejectedValue(new Error('Error creating job'));
  await expect(client.testRestartJob('demo-job', 'default')).rejects.toThrow('Error creating job');
});

test('Should correctly calls scale API for Deployments', async () => {
  const appsApiMock = { patchNamespacedDeploymentScale: vi.fn() } as unknown as AppsV1Api;
  const client = createTestClient('default');
  const namespace = 'default';
  const replicas = 3;
  const headers = { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } };

  await client.testScaleController(appsApiMock, namespace, 'my-deployment', 'Deployment', replicas);

  expect(appsApiMock.patchNamespacedDeploymentScale).toHaveBeenCalledOnce();
  expect(appsApiMock.patchNamespacedDeploymentScale).toHaveBeenCalledWith(
    'my-deployment',
    namespace,
    { spec: { replicas } },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    headers,
  );
});

test('correctly calls scale API for ReplicaSets', async () => {
  const appsApiMock = { patchNamespacedReplicaSetScale: vi.fn() } as unknown as AppsV1Api;
  const client = createTestClient('default');
  const namespace = 'default';
  const replicas = 3;
  const headers = { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } };

  await client.testScaleController(appsApiMock, namespace, 'my-replicaset', 'ReplicaSet', replicas);

  expect(appsApiMock.patchNamespacedReplicaSetScale).toHaveBeenCalledOnce();
  expect(appsApiMock.patchNamespacedReplicaSetScale).toHaveBeenCalledWith(
    'my-replicaset',
    namespace,
    { spec: { replicas } },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    headers,
  );
});

test('correctly calls scale API for StatefulSets', async () => {
  const appsApiMock = { patchNamespacedStatefulSetScale: vi.fn() } as unknown as AppsV1Api;
  const client = createTestClient('default');
  const namespace = 'default';
  const replicas = 3;
  const headers = { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } };

  await client.testScaleController(appsApiMock, namespace, 'my-statefulset', 'StatefulSet', replicas);

  expect(appsApiMock.patchNamespacedStatefulSetScale).toHaveBeenCalledOnce();
  expect(appsApiMock.patchNamespacedStatefulSetScale).toHaveBeenCalledWith(
    'my-statefulset',
    namespace,
    { spec: { replicas } },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    headers,
  );
});

function configureClientToScalePod(): { client: TestKubernetesClient; appsApiMock: AppsV1Api } {
  const appsApiMock = vi.fn() as unknown as AppsV1Api;
  const client = createTestClient('default');
  appsApiMock.readNamespacedDeployment = vi.fn();
  appsApiMock.readNamespacedReplicaSet = vi.fn();
  appsApiMock.readNamespacedStatefulSet = vi.fn();
  client.scaleController = vi.fn().mockResolvedValue({});

  const kubeConfig = client?.kubeConfig;

  kubeConfig.makeApiClient = vi.fn().mockReturnValue(appsApiMock);

  return { client, appsApiMock };
}

async function callScaleControllerAndCheckExpectValues(
  client: TestKubernetesClient,
  namespace: string,
  controllerName: string,
  controllerType: 'Deployment' | 'ReplicaSet' | 'StatefulSet',
  timeout: number = 10000,
  initialReplicas: number,
): Promise<void> {
  await client.testScaleControllerToRestartPods(namespace, controllerName, controllerType, timeout);

  expect(client.scaleController).toHaveBeenCalledTimes(2);
  expect(client.scaleController).toHaveBeenNthCalledWith(
    1,
    expect.anything(),
    namespace,
    controllerName,
    controllerType,
    0,
  );
  expect(client.scaleController).toHaveBeenNthCalledWith(
    2,
    expect.anything(),
    namespace,
    controllerName,
    controllerType,
    initialReplicas,
  );
}

test('Should correctly scale a Deployment to restart pods', async () => {
  const { client, appsApiMock } = configureClientToScalePod();
  const namespace = 'default';
  const controllerName = 'my-deployment';
  const controllerType = 'Deployment';
  const initialReplicas = 3;
  const scaleTimeout = 1000;

  (appsApiMock.readNamespacedDeployment as Mock).mockResolvedValue({
    body: { spec: { replicas: initialReplicas } },
  });

  await callScaleControllerAndCheckExpectValues(
    client,
    namespace,
    controllerName,
    controllerType,
    scaleTimeout,
    initialReplicas,
  );
});

test('Should correctly scale a ReplicaSet to restart pods', async () => {
  const { client, appsApiMock } = configureClientToScalePod();
  const namespace = 'default';
  const controllerName = 'my-replicaset';
  const controllerType = 'ReplicaSet';
  const initialReplicas = 5;
  const scaleTimeout = 1000;

  (appsApiMock.readNamespacedReplicaSet as Mock).mockResolvedValue({
    body: { spec: { replicas: initialReplicas } },
  });

  await callScaleControllerAndCheckExpectValues(
    client,
    namespace,
    controllerName,
    controllerType,
    scaleTimeout,
    initialReplicas,
  );
});

test('Should correctly scale a StatefulSet to restart pods', async () => {
  const { client, appsApiMock } = configureClientToScalePod();
  const namespace = 'default';
  const controllerName = 'my-statefulset';
  const controllerType = 'StatefulSet';
  const initialReplicas = 2;
  const scaleTimeout = 1000;

  (appsApiMock.readNamespacedStatefulSet as Mock).mockResolvedValue({
    body: { spec: { replicas: initialReplicas } },
  });

  await callScaleControllerAndCheckExpectValues(
    client,
    namespace,
    controllerName,
    controllerType,
    scaleTimeout,
    initialReplicas,
  );
});

test('Should return true if the pod is successfully deleted', async () => {
  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.readNamespacedPodStatus = vi.fn();
  const client = createTestClient('default');
  const namespace = 'default';
  const podName = 'test-pod';

  (coreApiMock.readNamespacedPodStatus as Mock).mockRejectedValueOnce({ response: { statusCode: 404 } });

  const result = await client.testWaitForPodDeletion(coreApiMock as CoreV1Api, podName, namespace);

  expect(result).toBe(true);
});

test('Should return false if the timeout is exceeded', async () => {
  const terminatingPodMock = {
    metadata: {
      name: 'example-pod',
      namespace: 'default',
      deletionTimestamp: new Date().toISOString(),
    },
    status: {
      phase: 'Terminating',
    },
  };

  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.readNamespacedPodStatus = vi.fn();
  const client = createTestClient('default');
  const namespace = 'default';
  const podName = 'test-pod';
  const timeout = 1000;

  (coreApiMock.readNamespacedPodStatus as Mock).mockResolvedValueOnce({ body: terminatingPodMock });

  const result = await client.testWaitForPodDeletion(coreApiMock as CoreV1Api, podName, namespace, timeout);

  expect(result).toBe(false);
});

test('Should throw an error if an unexpected error occurs', async () => {
  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.readNamespacedPodStatus = vi.fn();
  const client = createTestClient('default');
  const namespace = 'default';
  const podName = 'test-pod';

  (coreApiMock.readNamespacedPodStatus as Mock).mockRejectedValueOnce(new Error('Unexpected error'));

  await expect(client.testWaitForPodDeletion(coreApiMock as CoreV1Api, podName, namespace)).rejects.toThrow(
    'Unexpected error',
  );
});

test('Should throw an error if an unexpected error occurs and it differs than 404', async () => {
  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.readNamespacedPodStatus = vi.fn();
  const client = createTestClient('default');
  const namespace = 'default';
  const podName = 'test-pod';

  const errorResponse = { response: { statusCode: 500 } };
  (coreApiMock.readNamespacedPodStatus as Mock).mockRejectedValueOnce(errorResponse);

  await expect(client.testWaitForPodDeletion(coreApiMock as CoreV1Api, podName, namespace)).rejects.toThrow(
    expect.objectContaining(errorResponse),
  );
});

test('Should delete and recreate the pod successfully', async () => {
  const podMock = {
    metadata: {
      name: 'test-pod',
      namespace: 'test-namespace',
      resourceVersion: '123',
      uid: 'uid123',
      selfLink: '/api/v1/namespaces/test-namespace/pods/test-pod',
      creationTimestamp: new Date(),
    },
    status: {},
  };

  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.deleteNamespacedPod = vi.fn();
  coreApiMock.createNamespacedPod = vi.fn();
  const client = createTestClient('default');
  const kubeConfig = client?.kubeConfig;

  kubeConfig.makeApiClient = vi.fn().mockReturnValue(coreApiMock);
  client.waitForPodDeletion = vi.fn().mockResolvedValue(true);

  (coreApiMock.deleteNamespacedPod as Mock).mockResolvedValueOnce({});

  await client.testRestartManuallyCreatedPod(podMock.metadata.name, podMock.metadata.namespace, podMock);

  expect(coreApiMock.deleteNamespacedPod).toHaveBeenCalledWith(podMock.metadata.name, podMock.metadata.namespace);
  expect(client.waitForPodDeletion).toHaveBeenCalledWith(
    expect.anything(),
    podMock.metadata.name,
    podMock.metadata.namespace,
  );
  expect(coreApiMock.createNamespacedPod).toHaveBeenCalledWith(
    podMock.metadata.namespace,
    expect.objectContaining({
      metadata: expect.not.objectContaining({
        resourceVersion: expect.anything(),
        uid: expect.anything(),
        selfLink: expect.anything(),
        creationTimestamp: expect.anything(),
      }),
    }),
  );
});

test('Should throw an error if the pod is not deleted within the expected timeframe', async () => {
  const podMock = {
    metadata: {
      name: 'test-pod',
      namespace: 'test-namespace',
      resourceVersion: '123',
      uid: 'uid123',
      selfLink: '/api/v1/namespaces/test-namespace/pods/test-pod',
      creationTimestamp: new Date(),
    },
    status: {},
  };

  const coreApiMock = vi.fn() as unknown as CoreV1Api;
  coreApiMock.deleteNamespacedPod = vi.fn();
  const client = createTestClient('default');
  const kubeConfig = client?.kubeConfig;

  kubeConfig.makeApiClient = vi.fn().mockReturnValue(coreApiMock);
  client.waitForPodDeletion = vi.fn().mockResolvedValue(false);

  await expect(
    client.testRestartManuallyCreatedPod(podMock.metadata.name, podMock.metadata.namespace, podMock),
  ).rejects.toThrow(
    `pod "${podMock.metadata.name}" in namespace "${podMock.metadata.namespace}" was not deleted within the expected timeframe`,
  );
});

function configureClientToPodRestart(): TestKubernetesClient {
  const client = createTestClient('default');
  client.currentNamespace = 'test-namespace';
  client.checkConnection = vi.fn().mockResolvedValue(true);
  client.checkPodCreationSource = vi.fn().mockReturnValue({ isManuallyCreated: false, controllerType: 'Deployment' });
  client.restartManuallyCreatedPod = vi.fn();
  client.readNamespacedPod = vi.fn().mockResolvedValue({
    metadata: { name: 'test-pod' },
  });
  client.scaleControllerToRestartPods = vi.fn();
  client.getPodController = vi.fn().mockReturnValue({ name: 'test-controller' });
  client.restartJob = vi.fn();

  return client;
}

test('Should throw an error if there is no active namespace during pod restart', async () => {
  const client = configureClientToPodRestart();
  client.currentNamespace = '';

  await expect(client.restartPod('test-pod')).rejects.toThrow('no active namespace');
});

test('Should throw an error if there is not active connection during pod restart', async () => {
  const client = configureClientToPodRestart();
  client.checkConnection = vi.fn().mockResolvedValue(false);

  await expect(client.restartPod('test-pod')).rejects.toThrow('not active connection');
});

test('Should restart a manually created pod', async () => {
  const client = configureClientToPodRestart();
  client.checkPodCreationSource = vi.fn().mockReturnValue({ isManuallyCreated: true });

  await client.restartPod('test-pod');

  expect(client.restartManuallyCreatedPod).toHaveBeenCalledWith('test-pod', 'test-namespace', expect.anything());
});

test('Should restart a pod controlled by a Deployment', async () => {
  const client = configureClientToPodRestart();

  await client.restartPod('test-pod');

  expect(client.scaleControllerToRestartPods).toHaveBeenCalledWith('test-namespace', 'test-controller', 'Deployment');
});

test('Should restart a pod controlled by a Job', async () => {
  const client = configureClientToPodRestart();
  client.checkPodCreationSource = vi.fn().mockReturnValue({ isManuallyCreated: false, controllerType: 'Job' });

  await client.restartPod('test-pod');

  expect(client.restartJob).toHaveBeenCalledWith('test-controller', 'test-namespace');
});

test('Should treats the pod as manually created if no controller is found', async () => {
  const client = configureClientToPodRestart();
  client.getPodController = vi.fn().mockReturnValue({ name: 'dummy-controller-name', kind: 'DummyKind' });
  client.checkPodCreationSource = vi.fn().mockReturnValue({ isManuallyCreated: true, controllerType: undefined });

  await client.restartPod('test-pod');

  expect(client.restartManuallyCreatedPod).toHaveBeenCalledWith('test-pod', 'test-namespace', expect.anything());
});

test('Should throw an error if no metadata found in the pod', async () => {
  const client = configureClientToPodRestart();
  client.readNamespacedPod = vi.fn().mockResolvedValue({});

  await expect(client.restartPod('test-pod')).rejects.toThrow('no metadata found');
});

test('Should throw an error if unable to restart controlled pod', async () => {
  const client = configureClientToPodRestart();
  client.checkPodCreationSource = vi.fn().mockReturnValue({ isManuallyCreated: false, controllerType: undefined });

  await expect(client.restartPod('test-pod')).rejects.toThrow('unable to restart controlled pod');
});
