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
import type { StatusBarEntryDescriptor } from '../../../main/src/plugin/statusbar/statusbar-registry';
import { STATUS_BAR_UPDATED_EVENT_NAME } from '../../../main/src/plugin/statusbar/statusbar-registry';

export async function fetchRenderModel() {
  const result = await window.getStatusBarEntries();
  statusBarEntries.set(result);
}

export const statusBarEntries: Writable<readonly StatusBarEntryDescriptor[]> = writable([]);

window.events?.receive(STATUS_BAR_UPDATED_EVENT_NAME, async () => {
  await fetchRenderModel();
});
window.addEventListener('system-ready', () => {
  fetchRenderModel().catch((error: unknown) => {
    console.error('Failed to fetch status bar entries', error);
  });
});
