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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Button from './Button.svelte';

test('Check primary button styling', async () => {
  render(Button, { type: 'primary' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-purple-600');
  expect(button).toHaveClass('border-none');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-[13px]');
  expect(button).toHaveClass('text-white');
});

test('Check disabled/in-progress primary button styling', async () => {
  render(Button, { type: 'primary', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-charcoal-50');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-[13px]');
});

test('Check primary button is the default', async () => {
  render(Button);

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-purple-600');
  expect(button).toHaveClass('text-white');
});

test('Check secondary button styling', async () => {
  render(Button, { type: 'secondary' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-gray-200');
  expect(button).toHaveClass('border-[1px]');
  expect(button).toHaveClass('py-[4px]');
  expect(button).toHaveClass('text-[13px]');
  expect(button).toHaveClass('text-white');
});

test('Check danger button styling', async () => {
  render(Button, { type: 'danger' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-red-600');
  expect(button).toHaveClass('border-2');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[3px]');
  expect(button).toHaveClass('bg-charcoal-700');
  expect(button).toHaveClass('text-[13px]');
  expect(button).toHaveClass('text-white');
});

test('Check disabled/in-progress secondary button styling', async () => {
  render(Button, { type: 'secondary', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-charcoal-50');
  expect(button).toHaveClass('border-[1px]');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[4px]');
  expect(button).toHaveClass('bg-charcoal-50');
  expect(button).toHaveClass('text-[13px]');
});

test('Check link button styling', async () => {
  render(Button, { type: 'link' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-none');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('hover:bg-white');
  expect(button).toHaveClass('hover:bg-opacity-10');
  expect(button).toHaveClass('text-[13px]');
  expect(button).toHaveClass('text-purple-400');
});

test('Check disabled/in-progress link button styling', async () => {
  render(Button, { type: 'link', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-charcoal-50');
  expect(button).toHaveClass('text-[13px]');
});

test('Check tab button styling', async () => {
  render(Button, { type: 'tab' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-b-[3px]');
  expect(button).toHaveClass('border-charcoal-700');
  expect(button).toHaveClass('pb-1');
  expect(button).toHaveClass('text-gray-600');
  expect(button).toHaveClass('hover:cursor-pointer');
  expect(button).not.toHaveClass('text-[13px]');
});

test('Check selected tab button styling', async () => {
  render(Button, { type: 'tab', selected: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('text-white');
  expect(button).toHaveClass('border-purple-500');
});

test('Check hidden button', async () => {
  render(Button, { hidden: true });

  // check that the button is in fact hidden
  const button = screen.getByRole('button', { hidden: true });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute('hidden');
  expect(button).not.toBeVisible();
});
