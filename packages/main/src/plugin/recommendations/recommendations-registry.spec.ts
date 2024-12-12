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

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { Featured } from '/@/plugin/featured/featured.js';
import type { FeaturedExtension } from '/@/plugin/featured/featured-api.js';
import type { ExtensionInfo } from '/@api/extension-info.js';

import type { ExtensionLoader } from '../extension-loader.js';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import type { CatalogFetchableExtension } from '../extensions-catalog/extensions-catalog-api.js';
import { RecommendationsRegistry } from './recommendations-registry.js';

let recommendationsRegistry: RecommendationsRegistry;

const registerConfigurationsMock = vi.fn();
const getRecommendationIgnored = vi.fn();

vi.mock('../../../../../recommendations.json', () => ({
  default: {
    extensions: Array.from({ length: 10 }, (_, i) => ({
      extensionId: `dummy.id-${i}`,
      title: 'dummy title',
      description: 'dummy description',
      icon: 'data:image/png;base64-icon',
      thumbnail: 'data:image/png;base64-thumbnail',
      publishDate: '2020-01-01',
    })),
    registries: [
      {
        id: 'my.registry.com',
        name: 'My Extension',
        extensionId: 'my.extensionId',
        errors: ['is denied'],
      },
    ],
  },
}));

const configurationRegistryMock = {
  registerConfigurations: registerConfigurationsMock,
  getConfiguration: () => ({
    get: getRecommendationIgnored,
  }),
} as unknown as ConfigurationRegistry;

const featuredMock = {
  getFeaturedExtensions: vi.fn(),
} as unknown as Featured;

const extensionLoaderMock = {
  listExtensions: vi.fn(),
} as unknown as ExtensionLoader;

const extensionsCatalogMock = {
  getFetchableExtensions: vi.fn(),
} as unknown as ExtensionsCatalog;

const fakeNow = new Date(2020, 1, 1);

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(fakeNow);

  recommendationsRegistry = new RecommendationsRegistry(
    configurationRegistryMock,
    featuredMock,
    extensionLoaderMock,
    extensionsCatalogMock,
  );
});

afterEach(() => {
  vi.useRealTimers();
});

test('should register a banner configuration', async () => {
  // register configuration
  recommendationsRegistry.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0]?.[0]?.[0];
  expect(configurationNode?.id).toBe('preferences.extensions');
  expect(configurationNode?.title).toBe('Extensions');
  expect(configurationNode?.type).toBe('object');
  expect(configurationNode?.properties).toBeDefined();
  expect(configurationNode?.properties?.['extensions.ignoreBannerRecommendations']).toBeDefined();
  expect(configurationNode?.properties?.['extensions.ignoreBannerRecommendations']?.description).toBe(
    'When enabled, the notifications for extension recommendations banners will not be shown.',
  );
  expect(configurationNode?.properties?.['extensions.ignoreBannerRecommendations']?.type).toBe('boolean');
  expect(configurationNode?.properties?.['extensions.ignoreBannerRecommendations']?.default).toBeFalsy();
});

test('should register a global configuration', async () => {
  // register configuration
  recommendationsRegistry.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0]?.[0]?.[0];
  expect(configurationNode?.id).toBe('preferences.extensions');
  expect(configurationNode?.title).toBe('Extensions');
  expect(configurationNode?.type).toBe('object');
  expect(configurationNode?.properties).toBeDefined();
  expect(configurationNode?.properties?.['extensions.ignoreRecommendations']).toBeDefined();
  expect(configurationNode?.properties?.['extensions.ignoreRecommendations']?.description).toBe(
    'When enabled, the notifications for extension recommendations will not be shown.',
  );
  expect(configurationNode?.properties?.['extensions.ignoreRecommendations']?.type).toBe('boolean');
  expect(configurationNode?.properties?.['extensions.ignoreRecommendations']?.default).toBeFalsy();
});

describe('isRecommendationEnabled', () => {
  test('recommendation ignore true', async () => {
    getRecommendationIgnored.mockReturnValue(true);

    expect(recommendationsRegistry.isBannerRecommendationEnabled()).toBe(false);
  });

  test('recommendation ignore false', async () => {
    getRecommendationIgnored.mockReturnValue(false);

    expect(recommendationsRegistry.isBannerRecommendationEnabled()).toBe(true);
  });
});

describe('getExtensionBanners', () => {
  test('recommendation disabled', async () => {
    getRecommendationIgnored.mockReturnValue(true);

    const extensions = await recommendationsRegistry.getExtensionBanners();
    expect(extensions.length).toBe(0);

    expect(featuredMock.getFeaturedExtensions).not.toHaveBeenCalled();
  });

  test('installed extension from featured', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue([
      {
        id: 'dummy.id',
        builtin: false,
        description: '',
        categories: [],
        displayName: '',
        fetchable: false,
        icon: '',
        installed: true, // installed extension are ignored
      },
    ]);

    const extensions = await recommendationsRegistry.getExtensionBanners();
    expect(extensions.length).toBe(0);

    expect(featuredMock.getFeaturedExtensions).toHaveBeenCalled();
  });

  test('not-installed extension from featured', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    const featured: FeaturedExtension = {
      id: 'dummy.id-0',
      builtin: false,
      description: '',
      categories: [],
      displayName: '',
      fetchable: false,
      icon: '',
      installed: false,
    };
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue([featured]);

    const extensions = await recommendationsRegistry.getExtensionBanners();
    expect(extensions.length).toBe(1);
    expect(extensions[0]?.featured).toStrictEqual(featured);
    expect(extensions[0]?.extensionId).toBe('dummy.id-0');
    expect(extensions[0]?.title).toBe('dummy title');
    expect(extensions[0]?.description).toBe('dummy description');
    expect(extensions[0]?.icon).toBe('data:image/png;base64-icon');
    expect(extensions[0]?.thumbnail).toBe('data:image/png;base64-thumbnail');

    expect(featuredMock.getFeaturedExtensions).toHaveBeenCalled();
  });

  test('default should limit to 1 item', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: `dummy.id-${i}`,
        builtin: false,
        description: '',
        categories: [],
        displayName: '',
        fetchable: false,
        icon: '',
        installed: false,
      })),
    );

    const extensions = await recommendationsRegistry.getExtensionBanners();
    expect(extensions.length).toBe(1);

    expect(featuredMock.getFeaturedExtensions).toHaveBeenCalled();
  });

  test('no limit to the maximum number returned', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: `dummy.id-${i}`,
        builtin: false,
        description: '',
        categories: [],
        displayName: '',
        fetchable: false,
        icon: '',
        installed: false,
      })),
    );

    const extensions = await recommendationsRegistry.getExtensionBanners(-1);
    expect(extensions.length).toBe(10);

    expect(featuredMock.getFeaturedExtensions).toHaveBeenCalled();
  });

  test('publishDate value anterior', async () => {
    vi.setSystemTime(new Date(2019, 1, 1));

    getRecommendationIgnored.mockReturnValue(false);
    const featured: FeaturedExtension = {
      id: 'dummy.id-0',
      builtin: false,
      description: '',
      categories: [],
      displayName: '',
      fetchable: false,
      icon: '',
      installed: false,
    };
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue([featured]);

    const extensions = await recommendationsRegistry.getExtensionBanners();
    expect(extensions.length).toBe(0);

    expect(featuredMock.getFeaturedExtensions).toHaveBeenCalled();
  });

  test('same time should return same arrays', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: `dummy.id-${i}`,
        builtin: false,
        description: '',
        categories: [],
        displayName: '',
        fetchable: false,
        icon: '',
        installed: false,
      })),
    );

    vi.setSystemTime(new Date(2050, 1, 1, 1));
    const base = await recommendationsRegistry.getExtensionBanners(5);

    for (let i = 0; i < 10; i++) {
      expect(base).toStrictEqual(await recommendationsRegistry.getExtensionBanners(5));
    }
  });

  test('different hours should return different arrays', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => ({
        id: `dummy.id-${i}`,
        builtin: false,
        description: '',
        categories: [],
        displayName: '',
        fetchable: false,
        icon: '',
        installed: false,
      })),
    );

    vi.setSystemTime(new Date(2050, 1, 1, 1));
    const resultA = await recommendationsRegistry.getExtensionBanners(5);
    expect(resultA.length).toBe(5);

    vi.setSystemTime(new Date(2050, 1, 1, 2));
    const resultB = await recommendationsRegistry.getExtensionBanners(5);
    expect(resultB.length).toBe(5);

    expect(resultA).not.toStrictEqual(resultB);
  });

  test('all elements should have been shown in one day', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    const featured = Array.from({ length: 10 }, (_, i) => ({
      id: `dummy.id-${i}`,
      builtin: false,
      description: '',
      categories: [],
      displayName: '',
      fetchable: false,
      icon: '',
      installed: false,
    }));
    vi.mocked(featuredMock.getFeaturedExtensions).mockResolvedValue(featured);

    const expectedIds: Set<string> = new Set(featured.map(item => item.id));

    const actualsIds: Set<string> = new Set();

    for (let h = 0; h < 24; h++) {
      vi.setSystemTime(new Date(2050, 1, 1, h));

      const banners = await recommendationsRegistry.getExtensionBanners(1);
      expect(banners.length).toBe(1);

      const actualExtensionId = banners[0]?.extensionId;
      expect(actualExtensionId).toBeDefined();
      const actualExtensionIdString = actualExtensionId as string;
      actualsIds.add(actualExtensionIdString);
    }

    expect(expectedIds).toStrictEqual(actualsIds);
  });
});

describe('getRegistries', () => {
  test('recommendation disabled', async () => {
    getRecommendationIgnored.mockReturnValue(true);

    const registries = await recommendationsRegistry.getRegistries();
    expect(registries.length).toBe(0);

    expect(vi.mocked(extensionLoaderMock).listExtensions).not.toHaveBeenCalled();
    expect(vi.mocked(extensionsCatalogMock).getFetchableExtensions).not.toHaveBeenCalled();
  });

  test('matching registry', async () => {
    getRecommendationIgnored.mockReturnValue(false);
    vi.mocked(extensionLoaderMock.listExtensions).mockResolvedValue([
      {
        id: 'my.extensionId',
      } as unknown as ExtensionInfo,
    ]);

    vi.mocked(extensionsCatalogMock.getFetchableExtensions).mockResolvedValue([
      {
        extensionId: 'my.extensionId',
        link: 'my-link',
        version: '1.0.0',
      } as unknown as CatalogFetchableExtension,
    ]);

    const registries = await recommendationsRegistry.getRegistries();
    expect(registries.length).toBe(1);
    if (!registries[0]) {
      throw new Error('registry is undefined');
    }
    expect(registries[0].extensionId).toBe('my.extensionId');

    expect(vi.mocked(extensionLoaderMock).listExtensions).toHaveBeenCalled();
    expect(vi.mocked(extensionsCatalogMock).getFetchableExtensions).toHaveBeenCalled();
  });
});
