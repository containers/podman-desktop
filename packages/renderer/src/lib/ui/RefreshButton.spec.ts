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

import RefreshButton from './RefreshButton.svelte';

test('Expect basic styling', async () => {
  const onclick = vi.fn();
  const label = 'Refresh test';
  render(RefreshButton, { onclick, label });

  // get button
  const button = screen.getByRole('button', { name: label });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute('title', label);
  expect(button).toHaveClass('text-[var(--pd-button-primary-bg)]');
  expect(button).toHaveClass('hover:text-[var(--pd-button-primary-hover-bg)]');
});

test('Expect click', async () => {
  const onclick = vi.fn();
  const label = 'Refresh test';
  render(RefreshButton, { onclick, label });

  // get button
  const button = screen.getByRole('button');

  // click button
  await fireEvent.click(button);

  // check if onclick was called
  expect(onclick).toHaveBeenCalled();
});
