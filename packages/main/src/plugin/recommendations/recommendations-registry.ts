/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type { FeaturedExtension } from '@desktop-framework/api/featured';
import type {
  ExtensionBanner,
  RecommendedRegistry,
  RecommendedRegistryExtensionDetails,
} from '@desktop-framework/api/recommendations';
import { RecommendationsSettings } from '@desktop-framework/api/recommendations';
import { inject, injectable } from 'inversify';

import { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { Featured } from '/@/plugin/featured/featured.js';
import { rotateArray } from '/@/plugin/util/array-mutation.js';

// eslint-disable-next-line no-restricted-imports
import recommendations from '../../../../../recommendations.json' with { type: 'json' };

@injectable()
export class RecommendationsRegistry {
  constructor(
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(Featured)
    private featured: Featured,
    @inject(ExtensionLoader)
    private extensionLoader: ExtensionLoader,
    @inject(ExtensionsCatalog)
    private extensionsCatalog: ExtensionsCatalog,
  ) {}

  isBannerRecommendationEnabled(): boolean {
    const bannersIgnored = !this.configurationRegistry
      .getConfiguration(RecommendationsSettings.SectionName)
      .get<boolean>(RecommendationsSettings.IgnoreBannerRecommendations, false);
    const recommendationsIgnored = this.isRecommendationEnabled();
    return bannersIgnored && recommendationsIgnored;
  }

  isRecommendationEnabled(): boolean {
    return !this.configurationRegistry
      .getConfiguration(RecommendationsSettings.SectionName)
      .get<boolean>(RecommendationsSettings.IgnoreRecommendations, false);
  }

  async getRegistries(): Promise<RecommendedRegistry[]> {
    // Do not recommend any registry when user selected the ignore preference
    if (!this.isRecommendationEnabled()) {
      return [];
    }

    const installedExtensions = await this.extensionLoader.listExtensions();

    const fetchableExtensions = await this.extensionsCatalog.getFetchableExtensions();

    return recommendations.registries
      .map(registry => {
        const matchingExtension = fetchableExtensions.find(e => e.extensionId === registry.extensionId);
        let extensionDetails: RecommendedRegistryExtensionDetails | undefined;

        if (matchingExtension) {
          extensionDetails = {
            id: matchingExtension.extensionId,
            displayName: registry.extensionId,
            fetchable: true,
            fetchLink: matchingExtension.link,
            fetchVersion: matchingExtension.version,
          };
        }

        return {
          extensionId: registry.extensionId,
          id: registry.id,
          name: registry.name,
          errors: registry.errors,
          isInstalled: installedExtensions.some(e => e.id === registry.extensionId),
          extensionDetails,
        };
      })
      .filter(registry => registry.extensionDetails !== undefined) as RecommendedRegistry[];
  }

  /**
   * Return the recommended extension banners which are not installed.
   * @param limit the maximum number of extension banners returned. Default 1, use -1 for no limit
   */
  async getExtensionBanners(limit = 1): Promise<ExtensionBanner[]> {
    // Do not recommend any extension when user selected the ignore preference
    if (!this.isBannerRecommendationEnabled()) return [];

    const featuredExtensions: Record<string, FeaturedExtension> = Object.fromEntries(
      (await this.featured.getFeaturedExtensions()).map(featured => [featured.id, featured]),
    );

    // Filter and shuffle the extensions
    const extensionBanners: ExtensionBanner[] = recommendations.extensions.reduce((prev, extension) => {
      // ensure the extension is in the featured extensions and is not install
      if (!(extension.extensionId in featuredExtensions) || featuredExtensions[extension.extensionId]?.installed) {
        return prev;
      }

      // Check for publishDate property
      if ('publishDate' in extension && typeof extension.publishDate === 'string') {
        const publishDate = new Date(extension.publishDate).getTime();
        if (isNaN(publishDate) || publishDate > Date.now()) {
          return prev;
        }
      }

      const featured = featuredExtensions[extension.extensionId];
      if (featured) {
        prev.push({
          ...extension,
          featured,
        });
      }

      return prev;
    }, [] as ExtensionBanner[]);

    // Limit the number of
    if (limit >= 0 && extensionBanners.length > limit) {
      // instead of using random generator we ensure deterministic results for a period of time (here by the hours)
      const startingIndex = new Date().getHours() % extensionBanners.length;
      return rotateArray(extensionBanners, startingIndex).slice(0, limit);
    }
    return extensionBanners;
  }

  init(): void {
    const recommendationConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [`${RecommendationsSettings.SectionName}.${RecommendationsSettings.IgnoreRecommendations}`]: {
          description: 'When enabled, the notifications for extension recommendations will not be shown.',
          type: 'boolean',
          default: false,
          hidden: false,
        },
        [`${RecommendationsSettings.SectionName}.${RecommendationsSettings.IgnoreBannerRecommendations}`]: {
          description: 'When enabled, the notifications for extension recommendations banners will not be shown.',
          type: 'boolean',
          default: false,
          hidden: false,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([recommendationConfiguration]);
  }
}
