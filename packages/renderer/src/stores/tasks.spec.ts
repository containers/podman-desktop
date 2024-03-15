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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import { expect, test } from 'vitest';

import type { NotificationTask, StatefulTask } from '../../../main/src/plugin/api/task';
import { clearNotifications, isNotificationTask, isStatefulTask, tasksInfo } from './tasks';

const started = new Date().getTime();
const IN_PROGRESS_TASK: StatefulTask = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  started,
  status: 'in-progress',
};
const SUCCEED_TASK: StatefulTask = { id: '1', name: 'Running Task 1', state: 'completed', started, status: 'success' };
const NOTIFICATION_TASK: NotificationTask = {
  id: '1',
  name: 'Notification Task 1',
  description: ' description',
  started,
};

test('Expect clearNotification removes all completed tasks and notifications', async () => {
  tasksInfo.set([SUCCEED_TASK, NOTIFICATION_TASK, IN_PROGRESS_TASK]);

  clearNotifications();

  const tasks = get(tasksInfo);
  expect(tasks.length).equal(1);
  expect(tasks[0].name).equal(IN_PROGRESS_TASK.name);
});

test('return true if statefulTask', async () => {
  const result = isStatefulTask(SUCCEED_TASK);
  expect(result).toBeTruthy();
});

test('return false if it is not a statefulTask', async () => {
  const result = isStatefulTask(NOTIFICATION_TASK);
  expect(result).toBeFalsy();
});

test('return true if notificationTask', async () => {
  const result = isNotificationTask(NOTIFICATION_TASK);
  expect(result).toBeTruthy();
});

test('return false if it is not a notificationTask', async () => {
  const result = isNotificationTask(SUCCEED_TASK);
  expect(result).toBeFalsy();
});
