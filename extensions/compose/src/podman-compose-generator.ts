/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { OS } from './os';
import * as extensionApi from '@podman-desktop/api';
import { promises } from 'node:fs';
import mustache from 'mustache';

import shMustacheTemplate from './templates/podman-compose.sh.mustache?raw';
import batMustacheTemplate from './templates/podman-compose.bat.mustache?raw';

// Generate the script to run docker-compose by setting up all environment variables
export class PodmanComposeGenerator {
  constructor(private os: OS, private binFolder: string) {}

  protected async generateContent(): Promise<string> {
    // grab the current connection to container engine
    const connections = extensionApi.provider.getContainerConnections();
    const startedConnections = connections.filter(
      providerConnection => providerConnection.connection.status() === 'started',
    );
    if (startedConnections.length === 0) {
      extensionApi.window.showErrorMessage('No connection to container engine is started');
      return;
    }
    // take first one
    const socketPath = startedConnections[0].connection.endpoint.socketPath;

    let template;
    if (this.os.isMac() || this.os.isLinux()) {
      template = shMustacheTemplate;
    } else {
      template = batMustacheTemplate;
    }

    // render the template
    return mustache.render(template, { socketPath, binFolder: this.binFolder });
  }

  async generate(path: string): Promise<void> {
    // generate content
    const content = await this.generateContent();

    await promises.writeFile(path, content);
  }
}
