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
import type * as extensionApi from '@podman-desktop/api';
import { Detect } from './detect';
import { ComposeExtension } from './compose-extension';
import { ComposeGitHubReleases } from './compose-github-releases';
import { OS } from './os';
import { ComposeWrapperGenerator } from './compose-wrapper-generator';
import * as path from 'path';
let composeExtension: ComposeExtension | undefined;

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // do not hold the activation promise
  setTimeout(() => {
    postActivate(extensionContext).catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);
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
