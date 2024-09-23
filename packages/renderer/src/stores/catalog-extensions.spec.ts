/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { CatalogExtension } from '../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import {
  catalogExtensionEventStore,
  catalogExtensionEventStoreInfo,
  catalogExtensionInfos,
} from './catalog-extensions';

// first, patch window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const getCatalogExtensionsMock: Mock<() => Promise<CatalogExtension[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    getCatalogExtensions: getCatalogExtensionsMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
  catalogExtensionEventStore.setup();
});

test('catalog extension should be updated in case of a container is removed', async () => {
  // initial catalog is empty
  getCatalogExtensionsMock.mockResolvedValue([]);

  // get list and expect nothing there
  const catalogExtensions = get(catalogExtensionInfos);
  expect(catalogExtensions.length).toBe(0);

  getCatalogExtensionsMock.mockReset();
  getCatalogExtensionsMock.mockResolvedValue([
    {
      id: 'first.extension1',
      displayName: 'test1',
      publisherName: 'Foo publisher',
      extensionName: 'extension',
      shortDescription: 'short description',
      publisherDisplayName: 'Foo publisher display name',
      unlisted: false,
      categories: [],
      keywords: [],
      versions: [
        {
          version: '1.0.0',
          ociUri: 'oci://test1',
          preview: false,
          files: [],
          lastUpdated: new Date(),
        },
      ],
    },
    {
      id: 'second.extension2',
      displayName: 'test2',
      publisherName: 'Foo publisher',
      extensionName: 'extension2',
      shortDescription: 'short description',
      publisherDisplayName: 'Foo publisher display name',
      categories: [],
      keywords: [],
      unlisted: true,
      versions: [
        {
          version: '2.0.0',
          ociUri: 'oci://test2',
          preview: false,
          files: [],
          lastUpdated: new Date(),
        },
      ],
    },
  ]);

  const callback = callbacks.get('system-ready');
  // send 'system-ready' event
  expect(callback).toBeDefined();
  await callback();

  // check that getCatalogExtensionsMock is called
  expect(getCatalogExtensionsMock).toBeCalled();

  // fetch manually
  await catalogExtensionEventStoreInfo.fetch();

  // check if the catalog has been updated
  const afterCatalogExtensions = get(catalogExtensionInfos);
  expect(afterCatalogExtensions.length).toBe(2);

  // get first extension
  const firstExtension = afterCatalogExtensions.find(ext => ext.id === 'first.extension1');
  expect(firstExtension).toBeDefined();
  expect(firstExtension?.unlisted).toBeFalsy();

  // get second extension
  const secondExtension = afterCatalogExtensions.find(ext => ext.id === 'second.extension2');
  expect(secondExtension).toBeDefined();
  expect(secondExtension?.unlisted).toBeTruthy();
});

test('catalog extension should be updated in refresh event is published', async () => {
  // initial catalog is empty
  getCatalogExtensionsMock.mockResolvedValue([]);
  getCatalogExtensionsMock.mockReset();

  const callback = callbacks.get('refresh-catalog');
  // send 'refresh-catalog' event
  expect(callback).toBeDefined();
  await callback();

  // check that getCatalogExtensionsMock is called
  expect(getCatalogExtensionsMock).toBeCalled();
});
