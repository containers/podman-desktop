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

import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerActionsDelete from './TaskManagerActionsDelete.svelte';

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      clearTask: vi.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

const completedTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  action: 'dummy',
  cancellable: false,
} as unknown as TaskInfoUI;

const inProgressTask: TaskInfoUI = {
  id: '1',
  name: 'In progress',
  state: 'running',
  status: 'in-progress',
} as unknown as TaskInfoUI;

test('Expect cancellable action being displayed if completed', async () => {
  render(TaskManagerActionsDelete, { task: completedTask });
  const deleteButton = screen.getByRole('button', { name: 'Archive/delete completed task' });
  expect(deleteButton).toBeInTheDocument();

  // click on the button
  await fireEvent.click(deleteButton);

  // expect the window.clearTask to be called
  expect(window.clearTask).toHaveBeenCalledWith(completedTask.id);
});

test('Expect cancellable action not being displayed if not cancellable', async () => {
  render(TaskManagerActionsDelete, { task: inProgressTask });
  const deleteButton = screen.getByRole('button', { name: 'Archive/delete completed task' });
  expect(deleteButton).toBeInTheDocument();
  // expect the button is hidden
  expect(deleteButton).toHaveClass('hidden');
});
