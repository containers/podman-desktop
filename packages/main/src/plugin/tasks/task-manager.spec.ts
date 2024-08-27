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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';

import type { ApiSenderType } from '../api.js';
import { TaskManager } from './task-manager.js';

const apiSenderSendMock = vi.fn();

const mocks = vi.hoisted(() => ({
  registerCommandMock: vi.fn(),
  setEntryMock: vi.fn(),
}));

const apiSender = {
  send: apiSenderSendMock,
} as unknown as ApiSenderType;

const statusBarRegistry: StatusBarRegistry = {
  setEntry: mocks.setEntryMock,
} as unknown as StatusBarRegistry;

const commandRegistry: CommandRegistry = {
  registerCommand: mocks.registerCommandMock,
} as unknown as CommandRegistry;

beforeEach(() => {
  vi.resetAllMocks();
});

test('create task with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask({ title: 'title' });
  expect(task.id).equal('task-1');
  expect(task.name).equal('title');
  expect(task.state).equal('running');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      state: task.state,
    }),
  );
});

test('create task without title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask();
  expect(task.id).equal('task-1');
  expect(task.name).equal('Task 1');
  expect(task.state).equal('running');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      state: task.state,
    }),
  );
});

test('create multiple tasks with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask({ title: 'title' });
  expect(task.id).equal('task-1');
  expect(task.name).equal('title');
  expect(task.state).equal('running');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      state: task.state,
    }),
  );

  const task2 = taskManager.createTask({ title: 'another title' });
  expect(task2.id).equal('task-2');
  expect(task2.name).equal('another title');
  expect(task2.state).equal('running');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task2.id,
      name: task2.name,
      state: task2.state,
    }),
  );

  const task3 = taskManager.createTask({ title: 'third title' });
  expect(task3.id).equal('task-3');
  expect(task3.name).equal('third title');
  expect(task3.state).equal('running');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task3.id,
      name: task3.name,
      state: task3.state,
    }),
  );
});

test('create notification task with body', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
    body: 'body',
  });
  expect(task.id).equal('notification-1');
  expect(task.name).equal('title');
  expect(task.body).equal('body');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      body: task.body,
      markdownActions: task.markdownActions,
    }),
  );
});

test('create task without body', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  expect(task.id).equal('notification-1');
  expect(task.name).equal('title');
  expect(task.body).equal('');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      body: task.body,
      markdownActions: task.markdownActions,
    }),
  );
});

test('create task with markdown actions', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
    markdownActions: 'action',
  });
  expect(task.id).equal('notification-1');
  expect(task.name).equal('title');
  expect(task.body).equal('');
  expect(task.markdownActions).equal('action');
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      body: task.body,
      markdownActions: task.markdownActions,
    }),
  );
});

test('create multiple stateful tasks with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  expect(task.id).equal('notification-1');
  expect(task.name).equal('title');
  expect(task.body).equal('');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task.id,
      name: task.name,
      body: task.body,
      markdownActions: task.markdownActions,
    }),
  );

  const task2 = taskManager.createNotificationTask({
    title: 'second title',
  });
  expect(task2.id).equal('notification-2');
  expect(task2.name).equal('second title');
  expect(task2.body).equal('');
  expect(task2.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task2.id,
      name: task2.name,
      body: task2.body,
      markdownActions: task2.markdownActions,
    }),
  );

  const task3 = taskManager.createNotificationTask({
    title: 'third title',
  });
  expect(task3.id).equal('notification-3');
  expect(task3.name).equal('third title');
  expect(task3.body).equal('');
  expect(task3.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-created',
    expect.objectContaining({
      id: task3.id,
      name: task3.name,
      body: task3.body,
      markdownActions: task3.markdownActions,
    }),
  );
});

test('clear tasks should clear task not in running state', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

  const task1 = taskManager.createTask({ title: 'Task 1' });
  task1.status = 'success';
  const task2 = taskManager.createTask({ title: 'Task 2' });
  task2.status = 'failure';
  const task3 = taskManager.createTask({ title: 'Task 3' });

  taskManager.clearTasks();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-removed',
    expect.objectContaining({
      id: task1.id,
      name: task1.name,
    }),
  );

  expect(apiSenderSendMock).toBeCalledWith(
    'task-removed',
    expect.objectContaining({
      id: task2.id,
      name: task2.name,
    }),
  );

  expect(apiSenderSendMock).not.toBeCalledWith(
    'task-removed',
    expect.objectContaining({
      id: task3.id,
    }),
  );
});

describe('execute', () => {
  test('execute should throw an error if the task does not exist', async () => {
    const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

    expect(() => {
      taskManager.execute('fake-id');
    }).toThrowError(`task with id fake-id does not exist.`);
  });

  test('execute should throw an error if the task has no action', async () => {
    const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

    const task = taskManager.createTask({ title: 'Task 1' });
    expect(() => {
      taskManager.execute(task.id);
    }).toThrowError(`task with id ${task.id} (${task.name}) does not have an action.`);
  });

  test('execute should execute the task execute function', async () => {
    const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

    const task = taskManager.createTask({ title: 'Task 1' });
    task.action = {
      name: 'Dummy action name',
      execute: vi.fn(),
    };
    taskManager.execute(task.id);

    expect(task.action.execute).toHaveBeenCalledOnce();
  });
});

test('updating a task should notify apiSender', () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

  const task = taskManager.createTask({ title: 'Task 1' });
  expect(apiSenderSendMock).toHaveBeenCalledWith('task-created', expect.anything());

  task.status = 'success';

  expect(apiSenderSendMock).toHaveBeenCalledWith(
    'task-updated',
    expect.objectContaining({
      state: 'completed',
      status: 'success',
      id: task.id,
    }),
  );
});

test('Ensure init setup command and statusbar registry', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  taskManager.init();

  expect(mocks.registerCommandMock).toHaveBeenCalledOnce();
  expect(mocks.setEntryMock).toHaveBeenCalledOnce();
});

test('Ensure statusbar registry', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);

  taskManager.createTask({ title: 'Dummy Task' });

  expect(statusBarRegistry.setEntry).toHaveBeenCalledWith(
    'tasks',
    false,
    0,
    undefined,
    'Tasks',
    'fa fa-bell',
    true,
    'show-task-manager',
    undefined,
    true,
  );
});

test('task dispose should send `task-removed` message', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
    body: 'body',
  });

  task.dispose();
  expect(apiSenderSendMock).toBeCalledWith(
    'task-removed',
    expect.objectContaining({
      id: task.id,
    }),
  );
});
