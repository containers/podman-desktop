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

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import { tasksInfo } from '/@/stores/tasks';
import type { NotificationTaskInfo, TaskInfo } from '/@api/taskInfo';

import TaskManager from './TaskManager.svelte';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    receive: vi.fn(),
  };
  // reset store
  tasksInfo.set([]);
});

const started = new Date().getTime();
const IN_PROGRESS_TASK: TaskInfo = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  status: 'in-progress',
  started,
};
const SUCCEED_TASK: TaskInfo = { id: '1', name: 'Running Task 1', state: 'completed', status: 'success', started };
const NOTIFICATION_TASK: NotificationTaskInfo = {
  id: '1',
  name: 'Notification Task 1',
  body: ' description',
  status: 'success',
  state: 'completed',
  started,
};

test('Expect that the tasks manager is hidden by default', async () => {
  render(TaskManager, {});
  // expect the tasks manager is not visible by default
  const tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).not.toBeInTheDocument();
});

test('Expect that the tasks manager is visible by property', async () => {
  render(TaskManager, { showTaskManager: true });

  // expect the tasks manager is visible
  const tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).toBeInTheDocument();
});

test('Expect that the tasks manager is hidden if user press the ESC key', async () => {
  render(TaskManager, { showTaskManager: true });

  // expect the tasks manager is visible
  let tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).toBeInTheDocument();

  // now, press the ESC key
  await userEvent.keyboard('{Escape}');

  // expect the tasks manager has been hidden
  tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).not.toBeInTheDocument();
});

test('Expect that the tasks manager is hidden if user click on the hide button', async () => {
  render(TaskManager, { showTaskManager: true });

  // expect the tasks manager is visible
  let tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).toBeInTheDocument();

  // now, click on the Hide (Escape) button
  const hideButton = screen.getByRole('button', { name: 'Hide (Escape)' });
  await fireEvent.click(hideButton);

  // expect the tasks manager has been hidden
  tasksManager = screen.queryByTitle('Tasks manager');
  expect(tasksManager).not.toBeInTheDocument();
});

test('Expect no tasks', async () => {
  render(TaskManager, { showTaskManager: true });

  // expect the "You have no tasks" is visible
  const noTaskField = screen.queryByText('You have no tasks.');
  expect(noTaskField).toBeInTheDocument();
});

test('Expect tasks', async () => {
  tasksInfo.set([IN_PROGRESS_TASK]);
  render(TaskManager, { showTaskManager: true });

  // expect the "You Have no Tasks" is not visible
  const noTaskField = screen.queryByText('You have no tasks.');
  expect(noTaskField).not.toBeInTheDocument();

  // expect the task is visible
  const task = screen.queryByText('Running Task 1');
  expect(task).toBeInTheDocument();
});

test('Expect delete completed tasks remove tasks', async () => {
  const clearTasksMock = vi.fn();
  (window as { clearTasks: () => void }).clearTasks = clearTasksMock;

  tasksInfo.set([SUCCEED_TASK]);
  render(TaskManager, { showTaskManager: true });

  // expect the task name is visible
  const task = screen.queryByText(SUCCEED_TASK.name);
  expect(task).toBeInTheDocument();

  // click on the button "Clear notifications"
  const clearNotificationsButton = screen.getByRole('button', { name: 'Clear' });
  expect(clearNotificationsButton).toBeInTheDocument();
  await fireEvent.click(clearNotificationsButton);

  // expect window/clearTasks to have been called
  expect(clearTasksMock).toHaveBeenCalled();
});

test('Expect to have tasks when only having notification task', async () => {
  tasksInfo.set([NOTIFICATION_TASK]);
  render(TaskManager, { showTaskManager: true });

  // expect the "You Have no Tasks" is not visible
  const noTaskField = screen.queryByText('You have no tasks.');
  expect(noTaskField).not.toBeInTheDocument();

  // expect the task is visible
  const task = screen.queryByText(NOTIFICATION_TASK.name);
  expect(task).toBeInTheDocument();
});
