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

import type { Task, TaskAction, TaskState, TaskUpdateEvent } from '/@/plugin/tasks/tasks.js';

import { ProgressImpl, ProgressLocation } from './progress-impl.js';
import type { TaskManager } from './tasks/task-manager.js';

const taskManager = {
  createTask: vi.fn(),
} as unknown as TaskManager;

class TestTaskImpl implements Task {
  constructor(
    public readonly id: string,
    public name: string,
    public state: TaskState,
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
  const task = new TestTaskImpl('test-task-id', 'test-title', 'loading');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => 0);

  expect(task.state).toBe('success');
});

test('Should create a task and report progress', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'loading');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ increment: 50 });
  });

  expect(task.state).toBe('success');
  expect(task.progress).toBe(50);
});

test('Should create a task and propagate the exception', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'loading');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager);

  await expect(
    progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => {
      throw new Error('dummy error');
    }),
  ).rejects.toThrowError('dummy error');

  expect(taskManager.createTask).toHaveBeenCalledTimes(1);
  expect(task.error).toBe('Error: dummy error');
  expect(task.state).toBe('error');
});

test('Should create a task and propagate the result', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'loading');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager);

  const result: string = await progress.withProgress<string>(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task' },
    async () => {
      return 'dummy result';
    },
  );
  expect(result).toBe('dummy result');

  expect(task.state).toBe('success');
});

test('Should update the task name', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'loading');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  const progress = new ProgressImpl(taskManager);

  await progress.withProgress<void>({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ message: 'New title' });
  });

  expect(task.name).toBe('New title');
  expect(task.state).toBe('success');
});
