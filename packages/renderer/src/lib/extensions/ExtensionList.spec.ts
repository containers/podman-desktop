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

import type { CatalogExtension } from '@desktop-framework/api/extension-catalog';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { type CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { extensionInfos } from '/@/stores/extensions';

import ExtensionList from './ExtensionList.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
});

export const aFakeExtension: CatalogExtension = {
  id: 'idAInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short A. The word bar appears here but not in the title',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'a-extension',
  displayName: 'A Extension',
  categories: ['foo'],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '1.0.0A',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconA',
        },
      ],
      ociUri: 'linkA',
      lastUpdated: new Date(),
    },
  ],
};

export const bFakeExtension: CatalogExtension = {
  id: 'idB',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short B',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'b-extension',
  displayName: 'B Extension',
  categories: ['foo'],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '1.0.0B',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconB',
        },
      ],
      ociUri: 'linkB',
      lastUpdated: new Date(),
    },
  ],
};

const combined: CombinedExtensionInfoUI[] = [
  {
    id: 'idAInstalled',
    displayName: 'A installed Extension',
    description: 'The word bar appears here but not in the title',
    removable: true,
    state: 'started',
  },
] as unknown[] as CombinedExtensionInfoUI[];

test('Expect to see extensions', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set(combined);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(screen.getByRole('heading', { name: 'extensions' })).toBeInTheDocument();
  });

  // get first extension
  const myExtension1 = screen.getByRole('region', { name: 'idAInstalled' });
  expect(myExtension1).toBeInTheDocument();

  // second extension should not be there as only in catalog (not installed)
  const extensionIdB = screen.queryByRole('group', { name: 'B Extension' });
  expect(extensionIdB).not.toBeInTheDocument();

  // click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  // now the catalog extension should be there
  const extensionIdBAfterSwitch = screen.getByRole('group', { name: 'B Extension' });
  expect(extensionIdBAfterSwitch).toBeInTheDocument();
});

test('Expect to see empty screen on extension page only', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([aFakeExtension]);
  extensionInfos.set([]);

  render(ExtensionList, { searchTerm: 'A' });

  await vi.waitFor(() => {
    expect(screen.getByText(`No extensions matching 'A' found`)).toBeInTheDocument();
  });

  // click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  const title = screen.queryByText(`No extensions matching 'A' found`);
  expect(title).not.toBeInTheDocument();
});

test('Expect to see empty screen on catalog page only', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([]);
  extensionInfos.set(combined);

  render(ExtensionList, { searchTerm: 'A' });

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Catalog' })).toBeInTheDocument();
  });

  let title = screen.queryByText(`No extensions matching 'A' found`);
  expect(title).not.toBeInTheDocument();

  // click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  title = screen.queryByText(`No extensions matching 'A' found`);
  expect(title).toBeInTheDocument();
});

test('Expect to see empty screens on both pages', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  render(ExtensionList, { searchTerm: 'foo' });

  await vi.waitFor(() => {
    expect(screen.getByText(`No extensions matching 'foo' found`)).toBeInTheDocument();
  });

  // click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  const title = screen.getByText(`No extensions matching 'foo' found`);
  expect(title).toBeInTheDocument();
});

test('Search extension page searches also description', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([aFakeExtension]);
  extensionInfos.set(combined);

  render(ExtensionList, { searchTerm: 'bar' });

  await vi.waitFor(() => {
    expect(screen.getByRole('region', { name: 'idAInstalled' })).toBeInTheDocument();
  });

  // second extension should not be there as only in catalog (not installed) and doesn't have "bar" in the description
  const extensionIdB = screen.queryByRole('group', { name: 'B Extension' });
  expect(extensionIdB).not.toBeInTheDocument();

  cleanup();

  // Change the search
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  render(ExtensionList, { searchTerm: 'foo' });

  await vi.waitFor(() => {
    expect(window.getConfigurationValue).toHaveBeenCalled();
  });

  // The extension should not be there as it doesn't have "foo" in the description
  const myExtension2 = screen.queryByRole('region', { name: 'idAInstalled' });
  expect(myExtension2).not.toBeInTheDocument();
});

test('Search catalog page searches also description', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set([]);

  render(ExtensionList, { searchTerm: 'bar' });

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Catalog' })).toBeInTheDocument();
  });

  // Click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  // Verify that the extension containing "bar" in the description is displayed
  const myExtension1 = screen.getByRole('group', { name: 'A Extension' });
  expect(myExtension1).toBeInTheDocument();

  // Verify that the other extension that doesn't contain "bar" is not displayed
  const extensionIdB = screen.queryByRole('group', { name: 'B Extension' });
  expect(extensionIdB).not.toBeInTheDocument();
});

test('Expect to see local extensions tab content', async () => {
  vi.mocked(window.getConfigurationValue).mockImplementation(async (key: string) => {
    // Return true for local extensions and catalog enabled
    return key === 'extensions.localExtensions.enabled' || key === 'extensions.catalog.enabled';
  });
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Local extensions' })).toBeInTheDocument();
  });

  // select the local extensions tab
  const localModeTab = screen.getByRole('button', { name: 'Local extensions' });
  await fireEvent.click(localModeTab);

  // expect to see empty screen
  const emptyText = screen.getByText('Enable Preferences > Extensions > Development Mode to test local extensions');
  expect(emptyText).toBeInTheDocument();
});

test('Switching tabs keeps only terms in search term', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set([]);

  render(ExtensionList, { searchTerm: 'bar category:bar not:installed' });

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Catalog' })).toBeInTheDocument();
  });

  // Click on the catalog
  const catalogTab = screen.getByRole('button', { name: 'Catalog' });
  await fireEvent.click(catalogTab);

  // Verify that the extension containing "bar" in the description is displayed (which is not in bar category and is installed)
  // meaning that `category:bar not:installed` has been removed from search term
  const myExtension1 = screen.getByRole('group', { name: 'A Extension' });
  expect(myExtension1).toBeInTheDocument();
});

test('Expect install custom button is visible', async () => {
  render(ExtensionList);

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Install custom' })).toBeInTheDocument();
  });
});

test('Expect install custom button to not be visible if extensions.customExtensions.enabled is false', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(window.getConfigurationValue).toHaveBeenCalled();
  });

  const installCustomButton = screen.queryByRole('button', { name: 'Install custom' });
  expect(installCustomButton).not.toBeInTheDocument();
});

test('Expect local extensions tab is visible', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(screen.getByRole('button', { name: 'Local extensions' })).toBeInTheDocument();
  });
});

test('Expect local extensions tab to not be visible if extensions.localExtensions.enabled is false', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(window.getConfigurationValue).toHaveBeenCalled();
  });

  const localExtensionsTab = screen.queryByRole('button', { name: 'Local extensions' });
  expect(localExtensionsTab).not.toBeInTheDocument();
});

test('Expect catalog tab is visible', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  render(ExtensionList);

  await vi.waitFor(() => {
    const catalogTab = screen.getByRole('button', { name: 'Catalog' });
    expect(catalogTab).toBeInTheDocument();
  });
});

test('Expect catalog tab to not be visible if extensions.catalog.enabled is false', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  catalogExtensionInfos.set([]);
  extensionInfos.set([]);

  render(ExtensionList);

  await vi.waitFor(() => {
    expect(screen.queryByRole('button', { name: 'Catalog' })).not.toBeInTheDocument();
  });
});
