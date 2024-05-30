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

import { describe, expect, test, vi } from 'vitest';

import { type ForwardConfig, WorkloadKind } from '/@/plugin/kubernetes-port-forward-model.js';
import { ForwardConfigRequirements } from '/@/plugin/kubernetes-port-forward-validation.js';

describe('ForwardConfigRequirements', () => {
  const validConfig: ForwardConfig = {
    name: 'validName',
    namespace: 'validNamespace',
    kind: WorkloadKind.POD,
    forwards: [{ localPort: 8080, remotePort: 80 }],
  };

  test('should pass all requirements', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);

    await expect(requirements.checkRuntimeRequirements(validConfig)).resolves.toBeUndefined();
    expect(portChecker).toHaveBeenCalledWith(8080);
  });

  test('should fail with empty resource name', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);
    const invalidConfig = { ...validConfig, name: '' };

    await expect(requirements.checkRuntimeRequirements(invalidConfig)).rejects.toThrow(
      'Found empty resource (Pod, Deployment or Service) name.',
    );
  });

  test('should fail with empty namespace', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);
    const invalidConfig = { ...validConfig, namespace: '' };

    await expect(requirements.checkRuntimeRequirements(invalidConfig)).rejects.toThrow('Found empty namespace.');
  });

  test('should fail with empty port mappings', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);
    const invalidConfig = { ...validConfig, forwards: [] };

    await expect(requirements.checkRuntimeRequirements(invalidConfig)).rejects.toThrow('Found empty port mappings.');
  });

  test('should fail if port is not available', async () => {
    const portChecker = vi.fn().mockRejectedValue(new Error('Port is already in use.'));
    const requirements = new ForwardConfigRequirements(portChecker);

    await expect(requirements.checkRuntimeRequirements(validConfig)).rejects.toThrow();
  });

  test('should aggregate multiple port check failures', async () => {
    const portChecker = vi.fn().mockImplementation(port => {
      if (port === 8080) return Promise.resolve(true);
      if (port === 8081) return Promise.reject(new Error(`Port ${port} is not available`));
      return Promise.resolve(true);
    });
    const requirements = new ForwardConfigRequirements(portChecker);
    const multiPortConfig = {
      ...validConfig,
      forwards: [
        { localPort: 8080, remotePort: 80 },
        { localPort: 8081, remotePort: 81 },
      ],
    };

    await expect(requirements.checkRuntimeRequirements(multiPortConfig)).rejects.toThrow('Port 8081 is not available');
  });
});
