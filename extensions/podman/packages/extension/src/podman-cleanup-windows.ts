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

import { AbsPodmanCleanup } from './podman-cleanup-abstract';

export class PodmanCleanupWindows extends AbsPodmanCleanup {
  async stopPodmanProcesses(options: ProviderCleanupExecuteOptions): Promise<void> {
    // stop all running podman machine if there are some
    try {
      // first, grab all running wsl machines
      const wslRunningMachines = await process.exec('wsl', ['--list', '--running', '--quiet'], {
        env: { WSL_UTF8: '1' },
      });

      // if there is any running machine
      if (wslRunningMachines.stdout) {
        // each line is a machine
        const wslRunningMachinesLines = wslRunningMachines.stdout.split('\r\n');

        // for each wsl being a podman machine (prefix podman), let's remove it
        for (const machine of wslRunningMachinesLines.filter(machine => machine.startsWith('podman-'))) {
          options.logger.log(`Stopping WSL machine ${machine}...`);
          // stop it
          try {
            await process.exec('wsl', ['--terminate', machine], { env: { WSL_UTF8: '1' } });
          } catch (error) {
            options.logger.error(`error while stopping machine ${machine}`, error);
          }
        }
      }
    } catch (error) {
      options.logger.error('error while listing running wsl machines', error);
    }

    // remove all podman wsl machine if there are
    try {
      const wslAllMachines = await process.exec('wsl', ['--list', '--quiet'], { env: { WSL_UTF8: '1' } });

      if (wslAllMachines.stdout) {
        // each line is a machine
        const wslMachinesLines = wslAllMachines.stdout.split('\r\n');

        // for each wsl being a podman machine, let's remove it
        for (const machine of wslMachinesLines.filter(machine => machine.startsWith('podman-'))) {
          options.logger.log(`Removing WSL podman machine ${machine}...`);
          // remove it
          try {
            await process.exec('wsl', ['--unregister', machine], { env: { WSL_UTF8: '1' } });
          } catch (error) {
            options.logger.error(`unable to remove WSL podman machine ${machine}`, error);
          }
        }
      }
    } catch (error) {
      options.logger.error('error while listing wsl machines', error);
    }

    // stop processes
    await this.stopProcessesPids(options);
  }

  async getPidProcesses(processNames: string[]): Promise<{ pid: number; name: string }[]> {
    const pids: { pid: number; name: string }[] = [];

    // get all windows processes matching processNames
    for (const processName of processNames) {
      // get all processes matching processName
      const { stdout } = await process.exec('tasklist', ['/fi', `imagename eq ${processName}`]);

      // keep only lines with process name
      const processLines = stdout.split('\r\n').filter(line => line.includes(processName));

      // extract PID which is 2nd column
      const matchingPids = processLines.map(line => line.split(/\s+/)[1]);
      pids.push(...matchingPids.map(pid => ({ pid: Number(pid), name: processName })));
    }

    return pids;
  }

  async terminateProcess(processId: number): Promise<void> {
    await process.exec('taskkill', ['/f', '/pid', `${processId}`]);
  }

  async stopProcessesPids(options: ProviderCleanupExecuteOptions): Promise<void> {
    // grab win-ssh-proxy & gvproxy processes
    const pidsToStop = await this.getPidProcesses(['win-sshproxy.exe', 'gvproxy.exe']);

    // now stop them
    try {
      for (const pidToStop of pidsToStop) {
        options.logger.log(`Stopping process ${pidToStop.name} with pid ${pidToStop.pid}...`);
        // kill it
        try {
          await this.terminateProcess(pidToStop.pid);
        } catch (error) {
          options.logger.error(`unable to kill process ${pidToStop.name}`, error);
        }
      }
    } catch (error) {
      options.logger.error('error while stopping processes', error);
    }
  }

  getContainersConfPath(): string {
    return pathResolve(homedir(), 'AppData/Roaming/containers/containers.conf');
  }

  // folders to remove:
  // ~/AppData/Roaming/containers
  // ~/.config/containers
  // ~/.local/share/containers/podman
  getFoldersToDelete(): string[] {
    const configAppDataFolder = pathResolve(homedir(), 'AppData/Roaming/containers');
    const configContainersFolder = pathResolve(homedir(), '.config/containers');
    const localShareContainersFolder = pathResolve(homedir(), '.local/share/containers/podman');
    return [configAppDataFolder, configContainersFolder, localShareContainersFolder];
  }
}
