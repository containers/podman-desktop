/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { homedir } from 'node:os';
import { resolve as pathResolve } from 'node:path';

import type { ProviderCleanupExecuteOptions } from '@podman-desktop/api';
import { process } from '@podman-desktop/api';
import psList from 'ps-list';

import { AbsPodmanCleanup } from './podman-cleanup-abstract';

// Handle cleanup of Podman on macOS
export class PodmanCleanupMacOS extends AbsPodmanCleanup {
  async terminateProcess(processId: number): Promise<void> {
    await process.exec('/bin/kill', ['-SIGTERM', String(processId)]);
  }

  async stopPodmanProcesses(options: ProviderCleanupExecuteOptions): Promise<void> {
    // grab process
    const pidsToStop = await this.getProcessesToStop(['gvproxy', 'qemu', 'vfkit']);

    // remove any duplicates in PID
    const uniquePidsToStop = [...new Set(pidsToStop)];

    // terminate each process
    for (const pid of uniquePidsToStop) {
      try {
        options.logger.log(`Terminating process ${pid}`);
        await this.terminateProcess(pid);
      } catch (error) {
        options.logger.error('Error terminating process', error);
      }
    }
  }

  // folders to remove:
  // ~/.config/containers
  // ~/.local/share/containers/podman
  getFoldersToDelete(): string[] {
    const configContainersFolder = pathResolve(homedir(), '.config/containers');
    const localShareContainersFolder = pathResolve(homedir(), '.local/share/containers/podman');
    return [configContainersFolder, localShareContainersFolder];
  }

  async getProcessesToStop(processNames: string[]): Promise<number[]> {
    const processes = await psList();

    // ok, now split each line and check if it matches one of the process name
    const matchingProcessLines = processes.filter(
      process =>
        process.cmd?.includes('podman') && processNames.some(processName => process.cmd?.includes(processName)),
    );

    // now we have the list of processes, let's find the pid and kill it
    return matchingProcessLines.map(process => {
      return process.pid;
    });
  }

  getContainersConfPath(): string {
    return pathResolve(homedir(), '.config/containers/containers.conf');
  }
}
