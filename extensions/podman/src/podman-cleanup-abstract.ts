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

import { existsSync, promises } from 'node:fs';

import type { ProviderCleanup, ProviderCleanupAction, ProviderCleanupExecuteOptions } from '@podman-desktop/api';

export abstract class AbsPodmanCleanup implements ProviderCleanup {
  abstract getFoldersToDelete(): string[];
  abstract getContainersConfPath(): string;
  abstract stopPodmanProcesses(options: ProviderCleanupExecuteOptions): Promise<void>;

  // actions that need to be performed
  async getActions(): Promise<ProviderCleanupAction[]> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    const stopAction: ProviderCleanupAction = {
      name: 'stop podman processes',
      async execute(options) {
        await instance.stopPodmanProcesses(options);
      },
    };

    const removeSshKeysAction: ProviderCleanupAction = {
      name: 'Remove podman ssh keys',
      async execute(options) {
        await instance.removeSshKeys(options);
      },
    };

    const removeFoldersAction: ProviderCleanupAction = {
      name: 'Remove Podman folders',
      async execute() {
        await instance.removePodmanFolders();
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
      const sshFiles = [...tomlContent.matchAll(identityRegex)].map(match => match.groups?.identityPath);

      // remove duplicates from the list
      const uniqueSshFiles = [...new Set(sshFiles)];

      options.logger.log('Removing ssh files', uniqueSshFiles);

      // now, duplicate the list by keeping the file and add a new one with .pub suffix
      const allSshFiles = uniqueSshFiles.map(sshFile => [sshFile, sshFile + '.pub']).flat();
      // delete each file (if any)
      for (const sshFile of allSshFiles) {
        try {
          if (sshFile && existsSync(sshFile)) {
            await promises.rm(sshFile);
          }
        } catch (err) {
          options.logger.error('error deleting ssh file', sshFile, err);
        }
      }
    }
  }
}
