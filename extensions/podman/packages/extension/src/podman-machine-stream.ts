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

import * as fs from 'node:fs';

import type {
  Event,
  ProviderConnectionShellAccessData,
  ProviderConnectionShellAccessError,
  ShellDimensions,
} from '@podman-desktop/api';
import { EventEmitter } from '@podman-desktop/api';
import type { ClientChannel } from 'ssh2';
import { Client } from 'ssh2';

import type { MachineInfo } from './extension';

export class PodmanMachineStream {
  #host: string;
  #port: number;
  #username: string;
  #privateKey: string;
  #client: Client;
  #stream: ClientChannel | undefined;
  #connected: boolean = false;

  constructor(private readonly podmanMachine: MachineInfo) {
    this.#host = 'localhost';
    this.#port = podmanMachine.port;
    this.#username = podmanMachine.remoteUsername;
    this.#privateKey = podmanMachine.identityPath;
    this.#client = new Client();
  }

  onDataEmit = new EventEmitter<ProviderConnectionShellAccessData>();
  onData: Event<ProviderConnectionShellAccessData> = this.onDataEmit.event;

  onErrorEmit = new EventEmitter<ProviderConnectionShellAccessError>();
  onError: Event<ProviderConnectionShellAccessError> = this.onErrorEmit.event;

  onEndEmit = new EventEmitter<void>();
  onEnd: Event<void> = this.onEndEmit.event;

  write(data: string): void {
    if (this.#stream) {
      this.#stream.write(data);
    }
  }

  setWindow(dimensions: ShellDimensions): void {
    if (this.#stream) {
      // rows and cols override width and height when rows and cols are non-zero.
      this.#stream.setWindow(dimensions.rows, dimensions.cols, 0, 0);
    }
  }

  startConnection(): void {
    // To avoid strating multiple SSH connections
    if (this.#connected || this.#stream) {
      return;
    }

    console.error("Starting connection")
    this.#client
      .on('ready', () => {
        this.#client.shell((err, stream) => {
          if (err) {
            this.onErrorEmit.fire({ error: err.message });
            return;
          }

          this.#connected = true;
          this.#stream = stream;

          stream
            .on('close', () => {
              this.#connected = false;
              this.onEndEmit.fire();
              this.#client.end();
            })
            .on('data', (data: Buffer) => {
              console.log(data.toString('utf-8'));
              this.onDataEmit.fire({ data: data.toString('utf-8') });
            });
        });
      }).on('error', err => {
        this.onErrorEmit.fire({ error: err.message });
      })
      .connect({
        host: this.#host,
        port: this.#port,
        username: this.#username,
        privateKey: fs.readFileSync(this.#privateKey),
      });
  }
}
