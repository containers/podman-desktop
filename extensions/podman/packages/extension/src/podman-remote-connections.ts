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

import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import { getPodmanCli } from './podman-cli';
import { PodmanRemoteSshTunnel } from './podman-remote-ssh-tunnel';

interface ConnectionListFormatJson {
  Name: string;
  IsMachine?: boolean;
  URI: string;
  Identity: string;
}

interface RemoteSystemConnection {
  name: string;
  sshTunnel: PodmanRemoteSshTunnel;
  connectionDisposable: extensionApi.Disposable;
}

const CONFIGURATION_REMOTE_ENABLED_KEY = 'system.connections.remote';

const PODMAN_CONFIGURATION_REMOTE_ENABLED_KEY = `podman.${CONFIGURATION_REMOTE_ENABLED_KEY}`;

export class PodmanRemoteConnections {
  #extensionContext: extensionApi.ExtensionContext;

  #provider: extensionApi.Provider;

  #currentConnections: Map<string, RemoteSystemConnection> = new Map();

  #stopMonitoring = false;

  #timeout: NodeJS.Timeout | undefined;

  constructor(extensionContext: extensionApi.ExtensionContext, provider: extensionApi.Provider) {
    this.#extensionContext = extensionContext;
    this.#provider = provider;
  }

  // get the list of all connections and filter out the local ones (Machines have a flag IsMachine set to true)
  async grabRemoteConnections(): Promise<ConnectionListFormatJson[]> {
    const command = await extensionApi.process.exec(getPodmanCli(), [
      'system',
      'connection',
      'list',
      '--format',
      'json',
    ]);

    const response = command.stdout;

    // parse JSON
    const connections: ConnectionListFormatJson[] = JSON.parse(response);

    // filter out all machines (that are local)
    return connections
      .filter(connection => connection.IsMachine !== true)
      .filter(connection => connection.URI.startsWith('ssh:'));
  }

  start(): void {
    // need to watch the configuration to enable again the monitoring
    extensionApi.configuration.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(PODMAN_CONFIGURATION_REMOTE_ENABLED_KEY)) {
        await this.monitorRemoteConnections();
      }
    });

    this.monitorRemoteConnections().catch((error: unknown) => {
      console.error('Error starting remote podman system connections', error);
    });
  }

  protected async monitorRemoteConnections(): Promise<void> {
    // check the configuration to see if we need to monitor the remote connections
    const checkForRemote =
      extensionApi.configuration.getConfiguration('podman').get<boolean>(CONFIGURATION_REMOTE_ENABLED_KEY) ?? false;

    if (!checkForRemote) {
      this.#stopMonitoring = true;
      this.cleanupConnections(Array.from(this.#currentConnections.values()));
      return;
    } else {
      this.#stopMonitoring = false;
    }

    // call us again
    if (!this.#stopMonitoring) {
      try {
        await this.refreshRemoteConnections();
      } catch (error) {
        // ignore the update of remote connections
      }
      // wait 5s before checking again
      // and remove any other existing timeout
      if (this.#timeout) {
        clearTimeout(this.#timeout);
      }
      this.#timeout = setTimeout(() => {
        this.monitorRemoteConnections().catch((error: unknown) => {
          console.error('Error monitoring remote podman system connections', error);
        });
      }, 5000);
    }
  }

  protected async refreshRemoteConnections(): Promise<void> {
    const cliRemoteConnections = await this.grabRemoteConnections();

    // compare to the previous list of connections
    const toAdd = cliRemoteConnections.filter(connection => !this.#currentConnections.has(connection.Name));
    const toRemove = Array.from(this.#currentConnections.values()).filter(
      connection => !cliRemoteConnections.some(c => c.Name === connection.name),
    );

    // for each new connection, create the tunnel and register the connection

    // for each new connection, setup a tunnel and add the provider
    for (const connection of toAdd) {
      // extract values from the configuration it looks like
      /*{
      "Name": "fedora40",
      "URI": "ssh://username@1.2.3.4:22/run/user/1000/podman/podman.sock",
      "Identity": "/Users/username/.ssh/id_1234",
      "Default": false,
      "ReadWrite": true
  },*/

      const uri = new URL(connection.URI);
      const host = uri.hostname;
      const port = parseInt(uri.port);
      const username = uri.username;
      const privateKeyFile = connection.Identity;

      // read the content of the private key
      const privateKey = readFileSync(privateKeyFile, 'utf8');
      const remotePath = uri.pathname;

      let localPath;
      // on Windows, use npipe
      if (extensionApi.env.isWindows) {
        localPath = `\\\\.\\pipe\\podman-remote-${connection.Name}`;
      } else {
        // on mac and Linux use socket file
        localPath = join(tmpdir(), `podman-remote-${connection.Name}.sock`);
      }

      const sshTunnel = this.createTunnel(host, port, username, privateKey, remotePath, localPath);

      // connect the tunnel
      sshTunnel.connect();

      //delay before registering the socket
      await new Promise(resolve => setTimeout(resolve, 1000));

      // register the socket
      const connectionDisposable = this.#provider.registerContainerProviderConnection({
        name: connection.Name,
        status: () => sshTunnel.status(),
        type: 'podman',
        endpoint: {
          socketPath: localPath,
        },
      });
      this.#extensionContext.subscriptions.push(connectionDisposable);
      const remoteConnection: RemoteSystemConnection = {
        name: connection.Name,
        sshTunnel,
        connectionDisposable,
      };
      this.#currentConnections.set(connection.Name, remoteConnection);
    }

    // for each connection to remove, close the tunnel and remove the provider
    this.cleanupConnections(toRemove);
  }

  cleanupConnections(connections: RemoteSystemConnection[]): void {
    for (const connection of connections) {
      const remoteConnection = this.#currentConnections.get(connection.name);
      if (remoteConnection) {
        remoteConnection.sshTunnel.disconnect();
        this.#currentConnections.delete(connection.name);
        // unregister the connection
        remoteConnection.connectionDisposable.dispose();
      }
    }
  }

  protected createTunnel(
    host: string,
    port: number,
    username: string,
    privateKey: string,
    remotePath: string,
    localPath: string,
  ): PodmanRemoteSshTunnel {
    return new PodmanRemoteSshTunnel(host, port, username, privateKey, remotePath, localPath);
  }

  stop(): void {
    this.#stopMonitoring = true;
  }
}
