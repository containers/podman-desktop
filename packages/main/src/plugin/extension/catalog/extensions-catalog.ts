/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { CatalogExtension, CatalogFetchableExtension } from '@desktop-framework/api/extension-catalog';
import { inject, injectable } from 'inversify';
import { coerce, satisfies } from 'semver';

import { ExtensionApiVersion } from '/@/plugin/extension/extension-api-version.js';
import product from '/@product.json' with { type: 'json' };

import { ExtensionsCatalogSettings } from './extensions-catalog-settings.js';

/**
 * Allow to grab content from the online extensions catalog.
 */
@injectable()
export class ExtensionsCatalog {
  public static readonly DEFAULT_EXTENSIONS_URL = product.catalog.default;
  static readonly FETCH_TIMEOUT = 10_000;

  private lastFetchTime = 0;
  private cachedCatalog: InternalCatalogJSON | undefined;
  static readonly CACHE_TIMEOUT = 1000 * 60 * 60 * 4; // 4 hours

  constructor(
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(ExtensionApiVersion)
    private extensionApiVersion: ExtensionApiVersion,
  ) {}

  init(): void {
    // register a configuration
    const recommendationConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [ExtensionsCatalogSettings.SectionName + '.' + ExtensionsCatalogSettings.registryUrl]: {
          description: 'URL to the extensions catalog',
          type: 'string',
          default: ExtensionsCatalog.DEFAULT_EXTENSIONS_URL,
          hidden: true,
        },
        ['extensions.localExtensions.enabled']: {
          description: 'Show the local extensions tab.',
          type: 'boolean',
          default: true,
          hidden: true,
        },
        [ExtensionsCatalogSettings.SectionName + '.' + ExtensionsCatalogSettings.catalogEnabled]: {
          description: 'Show the extension catalog in the UI. When disabled, hides the catalog suggestions.',
          type: 'boolean',
          default: true,
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([recommendationConfiguration]);
  }

  // can be called to force the refresh of the catalog
  // or it is called automatically when asking the catalog
  public async refreshCatalog(): Promise<void> {
    // get the URL from the configuration
    const catalogUrl = this.configurationRegistry
      .getConfiguration(ExtensionsCatalogSettings.SectionName)
      .get<string>(ExtensionsCatalogSettings.registryUrl, ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);

    const startTime = performance.now();
    try {
      const response = await fetch(catalogUrl, {
        signal: AbortSignal.timeout(ExtensionsCatalog.FETCH_TIMEOUT),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${String(response.status)}: ${response.statusText}`);
      }
      this.cachedCatalog = (await response.json()) as InternalCatalogJSON;
      const endTime = performance.now();
      console.log(`Fetched ${catalogUrl} in ${endTime - startTime}ms`);
      this.apiSender.send('refresh-catalog');
    } catch (requestErr: unknown) {
      if (typeof requestErr === 'object' && requestErr && 'message' in requestErr && requestErr.message) {
        throw new Error(`Unable to fetch the available extensions: ${String(requestErr.message)}`);
      } else {
        throw new Error(`Unable to fetch the available extensions: ${String(requestErr)}`);
      }
    }
  }

  // internal method, not exposed
  protected async getCatalogJson(): Promise<InternalCatalogJSON | undefined> {
    // return the cache version if cache is not reached and we have a cached version
    if (this.lastFetchTime + ExtensionsCatalog.CACHE_TIMEOUT > Date.now() && this.cachedCatalog) {
      return this.cachedCatalog;
    }

    try {
      await this.refreshCatalog();
    } catch (error: unknown) {
      console.error(String(error));
    }
    // update the last fetch time
    this.lastFetchTime = Date.now();

    return this.cachedCatalog;
  }

  // get the list of extensions
  async getExtensions(): Promise<CatalogExtension[]> {
    const catalogJSON = await this.getCatalogJson();
    const appVersion = this.extensionApiVersion.getApiVersion();
    const currentPodmanDesktopVersion = coerce(appVersion);
    if (catalogJSON?.extensions) {
      // we have a list of extensions
      return catalogJSON.extensions.map(extension => {
        return {
          id: `${extension.publisher.publisherName}.${extension.extensionName}`,
          publisherName: extension.publisher.publisherName,
          publisherDisplayName: extension.publisher.displayName,
          categories: extension.categories,
          keywords: extension.keywords,
          unlisted: extension.unlisted ?? false,
          extensionName: extension.extensionName,
          shortDescription: extension.shortDescription,
          displayName: extension.displayName,
          versions: extension.versions
            .filter(version => {
              const extensionRequirePodmanDesktopVersion = version.podmanDesktopVersion;
              if (extensionRequirePodmanDesktopVersion && currentPodmanDesktopVersion) {
                //  keep the versions that are compatible with this version of Podman Desktop
                return satisfies(currentPodmanDesktopVersion, extensionRequirePodmanDesktopVersion);
              } else {
                // if no version is specified, keep the version
                return true;
              }
            })
            .map(version => {
              return {
                version: version.version,
                podmanDesktopVersion: version.podmanDesktopVersion,
                preview: version.preview,
                ociUri: version.ociUri,
                files: version.files,
                lastUpdated: new Date(version.lastUpdated),
              };
            }),
        };
      });
    }
    return [];
  }

  // get the list of fetchable extensions
  async getFetchableExtensions(): Promise<CatalogFetchableExtension[]> {
    const fetchableExtensions: CatalogFetchableExtension[] = [];

    const catalogJSON = await this.getCatalogJson();
    if (catalogJSON?.extensions) {
      // we have a list of extensions
      catalogJSON.extensions.forEach(extension => {
        const notPreviewVersions = extension.versions.filter(v => v.preview !== true);
        if (notPreviewVersions.length > 0 && notPreviewVersions[0]) {
          // take the first version
          fetchableExtensions.push({
            extensionId: `${extension.publisher.publisherName}.${extension.extensionName}`,
            link: notPreviewVersions[0].ociUri,
            version: notPreviewVersions[0].version,
          });
        }
      });
    }

    return fetchableExtensions;
  }

  async fetchReadme(extensionId: string): Promise<string> {
    const catalogExtensions = await this.getExtensions();
    const extensionInfo = catalogExtensions.find(extension => extension.id === extensionId);

    if (!extensionInfo) {
      throw new Error(`No extension with id ${extensionId} found`);
    }

    // Get the first non-preview version
    const nonPreviewVersions = extensionInfo.versions.filter(v => v.preview === false);
    const latestVersion = nonPreviewVersions.length > 0 ? nonPreviewVersions[0] : undefined;
    const latestVersionReadme = latestVersion?.files.find(f => f.assetType.toLowerCase() === 'readme')?.data;

    if (!latestVersionReadme) {
      throw new Error(`Extension ${extensionId} has no README`);
    }

    const response = await fetch(latestVersionReadme, {
      signal: AbortSignal.timeout(ExtensionsCatalog.FETCH_TIMEOUT),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch README from ${latestVersionReadme}`);
    }
    return response.text();
  }
}

// internal JSON format, not exposed to the outside
interface InternalCatalogExtensionPublisherJSON {
  publisherName: string;
  displayName: string;
}

interface InternalCatalogExtensionJSON {
  publisher: InternalCatalogExtensionPublisherJSON;
  extensionName: string;
  displayName: string;
  categories: string[];
  keywords: string[];
  unlisted?: boolean;
  shortDescription: string;
  versions: InternalCatalogExtensionVersionJSON[];
}

interface InternalCatalogExtensionVersionJSON {
  version: string;
  podmanDesktopVersion?: string;
  ociUri: string;
  preview: boolean;
  lastUpdated: string;
  files: InternalCatalogExtensionVersionFileJSON[];
}

interface InternalCatalogExtensionVersionFileJSON {
  assetType: 'icon' | 'LICENSE' | 'README';
  data: string;
}

interface InternalCatalogJSON {
  extensions: InternalCatalogExtensionJSON[];
}
