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

import { createHash } from 'node:crypto';
import { existsSync, promises } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { isWindows } from '/@/util.js';
import type { DockerContextInfo } from '/@api/docker-compatibility-info.js';

import { DockerCompatibility } from './docker-compatibility.js';

// omit current context as it is coming from another source
// disabling the rule as we're not only extending the interface but omitting one field
// but the rule is not able to understand that
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DockerContextParsingInfo extends Omit<DockerContextInfo, 'isCurrentContext'> {}

/**
 * Handle the `docker context`, allowing to list them and switch between them.
 */
export class DockerContextHandler {
  protected getDockerConfigPath(): string {
    return join(homedir(), '.docker', 'config.json');
  }

  protected async getCurrentContext(): Promise<string> {
    let currentContext: string = 'default';

    // if $HOME/.docker/config.json exists, read it and get the current context
    const dockerConfigExists = existsSync(this.getDockerConfigPath());
    if (dockerConfigExists) {
      // read the file and get the current context
      // if there is a current context, add it to the list
      const content = await promises.readFile(this.getDockerConfigPath(), 'utf-8');
      try {
        const config = JSON.parse(content);
        // only set the name if it is not empty
        if (config.currentContext) {
          currentContext = config.currentContext;
        }
      } catch (error) {
        console.error('Error parsing docker config file', error);
      }
    }

    return currentContext;
  }

  protected async getContexts(): Promise<DockerContextParsingInfo[]> {
    const contexts: DockerContextParsingInfo[] = [];

    const defaultHostForWindows = `npipe://${DockerCompatibility.WINDOWS_NPIPE}`;
    const defaultHostForMacOrLinux = `unix://${DockerCompatibility.UNIX_SOCKET_PATH}`;

    // adds the default context
    contexts.push({
      name: 'default',
      metadata: {
        description: 'Default context',
      },
      endpoints: {
        docker: {
          host: isWindows() ? defaultHostForWindows : defaultHostForMacOrLinux,
        },
      },
    });

    // now, read the ~/.docker/contexts/meta directory if it exists
    const dockerContextsMetaPath = join(homedir(), '.docker', 'contexts', 'meta');
    const dockerContextsMetaExists = existsSync(dockerContextsMetaPath);
    // no directories, no contexts !
    if (!dockerContextsMetaExists) {
      return contexts;
    }
    const filesAndDirectories = await promises.readdir(dockerContextsMetaPath, { withFileTypes: true });

    // keep only directories
    const directories = filesAndDirectories.filter(dirent => dirent.isDirectory());

    // for each directory, read the content of the meta.json file
    // the directory name is the context name encoded with sha256
    for (const directory of directories) {
      const contextSha256Name = directory.name;
      const metaFilePath = join(dockerContextsMetaPath, contextSha256Name, 'meta.json');
      const metaFileExists = existsSync(metaFilePath);
      if (metaFileExists) {
        const metaContent = await promises.readFile(metaFilePath, 'utf-8');
        try {
          const meta = JSON.parse(metaContent);
          const context: DockerContextParsingInfo = {
            name: meta.Name,
            metadata: {
              description: meta.Description,
            },
            endpoints: {
              docker: {
                host: meta?.Endpoints?.docker?.Host,
              },
            },
          };

          // check the context.name being the same as the directory name encoded
          // using sha256 from the context.name
          const readContextSha256Name = createHash('sha256').update(context.name).digest('hex');
          if (readContextSha256Name !== contextSha256Name) {
            console.error(
              `Context name ${context.name} does not match the directory name ${contextSha256Name}. Found ${readContextSha256Name}`,
            );
            continue;
          }
          contexts.push(context);
        } catch (error) {
          console.error('Error parsing docker context meta file', error);
        }
      }
    }

    return contexts;
  }

  async listContexts(): Promise<DockerContextInfo[]> {
    const currentContext = await this.getCurrentContext();

    const readContexts = await this.getContexts();
    // update the isCurrentContext field
    return readContexts.map(context => {
      return {
        ...context,
        isCurrentContext: context.name === currentContext,
      };
    });
  }

  async switchContext(contextName: string): Promise<void> {
    const dockerConfigExists = existsSync(this.getDockerConfigPath());
    if (!dockerConfigExists) {
      throw new Error(`Docker config file ${this.getDockerConfigPath()} does not exist`);
    }

    // check if the context exists
    const allContexts = await this.getContexts();

    const foundContext = allContexts.find(context => context.name === contextName);

    if (!foundContext) {
      throw new Error(`Context ${contextName} not found`);
    }

    // now, write the context name to the ~/.docker/config.json file
    // read current content
    const content = await promises.readFile(this.getDockerConfigPath(), 'utf-8');
    let config;
    try {
      config = JSON.parse(content);
    } catch (error: unknown) {
      throw new Error(`Error parsing docker config file: ${String(error)}`);
    }
    // update the current context or drop the field if it is the default context
    if (contextName === 'default') {
      delete config.currentContext;
    } else {
      config.currentContext = contextName;
    }

    // write back the file with the current context and using tabs for indentation
    await promises.writeFile(this.getDockerConfigPath(), JSON.stringify(config, null, '\t'));
  }
}
