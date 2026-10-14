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

import type { NotificationCard } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { fetchNotifications, notificationEventStore, notificationQueue } from './notifications';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('notifications should be updated in case of an extension is stopped', async () => {
  // initial view
  vi.mocked(window.listNotifications).mockResolvedValue([
    {
      id: 0,
      extensionId: 'extension',
      title: 'title',
      decription: 'description',
      type: 'info',
    } as unknown as NotificationCard,
  ]);
  notificationEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch notifiations
  await fetchNotifications();

  // now get queue
  const notificationQueue1 = get(notificationQueue);
  expect(notificationQueue1.length).toBe(1);
  expect(notificationQueue1[0].id).toEqual(0);

  // ok now mock the listNotifications function to return an empty list
  vi.mocked(window.listNotifications).mockResolvedValue([]);

  // call 'notifications-updated' event
  const extensionStoppedCallback = callbacks.get('notifications-updated');
  assert(extensionStoppedCallback);
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the notifications are updated
  const notificationQueue2 = get(notificationQueue);
  expect(notificationQueue2.length).toBe(0);
});
