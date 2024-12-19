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

import { render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import ExtensionBanner from '/@/lib/recommendation/ExtensionBanner.svelte';

import type { ExtensionBanner as IExtensionBanner } from '../../../../main/src/plugin/recommendations/recommendations-api';

const baseBanner: IExtensionBanner = {
  extensionId: 'extension.banner',
  featured: {
    description: 'featured.description',
    installed: false,
    icon: '',
    fetchable: true,
    id: 'extension.banner',
    displayName: 'featured.displayName',
    builtin: false,
    categories: [],
  },
  thumbnail: 'data:image/png;base64-thumbnail',
  title: 'title',
  description: 'description',
  icon: 'data:image/png;base64-icon',
};

const gradientBackground: IExtensionBanner = {
  ...baseBanner,
  background: {
    gradient: {
      start: '#fff',
      end: '#000',
    },
  },
};

const imageBackground: IExtensionBanner = {
  ...baseBanner,
  background: {
    light: 'data:image/png;base64-image-light',
    dark: 'data:image/png;base64-image-dark',
  },
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('banner icon should be visible', () => {
  render(ExtensionBanner, {
    banner: baseBanner,
    isDark: true,
  });

  const img = screen.getByAltText('banner icon');
  expect(img).toBeDefined();
  expect(img.attributes.getNamedItem('src')?.value).toBe('data:image/png;base64-icon');
});

test('thumbnail should be visible', () => {
  render(ExtensionBanner, {
    banner: baseBanner,
    isDark: true,
  });

  const img = screen.getByAltText('banner thumbnail');
  expect(img).toBeDefined();
  expect(img.attributes.getNamedItem('src')?.value).toBe('data:image/png;base64-thumbnail');
});

describe('backgrounds', () => {
  test('expect default gradient background', () => {
    render(ExtensionBanner, {
      banner: baseBanner,
      isDark: true,
    });

    const card = screen.getByLabelText('Recommended extension');
    expect(card).toBeDefined();
    expect(card.classList).toContain('bg-[var(--pd-modal-bg)]');
    expect(card.attributes.getNamedItem('style')?.value).toBeUndefined();
  });

  test('expect linear gradient background', async () => {
    render(ExtensionBanner, {
      banner: gradientBackground,
      isDark: true,
    });
    await tick();

    const card = screen.getByLabelText('Recommended extension');
    expect(card).toBeDefined();
    expect(card.attributes.getNamedItem('style')?.value).toBe('background: linear-gradient(#fff, #000);');
  });

  test('expect image background for dark theme', async () => {
    render(ExtensionBanner, {
      banner: imageBackground,
      isDark: true,
    });
    await tick();

    const card = screen.getByLabelText('Recommended extension');
    expect(card).toBeDefined();
    expect(card.attributes.getNamedItem('style')?.value).toBe(
      'background-image: url("data:image/png;base64-image-dark");',
    );
  });

  test('expect image background for light theme', async () => {
    render(ExtensionBanner, {
      banner: imageBackground,
      isDark: false,
    });
    await tick();

    const card = screen.getByLabelText('Recommended extension');
    expect(card).toBeDefined();
    expect(card.attributes.getNamedItem('style')?.value).toBe(
      'background-image: url("data:image/png;base64-image-light");',
    );
  });
});

test('opening messageBox and hiding banner', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 1 });

  render(ExtensionBanner, {
    banner: gradientBackground,
    isDark: true,
  });
  await tick();

  const card = screen.getByLabelText('Recommended extension');
  expect(card).toBeDefined();

  const closeButton = screen.getByLabelText('Close');
  closeButton.click();

  expect(window.showMessageBox).toBeCalledWith({
    title: 'Hide extension recommendation banners',
    message: `Do you want to hide extension recommendation banners?`,
    type: 'warning',
    buttons: [`No, keep them`, 'Yes, hide'],
  });

  await waitFor(() =>
    expect(window.telemetryTrack).toBeCalledWith('hideRecommendationExtensionBanner', {
      choice: 'hide',
    }),
  );
});

test('opening messageBox and keeping banner', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 0 });

  render(ExtensionBanner, {
    banner: gradientBackground,
    isDark: true,
  });
  await tick();

  const card = screen.getByLabelText('Recommended extension');
  expect(card).toBeDefined();

  const closeButton = screen.getByLabelText('Close');
  closeButton.click();

  expect(window.showMessageBox).toBeCalledWith({
    title: 'Hide extension recommendation banners',
    message: `Do you want to hide extension recommendation banners?`,
    type: 'warning',
    buttons: [`No, keep them`, 'Yes, hide'],
  });

  await waitFor(() =>
    expect(window.telemetryTrack).toBeCalledWith('hideRecommendationExtensionBanner', {
      choice: 'keep',
    }),
  );
});
