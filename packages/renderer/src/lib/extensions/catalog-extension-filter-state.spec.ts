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

import SearchString from 'search-string';
import { expect, test } from 'vitest';

import { SearchTermParser } from '/@/lib/search/search-term-parser';

import { CatalogExtensionFilterState } from './catalog-extension-filter-state';
import { ExtensionsUtils } from './extensions-utils';

function parse(searchTerm: string): SearchTermParser<(typeof ExtensionsUtils.CATALOG_FILTERS)[number]> {
  return new SearchTermParser(searchTerm, ExtensionsUtils.CATALOG_FILTERS);
}

test.each([
  { searchTerm: '', expected: 'all' },
  { searchTerm: 'is:installed', expected: 'installed' },
  { searchTerm: 'not:installed', expected: 'not-installed' },
  { searchTerm: 'not:installed is:installed', expected: 'installed' },
])('gets install status $expected from "$searchTerm"', ({ searchTerm, expected }) => {
  expect(new CatalogExtensionFilterState(searchTerm).installStatus).toBe(expected);
});

test.each([
  { status: 'installed', expectedIs: ['featured', 'installed'], expectedNot: [] },
  { status: 'not-installed', expectedIs: ['featured'], expectedNot: ['installed'] },
  { status: 'all', expectedIs: ['featured'], expectedNot: [] },
])('sets install status $status while preserving other filters', ({ status, expectedIs, expectedNot }) => {
  const state = new CatalogExtensionFilterState('kube not:installed is:featured');

  const parsed = parse(state.withInstallStatus(status));

  expect(parsed.terms).toEqual(['kube']);
  expect(parsed.getFilter('is')).toEqual(expectedIs);
  expect(parsed.getFilter('not')).toEqual(expectedNot);
});

test('ignores an unknown install status', () => {
  const state = new CatalogExtensionFilterState('kube is:installed');

  expect(state.withInstallStatus('unknown')).toBe('kube is:installed');
});

test('removes only the install value from a grouped filter token', () => {
  const state = new CatalogExtensionFilterState('is:installed,featured');

  expect(parse(state.withInstallStatus('all')).getFilter('is')).toEqual(['featured']);
});

test('removes duplicate and mixed-case install filters without removing other conditions', () => {
  const state = new CatalogExtensionFilterState(
    'IS:Installed is:installed,installed NOT:INSTALLED is:featured keyword:provider -is:installed',
  );

  const searchTerm = state.withInstallStatus('not-installed');
  const parsed = parse(searchTerm);

  expect(parsed.getFilter('is')).toEqual(['featured']);
  expect(parsed.getFilter('not')).toEqual(['installed']);
  expect(parsed.getFilter('keyword')).toEqual(['provider']);
  expect(SearchString.parse(searchTerm).getConditionArray()).toContainEqual({
    keyword: 'is',
    value: 'installed',
    negated: true,
  });
});

test('gets a category using the casing supplied by the caller', () => {
  const state = new CatalogExtensionFilterState('category:kubernetes', ['Cloud', 'Kubernetes']);

  expect(state.category).toBe('Kubernetes');
  expect(state.categoryOptions).toEqual([
    { value: '', label: 'All categories' },
    { value: 'Cloud', label: 'Cloud' },
    { value: 'Kubernetes', label: 'Kubernetes' },
  ]);
});

test('sets a quoted category while preserving other filters', () => {
  const state = new CatalogExtensionFilterState('"kube extension" category:Cloud keyword:provider');

  const searchTerm = state.withCategory('Extension Packs');
  const parsed = parse(searchTerm);

  expect(searchTerm).toContain('category:"Extension Packs"');
  expect(parsed.terms).toEqual(['kube extension']);
  expect(parsed.getFilter('category')).toEqual(['extension packs']);
  expect(parsed.getFilter('keyword')).toEqual(['provider']);
});

test('removes every category token', () => {
  const state = new CatalogExtensionFilterState('kube CATEGORY:Cloud category:Kubernetes,Kubernetes keyword:provider');

  const parsed = parse(state.withCategory(''));

  expect(parsed.terms).toEqual(['kube']);
  expect(parsed.getFilter('category')).toEqual([]);
  expect(parsed.getFilter('keyword')).toEqual(['provider']);
});

test.each([
  { searchTerm: '', expected: false },
  { searchTerm: 'not:featured', expected: false },
  { searchTerm: 'is:featured', expected: true },
])('gets Featured as $expected from "$searchTerm"', ({ searchTerm, expected }) => {
  expect(new CatalogExtensionFilterState(searchTerm).featured).toBe(expected);
});

test('sets Featured while preserving other filters', () => {
  const state = new CatalogExtensionFilterState('kube not:featured is:installed');

  const parsed = parse(state.withFeatured(true));

  expect(parsed.terms).toEqual(['kube']);
  expect(parsed.getFilter('is')).toEqual(['installed', 'featured']);
  expect(parsed.getFilter('not')).toEqual([]);
});

test('removes every Featured token', () => {
  const state = new CatalogExtensionFilterState('kube IS:Featured is:featured,featured NOT:FEATURED is:installed');

  const parsed = parse(state.withFeatured(false));

  expect(parsed.terms).toEqual(['kube']);
  expect(parsed.getFilter('is')).toEqual(['installed']);
  expect(parsed.getFilter('not')).toEqual([]);
});

test('removes only Featured from a grouped filter token', () => {
  const state = new CatalogExtensionFilterState('is:installed,featured');

  expect(parse(state.withFeatured(false)).getFilter('is')).toEqual(['installed']);
});

test('preserves a quoted text term that resembles a filter token', () => {
  const state = new CatalogExtensionFilterState('"is:featured" is:featured');

  expect(state.withFeatured(false)).toBe('"is:featured"');
});

test.each([
  '"kube extension"',
  '"is:featured"',
  '\'category:"Cloud"\'',
  '"-literal"',
  '-"excluded phrase"',
  '"a \\"quoted\\" phrase"',
])('preserves the meaning of text %s when changing any control', text => {
  const state = new CatalogExtensionFilterState(`${text} keyword:provider is:installed is:featured category:Cloud`);
  const expectedText = SearchString.parse(text).getTextSegments();

  for (const searchTerm of [
    state.withInstallStatus('not-installed'),
    state.withCategory('Extension Packs'),
    state.withFeatured(false),
  ]) {
    expect(SearchString.parse(searchTerm).getTextSegments()).toEqual(expectedText);
    expect(parse(searchTerm).getFilter('keyword')).toEqual(['provider']);
  }
});

test.each([
  'constructor:foo',
  'toString:foo',
  '__proto__:foo',
  'hasOwnProperty:foo',
  '-constructor:foo',
  '"custom filter":foo',
  'keyword:""',
  '-keyword:""',
  'keyword:"\'provider\'"',
  'keyword:"it\'s"',
  'keyword:"",provider',
  'keyword:provider,"\'provider\'"',
  'keyword:"\'provider\'",provider',
])('preserves unrelated conditions %s when changing any control', condition => {
  const state = new CatalogExtensionFilterState(`${condition} is:installed is:featured category:Cloud`);
  const expectedConditions = SearchString.parse(condition).getConditionArray();

  for (const searchTerm of [
    state.withInstallStatus('not-installed'),
    state.withCategory('Extension Packs'),
    state.withFeatured(false),
  ]) {
    const conditions = SearchString.parse(searchTerm)
      .getConditionArray()
      .filter(entry => !['is', 'not', 'category'].includes(entry.keyword.toLowerCase()));

    expect(conditions).toEqual(expectedConditions);
    expect(parse(searchTerm).terms).toEqual(parse(condition).terms);
  }
});

test('preserves category order when changing an unrelated control', () => {
  const state = new CatalogExtensionFilterState('category:"\'provider\'" category:Cloud');

  const searchTerm = state.withFeatured(true);

  expect(parse(searchTerm).getFilter('category')).toEqual(parse(state.searchTerm).getFilter('category'));
  expect(new CatalogExtensionFilterState(searchTerm).category).toBe(state.category);
});

test.each([
  { name: 'tab', whitespace: '\t' },
  { name: 'newline', whitespace: '\n' },
  { name: 'carriage return', whitespace: '\r' },
  { name: 'non-breaking space', whitespace: '\u00a0' },
  { name: 'em space', whitespace: '\u2003' },
  { name: 'line separator', whitespace: '\u2028' },
  { name: 'paragraph separator', whitespace: '\u2029' },
  { name: 'byte order mark', whitespace: '\ufeff' },
])('preserves trailing $name in filter values when changing any control', ({ whitespace }) => {
  const value = `provider${whitespace}`;
  const state = new CatalogExtensionFilterState(`keyword:"${value}" is:installed is:featured category:Cloud`);

  for (const searchTerm of [
    state.withInstallStatus('not-installed'),
    state.withCategory('Extension Packs'),
    state.withFeatured(false),
  ]) {
    expect(parse(searchTerm).getFilter('keyword')).toEqual([value]);
  }
  expect(parse(state.withCategory(value)).getFilter('category')).toEqual([value]);
});

test('does not change the original state when producing updated search terms', () => {
  const state = new CatalogExtensionFilterState('is:installed is:featured');

  state.withFeatured(false);
  state.withCategory('Cloud');

  expect(state.featured).toBe(true);
  expect(state.category).toBe('');
  expect(state.installStatus).toBe('installed');
  expect(parse(state.withInstallStatus('all')).getFilter('is')).toEqual(['featured']);
});

test('preserves an unmatched quote while updating filters', () => {
  const state = new CatalogExtensionFilterState('"unterminated is:installed');

  const parsed = parse(state.withInstallStatus('all'));

  expect(parsed.terms).toEqual(['"unterminated']);
  expect(parsed.getFilter('is')).toEqual([]);
});

test('quotes and escapes a category containing double quotes', () => {
  const state = new CatalogExtensionFilterState('');

  expect(parse(state.withCategory('A "quoted" tool')).getFilter('category')).toEqual(['a "quoted" tool']);
});

test.each([
  { searchTerm: '', expected: false },
  { searchTerm: '   ', expected: false },
  { searchTerm: 'kube', expected: true },
  { searchTerm: 'is:installed', expected: true },
])('reports active filters as $expected for "$searchTerm"', ({ searchTerm, expected }) => {
  expect(new CatalogExtensionFilterState(searchTerm).hasActiveFilters).toBe(expected);
});
