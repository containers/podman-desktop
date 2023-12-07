import type { ProviderCleanupExecuteOptions } from '@podman-desktop/api';
import { process } from '@podman-desktop/api';

import { homedir } from 'node:os';
import { resolve as pathResolve } from 'node:path';
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
