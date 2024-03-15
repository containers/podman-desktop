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

import { type Writable, writable } from 'svelte/store';

import type { CatalogExtension } from '../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import { EventStore } from './event-store';

const windowEvents: string[] = [];
const windowListeners = ['system-ready'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const catalogExtensionInfos: Writable<CatalogExtension[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const getCatalogExtensions = (): Promise<CatalogExtension[]> => {
  return window.getCatalogExtensions();
};

export const catalogExtensionEventStore = new EventStore<CatalogExtension[]>(
  'catalog extensions',
  catalogExtensionInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getCatalogExtensions,
);
export const catalogExtensionEventStoreInfo = catalogExtensionEventStore.setup();

// and refresh every 4 hours from client side
setInterval(
  () => {
    catalogExtensionEventStoreInfo.fetch().catch((e: unknown) => {
      console.error('Unable to fetch catalog extensions', e);
    });
  },
  4 * 60 * 60 * 1000,
);
