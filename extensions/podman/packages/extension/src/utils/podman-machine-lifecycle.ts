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
import { injectable } from 'inversify';
import { gte } from 'semver';

import { execPodman } from './util';

export interface PodmanMachineRestartOptions {
  machineName?: string;
  vmType?: string;
  podmanVersion?: string;
  runOptions?: RunOptions;
}

@injectable()
export class PodmanMachineLifecycle {
  private static readonly PODMAN_MINIMUM_VERSION_FOR_MACHINE_RESTART = '6.1.0';

  async restart({ machineName, vmType, podmanVersion, runOptions }: PodmanMachineRestartOptions): Promise<void> {
    const args = machineName ? [machineName] : [];

    if (podmanVersion && gte(podmanVersion, PodmanMachineLifecycle.PODMAN_MINIMUM_VERSION_FOR_MACHINE_RESTART)) {
      await execPodman(['machine', 'restart', ...args], vmType, runOptions);
      return;
    }

    await execPodman(['machine', 'stop', ...args], vmType);
    await execPodman(['machine', 'start', ...args], vmType, runOptions);
  }
}
