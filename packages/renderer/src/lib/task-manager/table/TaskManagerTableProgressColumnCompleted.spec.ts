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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerTableProgressColumnCompleted from './TaskManagerTableProgressColumnCompleted.svelte';

const completedSuccessTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'success',
  action: 'dummy',
  cancellable: false,
} as unknown as TaskInfoUI;

const canceledTask: TaskInfoUI = {
  id: '1',
  name: 'Cancelled Task 1',
  state: 'completed',
  status: 'canceled',
} as unknown as TaskInfoUI;

const failureSuccessTask: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'failure',
  error: 'this is a custom error',
  action: 'dummy',
  cancellable: false,
} as unknown as TaskInfoUI;
test('Expect display success for completed task with success', async () => {
  render(TaskManagerTableProgressColumnCompleted, { task: completedSuccessTask });

  const completedStatus = screen.getByRole('status', { name: 'completed status for task Completed Task 1' });
  expect(completedStatus).toBeInTheDocument();

  // expect to see the success status
  const successStatus = screen.getByText('success');
  expect(successStatus).toBeInTheDocument();
});

test('Expect display success for completed task with canceled', async () => {
  render(TaskManagerTableProgressColumnCompleted, { task: canceledTask });

  const completedStatus = screen.getByRole('status', { name: 'completed status for task Cancelled Task 1' });
  expect(completedStatus).toBeInTheDocument();

  // expect to see the canceled status
  const canceledStatus = screen.getByText('canceled');
  expect(canceledStatus).toBeInTheDocument();
});

test('Expect display error for completed task with failure', async () => {
  render(TaskManagerTableProgressColumnCompleted, { task: failureSuccessTask });

  const completedStatus = screen.getByRole('status', { name: 'completed status for task Completed Task 1' });
  expect(completedStatus).toBeInTheDocument();

  // expect to see the failure status
  const failureStatus = screen.getByText('failure');
  expect(failureStatus).toBeInTheDocument();

  // expect to see the error message
  const error = screen.getByText('(this is a custom error)');
  expect(error).toBeInTheDocument();
});
