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

import { expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';

import type { ApiSenderType } from './api.js';
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

test('create stateful task with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask('title');
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.state).equal('running');
  expect(task.status).equal('in-progress');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);
});

test('create stateful task without title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask(undefined);
  expect(task.id).equal('main-1');
  expect(task.name).equal('Task 1');
  expect(task.state).equal('running');
  expect(task.status).equal('in-progress');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);
});

test('create multiple stateful tasks with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask('title');
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.state).equal('running');
  expect(task.status).equal('in-progress');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);

  const task2 = taskManager.createTask('another title');
  expect(task2.id).equal('main-2');
  expect(task2.name).equal('another title');
  expect(task2.state).equal('running');
  expect(task2.status).equal('in-progress');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task2);

  const task3 = taskManager.createTask('third title');
  expect(task3.id).equal('main-3');
  expect(task3.name).equal('third title');
  expect(task3.state).equal('running');
  expect(task3.status).equal('in-progress');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task3);
});

test('create notification task with body', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
    body: 'body',
  });
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.description).equal('body');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);
});

test('create stateful task without body', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.description).equal('');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);
});

test('create stateful task with markdown actions', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
    markdownActions: 'action',
  });
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.description).equal('');
  expect(task.markdownActions).equal('action');
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);
});

test('create multiple stateful tasks with title', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  expect(task.id).equal('main-1');
  expect(task.name).equal('title');
  expect(task.description).equal('');
  expect(task.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith('task-created', task);

  const task2 = taskManager.createNotificationTask({
    title: 'second title',
  });
  expect(task2.id).equal('main-2');
  expect(task2.name).equal('second title');
  expect(task2.description).equal('');
  expect(task2.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith('task-created', task2);

  const task3 = taskManager.createNotificationTask({
    title: 'third title',
  });
  expect(task3.id).equal('main-3');
  expect(task3.name).equal('third title');
  expect(task3.description).equal('');
  expect(task3.markdownActions).toBeUndefined();
  expect(apiSenderSendMock).toBeCalledWith('task-created', task3);
});

test('return true if statefulTask', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask('title');
  const result = taskManager.isStatefulTask(task);
  expect(result).toBeTruthy();
});

test('return false if it is not a statefulTask', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  const result = taskManager.isStatefulTask(task);
  expect(result).toBeFalsy();
});

test('return true if notificationTask', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createNotificationTask({
    title: 'title',
  });
  const result = taskManager.isNotificationTask(task);
  expect(result).toBeTruthy();
});

test('return false if it is not a notificationTask', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  const task = taskManager.createTask('title');
  const result = taskManager.isNotificationTask(task);
  expect(result).toBeFalsy();
});

test('Ensure init setup command and statusbar registry', async () => {
  const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
  taskManager.init();

  expect(mocks.registerCommandMock).toHaveBeenCalledOnce();
  expect(mocks.setEntryMock).toHaveBeenCalledOnce();
});
