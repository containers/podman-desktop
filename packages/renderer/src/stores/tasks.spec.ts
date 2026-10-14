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

import { type IDisposable, type NotificationTaskInfo, TASK_STATUSES, type TaskInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

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

// tasks.ts registers its window.events.receive listeners at module load time, so the
// tracking mock must be wired up in vi.hoisted() to run before the './tasks' import.
const { callbacks, eventEmitter } = vi.hoisted(() => {
  const callbacks = new Map<string, (data: unknown) => void>();
  const eventEmitter = (message: string, func: (...args: unknown[]) => void): IDisposable => {
    callbacks.set(message, func);
    return {} as IDisposable;
  };

  vi.mocked(window.events.receive).mockImplementation((channel: string, func: (...args: unknown[]) => void) => {
    return eventEmitter(channel, func);
  });

  return { callbacks, eventEmitter };
});

beforeEach(() => {
  tasksInfo.set([]);
  vi.resetAllMocks();

  vi.mocked(window.events.receive).mockImplementation((channel, args) => {
    return eventEmitter(channel, args);
  });
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

describe('normalizeTask via task-created event', () => {
  test('should copy body to error for notification task with failure status', () => {
    const task: NotificationTaskInfo = {
      ...NOTIFICATION_TASK,
      id: 'notification-1',
      body: 'this is the error message',
      status: 'failure',
    };

    // Trigger the task-created event
    const callback = callbacks.get('task-created');
    assert(callback);
    callback(task);

    // Check tasksInfo has the normalized task with body copied to error
    const tasks = get(tasksInfo);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('notification-1');
    expect(tasks[0].error).toBe('this is the error message');
  });

  test('should not copy body to error for notification task with success status', () => {
    const task: NotificationTaskInfo = {
      ...NOTIFICATION_TASK,
      id: 'notification-2',
      body: 'this is the body',
      status: 'success',
    };

    // Trigger the task-created event
    const callback = callbacks.get('task-created');
    assert(callback);
    callback(task);

    // Check tasksInfo has the task without error field
    const tasks = get(tasksInfo);
    const addedTask = tasks.find(t => t.id === 'notification-2');
    expect(addedTask).toBeDefined();
    expect(addedTask?.error).toBeUndefined();
  });
});
