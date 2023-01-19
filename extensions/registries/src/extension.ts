/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import * as extensionApi from '@tmpwip/extension-api';
import * as fs from 'node:fs';

// The image path for the registry logos
const imagePath = __dirname + '/images/';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // For each defaultRegistries, suggest the registry to Podman Desktop
  defaultRegistries.forEach(registry => {
    extensionApi.registry.suggestRegistry(registry);
  });
}

export function deactivate(): void {
  // For each defaultRegistries, suggest the registry to Podman Desktop
  defaultRegistries.forEach(registry => {
    extensionApi.registry.unsuggestRegistry(registry);
  });

  console.log('stopping registries extension and clearing suggested registries');
}

// Const array of list of approved registries that contain the default URL as well as base64 encoded version of their logo
const defaultRegistries: extensionApi.RegistrySuggestedProvider[] = [
  {
    name: 'Docker Hub',
    url: 'docker.io',
    icon: base64_encode(imagePath + 'docker.png'),
  },
  {
    name: 'Red Hat Quay',
    url: 'quay.io',
    icon: base64_encode(imagePath + 'quay.png'),
  },
  {
    name: 'GitHub',
    url: 'ghcr.io',
    icon: base64_encode(imagePath + 'github.png'),
  },
  {
    name: 'Google Container Registry',
    url: 'gcr.io',
    icon: base64_encode(imagePath + 'gcr.png'),
  },
];

// Function that takes in a file location and returns a base64 encoded string of the file
// TODO: Implement async instead of using node:fs
function base64_encode(file: string): string {
  const bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
}
