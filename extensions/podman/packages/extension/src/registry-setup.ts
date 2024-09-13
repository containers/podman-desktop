/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import { isLinux, isMac, isWindows } from './util';

export type ContainerAuthConfigEntry = {
  [key: string]: {
    auth: string;
    podmanDesktopAlias: string | undefined;
  };
};

export type ContainersAuthConfigFile = {
  auths?: ContainerAuthConfigEntry;
};

export class RegistrySetup {
  private localRegistries: Map<string, extensionApi.Registry> = new Map();

  protected getAuthFileLocation(): string {
    let podmanConfigContainersPath = '';

    if (isMac() || isWindows()) {
      podmanConfigContainersPath = path.resolve(os.homedir(), '.config/containers');
    } else if (isLinux()) {
      const xdgRuntimeDirectory = process.env['XDG_RUNTIME_DIR'] ?? '';
      podmanConfigContainersPath = path.resolve(xdgRuntimeDirectory, 'containers');
    }

    // resolve the auth.json file path
    return path.resolve(podmanConfigContainersPath, 'auth.json');
  }

  protected async updateRegistries(): Promise<void> {
    // read the file
    const authFile = await this.readAuthFile();
    const inFileRegistries: extensionApi.Registry[] = [];
    const source = 'podman';
    if (authFile.auths) {
      // loop over the auth entries
      for (const [key, value] of Object.entries(authFile.auths)) {
        const serverUrl = key;
        const decoded = Buffer.from(value.auth, 'base64').toString();

        // split the decoded string into username and password separated by :
        const [username, secret] = decoded.split(':');

        const registry = {
          source,
          serverUrl,
          username,
          secret,
          alias: value['podmanDesktopAlias'],
        };
        inFileRegistries.push(registry);
      }
    }

    // compare file and inMemory registries
    // For each registry in the file that is not in the inMemory, add it
    const toBeAdded = inFileRegistries.filter(fileRegistry => !this.localRegistries.has(fileRegistry.serverUrl));
    toBeAdded.forEach(registry => {
      // do not use the disposable from registerRegistry as we want to keep the registry after extension is stopped.
      extensionApi.registry.registerRegistry(registry);
      this.localRegistries.set(registry.serverUrl, registry);
    });
    // For each registry in the inMemory that is not in the file, remove it
    const toBeRemoved = Array.from(this.localRegistries.values()).filter(
      localRegistry =>
        !inFileRegistries.find(inFileLocalRegistry => inFileLocalRegistry.serverUrl === localRegistry.serverUrl),
    );
    toBeRemoved.forEach(registry => {
      this.localRegistries.delete(registry.serverUrl);
      extensionApi.registry.unregisterRegistry(registry);
    });
  }

  public async setup(): Promise<void> {
    extensionApi.registry.registerRegistryProvider({
      name: 'podman',
      create: function (registryCreateOptions: extensionApi.RegistryCreateOptions): extensionApi.Registry {
        const registry: extensionApi.Registry = {
          source: '',
          ...registryCreateOptions,
        };
        return registry;
      },
    });
    // handle addition of the registry in the file
    extensionApi.registry.onDidRegisterRegistry(async registry => {
      // external change, update the local registries
      if (!this.localRegistries.has(registry.serverUrl)) {
        this.localRegistries.set(registry.serverUrl, registry);
        // update the file
        const authFile = await this.readAuthFile();
        if (!authFile.auths) {
          authFile.auths = {};
        }
        authFile.auths[registry.serverUrl] = {
          auth: Buffer.from(`${registry.username}:${registry.secret}`).toString('base64'),
          podmanDesktopAlias: registry.alias,
        };

        await this.writeAuthFile(JSON.stringify(authFile, undefined, 8));
      }
    });

    // handle removal of the registry in the file
    extensionApi.registry.onDidUnregisterRegistry(async registry => {
      // external change, update the local registries
      if (this.localRegistries.has(registry.serverUrl)) {
        this.localRegistries.delete(registry.serverUrl);
        // update the file
        const authFile = await this.readAuthFile();
        if (authFile.auths) {
          delete authFile.auths[registry.serverUrl];
        }
        await this.writeAuthFile(JSON.stringify(authFile, undefined, 8));
      }
    });

    // handle update of the registry in the file
    extensionApi.registry.onDidUpdateRegistry(async registry => {
      // external change, update the local registries
      if (this.localRegistries.has(registry.serverUrl)) {
        this.localRegistries.set(registry.serverUrl, registry);
        // update the file
        const authFile = await this.readAuthFile();
        if (!authFile.auths) {
          authFile.auths = {};
        }
        authFile.auths[registry.serverUrl] = {
          auth: Buffer.from(`${registry.username}:${registry.secret}`).toString('base64'),
          podmanDesktopAlias: registry.alias,
        };

        await this.writeAuthFile(JSON.stringify(authFile, undefined, 8));
      }
    });

    // check if the file exists
    if (!fs.existsSync(this.getAuthFileLocation())) {
      return;
    }

    // need to monitor this file
    fs.watchFile(this.getAuthFileLocation(), () => {
      this.updateRegistries().catch((error: unknown) => {
        console.error('Error updating registries', error);
      });
    });

    // else init with the content of this file
    await this.updateRegistries();
  }

  protected async readAuthFile(): Promise<ContainersAuthConfigFile> {
    // when we have a fresh installation of podman, auth file might not have been created
    if (!fs.existsSync(this.getAuthFileLocation())) {
      const emptyAuthFile = { auths: {} } as ContainersAuthConfigFile;
      await this.writeAuthFile(JSON.stringify(emptyAuthFile, undefined, 8));
    }

    return new Promise((resolve, reject) => {
      fs.readFile(this.getAuthFileLocation(), 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          let authFile: ContainersAuthConfigFile;
          try {
            authFile = JSON.parse(data);
          } catch (error) {
            console.error('Error parsing auth file', error);
            // return empty auth file
            resolve({});
            return;
          }
          resolve(authFile);
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected writeAuthFile(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.getAuthFileLocation(), data, 'utf8', err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
