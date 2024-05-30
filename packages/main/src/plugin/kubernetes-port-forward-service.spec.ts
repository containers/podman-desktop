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

import type { KubeConfig } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PortForwardConnectionService } from '/@/plugin/kubernetes-port-forward-connection.js';
import type { ForwardConfig, UserForwardConfig } from '/@/plugin/kubernetes-port-forward-model.js';
import {
  KubernetesPortForwardService,
  KubernetesPortForwardServiceProvider,
} from '/@/plugin/kubernetes-port-forward-service.js';
import type { ConfigManagementService } from '/@/plugin/kubernetes-port-forward-storage.js';
import type { IDisposable } from '/@/plugin/types/disposable.js';

vi.mock('/@/plugin/kubernetes-port-forward-connection.js');
vi.mock('/@/plugin/kubernetes-port-forward-storage.js');
vi.mock('/@/plugin/kubernetes-port-forward-validation.js');
vi.mock('/@/plugin/util/port.js');
vi.mock('/@/plugin/directories.js');

class TestKubernetesPortForwardServiceProvider extends KubernetesPortForwardServiceProvider {
  public getKubeConfigKey(kubeConfig: KubeConfig): string {
    return super.getKubeConfigKey(kubeConfig);
  }
}

describe('KubernetesPortForwardServiceProvider', () => {
  let provider: TestKubernetesPortForwardServiceProvider;
  let mockKubeConfig: KubeConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new TestKubernetesPortForwardServiceProvider();
    mockKubeConfig = { currentContext: 'test-context' } as KubeConfig;
  });

  test('should create and return a new service if not already cached', () => {
    const service = provider.getService(mockKubeConfig);

    expect(service).toBeInstanceOf(KubernetesPortForwardService);
    expect(provider['_serviceMap'].get('test-context')).toBe(service);
  });

  test('should return cached service if already created', () => {
    const service1 = provider.getService(mockKubeConfig);
    const service2 = provider.getService(mockKubeConfig);

    expect(service1).toBe(service2);
  });

  test('should generate correct config key', () => {
    const key = provider.getKubeConfigKey(mockKubeConfig);
    expect(key).toBe('test-context');
  });
});

describe('KubernetesPortForwardService', () => {
  let mockConfigManagementService: ConfigManagementService;
  let mockForwardingConnectionService: PortForwardConnectionService;
  let service: KubernetesPortForwardService;

  const sampleUserForwardConfig: UserForwardConfig = {
    name: 'test-name',
    namespace: 'test-namespace',
    kind: 0,
    forwards: [{ localPort: 8080, remotePort: 80 }],
    displayName: 'test-display-name',
  };

  const sampleForwardConfig: ForwardConfig = {
    name: 'test-name',
    namespace: 'test-namespace',
    kind: 0,
    forwards: [{ localPort: 8080, remotePort: 80 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigManagementService = {
      createForward: vi.fn().mockResolvedValue(sampleUserForwardConfig),
      deleteForward: vi.fn().mockResolvedValue(undefined),
      listForwards: vi.fn().mockResolvedValue([sampleUserForwardConfig]),
    } as unknown as ConfigManagementService;

    mockForwardingConnectionService = {
      startForward: vi.fn().mockResolvedValue({ dispose: vi.fn() } as unknown as IDisposable),
    } as unknown as PortForwardConnectionService;

    service = new KubernetesPortForwardService(mockConfigManagementService, mockForwardingConnectionService);
  });

  test('should create a forward configuration', async () => {
    const result = await service.createForward(sampleUserForwardConfig);
    expect(result).toEqual(sampleUserForwardConfig);
    expect(mockConfigManagementService.createForward).toHaveBeenCalledWith(sampleUserForwardConfig);
  });

  test('should delete a forward configuration', async () => {
    await service.deleteForward(sampleUserForwardConfig);
    expect(mockConfigManagementService.deleteForward).toHaveBeenCalledWith(sampleUserForwardConfig);
  });

  test('should list all forward configurations', async () => {
    const result = await service.listForwards();
    expect(result).toEqual([sampleUserForwardConfig]);
    expect(mockConfigManagementService.listForwards).toHaveBeenCalled();
  });

  test('should start port forwarding for a given configuration', async () => {
    const disposable = await service.startForward(sampleForwardConfig);
    expect(disposable).toHaveProperty('dispose');
    expect(mockForwardingConnectionService.startForward).toHaveBeenCalledWith(sampleForwardConfig);
  });
});
