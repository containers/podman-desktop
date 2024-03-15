/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { NotificationCard } from '../../../main/src/plugin/api/notification';
import { fetchNotifications, notificationEventStore, notificationQueue } from './notifications';

// first, patch window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listNotificationsMock: Mock<any, Promise<NotificationCard[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listNotifications: listNotificationsMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test('notifications should be updated in case of an extension is stopped', async () => {
  // initial view
  listNotificationsMock.mockResolvedValue([
    {
      id: 0,
      extensionId: 'extension',
      title: 'title',
      decription: 'description',
      type: 'info',
    } as unknown as NotificationCard,
  ]);
  notificationEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch notifiations
  await fetchNotifications();

  // now get queue
  const notificationQueue1 = get(notificationQueue);
  expect(notificationQueue1.length).toBe(1);
  expect(notificationQueue1[0].id).toEqual(0);

  // ok now mock the listNotifications function to return an empty list
  listNotificationsMock.mockResolvedValue([]);

  // call 'notifications-updated' event
  const extensionStoppedCallback = callbacks.get('notifications-updated');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the notifications are updated
  const notificationQueue2 = get(notificationQueue);
  expect(notificationQueue2.length).toBe(0);
});
