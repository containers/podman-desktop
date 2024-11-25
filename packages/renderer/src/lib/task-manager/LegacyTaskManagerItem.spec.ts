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
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TaskInfo } from '/@api/taskInfo';

import LegacyTaskManagerItem from './LegacyTaskManagerItem.svelte';

const started = new Date().getTime();
const IN_PROGRESS_TASK: TaskInfo = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  status: 'in-progress',
  started,
  action: 'Task action',
  cancellable: false,
};

const IN_PROGRESS_TASK_2: TaskInfo = {
  id: '1',
  name: 'Running Task 1',
  state: 'running',
  status: 'in-progress',
  started,
  cancellable: false,
};

const CANCELLABLE_TASK: TaskInfo = {
  id: '1',
  name: 'Cancellable Task 1',
  state: 'running',
  status: 'in-progress',
  started,
  cancellable: true,
  cancellationTokenSourceId: 1,
};

const CANCELED_TASK: TaskInfo = {
  id: '1',
  name: 'Canceled Task 1',
  state: 'completed',
  status: 'canceled',
  started,
  cancellable: true,
  cancellationTokenSourceId: 1,
};

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      cancelToken: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect that the action button is visible', async () => {
  render(LegacyTaskManagerItem, {
    task: IN_PROGRESS_TASK,
  });
  // expect the tasks manager is not visible by default
  const actionBtn = screen.getByRole('button', { name: 'action button' });
  expect(actionBtn).toBeInTheDocument();
  expect(actionBtn.textContent).equal('Task action');
});

test('Expect that the action button call window.executeTask', async () => {
  const executeTaskMock = vi.fn();
  (window as { executeTask: (taskId: string) => void }).executeTask = executeTaskMock;

  render(LegacyTaskManagerItem, {
    task: IN_PROGRESS_TASK,
  });
  const actionBtn = screen.getByRole('button', { name: 'action button' });
  await fireEvent.click(actionBtn);

  expect(executeTaskMock).toHaveBeenCalledWith(IN_PROGRESS_TASK.id);
});

test('Expect that the action button is hidden', async () => {
  render(LegacyTaskManagerItem, {
    task: IN_PROGRESS_TASK_2,
  });
  // expect the tasks manager is not visible by default
  const actionBtn = screen.queryByRole('button', { name: 'action button' });
  expect(actionBtn).not.toBeInTheDocument();
});

test('Expect that the canceled state is displayed', async () => {
  render(LegacyTaskManagerItem, {
    task: CANCELED_TASK,
  });
  // expect the canceled task icon is displayed and color is the one specified
  const canceledTaskIcon = screen.getByRole('img', { name: 'canceled icon of task Canceled Task 1' });
  expect(canceledTaskIcon).toBeInTheDocument();
  expect(canceledTaskIcon.parentElement?.classList.contains('text-[var(--pd-status-exited)]')).toBeTruthy();
});

describe('Cancel button', () => {
  const cancelPrefixButton = 'Cancel task';

  test('Expect that cancel button is visible for cancellable task', async () => {
    const task = CANCELLABLE_TASK;
    render(LegacyTaskManagerItem, {
      task,
    });
    // expect the button to cancel a task is there
    const canceledTaskButton = screen.getByRole('button', { name: `${cancelPrefixButton} ${task.name}` });
    expect(canceledTaskButton).toBeInTheDocument();

    // click on it
    await fireEvent.click(canceledTaskButton);

    // expect the cancelToken method has been called
    expect(vi.mocked(window.cancelToken)).toHaveBeenCalledWith(CANCELLABLE_TASK.cancellationTokenSourceId);
  });

  test('Expect that cancel button is not visible if not a cancellable task', async () => {
    const task = IN_PROGRESS_TASK;
    render(LegacyTaskManagerItem, {
      task: IN_PROGRESS_TASK,
    });
    // expect the button to cancel a task is not there
    const canceledTaskButton = screen.queryByRole('button', { name: `${cancelPrefixButton} ${task.name}` });
    expect(canceledTaskButton).not.toBeInTheDocument();
  });
});
