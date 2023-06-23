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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { IconInfo } from '../../../main/src/plugin/api/icon-info';

let readyToUpdate = false;

export async function fetchIcons() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  const result = await window.listIcons();
  iconsInfos.set(result);
}

export const iconsInfos: Writable<IconInfo[]> = writable([]);

// need to refresh when extension is started or stopped
window.events?.receive('icon-update', async () => {
  await fetchIcons();
});
window.events?.receive('extension-stopped', async () => {
  await fetchIcons();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchIcons();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchIcons().catch((error: unknown) => {
    console.error('Failed to fetch icons', error);
  });
});
