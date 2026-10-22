/*********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
 ********************************************************************/

import type { RunOptions } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PodmanMachineLifecycle } from './podman-machine-lifecycle';
import { execPodman } from './util';

vi.mock(import('./util'));

let podmanMachineLifecycle: PodmanMachineLifecycle;

beforeEach(() => {
  vi.resetAllMocks();
  podmanMachineLifecycle = new PodmanMachineLifecycle();
});

describe('PodmanMachineLifecycle.restart', () => {
  const machineName = 'podman-machine-default';
  const vmType = 'applehv';

  test.each([
    { version: '5.6.0', usesNativeRestart: false },
    { version: '6.0.9', usesNativeRestart: false },
    { version: '6.1.0', usesNativeRestart: true },
    { version: undefined, usesNativeRestart: false },
  ])('selects the correct restart operation for Podman $version', async ({ version, usesNativeRestart }) => {
    await podmanMachineLifecycle.restart({ machineName, vmType, podmanVersion: version });

    if (usesNativeRestart) {
      expect(execPodman).toHaveBeenCalledTimes(1);
      expect(execPodman).toHaveBeenCalledWith(['machine', 'restart', machineName], vmType, undefined);
    } else {
      expect(execPodman).toHaveBeenCalledTimes(2);
      expect(execPodman).toHaveBeenNthCalledWith(1, ['machine', 'stop', machineName], vmType);
      expect(execPodman).toHaveBeenNthCalledWith(2, ['machine', 'start', machineName], vmType, undefined);
    }
  });

  test('passes run options to the restart command', async () => {
    const runOptions: RunOptions = {};

    await podmanMachineLifecycle.restart({ machineName, vmType, podmanVersion: '6.1.0', runOptions });

    expect(execPodman).toHaveBeenCalledWith(['machine', 'restart', machineName], vmType, runOptions);
  });

  test('passes run options to the start fallback', async () => {
    const runOptions: RunOptions = {};

    await podmanMachineLifecycle.restart({ machineName, vmType, podmanVersion: '6.0.9', runOptions });

    expect(execPodman).toHaveBeenNthCalledWith(2, ['machine', 'start', machineName], vmType, runOptions);
  });

  test('omits machine name when restarting the default machine', async () => {
    await podmanMachineLifecycle.restart({ podmanVersion: '6.1.0' });

    expect(execPodman).toHaveBeenCalledWith(['machine', 'restart'], undefined, undefined);
  });

  test('propagates restart errors', async () => {
    vi.mocked(execPodman).mockRejectedValueOnce(new Error('restart failed'));

    await expect(podmanMachineLifecycle.restart({ machineName, vmType, podmanVersion: '6.1.0' })).rejects.toThrow(
      'restart failed',
    );
  });
});
