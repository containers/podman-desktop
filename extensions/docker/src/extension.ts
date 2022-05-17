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

import * as extensionApi from '@tmpwip/extension-api';
import * as os from 'os';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  let socketPath: string;
  const isWindows = os.platform() === 'win32';
  if (isWindows) {
    socketPath = '//./pipe/docker_engine';
  } else {
    socketPath = '/var/run/docker.sock';
  }

  const provider = extensionApi.provider.createProvider({ name: 'Docker', id: 'docker', status: 'ready' });

  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: 'Docker',
    type: 'docker',
    status: () => 'started',
    endpoint: {
      socketPath,
    },
  };

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  extensionContext.subscriptions.push(disposable);
  extensionContext.subscriptions.push(provider);
}

export function deactivate(): void {
  console.log('stopping docker extension');
}
