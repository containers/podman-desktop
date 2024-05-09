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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import SlideToggle from './SlideToggle.svelte';

function renderToggle(id: string, name: string, checked: boolean, disabled?: boolean): void {
  render(SlideToggle, {
    id: id,
    name: name,
    checked: checked,
    disabled: disabled,
  });
}

test('Expect basic styling', async () => {
  renderToggle('id', 'test', false);

  const input = screen.getByRole('checkbox');
  expect(input).toBeInTheDocument();

  const toggle = input.parentElement?.children[1];
  expect(toggle).not.toBeUndefined();
  expect(toggle).toBeInTheDocument();
  expect(toggle).toHaveClass('w-9');
  expect(toggle).toHaveClass('h-5');
  expect(toggle).toHaveClass('rounded-full');
  expect(toggle).toHaveClass('after:top-0.5');
  expect(toggle).toHaveClass('after:left-0.5');
  expect(toggle).toHaveClass('after:rounded-full');
  expect(toggle).toHaveClass('after:h-4');
  expect(toggle).toHaveClass('after:w-4');
  expect(toggle).toHaveClass('bg-[var(--pd-input-toggle-off-bg)]');
  expect(toggle).toHaveClass('hover:bg-[var(--pd-input-toggle-off-focused-bg)]');
  expect(toggle).toHaveClass('after:bg-[var(--pd-input-toggle-switch)]');
  expect(toggle).toHaveClass('hover:after:bg-[var(--pd-input-toggle-focused-switch)]');
  expect(toggle).toHaveClass('peer-checked:bg-[var(--pd-input-toggle-on-bg)]');
  expect(toggle).toHaveClass('hover:peer-checked:bg-[var(--pd-input-toggle-on-focused-bg)]');
});

test('Expect disabled styling', async () => {
  renderToggle('id', 'test', false, true);

  const input = screen.getByRole('checkbox');
  expect(input).toBeInTheDocument();

  const toggle = input.parentElement?.children[1];
  expect(toggle).not.toBeUndefined();
  expect(toggle).toBeInTheDocument();
  expect(toggle).toHaveClass('bg-[var(--pd-input-toggle-off-disabled-bg)]');
  expect(toggle).toHaveClass('peer-checked:bg-[var(--pd-input-toggle-on-disabled-bg)]');
  expect(toggle).toHaveClass('after:bg-[var(--pd-input-toggle-disabled-switch)]');
});
