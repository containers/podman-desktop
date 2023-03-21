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
      window.onDidUpdateProviderStatus(providerInfo.internalId, () => {
        fetchProviders();
      });
      updateProviderCallbacks.push(providerInfo.internalId);
    }
  });
}

export const providerInfos: Writable<ProviderInfo[]> = writable([]);

// need to refresh when extension is started or stopped
window.addEventListener('extension-started', () => {
  fetchProviders();
});
window.addEventListener('extension-stopped', () => {
  fetchProviders();
});

window.addEventListener('provider-lifecycle-change', () => {
  fetchProviders();
});

window?.events?.receive('provider-lifecycle-change', () => {
  fetchProviders();
});

window?.events?.receive('provider-change', () => {
  fetchProviders();
});
window?.events?.receive('provider-create', () => {
  fetchProviders();
});
window?.events?.receive('provider-delete', () => {
  fetchProviders();
});
window?.events?.receive('provider:update-status', () => {
  fetchProviders();
});
window?.events?.receive('provider:update-warnings', () => {
  fetchProviders();
});
window.addEventListener('system-ready', () => {
  fetchProviders();
});
window?.events?.receive('provider-register-kubernetes-connection', () => {
  fetchProviders();
});
window?.events?.receive('provider-unregister-kubernetes-connection', () => {
  fetchProviders();
});
