/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';
import { Detect } from './detect';
import { ComposeExtension } from './compose-extension';
import { ComposeGitHubReleases } from './compose-github-releases';
import { OS } from './os';
import { ComposeWrapperGenerator } from './compose-wrapper-generator';
import * as path from 'path';
import * as handler from './handler';

let composeExtension: ComposeExtension | undefined;

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // Post activation
  setTimeout(() => {
    postActivate(extensionContext).catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);

  // Check docker-compose binary has been installed and update both
  // the configuration setting and the context accordingly
  await handler.updateConfigAndContextComposeBinary(extensionContext);

  // Setup configuration changes if the user toggles the "Install compose system-wide" boolean
  handler.handleConfigurationChanges(extensionContext);

  // Need to "ADD" a provider so we can actually press the button!
  // We set this to "unknown" so it does not appear on the dashboard (we only want it in preferences).
  const providerOptions: extensionApi.ProviderOptions = {
    name: 'Compose',
    id: 'Compose',
    status: 'unknown',
    images: {
      icon: './icon.png',
    },
  };

  providerOptions.emptyConnectionMarkdownDescription = `Compose is a specification for defining and running multi-container applications. We support both [podman compose](https://docs.podman.io/en/latest/markdown/podman-compose.1.html) and [docker compose](https://github.com/docker/compose) commands.\n\nMore information: [compose-spec.io](https://compose-spec.io/)`;

  const provider = extensionApi.provider.createProvider(providerOptions);
  extensionContext.subscriptions.push(provider);
}

async function postActivate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const octokit = new Octokit();
  const os = new OS();
  const podmanComposeGenerator = new ComposeWrapperGenerator(os, path.resolve(extensionContext.storagePath, 'bin'));
  composeExtension = new ComposeExtension(
    extensionContext,
    new Detect(os, extensionContext.storagePath),
    new ComposeGitHubReleases(octokit),
    os,
    podmanComposeGenerator,
  );
  await composeExtension.activate();
}

export async function deactivate(): Promise<void> {
  if (composeExtension) {
    await composeExtension.deactivate();
  }
}
