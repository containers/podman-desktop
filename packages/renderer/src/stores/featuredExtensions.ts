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
import type { FeaturedExtension } from '../../../main/src/plugin/featured/featured-api';

export async function fetchFeaturedExtensions() {
  const result = await window.getFeaturedExtensions();
  featuredExtensionInfos.set(result);
}

export const featuredExtensionInfos: Writable<FeaturedExtension[]> = writable([]);

// need to refresh when extension is started or stopped
window?.events?.receive('extension-starting', async () => {
  await fetchFeaturedExtensions();
});
window?.events?.receive('extension-started', async () => {
  await fetchFeaturedExtensions();
});
window?.events?.receive('extension-stopping', async () => {
  await fetchFeaturedExtensions();
});
window?.events?.receive('extension-stopped', async () => {
  await fetchFeaturedExtensions();
});
window?.events?.receive('extension-removed', async () => {
  await fetchFeaturedExtensions();
});
window.addEventListener('system-ready', () => {
  fetchFeaturedExtensions().catch((e: unknown) => {
    console.error('Unable to fetch featured extensions', e);
  });
});

window.events?.receive('extensions-started', async () => {
  await fetchFeaturedExtensions();
});
