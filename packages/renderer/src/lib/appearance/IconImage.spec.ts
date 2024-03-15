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

/* eslint-disable no-null/no-null */
import '@testing-library/jest-dom/vitest';

import { render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import IconImage from './IconImage.svelte';

const getConfigurationValueMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

test('Expect valid source and alt text with dark mode', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

  const image = render(IconImage, { image: { light: 'light.png', dark: 'dark.png' }, alt: 'this is alt text' });

  // wait for image to be loaded
  await new Promise(resolve => setTimeout(resolve, 200));

  // grab image element
  const imageElement = image.getByRole('img');

  // expect to have valid source
  expect(imageElement).toHaveAttribute('src', 'dark.png');
  expect(imageElement).toHaveAttribute('alt', 'this is alt text');
});

test('Expect valid source and alt text with light mode', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  const image = render(IconImage, { image: { light: 'light.png', dark: 'dark.png' }, alt: 'this is alt text' });

  // wait for image to be loaded
  await new Promise(resolve => setTimeout(resolve, 200));

  // grab image element
  const imageElement = image.getByRole('img');

  // expect to have valid source
  expect(imageElement).toHaveAttribute('src', 'light.png');
  expect(imageElement).toHaveAttribute('alt', 'this is alt text');
});

test('Expect no alt attribute if missing and default image', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  const image = render(IconImage, { image: 'image.png' });

  // wait for image to be loaded
  await new Promise(resolve => setTimeout(resolve, 200));

  // grab image element
  const imageElement = image.getByRole('img');

  // expect to have valid source
  expect(imageElement).toHaveAttribute('src', 'image.png');

  // alt should be missing
  expect(imageElement).not.toHaveAttribute('alt');
});
