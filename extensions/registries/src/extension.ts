/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at *
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

import dockerIoImage from './images/docker.io.png';
import gcrIoImage from './images/gcr.io.png';
import ghcrIoImage from './images/ghcr.io.png';
import quayIoImage from './images/quay.io.png';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // For each defaultRegistries, suggest the registry to Podman Desktop
  for (const registry of defaultRegistries) {
    // remove the image prefix from vite base64 object
    const registryEntry = {
      ...registry,
      icon: stripImagePrefix(registry.icon ?? ''),
    };

    // Suggest it to the registry and add to subscriptions
    const disposable = extensionApi.registry.suggestRegistry(registryEntry);
    extensionContext.subscriptions.push(disposable);
  }
}

export function deactivate(): void {
  console.log('stopping registries extension');
}

// Const array of list of approved registries that contain the default URL as well as base64 encoded version of their logo
// The 'registries' will check the local directory for an icon named the same as the registry
const defaultRegistries: extensionApi.RegistrySuggestedProvider[] = [
  {
    name: 'Docker Hub',
    url: 'docker.io',
    icon: dockerIoImage,
  },
  {
    name: 'Red Hat Quay',
    url: 'quay.io',
    icon: quayIoImage,
  },
  {
    name: 'GitHub',
    url: 'ghcr.io',
    icon: ghcrIoImage,
  },
  {
    name: 'Google Container Registry',
    url: 'gcr.io',
    icon: gcrIoImage,
  },
];

// Remove data:image/png;base64,
export function stripImagePrefix(imageContent: string): string {
  return imageContent.replace(/^data:image\/\w+;base64,/, '');
}
