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

import SearchInput from './SearchInput.svelte';

function renderInput(title: string, value: string, searchTerm?: string): void {
  render(SearchInput, { title: title, value: value, searchTerm: searchTerm });
}

test('Expect basic styling', async () => {
  const value = 'test';
  renderInput(value, value);

  const element = screen.getByRole('img');
  expect(element).toBeInTheDocument();
});

test('Expect placeholder', async () => {
  renderInput('a-title', 'a value');

  const element = screen.getByRole('textbox');
  expect(element).toHaveProperty('placeholder', 'Search a-title...');
});

test('Expect id and name', async () => {
  renderInput('a-title', 'a value');

  const element = screen.getByRole('textbox');
  expect(element).toHaveProperty('id', 'search-a-title');
  expect(element).toHaveProperty('name', 'search-a-title');
});

test('Expect aria-label', async () => {
  renderInput('a-title', 'a value');

  screen.getByLabelText('search a-title');
});

test('Expect value', async () => {
  renderInput('a-title', 'a value', 'a search term');

  const element = screen.getByRole('textbox');
  expect(element).toHaveValue('a search term');
});
