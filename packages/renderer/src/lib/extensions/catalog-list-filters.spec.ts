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

import { beforeEach, describe, expect, test } from 'vitest';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import { catalogListFilters } from './catalog-list-filters.svelte';

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

beforeEach(() => {
  catalogListFilters.reset();
});

describe('reducers', () => {
  test('setCatalogInstalledFilter sets and clears the install status', () => {
    catalogListFilters.setInstalled(true);
    expect(catalogListFilters.value.installed).toBe(true);

    catalogListFilters.setInstalled(false);
    expect(catalogListFilters.value.installed).toBe(false);

    catalogListFilters.setInstalled(undefined);
    expect(catalogListFilters.value.installed).toBeUndefined();
  });

  test('setCatalogCategoryFilter sets and clears the category', () => {
    catalogListFilters.setCategory('Kubernetes');
    expect(catalogListFilters.value.category).toBe('Kubernetes');

    catalogListFilters.setCategory(undefined);
    expect(catalogListFilters.value.category).toBeUndefined();

    catalogListFilters.setCategory('Kubernetes');
    catalogListFilters.setCategory('');
    expect(catalogListFilters.value.category).toBeUndefined();
  });

  test('toggleCatalogBooleanFilter toggles featured', () => {
    catalogListFilters.toggleFeatured();
    expect(catalogListFilters.value.featured).toBe(true);

    catalogListFilters.toggleFeatured();
    expect(catalogListFilters.value.featured).toBeUndefined();
  });

  test('setCatalogSearchTerm sets and reads the search term', () => {
    expect(catalogListFilters.searchTerm).toBe('');
    catalogListFilters.searchTerm = 'kube';
    expect(catalogListFilters.searchTerm).toBe('kube');
  });

  test('resetCatalogListFilters clears everything', () => {
    catalogListFilters.setInstalled(true);
    catalogListFilters.toggleFeatured();
    catalogListFilters.setCategory('Kubernetes');
    catalogListFilters.searchTerm = 'kube';

    catalogListFilters.reset();
    expect(catalogListFilters.value).toEqual({});
    expect(catalogListFilters.searchTerm).toBe('');
  });

  test('hasActiveCatalogListFilters reflects active state', () => {
    expect(catalogListFilters.hasActiveFilters()).toBe(false);
    catalogListFilters.setInstalled(false);
    expect(catalogListFilters.hasActiveFilters()).toBe(true);
    catalogListFilters.reset();
    expect(catalogListFilters.hasActiveFilters()).toBe(false);
    catalogListFilters.toggleFeatured();
    expect(catalogListFilters.hasActiveFilters()).toBe(true);
  });
});

describe('applyCatalogListFilters selector', () => {
  const installed = createExtension({ id: 'installed', displayName: 'Installed one', isInstalled: true });
  const notInstalled = createExtension({ id: 'not-installed', displayName: 'Available one', isInstalled: false });
  const featured = createExtension({ id: 'featured', displayName: 'Featured one', isFeatured: true });
  const kubernetes = createExtension({ id: 'k8s', displayName: 'Kube one', categories: ['Kubernetes'] });
  const all = [installed, notInstalled, featured, kubernetes];

  test('no filters returns everything', () => {
    expect(catalogListFilters.apply(all)).toEqual(all);
  });

  test('search matches display name, description and publisher (case-insensitive)', () => {
    catalogListFilters.searchTerm = 'KUBE';
    expect(catalogListFilters.apply(all)).toEqual([kubernetes]);
    catalogListFilters.searchTerm = 'red hat';
    expect(catalogListFilters.apply([createExtension({ publisherDisplayName: 'Red Hat' })])).toHaveLength(1);
  });

  test('install status filter', () => {
    catalogListFilters.setInstalled(true);
    expect(catalogListFilters.apply(all)).toEqual([installed]);
    catalogListFilters.setInstalled(false);
    expect(catalogListFilters.apply(all)).toEqual([notInstalled, featured, kubernetes]);
  });

  test('featured filter', () => {
    catalogListFilters.toggleFeatured();
    expect(catalogListFilters.apply(all)).toEqual([featured]);
  });

  test('category filter', () => {
    catalogListFilters.setCategory('Kubernetes');
    expect(catalogListFilters.apply(all)).toEqual([kubernetes]);
  });

  test('filters combine with AND', () => {
    const both = createExtension({ id: 'both', isInstalled: true, isFeatured: true });
    catalogListFilters.setInstalled(true);
    catalogListFilters.toggleFeatured();
    const result = catalogListFilters.apply([installed, featured, both]);
    expect(result).toEqual([both]);
  });
});
