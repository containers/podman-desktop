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
import { tick } from 'svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { type CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { extensionInfos } from '/@/stores/extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import ExtensionDetails from './ExtensionDetails.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

async function waitRender(customProperties: object): Promise<void> {
  render(ExtensionDetails, { ...customProperties });
  await tick();
}

export const aFakeExtension: CatalogExtension = {
  id: 'idAInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short A',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'a-extension',
  displayName: 'A Extension',
  categories: [],
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

export const withSpacesFakeExtension: CatalogExtension = {
  id: 'id A Installed',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short A',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'a-extension',
  displayName: 'A Extension',
  categories: [],
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

const combined: CombinedExtensionInfoUI[] = [
  {
    id: 'idAInstalled',
    displayName: 'A installed Extension',
    name: 'A extension',
    removable: true,
    state: 'started',
  },
  {
    id: 'idYInstalled',
    displayName: 'Y installed Extension',
  },
] as unknown[] as CombinedExtensionInfoUI[];

const combinedWithError: CombinedExtensionInfoUI[] = [
  {
    id: 'idAInstalled',
    displayName: 'A failed installed Extension',
    name: 'A extension',
    removable: true,
    state: 'failed',
    error: {
      message: 'custom error',
      stack: 'custom stack',
    },
  },
] as unknown[] as CombinedExtensionInfoUI[];

test('Expect to have details page', async () => {
  const extensionId = 'idAInstalled';

  catalogExtensionInfos.set([aFakeExtension]);
  extensionInfos.set(combined);

  await waitRender({ extensionId });

  const heading = screen.getByRole('heading', { name: 'A installed Extension extension' });
  expect(heading).toBeInTheDocument();

  const extensionActions = screen.getByRole('group', { name: 'Extension Actions' });
  expect(extensionActions).toBeInTheDocument();

  const extensionBadge = screen.getByRole('region', { name: 'Extension Badge' });
  expect(extensionBadge).toBeInTheDocument();

  // no tabs as not failing state
  const readmeTab = screen.queryByRole('button', { name: 'Readme' });
  expect(readmeTab).not.toBeInTheDocument();
  const errorTab = screen.queryByRole('button', { name: 'Error' });
  expect(errorTab).not.toBeInTheDocument();
});

test('Expect to have details page with error tab with failed state', async () => {
  const extensionId = 'idAInstalled';

  catalogExtensionInfos.set([aFakeExtension]);
  extensionInfos.set(combinedWithError);

  await waitRender({ extensionId });

  // check that we have two tabs
  const readmeTab = screen.getByRole('button', { name: 'Readme' });
  expect(readmeTab).toBeInTheDocument();

  // check that we have two tabs
  const errorTab = screen.getByRole('button', { name: 'Error' });
  expect(errorTab).toBeInTheDocument();

  // click on the error tab
  await fireEvent.click(errorTab);

  // now check that the error is on the page
  // should contain the error
  const error = screen.getByText('Error: custom error');
  expect(error).toBeInTheDocument();
});

test('Expect empty screen', async () => {
  const extensionId = 'idUnknown';

  catalogExtensionInfos.set([aFakeExtension]);
  extensionInfos.set(combined);

  await waitRender({ extensionId });

  // should have the text "Extension not found"
  const extensionNotFound = screen.getByText('Extension not found');
  expect(extensionNotFound).toBeInTheDocument();
});

test('Expect to have details page with id with spaces', async () => {
  const extensionId = 'id A Installed';

  catalogExtensionInfos.set([withSpacesFakeExtension]);
  extensionInfos.set(combined);

  await waitRender({ extensionId });

  const heading = screen.getByRole('heading', { name: 'A Extension extension' });
  expect(heading).toBeInTheDocument();
});
