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

import type { OverriddenExtension } from '@desktop-framework/api';
import type { CatalogExtension } from '@desktop-framework/api/extension-catalog';
import type { FeaturedExtension } from '@desktop-framework/api/featured';

import { SearchTermParser } from '/@/lib/search/search-term-parser';
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import type { ExtensionDetailsUI } from './extension-details-ui';

export class ExtensionsUtils {
  extractExtensionDetail(
    catalogExtensions: CatalogExtension[],
    installedExtensions: CombinedExtensionInfoUI[],
    extensionId: string,
  ): ExtensionDetailsUI | undefined {
    const matchingInstalledExtension = installedExtensions.find(c => c.id === extensionId);
    // is it in the catalog
    const matchingCatalogExtension = catalogExtensions.find(c => c.id === extensionId);

    // not installed and not in the catalog, return undefined as it is not matching
    if (!matchingCatalogExtension && !matchingInstalledExtension) {
      return undefined;
    }

    let displayName: string;

    let description: string;

    let type: 'dd' | 'pd';

    let removable: boolean;
    let devMode: boolean;
    let bundled: boolean;
    let overrides: OverriddenExtension | undefined;
    let state: string;
    let icon: undefined | string | { light: string; dark: string };
    let iconRef: undefined | string;
    let name: string;
    let readme: { content?: string; uri?: string } = {};

    const nonPreviewVersions = matchingCatalogExtension?.versions.filter(v => v.preview === false) ?? [];
    const latestVersion = nonPreviewVersions.length > 0 ? nonPreviewVersions[0] : undefined;
    const latestVersionNumber = latestVersion ? `v${latestVersion.version}` : '';
    const latestVersionOciLink = latestVersion ? latestVersion.ociUri : undefined;
    const latestVersionIcon = latestVersion ? latestVersion.files.find(f => f.assetType === 'icon')?.data : undefined;
    const latestVersionReadme = latestVersion
      ? latestVersion.files.find(f => f.assetType.toLowerCase() === 'readme')?.data
      : undefined;
    const lastUpdated = latestVersion?.lastUpdated;
    // grab first from installed extension
    if (matchingInstalledExtension) {
      displayName = matchingInstalledExtension.displayName;
      description = matchingInstalledExtension.description;
      type = matchingInstalledExtension.type;
      removable = matchingInstalledExtension.removable;
      devMode = matchingInstalledExtension.devMode;
      bundled = matchingInstalledExtension.bundled;
      overrides = matchingInstalledExtension.overrides;
      state = matchingInstalledExtension.state;
      icon = matchingInstalledExtension.icon;
      name = matchingInstalledExtension.name;
      readme.content = matchingInstalledExtension.readme;
    } else if (matchingCatalogExtension) {
      displayName = matchingCatalogExtension.displayName;
      description = matchingCatalogExtension.shortDescription;
      // catalog only includes Podman Desktop extensions
      type = 'pd';
      removable = true;
      devMode = false; // catalog extensions are not in dev mode
      bundled = false;
      state = 'downloadable';
      name = matchingCatalogExtension.extensionName;

      if (latestVersionReadme) {
        readme = { uri: latestVersionReadme };
      }

      if (latestVersionIcon) {
        iconRef = latestVersionIcon;
      }
    } else {
      displayName = 'Unknown';
      description = '';
      type = 'pd';
      removable = false;
      devMode = false;
      bundled = false;
      state = 'unknown';
      name = 'unknown';
    }

    let releaseDate: string = 'N/A';
    if (lastUpdated) {
      releaseDate = lastUpdated.toISOString().split('T')[0];
    }

    let publisherDisplayName = matchingCatalogExtension?.publisherDisplayName ?? 'N/A';

    if (matchingInstalledExtension && !matchingInstalledExtension.removable) {
      publisherDisplayName = 'Pre-installed';
    }

    const categories: string[] = matchingCatalogExtension?.categories ?? [];
    const matchingInstalledExtensionVersion = matchingInstalledExtension?.version
      ? `v${matchingInstalledExtension.version}`
      : undefined;
    const version = matchingInstalledExtensionVersion ?? latestVersionNumber ?? 'N/A';

    const installedExtension = matchingInstalledExtension;
    const error = matchingInstalledExtension?.error;

    const fetchLink = latestVersionOciLink ?? '';
    const fetchVersion = latestVersion?.version ?? '';

    const fetchable = fetchLink.length > 0;

    const repository = matchingInstalledExtension?.repository;
    const homepage = matchingInstalledExtension?.homepage;

    const matchingExtension: ExtensionDetailsUI = {
      id: extensionId,
      displayName,
      description,
      type,
      removable,
      devMode,
      bundled,
      overrides,
      state,
      icon,
      iconRef,
      name,
      readme,
      releaseDate,
      categories,
      publisherDisplayName,
      version,
      installedExtension,
      fetchable,
      fetchLink,
      fetchVersion,
      error,
      repository,
      homepage,
    };
    return matchingExtension;
  }

  extractCatalogExtensions(
    catalogExtensions: CatalogExtension[],
    featuredExtensions: FeaturedExtension[],
    installedExtensions: CombinedExtensionInfoUI[],
  ): CatalogExtensionInfoUI[] {
    // filter out unlisted extensions
    const values: CatalogExtensionInfoUI[] = catalogExtensions
      .filter(e => !e.unlisted)
      .map(catalogExtension => {
        // grab latest version
        const nonPreviewVersions = catalogExtension.versions.filter(v => !v.preview);
        const latestVersion = nonPreviewVersions[0];
        const fetchLink = latestVersion?.ociUri;
        const fetchVersion = latestVersion?.version;
        const publisherDisplayName = catalogExtension.publisherDisplayName;

        // grab icon
        const icon = latestVersion?.files.find(f => f.assetType === 'icon');
        const installed = installedExtensions.find(installedExtension => installedExtension.id === catalogExtension.id);
        const isInstalled = !!installed;
        const isFeatured = featuredExtensions.some(featuredExtension => featuredExtension.id === catalogExtension.id);

        const shortDescription = catalogExtension.shortDescription;
        const installedVersion = installed?.version;
        const categories = catalogExtension.categories;
        const keywords = catalogExtension.keywords;
        return {
          id: catalogExtension.id,
          displayName: catalogExtension.displayName,
          isFeatured,
          fetchLink,
          fetchVersion,
          fetchable: fetchLink !== '',
          iconHref: icon?.data,
          publisherDisplayName,
          isInstalled,
          installedVersion,
          shortDescription,
          categories,
          keywords,
        };
      });

    // sort by isFeatured and then by name
    values.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) {
        return -1;
      }
      if (!a.isFeatured && b.isFeatured) {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
    return values;
  }

  filterInstalledExtensions(extensions: CombinedExtensionInfoUI[], searchTerm: string): CombinedExtensionInfoUI[] {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return extensions.filter(extension => {
      return `${extension.displayName} ${extension.description}`.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }

  static readonly CATALOG_FILTERS = ['category', 'keyword', 'is', 'not'] as const;

  filterCatalogExtensions(extensions: CatalogExtensionInfoUI[], searchTerm: string): CatalogExtensionInfoUI[] {
    const parsed = new SearchTermParser(searchTerm, ExtensionsUtils.CATALOG_FILTERS);
    const terms = parsed.terms;
    const categories = parsed.getFilter('category');
    const keywords = parsed.getFilter('keyword');
    const isValues = parsed.getFilter('is');
    const notValues = parsed.getFilter('not');
    const installed = isValues.includes('installed') ? true : notValues.includes('installed') ? false : undefined;
    return extensions.filter(extension => {
      return (
        (terms.length === 0 ||
          terms.every(term =>
            `${extension.displayName} ${extension.shortDescription} ${extension.publisherDisplayName}`
              .toLowerCase()
              .includes(term.toLowerCase()),
          )) &&
        (categories.length === 0 ||
          categories.every(category => extension.categories.map(c => c.toLowerCase()).includes(category))) &&
        (keywords.length === 0 ||
          keywords.every(keyword => extension.keywords.map(k => k.toLowerCase()).includes(keyword))) &&
        (installed === undefined || installed === extension.isInstalled)
      );
    });
  }

  /** Keep only non-empty, trimmed category labels. */
  resolveExtensionCategoryTags(categories: string[]): string[] {
    return categories.map(category => category.trim()).filter(category => category.length > 0);
  }

  /** Collect the sorted, de-duplicated set of categories present across the given extensions. */
  collectCatalogCategories(extensions: CatalogExtensionInfoUI[]): string[] {
    const categories = new Set<string>();
    for (const extension of extensions) {
      for (const category of this.resolveExtensionCategoryTags(extension.categories)) {
        categories.add(category);
      }
    }
    return [...categories].toSorted((a, b) => a.localeCompare(b));
  }
}
