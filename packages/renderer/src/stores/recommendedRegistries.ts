/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { RecommendedRegistry } from '@desktop-framework/api/recommendations';
import { RecommendationsSettings } from '@desktop-framework/api/recommendations';
import { type Writable, writable } from 'svelte/store';

import { EventStore, fineGrainedEvents } from './event-store';

let readyToUpdate = false;

const windowEvents = [
  'extension-starting',
  'extension-started',
  'extension-stopping',
  'extension-stopped',
  'extension-removed',
  'extensions-started',
  fineGrainedEvents('configuration-changed', [
    `${RecommendationsSettings.SectionName}.${RecommendationsSettings.IgnoreRecommendations}`,
  ]),
];
const windowListeners = ['extensions-already-started'];

async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

// use helper here as window methods are initialized after the store in tests
const getRecommendedRegistries = (): Promise<RecommendedRegistry[]> => {
  return window.getRecommendedRegistries();
};

export const recommendedRegistries: Writable<RecommendedRegistry[]> = writable([]);

export const recommendedRegistriesEventStore = new EventStore<RecommendedRegistry[]>(
  'recommended registries',
  recommendedRegistries,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getRecommendedRegistries,
);
const recommendedRegistriesEventStoreInfo = recommendedRegistriesEventStore.setup();

export const fetchRecommendedRegistries = async (): Promise<void> => {
  await recommendedRegistriesEventStoreInfo.fetch();
};
