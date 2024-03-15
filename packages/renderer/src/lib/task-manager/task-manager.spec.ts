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

import '@testing-library/jest-dom/vitest';

import { beforeAll, expect, test, vi } from 'vitest';

import { isNotificationTask, tasksInfo } from '/@/stores/tasks';

import type { NotificationTask, StatefulTask } from '../../../../main/src/plugin/api/task';
import { TaskManager } from './task-manager';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    receive: vi.fn(),
  };
  // reset store
  tasksInfo.set([]);
});

const started = new Date().getTime();
const IN_PROGRESS_TASK: StatefulTask = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  started,
  status: 'in-progress',
};
const NOTIFICATION_TASK: NotificationTask = {
  id: '1',
  name: 'Notification Task 1',
  description: ' description',
  started,
};

test('Expect totaskUI returns original NotificationTask', async () => {
  const taskManager = new TaskManager();
  const task = taskManager.toTaskUi(NOTIFICATION_TASK);
  expect(task.id).equal(NOTIFICATION_TASK.id);
  expect(isNotificationTask(task)).toBeTruthy();
});

test('Expect toTaskUI returns StatefulTaskUi for StatefulTask', async () => {
  const taskManager = new TaskManager();
  const task = taskManager.toTaskUi(IN_PROGRESS_TASK);
  expect('age' in task).toBeTruthy();
});
