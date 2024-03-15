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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type { WebviewInfo } from '../../../main/src/plugin/api/webview-info';
import { EventStore } from './event-store';

const windowEvents = [
  'extension-stopped',
  'extensions-started',
  'extension-started',
  'webview-create',
  'webview-update',
  'webview-delete',
];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}
export const webviews: Writable<WebviewInfo[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listWebviews = async (): Promise<WebviewInfo[]> => {
  return window.listWebviews();
};

export const webviewsEventStore = new EventStore<WebviewInfo[]>(
  'views',
  webviews,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listWebviews,
);
const webviewsEventStoreInfo = webviewsEventStore.setup();

export const fetchWebviews = async () => {
  await webviewsEventStoreInfo.fetch();
};
