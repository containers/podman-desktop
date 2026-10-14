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

import * as nodeHttp from 'node:http';
import type { AddressInfo } from 'node:net';

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Configuration } from '@desktop-framework/extension-api';
import { delay, http, HttpResponse } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import { createProxy } from 'proxy';
import { ProxyAgent } from 'undici';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ExtensionApiVersion } from '/@/plugin/extension/extension-api-version.js';

import { ExtensionsCatalog } from './extensions-catalog.js';

let extensionsCatalog: ExtensionsCatalog;

const fooAssetIcon = {
  assetType: 'icon',
  data: 'fooIcon',
};

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const extensionApiVersion: ExtensionApiVersion = {
  getApiVersion: vi.fn(),
} as ExtensionApiVersion;

let server: SetupServer | undefined = undefined;

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

// this one has a version that requires an incompatible Podman Desktop version
const fakePublishedExtension4 = {
  publisher: {
    publisherName: 'foo4',
    displayName: 'Foo publisher display name',
  },
  extensionName: 'fooName4',
  displayName: 'Foo4 extension display name',
  shortDescription: 'Foo4 extension short description',
  license: 'Apache-2.0',
  categories: ['Kubernetes'],
  versions: [
    {
      version: '1.0.0',
      podmanDesktopVersion: '^1.0.0',
      preview: false,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      ociUri: 'oci-registry.foo/foo/bar',
      files: [fooAssetIcon],
    },
    {
      version: '2.0.0',
      podmanDesktopVersion: '^999.0.0',
      preview: false,
      lastUpdated: '2021-01-01T00:00:00.000Z',
      ociUri: 'oci-registry.foo/foo/bar',
      files: [fooAssetIcon],
    },
  ],
};

const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: vi.fn(),
  registerConfigurations: vi.fn(),
} as unknown as ConfigurationRegistry;

const originalConsoleError = console.error;
beforeEach(() => {
  extensionsCatalog = new ExtensionsCatalog(configurationRegistry, apiSender, extensionApiVersion);
  vi.resetAllMocks();
  console.error = vi.fn();
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValue(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL),
  } as unknown as Configuration);
});

afterEach(() => {
  console.error = originalConsoleError;
  server?.close();
});

test('should skip extensions with only preview versions in fetchable list', async () => {
  const previewOnlyExtension = {
    publisher: { publisherName: 'bar', displayName: 'Bar' },
    extensionName: 'barName',
    displayName: 'Bar extension',
    shortDescription: 'Bar desc',
    categories: ['Other'],
    versions: [
      { version: '0.1.0', preview: true, lastUpdated: '2021-01-01T00:00:00.000Z', ociUri: 'oci://bar', files: [] },
    ],
  };

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension1, previewOnlyExtension] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions.length).toBe(1);
  expect(fetchableExtensions[0]?.extensionId).toBe('foo.fooName');
});

test('should fetch fetchable extensions', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension1] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions).toBeDefined();
  expect(fetchableExtensions.length).toBe(1);

  // check data
  const extension = fetchableExtensions[0];
  expect(extension?.extensionId).toBe('foo.fooName');
  expect(extension?.link).toBe('oci-registry.foo/foo/bar');
  // no error
  expect(console.error).not.toBeCalled();
});

test('should not fetch fetchable extensions if internet connection is taking too much time', async () => {
  // Use a shorter timeout for this test
  const originalTimeout = ExtensionsCatalog.FETCH_TIMEOUT;
  Object.defineProperty(ExtensionsCatalog, 'FETCH_TIMEOUT', { value: 1_000, writable: true });

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, async () => {
      await delay(3_000);
      return HttpResponse.json({ extensions: [fakePublishedExtension1] });
    }),
  );
  server.listen({ onUnhandledRequest: 'error' });

  // no error, but array should be empty as it is taking too much time to download
  const fetchableExtensions = await extensionsCatalog.getFetchableExtensions();
  expect(fetchableExtensions).toBeDefined();
  expect(fetchableExtensions.length).toBe(0);
  // error being logged
  expect(console.error).toBeCalledWith(expect.stringContaining('Unable to fetch the available extensions:'));

  Object.defineProperty(ExtensionsCatalog, 'FETCH_TIMEOUT', { value: originalTimeout, writable: true });
});

test('should return empty array when catalog has no extensions', async () => {
  server = setupServer(http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.json({ extensions: [] })));
  server.listen({ onUnhandledRequest: 'error' });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toStrictEqual([]);
  expect(console.error).not.toBeCalled();
});

test('should return empty array when catalog fetch fails', async () => {
  server = setupServer(http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.error()));
  server.listen({ onUnhandledRequest: 'error' });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toStrictEqual([]);
  expect(console.error).toBeCalled();
});

test('should use cached catalog and not fetch again within cache timeout', async () => {
  let fetchCount = 0;
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => {
      fetchCount++;
      return HttpResponse.json({ extensions: [fakePublishedExtension1] });
    }),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const first = await extensionsCatalog.getExtensions();
  expect(first.length).toBe(1);
  expect(fetchCount).toBe(1);

  const second = await extensionsCatalog.getExtensions();
  expect(second.length).toBe(1);
  expect(fetchCount).toBe(1);
});

test('should throw with message when fetch fails due to network error', async () => {
  server = setupServer(http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.error()));
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.refreshCatalog()).rejects.toThrow('Unable to fetch the available extensions:');
});

test('should throw with status when server returns non-ok response', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => new HttpResponse(null, { status: 500 })),
  );
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.refreshCatalog()).rejects.toThrow(
    'Unable to fetch the available extensions: HTTP 500:',
  );
});

test('should throw when server returns 404', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => new HttpResponse(null, { status: 404 })),
  );
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.refreshCatalog()).rejects.toThrow(
    'Unable to fetch the available extensions: HTTP 404:',
  );
});

test('should throw with stringified error when error has no message property', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue('something went wrong');

  await expect(extensionsCatalog.refreshCatalog()).rejects.toThrow(
    'Unable to fetch the available extensions: something went wrong',
  );

  fetchSpy.mockRestore();
});

test('should refetch catalog after cache timeout expires', async () => {
  let fetchCount = 0;
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => {
      fetchCount++;
      return HttpResponse.json({ extensions: [fakePublishedExtension1] });
    }),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const first = await extensionsCatalog.getExtensions();
  expect(first.length).toBe(1);
  expect(fetchCount).toBe(1);

  // Advance time past the cache timeout
  vi.useFakeTimers();
  vi.setSystemTime(Date.now() + ExtensionsCatalog.CACHE_TIMEOUT + 1);

  const second = await extensionsCatalog.getExtensions();
  expect(second.length).toBe(1);
  expect(fetchCount).toBe(2);

  vi.useRealTimers();
});

test('should get all extensions', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension1] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toBeDefined();
  expect(allExtensions.length).toBe(1);

  // check data
  const extension = allExtensions[0];
  expect(extension?.id).toBe('foo.fooName');
  expect(extension?.publisherName).toBe('foo');
  expect(extension?.displayName).toBe(fakePublishedExtension1.displayName);
  expect(extension?.categories).toStrictEqual(['Kubernetes']);
  expect(extension?.publisherDisplayName).toBe('Foo publisher display name');
  expect(extension?.shortDescription).toBe('Foo extension short description');

  expect(extension?.versions[0]).toStrictEqual({
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

test('should filter incompatible extension versions', async () => {
  // mock current version as 1.5.0
  vi.mocked(extensionApiVersion.getApiVersion).mockReturnValue('1.5.0');

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension4] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const allExtensions = await extensionsCatalog.getExtensions();
  expect(allExtensions).toBeDefined();
  expect(allExtensions.length).toBe(1);

  // check data
  const extension = allExtensions[0];
  expect(extension?.id).toBe('foo4.fooName4');
  expect(extension?.publisherName).toBe('foo4');

  expect(extension?.versions.length).toEqual(1);
  expect(extension?.versions[0]).toStrictEqual({
    ociUri: 'oci-registry.foo/foo/bar',
    lastUpdated: expect.any(Date),
    preview: false,
    version: '1.0.0',
    podmanDesktopVersion: '^1.0.0',
    files: [fooAssetIcon],
  });
  // no error
  expect(console.error).not.toBeCalled();
});

test('should get proper unlisted fields', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension1, fakePublishedExtension2, fakePublishedExtension3] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

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

  server = setupServer(
    http.get(customPathToCatalog, () => HttpResponse.json({ extensions: [fakePublishedExtension1] })),
  );
  server.listen({ onUnhandledRequest: 'error' });

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
  expect(extension?.extensionId).toBe('foo.fooName');
  expect(extension?.link).toBe('oci-registry.foo/foo/bar');
  // no error
  expect(console.error).not.toBeCalled();
});

test('should register local extensions and catalog enabled configuration properties', () => {
  extensionsCatalog.init();

  expect(configurationRegistry.registerConfigurations).toHaveBeenCalledWith([
    expect.objectContaining({
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: expect.objectContaining({
        'extensions.localExtensions.enabled': {
          description: 'Show the local extensions tab.',
          type: 'boolean',
          default: true,
          hidden: true,
        },
        'extensions.catalog.enabled': {
          description: 'Show the extension catalog in the UI. When disabled, hides the catalog suggestions.',
          type: 'boolean',
          default: true,
          hidden: true,
        },
      }),
    }),
  ]);
});

test('should use global fetch for catalog requests so proxy settings are respected', async () => {
  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [fakePublishedExtension1] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const fetchSpy = vi.spyOn(globalThis, 'fetch');

  await extensionsCatalog.refreshCatalog();

  expect(fetchSpy).toHaveBeenCalledWith(
    ExtensionsCatalog.DEFAULT_EXTENSIONS_URL,
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  fetchSpy.mockRestore();
});

test('should route catalog request through proxy when proxy is configured', async () => {
  const proxyServer = await new Promise<nodeHttp.Server>(resolve => {
    const s = createProxy(nodeHttp.createServer());
    s.listen(0, () => resolve(s));
  });
  const address = proxyServer.address() as AddressInfo;

  let connectDone = false;
  proxyServer.on('connect', () => {
    connectDone = true;
  });

  const catalogUrl = 'https://registry.podman-desktop.io/api/extensions.json';
  vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
    get: vi.fn().mockReturnValue(catalogUrl),
  } as unknown as Configuration);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = function (url: URL | RequestInfo, opts?: object): Promise<Response> {
    return originalFetch(url, {
      ...opts,
      dispatcher: new ProxyAgent({ uri: `http://127.0.0.1:${String(address.port)}` }),
    } as RequestInit);
  };

  try {
    await extensionsCatalog.refreshCatalog();
  } catch {
    // Expected: upstream connection may fail, we only verify the proxy was contacted
  } finally {
    globalThis.fetch = originalFetch;
    proxyServer.close();
  }

  expect(connectDone).toBe(true);
});

test('should fetch README content successfully by extension ID', async () => {
  const readmeContent = '# Extension README\n\nThis is the README content.';
  const readmeUri = 'https://example.com/extensions/foo/fooName/1.0.0/README.md';

  const extensionWithReadme = {
    publisher: {
      publisherName: 'foo',
      displayName: 'Foo publisher',
    },
    extensionName: 'fooName',
    displayName: 'Foo Extension',
    shortDescription: 'Test extension',
    categories: ['Other'],
    versions: [
      {
        version: '1.0.0',
        preview: false,
        lastUpdated: '2021-01-01T00:00:00.000Z',
        ociUri: 'oci-registry.foo/foo/bar',
        files: [{ assetType: 'README', data: readmeUri }, fooAssetIcon],
      },
    ],
  };

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.json({ extensions: [extensionWithReadme] })),
    http.get(readmeUri, () => HttpResponse.text(readmeContent)),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const result = await extensionsCatalog.fetchReadme('foo.fooName');

  expect(result).toBe(readmeContent);
});

test('should throw error when extension not found', async () => {
  server = setupServer(http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.json({ extensions: [] })));
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.fetchReadme('nonexistent.extension')).rejects.toThrow(
    'No extension with id nonexistent.extension found',
  );
});

test('should throw error when extension has no README', async () => {
  const extensionWithoutReadme = {
    publisher: {
      publisherName: 'bar',
      displayName: 'Bar publisher',
    },
    extensionName: 'barName',
    displayName: 'Bar Extension',
    shortDescription: 'Test extension',
    categories: ['Other'],
    versions: [
      {
        version: '1.0.0',
        preview: false,
        lastUpdated: '2021-01-01T00:00:00.000Z',
        ociUri: 'oci-registry.bar/bar/baz',
        files: [fooAssetIcon],
      },
    ],
  };

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [extensionWithoutReadme] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.fetchReadme('bar.barName')).rejects.toThrow('Extension bar.barName has no README');
});

test('should throw error when fetching README fails', async () => {
  const readmeUri = 'https://registry.podman-desktop.io/api/extensions/foo/fooName/1.0.0/README.md';

  const extensionWithReadme = {
    publisher: {
      publisherName: 'foo',
      displayName: 'Foo publisher',
    },
    extensionName: 'fooName',
    displayName: 'Foo Extension',
    shortDescription: 'Test extension',
    categories: ['Other'],
    versions: [
      {
        version: '1.0.0',
        preview: false,
        lastUpdated: '2021-01-01T00:00:00.000Z',
        ociUri: 'oci-registry.foo/foo/bar',
        files: [{ assetType: 'README', data: readmeUri }, fooAssetIcon],
      },
    ],
  };

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () => HttpResponse.json({ extensions: [extensionWithReadme] })),
    http.get(readmeUri, () => new HttpResponse(null, { status: 404 })),
  );
  server.listen({ onUnhandledRequest: 'error' });

  await expect(extensionsCatalog.fetchReadme('foo.fooName')).rejects.toThrow(
    `Failed to fetch README from ${readmeUri}`,
  );
});

test('should fetch README from first non-preview version', async () => {
  const previewReadmeUri = 'https://example.com/extensions/foo/fooName/2.0.0-preview/README.md';
  const stableReadmeUri = 'https://example.com/extensions/foo/fooName/1.0.0/README.md';
  const stableReadmeContent = '# Stable README';

  const extensionWithPreviewFirst = {
    publisher: {
      publisherName: 'foo',
      displayName: 'Foo publisher',
    },
    extensionName: 'fooName',
    displayName: 'Foo Extension',
    shortDescription: 'Test extension',
    categories: ['Other'],
    versions: [
      {
        version: '2.0.0-preview',
        preview: true,
        lastUpdated: '2021-02-01T00:00:00.000Z',
        ociUri: 'oci-registry.foo/foo/bar',
        files: [{ assetType: 'README', data: previewReadmeUri }, fooAssetIcon],
      },
      {
        version: '1.0.0',
        preview: false,
        lastUpdated: '2021-01-01T00:00:00.000Z',
        ociUri: 'oci-registry.foo/foo/bar',
        files: [{ assetType: 'README', data: stableReadmeUri }, fooAssetIcon],
      },
    ],
  };

  server = setupServer(
    http.get(ExtensionsCatalog.DEFAULT_EXTENSIONS_URL, () =>
      HttpResponse.json({ extensions: [extensionWithPreviewFirst] }),
    ),
    http.get(stableReadmeUri, () => HttpResponse.text(stableReadmeContent)),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const result = await extensionsCatalog.fetchReadme('foo.fooName');

  expect(result).toBe(stableReadmeContent);
});
