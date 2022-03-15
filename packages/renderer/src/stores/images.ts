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

import { writable, derived } from 'svelte/store';
import type { ImageInfo } from '../../../preload/src/api/image-info';
export async function fetchImages() {
  const result = await window.listImages();
  imagesInfos.set(result);
}

fetchImages();
export const imagesInfos = writable([]);

export const searchPattern = writable('');

function getName(imageInfo: ImageInfo) {
  return JSON.stringify(imageInfo).toLowerCase();
}

export const filtered = derived([searchPattern, imagesInfos], ([$searchPattern, $imagesInfos]) =>
  $imagesInfos.filter(imageInfo => getName(imageInfo).includes($searchPattern.toLowerCase())),
);

// need to refresh when extension is started or stopped
window.addEventListener('extension-started', () => {
  fetchImages();
});
window.addEventListener('extension-stopped', () => {
  fetchImages();
});

window.addEventListener('image-build', () => {
  fetchImages();
});

window?.events.receive('provider-change', () => {
  console.log('receive provider change event, fetchImages...');
  fetchImages();
});
