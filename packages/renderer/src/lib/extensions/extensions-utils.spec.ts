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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import { ExtensionsUtils } from './extensions-utils';

let extensionsUtils: ExtensionsUtils;

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
  id: 'idBNotInstalled',
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

export const unlistedFakeCatalogExtension: CatalogExtension = {
  id: 'idUnlisted',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short Unlisted',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'unlisted-extension',
  displayName: 'Unlisted Extension',
  categories: [],
  keywords: [],
  unlisted: true,

  versions: [
    {
      version: '1.0.0Unlisted',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconUnlisted',
        },
      ],
      ociUri: 'linkUnlisted',
      lastUpdated: new Date(),
    },
  ],
};

export const yFakeCatalogExtension: CatalogExtension = {
  id: 'idYInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short Y',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'y-extension',
  displayName: 'Y Extension',
  categories: [],
  keywords: [],
  unlisted: false,

  versions: [
    {
      version: '1.0.0Y',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconY',
        },
      ],
      ociUri: 'linkY',
      lastUpdated: new Date(),
    },
  ],
};

export const zFakeCatalogExtension: CatalogExtension = {
  id: 'idZNotInstalled',
  publisherName: 'FooPublisher',
  shortDescription: 'this is short Z',
  publisherDisplayName: 'Foo Publisher',
  extensionName: 'z-extension',
  displayName: 'Z Extension',
  categories: [],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '1.0.0Z',
      preview: false,
      files: [
        {
          assetType: 'icon',
          data: 'iconZ',
        },
      ],
      ociUri: 'linkZ',
      lastUpdated: new Date(),
    },
  ],
};

const catalogExtensions: CatalogExtension[] = [
  aFakeExtension,
  bFakeExtension,
  unlistedFakeCatalogExtension,
  yFakeCatalogExtension,
  zFakeCatalogExtension,
];

// y and z are featured
const featuredExtensions: FeaturedExtension[] = [
  {
    id: 'idYInstalled',
    fetchable: true,
  },
  {
    id: 'idZNotInstalled',
    fetchable: true,
  },
] as unknown[] as FeaturedExtension[];

// A and Y are installed
const installedExtensions: CombinedExtensionInfoUI[] = [
  {
    id: 'idAInstalled',
    displayName: 'A installed Extension',
    removable: true,
    error: {
      message: 'An error occurred',
      stack: 'line1\nline2',
    },
  },
  {
    id: 'idYInstalled',
    version: '2.0.0Y',
  },
] as unknown[] as CombinedExtensionInfoUI[];

beforeEach(() => {
  vi.resetAllMocks();
  extensionsUtils = new ExtensionsUtils();
});

describe('extractCatalogExtensions', () => {
  test('Expect first one should be featured even having a name starting with Y letter then Z extension, then A extension and then B extension', async () => {
    // get UI objects
    const catalogExtensionsUI = extensionsUtils.extractCatalogExtensions(
      catalogExtensions,
      featuredExtensions,
      installedExtensions,
    );

    // expect the first one to be featured named y
    // then Z extension, then A extension and then B extension
    expect(catalogExtensionsUI.length).toBe(4);
    expect(catalogExtensionsUI[0].id).toBe('idYInstalled');
    expect(catalogExtensionsUI[1].id).toBe('idZNotInstalled');
    expect(catalogExtensionsUI[2].id).toBe('idAInstalled');
    expect(catalogExtensionsUI[3].id).toBe('idBNotInstalled');

    // check attributes of a featured extension being installed
    const yExtensionUI = catalogExtensionsUI[0];
    expect(yExtensionUI.displayName).toBe('Y Extension');
    expect(yExtensionUI.isFeatured).toBe(true);
    expect(yExtensionUI.fetchLink).toBe('linkY');
    expect(yExtensionUI.fetchVersion).toBe('1.0.0Y');
    expect(yExtensionUI.fetchable).toBe(true);
    expect(yExtensionUI.iconHref).toBe('iconY');
    expect(yExtensionUI.publisherDisplayName).toBe('Foo Publisher');
    expect(yExtensionUI.isInstalled).toBe(true);
    expect(yExtensionUI.installedVersion).toBe('2.0.0Y');
    expect(yExtensionUI.shortDescription).toBe('this is short Y');

    // check attributes of a featured extension not being installed
    const zExtensionUI = catalogExtensionsUI[1];
    expect(zExtensionUI.displayName).toBe('Z Extension');
    expect(zExtensionUI.isFeatured).toBe(true);
    expect(zExtensionUI.fetchLink).toBe('linkZ');
    expect(zExtensionUI.fetchVersion).toBe('1.0.0Z');
    expect(zExtensionUI.fetchable).toBe(true);
    expect(zExtensionUI.iconHref).toBe('iconZ');
    expect(zExtensionUI.publisherDisplayName).toBe('Foo Publisher');
    expect(zExtensionUI.isInstalled).toBe(false);
    expect(zExtensionUI.shortDescription).toBe('this is short Z');

    // check attributes of a non featured extension being installed
    const aExtensionUI = catalogExtensionsUI[2];
    expect(aExtensionUI.displayName).toBe('A Extension');
    expect(aExtensionUI.isFeatured).toBe(false);
    expect(aExtensionUI.fetchLink).toBe('linkA');
    expect(aExtensionUI.fetchVersion).toBe('1.0.0A');
    expect(aExtensionUI.fetchable).toBe(true);
    expect(aExtensionUI.iconHref).toBe('iconA');
    expect(aExtensionUI.publisherDisplayName).toBe('Foo Publisher');
    expect(aExtensionUI.isInstalled).toBe(true);
    expect(aExtensionUI.shortDescription).toBe('this is short A');

    // check attributes of a non featured extension not being installed
    const bExtensionUI = catalogExtensionsUI[3];
    expect(bExtensionUI.displayName).toBe('B Extension');
    expect(bExtensionUI.isFeatured).toBe(false);
    expect(bExtensionUI.fetchLink).toBe('linkB');
    expect(bExtensionUI.fetchVersion).toBe('1.0.0B');
    expect(bExtensionUI.fetchable).toBe(true);
    expect(bExtensionUI.iconHref).toBe('iconB');
    expect(bExtensionUI.publisherDisplayName).toBe('Foo Publisher');
    expect(bExtensionUI.isInstalled).toBe(false);
    expect(bExtensionUI.shortDescription).toBe('this is short B');
  });
});

describe('extractExtensionDetail', () => {
  test('Check with extension M not being installed or in the catalog', async () => {
    const extensionDetail = extensionsUtils.extractExtensionDetail(
      catalogExtensions,
      installedExtensions,
      'idCNotKnown',
    );
    expect(extensionDetail).not.toBeDefined();
  });

  test('Check with extension A being installed (not featured)', async () => {
    const extensionDetail = extensionsUtils.extractExtensionDetail(
      catalogExtensions,
      installedExtensions,
      'idAInstalled',
    );
    expect(extensionDetail).toBeDefined();
    expect(extensionDetail?.id).toBe('idAInstalled');
    expect(extensionDetail?.displayName).toBe('A installed Extension');
    expect(extensionDetail?.publisherDisplayName).toBe('Foo Publisher');
    expect(extensionDetail?.version).toBe('v1.0.0A');
  });

  test('Check with extension Z not being installed (but featured)', async () => {
    const extensionDetail = extensionsUtils.extractExtensionDetail(
      catalogExtensions,
      installedExtensions,
      'idZNotInstalled',
    );
    expect(extensionDetail).toBeDefined();
    expect(extensionDetail?.id).toBe('idZNotInstalled');
    expect(extensionDetail?.displayName).toBe('Z Extension');
    expect(extensionDetail?.publisherDisplayName).toBe('Foo Publisher');
    expect(extensionDetail?.version).toBe('v1.0.0Z');
  });

  test('Check error is kept', async () => {
    const extensionDetail = extensionsUtils.extractExtensionDetail(
      catalogExtensions,
      installedExtensions,
      'idAInstalled',
    );
    expect(extensionDetail).toBeDefined();
    expect(extensionDetail?.error?.message).toBe('An error occurred');
    expect(extensionDetail?.error?.stack).toBe('line1\nline2');
  });
});
