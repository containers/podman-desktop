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
import { beforeEach, expect, test, vi } from 'vitest';

import { type CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { extensionInfos } from '/@/stores/extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import ExtensionList from './ExtensionList.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

export const aFakeExtension: CatalogExtension = {
  id: 'idAInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short A',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'a-extension',
  displayName: 'A Extension',
  categories: [],
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
  categories: [],
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
    removable: true,
    state: 'started',
  },
] as unknown[] as CombinedExtensionInfoUI[];

test('Expect to see extensions', async () => {
  catalogExtensionInfos.set([aFakeExtension, bFakeExtension]);
  extensionInfos.set(combined);

  render(ExtensionList);

  const headingExtensions = screen.getByRole('heading', { name: 'extensions' });
  expect(headingExtensions).toBeInTheDocument();

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
