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

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { KubernetesClient } from './kubernetes-client';
import type { ApiSenderType } from './api';
import type { ConfigurationRegistry } from './configuration-registry';
import { FilesystemMonitoring } from './filesystem-monitoring';
import { KubeConfig } from '@kubernetes/client-node';
import type { Telemetry } from '/@/plugin/telemetry/telemetry';

const configurationRegistry: ConfigurationRegistry = {} as unknown as ConfigurationRegistry;
const fileSystemMonitoring: FilesystemMonitoring = new FilesystemMonitoring();
const telemetry: Telemetry = {
  track: vi.fn().mockImplementation(async () => {
    // do nothing
  }),
} as unknown as Telemetry;
const makeApiClientMock = vi.fn();

beforeAll(() => {
  vi.mock('@kubernetes/client-node', async () => {
    return {
      KubeConfig: vi.fn(),
      CoreV1Api: {},
      AppsV1Api: {},
      CustomObjectsApi: {},
      NetworkingV1Api: {},
      VersionApi: {},
    };
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  KubeConfig.prototype.loadFromFile = vi.fn();
  KubeConfig.prototype.makeApiClient = makeApiClientMock;
});

test('Create Kubernetes resources with empty should return ok', async () => {
  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  await client.createResources('dummy', []);
  expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', { manifestsSize: 0 });
});

test('Create Kubernetes resources with v1 resource should return ok', async () => {
  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const spy = vi.spyOn(client, 'createV1Resource').mockReturnValue(Promise.resolve());
  await client.createResources('dummy', [{ apiVersion: 'v1', kind: 'Namespace' }]);
  expect(spy).toBeCalled();
  expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', { manifestsSize: 1 });
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
      const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
      const createNamespacedDeploymentMock = vi.fn();
      makeApiClientMock.mockReturnValue({
        createNamespacedDeployment: createNamespacedDeploymentMock,
      });

      await client.createResources('dummy', [manifest], namespace);
      expect(createNamespacedDeploymentMock).toBeCalledWith(expectedNamespace, manifest);
      expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', { manifestsSize: 1 });
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
      const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
      const createNamespacedIngressMock = vi.fn();
      makeApiClientMock.mockReturnValue({
        createNamespacedIngress: createNamespacedIngressMock,
      });

      await client.createResources('dummy', [manifest], namespace);
      expect(createNamespacedIngressMock).toBeCalledWith(expectedNamespace, manifest);
      expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', { manifestsSize: 1 });
    });
  },
);

test('Create Kubernetes resources with v1 resource in error should return error', async () => {
  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const spy = vi.spyOn(client, 'createV1Resource').mockRejectedValue(new Error('V1Error'));
  try {
    await client.createResources('dummy', [{ apiVersion: 'v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(spy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('V1Error');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', {
      manifestsSize: 1,
      error: new Error('V1Error'),
    });
  }
});

describe.each([
  { manifest: { apiVersion: 'group/v1', kind: 'Namespace' }, namespace: undefined, expectedNamespace: 'default' },
  { manifest: { apiVersion: 'group/v1', kind: 'Namespace' }, namespace: 'defaultns', expectedNamespace: 'defaultns' },
  {
    manifest: { apiVersion: 'group/v1', kind: 'Namespace', metadata: { namespace: 'demons' } },
    namespace: undefined,
    expectedNamespace: 'demons',
  },
])('Create custom Kubernetes resources should return ok', ({ manifest, namespace, expectedNamespace }) => {
  test(`should use namespace ${expectedNamespace}`, async () => {
    const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
    const spy = vi.spyOn(client, 'createCustomResource').mockReturnValue(Promise.resolve());
    vi.spyOn(client, 'getPlural').mockReturnValue(Promise.resolve('namespaces'));
    await client.createResources('dummy', [manifest], namespace);
    expect(spy).toBeCalledWith(undefined, 'group', 'v1', 'namespaces', expectedNamespace, manifest);
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', { manifestsSize: 1 });
  });
});

test('Create custom Kubernetes resources in error should return error', async () => {
  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const spy = vi.spyOn(client, 'createCustomResource').mockRejectedValue(new Error('CustomError'));
  vi.spyOn(client, 'getPlural').mockReturnValue(Promise.resolve('namespaces'));
  try {
    await client.createResources('dummy', [{ apiVersion: 'group/v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(spy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('CustomError');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', {
      manifestsSize: 1,
      error: new Error('CustomError'),
    });
  }
});

test('Create unknown custom Kubernetes resources should return error', async () => {
  const client = new KubernetesClient({} as ApiSenderType, configurationRegistry, fileSystemMonitoring, telemetry);
  const createSpy = vi.spyOn(client, 'createCustomResource').mockReturnValue(Promise.resolve());
  const pluralSpy = vi.spyOn(client, 'getPlural').mockRejectedValue(new Error('CustomError'));
  try {
    await client.createResources('dummy', [{ apiVersion: 'group/v1', kind: 'Namespace' }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    expect(createSpy).not.toBeCalled();
    expect(pluralSpy).toBeCalled();
    expect(err).to.be.a('Error');
    expect(err.message).equal('CustomError');
    expect(telemetry.track).toHaveBeenCalledWith('kubernetesCreateResource', {
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
