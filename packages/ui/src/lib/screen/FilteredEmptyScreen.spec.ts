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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import FilteredEmptyScreen from './FilteredEmptyScreen.svelte';

test('Expect basic styling', async () => {
  render(FilteredEmptyScreen, { icon: '', kind: 'object', searchTerm: 'test' });
  // eslint-disable-next-line quotes
  const title = screen.getByText("No object matching 'test' found");
  expect(title).toBeInTheDocument();
  expect(title).toHaveClass('text-xl');
});

test('Expect long search term to not display', async () => {
  render(FilteredEmptyScreen, {
    icon: '',
    kind: 'object',
    searchTerm: 'a really long search term that will not fit in the UI',
  });
  const title = screen.getByText('No object matching filter found');
  expect(title).toBeInTheDocument();
  expect(title).toHaveClass('text-xl');
});

test('Expect button to fire event and clear search term', async () => {
  const resetMock = vi.fn();
  const config = { icon: '', kind: 'object', searchTerm: 'test', onResetFilter: resetMock };

  render(FilteredEmptyScreen, config);

  const button = screen.getByRole('button', { name: 'Clear filter' });
  expect(button).toBeInTheDocument();

  await fireEvent.click(button);

  // confirm search term has changed
  expect(resetMock).toHaveBeenCalledOnce();
  // eslint-disable-next-line quotes
  const title = screen.getByText("No object matching '' found");
  expect(title).toBeInTheDocument();
});
