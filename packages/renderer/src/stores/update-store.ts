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

import { writable } from 'svelte/store';

import { EventStore } from './event-store';

export const updateAvailable = writable(false);

const windowEvents = ['app-update-available'];

const windowListeners = ['extensions-already-started'];

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    const podmanDesktopUpdateAvailable = await window.podmanDesktopUpdateAvailable();
    updateAvailable.set(podmanDesktopUpdateAvailable);
  } else if ('app-update-available' === eventName) {
    return true;
  }
  return false;
}

const isUpdateAvailable = (...args: unknown[]): Promise<boolean> => {
  const eventArg = args.length > 0 ? args[0] : false;
  if (typeof eventArg === 'boolean') {
    return Promise.resolve(eventArg);
  }
  return Promise.resolve(false);
};

export const updateEventStore = new EventStore<boolean>(
  'updater',
  updateAvailable,
  checkForUpdate,
  windowEvents,
  windowListeners,
  isUpdateAvailable,
);

updateEventStore.setup();
