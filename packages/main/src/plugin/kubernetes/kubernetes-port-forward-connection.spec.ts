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

import { createServer, type Server, type Socket } from 'node:net';

import { type ForwardConfig, type IDisposable, type PortMapping, WorkloadKind } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  PortForward,
  type V1Deployment,
  type V1Pod,
  type V1Service,
} from '@kubernetes/client-node';
import type { ApiType } from '@kubernetes/client-node/dist/config.js';
import type { V1PodList } from '@kubernetes/client-node/dist/gen/models/V1PodList.js';
import type { WebSocket } from 'isomorphic-ws';
import { afterEach, beforeEach, describe, expect, type MockedFunction, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ExperimentalConfigurationManager } from '/@/plugin/experimental-configuration-manager.js';
import type { FeatureRegistry } from '/@/plugin/feature-registry.js';
import { FilesystemMonitoring } from '/@/plugin/filesystem-monitoring.js';
import { KubernetesClient } from '/@/plugin/kubernetes/kubernetes-client.js';
import {
  type ForwardingSetup,
  PortForwardConnectionService,
} from '/@/plugin/kubernetes/kubernetes-port-forward-connection.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

const apiSender: ApiSenderType = {} as unknown as ApiSenderType;
const configurationRegistry: ConfigurationRegistry = {} as unknown as ConfigurationRegistry;
const fileSystemMonitoring: FilesystemMonitoring = new FilesystemMonitoring();
const telemetry: Telemetry = {} as unknown as Telemetry;
const experimentalConfigurationManager: ExperimentalConfigurationManager = {
  isExperimentalConfigurationEnabled: vi.fn(),
} as unknown as ExperimentalConfigurationManager;
const featureRegistry: FeatureRegistry = {} as unknown as FeatureRegistry;

const mockCoreV1Api = {
  readNamespacedPod: vi.fn(),
  listNamespacedPod: vi.fn(),
  readNamespacedService: vi.fn(),
} as unknown as CoreV1Api;

const mockAppsV1Api = {
  readNamespacedDeployment: vi.fn(),
} as unknown as AppsV1Api;

vi.mock(import('@kubernetes/client-node'));

vi.mock(import('node:net'), async importOriginal => {
  const { Server } = await importOriginal();
  return {
    Server,
    createServer: vi.fn(),
  };
});

const originalFetchFn = global.fetch;

class TestablePortForwardConnectionService extends PortForwardConnectionService {
  public override async performForward(forwardSetup: ForwardingSetup): Promise<IDisposable> {
    return super.performForward(forwardSetup);
  }

  public override async getPod(name: string, namespace: string): Promise<V1Pod> {
    return super.getPod(name, namespace);
  }

  public override async getDeployment(name: string, namespace: string): Promise<V1Deployment> {
    return super.getDeployment(name, namespace);
  }

  public override async getService(name: string, namespace: string): Promise<V1Service> {
    return super.getService(name, namespace);
  }

  public override async getWorkloadResource(
    kind: WorkloadKind,
    name: string,
    namespace: string,
  ): Promise<V1Pod | V1Deployment | V1Service> {
    return super.getWorkloadResource(kind, name, namespace);
  }

  public override getForwardSetupFromPod(pod: V1Pod, forward: PortMapping): ForwardingSetup {
    return super.getForwardSetupFromPod(pod, forward);
  }

  public override async getForwardSetupFromDeployment(
    deployment: V1Deployment,
    forward: PortMapping,
  ): Promise<ForwardingSetup> {
    return super.getForwardSetupFromDeployment(deployment, forward);
  }

  public override async getForwardSetupFromService(service: V1Service, forward: PortMapping): Promise<ForwardingSetup> {
    return super.getForwardSetupFromService(service, forward);
  }

  public override onServerError(
    error: NodeJS.ErrnoException,
    reject: (reason?: Error) => void,
    forwardSetup: ForwardingSetup,
  ): void {
    super.onServerError(error, reject, forwardSetup);
  }

  public override isPodResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isPodResource(resource);
  }

  public override isDeploymentResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isDeploymentResource(resource);
  }

  public override isServiceResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isServiceResource(resource);
  }

  public override async getForwardingSetup(
    resource: V1Pod | V1Deployment | V1Service,
    forward: PortMapping,
  ): Promise<ForwardingSetup> {
    return super.getForwardingSetup(resource, forward);
  }

  public override createServer(forwardSetup: ForwardingSetup): Server {
    return super.createServer(forwardSetup);
  }

  public override getTargetPort(service: V1Service, pod: V1Pod, port: number): number {
    return super.getTargetPort(service, pod, port);
  }
}

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(PortForward.prototype.portForward).mockResolvedValue({} as unknown as WebSocket);
});

describe('PortForwardConnectionService', () => {
  let service: TestablePortForwardConnectionService;

  beforeEach(() => {
    service = new TestablePortForwardConnectionService(
      new KubernetesClient(
        apiSender,
        configurationRegistry,
        fileSystemMonitoring,
        telemetry,
        experimentalConfigurationManager,
        featureRegistry,
      ),
    );
    global.fetch = vi.fn();
    vi.mocked(KubeConfig.prototype.makeApiClient).mockImplementation(api => {
      if (api === CoreV1Api) {
        return mockCoreV1Api;
      }
      if (api === AppsV1Api) {
        return mockAppsV1Api;
      }
      return {} as unknown as ApiType;
    });
  });

  afterEach(() => {
    global.fetch = originalFetchFn;
  });

  test('should create a server for port forwarding', async () => {
    const forwardSetup = {
      name: 'test-pod',
      namespace: 'default',
      forward: { localPort: 3000, remotePort: 80 },
    };

    const server = {
      listen: vi.fn((_port, _host): void => {}),
      on: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(createServer).mockReturnValue(server as unknown as Server);
    (global.fetch as unknown as MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(undefined, { status: 200 }),
    );

    const disposable = await service.performForward(forwardSetup);

    expect(createServer).toHaveBeenCalled();
    expect(server.listen).toHaveBeenCalledWith(3000, 'localhost');
    expect(disposable.dispose).toBeInstanceOf(Function);
  });

  test('should create a server and call portForward with correct arguments', async () => {
    const forwardSetup = {
      name: 'test-pod',
      namespace: 'default',
      forward: { localPort: 3000, remotePort: 80 },
    };

    const socket = {
      on: vi.fn(),
      end: vi.fn(),
    } as unknown as Socket;

    const server = {
      listen: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(createServer).mockImplementation(
      // @ts-expect-error we're sure in the method signature
      (connectionListener?: (socket: net.Socket) => void) => {
        if (connectionListener) {
          connectionListener(socket);
        }
        return server as unknown as Server;
      },
    );

    service = new TestablePortForwardConnectionService(
      new KubernetesClient(
        apiSender,
        configurationRegistry,
        fileSystemMonitoring,
        telemetry,
        experimentalConfigurationManager,
        featureRegistry,
      ),
    );

    const createdServer = service.createServer(forwardSetup as never);

    expect(createServer).toHaveBeenCalled();
    expect(PortForward.prototype.portForward).toHaveBeenCalledWith(
      forwardSetup.namespace,
      forwardSetup.name,
      [forwardSetup.forward.remotePort],
      socket,
      // eslint-disable-next-line no-null/no-null
      null,
      socket,
      3,
    );

    const listeningListener: () => void = vi.fn();
    createdServer.listen(forwardSetup.forward.localPort, 'localhost', listeningListener);

    expect(server.listen).toHaveBeenCalledWith(forwardSetup.forward.localPort, 'localhost', expect.any(Function));
  });

  test('should retrieve a pod resource', async () => {
    vi.mocked(mockCoreV1Api.readNamespacedPod).mockResolvedValue({
      metadata: { name: 'test-pod', namespace: 'default' },
    });

    const pod = await service.getPod('test-pod', 'default');
    expect(pod.metadata?.name).toBe('test-pod');
  });

  test('should retrieve a deployment resource', async () => {
    vi.mocked(mockAppsV1Api.readNamespacedDeployment).mockResolvedValue({
      metadata: { name: 'test-deployment', namespace: 'default' },
    });

    const deployment = await service.getDeployment('test-deployment', 'default');
    expect(deployment.metadata?.name).toBe('test-deployment');
  });

  test('should retrieve a service resource', async () => {
    vi.mocked(mockCoreV1Api.readNamespacedService).mockResolvedValue({
      metadata: { name: 'test-service', namespace: 'default' },
    });

    const serviceResource = await service.getService('test-service', 'default');
    expect(serviceResource.metadata?.name).toBe('test-service');
  });

  test('should throw an error for unsupported workload kind', async () => {
    await expect(service.getWorkloadResource('UNSUPPORTED_KIND' as never, 'test', 'default')).rejects.toThrow(
      `Workload kind 'UNSUPPORTED_KIND' currently not supported.`,
    );
  });

  test('should get forwarding setup from pod', () => {
    const pod = { metadata: { name: 'test-pod', namespace: 'default' } };
    const forward = { localPort: 3000, remotePort: 80 };

    const forwardSetup = service.getForwardSetupFromPod(pod, forward);
    expect(forwardSetup.name).toBe('test-pod');
    expect(forwardSetup.namespace).toBe('default');
    expect(forwardSetup.forward).toEqual(forward);
  });

  test('should get forwarding setup from deployment', async () => {
    const podList = { items: [{ metadata: { name: 'test-pod' } }] };
    vi.mocked(mockCoreV1Api.listNamespacedPod).mockResolvedValue(podList);

    const deployment: V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        namespace: 'default',
      },
      spec: {
        selector: {
          matchLabels: {
            app: 'test-app',
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'test-app',
            },
          },
          spec: {
            containers: [
              {
                name: 'test-container',
                image: 'test-image',
              },
            ],
          },
        },
      },
    };
    const forward = { localPort: 3000, remotePort: 80 };

    const forwardSetup = await service.getForwardSetupFromDeployment(deployment, forward);
    expect(forwardSetup.name).toBe('test-pod');
    expect(forwardSetup.namespace).toBe('default');
    expect(forwardSetup.forward).toEqual(forward);
  });

  test('should get forwarding setup from service', async () => {
    const podList: V1PodList = {
      items: [
        { metadata: { name: 'test-pod' }, spec: { containers: [{ ports: [{ name: 'http', containerPort: 80 }] }] } },
      ],
    } as unknown as V1PodList;
    vi.mocked(mockCoreV1Api.listNamespacedPod).mockResolvedValue(podList);

    const _service: V1Service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: 'test-service',
        namespace: 'default',
      },
      spec: {
        selector: {
          app: 'test-app',
        },
        ports: [
          {
            port: 80,
            targetPort: 'http' as never,
          },
        ],
      },
    };
    const forward = { localPort: 3000, remotePort: 80 };

    const forwardSetup = await service.getForwardSetupFromService(_service, forward);
    expect(forwardSetup.name).toBe('test-pod');
    expect(forwardSetup.namespace).toBe('default');
    expect(forwardSetup.forward.localPort).toBe(3000);
    expect(forwardSetup.forward.remotePort).toBe(80);
  });

  test('should handle server errors correctly', () => {
    const forwardSetup = {
      name: 'test-pod',
      namespace: 'default',
      forward: { localPort: 3000, remotePort: 80 },
    };

    const errorEADDRINUSE = { code: 'EADDRINUSE' } as NodeJS.ErrnoException;
    const errorEACCES = { code: 'EACCES' } as NodeJS.ErrnoException;
    const otherError = { code: 'OTHER_ERROR', message: 'Some other error' } as NodeJS.ErrnoException;

    const reject = vi.fn();

    service.onServerError(errorEADDRINUSE, reject, forwardSetup);
    expect(reject).toHaveBeenCalledWith(new Error('Port 3000 is already in use.'));

    reject.mockReset();
    service.onServerError(errorEACCES, reject, forwardSetup);
    expect(reject).toHaveBeenCalledWith(new Error('Operation requires administrative privileges.'));

    reject.mockReset();
    service.onServerError(otherError, reject, forwardSetup);
    expect(reject).toHaveBeenCalledWith(new Error('Failed to initialize port forwarding server: Some other error'));
  });

  test('should return target port when it is a number (isolated getTargetPort testing)', async () => {
    const serviceResource: V1Service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: 'test-service', namespace: 'default' },
      spec: {
        ports: [
          {
            port: 80,
            targetPort: 8080,
          },
        ],
      },
    };

    const pod: V1Pod = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'test-pod', namespace: 'default' },
      spec: {
        containers: [
          {
            name: 'test-container',
            ports: [{ name: 'http', containerPort: 8080 }],
          },
        ],
      },
    };

    const forward = { localPort: 3000, remotePort: 80 };

    vi.mocked(mockCoreV1Api.listNamespacedPod).mockResolvedValueOnce({
      items: [pod],
    });

    const targetPort = service.getTargetPort(serviceResource, pod, forward.remotePort);

    expect(targetPort).toBe(8080);
  });

  describe('isPodResource', () => {
    test('should return true for Pod resource', () => {
      const podResource = { kind: 'Pod' };
      const result = service.isPodResource(podResource as never);
      expect(result).toBe(true);
    });

    test('should return false for non-Pod resource', () => {
      const nonPodResource = { kind: 'Service' };
      const result = service.isPodResource(nonPodResource as never);
      expect(result).toBe(false);
    });
  });

  describe('isDeploymentResource', () => {
    test('should return true for Deployment resource', () => {
      const deploymentResource = { kind: 'Deployment' };
      const result = service.isDeploymentResource(deploymentResource as never);
      expect(result).toBe(true);
    });

    test('should return false for non-Deployment resource', () => {
      const nonDeploymentResource = { kind: 'Pod' };
      const result = service.isDeploymentResource(nonDeploymentResource as never);
      expect(result).toBe(false);
    });
  });

  describe('isServiceResource', () => {
    test('should return true for Service resource', () => {
      const serviceResource = { kind: 'Service' };
      const result = service.isServiceResource(serviceResource as never);
      expect(result).toBe(true);
    });

    test('should return false for non-Service resource', () => {
      const nonServiceResource = { kind: 'Deployment' };
      const result = service.isServiceResource(nonServiceResource as never);
      expect(result).toBe(false);
    });
  });

  describe('getWorkloadResource', () => {
    test('should retrieve a Pod resource', async () => {
      const pod = { metadata: { name: 'test-pod', namespace: 'default' } };
      vi.mocked(mockCoreV1Api.readNamespacedPod).mockResolvedValue(pod);

      const resource = await service.getWorkloadResource(WorkloadKind.POD, 'test-pod', 'default');
      expect(resource).toEqual(pod);
    });

    test('should retrieve a Deployment resource', async () => {
      const deployment = { metadata: { name: 'test-deployment', namespace: 'default' } };
      vi.mocked(mockAppsV1Api.readNamespacedDeployment).mockResolvedValue(deployment);

      const resource = await service.getWorkloadResource(WorkloadKind.DEPLOYMENT, 'test-deployment', 'default');
      expect(resource).toEqual(deployment);
    });

    test('should retrieve a Service resource', async () => {
      const _service = { metadata: { name: 'test-service', namespace: 'default' } };
      vi.mocked(mockCoreV1Api.readNamespacedService).mockResolvedValue(_service);

      const resource = await service.getWorkloadResource(WorkloadKind.SERVICE, 'test-service', 'default');
      expect(resource).toEqual(_service);
    });

    test('should throw an error for unsupported workload kind', async () => {
      await expect(service.getWorkloadResource('UNSUPPORTED_KIND' as never, 'test', 'default')).rejects.toThrow(
        `Workload kind 'UNSUPPORTED_KIND' currently not supported.`,
      );
    });
  });

  describe('getForwardingSetup', () => {
    test('should get forwarding setup for Pod resource', async () => {
      const pod = { kind: 'Pod', metadata: { name: 'test-pod', namespace: 'default' } };
      const forward = { localPort: 3000, remotePort: 80 };

      const forwardSetup = await service.getForwardingSetup(pod as never, forward);
      expect(forwardSetup.name).toBe('test-pod');
      expect(forwardSetup.namespace).toBe('default');
      expect(forwardSetup.forward).toEqual(forward);
    });

    test('should get forwarding setup for Deployment resource', async () => {
      const deployment: V1Deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          namespace: 'default',
        },
        spec: {
          selector: {
            matchLabels: {
              app: 'test-app',
            },
          },
          template: {
            metadata: {
              labels: {
                app: 'test-app',
              },
            },
            spec: {
              containers: [
                {
                  name: 'test-container',
                  image: 'test-image',
                },
              ],
            },
          },
        },
      };

      const podList = { items: [{ metadata: { name: 'test-pod' } }] };
      vi.mocked(mockCoreV1Api.listNamespacedPod).mockResolvedValue(podList);

      const forward = { localPort: 3000, remotePort: 80 };

      const forwardSetup = await service.getForwardingSetup(deployment, forward);
      expect(forwardSetup.name).toBe('test-pod');
      expect(forwardSetup.namespace).toBe('default');
      expect(forwardSetup.forward).toEqual(forward);
    });

    test('should get forwarding setup for Service resource', async () => {
      const _service: V1Service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'test-service',
          namespace: 'default',
        },
        spec: {
          selector: {
            app: 'test-app',
          },
          ports: [
            {
              port: 80,
              targetPort: 'http' as never,
            },
          ],
        },
      };

      const podList: V1PodList = {
        items: [
          { metadata: { name: 'test-pod' }, spec: { containers: [{ ports: [{ name: 'http', containerPort: 80 }] }] } },
        ],
      } as unknown as V1PodList;
      vi.mocked(mockCoreV1Api.listNamespacedPod).mockResolvedValue(podList);

      const forward = { localPort: 3000, remotePort: 80 };

      const forwardSetup = await service.getForwardingSetup(_service, forward);
      expect(forwardSetup.name).toBe('test-pod');
      expect(forwardSetup.namespace).toBe('default');
      expect(forwardSetup.forward.localPort).toBe(3000);
      expect(forwardSetup.forward.remotePort).toBe(80);
    });

    test('should throw an error for invalid resource type', async () => {
      const invalidResource = { kind: 'InvalidKind' };
      const forward = { localPort: 3000, remotePort: 80 };

      await expect(service.getForwardingSetup(invalidResource as never, forward)).rejects.toThrow(
        'Found invalid resource type.',
      );
    });
  });

  describe('startForward', () => {
    class MockDisposable implements IDisposable {
      dispose = vi.fn();
    }

    test('should start port forwarding successfully', async () => {
      const forwardConfig: ForwardConfig = {
        id: 'fake-id',
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forward: { localPort: 3000, remotePort: 80 },
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      vi.mocked(mockCoreV1Api.readNamespacedPod).mockResolvedValueOnce(pod);

      const disposable1 = new MockDisposable();

      vi.spyOn(service, 'performForward').mockResolvedValueOnce(disposable1);

      const disposable = await service.startForward(forwardConfig);

      expect(service.performForward).toHaveBeenCalledOnce();
      expect(disposable.dispose).toBeInstanceOf(Function);

      disposable.dispose();

      expect(disposable1.dispose).toHaveBeenCalled();
    });

    test('should start port forwarding on specified mapping', async () => {
      const mapping: PortMapping = { localPort: 3001, remotePort: 8080 };
      const forwardConfig: ForwardConfig = {
        id: 'fake-id',
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forward: mapping,
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      vi.mocked(mockCoreV1Api.readNamespacedPod).mockResolvedValueOnce(pod);

      const disposable1 = new MockDisposable();

      vi.spyOn(service, 'performForward').mockResolvedValueOnce(disposable1);

      const disposable = await service.startForward(forwardConfig);

      expect(service.performForward).toHaveBeenCalledTimes(1);
      expect(disposable.dispose).toBeInstanceOf(Function);
    });

    test('should throw an error if port forwarding fails', async () => {
      const forwardConfig: ForwardConfig = {
        id: 'fake-id',
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forward: { localPort: 3000, remotePort: 80 },
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      vi.mocked(mockCoreV1Api.readNamespacedPod).mockResolvedValueOnce(pod);

      vi.spyOn(service, 'performForward').mockRejectedValueOnce(new Error('Failed to forward port'));

      await expect(service.startForward(forwardConfig)).rejects.toThrow('Failed to forward port');

      expect(service.performForward).toHaveBeenCalledTimes(1);
    });
  });
});
