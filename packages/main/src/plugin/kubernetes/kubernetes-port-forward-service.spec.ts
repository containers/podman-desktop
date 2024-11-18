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

import type { UUID } from 'node:crypto';
import { randomUUID } from 'node:crypto';

import type { KubeConfig } from '@kubernetes/client-node';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';
import type { PortForwardConnectionService } from '/@/plugin/kubernetes/kubernetes-port-forward-connection.js';
import {
  KubernetesPortForwardService,
  KubernetesPortForwardServiceProvider,
} from '/@/plugin/kubernetes/kubernetes-port-forward-service.js';
import type { ConfigManagementService } from '/@/plugin/kubernetes/kubernetes-port-forward-storage.js';
import type { IDisposable } from '/@/plugin/types/disposable.js';
import type { ForwardConfig } from '/@api/kubernetes-port-forward-model.js';
import { WorkloadKind } from '/@api/kubernetes-port-forward-model.js';

vi.mock('/@/plugin/kubernetes/kubernetes-port-forward-connection.js');
vi.mock('/@/plugin/kubernetes/kubernetes-port-forward-storage.js');
vi.mock('/@/plugin/kubernetes/kubernetes-port-forward-validation.js');
vi.mock('/@/plugin/util/port.js');
vi.mock('/@/plugin/directories.js');
vi.mock('node:crypto');

class TestKubernetesPortForwardServiceProvider extends KubernetesPortForwardServiceProvider {
  public override getKubeConfigKey(kubeConfig: KubeConfig): string {
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

  test('should generate correct config key', () => {
    const key = provider.getKubeConfigKey(mockKubeConfig);
    expect(key).toBe('test-context');
  });
});

describe('KubernetesPortForwardService', () => {
  let mockConfigManagementService: ConfigManagementService;
  let mockForwardingConnectionService: PortForwardConnectionService;
  let service: KubernetesPortForwardService;
  const apiSenderMock: ApiSenderType = {
    send: vi.fn(),
    receive: vi.fn(),
  };

  const sampleForwardConfig: ForwardConfig = {
    id: 'fake-id',
    name: 'test-name',
    namespace: 'test-namespace',
    kind: WorkloadKind.POD,
    forward: { localPort: 8080, remotePort: 80 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigManagementService = {
      createForward: vi.fn().mockResolvedValue(sampleForwardConfig),
      deleteForward: vi.fn().mockResolvedValue(undefined),
      updateForward: vi.fn().mockResolvedValue(sampleForwardConfig),
      listForwards: vi.fn().mockResolvedValue([sampleForwardConfig]),
    } as unknown as ConfigManagementService;

    mockForwardingConnectionService = {
      startForward: vi.fn().mockResolvedValue({ dispose: vi.fn() } as unknown as IDisposable),
    } as unknown as PortForwardConnectionService;

    service = new KubernetesPortForwardService(
      mockConfigManagementService,
      mockForwardingConnectionService,
      apiSenderMock,
    );
    vi.mocked(randomUUID).mockReturnValue('fake-id' as UUID);
  });

  test('should create a forward configuration', async () => {
    vi.mocked(mockConfigManagementService.listForwards).mockResolvedValue([]);
    const forward = sampleForwardConfig.forward;
    if (!forward) throw new Error('undefined forward');

    const result = await service.createForward({
      name: sampleForwardConfig.name,
      kind: sampleForwardConfig.kind,
      namespace: sampleForwardConfig.namespace,
      forward: forward,
    });
    expect(result).toEqual(sampleForwardConfig);
    expect(mockConfigManagementService.createForward).toHaveBeenCalledWith(sampleForwardConfig);
    expect(apiSenderMock.send).toHaveBeenCalledWith('kubernetes-port-forwards-update', []);
  });

  test('should delete a forward configuration', async () => {
    await service.deleteForward(sampleForwardConfig);
    expect(mockConfigManagementService.deleteForward).toHaveBeenCalledWith(sampleForwardConfig);
    expect(apiSenderMock.send).toHaveBeenCalledWith('kubernetes-port-forwards-update', []);
  });

  test('should list all forward configurations', async () => {
    const result = await service.listForwards();
    expect(result).toEqual([sampleForwardConfig]);
    expect(mockConfigManagementService.listForwards).toHaveBeenCalled();
  });

  test('should dispose for a given configuration', async () => {
    const disposeMock = vi.fn();
    vi.mocked(mockForwardingConnectionService.startForward).mockResolvedValue({
      dispose: disposeMock,
    });

    const disposable = await service.startForward(sampleForwardConfig);
    expect(disposable).toHaveProperty('dispose');

    service.dispose();
    expect(disposeMock).toHaveBeenCalled();
  });
});
