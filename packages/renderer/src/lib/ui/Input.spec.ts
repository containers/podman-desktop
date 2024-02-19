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
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Input from './Input.svelte';

function renderInput(
  value: string,
  placeholder?: string,
  readonly?: boolean,
  disabled?: boolean,
  clearable?: boolean,
  error?: string,
  onClick?: any,
): void {
  render(Input, {
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    readonly: readonly,
    clearable: clearable,
    error: error,
    onClick: onClick,
  });
}

test('Expect basic styling', async () => {
  const value = 'test';
  renderInput(value, value);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('px-1');
  expect(element).toHaveClass('outline-0');
  expect(element).toHaveClass('bg-transparent');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('text-white');

  expect(element).toHaveClass('group-hover:bg-charcoal-900');
  expect(element).toHaveClass('group-focus-within:bg-charcoal-900');
  expect(element).toHaveClass('group-hover-placeholder:text-gray-900');

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('bg-transparent');
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-transparent');

  expect(element.parentElement).toHaveClass('hover:bg-charcoal-900');
  expect(element.parentElement).toHaveClass('hover:rounded-md');
  expect(element.parentElement).toHaveClass('hover:border-purple-400');
});

test('Expect basic readonly styling', async () => {
  const value = 'test';
  renderInput(value, value, true);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('px-1');
  expect(element).toHaveClass('outline-0');
  expect(element).toHaveClass('bg-transparent');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('text-white');

  expect(element).not.toHaveClass('group-hover:bg-charcoal-900');
  expect(element).not.toHaveClass('group-focus-within:bg-charcoal-900');
  expect(element).not.toHaveClass('group-hover-placeholder:text-gray-900');

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('bg-transparent');
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-transparent');
  expect(element.parentElement).toHaveClass('border-b-charcoal-100');

  expect(element.parentElement).not.toHaveClass('hover:bg-charcoal-900');
  expect(element.parentElement).not.toHaveClass('hover:rounded-md');
  expect(element.parentElement).not.toHaveClass('hover:border-purple-400');
});

test('Expect basic disabled styling', async () => {
  const value = 'test';
  renderInput(value, value, false, true);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('px-1');
  expect(element).toHaveClass('outline-0');
  expect(element).toHaveClass('bg-transparent');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('text-gray-700');

  expect(element).not.toHaveClass('group-hover:bg-charcoal-900');
  expect(element).not.toHaveClass('group-focus-within:bg-charcoal-900');
  expect(element).not.toHaveClass('group-hover-placeholder:text-gray-900');

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('bg-transparent');
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-transparent');
  expect(element.parentElement).toHaveClass('border-b-charcoal-100');

  expect(element.parentElement).not.toHaveClass('hover:bg-charcoal-900');
  expect(element.parentElement).not.toHaveClass('hover:rounded-md');
  expect(element.parentElement).not.toHaveClass('hover:border-purple-400');
});

test('Expect clear styling', async () => {
  const value = 'test';
  renderInput(value, value, false, false, true);

  const element = screen.getByRole('button');
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('aria-label', 'clear');
  expect(element).toHaveClass('cursor-pointer');
});

test('Expect basic error styling', async () => {
  const value = 'test';
  const error = 'Test error';
  renderInput(value, value, false, false, false, error);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-b-red-500');

  expect(element.parentElement).not.toHaveClass('hover:border-red-500');

  const err = screen.getByText(error);
  expect(err).toBeInTheDocument();
});
