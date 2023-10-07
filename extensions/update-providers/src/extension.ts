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

import type * as extensionApi from '@podman-desktop/api';
import * as podmanDesktopAPI from '@podman-desktop/api';
import { GithubUpdateProvider } from './github-update-provider';
import { Octokit } from '@octokit/rest';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  extensionContext.subscriptions.push(
    podmanDesktopAPI.binaries.registerUpdateProvider(new GithubUpdateProvider(new Octokit())),
  );
}

export function deactivate(): void {
  console.log('stopping update-provider extension');
}
