/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import * as http from 'node:http';
import * as os from 'node:os';

import * as extensionApi from '@podman-desktop/api';

import { getDockerInstallation } from './docker-cli';

let stopLoop = false;
let socketPath: string;
let provider: extensionApi.Provider;
let providerState: extensionApi.ProviderConnectionStatus = 'stopped';
let containerProviderConnection: extensionApi.ContainerProviderConnection;
let containerProviderConnectionDisposable: extensionApi.Disposable;

async function timeout(time: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
}
async function isDockerDaemonAlive(socketPath: string): Promise<boolean> {
  const pingUrl = {
    path: '/_ping',
    socketPath,
  };

  return new Promise<boolean>(resolve => {
    const req = http.get(pingUrl, res => {
      res.on('data', () => {
        // do nothing
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    req.once('error', () => {
      resolve(false);
    });
  });
}

async function isDisguisedPodman(socketPath: string): Promise<boolean> {
  const podmanPingUrl = {
    path: '/libpod/_ping',
    socketPath,
  };
  return new Promise<boolean>(resolve => {
    const req = http.get(podmanPingUrl, res => {
      res.on('data', () => {
        // do nothing
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    req.once('error', err => {
      console.debug('Error while pinging docker as podman', err);
      resolve(false);
    });
  });
}

async function monitorDaemon(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // call us again
  if (!stopLoop) {
    try {
      await updateProvider(extensionContext);
    } catch (error) {
      // ignore the update of machines
    }
    await timeout(5000);
    monitorDaemon(extensionContext).catch((err: unknown) => {
      console.error('Error while monitoring docker daemon', err);
      if (err instanceof Error) {
        extensionApi.env.createTelemetryLogger().logError(err);
      } else {
        extensionApi.env.createTelemetryLogger().logError(String(err));
      }
    });
  }
}

async function updateProvider(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  try {
    const installedDocker = await getDockerInstallation();
    if (!installedDocker) {
      provider.updateStatus('not-installed');
    } else if (installedDocker.version) {
      provider.updateVersion(installedDocker.version);
      // update provider status if someone has installed docker externally
      if (provider.status === 'not-installed') {
        provider.updateStatus('installed');
      }
    }
  } catch (error) {
    // ignore the update
  }

  // check if the daemon is alive
  const isAlive = await isDockerDaemonAlive(socketPath);

  // alive
  if (isAlive) {
    // but was stopped before, needs to update the provider state
    if (providerState === 'stopped') {
      // first we check that it's not podman behind
      const isPodman = await isDisguisedPodman(socketPath);
      if (!isPodman) {
        // if no provider, create one
        if (!provider) {
          initProvider(extensionContext);
        }
        providerState = 'started';
        // register again the connection
        containerProviderConnectionDisposable =
          provider.registerContainerProviderConnection(containerProviderConnection);
        extensionContext.subscriptions.push(containerProviderConnectionDisposable);

        provider.updateStatus('started');
      }
    }
  } else {
    // no longer alive but it was running before so we need to update status
    if (providerState === 'started') {
      // dispose the current connection
      containerProviderConnectionDisposable?.dispose();
      providerState = 'stopped';
      provider.updateStatus('stopped');
    }
  }
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const isWindows = os.platform() === 'win32';
  if (isWindows) {
    socketPath = '//./pipe/docker_engine';
  } else {
    socketPath = '/var/run/docker.sock';
  }

  // monitor daemon
  monitorDaemon(extensionContext).catch((err: unknown) => {
    console.error('Error while monitoring docker daemon', err);
    if (err instanceof Error) {
      extensionApi.env.createTelemetryLogger().logError(err);
    } else {
      extensionApi.env.createTelemetryLogger().logError(String(err));
    }
  });
}

function initProvider(extensionContext: extensionApi.ExtensionContext): void {
  provider = extensionApi.provider.createProvider({
    name: 'Docker',
    id: 'docker',
    status: 'ready',
    images: {
      icon: './icon.png',
      logo: './logo.png',
    },
  });

  containerProviderConnection = {
    name: 'Docker',
    type: 'docker',
    status: (): extensionApi.ProviderConnectionStatus => providerState,
    endpoint: {
      socketPath,
    },
  };

  // provider is started
  providerState = 'started';
  extensionContext.subscriptions.push(provider);
}

export function deactivate(): void {
  stopLoop = true;
  console.log('stopping docker extension');
}
