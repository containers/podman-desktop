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

import TaskManagerBulkDeleteButton from './TaskManagerBulkDeleteButton.svelte';

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      getConfigurationValue: vi.fn(),
      showMessageBox: vi.fn(),
      clearTask: vi.fn(),
    },
    writable: true,
  });
});

// set 3 tasks
const selectedTask1: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  selected: true,
} as unknown as TaskInfoUI;
const selectedTask2: TaskInfoUI = {
  id: '2',
  name: 'Completed Task 2',
  state: 'completed',
  status: 'success',
  selected: true,
} as unknown as TaskInfoUI;
const unselectedTask: TaskInfoUI = {
  id: '3',
  name: 'Completed Task 3',
  state: 'completed',
  status: 'success',
  selected: false,
} as unknown as TaskInfoUI;

const title = 'bulk delete main title';
const bulkOperationTitle = 'bulk delete operation';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getConfigurationValue).mockResolvedValue({});
  tasksInfo.set([selectedTask1, selectedTask2, unselectedTask]);
});

test('Expect bulk button is bringing confirmation but not deleting anything', async () => {
  // return No for the confirmation
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 1 });

  render(TaskManagerBulkDeleteButton, { title, bulkOperationTitle });
  // expect the button is there
  const bulkButton = screen.getByRole('button', { name: title });
  expect(bulkButton).toBeInTheDocument();
  // click the button
  await fireEvent.click(bulkButton);

  expect(window.showMessageBox).toHaveBeenCalledWith({
    buttons: ['Yes', 'Cancel'],
    message: 'Are you sure you want to bulk delete operation?',
    title: 'Confirmation',
  });

  // expect we did not call the clearTask method
  expect(window.clearTask).not.toHaveBeenCalled();
});

test('Expect delete is called after confirming', async () => {
  // return Yes for the confirmation
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 0 });

  render(TaskManagerBulkDeleteButton, { title, bulkOperationTitle });
  // expect the button is there
  const bulkButton = screen.getByRole('button', { name: title });
  expect(bulkButton).toBeInTheDocument();
  // click the button
  await fireEvent.click(bulkButton);

  // expect we called the clearTask method for each selected task
  expect(window.clearTask).toHaveBeenCalledWith('1');
  expect(window.clearTask).toHaveBeenCalledWith('2');
  expect(window.clearTask).not.toHaveBeenCalledWith('3');
});
