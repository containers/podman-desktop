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

import { execPromise, getLimactl } from './limactl';
import { configuration } from '@podman-desktop/api';

function registerProvider(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  providerSocketPath: string,
): void {
  let providerState: extensionApi.ProviderConnectionStatus = 'unknown';
  const providerType: 'docker' | 'podman' = configuration.getConfiguration('lima').get('type');
  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: 'Lima',
    type: providerType,
    status: () => providerState,
    endpoint: {
      socketPath: providerSocketPath,
    },
  };
  providerState = 'started';
  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  provider.updateStatus('started');
  extensionContext.subscriptions.push(disposable);
  console.log('Lima extension is active');
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const engineType = configuration.getConfiguration('lima').get('type') || 'podman';
  const instanceName = configuration.getConfiguration('lima').get('name') || engineType;
  const limaHome = os.homedir(); // TODO: look for the LIMA_HOME environment variable
  const socketPath = path.resolve(limaHome, '.lima/' + instanceName + '/sock/' + engineType + '.sock');

  const provider = extensionApi.provider.createProvider({
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

  provider.setContainerProviderConnectionFactory({
    initialize: () => createInstance({}, undefined),
    create: createInstance,
    creationDisplayName: 'Lima instance',
  });

  registerProvider(extensionContext, provider, socketPath);
}

export async function createInstance(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  logger: extensionApi.Logger,
  token?: extensionApi.CancellationToken,
): Promise<void> {
  const parameters = [];
  parameters.push('start');

  // name
  if (params['lima.factory.instance.name']) {
    parameters.push('--name');
    parameters.push(params['lima.factory.instance.name']);
  }

  // cpus
  if (params['lima.factory.instance.cpus']) {
    parameters.push('--cpus');
    parameters.push(params['lima.factory.instance.cpus']);
  }

  // memory
  if (params['lima.factory.instance.memory']) {
    parameters.push('--memory');
    const memoryAsGiB = +params['lima.factory.instance.memory'] / (1024 * 1024 * 1024);
    parameters.push(memoryAsGiB.toFixed(2));
  }

  // disk
  if (params['lima.factory.instance.diskSize']) {
    parameters.push('--disk');
    const diskAsGiB = +params['lima.factory.instance.diskSize'] / (1024 * 1024 * 1024);
    parameters.push(diskAsGiB.toFixed(2));
  }

  // template
  if (params['lima.factory.instance.template']) {
    let template = params['lima.factory.instance.template'];
    if (params['lima.factory.instance.rootful'] && template.startswith('template://')) {
      template += '-rootful';
    }
    parameters.push(template);
  }

  const env = {};
  await execPromise(getLimactl(), parameters, { logger, env }, token);
}

export function deactivate(): void {
  console.log('stopping lima extension');
}
