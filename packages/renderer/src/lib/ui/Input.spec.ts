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
  type: 'text' | 'search' | 'password' | 'clear',
  value: string,
  placeholder: string,
  readonly: boolean,
  onClick?: any,
): void {
  render(Input, { type: type, value: value, placeholder: placeholder, readonly: readonly, onClick: onClick });
}

test('Expect basic styling', async () => {
  const value = 'test';
  renderInput('text', value, value, false);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('px-1');
  expect(element).toHaveClass('outline-0');
  expect(element).toHaveClass('bg-charcoal-500');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('text-white');

  expect(element).toHaveClass('group-hover:bg-charcoal-900');
  expect(element).toHaveClass('group-focus-within:bg-charcoal-900');
  expect(element).toHaveClass('group-hover-placeholder:text-gray-900');

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('bg-charcoal-500');
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-charcoal-500');

  expect(element.parentElement).toHaveClass('hover:bg-charcoal-900');
  expect(element.parentElement).toHaveClass('hover:rounded-md');
  expect(element.parentElement).toHaveClass('hover:border-purple-400');
});

test('Expect basic readonly styling', async () => {
  const value = 'test';
  renderInput('text', value, value, true);

  const element = screen.getByPlaceholderText(value);
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('px-1');
  expect(element).toHaveClass('outline-0');
  expect(element).toHaveClass('bg-charcoal-500');
  expect(element).toHaveClass('text-sm');
  expect(element).toHaveClass('text-white');

  expect(element).not.toHaveClass('group-hover:bg-charcoal-900');
  expect(element).not.toHaveClass('group-focus-within:bg-charcoal-900');
  expect(element).not.toHaveClass('group-hover-placeholder:text-gray-900');

  expect(element.parentElement).toBeInTheDocument();
  expect(element.parentElement).toHaveClass('bg-charcoal-500');
  expect(element.parentElement).toHaveClass('border-[1px]');
  expect(element.parentElement).toHaveClass('border-charcoal-500');
  expect(element.parentElement).toHaveClass('border-b-charcoal-100');

  expect(element.parentElement).not.toHaveClass('hover:bg-charcoal-900');
  expect(element.parentElement).not.toHaveClass('hover:rounded-md');
  expect(element.parentElement).not.toHaveClass('hover:border-purple-400');
});

test('Expect search type', async () => {
  const value = 'test';
  renderInput('search', value, value, false);

  const element = screen.getByRole('img');
  expect(element).toBeInTheDocument();
});

test('Expect clear type', async () => {
  const value = 'test';
  renderInput('clear', value, value, false);

  const element = screen.getByRole('button');
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('aria-label', 'clear');
  expect(element).toHaveClass('cursor-pointer');
});

test('Expect password type', async () => {
  const value = 'test';
  renderInput('password', value, value, false);

  const element = screen.getByRole('button');
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('aria-label', 'show/hide');
  expect(element).toHaveClass('cursor-pointer');
});
