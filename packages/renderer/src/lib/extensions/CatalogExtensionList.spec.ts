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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtensionList from './CatalogExtensionList.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn() });
  Object.defineProperty(window, 'showMessageBox', { value: vi.fn() });
  Object.defineProperty(window, 'refreshCatalogExtensions', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
});

const extensionA: CatalogExtensionInfoUI = {
  id: 'myId1',
  displayName: 'This is the display name1',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description1',
};

const extensionB: CatalogExtensionInfoUI = {
  id: 'myId2',
  displayName: 'This is the display name2',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description2',
};
test('Check with empty', async () => {
  render(CatalogExtensionList, { catalogExtensions: [] });

  // no 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).not.toBeInTheDocument();

  // check we have the empty screen and the button to refresh the catalog
  const emptyScreen = screen.getByText('No extensions in the catalog');
  expect(emptyScreen).toBeInTheDocument();

  const refreshButton = screen.getByRole('button', { name: 'Refresh the catalog' });
  expect(refreshButton).toBeInTheDocument();

  // make the refresh throwing an error
  vi.mocked(window.refreshCatalogExtensions).mockRejectedValue(new Error('fake error'));

  // click on the button
  await fireEvent.click(refreshButton);

  // check the function was called
  expect(window.refreshCatalogExtensions).toHaveBeenCalled();

  // check error message is displayed
  expect(window.showMessageBox).toHaveBeenCalledWith({
    detail: 'Error: fake error',
    message: 'Failed to refresh the catalog',
    title: 'Error',
    type: 'error',
  });
});

test('Check with 2 extensions', async () => {
  render(CatalogExtensionList, { catalogExtensions: [extensionA, extensionB] });

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // get region role with text 'Catalog Extensions'
  const region = screen.getByRole('region', { name: 'Catalog Extensions' });
  expect(region).toBeInTheDocument();

  // get div using aria-label 'This is the display name1'
  const extensionWidgetA = screen.getByRole('group', { name: 'This is the display name1' });
  expect(extensionWidgetA).toBeInTheDocument();

  const extensionWidgetB = screen.getByRole('group', { name: 'This is the display name2' });
  expect(extensionWidgetB).toBeInTheDocument();

  // expect to see the refresh button
  const refreshButton = screen.getByRole('button', { name: 'Refresh the catalog' });
  expect(refreshButton).toBeInTheDocument();
});

test('non default title', async () => {
  render(CatalogExtensionList, { title: 'Another title', catalogExtensions: [extensionA, extensionB] });
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).not.toBeInTheDocument();

  const title = screen.queryByText('Another title');
  expect(title).toBeInTheDocument();
});

test('empty catalog, do not hide if empty (default)', async () => {
  render(CatalogExtensionList, { catalogExtensions: [] });

  const emptyMsg = screen.queryByText('No extensions in the catalog');
  expect(emptyMsg).toBeInTheDocument();
});

test('empty catalog, hide if empty', async () => {
  render(CatalogExtensionList, { showEmptyScreen: false, catalogExtensions: [] });

  const emptyMsg = screen.queryByText('No extensions in the catalog');
  expect(emptyMsg).not.toBeInTheDocument();
});
