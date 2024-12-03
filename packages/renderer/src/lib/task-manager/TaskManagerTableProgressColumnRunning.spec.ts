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

import TaskManagerTableProgressColumnRunning from './TaskManagerTableProgressColumnRunning.svelte';

const inProgressTask: TaskInfoUI = {
  id: '1',
  name: 'In progress',
  state: 'running',
  status: 'in-progress',
  progress: 50,
} as unknown as TaskInfoUI;

test('Expect progress bar widget is used if task is still in progress', async () => {
  render(TaskManagerTableProgressColumnRunning, { task: inProgressTask });

  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toBeInTheDocument();

  // expect to see the progress
  const progressStatus = screen.getByText('50%');
  expect(progressStatus).toBeInTheDocument();

  // check width
  expect(progressBar).toHaveStyle({ width: '50%' });
});
