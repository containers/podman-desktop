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

import net from 'node:net';

import {
  AppsV1Api,
  CoreV1Api,
  KubeConfig,
  type V1Deployment,
  type V1Pod,
  type V1Service,
} from '@kubernetes/client-node';
import type fetch from 'node-fetch';
import { Response } from 'node-fetch';
import { afterEach, beforeEach, describe, expect, type MockedFunction, test, vi } from 'vitest';

import { type ForwardingSetup, PortForwardConnectionService } from '/@/plugin/kubernetes-port-forward-connection.js';
import { type ForwardConfig, type PortMapping, WorkloadKind } from '/@/plugin/kubernetes-port-forward-model.js';
import { Disposable, type IDisposable } from '/@/plugin/types/disposable.js';

const mockKubeConfig = {
  makeApiClient: vi.fn(),
};

const mockCoreV1Api = {
  readNamespacedPod: vi.fn(),
  listNamespacedPod: vi.fn(),
  readNamespacedService: vi.fn(),
};

const mockAppsV1Api = {
  readNamespacedDeployment: vi.fn(),
};

const mockPortForward = {
  portForward: vi.fn(),
};

vi.mock('@kubernetes/client-node', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('@kubernetes/client-node')>('@kubernetes/client-node');
  return {
    ...actual,
    KubeConfig: vi.fn(() => mockKubeConfig),
    CoreV1Api: vi.fn(() => mockCoreV1Api),
    AppsV1Api: vi.fn(() => mockAppsV1Api),
    PortForward: vi.fn(() => mockPortForward),
  };
});

vi.mock('node:net', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const { Server } = await vi.importActual<typeof import('node:net')>('node:net');
  return {
    Server,
    default: {
      createServer: vi.fn(() => ({
        listen: vi.fn(),
        on: vi.fn(),
        close: vi.fn(),
      })),
    },
  };
});

const originalFetchFn = global.fetch;

class TestablePortForwardConnectionService extends PortForwardConnectionService {
  public async performForward(forwardSetup: ForwardingSetup): Promise<IDisposable> {
    return super.performForward(forwardSetup);
  }

  public async getPod(name: string, namespace: string): Promise<V1Pod> {
    return super.getPod(name, namespace);
  }

  public async getDeployment(name: string, namespace: string): Promise<V1Deployment> {
    return super.getDeployment(name, namespace);
  }

  public async getService(name: string, namespace: string): Promise<V1Service> {
    return super.getService(name, namespace);
  }

  public async getWorkloadResource(
    kind: WorkloadKind,
    name: string,
    namespace: string,
  ): Promise<V1Pod | V1Deployment | V1Service> {
    return super.getWorkloadResource(kind, name, namespace);
  }

  public getForwardSetupFromPod(pod: V1Pod, forward: PortMapping): ForwardingSetup {
    return super.getForwardSetupFromPod(pod, forward);
  }

  public async getForwardSetupFromDeployment(deployment: V1Deployment, forward: PortMapping): Promise<ForwardingSetup> {
    return super.getForwardSetupFromDeployment(deployment, forward);
  }

  public async getForwardSetupFromService(service: V1Service, forward: PortMapping): Promise<ForwardingSetup> {
    return super.getForwardSetupFromService(service, forward);
  }

  public onServerError(
    error: NodeJS.ErrnoException,
    reject: (reason?: Error) => void,
    forwardSetup: ForwardingSetup,
  ): void {
    super.onServerError(error, reject, forwardSetup);
  }

  public isPodResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isPodResource(resource);
  }

  public isDeploymentResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isDeploymentResource(resource);
  }

  public isServiceResource(resource: V1Pod | V1Deployment | V1Service): boolean {
    return super.isServiceResource(resource);
  }

  public async getForwardingSetup(
    resource: V1Pod | V1Deployment | V1Service,
    forward: PortMapping,
  ): Promise<ForwardingSetup> {
    return super.getForwardingSetup(resource, forward);
  }

  public async onServerListen(
    forwardSetup: ForwardingSetup,
    server: net.Server,
    resolve: (value: IDisposable) => void,
    reject: (reason?: Error) => void,
  ): Promise<void> {
    return super.onServerListen(forwardSetup, server, resolve, reject);
  }

  public createServer(forwardSetup: ForwardingSetup): net.Server {
    return super.createServer(forwardSetup);
  }

  public getTargetPort(service: V1Service, pod: V1Pod, port: number): number {
    return super.getTargetPort(service, pod, port);
  }
}

describe('PortForwardConnectionService', () => {
  let service: TestablePortForwardConnectionService;

  beforeEach(() => {
    service = new TestablePortForwardConnectionService(new KubeConfig());
    global.fetch = vi.fn();
    mockKubeConfig.makeApiClient.mockImplementation(api => {
      if (api === CoreV1Api) {
        return mockCoreV1Api;
      }
      if (api === AppsV1Api) {
        return mockAppsV1Api;
      }
      return undefined;
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
      listen: vi.fn((_port, _host, callback) => callback()),
      on: vi.fn(),
      close: vi.fn(),
    };

    (net.createServer as unknown as MockedFunction<typeof net.createServer>).mockReturnValue(
      server as unknown as net.Server,
    );
    (global.fetch as unknown as MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(undefined, { status: 200 }),
    );

    const disposable = await service.performForward(forwardSetup);

    expect(net.createServer).toHaveBeenCalled();
    expect(server.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
    expect(disposable.dispose).toBeInstanceOf(Function);
  });

  test('should throw an error if server fails to listen', async () => {
    const forwardSetup = {
      name: 'test-pod',
      namespace: 'default',
      forward: { localPort: 3000, remotePort: 80 },
    };

    const server = {
      listen: vi.fn((_port, _host, callback) => callback()),
      on: vi.fn(),
      close: vi.fn(),
    };

    (net.createServer as unknown as MockedFunction<typeof net.createServer>).mockReturnValue(
      server as unknown as net.Server,
    );
    (global.fetch as unknown as MockedFunction<typeof fetch>).mockRejectedValue(new Error('Host is not reachable'));

    await expect(service.performForward(forwardSetup)).rejects.toThrow('Host is not reachable');

    expect(net.createServer).toHaveBeenCalled();
    expect(server.listen).toHaveBeenCalledWith(3000, 'localhost', expect.any(Function));
  });

  test('should dispose and reject when response.ok is not true, (isolated onServerListen testing)', async () => {
    const forwardSetup = {
      name: 'test-pod',
      namespace: 'default',
      forward: { localPort: 3000, remotePort: 80 },
    };

    const server = {
      listen: vi.fn((_port, _host, callback) => callback()),
      on: vi.fn(),
      close: vi.fn(),
    };

    (net.createServer as unknown as MockedFunction<typeof net.createServer>).mockReturnValue(
      server as unknown as net.Server,
    );
    (global.fetch as unknown as MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(undefined, { status: 404 }),
    );

    const dispose = vi.fn();
    const disposable = { dispose, [Symbol.dispose]: dispose };
    const createDisposable = vi.spyOn(Disposable, 'create').mockReturnValue(disposable as never);

    const resolve = vi.fn();
    const reject = vi.fn();

    await service.onServerListen(forwardSetup as never, server as never, resolve, reject);

    expect(dispose).toHaveBeenCalled();
    expect(reject).toHaveBeenCalledWith(new Error('Host is not reachable, received status: 404'));

    createDisposable.mockRestore();
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
    } as unknown as net.Socket;

    const server = {
      listen: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
    };

    (net.createServer as unknown as MockedFunction<typeof net.createServer>).mockImplementation(
      // @ts-expect-error we're sure in the method signature
      (connectionListener?: (socket: net.Socket) => void) => {
        if (connectionListener) {
          connectionListener(socket);
        }
        return server as unknown as net.Server;
      },
    );

    service = new TestablePortForwardConnectionService(new KubeConfig());

    const createdServer = service.createServer(forwardSetup as never);

    expect(net.createServer).toHaveBeenCalled();
    expect(mockPortForward.portForward).toHaveBeenCalledWith(
      forwardSetup.namespace,
      forwardSetup.name,
      [forwardSetup.forward.remotePort],
      socket,
      // eslint-disable-next-line no-null/no-null
      null,
      socket,
      3,
    );

    createdServer.listen(forwardSetup.forward.localPort, 'localhost', vi.fn());

    expect(server.listen).toHaveBeenCalledWith(forwardSetup.forward.localPort, 'localhost', expect.any(Function));
  });

  test('should retrieve a pod resource', async () => {
    mockCoreV1Api.readNamespacedPod.mockResolvedValue({
      body: { metadata: { name: 'test-pod', namespace: 'default' } },
    });

    const pod = await service.getPod('test-pod', 'default');
    expect(pod.metadata?.name).toBe('test-pod');
  });

  test('should retrieve a deployment resource', async () => {
    mockAppsV1Api.readNamespacedDeployment.mockResolvedValue({
      body: { metadata: { name: 'test-deployment', namespace: 'default' } },
    });

    const deployment = await service.getDeployment('test-deployment', 'default');
    expect(deployment.metadata?.name).toBe('test-deployment');
  });

  test('should retrieve a service resource', async () => {
    mockCoreV1Api.readNamespacedService.mockResolvedValue({
      body: { metadata: { name: 'test-service', namespace: 'default' } },
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
    mockCoreV1Api.listNamespacedPod.mockResolvedValue({ body: podList });

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
    const podList = {
      items: [
        { metadata: { name: 'test-pod' }, spec: { containers: [{ ports: [{ name: 'http', containerPort: 80 }] }] } },
      ],
    };
    mockCoreV1Api.listNamespacedPod.mockResolvedValue({ body: podList });

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

    mockCoreV1Api.listNamespacedPod.mockResolvedValueOnce({
      body: { items: [pod] },
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
      mockCoreV1Api.readNamespacedPod.mockResolvedValue({ body: pod });

      const resource = await service.getWorkloadResource(WorkloadKind.POD, 'test-pod', 'default');
      expect(resource).toEqual(pod);
    });

    test('should retrieve a Deployment resource', async () => {
      const deployment = { metadata: { name: 'test-deployment', namespace: 'default' } };
      mockAppsV1Api.readNamespacedDeployment.mockResolvedValue({ body: deployment });

      const resource = await service.getWorkloadResource(WorkloadKind.DEPLOYMENT, 'test-deployment', 'default');
      expect(resource).toEqual(deployment);
    });

    test('should retrieve a Service resource', async () => {
      const _service = { metadata: { name: 'test-service', namespace: 'default' } };
      mockCoreV1Api.readNamespacedService.mockResolvedValue({ body: _service });

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
      mockCoreV1Api.listNamespacedPod.mockResolvedValue({ body: podList });

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

      const podList = {
        items: [
          { metadata: { name: 'test-pod' }, spec: { containers: [{ ports: [{ name: 'http', containerPort: 80 }] }] } },
        ],
      };
      mockCoreV1Api.listNamespacedPod.mockResolvedValue({ body: podList });

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
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forwards: [
          { localPort: 3000, remotePort: 80 },
          { localPort: 3001, remotePort: 8080 },
        ],
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      mockCoreV1Api.readNamespacedPod.mockResolvedValueOnce({ body: pod });

      const disposable1 = new MockDisposable();
      const disposable2 = new MockDisposable();

      vi.spyOn(service, 'performForward').mockResolvedValueOnce(disposable1).mockResolvedValueOnce(disposable2);

      const disposable = await service.startForward(forwardConfig);

      expect(service.performForward).toHaveBeenCalledTimes(2);
      expect(disposable.dispose).toBeInstanceOf(Function);

      disposable.dispose();

      expect(disposable1.dispose).toHaveBeenCalled();
      expect(disposable2.dispose).toHaveBeenCalled();
    });

    test('should throw an error if port forwarding fails', async () => {
      const forwardConfig: ForwardConfig = {
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forwards: [{ localPort: 3000, remotePort: 80 }],
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      mockCoreV1Api.readNamespacedPod.mockResolvedValueOnce({ body: pod });

      vi.spyOn(service, 'performForward').mockRejectedValueOnce(new Error('Failed to forward port'));

      await expect(service.startForward(forwardConfig)).rejects.toThrow('Failed to forward port');

      expect(service.performForward).toHaveBeenCalledTimes(1);
    });

    test('should dispose all successful forwards if any fail', async () => {
      const forwardConfig: ForwardConfig = {
        kind: WorkloadKind.POD,
        name: 'test-pod',
        namespace: 'default',
        forwards: [
          { localPort: 3000, remotePort: 80 },
          { localPort: 3001, remotePort: 8080 },
        ],
      };

      const pod: V1Pod = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: { name: 'test-pod', namespace: 'default' },
      };

      mockCoreV1Api.readNamespacedPod.mockResolvedValueOnce({ body: pod });

      const disposable1 = new MockDisposable();

      vi.spyOn(service, 'performForward')
        .mockResolvedValueOnce(disposable1)
        .mockRejectedValueOnce(new Error('Failed to forward port'));

      await expect(service.startForward(forwardConfig)).rejects.toThrow('Failed to forward port');

      expect(service.performForward).toHaveBeenCalledTimes(2);
      expect(disposable1.dispose).toHaveBeenCalled();
    });
  });
});
