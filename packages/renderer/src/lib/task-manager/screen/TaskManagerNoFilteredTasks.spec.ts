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

import TaskManagerNoFilteredTasks from './TaskManagerNoFilteredTasks.svelte';

test('Expect do not see the filter but see the no active tasks if search term is not set', async () => {
  render(TaskManagerNoFilteredTasks, { searchTerm: '' });
  // expect to see the text "No active tasks"
  const noActiveTasks = screen.getByText('No active tasks');
  expect(noActiveTasks).toBeInTheDocument();

  // expect the clear filter button is not there
  const clearFilter = screen.queryByRole('button', { name: 'Clear filter' });
  expect(clearFilter).not.toBeInTheDocument();
});

test('Expect see the filter but not the no active tasks if search term is present', async () => {
  render(TaskManagerNoFilteredTasks, { searchTerm: 'hello' });
  const noActiveTasks = screen.queryByText('No active tasks');
  expect(noActiveTasks).not.toBeInTheDocument();

  // expect the clear filter button is not there
  const clearFilter = screen.getByRole('button', { name: 'Clear filter' });
  expect(clearFilter).toBeInTheDocument();
});
