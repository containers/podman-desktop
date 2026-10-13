/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import { assert, expect, test, vi } from 'vitest';

import CatalogExtensionFilters from './CatalogExtensionFilters.svelte';

interface RenderFiltersOptions {
  searchTerm?: string;
  categories?: string[];
  onchange?: (searchTerm: string) => void;
}

function renderFilters({
  searchTerm = '',
  categories = [],
  onchange = (): void => {},
}: RenderFiltersOptions = {}): ReturnType<typeof render> {
  return render(CatalogExtensionFilters, {
    searchTerm,
    categories,
    onchange,
  });
}

async function selectDropdownOption(label: string, option: string): Promise<void> {
  const dropdown = screen.getByLabelText(label);
  const trigger = dropdown.querySelector('button');
  assert(trigger);
  await fireEvent.click(trigger);
  await fireEvent.click(screen.getByRole('button', { name: option }));
}

test('renders the core filter controls', () => {
  renderFilters({ categories: ['Cloud'] });

  screen.getByRole('textbox', { name: 'search extensions' });
  screen.getByLabelText('Filter by install status');
  screen.getByLabelText('Filter by category');
  screen.getByRole('checkbox', { name: 'Featured' });
});

test('renders the category dropdown when categories are provided', async () => {
  renderFilters({ categories: ['Cloud', 'Kubernetes'] });

  const categoryDropdown = screen.getByLabelText('Filter by category');
  const trigger = categoryDropdown.querySelector('button');
  assert(trigger);
  await fireEvent.click(trigger);

  screen.getByRole('button', { name: 'Cloud' });
  screen.getByRole('button', { name: 'Kubernetes' });
});

test('hides the category dropdown when no categories are provided', () => {
  renderFilters();

  expect(screen.queryByLabelText('Filter by category')).not.toBeInTheDocument();
});

test('reports an updated search term', async () => {
  const onchange = vi.fn();
  renderFilters({ searchTerm: 'is:installed', onchange });

  await fireEvent.input(screen.getByRole('textbox', { name: 'search extensions' }), {
    target: { value: 'kube' },
  });

  expect(onchange).toHaveBeenCalledWith('kube');
});

test.each([
  { option: 'Installed', initial: '', expected: 'is:installed' },
  { option: 'Not installed', initial: '', expected: 'not:installed' },
  { option: 'All statuses', initial: 'kube is:installed', expected: 'kube' },
])('reports "$expected" when $option is selected', async ({ option, initial, expected }) => {
  const onchange = vi.fn();
  renderFilters({ searchTerm: initial, onchange });

  await selectDropdownOption('Filter by install status', option);

  expect(onchange).toHaveBeenCalledWith(expected);
});

test('reports the selected category as a search-term token', async () => {
  const onchange = vi.fn();
  renderFilters({ categories: ['Cloud', 'Kubernetes'], onchange });

  await selectDropdownOption('Filter by category', 'Cloud');

  expect(onchange).toHaveBeenCalledWith('category:Cloud');
});

test('follows externally controlled Featured state', async () => {
  const onchange = vi.fn();
  const component = render(CatalogExtensionFilters, { searchTerm: '', categories: [], onchange });
  const featured = screen.getByRole('checkbox', { name: 'Featured' });

  expect(featured).not.toBeChecked();

  await component.rerender({ searchTerm: 'is:featured', categories: [], onchange });
  expect(featured).toBeChecked();

  await component.rerender({ searchTerm: '', categories: [], onchange });
  expect(featured).not.toBeChecked();

  await fireEvent.click(featured);
  expect(onchange).toHaveBeenLastCalledWith('is:featured');

  await component.rerender({ searchTerm: 'is:featured', categories: [], onchange });
  await fireEvent.click(featured);
  expect(onchange).toHaveBeenLastCalledWith('');
});

test('follows externally controlled dropdown state', async () => {
  const onchange = vi.fn();
  const component = render(CatalogExtensionFilters, { searchTerm: '', categories: ['Cloud'], onchange });

  expect(screen.getByLabelText('Filter by install status')).toHaveTextContent('All statuses');
  expect(screen.getByLabelText('Filter by category')).toHaveTextContent('All categories');

  await component.rerender({ searchTerm: 'is:installed category:cloud', categories: ['Cloud'], onchange });

  expect(screen.getByLabelText('Filter by install status')).toHaveTextContent('Installed');
  expect(screen.getByLabelText('Filter by category')).toHaveTextContent('Cloud');
});

test('synchronizes controls with typed filters passed back by the caller', async () => {
  const onchange = vi.fn();
  const categories = ['Cloud'];
  const component = render(CatalogExtensionFilters, { searchTerm: '', categories, onchange });
  const search = screen.getByRole('textbox', { name: 'search extensions' });

  for (const searchTerm of [
    'keyword:provider is:installed category:cloud is:featured',
    'keyword:provider not:installed',
    '',
  ]) {
    await fireEvent.input(search, { target: { value: searchTerm } });
    expect(onchange).toHaveBeenLastCalledWith(searchTerm);
    await component.rerender({ searchTerm, categories, onchange });

    expect(screen.getByLabelText('Filter by install status')).toHaveTextContent(
      searchTerm.includes('is:installed')
        ? 'Installed'
        : searchTerm.includes('not:installed')
          ? 'Not installed'
          : 'All statuses',
    );
    expect(screen.getByLabelText('Filter by category')).toHaveTextContent(
      searchTerm.includes('category:cloud') ? 'Cloud' : 'All categories',
    );
    expect(screen.getByRole('checkbox', { name: 'Featured' })).toHaveProperty(
      'checked',
      searchTerm.includes('is:featured'),
    );
  }
});

test('hides Clear when the search term is empty', () => {
  renderFilters();

  expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
});

test.each(['kube', 'is:installed', 'not:installed', 'category:Cloud', 'is:featured'])(
  'shows Clear when "%s" is active',
  searchTerm => {
    renderFilters({ searchTerm });

    screen.getByRole('button', { name: 'Clear' });
  },
);

test('reports the default search term from Clear', async () => {
  const onchange = vi.fn();
  renderFilters({ searchTerm: 'kube is:featured', onchange });

  await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

  expect(onchange).toHaveBeenCalledWith('');
});
