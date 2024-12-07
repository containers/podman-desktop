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

import { get } from 'svelte/store';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { type NotificationTaskInfo, TASK_STATUSES, type TaskInfo } from '/@api/taskInfo';

import {
  clearNotifications,
  filtered,
  getMatchingStatusFromSearchPattern,
  isNotificationTask,
  searchPattern,
  type TaskInfoUI,
  tasksInfo,
} from './tasks';

const started = new Date().getTime();

const SUCCEED_TASK: TaskInfo = {
  id: '1',
  name: 'Running Task 1',
  status: 'success',
  state: 'completed',
  started,
  cancellable: false,
};

const NOTIFICATION_TASK: NotificationTaskInfo = {
  id: '1',
  name: 'Notification Task 1',
  body: ' description',
  state: 'completed',
  status: 'success',
  started,
  cancellable: false,
};

beforeEach(() => {
  tasksInfo.set([]);
  vi.resetAllMocks();
});

test('Expect clearNotification to call window.clearTasks', async () => {
  const clearTasksMock = vi.fn().mockResolvedValue(undefined);
  (window as { clearTasks: () => void }).clearTasks = clearTasksMock;

  await clearNotifications();

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

describe('getMatchingStatusFromSearchPattern', async () => {
  test('works with success', () => {
    const result = getMatchingStatusFromSearchPattern('this is an example is:success');

    expect(result).toEqual('success');
    expect(TASK_STATUSES).toContain(result);
  });

  test('return undefined without any status', () => {
    const result = getMatchingStatusFromSearchPattern('this is an example');

    expect(result).toBeUndefined();
  });
});

describe('filtered', () => {
  // set 3 tasks
  const task1: TaskInfoUI = {
    id: '1',
    name: 'Completed Task 1',
    state: 'completed',
    status: 'failure',
  } as unknown as TaskInfoUI;
  const task2: TaskInfoUI = {
    id: '2',
    name: 'Completed Task 2',
    state: 'completed',
    status: 'canceled',
  } as unknown as TaskInfoUI;
  const task3: TaskInfoUI = {
    id: '3',
    name: 'Completed Task 3',
    state: 'completed',
    status: 'success',
  } as unknown as TaskInfoUI;

  test('find matching task name', () => {
    searchPattern.set('Task 1');
    tasksInfo.set([task1, task2, task3]);

    const response = get(filtered);

    // only task1 should be returned
    expect(response).toEqual([task1]);
  });

  test('find a given status', () => {
    searchPattern.set('is:canceled');
    tasksInfo.set([task1, task2, task3]);

    const response = get(filtered);

    // only task2 should be returned
    expect(response).toEqual([task2]);
  });
});
