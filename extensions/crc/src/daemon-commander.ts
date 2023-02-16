/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import got from 'got';
import { isWindows } from './util';

export interface Status {
  readonly CrcStatus: string;
  readonly Preset?: string;
  readonly OpenshiftStatus?: string;
  readonly OpenshiftVersion?: string;
  readonly PodmanVersion?: string;
  readonly DiskUse?: number;
  readonly DiskSize?: number;
}

export class DaemonCommander {
  private apiPath: string;

  constructor() {
    this.apiPath = `http://unix:${process.env.HOME}/.crc/crc-http.sock:/api`;

    if (isWindows()) {
      this.apiPath = 'http://unix://?/pipe/crc-http:/api';
    }
  }

  async status(): Promise<Status> {
    const url = this.apiPath + '/status';

    try {
      const { body } = await got.get(url);
      return JSON.parse(body);
    } catch (error) {
      // ignore status error, as it may happen when no cluster created
      return {
        CrcStatus: 'No Cluster',
      };
    }
  }

  async logs() {
    const url = this.apiPath + '/logs';
    const { body } = await got.get(url);
    return JSON.parse(body);
  }

  async version() {
    const url = this.apiPath + '/version';

    const { body } = await got(url);
    return JSON.parse(body);
  }

  async start() {
    const url = this.apiPath + '/start';
    const { body } = await got.get(url);
    return JSON.parse(body);
  }

  async stop() {
    const url = this.apiPath + '/stop';

    const { body } = await got.get(url);
    return body;
  }

  async delete() {
    const url = this.apiPath + '/delete';

    const { body } = await got.get(url);
    return body;
  }

  async configGet() {
    const url = this.apiPath + '/config';

    const { body } = await got(url);
    return JSON.parse(body);
  }

  async consoleUrl() {
    const url = this.apiPath + '/webconsoleurl';

    const { body } = await got(url);
    return JSON.parse(body);
  }

  async pullSecretStore(value: unknown): Promise<string> {
    const url = this.apiPath + '/pull-secret';

    await got.post(url, {
      json: value,
    });
    return 'OK';
  }

  async pullSecretAvailable() {
    const url = this.apiPath + '/pull-secret';

    const { body } = await got.get(url);
    return body;
  }
}
