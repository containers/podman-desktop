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

import type { ExtensionLoader } from '/@/plugin/extension-loader.js';
import type { FeaturedExtension } from '/@/plugin/featured/featured-api.js';

import { featured as featuredJSONFile } from '../../../../../featured.json';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import type { CatalogFetchableExtension } from '../extensions-catalog/extensions-catalog-api.js';

/**
 * Manages the Featured extensions
 */
export class Featured {
  private fetchableExtensions: CatalogFetchableExtension[] = [];

  constructor(
    private extensionLoader: ExtensionLoader,
    private extensionsCatalog: ExtensionsCatalog,
  ) {}

  async init(): Promise<void> {
    this.fetchableExtensions = await this.extensionsCatalog.getFetchableExtensions();
  }

  // Get content of the file using the import field/resolveJsonModule
  readFeaturedJson(): FeaturedExtensionJSON[] {
    return featuredJSONFile as FeaturedExtensionJSON[];
  }

  /**
   * Return the list of featured extensions
   * and check if they are installed/available/etc
   */
  async getFeaturedExtensions(): Promise<FeaturedExtension[]> {
    const extensionsToCheck = this.readFeaturedJson();

    // get the list of all the installed extensions
    const extensionInfos = await this.extensionLoader.listExtensions();

    // now we can check if the extension is installed or not
    const featuredExtensions: FeaturedExtension[] = extensionsToCheck.map(extensionToCheck => {
      const featuredExtension: FeaturedExtension = {
        builtin: false,
        id: extensionToCheck.extensionId,
        displayName: extensionToCheck.displayName,
        description: extensionToCheck.shortDescription,
        icon: extensionToCheck.icon,
        fetchable: false,
        installed: false,
        categories: extensionToCheck.categories,
      };

      // check if the extension is installed
      const extensionInfo = extensionInfos.find(extensionInfo => extensionInfo.id === extensionToCheck.extensionId);
      if (extensionInfo) {
        // found it so we can flag them as installed/fetched
        featuredExtension.installed = true;
        featuredExtension.fetchable = true;
        featuredExtension.builtin = extensionInfo.removable === false;
      } else {
        // it is not installed
        featuredExtension.installed = false;
        // not found, do we have it in the list of fetchable extensions?
        const fetchableExtension = this.fetchableExtensions.find(
          fetchableExtension => fetchableExtension.extensionId === extensionToCheck.extensionId,
        );
        if (fetchableExtension) {
          // yes, it is fetchable
          featuredExtension.fetchable = true;
          featuredExtension.fetchLink = fetchableExtension.link;
          featuredExtension.fetchVersion = fetchableExtension.version;
        }
      }
      return featuredExtension;
    });

    // now, randomize the list to have only 6 items and list first the non installed extensions and then the installed one
    // shuffle the list of featured extensions
    featuredExtensions.sort(() => Math.random() - 0.5);

    // take only 6 of them
    if (featuredExtensions.length > 6) {
      featuredExtensions.splice(6);
    }

    // and then by non installed first
    featuredExtensions.sort((b, a) => Number(b.installed) - Number(a.installed));

    return featuredExtensions;
  }
}

// format of the featured.json file
interface FeaturedExtensionJSON {
  extensionId: string;
  displayName: string;
  shortDescription: string;
  categories: string[];
  builtIn: boolean;
  icon: string;
}
