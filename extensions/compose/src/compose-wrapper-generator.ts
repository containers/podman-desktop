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

import { promises } from 'node:fs';

import type * as extensionApi from '@podman-desktop/api';
import mustache from 'mustache';

import type { OS } from './os';
import batMustacheTemplate from './templates/podman-compose.bat.mustache?raw';
import shMustacheTemplate from './templates/podman-compose.sh.mustache?raw';

// Generate the script to run docker-compose by setting up all environment variables
export class ComposeWrapperGenerator {
  constructor(
    private os: OS,
    private binFolder: string,
  ) {}

  protected async generateContent(connection: extensionApi.ProviderContainerConnection): Promise<string> {
    // take first one
    const socketPath = connection.connection.endpoint.socketPath;

    let template;
    if (this.os.isMac() || this.os.isLinux()) {
      template = shMustacheTemplate;
    } else {
      template = batMustacheTemplate;
    }

    // render the template
    return mustache.render(template, { socketPath, binFolder: this.binFolder });
  }

  async generate(connection: extensionApi.ProviderContainerConnection, path: string): Promise<void> {
    // generate content
    const content = await this.generateContent(connection);
    if (content.length > 0) {
      await promises.writeFile(path, content);
    }
  }
}
