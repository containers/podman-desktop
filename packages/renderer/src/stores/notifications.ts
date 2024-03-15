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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type { NotificationCard } from '../../../main/src/plugin/api/notification';
import { EventStore } from './event-store';

const windowEvents = ['notifications-updated'];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}
export const notificationQueue: Writable<NotificationCard[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listNotifications = (): Promise<NotificationCard[]> => {
  return window.listNotifications();
};

export const notificationEventStore = new EventStore<NotificationCard[]>(
  'notifications',
  notificationQueue,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listNotifications,
);
const notificationEventStoreInfo = notificationEventStore.setup();

export const fetchNotifications = async () => {
  await notificationEventStoreInfo.fetch();
};
