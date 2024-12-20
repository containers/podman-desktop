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

import { createEvent, fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import Dropdown from './Dropdown.svelte';
import DropdownTest from './DropdownTest.svelte';

test('a button is created', async () => {
  render(Dropdown);

  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();
});

test('initial value is visible', async () => {
  render(Dropdown, {
    value: 'a value',
  });

  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();
  expect(input).toHaveTextContent('a value');
});

test('opening dropdown does not submit forms (prevents default button action)', async () => {
  render(Dropdown);

  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();

  const event = createEvent.click(input);
  event.preventDefault = vi.fn();
  await fireEvent(input, event);
  expect(event.preventDefault).toHaveBeenCalled();
});

test('disabling changes state and styling', async () => {
  render(Dropdown, {
    disabled: true,
  });

  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
  expect(input).toHaveClass('text-[color:var(--pd-input-field-disabled-text)]');
  expect(input.parentElement).toHaveClass('border-b-[var(--pd-input-field-stroke-readonly)]');
});

test('initial focus is not set by default', async () => {
  render(Dropdown);

  const input = screen.getByRole('button');
  expect(input).not.toHaveFocus();
});

test('value sets the initial option', async () => {
  render(Dropdown, {
    value: 'b',
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
  });

  const input = screen.getByRole('button');
  expect(input).not.toHaveFocus();
  expect(input).toHaveTextContent('B');
});

test('first option is picked by default', async () => {
  render(Dropdown, { options: [{ label: 'A', value: 'a' }] });

  const input = screen.getByRole('button');
  expect(input).not.toHaveFocus();
  expect(input).toHaveTextContent('A');
});

test('should be able to navigate with keys', async () => {
  render(DropdownTest);
  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();
  expect(input).toHaveTextContent('initial value');
  input.focus();

  let item = screen.queryByRole('button', { name: 'A' });
  expect(item).toBeNull();

  // open dropdown (selects A)
  await userEvent.keyboard('[ArrowDown]');
  item = screen.queryByRole('button', { name: 'A' });
  expect(item).not.toBeNull();

  // confirm A is highlighted
  expect(item).toHaveClass('bg-[var(--pd-dropdown-item-hover-bg)]');
  expect(item).toHaveClass('text-[var(--pd-dropdown-item-hover-text)]');

  // and B is not
  item = screen.queryByRole('button', { name: 'B' });
  expect(item).not.toBeNull();

  // confirm A is highlighted
  expect(item).not.toHaveClass('bg-[var(--pd-dropdown-item-hover-bg)]');
  expect(item).not.toHaveClass('text-[var(--pd-dropdown-item-hover-text)]');

  // select A, closes dropdown and updates selection
  await userEvent.keyboard('[Enter]');

  item = screen.queryByRole('button', { name: 'B' });
  expect(item).toBeNull();
  expect(input).toHaveTextContent('A');

  // reopen and page down to select the last option (C)
  await userEvent.keyboard('[ArrowDown]');
  await userEvent.keyboard('[PageDown]');

  // confirm C is now highlighted
  item = screen.queryByRole('button', { name: 'C' });
  expect(item).not.toBeNull();
  expect(item).toHaveClass('bg-[var(--pd-dropdown-item-hover-bg)]');
  expect(item).toHaveClass('text-[var(--pd-dropdown-item-hover-text)]');

  await userEvent.keyboard('[Enter]');

  // dropdown is closed and we now have value C
  item = screen.queryByRole('button', { name: 'B' });
  expect(item).toBeNull();
  expect(input).toHaveTextContent('C');
});

test('value of hidden select component is updated based on Dropdown value', async () => {
  render(Dropdown, {
    value: 'b',
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ],
    name: 'testDropdown',
  });

  const input = screen.getByRole('button');
  expect(input).toBeInTheDocument();
  input.focus();

  let selectItem = screen.getByRole('combobox');
  expect(selectItem).toBeInTheDocument();
  expect(selectItem).toHaveValue('b');

  // open dropdown (selects A)
  await userEvent.keyboard('[ArrowDown]');
  const item = screen.queryByRole('button', { name: 'A' });
  expect(item).not.toBeNull();

  // select A, closes dropdown and updates selection
  await userEvent.keyboard('[Enter]');

  selectItem = screen.getByRole('combobox');
  expect(selectItem).toBeInTheDocument();
  expect(selectItem).toHaveValue('a');
});
