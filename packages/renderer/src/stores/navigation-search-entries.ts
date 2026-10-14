/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { NavigationSearchEntryInfo } from '@desktop-framework/api';
import { type Writable, writable } from 'svelte/store';

import { EventStore } from './event-store';

const windowEvents = ['navigation-searchable-route-update'];
const windowListeners = ['system-ready'];

async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const navigationSearchEntries: Writable<readonly NavigationSearchEntryInfo[]> = writable([]);

const listSearchableRoutes = (): Promise<readonly NavigationSearchEntryInfo[]> => {
  return window.getSearchableNavigationRoutes();
};

export const navigationSearchEntriesEventStore = new EventStore<readonly NavigationSearchEntryInfo[]>(
  'navigation-search-entries',
  navigationSearchEntries,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listSearchableRoutes,
);
export const navigationSearchEntriesEventStoreInfo = navigationSearchEntriesEventStore.setup();
