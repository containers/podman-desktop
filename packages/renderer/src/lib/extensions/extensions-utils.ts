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

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
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
      state = 'unknown';
      name = 'unknown';
    }

    let releaseDate: string = 'N/A';
    if (lastUpdated) {
      releaseDate = lastUpdated.toISOString().split('T')[0];
    }

    let publisherDisplayName = matchingCatalogExtension?.publisherDisplayName ?? 'N/A';

    if (matchingInstalledExtension && !matchingInstalledExtension.removable) {
      publisherDisplayName = 'Podman Desktop (built-in)';
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

    const matchingExtension: ExtensionDetailsUI = {
      id: extensionId,
      displayName,
      description,
      type,
      removable,
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
}
