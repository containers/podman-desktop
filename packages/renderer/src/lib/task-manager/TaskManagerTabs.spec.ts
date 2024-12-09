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
import { expect, test, vi } from 'vitest';

import { TASK_STATUSES } from '/@api/taskInfo';

import TaskManagerTabs from './TaskManagerTabs.svelte';

test('Expect buttons for each statuses', async () => {
  render(TaskManagerTabs, { searchTerm: '' });

  const allTasks = screen.getByRole('button', { name: 'All' });
  expect(allTasks).toBeInTheDocument();

  // and now for each status
  for (const status of TASK_STATUSES) {
    const task = screen.getByRole('button', { name: status });
    expect(task).toBeInTheDocument();
  }
});

test('expect click on all button remove any is:status', async () => {
  const searchTermCurrent = 'my current search is:in-progress';
  const onUpdateMock = vi.fn();
  render(TaskManagerTabs, { searchTerm: searchTermCurrent, onUpdate: onUpdateMock });

  const allTasks = screen.getByRole('button', { name: 'All' });
  expect(allTasks).toBeInTheDocument();

  // click on it
  await fireEvent.click(allTasks);

  // check that the search term is now without any is: status
  expect(onUpdateMock).toBeCalledWith('my current search');
});

test('expect click on a status add the is:status', async () => {
  const searchTermCurrent = 'my current search';
  const onUpdateMock = vi.fn();
  render(TaskManagerTabs, { searchTerm: searchTermCurrent, onUpdate: onUpdateMock });

  const inProgressButton = screen.getByRole('button', { name: 'in-progress' });
  expect(inProgressButton).toBeInTheDocument();

  // click on it
  await fireEvent.click(inProgressButton);

  // check that the search term is now updated with the is: status
  expect(onUpdateMock).toBeCalledWith(`is:in-progress ${searchTermCurrent}`);
});

test('Expect button is correctly selected from its status', async () => {
  render(TaskManagerTabs, { searchTerm: 'this is a filter for is:in-progress' });

  const selectedClass = 'text-[var(--pd-button-tab-text-selected)]';
  const inProgressButton = screen.getByRole('button', { name: 'in-progress' });
  expect(inProgressButton).toBeInTheDocument();
  expect(inProgressButton).toHaveClass(selectedClass);

  // all the other buttons should not be selected
  const allTasks = screen.getByRole('button', { name: 'All' });
  expect(allTasks).toBeInTheDocument();
  expect(allTasks).not.toHaveClass(selectedClass);

  for (const status of TASK_STATUSES) {
    if (status === 'in-progress') {
      continue;
    }
    const task = screen.getByRole('button', { name: status });
    expect(task).toBeInTheDocument();
    expect(task).not.toHaveClass(selectedClass);
  }

  // click on failure
  const failureButton = screen.getByRole('button', { name: 'failure' });
  expect(failureButton).toBeInTheDocument();
  await fireEvent.click(failureButton);

  // check that the selected button is updated
  expect(failureButton).toHaveClass(selectedClass);
  expect(inProgressButton).not.toHaveClass(selectedClass);
});
