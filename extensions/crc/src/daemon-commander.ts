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

import * as os from 'node:os';
import got from 'got';

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

    if (os.platform() === 'win32') this.apiPath = 'http://unix://?/pipe/crc-http:/api';
  }

  async status(): Promise<Status> {
    const options = {
      url: this.apiPath + '/status',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async logs() {
    const options = {
      url: this.apiPath + '/logs',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async version() {
    const options = {
      url: this.apiPath + '/version',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async start() {
    const options = {
      url: this.apiPath + '/start',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async stop() {
    const options = {
      url: this.apiPath + '/stop',
      method: 'GET',
    };

    const { body } = await got(options);
    return body;
  }

  async delete() {
    const options = {
      url: this.apiPath + '/delete',
      method: 'GET',
    };

    const { body } = await got(options);
    return body;
  }

  async configGet() {
    const options = {
      url: this.apiPath + '/config',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async configSet(values: unknown): Promise<string> {
    const options = {
      url: this.apiPath + '/config',
    };

    await got.post(options, {
      json: true,
      responseType: 'json',
      body: values,
    });
    return 'OK';
  }

  async consoleUrl() {
    const options = {
      url: this.apiPath + '/webconsoleurl',
      method: 'GET',
    };

    const { body } = await got(options);
    return JSON.parse(body);
  }

  async telemetryPost(values: unknown): Promise<string> {
    const options = {
      url: this.apiPath + '/telemetry',
    };

    await got.post(options, {
      json: true,
      responseType: 'json',
      body: values,
    });
    return 'OK';
  }

  async pullSecretStore(value: unknown): Promise<string> {
    const options = {
      url: this.apiPath + '/pull-secret',
    };

    await got.post(options, {
      body: value,
    });
    return 'OK';
  }

  async pullSecretAvailable() {
    const options = {
      url: this.apiPath + '/pull-secret',
      method: 'GET',
    };

    const { body } = await got(options);
    return body;
  }
}
