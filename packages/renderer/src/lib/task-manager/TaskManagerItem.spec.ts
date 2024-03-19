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

import type { StatefulTask } from '../../../../main/src/plugin/api/task';
import TaskManagerItem from './TaskManagerItem.svelte';

const started = new Date().getTime();
const IN_PROGRESS_TASK: StatefulTask = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  started,
  status: 'in-progress',
  action: {
    name: 'action',
    execute: () => {},
  },
};

const IN_PROGRESS_TASK_2: StatefulTask = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  started,
  status: 'in-progress',
};

test('Expect that the action button is visible', async () => {
  render(TaskManagerItem, {
    task: IN_PROGRESS_TASK,
  });
  // expect the tasks manager is not visible by default
  const actionBtn = screen.getByRole('button', { name: 'action button' });
  expect(actionBtn).toBeInTheDocument();
  expect(actionBtn.textContent).equal('action');
});

test('Expect that the action button is hidden', async () => {
  render(TaskManagerItem, {
    task: IN_PROGRESS_TASK_2,
  });
  // expect the tasks manager is not visible by default
  const actionBtn = screen.queryByRole('button', { name: 'action button' });
  expect(actionBtn).not.toBeInTheDocument();
});
