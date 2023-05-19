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

import '@testing-library/jest-dom';
import { beforeAll, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TaskManager from './TaskManager.svelte';
import userEvent from '@testing-library/user-event';
import { tasksInfo } from '/@/stores/tasks';
import type { Task } from '../../../../main/src/plugin/api/task';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    receive: vi.fn(),
  };
  // reset store
  tasksInfo.set([]);
});

const started = new Date().getTime();
const IN_PROGRESS_TASK: Task = { id: '1', name: 'Running Task 1', state: 'running', started, status: 'in-progress' };
const SUCCEED_TASK: Task = { id: '1', name: 'Running Task 1', state: 'completed', started, status: 'success' };

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
  tasksInfo.set([SUCCEED_TASK]);
  render(TaskManager, { showTaskManager: true });

  // expect the task name is visible
  const task = screen.queryByText(SUCCEED_TASK.name);
  expect(task).toBeInTheDocument();

  // click on the button "Clear completed"
  const clearCompletedButton = screen.getByRole('button', { name: 'Clear completed' });
  expect(clearCompletedButton).toBeInTheDocument();
  await fireEvent.click(clearCompletedButton);

  // expect the task name is not visible
  const afterTask = screen.queryByText(SUCCEED_TASK.name);
  expect(afterTask).not.toBeInTheDocument();

  // button is also gone
  const afterClearCompletedButton = screen.queryByRole('button', { name: 'Clear completed' });
  expect(afterClearCompletedButton).not.toBeInTheDocument();
});

test('Expect click on faClose icon remove the task', async () => {
  tasksInfo.set([SUCCEED_TASK]);
  render(TaskManager, { showTaskManager: true });

  // expect the task name is visible
  const task = screen.queryByText(SUCCEED_TASK.name);
  expect(task).toBeInTheDocument();

  // click on the button with title "Clear notification"
  const clearCompletedButton = screen.getByRole('button', { name: 'Clear notification' });
  expect(clearCompletedButton).toBeInTheDocument();
  await fireEvent.click(clearCompletedButton);

  // expect the task name is not visible
  const afterTask = screen.queryByText(SUCCEED_TASK.name);
  expect(afterTask).not.toBeInTheDocument();
});
