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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtension from './CatalogExtension.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).extensionInstallFromImage = vi.fn();
});

test('Expect to have more details working', async () => {
  const catalogExtensionUI: CatalogExtensionInfoUI = {
    id: 'myId',
    displayName: 'This is the display name',
    isFeatured: false,
    fetchable: false,
    fetchLink: '',
    fetchVersion: '',
    publisherDisplayName: 'Foo publisher',
    isInstalled: false,
    shortDescription: 'my description',
  };

  render(CatalogExtension, { catalogExtensionUI });

  // get div using aria-label 'This is the display name'
  const extensionWidget = screen.getByRole('group', { name: 'This is the display name' });

  expect(extensionWidget).toBeInTheDocument();

  // check publisher display name is inside
  const publisher = screen.getByText('Foo publisher');
  expect(publisher).toBeInTheDocument();

  // get more details button
  const detailsButton = screen.getByRole('button', { name: 'This is the display name details' });
  expect(detailsButton).toBeInTheDocument();

  // click the button
  await fireEvent.click(detailsButton);

  // expect the router to be called
  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/extensions/details/myId/');
});

test('Expect to see featured and fetch button', async () => {
  const catalogExtensionUI: CatalogExtensionInfoUI = {
    id: 'myId',
    displayName: 'This is the display name',
    isFeatured: true,
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: '',
    publisherDisplayName: 'Foo publisher',
    isInstalled: false,
    shortDescription: 'my description',
  };

  render(CatalogExtension, { catalogExtensionUI });

  // get div using aria-label 'This is the display name'
  const extensionWidget = screen.getByRole('group', { name: 'This is the display name' });

  expect(extensionWidget).toBeInTheDocument();

  // check featured is inside
  const featured = screen.getByText('Featured');
  expect(featured).toBeInTheDocument();

  // get install button
  const installButton = screen.getByRole('button', { name: 'Install myId Extension' });
  expect(installButton).toBeInTheDocument();

  // click the button
  await fireEvent.click(installButton);

  // expect the router to be called
  expect(vi.mocked(window.extensionInstallFromImage)).toHaveBeenCalledWith(
    'myLink',
    expect.any(Function),
    expect.any(Function),
  );
});

test('Expect to have version of installed one', async () => {
  const catalogExtensionUI: CatalogExtensionInfoUI = {
    id: 'myId',
    displayName: 'This is the display name',
    isFeatured: false,
    fetchable: false,
    fetchLink: '',
    fetchVersion: '1.0.0',
    installedVersion: '2.0.0',
    publisherDisplayName: 'Foo publisher',
    isInstalled: true,
    shortDescription: 'my description',
  };

  render(CatalogExtension, { catalogExtensionUI });

  // check catalog version is displayed
  const catalogVersion = screen.getByText('v1.0.0');
  expect(catalogVersion).toBeInTheDocument();

  // check if installed version is displayed
  const installedVersion = screen.getByText('(installed: v2.0.0)');
  expect(installedVersion).toBeInTheDocument();
});
