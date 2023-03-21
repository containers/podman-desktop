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
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runCliCommand, detectKind } from './util';
import { KindInstaller } from './kind-installer';
import { window } from '@podman-desktop/api';
import { tmpName } from 'tmp-promise';

const API_KIND_INTERNAL_API_PORT = 6443;

const KIND_INSTALL_COMMAND = 'kind.install';

const KIND_MOVE_IMAGE_COMMAND = 'kind.image.move';

interface KindCluster {
  name: string;
  status: extensionApi.ProviderConnectionStatus;
  apiPort: number;
  engineType: 'podman' | 'docker';
}

let kindClusters: KindCluster[] = [];
const registeredKubernetesConnections: {
  connection: extensionApi.KubernetesProviderConnection;
  disposable: extensionApi.Disposable;
}[] = [];

let kindCli: string | undefined;

function registerProvider(extensionContext: extensionApi.ExtensionContext, provider: extensionApi.Provider): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createFunction = async (params: { [key: string]: any }, logger: extensionApi.Logger): Promise<void> => {
    let clusterName = 'kind';
    if (params['kind.cluster.creation.name']) {
      clusterName = params['kind.cluster.creation.name'];
    }

    // grab provider
    let provider = 'docker';
    if (params['kind.cluster.creation.provider']) {
      provider = params['kind.cluster.creation.provider'];
    }

    const env = Object.assign({}, process.env);
    // add KIND_EXPERIMENTAL_PROVIDER env variable if needed
    if (provider === 'podman') {
      env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
    }

    // grab http host port
    let httpHostPort = 9090;
    if (params['kind.cluster.creation.http.port']) {
      httpHostPort = params['kind.cluster.creation.http.port'];
    }

    // grab https host port
    let httpsHostPort = 9443;
    if (params['kind.cluster.creation.https.port']) {
      httpsHostPort = params['kind.cluster.creation.https.port'];
    }

    // create the config file
    const kindClusterConfig = `kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: ${clusterName}
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: ${httpHostPort}
    protocol: TCP
  - containerPort: 443
    hostPort: ${httpsHostPort}
    protocol: TCP
`;

    // create a temporary file
    const tmpDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'kind-cluster-config-'));

    // path to the file inside this directory
    const tmpFilePath = path.join(tmpDirectory, 'kind-cluster-config.yaml');

    // ok we need to write the file
    await fs.promises.writeFile(tmpFilePath, kindClusterConfig, 'utf8');

    // now execute the command to create the cluster
    const result = await runCliCommand(kindCli, ['create', 'cluster', '--config', tmpFilePath], { env, logger });

    // delete temporary directory/file
    await fs.promises.rm(tmpDirectory, { recursive: true });

    if (result.exitCode !== 0) {
      throw new Error(`Failed to create kind cluster. ${result.error}`);
    }
  };

  const disposable = provider.setKubernetesProviderConnectionFactory({
    create: createFunction,
  });
  extensionContext.subscriptions.push(disposable);
  console.log('kind extension is active');
}

// search for clusters
async function updateClusters(provider: extensionApi.Provider, containers: extensionApi.ContainerInfo[]) {
  kindClusters = containers.map(container => {
    const clusterName = container.Labels['io.x-k8s.kind.cluster'];
    const clusterStatus = container.State;

    // search the port where the cluster is listening
    const listeningPort = container.Ports.find(
      port => port.PrivatePort === API_KIND_INTERNAL_API_PORT && port.Type === 'tcp',
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
    };
  });

  kindClusters.forEach(cluster => {
    const item = registeredKubernetesConnections.find(item => item.connection.name === cluster.name);
    const status = () => {
      return cluster.status;
    };
    if (!item) {
      // create a new connection
      const connection: extensionApi.KubernetesProviderConnection = {
        name: cluster.name,
        status,
        endpoint: {
          apiURL: `https://localhost:${cluster.apiPort}`,
        },
      };
      const disposable = provider.registerKubernetesProviderConnection(connection);

      registeredKubernetesConnections.push({ connection, disposable });
    } else {
      item.connection.status = status;
      item.connection.endpoint.apiURL = `https://localhost:${cluster.apiPort}`;
    }
  });

  // do we have registeredKubernetesConnections that are not in kindClusters?
  registeredKubernetesConnections.forEach(item => {
    const cluster = kindClusters.find(cluster => cluster.name === item.connection.name);
    if (!cluster) {
      // remove the connection
      item.disposable.dispose();
    }
  });
}

async function searchKindClusters(provider: extensionApi.Provider) {
  const allContainers = await extensionApi.containerEngine.listContainers();

  // search all containers with io.x-k8s.kind.cluster label
  const kindContainers = allContainers.filter(container => {
    return container.Labels?.['io.x-k8s.kind.cluster'];
  });

  updateClusters(provider, kindContainers);
}

type ImageInfo = { engineId: string; id?: string; name?: string };

async function moveImage(image: ImageInfo) {
  if (!image.id) {
    throw new Error('Image selection not supported yet');
  }
  const clusters = kindClusters.filter(cluster => cluster.status === 'started');
  let selectedCluster: { label: string; engineType: string };

  if (clusters.length == 0) {
    throw new Error('No Kind clusters to push to');
  } else if (clusters.length == 1) {
    selectedCluster = { label: clusters[0].name, engineType: clusters[0].engineType };
  } else {
    selectedCluster = await extensionApi.window.showQuickPick(
      clusters.map(cluster => {
        return { label: cluster.name, engineType: cluster.engineType };
      }),
      { placeHolder: 'Select a Kind cluster to push to' },
    );
  }
  if (selectedCluster) {
    const filename = await tmpName();
    try {
      await extensionApi.containerEngine.saveImage(image.engineId, image.id, filename);
      const env = process.env;
      if (selectedCluster.engineType === 'podman') {
        env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
      } else {
        env['KIND_EXPERIMENTAL_PROVIDER'] = 'docker';
      }
      const result = await runCliCommand(kindCli, ['load', 'image-archive', '-n', selectedCluster.label, filename], {
        env: env,
      });
      if (result.exitCode === 0) {
        extensionApi.window.showNotification({
          body: `Image ${image.name} pushed to Kind cluster ${selectedCluster.label}`,
        });
      } else {
        throw new Error(
          `Error while pushing image ${image.name} to Kind cluster ${selectedCluster.label}: ${result.error}`,
        );
      }
    } catch (err) {
      throw new Error(`Error while pushing image ${image.name} to Kind cluster ${selectedCluster.label}: ${err}`);
    } finally {
      fs.promises.rm(filename);
    }
  }
}

function createProvider(extensionContext: extensionApi.ExtensionContext) {
  const provider = extensionApi.provider.createProvider({
    name: 'Kind',
    id: 'kind',
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
  registerProvider(extensionContext, provider);
  extensionContext.subscriptions.push(
    extensionApi.commands.registerCommand(KIND_MOVE_IMAGE_COMMAND, image => moveImage(image)),
  );

  // when containers are refreshed, update
  extensionApi.containerEngine.onEvent(async event => {
    if (event.Type === 'container') {
      // needs to search for kind clusters
      searchKindClusters(provider);
    }
  });

  // search when a new container is updated or removed
  extensionApi.provider.onDidRegisterContainerConnection(() => {
    searchKindClusters(provider);
  });
  extensionApi.provider.onDidUnregisterContainerConnection(() => {
    searchKindClusters(provider);
  });
  extensionApi.provider.onDidUpdateProvider(() => registerProvider(extensionContext, provider));
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const installer = new KindInstaller(extensionContext.storagePath);
  kindCli = await detectKind(extensionContext.storagePath, installer);

  if (!kindCli) {
    if (await installer.isAvailable()) {
      const statusBarItem = extensionApi.window.createStatusBarItem();
      statusBarItem.text = 'Kind';
      statusBarItem.tooltip = 'Kind not found on your system, click to download and install it';
      statusBarItem.command = KIND_INSTALL_COMMAND;
      statusBarItem.iconClass = 'fa fa-exclamation-triangle';
      extensionContext.subscriptions.push(
        extensionApi.commands.registerCommand(KIND_INSTALL_COMMAND, () =>
          installer.performInstall().then(
            async status => {
              if (status) {
                statusBarItem.dispose();
                kindCli = await detectKind(extensionContext.storagePath, installer);
                createProvider(extensionContext);
              }
            },
            err => window.showErrorMessage('Kind installation failed ' + err),
          ),
        ),
      );
      statusBarItem.show();
    }
  } else {
    createProvider(extensionContext);
  }
}

export function deactivate(): void {
  console.log('stopping kind extension');
}
