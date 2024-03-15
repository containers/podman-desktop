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

import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionLoader } from '../extension-loader.js';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import { Featured } from './featured.js';

let featured: Featured;

const listExtensionsMock = vi.fn();

const extensionLoader: ExtensionLoader = {
  listExtensions: listExtensionsMock,
} as unknown as ExtensionLoader;

const getFetchableExtensionsMock = vi.fn();
const extensionsCatalog: ExtensionsCatalog = {
  getFetchableExtensions: getFetchableExtensionsMock,
} as unknown as ExtensionsCatalog;

beforeAll(async () => {
  featured = new Featured(extensionLoader, extensionsCatalog);
});

const originalConsoleError = console.error;
beforeEach(() => {
  vi.clearAllMocks();
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('init should call init on certificates', async () => {
  getFetchableExtensionsMock.mockResolvedValue([]);
  await featured.init();
  expect(getFetchableExtensionsMock).toBeCalled();
});

test('readFeaturedJson should be valid', async () => {
  const extensionsJson = featured.readFeaturedJson();
  expect(extensionsJson).toBeDefined();
  expect(extensionsJson.length).toBeGreaterThan(3);
});

test('getFeaturedExtensions should check installable extensions', async () => {
  // mock the set of featured JSON extensions
  const spyReadJson = vi.spyOn(featured, 'readFeaturedJson');
  spyReadJson.mockReturnValue([
    {
      extensionId: 'podman-desktop.podman',
      displayName: 'Podman',
      shortDescription: 'A daemonless container engine for developing, managing OCI containers and pods.',
      categories: ['Container Engine'],
      builtIn: true,
      icon: 'data:image/png;base64,123',
    },
    {
      extensionId: 'crc-team.openshift-local',
      displayName: 'OpenShift Local',
      shortDescription: 'Run a local Red Hat OpenShift environment on your machine',
      categories: ['Kubernetes'],
      builtIn: false,
      icon: 'data:image/png;base64,456',
    },
  ]);

  // make podman extension as installed
  listExtensionsMock.mockReturnValue([
    {
      publisher: 'podman-desktop',
      id: 'podman-desktop.podman',
      // make it a built-in extension (cannot be removed, just disabled)
      removable: false,
    },
  ]);

  //make CRC extension being available to download
  const ociLink = 'oci-registry.foo/path-to/crc-extension';
  getFetchableExtensionsMock.mockResolvedValue([{ extensionId: 'crc-team.openshift-local', link: ociLink }]);

  // init fetchable extensions
  await featured.init();
  const featuredExtensions = await featured.getFeaturedExtensions();
  expect(featuredExtensions).toBeDefined();
  expect(featuredExtensions.length).toBe(2);

  // check data
  const podmanExtension = featuredExtensions.find(e => e.id === 'podman-desktop.podman');
  expect(podmanExtension).toBeDefined();
  expect(podmanExtension?.installed).toBe(true);
  expect(podmanExtension?.displayName).toBe('Podman');
  expect(podmanExtension?.categories).toStrictEqual(['Container Engine']);
  expect(podmanExtension?.icon).toBe('data:image/png;base64,123');

  const crcExtension = featuredExtensions.find(e => e.id === 'crc-team.openshift-local');
  expect(crcExtension).toBeDefined();
  // not installed
  expect(crcExtension?.installed).toBe(false);
  expect(crcExtension?.displayName).toBe('OpenShift Local');
  expect(crcExtension?.categories).toStrictEqual(['Kubernetes']);
  expect(crcExtension?.icon).toBe('data:image/png;base64,456');
  expect(crcExtension?.fetchLink).toBe(ociLink);
});

test('getFeaturedExtensions should shuffle and limit to 6 extensions', async () => {
  // mock the set of featured JSON extensions
  const spyReadJson = vi.spyOn(featured, 'readFeaturedJson');

  const jsonValues = [];
  for (let i = 1; i < 10; i++) {
    jsonValues.push({
      extensionId: `podman-desktop.${i}`,
      displayName: `Podman${i}`,
      shortDescription: `test${i}`,
      categories: ['Container Engine'],
      builtIn: true,
      icon: `data:image/png;base64,${i}`,
    });
  }
  spyReadJson.mockReturnValue(jsonValues);

  // init fetchable extensions
  await featured.init();
  const featuredExtensions1 = await featured.getFeaturedExtensions();

  expect(featuredExtensions1).toBeDefined();

  // should be limited to 6
  expect(featuredExtensions1.length).toBe(6);

  // call again to check the shuffle
  const featuredExtensions2 = await featured.getFeaturedExtensions();

  // compare id from the 2 lists
  // they should be in a different order
  const idsList1 = featuredExtensions1.map(e => e.id);
  const idsList2 = featuredExtensions2.map(e => e.id);

  // check that the 2 lists are not the same
  expect(idsList1).not.toStrictEqual(idsList2);
});
