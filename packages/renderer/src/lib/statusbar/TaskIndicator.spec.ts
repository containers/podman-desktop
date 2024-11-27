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

import { fireEvent, render } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import TaskIndicator from '/@/lib/statusbar/TaskIndicator.svelte';
import { tasksInfo } from '/@/stores/tasks';

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      events: {
        send: vi.fn(),
      },
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
  // reset store
  tasksInfo.set([]);
});

test('should not be visible when no running tasks', async () => {
  const { queryByRole } = render(TaskIndicator);
  const status = queryByRole('status');
  expect(status).toBeNull();
});

test('clicking on task should send task manager toggle event', async () => {
  tasksInfo.set([
    {
      name: 'Dummy Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'dummy-task',
      cancellable: false,
    },
  ]);

  const { getByRole } = render(TaskIndicator);
  const button = getByRole('button', { name: 'Toggle Task Manager' });
  expect(button).toBeDefined();

  await fireEvent.click(button);

  await vi.waitFor(() => {
    expect(window.events.send).toHaveBeenCalledWith('toggle-task-manager', '');
  });
});

test('one task running should display it', async () => {
  tasksInfo.set([
    {
      name: 'Dummy Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'dummy-task',
      cancellable: false,
    },
  ]);

  const { getByRole } = render(TaskIndicator);
  const status = getByRole('status');
  expect(status).toBeDefined();
  expect(status.textContent).toBe('Dummy Task');
});

test('multiple tasks running should display them', async () => {
  tasksInfo.set([
    {
      name: 'Foo Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'foo-task',
      cancellable: false,
    },
    {
      name: 'Bar Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'foo-task',
      cancellable: false,
    },
  ]);

  const { getByRole } = render(TaskIndicator);
  const status = getByRole('status');
  expect(status).toBeDefined();
  expect(status.textContent).toBe('2 tasks running');
});

test('task with defined progress value should display it', async () => {
  tasksInfo.set([
    {
      name: 'Dummy Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'dummy-task',
      progress: 50,
      cancellable: false,
    },
  ]);

  const { getByText } = render(TaskIndicator);
  const span = getByText('50%');
  expect(span).toBeDefined();
});

test('task with undefined progress value should show indeterminate progress', async () => {
  tasksInfo.set([
    {
      name: 'Dummy Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'dummy-task',
      progress: undefined, // indeterminate
      cancellable: false,
    },
  ]);

  const { getByRole } = render(TaskIndicator);

  // expect the progress bar to have the indeterminate class
  const progressBar = getByRole('progressbar');
  expect(progressBar).toHaveClass('progress-bar-indeterminate');
});
