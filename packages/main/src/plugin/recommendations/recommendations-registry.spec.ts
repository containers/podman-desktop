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
      published: '2021-01-01',
    })),
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

const fakeNow = new Date(2020, 1, 1);

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();

  vi.setSystemTime(fakeNow);

  recommendationsRegistry = new RecommendationsRegistry(configurationRegistryMock, featuredMock);
});

afterEach(() => {
  vi.useRealTimers();
});

test('should register a configuration', async () => {
  // register configuration
  recommendationsRegistry.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0][0][0];
  expect(configurationNode.id).toBe('preferences.extensions');
  expect(configurationNode.title).toBe('Extensions');
  expect(configurationNode.type).toBe('object');
  expect(configurationNode.properties).toBeDefined();
  expect(configurationNode.properties?.['extensions.ignoreRecommendations']).toBeDefined();
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].description).toBe(
    'When enabled, the notifications for extension recommendations will not be shown.',
  );
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].type).toBe('boolean');
  expect(configurationNode.properties?.['extensions.ignoreRecommendations'].default).toBeFalsy();
});

describe('isRecommendationEnabled', () => {
  test('recommendation ignore true', async () => {
    getRecommendationIgnored.mockReturnValue(true);

    expect(recommendationsRegistry.isRecommendationEnabled()).toBe(false);
  });

  test('recommendation ignore false', async () => {
    getRecommendationIgnored.mockReturnValue(false);

    expect(recommendationsRegistry.isRecommendationEnabled()).toBe(true);
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
    expect(extensions[0].featured).toStrictEqual(featured);
    expect(extensions[0].extensionId).toBe('dummy.id-0');
    expect(extensions[0].title).toBe('dummy title');
    expect(extensions[0].description).toBe('dummy description');
    expect(extensions[0].icon).toBe('data:image/png;base64-icon');
    expect(extensions[0].thumbnail).toBe('data:image/png;base64-thumbnail');

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

  test('published value anterior', async () => {
    vi.setSystemTime(new Date(2022, 1, 1));

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
});
