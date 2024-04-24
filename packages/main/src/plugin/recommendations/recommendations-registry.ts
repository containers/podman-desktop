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

import type { ConfigurationRegistry, IConfigurationNode } from '/@/plugin/configuration-registry.js';
import type { Featured } from '/@/plugin/featured/featured.js';
import type { FeaturedExtension } from '/@/plugin/featured/featured-api.js';
import type { ExtensionBanner } from '/@/plugin/recommendations/recommendations-api.js';

import { default as recommendations } from '../../../../../recommendations.json';
import { RecommendationsSettings } from './recommendations-settings.js';

export class RecommendationsRegistry {
  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private featured: Featured,
  ) {}

  isRecommendationEnabled(): boolean {
    return !this.configurationRegistry
      .getConfiguration(RecommendationsSettings.SectionName)
      .get<boolean>(RecommendationsSettings.IgnoreRecommendations, false);
  }

  /**
   * Return the recommended extension banners which are not installed.
   * @param limit the maximum number of extension banners returned. Default 1, use -1 for no limit
   */
  async getExtensionBanners(limit = 1): Promise<ExtensionBanner[]> {
    // Do not recommend any extension when user selected the ignore preference
    if (!this.isRecommendationEnabled()) return [];

    const featuredExtensions: Record<string, FeaturedExtension> = Object.fromEntries(
      (await this.featured.getFeaturedExtensions(-1)).map(featured => [featured.id, featured]),
    );

    // Filter and shuffle the extensions
    const extensionBanners: ExtensionBanner[] = recommendations.extensions
      .reduce((prev, extension) => {
        // ensure the extension is in the featured extensions and is not install
        if (!(extension.extensionId in featuredExtensions) || featuredExtensions[extension.extensionId].installed) {
          return prev;
        }

        // Check for publishDate property
        if ('publishDate' in extension && typeof extension.publishDate === 'string') {
          const publishDate = new Date(extension.publishDate).getTime();
          if (isNaN(publishDate) || publishDate > Date.now()) {
            return prev;
          }
        }

        prev.push({
          ...extension,
          featured: featuredExtensions[extension.extensionId],
        });

        return prev;
      }, [] as ExtensionBanner[])
      .toSorted(() => Math.random() - 0.5);

    // Limit the number of
    if (limit >= 0 && extensionBanners.length > limit) {
      return extensionBanners.toSpliced(limit);
    }
    return extensionBanners;
  }

  init(): void {
    const recommendationConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [RecommendationsSettings.SectionName + '.' + RecommendationsSettings.IgnoreRecommendations]: {
          description: 'When enabled, the notifications for extension recommendations will not be shown.',
          type: 'boolean',
          default: false,
          hidden: false,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([recommendationConfiguration]);
  }
}
