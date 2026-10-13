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

import SearchString, { type Condition } from 'search-string';

import { SearchTermParser } from '/@/lib/search/search-term-parser';

import { ExtensionsUtils } from './extensions-utils';

export type CatalogInstallStatus = 'all' | 'installed' | 'not-installed';

type CatalogFilterKeyword = (typeof ExtensionsUtils.CATALOG_FILTERS)[number];

interface FilterToken {
  keyword: CatalogFilterKeyword;
  value: string;
}

export interface CatalogInstallStatusOption {
  value: CatalogInstallStatus;
  label: string;
  token?: FilterToken;
}

export interface CatalogCategoryOption {
  value: string;
  label: string;
}

export const CATALOG_INSTALL_STATUS_OPTIONS: CatalogInstallStatusOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'installed', label: 'Installed', token: { keyword: 'is', value: 'installed' } },
  { value: 'not-installed', label: 'Not installed', token: { keyword: 'not', value: 'installed' } },
];

/**
 * Presents and updates Catalog filter controls through the existing search-term token model.
 */
export class CatalogExtensionFilterState {
  readonly #parsed: SearchTermParser<CatalogFilterKeyword>;

  constructor(
    readonly searchTerm: string,
    readonly categories: string[] = [],
  ) {
    this.#parsed = new SearchTermParser(searchTerm, ExtensionsUtils.CATALOG_FILTERS);
  }

  /**
   * Returns the install-status control value represented by the search term.
   */
  get installStatus(): CatalogInstallStatus {
    return CATALOG_INSTALL_STATUS_OPTIONS.find(option => option.token && this.#hasToken(option.token))?.value ?? 'all';
  }

  /**
   * Returns the category control value represented by the search term.
   */
  get category(): string {
    const category = this.#parsed.getFilter('category')[0] ?? '';
    return this.categories.find(value => value.toLowerCase() === category.toLowerCase()) ?? category;
  }

  /**
   * Returns category options, including the option that removes the category filter.
   */
  get categoryOptions(): CatalogCategoryOption[] {
    return [
      { value: '', label: 'All categories' },
      ...this.categories.map(category => ({ value: category, label: category })),
    ];
  }

  /**
   * Returns whether the search term requests Featured extensions.
   */
  get featured(): boolean {
    return this.#parsed.getFilter('is').includes('featured');
  }

  /**
   * Returns whether any text or filter token is active.
   */
  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  /**
   * Returns a search term with the requested install-status token.
   */
  withInstallStatus(status: string): string {
    const option = CATALOG_INSTALL_STATUS_OPTIONS.find(candidate => candidate.value === status);
    if (!option) {
      return this.searchTerm;
    }

    return this.#replaceConditions(condition => this.#matchesBooleanFilter(condition, 'installed'), option.token);
  }

  /**
   * Returns a search term with the requested category token.
   */
  withCategory(category: string): string {
    return this.#replaceConditions(
      condition => !condition.negated && condition.keyword.toLowerCase() === 'category',
      category ? { keyword: 'category', value: category } : undefined,
    );
  }

  /**
   * Returns a search term with Featured enabled or with its Featured tokens removed.
   */
  withFeatured(featured: boolean): string {
    return this.#replaceConditions(
      condition => this.#matchesBooleanFilter(condition, 'featured'),
      featured ? { keyword: 'is', value: 'featured' } : undefined,
    );
  }

  #hasToken(token: FilterToken): boolean {
    return this.#parsed.getFilter(token.keyword).includes(token.value);
  }

  #matchesBooleanFilter(condition: Condition, value: 'installed' | 'featured'): boolean {
    return (
      !condition.negated &&
      ['is', 'not'].includes(condition.keyword.toLowerCase()) &&
      condition.value.toLowerCase() === value
    );
  }

  #replaceConditions(predicate: (condition: Condition) => boolean, replacement?: FilterToken): string {
    const parsed = SearchString.parse(this.searchTerm);
    // removeEntry removes only the first exact match. Snapshot matches so duplicates
    // and differently cased filters are all removed without affecting other values.
    for (const condition of parsed.getConditionArray().filter(predicate)) {
      parsed.removeEntry(condition.keyword, condition.value, condition.negated);
    }
    if (replacement) {
      parsed.addEntry(replacement.keyword, replacement.value, false);
    }

    // Serialize entries individually so fallback quoting does not reorder values
    // relative to other conditions with the same keyword.
    const conditions = parsed.getConditionArray().map(condition => this.#serializeCondition(condition));
    // search-string 4.1 emits text verbatim, losing phrases and literal token-like text.
    const terms = parsed.getTextSegments().map(({ text, negated }) => {
      const value = /[\s:"'\\]|^-/.test(text) ? this.#quote(text) : text;
      return `${negated ? '-' : ''}${value}`;
    });
    return [...conditions, ...terms].join(' ');
  }

  #serializeCondition({ keyword, value, negated }: Condition): string {
    // search-string 4.1 groups conditions in a plain object, drops empty values,
    // and does not protect all whitespace or literal single quotes.
    if (Object.hasOwn(Object.prototype, keyword) || !value || /[\s']/.test(value) || /[\s:"'\\]|^-/.test(keyword)) {
      const name = /[\s:"'\\]|^-/.test(keyword) ? this.#quote(keyword) : keyword;
      return `${negated ? '-' : ''}${name}:${this.#quote(value)}`;
    }

    const parsed = SearchString.parse('');
    parsed.addEntry(keyword, value, negated);
    return parsed.toString();
  }

  #quote(value: string): string {
    return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
  }
}
