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

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionInfo } from '../api/extension-info.js';
import type { ConfigurationRegistry } from '../configuration-registry.js';
import type { ExtensionLoader } from '../extension-loader.js';
import type { ExtensionsCatalog } from '../extensions-catalog/extensions-catalog.js';
import type { CatalogExtension } from '../extensions-catalog/extensions-catalog-api.js';
import type { ExtensionInstaller } from '../install/extension-installer.js';
import type { Telemetry } from '../telemetry/telemetry.js';
import { ExtensionsUpdater } from './extensions-updater.js';

let extensionsUpdater: ExtensionsUpdater;

const catalogExtension1: CatalogExtension = {
  id: 'foo.extension1',
  publisherName: 'foo',
  extensionName: 'extension1',
  displayName: 'My Extension 1',
  versions: [
    {
      version: '2.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar1',
      files: [],
    },
  ],
};

const catalogExtension2: CatalogExtension = {
  id: 'foo.extension2',
  publisherName: 'foo',
  extensionName: 'extension2',
  displayName: 'My Extension 2',
  versions: [
    {
      version: '4.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar2',
      files: [],
    },
  ],
};

const extensionsCatalogGetExtensionsMock = vi.fn();
const extensionsCatalog = {
  getExtensions: extensionsCatalogGetExtensionsMock,
} as unknown as ExtensionsCatalog;

const extensionLoaderListExtensionsMock = vi.fn();
const extensionLoaderSetExtensionsUpdatesMock = vi.fn();
const extensionLoader = {
  listExtensions: extensionLoaderListExtensionsMock,
  setExtensionsUpdates: extensionLoaderSetExtensionsUpdatesMock,
  removeExtension: vi.fn(),
} as unknown as ExtensionLoader;

const getConfigMock = vi.fn();
const getConfigurationMock = vi.fn();
getConfigurationMock.mockReturnValue({
  get: getConfigMock,
});
const configurationRegistry = {
  registerConfigurations: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
  getConfiguration: getConfigurationMock,
} as unknown as ConfigurationRegistry;

const extensionInstaller = {
  installFromImage: vi.fn(),
} as unknown as ExtensionInstaller;

const telemetry = {
  track: vi.fn().mockImplementation(async () => {
    // do nothing
  }),
} as unknown as Telemetry;

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  extensionsUpdater = new ExtensionsUpdater(
    extensionsCatalog,
    extensionLoader,
    configurationRegistry,
    extensionInstaller,
    telemetry,
  );
  vi.clearAllMocks();
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('should check for updates and try to update one extension automatically', async () => {
  const installedExtension1: ExtensionInfo = {
    id: 'foo.extension1',
    version: '1.0.0',
    removable: true,
  } as ExtensionInfo;

  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([installedExtension1]);

  // return true for the config check
  getConfigMock.mockReturnValue(true);

  const spyUpdateExtension = vi.spyOn(extensionsUpdater, 'updateExtension');

  await extensionsUpdater.init();

  // no error
  expect(console.error).not.toBeCalled();

  // check we had updates
  expect(spyUpdateExtension).toBeCalled();

  // check setExtensionsUpdates is called
  expect(extensionLoaderSetExtensionsUpdatesMock).toBeCalledWith([
    { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
  ]);

  expect(extensionInstaller.installFromImage).toBeCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
  );

  expect(extensionLoader.removeExtension).toBeCalledWith('foo.extension1');

  // telemetry is called
  expect(telemetry.track).toBeCalled();
});
