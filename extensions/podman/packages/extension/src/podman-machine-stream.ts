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

import { Client } from 'ssh2';
import { MachineInfo } from './extension';
import * as fs from 'fs';
import { EventEmitter, ProviderConnectionShellAccess, ProviderConnectionShellAccessData, Event } from '@podman-desktop/api';

export class PodmanMachineStream {
  #host: string;
  #port: number;
  #username: string;
  #privateKey: string;
  #client: Client;

  constructor(private readonly podmanMachine: MachineInfo) {
    this.#host = 'localhost';
    this.#port = podmanMachine.port;
    this.#username = podmanMachine.remoteUsername;
    this.#privateKey = podmanMachine.identityPath;
    this.#client = new Client();
  }

  onDataEmit = new EventEmitter<ProviderConnectionShellAccessData>();
  onData: Event<ProviderConnectionShellAccessData> = this.onDataEmit.event

  onEnd () {

  }

  onError() {

  }

  init() {
    this.#client.on('ready', () => {
      this.#client.shell((err, stream) => {
        if (err) {
          // shellAccess.onError;
        };

        stream.on('close', () => {
          // shellAccess.onEnd;
          this.#client.end();

        }).on('data', (data:Buffer) => {
          console.log(data.toString('utf-8')); 
          this.onDataEmit.fire({data: data.toString('utf-8')});
        });

        stream.write('ls -al\n');
        stream.end('exit\n');
      });
    }).connect({
        host: this.#host,
        port: this.#port,
        username: this.#username,
        privateKey: fs.readFileSync(this.#privateKey),
      });
  }
}
