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

import { type Writable, writable } from 'svelte/store';

import type { FeaturedExtension } from '../../../main/src/plugin/featured/featured-api';
import { EventStore } from './event-store';

const windowEvents = [
  'extension-starting',
  'extension-started',
  'extension-stopping',
  'extension-stopped',
  'extension-removed',
  'extensions-started',
];
const windowListeners = ['system-ready'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const featuredExtensionInfos: Writable<FeaturedExtension[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const getFeaturedExtensions = (): Promise<FeaturedExtension[]> => {
  return window.getFeaturedExtensions();
};

const featuredExtensionsEventStore = new EventStore<FeaturedExtension[]>(
  'feat extensions',
  featuredExtensionInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getFeaturedExtensions,
);
featuredExtensionsEventStore.setup();
