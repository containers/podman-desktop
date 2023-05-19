/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import type { HttpsOptions, OptionsOfTextResponseBody } from 'got';
import got from 'got';
import type { Certificates } from '/@/plugin/certificates';
import type { Proxy } from '/@/plugin/proxy';
import type * as podmanDesktopAPI from '@podman-desktop/api';
import type { CatalogFetchableExtension } from '/@/plugin/extensions-catalog/extensions-catalog-api';

/**
 * Allow to grab content from the online extensions catalog.
 */
export class ExtensionsCatalog {
  public static readonly ALL_EXTENSIONS_URL = 'https://registry.podman-desktop.io/api/extensions.json';

  private proxySettings: podmanDesktopAPI.ProxySettings | undefined;
  private proxyEnabled: boolean;

  constructor(private certificates: Certificates, private proxy: Proxy) {
    this.proxy.onDidUpdateProxy(settings => {
      this.proxySettings = settings;
    });

    this.proxy.onDidStateChange(state => {
      this.proxyEnabled = state;
    });

    this.proxyEnabled = this.proxy.isEnabled();
  }

  // get the list of fetchable extensions
  async getFetchableExtensions(): Promise<CatalogFetchableExtension[]> {
    // try to fetch a file online
    // use also the proxy if defined
    // current time
    const startTime = performance.now();

    const fetchableExtensions: CatalogFetchableExtension[] = [];

    try {
      const response = await got.get(ExtensionsCatalog.ALL_EXTENSIONS_URL, this.getHttpOptions());
      const catalogJSON: CatalogJSON = JSON.parse(response.body) as CatalogJSON;
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
    const endTime = performance.now();
    console.log(`Retrieved fetchable extensions in ${endTime - startTime}ms`);
    return fetchableExtensions;
  }

  getHttpOptions(): OptionsOfTextResponseBody {
    const httpsOptions: HttpsOptions = {};
    const options: OptionsOfTextResponseBody = {
      https: httpsOptions,
      retry: { limit: 0 },
      // specify short timeout
      timeout: {
        lookup: 1000,
        connect: 500,
        secureConnect: 500,
        socket: 1000,
        send: 10000,
        response: 1000,
      },
    };

    if (options.https) {
      options.https.certificateAuthority = this.certificates.getAllCertificates();
    }

    if (this.proxyEnabled) {
      // use proxy when performing got request
      const proxy = this.proxySettings;
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
interface CatalogExtensionPublisherJSON {
  publisherName: string;
  displayName: string;
}

interface CatalogExtensionJSON {
  publisher: CatalogExtensionPublisherJSON;
  extensionName: string;
  displayName: string;
  versions: CatalogExtensionVersionJSON[];
}

interface CatalogExtensionVersionJSON {
  version: string;
  ociUri: string;
  preview: boolean;
}

interface CatalogJSON {
  extensions: CatalogExtensionJSON[];
}
