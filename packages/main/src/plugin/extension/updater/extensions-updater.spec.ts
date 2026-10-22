/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ExtensionInfo } from '@desktop-framework/api';
import type { CatalogExtension } from '@desktop-framework/api/extension-catalog';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ExtensionsCatalog } from '/@/plugin/extension/catalog/extensions-catalog.js';
import type { ExtensionInstaller } from '/@/plugin/extension/extension-installer.js';
import type { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';

import { ExtensionsUpdater } from './extensions-updater.js';

let extensionsUpdater: ExtensionsUpdater;

const catalogExtension1: CatalogExtension = {
  id: 'foo.extension1',
  publisherName: 'foo',
  extensionName: 'extension1',
  displayName: 'My Extension 1',
  publisherDisplayName: 'Foo publisher display name',
  shortDescription: 'Foo extension short description',
  categories: ['Kubernetes'],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '2.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar1',
      files: [],
      lastUpdated: new Date(),
    },
  ],
};

const catalogExtension2: CatalogExtension = {
  id: 'foo.extension2',
  publisherName: 'foo',
  extensionName: 'extension2',
  displayName: 'My Extension 2',
  publisherDisplayName: 'Foo publisher display name',
  shortDescription: 'Foo extension short description',
  categories: [],
  keywords: [],
  unlisted: false,
  versions: [
    {
      version: '4.0.0',
      preview: false,
      ociUri: 'oci-registry.foo/foo/bar2',
      files: [],
      lastUpdated: new Date(),
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
  replaceBundledExtension: vi.fn(),
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

test('should automatically replace a bundled extension by its new version', async () => {
  // the catalog has a newer version of the bundled extension
  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([
    buildExtensionInfo('foo.extension1', { removable: false, bundled: true }),
  ]);

  // auto update is enabled
  getConfigMock.mockReturnValue(true);

  await extensionsUpdater.init();

  expect(extensionLoader.replaceBundledExtension).toHaveBeenCalledWith('foo.extension1');
  expect(extensionLoader.removeExtension).not.toHaveBeenCalled();
  expect(extensionInstaller.installFromImage).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
  );
});

test('should automatically update an extension replacing a bundled one', async () => {
  // the catalog has a newer version of the extension replacing a bundled one
  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([
    buildExtensionInfo('foo.extension1', { overrides: { id: 'foo.extension1', version: '1.0.0' } }),
  ]);

  // auto update is enabled
  getConfigMock.mockReturnValue(true);

  await extensionsUpdater.init();

  expect(extensionLoader.removeExtension).toHaveBeenCalledWith('foo.extension1');
  expect(extensionInstaller.installFromImage).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
  );
});

test('should replace a bundled extension by its new version when updating it', async () => {
  extensionLoaderListExtensionsMock.mockResolvedValue([
    buildExtensionInfo('foo.extension1', { removable: false, bundled: true }),
  ]);

  await extensionsUpdater.updateExtension('foo.extension1', 'oci-registry.foo/foo/bar1');

  expect(extensionLoader.replaceBundledExtension).toHaveBeenCalledWith('foo.extension1');
  expect(extensionLoader.removeExtension).not.toHaveBeenCalled();
  expect(extensionInstaller.installFromImage).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar1',
  );
});

/**
 * Build an extension installed by the user, the given fields taking precedence.
 */
function buildExtensionInfo(id: string, fields: Partial<ExtensionInfo> = {}): ExtensionInfo {
  const name = id.substring(id.indexOf('.') + 1);
  return {
    id,
    name,
    description: name,
    displayName: name,
    publisher: 'foo',
    removable: true,
    devMode: false,
    bundled: false,
    version: '1.0.0',
    state: 'started',
    path: `/plugins/${name}`,
    readme: '',
    ...fields,
  };
}

test('should flag but not apply the update of an extension having its automatic updates disabled', async () => {
  // the catalog has newer versions of both extensions
  extensionsCatalogGetExtensionsMock.mockResolvedValue([catalogExtension1, catalogExtension2]);
  extensionLoaderListExtensionsMock.mockResolvedValue([
    buildExtensionInfo('foo.extension1', { autoUpdateDisabled: true }),
    buildExtensionInfo('foo.extension2'),
  ]);

  // auto update is enabled
  getConfigMock.mockReturnValue(true);

  await extensionsUpdater.init();

  expect(extensionLoaderSetExtensionsUpdatesMock).toHaveBeenCalledWith([
    { id: 'foo.extension1', ociUri: 'oci-registry.foo/foo/bar1', version: '2.0.0' },
    { id: 'foo.extension2', ociUri: 'oci-registry.foo/foo/bar2', version: '4.0.0' },
  ]);
  expect(extensionLoader.removeExtension).toHaveBeenCalledOnce();
  expect(extensionLoader.removeExtension).toHaveBeenCalledWith('foo.extension2');
  expect(extensionInstaller.installFromImage).toHaveBeenCalledOnce();
  expect(extensionInstaller.installFromImage).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.anything(),
    'oci-registry.foo/foo/bar2',
  );
});
