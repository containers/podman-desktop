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
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import { configuration, ProgressLocation } from '@podman-desktop/api';
import { getLimactl } from './limactl';
import { ImageHandler } from './image-handler';

type limaProviderType = 'docker' | 'podman' | 'kubernetes';

const LIMA_MOVE_IMAGE_COMMAND = 'lima.image.move';

const imageHandler = new ImageHandler();

function registerProvider(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  providerType: limaProviderType,
  providerPath: string,
): void {
  let providerState: extensionApi.ProviderConnectionStatus = 'unknown';
  const instanceName: string = configuration.getConfiguration('lima').get('name') || providerType;
  if (providerType === 'podman' || providerType === 'docker') {
    const connection: extensionApi.ContainerProviderConnection = {
      name: 'Lima',
      type: providerType,
      status: () => providerState,
      endpoint: {
        socketPath: providerPath,
      },
    };
    providerState = 'started';
    const disposable = provider.registerContainerProviderConnection(connection);
    provider.updateStatus('started');
    extensionContext.subscriptions.push(disposable);
  } else if (providerType === 'kubernetes') {
    const connection: extensionApi.KubernetesProviderConnection = {
      name: 'Lima',
      status: () => providerState,
      endpoint: {
        apiURL: 'https://localhost:6443',
      },
    };
    providerState = 'started';
    const disposable = provider.registerKubernetesProviderConnection(connection);
    provider.updateStatus('started');
    extensionContext.subscriptions.push(disposable);
    extensionContext.subscriptions.push(
      extensionApi.commands.registerCommand(LIMA_MOVE_IMAGE_COMMAND, async image => {
        return extensionApi.window.withProgress(
          { location: ProgressLocation.TASK_WIDGET, title: `Loading ${image.name} to lima.` },
          async progress => {
            await imageHandler.moveImage(image, instanceName, getLimactl());
            // Mark the task as completed
            progress.report({ increment: -1 });
          },
        );
      }),
    );
  }
  console.log('Lima extension is active');
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const engineType = configuration.getConfiguration('lima').get('type') || 'podman';
  const instanceName = configuration.getConfiguration('lima').get('name') || engineType;
  const socketName = configuration.getConfiguration('lima').get('socket') || engineType + '.sock';
  const limaHome = 'LIMA_HOME' in process.env ? process.env['LIMA_HOME'] : os.homedir() + '/.lima';
  const socketPath = path.resolve(limaHome, instanceName + '/sock/' + socketName);
  const configPath = path.resolve(limaHome, instanceName + '/copied-from-guest/kubeconfig.yaml');

  let provider;
  if (fs.existsSync(socketPath) || fs.existsSync(configPath)) {
    provider = extensionApi.provider.createProvider({
      name: 'Lima',
      id: 'lima',
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
  }

  // container provider
  if (socketName !== 'kubernetes.sock') {
    const providerType = engineType === 'kubernetes' ? 'docker' : (engineType as limaProviderType);
    if (fs.existsSync(socketPath)) {
      registerProvider(extensionContext, provider, providerType, socketPath);
    } else {
      console.debug(`Could not find socket at ${socketPath}`);
    }
  }
  // kubernetes provider
  if (engineType === 'kubernetes') {
    const providerType = engineType as limaProviderType;
    if (fs.existsSync(configPath)) {
      registerProvider(extensionContext, provider, providerType, configPath);
    } else {
      console.debug(`Could not find config at ${configPath}`);
    }
  }
}

export function deactivate(): void {
  console.log('stopping lima extension');
}
