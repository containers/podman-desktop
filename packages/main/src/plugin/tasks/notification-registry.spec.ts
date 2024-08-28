/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { ApiSenderType } from '../api.js';
import { Disposable } from '../types/disposable.js';
import { NotificationRegistry } from './notification-registry.js';
import type { TaskManager } from './task-manager.js';

let notificationRegistry: NotificationRegistry;
const extensionId = 'myextension.id';
const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;
const createNotificationtaskMock = vi.fn();
const deleteTaskMock = vi.fn();
const taskManager: TaskManager = {
  createNotificationTask: createNotificationtaskMock,
  deleteTask: deleteTaskMock,
} as unknown as TaskManager;

let registerNotificationDisposable: Disposable;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  notificationRegistry = new NotificationRegistry(apiSender, taskManager);
  registerNotificationDisposable = notificationRegistry.registerExtension(extensionId);
});

vi.mock('electron', async () => {
  class Notification {
    show(): void {}
  }

  return {
    Notification,
  };
});

test('expect notification added to the queue', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    body: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);
  expect(queue[0]?.extensionId).toEqual(extensionId);
  expect(queue[0]?.title).toEqual('title');
  expect(queue[0]?.type).toEqual('info');
  expect(createNotificationtaskMock).toBeCalledWith({
    title: 'title',
    body: 'description',
  });
});

test('expect notification is disposed correctly', async () => {
  vi.spyOn(notificationRegistry, 'showNotification').mockImplementation(() => {
    return Disposable.create(() => {});
  });
  const notificationDisposeMock = vi.fn();
  const notificationTask = {
    id: `main-1`,
    name: 'title',
    started: 1721656320682,
    description: 'description',
    dispose: notificationDisposeMock,
  };
  createNotificationtaskMock.mockImplementation(() => notificationTask);
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  const disposable = notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    body: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);
  expect(queue[0]?.extensionId).toEqual(extensionId);
  expect(queue[0]?.title).toEqual('title');
  expect(queue[0]?.type).toEqual('info');
  disposable.dispose();

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
  expect(notificationDisposeMock).toHaveBeenCalledOnce();
});

test('expect latest added notification is in top of the queue', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    body: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    body: '2',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '3',
    body: '3',
    type: 'info',
  });

  const queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(3);
  expect(queue[0]?.extensionId).toEqual(extensionId);
  expect(queue[0]?.title).toEqual('3');
  expect(queue[0]?.type).toEqual('info');

  expect(queue[1]?.extensionId).toEqual(extensionId);
  expect(queue[1]?.title).toEqual('2');
  expect(queue[1]?.type).toEqual('info');

  expect(queue[2]?.extensionId).toEqual(extensionId);
  expect(queue[2]?.title).toEqual('1');
  expect(queue[2]?.type).toEqual('info');
});

test('expect the queue to not have the notification after it is removed by id', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    body: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);

  const queueId = queue[0]?.id;
  expect(queueId).toBeDefined();
  notificationRegistry.removeNotificationById(queueId as number);
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});

test('expect the queue to not have the notifications after they are removed by extensionid and title', async () => {
  let queue = notificationRegistry.getNotifications();

  expect(queue.length).toEqual(0);
  notificationRegistry.addNotification({
    extensionId,
    title: 'title',
    body: 'description',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: 'title1',
    body: 'description',
    type: 'info',
  });

  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(2);

  notificationRegistry.removeNotificationsByExtensionAndTitle(extensionId, 'title');
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(1);
  expect(queue[0]?.title).equal('title1');
});

test('expect all notifications to be removed', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    body: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    body: '2',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '3',
    body: '3',
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
    body: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    body: '2',
    type: 'info',
  });
  let queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(2);

  registerNotificationDisposable.dispose();
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});

test('expect same notification to only appear once if added multiple times', async () => {
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    body: '1',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '2',
    body: '2',
    type: 'info',
  });
  notificationRegistry.addNotification({
    extensionId,
    title: '1',
    body: '1',
    type: 'info',
  });
  let queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(2);
  expect(queue[0]?.title).equal('1');
  expect(queue[1]?.title).equal('2');

  registerNotificationDisposable.dispose();
  queue = notificationRegistry.getNotifications();
  expect(queue.length).toEqual(0);
});
