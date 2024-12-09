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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { type TaskInfoUI, tasksInfo } from '/@/stores/tasks';

import TaskManager from './TaskManager.svelte';

const callbacks = new Map<string, () => void>();
const eventEmitter = {
  receive: (message: string, callback: () => void): void => {
    callbacks.set(message, callback);
  },
};

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

beforeAll(() => {
  Object.defineProperty(window, 'events', {
    value: {
      receive: eventEmitter.receive,
    },
  });
});

beforeEach(() => {
  vi.resetAllMocks();
  tasksInfo.set([]);
  callbacks.clear();
});

test('Expect nothing is displayed by default', async () => {
  render(TaskManager);
  await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Tasks' })).not.toBeInTheDocument());
});

test('Expect task manager is displayed when sending event', async () => {
  render(TaskManager);

  // ask to show it
  const callback = callbacks.get('toggle-task-manager');
  expect(callback).toBeDefined();
  // call it
  callback?.();

  await vi.waitFor(() => expect(screen.getByRole('region', { name: 'Tasks' })).toBeInTheDocument());

  // ask to hide closing the close button
  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();
  await fireEvent.click(closeButton);
  // should be closed
  await vi.waitFor(() => expect(screen.queryByRole('region', { name: 'Tasks' })).not.toBeInTheDocument());
});

test('expect to see tasks being displayed', async () => {
  tasksInfo.set([task1, task2, task3]);
  render(TaskManager);

  // ask to show it
  const callback = callbacks.get('toggle-task-manager');
  await vi.waitFor(() => expect(callback).toBeDefined());
  // call it
  callback?.();

  // wait for the task manager to be displayed
  await vi.waitFor(() => expect(screen.getByRole('region', { name: 'Tasks' })).toBeInTheDocument());

  // get a row
  const row = screen.getByRole('row', { name: 'Completed Task 1' });
  await vi.waitFor(() => expect(row).toBeInTheDocument());
});
