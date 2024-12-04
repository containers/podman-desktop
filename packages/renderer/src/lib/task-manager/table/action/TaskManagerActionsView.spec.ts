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

import TaskManagerActionsView from './TaskManagerActionsView.svelte';

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      executeTask: vi.fn(),
      executeCommand: vi.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

const actionTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  action: 'dummy',
  cancellable: false,
} as unknown as TaskInfoUI;

const noActionTask: TaskInfoUI = {
  id: '1',
  name: 'In progress',
  state: 'running',
  status: 'in-progress',
} as unknown as TaskInfoUI;

test('Expect task with action being displayed', async () => {
  render(TaskManagerActionsView, { task: actionTask });
  const viewButton = screen.getByRole('button', { name: 'View action' });
  expect(viewButton).toBeInTheDocument();

  // click on the button
  await fireEvent.click(viewButton);

  // expect the window commands to be called
  expect(window.executeTask).toHaveBeenCalledWith(actionTask.id);
  expect(window.executeCommand).toHaveBeenCalledWith('show-task-manager');
});

test('Expect task without action not being displayed', async () => {
  render(TaskManagerActionsView, { task: noActionTask });
  const viewButton = screen.getByRole('button', { name: 'View action' });
  expect(viewButton).toBeInTheDocument();

  // expect the button is hidden
  expect(viewButton).toHaveClass('hidden');
});
