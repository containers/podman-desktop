/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ExploreFeature } from '@desktop-framework/api';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { EventStore } from './event-store';

const windowEvents = ['explore-features-loaded', 'provider-change', 'provider-container-connection-update-status'];
const windowListeners = ['update-explore-features', 'extensions-already-started'];

let readyToUpdate = false;

async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('explore-features-loaded' === eventName || 'extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}
export const exploreFeaturesInfo: Writable<ExploreFeature[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listExploreFeatures = (): Promise<ExploreFeature[]> => {
  return window.listFeatures();
};

const exploreFeaturesEventStore = new EventStore<ExploreFeature[]>(
  'exploreFeatures',
  exploreFeaturesInfo,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listExploreFeatures,
);
exploreFeaturesEventStore.setup();
