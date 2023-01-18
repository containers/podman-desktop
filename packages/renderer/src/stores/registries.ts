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

import type * as containerDesktopAPI from '@tmpwip/extension-api';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export async function fetchRegistries() {
  const registries = await window.getImageRegistries();
  registriesInfos.set(registries);

  const suggestedRegistries = await window.getImageSuggestedRegistries();

  // Filter out registries from suggestedRegistries that already exist in registries list
  // we'll compare the URLs of the registries
  const filteredSuggested = suggestedRegistries.filter(suggested => {
    // Ignore 'https' because we don't support http anyways and user may input https into list of registries
    const found = registries.find(registry => registry.serverUrl.replace('https://', '') === suggested.url);
    return !found;
  });

  registriesSuggestedInfos.set(filteredSuggested);
}

export const registriesInfos: Writable<readonly containerDesktopAPI.Registry[]> = writable([]);

export const registriesSuggestedInfos: Writable<readonly containerDesktopAPI.RegistrySuggestedProvider[]> = writable(
  [],
);

export const searchPattern = writable('');

// need to refresh when new registry are updated/deleted
window.events?.receive('registry-register', () => {
  fetchRegistries();
});

window.events?.receive('registry-unregister', () => {
  fetchRegistries();
});

window.events?.receive('registry-update', () => {
  fetchRegistries();
});
window.addEventListener('system-ready', () => {
  fetchRegistries();
});
