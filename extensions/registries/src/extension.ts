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
const imageExtension = '.png';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // For each defaultRegistries, suggest the registry to Podman Desktop
  defaultRegistries.forEach(async registry => {
    // Let's check the folder for <registry.url>.png
    const iconLocation = imagePath.concat(registry.url, imageExtension);

    // If the icon exists, load the image, convert it to base64 and add it
    if (fs.existsSync(iconLocation)) {
      registry.icon = await base64EncodeFile(iconLocation);
    }

    // Suggest it to the registry
    extensionApi.registry.suggestRegistry(registry);
  });
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
  },
  {
    name: 'Red Hat Quay',
    url: 'quay.io',
  },
  {
    name: 'GitHub',
    url: 'ghcr.io',
  },
  {
    name: 'Google Container Registry',
    url: 'gcr.io',
  },
];

// Return the base64 of the file
async function base64EncodeFile(file: string): Promise<string> {
  return fs.promises.readFile(file).then(buffer => buffer.toString('base64'));
}
