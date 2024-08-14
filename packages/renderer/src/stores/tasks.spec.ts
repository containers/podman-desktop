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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { NotificationTaskInfo, TaskInfo } from '/@api/taskInfo';

import { clearNotifications, isNotificationTask } from './tasks';

const started = new Date().getTime();

const SUCCEED_TASK: TaskInfo = { id: '1', name: 'Running Task 1', status: 'success', state: 'completed', started };

const NOTIFICATION_TASK: NotificationTaskInfo = {
  id: '1',
  name: 'Notification Task 1',
  body: ' description',
  state: 'completed',
  status: 'success',
  started,
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect clearNotification to call window.clearTasks', async () => {
  const clearTasksMock = vi.fn();
  (window as { clearTasks: () => void }).clearTasks = clearTasksMock;

  clearNotifications();

  expect(clearTasksMock).toHaveBeenCalled();
});

describe('isNotificationTask', () => {
  test('return true if notificationTask', async () => {
    const result = isNotificationTask(NOTIFICATION_TASK);
    expect(result).toBeTruthy();
  });

  test('return false if it is not a notificationTask', async () => {
    const result = isNotificationTask(SUCCEED_TASK);
    expect(result).toBeFalsy();
  });
});
