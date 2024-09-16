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

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Octokit } from '@octokit/rest';
import type { AuditRequestItems, CancellationToken, CliTool, Logger } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

import { connectionAuditor, createCluster } from './create-cluster';
import type { ImageInfo } from './image-handler';
import { ImageHandler } from './image-handler';
import type { KindGithubReleaseArtifactMetadata } from './kind-installer';
import { KindInstaller } from './kind-installer';
import {
  getKindBinaryInfo,
  getKindPath,
  getSystemBinaryPath,
  installBinaryToSystem,
  removeVersionPrefix,
} from './util';

const KIND_CLI_NAME = 'kind';
const KIND_DISPLAY_NAME = 'Kind';
const KIND_MARKDOWN = `Podman Desktop can help you run Kind-powered local Kubernetes clusters on a container engine, such as Podman.\n\nMore information: [Podman Desktop Documentation](https://podman-desktop.io/docs/kind)`;

const API_KIND_INTERNAL_API_PORT = 6443;

const KIND_MOVE_IMAGE_COMMAND = 'kind.image.move';
let imagesPushInProgressToKind: string[] = [];

export interface KindCluster {
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

let kindCli: CliTool | undefined;
let kindPath: string | undefined;

const imageHandler = new ImageHandler();

async function registerProvider(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const disposable = provider.setKubernetesProviderConnectionFactory(
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: (params: { [key: string]: any }, logger?: Logger, token?: CancellationToken) => {
        if (kindPath) {
          return createCluster(params, kindPath, telemetryLogger, logger, token);
        }
        return Promise.reject(new Error('Unable to create kind cluster. No kind cli detected'));
      },
      creationDisplayName: 'Kind cluster',
    },
    {
      auditItems: async (items: AuditRequestItems) => {
        return await connectionAuditor(new ProviderNameExtractor(items).getProviderName(), items);
      },
    },
  );
  extensionContext.subscriptions.push(disposable);

  // search
  await searchKindClusters(provider);
  console.log('kind extension is active');
}

class ProviderNameExtractor {
  constructor(private items: AuditRequestItems) {}

  getProviderName(): string {
    if (this.items['kind.cluster.creation.provider']) {
      return this.items['kind.cluster.creation.provider'];
    }

    return 'docker';
  }
}

// search for clusters
async function updateClusters(
  provider: extensionApi.Provider,
  containers: extensionApi.ContainerInfo[],
): Promise<void> {
  const kindContainers = containers.map(container => {
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
      apiPort: listeningPort?.PublicPort ?? 0,
      engineType: container.engineType,
      engineId: container.engineId,
      id: container.Id,
    };
  });
  kindClusters = kindContainers.map(container => {
    return {
      name: container.name,
      status: container.status,
      apiPort: container.apiPort,
      engineType: container.engineType,
    };
  });

  kindContainers.forEach(cluster => {
    const item = registeredKubernetesConnections.find(item => item.connection.name === cluster.name);
    const status = (): 'started' | 'stopped' => {
      return cluster.status;
    };
    if (!item) {
      const lifecycle: extensionApi.ProviderConnectionLifecycle = {
        start: async (context, logger): Promise<void> => {
          try {
            if (context || logger) {
              await extensionApi.containerEngine.logsContainer(
                cluster.engineId,
                cluster.id,
                getLoggerCallback(context, logger),
              );
            }
            // start the container
            await extensionApi.containerEngine.startContainer(cluster.engineId, cluster.id);
          } catch (err) {
            console.error(err);
            // propagate the error
            throw err;
          }
        },
        stop: async (context, logger): Promise<void> => {
          if (context || logger) {
            await extensionApi.containerEngine.logsContainer(
              cluster.engineId,
              cluster.id,
              getLoggerCallback(context, logger),
            );
          }
          await extensionApi.containerEngine.stopContainer(cluster.engineId, cluster.id);
        },
        delete: async (logger): Promise<void> => {
          const env = { ...process.env } as { [key: string]: string };
          if (cluster.engineType === 'podman') {
            env['KIND_EXPERIMENTAL_PROVIDER'] = 'podman';
          }
          env.PATH = getKindPath() ?? '';
          if (kindPath) {
            await extensionApi.process.exec(kindPath, ['delete', 'cluster', '--name', cluster.name], { env, logger });
          }
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

  // do we have registeredKubernetesConnections that are not in kindClusters?
  registeredKubernetesConnections.forEach(item => {
    const cluster = kindClusters.find(cluster => cluster.name === item.connection.name);
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

function getLoggerCallback(context?: extensionApi.LifecycleContext, logger?: Logger) {
  return (_name: string, data: string): void => {
    if (data) {
      context?.log?.log(data);
      logger?.log(data);
    }
  };
}

async function searchKindClusters(provider: extensionApi.Provider): Promise<void> {
  const allContainers = await extensionApi.containerEngine.listContainers();

  // search all containers with io.x-k8s.kind.cluster label
  const kindContainers = allContainers.filter(container => {
    return container.Labels?.['io.x-k8s.kind.cluster'];
  });
  await updateClusters(provider, kindContainers);
}

export function refreshKindClustersOnProviderConnectionUpdate(provider: extensionApi.Provider): void {
  // when a provider is changing, update the status
  extensionApi.provider.onDidUpdateContainerConnection(async () => {
    // needs to search for kind clusters
    await searchKindClusters(provider);
  });
}

export async function createProvider(
  extensionContext: extensionApi.ExtensionContext,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<void> {
  const providerOptions: extensionApi.ProviderOptions = {
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
  };

  // Empty connection descriptive message
  providerOptions.emptyConnectionMarkdownDescription = `
  Kind is a Kubernetes utility for running local clusters using single-container "nodes", providing an easy way to create and manage Kubernetes environments for development and testing.\n\nMore information: [kind.sigs.k8s.io](https://kind.sigs.k8s.io/)`;

  const provider = extensionApi.provider.createProvider(providerOptions);

  extensionContext.subscriptions.push(provider);
  await registerProvider(extensionContext, provider, telemetryLogger);
  extensionContext.subscriptions.push(
    extensionApi.commands.registerCommand(KIND_MOVE_IMAGE_COMMAND, async image => {
      telemetryLogger.logUsage('moveImage');

      return extensionApi.window.withProgress(
        { location: extensionApi.ProgressLocation.TASK_WIDGET, title: `Loading ${image.name} to kind.` },
        async progress => await moveImage(progress, image),
      );
    }),
  );

  // when containers are refreshed, update
  extensionApi.containerEngine.onEvent(async event => {
    if (event.Type === 'container') {
      // needs to search for kind clusters
      await searchKindClusters(provider);
    }
  });

  // when a container provider connection is changing, search for kind clusters
  refreshKindClustersOnProviderConnectionUpdate(provider);

  // search when a new container is updated or removed
  extensionApi.provider.onDidRegisterContainerConnection(async () => {
    await searchKindClusters(provider);
  });
  extensionApi.provider.onDidUnregisterContainerConnection(async () => {
    await searchKindClusters(provider);
  });
  extensionApi.provider.onDidUpdateProvider(async () => registerProvider(extensionContext, provider, telemetryLogger));
  // search for kind clusters on boot
  await searchKindClusters(provider);
}

export async function moveImage(
  progress: extensionApi.Progress<{
    message?: string;
    increment?: number;
  }>,
  image: unknown,
): Promise<void> {
  // as the command receive an "any" value we check that it contains an id and an engineId as they are mandatory
  if (!(kindCli && kindPath && image && typeof image === 'object' && 'id' in image && 'engineId' in image)) {
    throw new Error('Image selection not supported yet');
  }

  // update the list of the images whose pushing to kind is in progress
  imagesPushInProgressToKind.push(image.id as string);
  extensionApi.context.setValue('imagesPushInProgressToKind', imagesPushInProgressToKind);
  try {
    await imageHandler.moveImage(image as ImageInfo, kindClusters, kindPath);
  } finally {
    // Mark the task as completed and remove the image from the pushInProgressToKind list on context
    imagesPushInProgressToKind = imagesPushInProgressToKind.filter(id => id !== image.id);
    extensionApi.context.setValue('imagesPushInProgressToKind', imagesPushInProgressToKind);
    progress.report({ increment: -1 });
  }
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const telemetryLogger = extensionApi.env.createTelemetryLogger();
  const octokit = new Octokit();
  const installer = new KindInstaller(extensionContext.storagePath, telemetryLogger, octokit);

  let binary: { path: string; version: string } | undefined = undefined;
  let installationSource: extensionApi.CliToolInstallationSource | undefined;
  // let's try to get system-wide kind install first
  try {
    binary = await getKindBinaryInfo('kind');
    const systemPath = getSystemBinaryPath('kind');
    installationSource = path.normalize(binary.path) === path.normalize(systemPath) ? 'extension' : 'external';
  } catch (err: unknown) {
    console.error(err);
  }

  // if not installed system-wide: let's try to check in the extension storage if kind is not available system-wide
  if (!binary) {
    try {
      binary = await getKindBinaryInfo(installer.getKindCliStoragePath());
      installationSource = 'extension';
    } catch (err: unknown) {
      console.error(err);
    }
  }

  // if the binary exists (either system-wide or in extension storage), we get its version/path
  let binaryVersion: string | undefined;
  let binaryPath: string | undefined;
  if (binary) {
    binaryVersion = binary.version;
    binaryPath = binary.path;
    kindPath = binaryPath;
  }
  // we register it
  kindCli = extensionApi.cli.createCliTool({
    name: KIND_CLI_NAME,
    images: {
      icon: './icon.png',
    },
    version: binaryVersion,
    path: binaryPath,
    displayName: KIND_DISPLAY_NAME,
    markdownDescription: KIND_MARKDOWN,
    installationSource,
  });

  // let's create a provider
  await createProvider(extensionContext, telemetryLogger);

  // if we do not have anything installed, let's add it to the status bar
  let releaseToInstall: KindGithubReleaseArtifactMetadata | undefined;
  let releaseVersionToInstall: string | undefined;
  kindCli.registerInstaller({
    selectVersion: async () => {
      const selected = await installer.promptUserForVersion();
      releaseToInstall = selected;
      releaseVersionToInstall = removeVersionPrefix(selected.tag);
      return releaseVersionToInstall;
    },
    doInstall: async _logger => {
      if (binaryVersion ?? binaryPath) {
        throw new Error(
          `Cannot install ${KIND_CLI_NAME}. Version ${binaryVersion} in ${binaryPath} is already installed.`,
        );
      }
      if (!releaseToInstall || !releaseVersionToInstall) {
        throw new Error(`Cannot install ${KIND_CLI_NAME}. No release selected.`);
      }

      // download, install system wide and update cli version
      await installer.download(releaseToInstall);
      const cliPath = installer.getKindCliStoragePath();

      try {
        await installBinaryToSystem(cliPath, KIND_CLI_NAME);
      } catch (err: unknown) {
        console.log(`${KIND_CLI_NAME} not installed system-wide. Error: ${String(err)}`);
      }

      kindCli?.updateVersion({
        version: releaseVersionToInstall,
        installationSource: 'extension',
      });
      binaryVersion = releaseVersionToInstall;
      binaryPath = cliPath;
      kindPath = cliPath;
      releaseVersionToInstall = undefined;
      releaseToInstall = undefined;
    },
    doUninstall: async _logger => {
      if (!binaryVersion) {
        throw new Error(`Cannot uninstall ${KIND_CLI_NAME}. No version detected.`);
      }

      // delete the executable stored in the storage folder
      const storagePath = installer.getKindCliStoragePath();
      await deleteFile(storagePath);

      // delete the executable in the system path
      const systemPath = getSystemBinaryPath(KIND_CLI_NAME);
      await deleteFile(systemPath);

      // update the version and path to undefined
      binaryVersion = undefined;
      binaryPath = undefined;
      kindPath = undefined;
    },
  });

  extensionContext.subscriptions.push(kindCli);

  // if the tool has been installed by the user we do not register the updater/installer
  if (installationSource === 'external') {
    return;
  }
  // register the updater to allow users to upgrade/downgrade their cli
  let releaseToUpdateTo: KindGithubReleaseArtifactMetadata | undefined;
  let releaseVersionToUpdateTo: string | undefined;

  kindCli.registerUpdate({
    selectVersion: async () => {
      const selected = await installer.promptUserForVersion(binaryVersion);
      releaseToUpdateTo = selected;
      releaseVersionToUpdateTo = removeVersionPrefix(selected.tag);
      return releaseVersionToUpdateTo;
    },
    doUpdate: async _logger => {
      if (!binaryVersion || !binaryPath) {
        throw new Error(`Cannot update ${KIND_CLI_NAME}. No cli tool installed.`);
      }
      if (!releaseToUpdateTo || !releaseVersionToUpdateTo) {
        throw new Error(`Cannot update ${binaryPath} version ${binaryVersion}. No release selected.`);
      }

      // download, install system wide and update cli version
      await installer.download(releaseToUpdateTo);
      const cliPath = installer.getKindCliStoragePath();
      try {
        await installBinaryToSystem(cliPath, KIND_CLI_NAME);
      } catch (err: unknown) {
        console.log(`${KIND_CLI_NAME} not updated system-wide. Error: ${String(err)}`);
      }
      kindCli?.updateVersion({
        version: releaseVersionToUpdateTo,
        installationSource: 'extension',
      });
      binaryVersion = releaseVersionToUpdateTo;
      releaseVersionToInstall = undefined;
      releaseToInstall = undefined;
    },
  });
}

async function deleteFile(filePath: string): Promise<void> {
  if (filePath && fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'EACCES' || error.code === 'EPERM')
      ) {
        await deleteFileAsAdmin(filePath);
      } else {
        throw error;
      }
    }
  }
}

async function deleteFileAsAdmin(filePath: string): Promise<void> {
  const system = process.platform;

  const args: string[] = [filePath];
  const command = system === 'win32' ? 'del' : 'rm';

  try {
    // Use admin prileges
    await extensionApi.process.exec(command, args, { isAdmin: true });
  } catch (error) {
    console.error(`Failed to uninstall '${filePath}': ${error}`);
    throw error;
  }
}

export function deactivate(): void {
  console.log('stopping kind extension');
}
