/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { ProviderInfo } from '../../../main/src/plugin/api/provider-info';
const updateProviderCallbacks = [];
export async function fetchProviders() {
  const result = await window.getProviderInfos();
  providerInfos.set(result);
  result.forEach(providerInfo => {
    // register only if none for this provider id
    if (!updateProviderCallbacks.includes(providerInfo.internalId)) {
      window
        .onDidUpdateProviderStatus(providerInfo.internalId, async () => {
          await fetchProviders();
        })
        .catch((err: unknown) => {
          console.error('Failed to register onDidUpdateProviderStatus callback', err);
        });
      updateProviderCallbacks.push(providerInfo.internalId);
    }
  });
}

export const providerInfos: Writable<ProviderInfo[]> = writable([]);

// need to refresh when extension is started or stopped
window?.events?.receive('extension-started', async () => {
  await fetchProviders();
});
window?.events?.receive('extension-stopped', async () => {
  await fetchProviders();
});

window.addEventListener('provider-lifecycle-change', async () => {
  await fetchProviders();
});

window?.events?.receive('provider-lifecycle-change', async () => {
  await fetchProviders();
});

window?.events?.receive('provider-change', async () => {
  await fetchProviders();
});
window?.events?.receive('provider-create', async () => {
  await fetchProviders();
});
window?.events?.receive('provider-delete', async () => {
  await fetchProviders();
});
window?.events?.receive('provider:update-status', async () => {
  await fetchProviders();
});
window?.events?.receive('provider:update-warnings', async () => {
  await fetchProviders();
});
window?.events?.receive('provider:update-version', async () => {
  await fetchProviders();
});
window.addEventListener('system-ready', async () => {
  await fetchProviders();
});
window?.events?.receive('provider-register-kubernetes-connection', async () => {
  await fetchProviders();
});
window?.events?.receive('provider-unregister-kubernetes-connection', async () => {
  await fetchProviders();
});
window.events?.receive('extensions-started', async () => {
  await fetchProviders();
});
