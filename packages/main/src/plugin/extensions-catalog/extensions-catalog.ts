/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { HttpsOptions, OptionsOfTextResponseBody } from 'got';
import got from 'got';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

import type { Certificates } from '/@/plugin/certificates.js';
import type {
  CatalogExtension,
  CatalogFetchableExtension,
} from '/@/plugin/extensions-catalog/extensions-catalog-api.js';
import type { Proxy } from '/@/plugin/proxy.js';

import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry.js';
import { ExtensionsCatalogSettings } from './extensions-catalog-settings.js';

/**
 * Allow to grab content from the online extensions catalog.
 */
export class ExtensionsCatalog {
  public static readonly DEFAULT_EXTENSIONS_URL = 'https://registry.podman-desktop.io/api/extensions.json';

  private lastFetchTime = 0;
  private cachedCatalog: InternalCatalogJSON | undefined;
  static readonly CACHE_TIMEOUT = 1000 * 60 * 60 * 4; // 4 hours

  constructor(
    private certificates: Certificates,
    private proxy: Proxy,
    private configurationRegistry: ConfigurationRegistry,
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
      },
    };

    this.configurationRegistry.registerConfigurations([recommendationConfiguration]);
  }

  // internal method, not exposed
  protected async getCatalogJson(): Promise<InternalCatalogJSON | undefined> {
    // return the cache version if cache is not reached and we have a cached version
    if (this.lastFetchTime + ExtensionsCatalog.CACHE_TIMEOUT > Date.now() && this.cachedCatalog) {
      return this.cachedCatalog;
    }

    // get the URL from the configuration
    const catalogUrl = this.configurationRegistry
      .getConfiguration(ExtensionsCatalogSettings.SectionName)
      .get<string>(ExtensionsCatalogSettings.registryUrl, ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);

    // try to fetch a file online
    // use also the proxy if defined
    // current time
    const startTime = performance.now();
    try {
      const response = await got.get(catalogUrl, this.getHttpOptions());
      this.cachedCatalog = JSON.parse(response.body) as InternalCatalogJSON;
      const endTime = performance.now();
      console.log(`Fetched ${catalogUrl} in ${endTime - startTime}ms`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (requestErr: any) {
      // unable to fetch the extensions
      // extract only the error message
      if (requestErr.message) {
        console.error('Unable to fetch the available extensions: ' + requestErr.message);
      } else {
        console.error('Unable to fetch the available extensions', requestErr.message);
      }
    }
    // update the last fetch time
    this.lastFetchTime = Date.now();

    return this.cachedCatalog;
  }

  // get the list of extensions
  async getExtensions(): Promise<CatalogExtension[]> {
    const catalogJSON = await this.getCatalogJson();
    if (catalogJSON?.extensions) {
      // we have a list of extensions
      return catalogJSON.extensions.map(extension => {
        return {
          id: `${extension.publisher.publisherName}.${extension.extensionName}`,
          publisherName: extension.publisher.publisherName,
          publisherDisplayName: extension.publisher.displayName,
          categories: extension.categories,
          unlisted: extension.unlisted ?? false,
          extensionName: extension.extensionName,
          shortDescription: extension.shortDescription,
          displayName: extension.displayName,
          versions: extension.versions.map(version => {
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
        if (notPreviewVersions.length > 0) {
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

  getHttpOptions(): OptionsOfTextResponseBody {
    const httpsOptions: HttpsOptions = {};
    const options: OptionsOfTextResponseBody = {
      https: httpsOptions,
      retry: { limit: 0 },
      // specify short timeout
      timeout: {
        lookup: 2000,
        connect: 2000,
        secureConnect: 2000,
        socket: 2000,
        send: 10000,
        response: 1000,
      },
    };

    if (options.https) {
      options.https.certificateAuthority = this.certificates.getAllCertificates();
    }

    if (this.proxy.isEnabled()) {
      // use proxy when performing got request
      const proxy = this.proxy.proxy;
      const httpProxyUrl = proxy?.httpProxy;
      const httpsProxyUrl = proxy?.httpsProxy;

      if (httpProxyUrl) {
        if (!options.agent) {
          options.agent = {};
        }
        try {
          options.agent.http = new HttpProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: httpProxyUrl,
          });
        } catch (error) {
          throw new Error(`Failed to create https proxy agent from ${httpProxyUrl}: ${error}`);
        }
      }
      if (httpsProxyUrl) {
        if (!options.agent) {
          options.agent = {};
        }
        try {
          options.agent.https = new HttpsProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: httpsProxyUrl,
          });
        } catch (error) {
          throw new Error(`Failed to create https proxy agent from ${httpsProxyUrl}: ${error}`);
        }
      }
    }
    return options;
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
