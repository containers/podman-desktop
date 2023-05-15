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
import type { ContributionInfo } from '../../../main/src/plugin/api/contribution-info';

export async function fetchContributions() {
  const result = await window.listContributions();
  contributions.set(result);
}

export const contributions: Writable<readonly ContributionInfo[]> = writable([]);

// need to refresh when new registry are updated/deleted
window.events?.receive('contribution-register', async () => {
  await fetchContributions();
});

window.events?.receive('contribution-unregister', async () => {
  await fetchContributions();
});
window.addEventListener('system-ready', () => {
  fetchContributions().catch((error: unknown) => {
    console.error('Failed to fetch contributions', error);
  });
});
