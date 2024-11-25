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

import { beforeEach, expect, test, vi } from 'vitest';

import type { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { TaskAction } from '/@/plugin/tasks/tasks.js';
import type { TaskState, TaskStatus } from '/@api/taskInfo.js';

import { CancellationTokenSource } from '../cancellation-token.js';
import type { CancellationTokenRegistry } from '../cancellation-token-registry.js';
import { ProgressImpl, ProgressLocation } from './progress-impl.js';
import { TaskImpl } from './task-impl.js';
import type { TaskManager } from './task-manager.js';

const taskManager = {
  createTask: vi.fn(),
} as unknown as TaskManager;

const navigationManager = {
  hasRoute: vi.fn(),
  navigateToRoute: vi.fn(),
} as unknown as NavigationManager;

const cancellationTokenRegistry = {
  createCancellationTokenSource: vi.fn(),
  getCancellationTokenSource: vi.fn(),
} as unknown as CancellationTokenRegistry;

class TestTaskImpl extends TaskImpl {
  constructor(id: string, name: string, state: TaskState, status: TaskStatus) {
    super(id, name);
    this.state = state;
    this.status = status;
  }
}

let progress: ProgressImpl;
beforeEach(() => {
  vi.clearAllMocks();
  progress = new ProgressImpl(taskManager, navigationManager, cancellationTokenRegistry);
});

test('Should create a task and report update', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => 0);

  expect(task.status).toBe('success');
});

test('Should create a task and report progress', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ increment: 50 });
  });

  expect(task.status).toBe('success');
  expect(task.progress).toBe(50);
});

test('Should create a task and propagate the exception', async () => {
  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(task);

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

  await progress.withProgress<void>({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ message: 'New title' });
  });

  expect(task.name).toBe('New title');
  expect(task.status).toBe('success');
});

test('Should create a task with a navigation action', async () => {
  vi.mocked(navigationManager.hasRoute).mockReturnValue(true);

  const task = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');

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

test('Should create a cancellable task with a source id if cancellable option provided ', async () => {
  const dummyTask = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(dummyTask);

  const tokenSourceId = 1234;
  // get id for the token source
  vi.mocked(cancellationTokenRegistry.createCancellationTokenSource).mockReturnValue(tokenSourceId);

  //get the token source
  vi.mocked(cancellationTokenRegistry.getCancellationTokenSource).mockReturnValue(new CancellationTokenSource());

  await progress.withProgress(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task', cancellable: true },
    async progress => {
      progress.report({ increment: 50 });
    },
  );

  // grab the options passed to createTask
  const options = vi.mocked(taskManager.createTask).mock.calls[0]?.[0];
  expect(options).toBeDefined();
  // expect callable has been set
  expect(options?.cancellable).toBeTruthy();
  // expect the token source id to be set
  expect(options?.cancellationTokenSourceId).toBe(tokenSourceId);

  // check that the token source was created
  expect(cancellationTokenRegistry.createCancellationTokenSource).toHaveBeenCalled();
  expect(cancellationTokenRegistry.getCancellationTokenSource).toHaveBeenCalled();
});

test('Should not provide cancellable and source id if cancellable option is omitted ', async () => {
  const dummyTask = new TestTaskImpl('test-task-id', 'test-title', 'running', 'in-progress');
  vi.mocked(taskManager.createTask).mockReturnValue(dummyTask);

  await progress.withProgress(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task', cancellable: false },
    async progress => {
      progress.report({ increment: 50 });
    },
  );

  // grab the options passed to createTask
  const options = vi.mocked(taskManager.createTask).mock.calls[0]?.[0];
  expect(options).toBeDefined();
  // expect callable not provided
  expect(options?.cancellable).toBeFalsy();
  // expect the token source id not being set
  expect(options?.cancellationTokenSourceId).toBeUndefined();

  // check that the cancellationTokenRegistry was never called
  expect(cancellationTokenRegistry.createCancellationTokenSource).not.toHaveBeenCalled();
  expect(cancellationTokenRegistry.getCancellationTokenSource).not.toHaveBeenCalled();
});
