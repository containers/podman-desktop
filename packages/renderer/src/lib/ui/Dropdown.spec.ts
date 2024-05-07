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

import Dropdown from './Dropdown.svelte';

function renderDropdown(value: string, readonly?: boolean, disabled?: boolean, error?: boolean): void {
  render(Dropdown, {
    value: value,
    disabled: disabled,
    readonly: readonly,
    error: error,
  });
}

test('Expect basic styling', async () => {
  const value = 'test';
  renderDropdown(value);

  const element = screen.getByRole('combobox');
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('p-1');
  expect(element).toHaveClass('outline-none');
  expect(element).toHaveClass('bg-[var(--pd-dropdown-bg)]');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('border-transparent');
  expect(element).toHaveClass('text-[color:var(--pd-dropdown-focused-text)]');
});

test('Expect basic readonly styling', async () => {
  const value = 'test';
  renderDropdown(value, true);

  const element = screen.getByRole('combobox');
  expect(element).toBeInTheDocument();

  expect(element).toHaveClass('p-1');
  expect(element).toHaveClass('outline-none');
  expect(element).toHaveClass('bg-[var(--pd-dropdown-bg)]');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('border-transparent');
  expect(element).toHaveClass('border-b-[var(--pd-dropdown-stroke-readonly)]');
  expect(element).toHaveClass('text-[color:var(--pd-dropdown-disabled-text)]');
});

test('Expect basic disabled styling', async () => {
  const value = 'test';
  renderDropdown(value, false, true);

  const element = screen.getByRole('combobox');
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('p-1');
  expect(element).toHaveClass('outline-none');
  expect(element).toHaveClass('bg-[var(--pd-dropdown-bg)]');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('border-transparent');
  expect(element).toHaveClass('border-b-[var(--pd-dropdown-stroke-readonly)]');
  expect(element).toHaveClass('text-[color:var(--pd-dropdown-disabled-text)]');
});

test('Expect basic error styling', async () => {
  const value = 'test';
  renderDropdown(value, false, false, true);

  const element = screen.getByRole('combobox');
  expect(element).toBeInTheDocument();

  expect(element).toHaveClass('p-1');
  expect(element).toHaveClass('outline-none');
  expect(element).toHaveClass('bg-[var(--pd-dropdown-bg)]');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('border-transparent');
  expect(element).toHaveClass('border-b-[var(--pd-dropdown-stroke-error)]');
  expect(element).toHaveClass('hover:border-b-[var(--pd-dropdown-stroke-error)]');
});
