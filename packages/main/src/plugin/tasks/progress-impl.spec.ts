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

/* eslint-disable @typescript-eslint/no-empty-function */

import type { Event } from '@podman-desktop/api';
import { beforeEach, expect, test, vi } from 'vitest';

import type { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { Task, TaskAction, TaskUpdateEvent } from '/@/plugin/tasks/tasks.js';
import type { TaskState, TaskStatus } from '/@api/taskInfo.js';

import { ProgressImpl, ProgressLocation } from './progress-impl.js';
import type { TaskManager } from './task-manager.js';

const taskManager = {
  createTask: vi.fn(),
} as unknown as TaskManager;

const navigationManager = {
  hasRoute: vi.fn(),
  navigateToRoute: vi.fn(),
} as unknown as NavigationManager;

class TestTaskImpl implements Task {
  constructor(
    public readonly id: string,
    public name: string,
    public state: TaskState,
    public status: TaskStatus,
  ) {
    this.started = 0;
  }

  started: number;
  error?: string;
  progress?: number;
  action?: TaskAction;

  get onUpdate(): Event<TaskUpdateEvent> {
    throw new Error('not implemented');
  }
  dispose(): void {
    throw new Error('not implemented');
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should create a task and report update', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager, navigationManager);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => 0);

  expect(task.status).toBe('success');
});

test('Should create a task and report progress', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager, navigationManager);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ increment: 50 });
  });

  expect(task.status).toBe('success');
  expect(task.progress).toBe(50);
});

test('Should create a task and propagate the exception', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager, navigationManager);

  await expect(
    progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => {
      throw new Error('dummy error');
    }),
  ).rejects.toThrowError('dummy error');

  expect(taskManager.createTask).toHaveBeenCalledTimes(1);
  expect(task.error).toBe('Error: dummy error');
});

test('Should create a task and propagate the result', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager, navigationManager);

  const result: string = await progress.withProgress<string>(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task' },
    async () => {
      return 'dummy result';
    },
  );
  expect(result).toBe('dummy result');

  expect(task.status).toBe('success');
});

test('Should update the task name', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager, navigationManager);

  await progress.withProgress<void>({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ message: 'New title' });
  });

  expect(task.name).toBe('New title');
  expect(task.status).toBe('success');
});

test('Should create a task with a navigation action', async () => {
  vi.mocked(navigationManager.hasRoute).mockReturnValue(true);

  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  const progress = new ProgressImpl(taskManager, navigationManager);

  let taskAction: TaskAction | undefined;
  vi.mocked(taskManager.createTask).mockImplementation(options => {
    taskAction = options?.action;
    return task;
  });

  await progress.withProgress<string>(
    {
      location: ProgressLocation.TASK_WIDGET,
      title: 'My task',
      details: {
        routeId: 'dummy-route-id',
        routeArgs: ['hello', 'world'],
      },
    },
    async () => {
      return 'dummy result';
    },
  );

  await vi.waitFor(() => {
    expect(taskAction).toBeDefined();
  });

  expect(taskAction?.name).toBe('View');
  expect(taskAction?.execute).toBeInstanceOf(Function);

  // execute the task action
  taskAction?.execute(task);

  // ensure the arguments and routeId is properly used
  expect(navigationManager.navigateToRoute).toHaveBeenCalledWith('dummy-route-id', 'hello', 'world');
});
