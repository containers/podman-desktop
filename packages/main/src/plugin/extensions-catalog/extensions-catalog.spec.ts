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

import type { Configuration, ProxySettings } from '@podman-desktop/api';
import nock from 'nock';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';

import type { Certificates } from '../certificates.js';
import { Emitter } from '../events/emitter.js';
import type { Proxy } from '../proxy.js';
import { ExtensionsCatalog } from './extensions-catalog.js';

let extensionsCatalog: ExtensionsCatalog;

const fooAssetIcon = {
  assetType: 'icon',
  data: 'fooIcon',
};

// unlisted field is not present (assuming it should be listed then)
const fakePublishedExtension1 = {
  publisher: {
    publisherName: 'foo',
    displayName: 'Foo publisher display name',
  },
  extensionName: 'fooName',
  displayName: 'Foo extension display name',
  shortDescription: 'Foo extension short description',
  license: 'Apache-2.0',
  categories: ['Kubernetes'],
  versions: [
    {
      version: '1.0.0',
      preview: false,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      ociUri: 'oci-registry.foo/foo/bar',
      files: [fooAssetIcon],
    },
  ],
};

// this one is unlisted with field unlisted being true
const fakePublishedExtension2 = {
  publisher: {
    publisherName: 'foo2',
    displayName: 'Foo publisher display name',
  },
  extensionName: 'fooName2',
  displayName: 'Foo2 extension display name',
  shortDescription: 'Foo2 extension short description',
  license: 'Apache-2.0',
  unlisted: true,
  categories: ['Kubernetes'],
  versions: [
    {
      version: '1.0.0',
      preview: false,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      ociUri: 'oci-registry.foo/foo/bar',
      files: [fooAssetIcon],
    },
  ],
};

// this one is unlisted with field unlisted being false
const fakePublishedExtension3 = {
  publisher: {
    publisherName: 'foo3',
    displayName: 'Foo publisher display name',
  },
  extensionName: 'fooName3',
  displayName: 'Foo3 extension display name',
  shortDescription: 'Foo3 extension short description',
  license: 'Apache-2.0',
  unlisted: false,
  categories: ['Kubernetes'],
  versions: [
    {
      version: '1.0.0',
      preview: false,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      ociUri: 'oci-registry.foo/foo/bar',
      files: [fooAssetIcon],
    },
  ],
};
const isEnabledProxyMock = vi.fn();
const onDidUpdateProxyEmitter = new Emitter<ProxySettings>();
const getAllCertificatesMock = vi.fn();

const certificates: Certificates = {
  init: vi.fn(),
  getAllCertificates: getAllCertificatesMock,
} as unknown as Certificates;
const proxy: Proxy = {
  onDidStateChange: vi.fn(),
  onDidUpdateProxy: onDidUpdateProxyEmitter.event,
  isEnabled: isEnabledProxyMock,
  proxy: vi.fn(),
} as unknown as Proxy;

const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const originalConsoleError = console.error;
beforeEach(() => {
  extensionsCatalog = new ExtensionsCatalog(certificates, proxy, configurationRegistry);
  vi.resetAllMocks();
  console.error = vi.fn();
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValue(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL),
  } as unknown as Configuration);
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('should fetch fetchable extensions', async () => {
  const url = new URL(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);
  const host = url.origin;
  const pathname = url.pathname;
  nock(host)
    .get(pathname)
    .reply(200, {
      extensions: [fakePublishedExtension1],
    });

  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions).toBeDefined();
  expect(fetchableExtensions.length).toBe(1);

  // check data
  const extension = fetchableExtensions[0];
  expect(extension.extensionId).toBe('foo.fooName');
  expect(extension.link).toBe('oci-registry.foo/foo/bar');
  // no error
  expect(console.error).not.toBeCalled();
});

test('should not fetch fetchable extensions if internet connection is taking too much time', async () => {
  const url = new URL(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);
  const host = url.origin;
  const pathname = url.pathname;
  nock(host)
    .get(pathname)
    .delay(3000) // 3 seconds delay will be applied to the response header.
    .reply(200, {
      extensions: [fakePublishedExtension1],
    });

  // no error, but array should be empty as it is taking too much time to download
  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions).toBeDefined();
  expect(fetchableExtensions.length).toBe(0);
  // error being logged
  expect(console.error).toBeCalledWith(
    expect.stringContaining('Unable to fetch the available extensions: Timeout awaiting'),
  );
});

test('check getHttpOptions with Proxy', async () => {
  // faked certificates
  getAllCertificatesMock.mockReturnValue(['1', '2', '3']);

  isEnabledProxyMock.mockReturnValue(true);
  const proxy: Proxy = {
    onDidStateChange: vi.fn(),
    onDidUpdateProxy: vi.fn(),
    isEnabled: isEnabledProxyMock,
    proxy: vi.fn(),
  } as unknown as Proxy;
  vi.spyOn(proxy, 'proxy', 'get').mockReturnValue({
    httpProxy: 'http://localhost',
    httpsProxy: 'http://localhost',
    noProxy: 'localhost',
  });
  extensionsCatalog = new ExtensionsCatalog(certificates, proxy, configurationRegistry);

  const options = extensionsCatalog.getHttpOptions();
  expect(options).toBeDefined();
  // expect the two agents being defined
  expect(options.agent?.http).toBeDefined();
  expect(options.agent?.https).toBeDefined();
  // @ts-expect-error proxy property exists on http object
  expect(options.agent?.http?.proxy.href).toBe('http://localhost/');
  // @ts-expect-error proxy property exists on https object
  expect(options.agent?.https?.proxy.href).toBe('http://localhost/');

  // certificates should be 1, 2, 3
  expect(options.https?.certificateAuthority).toBeDefined();
  expect(options.https?.certificateAuthority?.length).toBe(3);
});

test('should get all extensions', async () => {
  const url = new URL(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);
  const host = url.origin;
  const pathname = url.pathname;
  nock(host)
    .get(pathname)
    .reply(200, {
      extensions: [fakePublishedExtension1],
    });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toBeDefined();
  expect(allExtensions.length).toBe(1);

  // check data
  const extension = allExtensions[0];
  expect(extension.id).toBe('foo.fooName');
  expect(extension.publisherName).toBe('foo');
  expect(extension.displayName).toBe(fakePublishedExtension1.displayName);
  expect(extension.categories).toStrictEqual(['Kubernetes']);
  expect(extension.publisherDisplayName).toBe('Foo publisher display name');
  expect(extension.shortDescription).toBe('Foo extension short description');

  expect(extension.versions[0]).toStrictEqual({
    ociUri: 'oci-registry.foo/foo/bar',
    lastUpdated: expect.any(Date),
    preview: false,
    version: '1.0.0',
    podmanDesktopVersion: undefined,
    files: [fooAssetIcon],
  });
  // no error
  expect(console.error).not.toBeCalled();
});

test('should get proper unlisted fields', async () => {
  const url = new URL(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL);
  const host = url.origin;
  const pathname = url.pathname;
  nock(host)
    .get(pathname)
    .reply(200, {
      extensions: [fakePublishedExtension1, fakePublishedExtension2, fakePublishedExtension3],
    });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toBeDefined();
  expect(allExtensions.length).toBe(3);

  // check data
  const missingUnlistedExtension = allExtensions.find(e => e.id === 'foo.fooName');
  expect(missingUnlistedExtension).toBeDefined();
  expect(missingUnlistedExtension?.unlisted).toBeFalsy();

  const unlistedTrueExtension = allExtensions.find(e => e.id === 'foo2.fooName2');
  expect(unlistedTrueExtension).toBeDefined();
  expect(unlistedTrueExtension?.unlisted).toBeTruthy();

  const unlistedFalseExtension = allExtensions.find(e => e.id === 'foo3.fooName3');
  expect(unlistedFalseExtension).toBeDefined();
  expect(unlistedFalseExtension?.unlisted).toBeFalsy();

  // no error
  expect(console.error).not.toBeCalled();
});

test('should fetch alternate link', async () => {
  const customPathToCatalog = 'https://my-dummy-podman-desktop.com/catalog.json';
  const url = new URL(customPathToCatalog);
  const host = url.origin;
  const pathname = url.pathname;
  nock(host)
    .get(pathname)
    .reply(200, {
      extensions: [fakePublishedExtension1],
    });

  // change the configuration reply to be our custom path
  vi.mocked(configurationRegistry.getConfiguration).mockClear();
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValue(customPathToCatalog),
  } as unknown as Configuration);

  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions).toBeDefined();
  expect(fetchableExtensions.length).toBe(1);

  // check data
  const extension = fetchableExtensions[0];
  expect(extension.extensionId).toBe('foo.fooName');
  expect(extension.link).toBe('oci-registry.foo/foo/bar');
  // no error
  expect(console.error).not.toBeCalled();
});

test('Should use proxy object if proxySettings is undefined', () => {
  isEnabledProxyMock.mockReturnValue(true);
  const proxy: Proxy = {
    onDidStateChange: vi.fn(),
    onDidUpdateProxy: vi.fn(),
    isEnabled: isEnabledProxyMock,
    proxy: vi.fn(),
  } as unknown as Proxy;
  vi.spyOn(proxy, 'proxy', 'get').mockReturnValue({
    httpProxy: 'http://localhost',
    httpsProxy: 'https://localhost',
    noProxy: 'localhost',
  });
  extensionsCatalog = new ExtensionsCatalog(certificates, proxy, configurationRegistry);
  const options = extensionsCatalog.getHttpOptions();

  expect(options).toBeDefined();
  // expect the two agents being defined
  expect(options.agent?.http).toBeDefined();
  expect(options.agent?.https).toBeDefined();
  // @ts-expect-error proxy property exists on http object
  expect(options.agent?.http?.proxy.href).toBe('http://localhost/');
  // @ts-expect-error proxy property exists on https object
  expect(options.agent?.https?.proxy.href).toBe('https://localhost/');
});
