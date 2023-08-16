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

import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Button from './Button.svelte';

test('Check primary button styling', async () => {
  render(Button, { type: 'primary' });

  // check for one element of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-purple-600');
});

test('Check primary button is the default', async () => {
  render(Button);

  // check for one element of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-purple-600');
});

test('Check secondary button styling', async () => {
  render(Button, { type: 'secondary' });

  // check for one element of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-gray-200');
});

test('Check link button styling', async () => {
  render(Button, { type: 'link' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-none');
  expect(button).toHaveClass('hover:bg-white');
  expect(button).toHaveClass('hover:bg-opacity-10');
});
