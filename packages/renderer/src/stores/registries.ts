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

import type * as containerDesktopAPI from '@podman-desktop/api';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export async function fetchRegistries() {
  const registries = await window.getImageRegistries();
  const suggestedRegistries = await window.getImageSuggestedRegistries();

  // Before we set the registry, let's try and find an appropriate icon and name.
  // Go through each registry, search if it's within the "suggestedRegistry" list,
  // this means that Podman Desktop has a suggested icon and name for this registry.
  // If so, let's update the list.
  registries.forEach(registry => {
    const found = suggestedRegistries.find(suggested => suggested.url === registry.serverUrl.replace('https://', ''));
    if (found) {
      registry.icon = found.icon;
      registry.name = found.name;
    }
  });
  registriesInfos.set(registries);

  // Filter out registries from suggestedRegistries so we do not repeat suggesting them when the user already has
  // credentials added.
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
  fetchRegistries().catch((error: unknown) => {
    console.error('Failed to fetch registries entries', error);
  });
});

window.events?.receive('registry-unregister', () => {
  fetchRegistries().catch((error: unknown) => {
    console.error('Failed to fetch registries entries', error);
  });
});

window.events?.receive('registry-update', () => {
  fetchRegistries().catch((error: unknown) => {
    console.error('Failed to fetch registries entries', error);
  });
});

window.addEventListener('system-ready', () => {
  fetchRegistries().catch((error: unknown) => {
    console.error('Failed to fetch registries entries', error);
  });
});

window.events?.receive('extensions-started', () => {
  fetchRegistries().catch((error: unknown) => {
    console.error('Failed to fetch registries entries', error);
  });
});
