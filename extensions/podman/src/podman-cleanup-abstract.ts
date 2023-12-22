import type { ProviderCleanup, ProviderCleanupAction, ProviderCleanupExecuteOptions } from '@podman-desktop/api';
import { existsSync, promises } from 'node:fs';

export abstract class AbsPodmanCleanup implements ProviderCleanup {
  abstract getFoldersToDelete(): string[];
  abstract getContainersConfPath(): string;
  abstract stopPodmanProcesses(options: ProviderCleanupExecuteOptions): Promise<void>;

  // actions that need to be performed
  async getActions(): Promise<ProviderCleanupAction[]> {
    const stopAction: ProviderCleanupAction = {
      name: 'stop podman processes',
      async execute(options) {
        await this.stopPodmanProcesses(options);
      },
    };

    const removeSshKeysAction: ProviderCleanupAction = {
      name: 'Remove podman ssh keys',
      async execute(options) {
        await this.removeSshKeys(options);
      },
    };

    const removeFoldersAction: ProviderCleanupAction = {
      name: 'Remove Podman folders',
      async execute() {
        await this.removePodmanFolders();
      },
    };

    return [stopAction, removeSshKeysAction, removeFoldersAction];
  }

  async removePodmanFolders(): Promise<void> {
    // now, delete all podman folders
    for (const folder of this.getFoldersToDelete()) {
      if (existsSync(folder)) {
        await promises.rm(folder, { recursive: true });
      }
    }
  }

  async removeSshKeys(options: ProviderCleanupExecuteOptions): Promise<void> {
    // read containers.conf file from ~/.config/containers/containers.conf using Node.JS fs.readFile API
    // then parse the file using ini.parse API

    const containersConfPath = this.getContainersConfPath();

    // if exists
    if (existsSync(containersConfPath)) {
      const tomlContent = await promises.readFile(containersConfPath, 'utf8');

      // parse the content to find identity = "/Users/../.ssh/*" files

      // find all identity = ".../.ssh/podman-machine-default" in tomlContent
      const identityRegex = /identity\s*=\s*"(?<identityPath>.*)"/g;
      const sshFiles = [...tomlContent.matchAll(identityRegex)].map(match => match.groups.identityPath);

      // remove duplicates from the list
      const uniqueSshFiles = [...new Set(sshFiles)];

      options.logger.log('Removing ssh files', uniqueSshFiles);

      // now, duplicate the list by keeping the file and add a new one with .pub suffix
      const allSshFiles = uniqueSshFiles.map(sshFile => [sshFile, sshFile + '.pub']).flat();
      // delete each file (if any)
      for (const sshFile of allSshFiles) {
        try {
          if (existsSync(sshFile)) {
            await promises.rm(sshFile);
          }
        } catch (err) {
          options.logger.error('error deleting ssh file', sshFile, err);
        }
      }
    }
  }
}
