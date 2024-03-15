/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';

test('Expect that the progress bar is indeterminate', async () => {
  render(ProgressBar, { progress: undefined });

  // expect the progress bar to have the indeterminate class
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toHaveClass('progress-bar-indeterminate');
});

test('Expect that the progress bar is not indeterminate', async () => {
  render(ProgressBar, { progress: 5 });

  // expect the progress bar to not have the indeterminate class
  const progressBar = screen.getByRole('progressbar');
  expect(progressBar.classList.contains('progress-bar-indeterminate')).toBe(false);
});
