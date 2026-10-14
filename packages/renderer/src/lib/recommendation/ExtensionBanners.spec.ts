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

import type { ProviderInfo } from '@desktop-framework/api';
import type { FeaturedExtension } from '@desktop-framework/api/featured';
import type { ExtensionBanner } from '@desktop-framework/api/recommendations';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ExtensionBanners from '/@/lib/recommendation/ExtensionBanners.svelte';
import { extensionBannerInfos } from '/@/stores/extensionBanners';
import { providerInfos } from '/@/stores/providers';

test('multiple banners should be rendered', async () => {
  const banners: ExtensionBanner[] = Array.from({ length: 10 }, (_, i) => ({
    extensionId: `dummy.id-${i}`,
    title: `Title ${i}`,
    featured: {} as unknown as FeaturedExtension,
    description: 'dummy description',
    icon: 'data:image/png;base64-icon',
    thumbnail: 'data:image/png;base64-thumbnail',
  }));

  extensionBannerInfos.set(banners);

  render(ExtensionBanners);

  for (const banner of banners) {
    const text = screen.getByText(banner.title);
    expect(text).toBeDefined();
  }
});

test('only banners with when condition evaluated to true should be rendered', async () => {
  const banner1 = {
    extensionId: `dummy.id-when-visible-1`,
    title: 'Visible',
    featured: {} as unknown as FeaturedExtension,
    description: 'dummy description',
    icon: 'data:image/png;base64-icon',
    thumbnail: 'data:image/png;base64-thumbnail',
    when: `provider.podman.status === 'ready'`,
  };

  const banner2 = {
    extensionId: `dummy.id-when-invisible-1`,
    title: 'Invisible',
    featured: {} as unknown as FeaturedExtension,
    description: 'dummy description',
    icon: 'data:image/png;base64-icon',
    thumbnail: 'data:image/png;base64-thumbnail',
    when: `provider.kubectl.status === 'ready'`,
  };

  const providerInfo = {
    internalId: '0',
    id: 'podman',
    status: 'ready',
  };

  providerInfos.set([providerInfo as unknown as ProviderInfo]);
  extensionBannerInfos.set([banner1, banner2]);

  render(ExtensionBanners);

  expect(screen.getByText(banner1.title)).toBeDefined();
  expect(screen.queryByText(banner2.title)).toBeNull();
});
