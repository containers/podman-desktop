/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { beforeEach, expect, test, vi } from 'vitest';
import type { ApiSenderType } from './api.js';
import type { Disposable } from './types/disposable.js';
import { NotificationRegistry } from './notification-registry.js';

let notificationRegistry: NotificationRegistry;
const extensionId = 'myextension.id';
const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;

let registerNotificationDisposable: Disposable;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  notificationRegistry = new NotificationRegistry(apiSender);
  registerNotificationDisposable = notificationRegistry.registerExtension(extensionId);
});

test('expect notification added to the queue', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    description: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);
  expect(queue[0].extensionId).toEqual(extensionId);
  expect(queue[0].title).toEqual('title');
  expect(queue[0].type).toEqual('info');
});

test('expect latest added notification is in top of the queue', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    description: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    description: '2',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '3',
    description: '3',
    type: 'info',
  });

  const queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(3);
  expect(queue[0].extensionId).toEqual(extensionId);
  expect(queue[0].title).toEqual('3');
  expect(queue[0].type).toEqual('info');

  expect(queue[1].extensionId).toEqual(extensionId);
  expect(queue[1].title).toEqual('2');
  expect(queue[1].type).toEqual('info');

  expect(queue[2].extensionId).toEqual(extensionId);
  expect(queue[2].title).toEqual('1');
  expect(queue[2].type).toEqual('info');
});

test('expect the queue to not have the notification after it is removed by id', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    description: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);

  notificationRegistry.removeNotificationById(queue[0].id);
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});

test('expect the queue to not have the notifications after they are removed by extensionid and title', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    description: 'description',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    description: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(2);

  notificationRegistry.removeNotificationsByExtensionAndTitle(extensionId, 'title');
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});

test('expect all notifications to be removed', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    description: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    description: '2',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '3',
    description: '3',
    type: 'info',
  });

  let queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(3);

  notificationRegistry.removeAll();

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});

test('expect all notifications belonging to an extensions are removed after it is uninstalled', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    description: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    description: '2',
    type: 'info',
  });
  let queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(2);

  registerNotificationDisposable.dispose();
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});
