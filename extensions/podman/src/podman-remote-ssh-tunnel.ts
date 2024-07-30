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
import * as net from 'node:net';

import type { ProviderConnectionStatus } from '@podman-desktop/api';
import type { ConnectConfig } from 'ssh2';
import { Client } from 'ssh2';

export class PodmanRemoteSshTunnel {
  #sshConfig: ConnectConfig;

  #client: Client | undefined;

  // local server for listening on the local file socket
  #server: net.Server | undefined;

  #status: ProviderConnectionStatus = 'unknown';

  #reconnect: boolean = false;

  #reconnectTimeout: NodeJS.Timeout | undefined;

  #resolveConnected: (value: boolean) => void = () => {};
  #connected: Promise<boolean>;

  #listening: boolean = false;

  constructor(
    private host: string,
    private port: number,
    private username: string,
    private privateKey: string,
    private remotePath: string,
    private localPath: string,
  ) {
    this.#sshConfig = {
      host: this.host,
      port: this.port,
      username: this.username,
      privateKey: this.privateKey,
    };
    this.#connected = new Promise<boolean>((resolve, _reject) => {
      this.#resolveConnected = resolve;
    });
  }

  dispose(): void {
    this.disconnect();
  }

  status(): ProviderConnectionStatus {
    return this.#status;
  }

  connect(): void {
    this.#reconnect = true;
    this.#listening = false;
    this.#client = new Client();
    this.#connected = new Promise<boolean>((resolve, _reject) => {
      this.#resolveConnected = resolve;
    });

    this.#client
      .on('ready', () => {
        this.#status = 'started';

        this.#resolveConnected(true);

        // Create a local server to listen on the local file socket
        this.#server = net.createServer(localSocket => {
          // Create a connection to the remote socket via SSH
          this.#client?.openssh_forwardOutStreamLocal(this.remotePath, (err, remoteSocket) => {
            if (err) {
              localSocket.end();
              return;
            }

            // Forward data from local to remote
            localSocket.on('data', data => {
              remoteSocket.write(data);
            });

            // Forward data from remote to local
            remoteSocket.on('data', (data: string | Uint8Array) => {
              localSocket.write(data);
            });

            // Handle local socket close
            localSocket.on('close', () => {
              remoteSocket.end();
            });

            // Handle remote socket close
            remoteSocket.on('close', () => {
              localSocket.end();
            });

            // Handle local socket error
            localSocket.on('error', err => {
              console.error('Podman ssh tunnel local socket error using configuration', this.#sshConfig, err);
              remoteSocket.end();
            });

            // Handle remote socket error
            remoteSocket.on('error', (err: unknown) => {
              console.error('Podman ssh tunnel remote socket error using configuration', this.#sshConfig, err);
              localSocket.end();
            });
          });
        });

        // Listen on the local file socket
        this.#server.listen(this.localPath, () => {
          this.#listening = true;
        });

        // Handle server error
        this.#server.on('error', err => {
          console.error('Server error:', err);
        });
      })
      .connect(this.#sshConfig);

    this.#client.on('error', err => {
      console.error('SSH connection error:', err);
      this.#status = 'unknown';
      this.handleReconnect();
    });

    this.#client.on('end', () => {
      this.#status = 'stopped';
      this.handleReconnect();
    });

    this.#client.on('close', () => {
      this.#status = 'stopped';
      this.handleReconnect();
    });
  }

  handleReconnect(): void {
    // need to reconnect if no timeout is set for now
    if (this.#reconnect && !this.#reconnectTimeout) {
      this.#reconnectTimeout = setTimeout(() => {
        this.#reconnectTimeout = undefined;
        this.connect();
      }, 30000);
    }
  }

  disconnect(): void {
    // Set the reconnect flag to false to prevent reconnecting
    this.#reconnect = false;
    this.#client?.end();
    this.#server?.close();
  }

  isConnected(): Promise<boolean> {
    return this.#connected;
  }

  protected isListening(): boolean {
    return this.#listening;
  }
}
