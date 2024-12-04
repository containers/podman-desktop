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
import moment from 'moment';
import { expect, test } from 'vitest';

import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerTable from './TaskManagerTable.svelte';

// set 3 tasks
const task1: TaskInfoUI = {
  id: '1',
  name: 'Completed Task 1',
  state: 'completed',
  status: 'failure',
  started: moment().subtract(10, 'seconds'),
} as unknown as TaskInfoUI;
const task2: TaskInfoUI = {
  id: '2',
  name: 'Completed Task 2',
  state: 'completed',
  status: 'canceled',
  started: moment().subtract(20, 'seconds'),
} as unknown as TaskInfoUI;
const task3: TaskInfoUI = {
  id: '3',
  name: 'Completed Task 3',
  state: 'completed',
  status: 'success',
  started: moment().subtract(5, 'seconds'),
} as unknown as TaskInfoUI;

test('Expect tasks being displayed', async () => {
  const tasks: TaskInfoUI[] = [task1, task2, task3];
  render(TaskManagerTable, { tasks, selectedItemsNumber: 0 });

  // get all rows
  const rows = screen.getAllByRole('row');
  // check if all tasks are displayed
  expect(rows).toHaveLength(4);

  // check if all tasks are displayed
  expect(screen.getByText('Completed Task 1')).toBeInTheDocument();
  expect(screen.getByText('Completed Task 2')).toBeInTheDocument();
  expect(screen.getByText('Completed Task 3')).toBeInTheDocument();
});

test('Expect tasks being displayed by age order', async () => {
  const tasks: TaskInfoUI[] = [task1, task2, task3];
  render(TaskManagerTable, { tasks, selectedItemsNumber: 0 });

  // get all rows
  const rows = screen.getAllByRole('row');
  // check if all tasks are displayed
  expect(rows).toHaveLength(4);

  // check if all tasks are displayed in the right order (Age)
  // should be 3, 1, 2

  // 3 before 1 & 2
  expect(rows[3].compareDocumentPosition(rows[1])).toBeTruthy();
  expect(rows[3].compareDocumentPosition(rows[2])).toBeTruthy();

  // 1 before 2
  expect(rows[1].compareDocumentPosition(rows[2])).toBeTruthy();
});
