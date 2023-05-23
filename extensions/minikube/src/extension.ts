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

import * as extensionApi from '@podman-desktop/api';
import { detectMinikube, getMinikubePath, runCliCommand } from './util';
import { MinikubeInstaller } from './minikube-installer';
import type { CancellationToken, Logger } from '@podman-desktop/api';
import { window } from '@podman-desktop/api';
import { ImageHandler } from './image-handler';
import { createCluster } from './create-cluster';

const API_MINIKUBE_INTERNAL_API_PORT = 8443;

const MINIKUBE_INSTALL_COMMAND = 'minikube.install';

const MINIKUBE_MOVE_IMAGE_COMMAND = 'minikube.image.move';

export interface MinikubeCluster {
  name: string;
  status: extensionApi.ProviderConnectionStatus;
  apiPort: number;
  engineType: 'podman' | 'docker';
}

let minikubeClusters: MinikubeCluster[] = [];
const registeredKubernetesConnections: {
  connection: extensionApi.KubernetesProviderConnection;
  disposable: extensionApi.Disposable;
}[] = [];

let minikubeCli: string | undefined;

const imageHandler = new ImageHandler();

async function registerProvider(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const disposable = provider.setKubernetesProviderConnectionFactory({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (params: { [key: string]: any }, logger?: Logger, token?: CancellationToken) =>
      createCluster(params, logger, minikubeCli, telemetryLogger, token),
    creationDisplayName: 'Minikube cluster',
  });
  extensionContext.subscriptions.push(disposable);

  // search
  await searchMinikubeClusters(provider);
  console.log('minikube extension is active');
}

// search for clusters
async function updateClusters(provider: extensionApi.Provider, containers: extensionApi.ContainerInfo[]) {
  const minikubeContainers = containers.map(container => {
    const clusterName = container.Labels['name.minikube.sigs.k8s.io'];
    const clusterStatus = container.State;

    // search the port where the cluster is listening
    const listeningPort = container.Ports.find(
      port => port.PrivatePort === API_MINIKUBE_INTERNAL_API_PORT && port.Type === 'tcp',
    );
    let status: extensionApi.ProviderConnectionStatus;
    if (clusterStatus === 'running') {
      status = 'started';
    } else {
      status = 'stopped';
    }

    return {
      name: clusterName,
      status,
      apiPort: listeningPort?.PublicPort || 0,
      engineType: container.engineType,
      engineId: container.engineId,
      id: container.Id,
    };
  });
  minikubeClusters = minikubeContainers.map(container => {
    return {
      name: container.name,
      status: container.status,
      apiPort: container.apiPort,
      engineType: container.engineType,
    };
  });

  minikubeContainers.forEach(cluster => {
    const item = registeredKubernetesConnections.find(item => item.connection.name === cluster.name);
    const status = () => {
      return cluster.status;
    };
    if (!item) {
      const lifecycle: extensionApi.ProviderConnectionLifecycle = {
        start: async (): Promise<void> => {
          try {
            // start the container
            await extensionApi.containerEngine.startContainer(cluster.engineId, cluster.id);
          } catch (err) {
            console.error(err);
            // propagate the error
            throw err;
          }
        },
        stop: async (): Promise<void> => {
          await extensionApi.containerEngine.stopContainer(cluster.engineId, cluster.id);
        },
        delete: async (logger): Promise<void> => {
          const env = Object.assign({}, process.env);
          env.PATH = getMinikubePath();
          await runCliCommand(minikubeCli, ['delete', '--profile', cluster.name], { env, logger });
        },
      };
      // create a new connection
      const connection: extensionApi.KubernetesProviderConnection = {
        name: cluster.name,
        status,
        endpoint: {
          apiURL: `https://localhost:${cluster.apiPort}`,
        },
        lifecycle,
      };
      const disposable = provider.registerKubernetesProviderConnection(connection);

      registeredKubernetesConnections.push({ connection, disposable });
    } else {
      item.connection.status = status;
      item.connection.endpoint.apiURL = `https://localhost:${cluster.apiPort}`;
    }
  });

  // do we have registeredKubernetesConnections that are not in minikubeClusters?
  registeredKubernetesConnections.forEach(item => {
    const cluster = minikubeClusters.find(cluster => cluster.name === item.connection.name);
    if (!cluster) {
      // remove the connection
      item.disposable.dispose();

      // remove the item frm the list
      const index = registeredKubernetesConnections.indexOf(item);
      if (index > -1) {
        registeredKubernetesConnections.splice(index, 1);
      }
    }
  });
}

async function searchMinikubeClusters(provider: extensionApi.Provider): Promise<void> {
  const allContainers = await extensionApi.containerEngine.listContainers();

  // search all containers with name.minikube.sigs.k8s.io labels
  const minikubeContainers = allContainers.filter(container => {
    return container.Labels?.['name.minikube.sigs.k8s.io'];
  });
  await updateClusters(provider, minikubeContainers);
}

export function refreshMinikubeClustersOnProviderConnectionUpdate(provider: extensionApi.Provider) {
  // when a provider is changing, update the status
  extensionApi.provider.onDidUpdateContainerConnection(async () => {
    // needs to search for minikube clusters
    await searchMinikubeClusters(provider);
  });
}

async function createProvider(
  extensionContext: extensionApi.ExtensionContext,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const provider = extensionApi.provider.createProvider({
    name: 'Minikube',
    id: 'minikube',
    status: 'unknown',
    images: {
      icon: './icon.png',
      logo: {
        dark: './logo-dark.png',
        light: './logo-light.png',
      },
    },
  });
  extensionContext.subscriptions.push(provider);
  await registerProvider(extensionContext, provider, telemetryLogger);
  extensionContext.subscriptions.push(
    extensionApi.commands.registerCommand(MINIKUBE_MOVE_IMAGE_COMMAND, async image => {
      telemetryLogger.logUsage('moveImage');
      await imageHandler.moveImage(image, minikubeClusters, minikubeCli);
    }),
  );

  // when containers are refreshed, update
  extensionApi.containerEngine.onEvent(async event => {
    if (event.Type === 'container') {
      // needs to search for minikube clusters
      await searchMinikubeClusters(provider);
    }
  });

  // when a container provider connection is changing, search for minikube clusters
  refreshMinikubeClustersOnProviderConnectionUpdate(provider);

  // search when a new container is updated or removed
  extensionApi.provider.onDidRegisterContainerConnection(async () => {
    await searchMinikubeClusters(provider);
  });
  extensionApi.provider.onDidUnregisterContainerConnection(async () => {
    await searchMinikubeClusters(provider);
  });
  extensionApi.provider.onDidUpdateProvider(async () => registerProvider(extensionContext, provider, telemetryLogger));
  // search for minikube clusters on boot
  await searchMinikubeClusters(provider);
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const telemetryLogger = extensionApi.env.createTelemetryLogger();
  const installer = new MinikubeInstaller(extensionContext.storagePath, telemetryLogger);
  minikubeCli = await detectMinikube(extensionContext.storagePath, installer);

  if (!minikubeCli) {
    if (await installer.isAvailable()) {
      const statusBarItem = extensionApi.window.createStatusBarItem();
      statusBarItem.text = 'Minikube';
      statusBarItem.tooltip = 'Minikube not found on your system, click to download and install it';
      statusBarItem.command = MINIKUBE_INSTALL_COMMAND;
      statusBarItem.iconClass = 'fa fa-exclamation-triangle';
      extensionContext.subscriptions.push(
        extensionApi.commands.registerCommand(MINIKUBE_INSTALL_COMMAND, () =>
          installer.performInstall().then(
            async status => {
              if (status) {
                statusBarItem.dispose();
                minikubeCli = await detectMinikube(extensionContext.storagePath, installer);
                await createProvider(extensionContext, telemetryLogger);
              }
            },
            (err: unknown) => window.showErrorMessage('Minikube installation failed ' + err),
          ),
        ),
      );
      statusBarItem.show();
    }
  } else {
    await createProvider(extensionContext, telemetryLogger);
  }
}

export function deactivate(): void {
  console.log('stopping minikube extension');
}
