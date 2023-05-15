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
import type { ExtensionInfo } from '../../../main/src/plugin/api/extension-info';

export async function fetchExtensions() {
  const result = await window.listExtensions();
  result.sort((a, b) => a.displayName.localeCompare(b.displayName));
  extensionInfos.set(result);
}

export const extensionInfos: Writable<ExtensionInfo[]> = writable([]);

// need to refresh when extension is started or stopped
window?.events?.receive('extension-starting', async () => {
  await fetchExtensions();
});
window?.events?.receive('extension-started', async () => {
  await fetchExtensions();
});
window?.events?.receive('extension-stopping', async () => {
  await fetchExtensions();
});
window?.events?.receive('extension-stopped', async () => {
  await fetchExtensions();
});
window?.events?.receive('extension-removed', async () => {
  await fetchExtensions();
});
window?.events?.receive('extensions-started', async () => {
  await fetchExtensions();
});
window.addEventListener('system-ready', async () => {
  await fetchExtensions();
});
