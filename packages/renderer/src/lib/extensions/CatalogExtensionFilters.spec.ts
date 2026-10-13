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
import { assert, beforeEach, expect, test } from 'vitest';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import { catalogListFilters } from './catalog-list-filters.svelte';
import CatalogExtensionFilters from './CatalogExtensionFilters.svelte';

beforeEach(() => {
  catalogListFilters.reset();
});

function createExtension(overrides: Partial<CatalogExtensionInfoUI> = {}): CatalogExtensionInfoUI {
  return {
    id: 'id',
    displayName: 'Display name',
    isFeatured: false,
    fetchable: true,
    fetchLink: 'oci://link',
    fetchVersion: '1.0.0',
    publisherDisplayName: 'Publisher',
    isInstalled: false,
    shortDescription: 'A short description',
    categories: [],
    keywords: [],
    ...overrides,
  };
}

const kubernetes = createExtension({ id: 'k8s', categories: ['Kubernetes'] });
const cloud = createExtension({ id: 'cloud', categories: ['Cloud', 'Kubernetes'] });

test('renders the search input, install-status dropdown and Featured checkbox', () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes] });

  expect(screen.getByRole('textbox', { name: 'search extensions' })).toBeInTheDocument();
  expect(screen.getByLabelText('Filter by install status')).toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'Featured' })).toBeInTheDocument();
});

test('the category dropdown is hidden when no extension has categories', () => {
  render(CatalogExtensionFilters, { catalogExtensions: [createExtension({ categories: [] })] });

  expect(screen.queryByLabelText('Filter by category')).not.toBeInTheDocument();
});

test('the category dropdown lists the sorted, de-duplicated categories', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes, cloud] });

  const categoryDropdown = screen.getByLabelText('Filter by category');
  expect(categoryDropdown).toBeInTheDocument();

  const categoryButton = categoryDropdown.querySelector('button');
  assert(categoryButton);
  await fireEvent.click(categoryButton);

  // the two distinct categories are offered as options (de-duplicated: 'Kubernetes' appears once
  // although two extensions declare it)
  expect(screen.getByRole('button', { name: 'Cloud' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Kubernetes' })).toBeInTheDocument();
  // 'All categories' is the default: shown both on the trigger and as the reset option
  expect(screen.getAllByRole('button', { name: 'All categories' })).toHaveLength(2);
});

test('selecting an install status updates the shared filter state', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes] });

  const installDropdown = screen.getByLabelText('Filter by install status');
  const installButton = installDropdown.querySelector('button');
  assert(installButton);
  await fireEvent.click(installButton);
  await fireEvent.click(screen.getByRole('button', { name: 'Not installed' }));

  expect(catalogListFilters.value.installed).toBe(false);
});

test('selecting a category updates the shared filter state', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes, cloud] });

  const categoryDropdown = screen.getByLabelText('Filter by category');
  const categoryButton = categoryDropdown.querySelector('button');
  assert(categoryButton);
  await fireEvent.click(categoryButton);
  await fireEvent.click(screen.getByRole('button', { name: 'Cloud' }));

  expect(catalogListFilters.value.category).toBe('Cloud');
});

test('toggling the Featured checkbox updates the shared filter state', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes] });

  await fireEvent.click(screen.getByRole('checkbox', { name: 'Featured' }));
  expect(catalogListFilters.value.featured).toBe(true);

  await fireEvent.click(screen.getByRole('checkbox', { name: 'Featured' }));
  expect(catalogListFilters.value.featured).toBeUndefined();
});

test('typing in the search input updates the shared search term', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes] });

  await fireEvent.input(screen.getByRole('textbox', { name: 'search extensions' }), {
    target: { value: 'kube' },
  });

  expect(catalogListFilters.searchTerm).toBe('kube');
});

test('the Clear button appears only when a filter or search is active and resets everything', async () => {
  render(CatalogExtensionFilters, { catalogExtensions: [kubernetes] });

  // no active filters: no Clear button
  expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

  // activate the Featured filter and a search term
  await fireEvent.click(screen.getByRole('checkbox', { name: 'Featured' }));
  await fireEvent.input(screen.getByRole('textbox', { name: 'search extensions' }), {
    target: { value: 'kube' },
  });

  const clearButton = screen.getByRole('button', { name: 'Clear' });
  expect(clearButton).toBeInTheDocument();

  await fireEvent.click(clearButton);

  expect(catalogListFilters.value).toEqual({});
  expect(catalogListFilters.searchTerm).toBe('');
  expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
});
