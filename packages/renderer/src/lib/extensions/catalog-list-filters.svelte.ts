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

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import type { CatalogListFilters } from './catalog-list-filters';
import { ExtensionsUtils } from './extensions-utils';

/**
 * Session-only Catalog toolbar filter state.
 *
 * This is a module-level rune, so it lives in memory only and resets on reload: filters intentionally
 * persist for the session but not across app restarts (see issue #18928 DoD). The search term lives
 * here alongside the other filters so the whole toolbar state has one consistent lifetime — it
 * survives leaving and returning to the Catalog tab, unlike component-local state.
 */
export class CatalogListFilterState {
  value: CatalogListFilters = $state({});
  searchTerm = $state('');

  readonly #extensionsUtils = new ExtensionsUtils();

  reset(): void {
    this.value = {};
    this.searchTerm = '';
  }

  setInstalled(installed: boolean | undefined): void {
    const next = { ...this.value };
    if (installed === undefined) delete next.installed;
    else next.installed = installed;
    this.value = next;
  }

  setCategory(category: string | undefined): void {
    const next = { ...this.value };
    if (!category) delete next.category;
    else next.category = category;
    this.value = next;
  }

  toggleFeatured(): void {
    const next = { ...this.value };
    if (next.featured) delete next.featured;
    else next.featured = true;
    this.value = next;
  }

  hasActiveFilters(): boolean {
    return (
      this.value.installed !== undefined ||
      this.value.featured === true ||
      !!this.value.category ||
      this.searchTerm.trim().length > 0
    );
  }

  apply(extensions: CatalogExtensionInfoUI[]): CatalogExtensionInfoUI[] {
    const filteredBySearch = this.#extensionsUtils.filterCatalogExtensions(extensions, this.searchTerm);
    return filteredBySearch.filter(extension => {
      if (this.value.installed !== undefined && extension.isInstalled !== this.value.installed) return false;
      if (this.value.featured && !extension.isFeatured) return false;
      if (this.value.category) {
        const categories = this.#extensionsUtils.resolveExtensionCategoryTags(extension.categories);
        if (!categories.includes(this.value.category)) return false;
      }
      return true;
    });
  }
}

export const catalogListFilters = new CatalogListFilterState();
