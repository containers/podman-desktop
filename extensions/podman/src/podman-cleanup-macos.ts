import type { ProviderCleanupExecuteOptions } from '@podman-desktop/api';
import { process } from '@podman-desktop/api';
import psList from 'ps-list';
import { homedir } from 'node:os';
import { resolve as pathResolve } from 'node:path';
import { AbsPodmanCleanup } from './podman-cleanup-abstract';

// Handle cleanup of Podman on macOS
export class PodmanCleanupMacOS extends AbsPodmanCleanup {
  async killProcess(processId: number): Promise<void> {
    await process.exec('/bin/kill', ['-9', String(processId)]);
  }

  async stopPodmanProcesses(options: ProviderCleanupExecuteOptions): Promise<void> {
    // grab process
    const pidsToKill = await this.getProcessesToKill(['gvproxy', 'qemu', 'vfkit']);

    // remove any duplicates in PID
    const uniquePidsToKill = [...new Set(pidsToKill)];

    // kill each process
    for (const pid of uniquePidsToKill) {
      try {
        options.logger.log(`Killing process ${pid}`);
        await this.killProcess(pid);
      } catch (error) {
        options.logger.error('Error killing process', error);
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

  async getProcessesToKill(processNames: string[]): Promise<number[]> {
    const processes = await psList();

    // ok, now split each line and check if it matches one of the process name
    const matchingProcessLines = processes.filter(
      process => process.cmd.includes('podman') && processNames.some(processName => process.cmd.includes(processName)),
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
