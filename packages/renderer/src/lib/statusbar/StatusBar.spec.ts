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

import { render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import StatusBar from '/@/lib/statusbar/StatusBar.svelte';
import { statusBarEntries } from '/@/stores/statusbar';
import { tasksInfo } from '/@/stores/tasks';
import { ExperimentalTasksSettings } from '/@api/tasks-preferences';

beforeEach(() => {
  (window.getConfigurationValue as unknown) = vi.fn();

  // reset stores
  statusBarEntries.set([]);
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
});

test('onMount should call getConfigurationValue', () => {
  render(StatusBar);

  expect(window.getConfigurationValue).toHaveBeenCalledWith(
    `${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.StatusBar}`,
  );
});

test('tasks should be visible when getConfigurationValue is true', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  const { getByRole } = render(StatusBar);

  await vi.waitFor(() => {
    const status = getByRole('status');
    expect(status).toBeDefined();
    expect(status.textContent).toBe('Dummy Task');
  });
});

test('tasks should not be visible when getConfigurationValue is false', () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  const { queryByRole } = render(StatusBar);
  const status = queryByRole('status');
  expect(status).toBeNull();
});
