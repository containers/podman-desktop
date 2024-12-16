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

import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import ExtensionBanners from '/@/lib/recommendation/ExtensionBanners.svelte';
import { extensionBannerInfos } from '/@/stores/extensionBanners';

import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import type { ExtensionBanner } from '../../../../main/src/plugin/recommendations/recommendations-api';

const getExtensionBannersMock = vi.fn();

// fake the window.events object
beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(window, 'getExtensionBanners', { value: getExtensionBannersMock });
  Object.defineProperty(window, 'getConfigurationProperties', { value: vi.fn().mockResolvedValueOnce({}) });
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn().mockResolvedValue(undefined) });
  (window.events as unknown) = {
    receive: (_channel: string, func: () => void) => {
      func();
    },
  };
});

const waitForInitialization = async () => {
  // wait store are populated
  while (get(extensionBannerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};

test('multiple banners should be rendered', async () => {
  const banners: ExtensionBanner[] = Array.from({ length: 10 }, (_, i) => ({
    extensionId: `dummy.id-${i}`,
    title: `Title ${i}`,
    featured: {} as unknown as FeaturedExtension,
    description: 'dummy description',
    icon: 'data:image/png;base64-icon',
    thumbnail: 'data:image/png;base64-thumbnail',
  }));

  getExtensionBannersMock.mockResolvedValue(banners);

  // ask to update the featured Extensions store
  window.dispatchEvent(new CustomEvent('system-ready'));

  await waitForInitialization();

  render(ExtensionBanners);

  for (const banner of banners) {
    const text = screen.getByText(banner.title);
    expect(text).toBeDefined();
  }
});
