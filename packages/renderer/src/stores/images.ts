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
import { derived, writable } from 'svelte/store';

import type { ImageInfo } from '/@api/image-info';

import ImageIcon from '../lib/images/ImageIcon.svelte';
import { EventStore } from './event-store';
import { findMatchInLeaves } from './search-util';

const windowEvents = [
  'extension-started',
  'extension-stopped',
  'provider-change',
  'image-pull-event',
  'image-remove-event',
  'image-build-event',
  'registry-register',
  'registry-unregister',
  'image-tag-event',
  'image-untag-event',
  'extensions-started',
  'image-loadfromarchive-event',
];
const windowListeners = ['image-build', 'extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const imagesInfos: Writable<ImageInfo[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listImages = (): Promise<ImageInfo[]> => {
  return window.listImages();
};

export const imagesEventStore = new EventStore<ImageInfo[]>(
  'images',
  imagesInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listImages,
  ImageIcon,
);
imagesEventStore.setupWithDebounce();

export const searchPattern = writable('');

export const filtered = derived([searchPattern, imagesInfos], ([$searchPattern, $imagesInfos]) =>
  $imagesInfos.filter(imageInfo => findMatchInLeaves(imageInfo, $searchPattern.toLowerCase())),
);
