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

import type { SecretInfo } from '@desktop-framework/api';
import { derived, type Writable, writable } from 'svelte/store';

import SecretIcon from '/@/lib/images/SecretIcon.svelte';
import { findMatchInLeaves } from '/@/stores/search-util';

import { EventStore } from './event-store';

const windowEvents = ['extension-started', 'provider-change', 'extensions-started', 'secret-event'];
const windowListeners = ['tray:update-provider', 'extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const secretsInfo: Writable<Array<SecretInfo>> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listSecrets = (): Promise<SecretInfo[]> => {
  return window.listSecrets();
};

export const secretsEventStore = new EventStore<Array<SecretInfo>>(
  'secrets',
  secretsInfo,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listSecrets,
  SecretIcon,
);
secretsEventStore.setupWithDebounce();

export const searchPattern = writable('');

export const filtered = derived([searchPattern, secretsInfo], ([$searchPattern, $networksList]) =>
  $networksList.filter(network => findMatchInLeaves(network, $searchPattern.toLowerCase())),
);
