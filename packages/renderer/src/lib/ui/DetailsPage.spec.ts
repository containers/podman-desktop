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

import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DetailsPage from './DetailsPage.svelte';

test('Expect title is defined', async () => {
  const name = 'My Name';
  const title = 'My Dummy Title';
  render(DetailsPage, {
    name,
    title,
  });

  const titleElement = screen.getByRole('heading', { level: 1, name: title });
  expect(titleElement).toBeInTheDocument();
  expect(titleElement).toHaveTextContent(title);
});

test('Expect backlink is defined', async () => {
  const name = 'My Name';
  const title = 'My Dummy Title';
  const parentName = 'Parent';
  const parentURL = '/test';
  render(DetailsPage, {
    name,
    title,
    parentName,
    parentURL,
  });

  const nameElement = screen.getByLabelText('back');
  expect(nameElement).toBeInTheDocument();
  expect(nameElement).toHaveTextContent(parentName);
  expect(nameElement).toHaveAttribute('href', parentURL);
});

test('Expect close link is defined', async () => {
  const name = 'My Name';
  const title = 'My Dummy Title';
  const parentURL = '/test';
  render(DetailsPage, {
    name,
    title,
    parentURL,
  });

  const closeElement = screen.getByTitle('Close Details');
  expect(closeElement).toBeInTheDocument();
  expect(closeElement).toHaveAttribute('href', parentURL);
});
