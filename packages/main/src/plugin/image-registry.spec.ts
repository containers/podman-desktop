/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Registry } from '@desktop-framework/extension-api';
import { http, HttpResponse } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import * as nodeTar from 'tar';
import { ProxyAgent, type RequestInit } from 'undici';
import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest';

import imageRegistryConfigJson from '/@tests/resources/data/plugin/image-registry-config.json' with { type: 'json' };
import imageRegistryManifestJson from '/@tests/resources/data/plugin/image-registry-manifest-index.json' with {
  type: 'json',
};
import imageRegistryManifestZstdJson from '/@tests/resources/data/plugin/image-registry-manifest-index.zstd.json' with {
  type: 'json',
};
import imageRegistryManifestMultiArchJson from '/@tests/resources/data/plugin/image-registry-manifest-multi-arch-index.json' with {
  type: 'json',
};

import type { Certificates } from './certificates.js';
import { ImageRegistry } from './image-registry.js';
import type { Proxy } from './proxy.js';
import type { EventType, Telemetry } from './telemetry/telemetry.js';
import type { Disposable } from './types/disposable.js';
import { decompressZstd } from './util/zstd.js';

let imageRegistry: ImageRegistry;
let server: SetupServer | undefined = undefined;

const pxoxyIsEnabledMock = vi.fn();
const proxyGetProxyMock = vi.fn();

const telemetry: Telemetry = {
  track(_event: EventType, _eventProperties?: any): void {},
} as Telemetry;
const certificates: Certificates = {
  init: vi.fn(),
  getAllCertificates: vi.fn(),
} as unknown as Certificates;
const proxy: Proxy = {
  onDidStateChange: vi.fn(),
  onDidUpdateProxy: vi.fn(),
  isEnabled: pxoxyIsEnabledMock,
  proxy: proxyGetProxyMock,
} as unknown as Proxy;
Object.defineProperty(proxy, 'proxy', {
  get: proxyGetProxyMock,
});
const apiSender: ApiSenderType = {
  send(_channel: string, _data?: any): void {},
} as ApiSenderType;

beforeEach(() => {
  vi.resetAllMocks();
  imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);
});

afterEach(() => {
  server?.close();
});

vi.mock(import('./util/zstd.js'));

vi.mock(import('tar'), async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const tarActual = await vi.importActual<typeof import('tar')>('tar');

  return {
    ...tarActual,
  };
});

test('Should extract auth registry with gitlab', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://gitlab.com/jwt/auth",service="container_registry"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://gitlab.com/jwt/auth');
  expect(authInfo?.scheme).toBe('Bearer');
  expect(authInfo?.service).toBe('container_registry');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with docker', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://auth.docker.io/token",service="registry.docker.io"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.scheme).toBe('Bearer');
  expect(authInfo?.authUrl).toBe('https://auth.docker.io/token');
  expect(authInfo?.service).toBe('registry.docker.io');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with quay', async () => {
  const authInfo = imageRegistry.extractAuthData('Bearer realm="https://quay.io/v2/auth",service="quay.io"');
  expect(authInfo).toBeDefined();
  expect(authInfo?.scheme).toBe('Bearer');
  expect(authInfo?.authUrl).toBe('https://quay.io/v2/auth');
  expect(authInfo?.service).toBe('quay.io');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with github registry', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Bearer realm="https://ghcr.io/token",service="ghcr.io",scope="repository:user/image:pull"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.scheme).toBe('Bearer');
  expect(authInfo?.authUrl).toBe('https://ghcr.io/token');
  expect(authInfo?.service).toBe('ghcr.io');
  expect(authInfo?.scope).toBe('repository:user/image:pull');
});

test('Should extract auth registry with Amazon ECR registry', async () => {
  const authInfo = imageRegistry.extractAuthData(
    'Basic realm="https://userid.dkr.ecr.region.amazonaws.com/",service="ecr.amazonaws.com"',
  );
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('https://userid.dkr.ecr.region.amazonaws.com/');
  expect(authInfo?.scheme).toBe('Basic');
  expect(authInfo?.service).toBe('ecr.amazonaws.com');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should be able to use a local Sonatype Nexus instance that uses localhost and BASIC response', async () => {
  const authInfo = imageRegistry.extractAuthData('BASIC realm="http://localhost:8082",service="test.sonatype.com"');
  expect(authInfo).toBeDefined();
  expect(authInfo?.authUrl).toBe('http://localhost:8082');
  expect(authInfo?.scheme).toBe('BASIC');
  expect(authInfo?.service).toBe('test.sonatype.com');
  expect(authInfo?.scope).toBeUndefined();
});

test('Should extract auth registry with quay.io registry', async () => {
  const authInfo = imageRegistry.extractAuthData('Bearer realm="https://quay.io/v2/auth",service="quay.io"');
  expect(authInfo).toBeDefined();
  expect(authInfo?.scheme).toBe('Bearer');
  expect(authInfo?.authUrl).toBe('https://quay.io/v2/auth');
  expect(authInfo?.service).toBe('quay.io');
  expect(authInfo?.scope).toBeUndefined();
});

test('Expect extractAuthData to fail since its not Bearer, Basic or BASIC. ', async () => {
  const authInfo = imageRegistry.extractAuthData('Foobar realm="https://quay.io/v2/auth",service="quay.io"');
  // Expect it to be undefined since its not Bearer, Basic or BASIC.
  expect(authInfo).toBeUndefined();
});

test('should map short name to hub server', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage('mysql');
  expect(registryServer).toBe('docker.io');
});

test('should map short name with tag to hub server', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage('mysql:latest');
  expect(registryServer).toBe('docker.io');
});

test('should map localhost with port registry', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage('localhost:5000/myimage');
  expect(registryServer).toBe('localhost:5000');
});

test('should map localhost registry', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage('localhost/myimage');
  expect(registryServer).toBe('localhost');
});

test('should map quay registry', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage('quay.io/podman/hello');
  expect(registryServer).toBe('quay.io');
});

test('should map ecr', () => {
  const registryServer = imageRegistry.extractRegistryServerFromImage(
    '12345.dkr.ecr.us-east-1.amazonaws.com/podman-desktop',
  );
  expect(registryServer).toBe('12345.dkr.ecr.us-east-1.amazonaws.com');
});

describe('extract auth info', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('getAuthInfo with basic auth', async () => {
    // reply a 401 Unauthorized error with a custom header having the www-authenticate field
    server = setupServer(
      http.get(
        'https://my-podman-desktop-fake-registry.io/v2',
        () => new HttpResponse('', { status: 401, headers: { 'Www-Authenticate': 'Basic realm="Registry Realm"' } }),
      ),
    );
    server.listen({ onUnhandledRequest: 'error' });
    const value = await imageRegistry.getAuthInfo('https://my-podman-desktop-fake-registry.io');
    expect(value).toBeDefined();
    expect(value?.authUrl).toBe('https://my-podman-desktop-fake-registry.io/v2/');
    expect(value?.scheme).toBe('basic');
  });

  test('getAuthInfo from docker.io with bearer', async () => {
    // reply a 401 Unauthorized error with a custom header having the www-authenticate field
    server = setupServer(
      http.get(
        'https://my-podman-desktop-fake-registry.io/v2',
        () =>
          new HttpResponse('', {
            status: 401,
            headers: { 'www-authenticate': 'Bearer realm="https://auth.docker.io/token",service="registry.docker.io"' },
          }),
      ),
    );
    server.listen({ onUnhandledRequest: 'error' });

    const value = await imageRegistry.getAuthInfo('https://my-podman-desktop-fake-registry.io');
    expect(value).toBeDefined();
    expect(value?.authUrl).toBe('https://auth.docker.io/token?service=registry.docker.io');
    expect(value?.scheme).toBe('bearer');
  });

  test('getAuthInfo surfaces the underlying network error instead of the generic fetch failure', async () => {
    // fetch wraps network failures in `TypeError: fetch failed`, keeping the real reason in `cause`
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed', { cause: new Error('getaddrinfo ENOTFOUND invalidurl') }),
    );

    await expect(imageRegistry.getAuthInfo('invalidUrl')).rejects.toThrow(
      'Unable to find auth info for https://invalidUrl/v2/. Error: Error: getaddrinfo ENOTFOUND invalidurl',
    );
  });
});

describe('extractImageDataFromImageName', () => {
  test.each([
    { input: 'httpd', tag: 'latest', name: 'library/httpd' },
    { input: 'httpd:1.2.3', tag: '1.2.3', name: 'library/httpd' },
    { input: 'foo/bar', tag: 'latest', name: 'foo/bar' },
    { input: 'foo/bar:myTag', tag: 'myTag', name: 'foo/bar' },
  ])('docker hub image: $input', ({ input, tag, name }) => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(input);
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe(tag);
    expect(nameAndTag.name).toBe(name);
  });

  test.each([
    { input: 'quay.io/foo/bar', registry: 'quay.io', tag: 'latest', name: 'foo/bar' },
    {
      input: 'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:latest',
      registry: 'ghcr.io',
      tag: 'latest',
      name: 'redhat-developer/podman-desktop-sandbox-ext',
    },
    {
      input: 'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:myTag',
      registry: 'ghcr.io',
      tag: 'myTag',
      name: 'redhat-developer/podman-desktop-sandbox-ext',
    },
  ])('custom registry image: $input', ({ input, registry, tag, name }) => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(input);
    expect(nameAndTag.registry).toBe(registry);
    expect(nameAndTag.registryURL).toBe(`https://${registry}/v2`);
    expect(nameAndTag.tag).toBe(tag);
    expect(nameAndTag.name).toBe(name);
  });

  test.each([
    { input: 'localhost/myimage', registry: 'localhost', tag: 'latest', name: 'myimage' },
    { input: 'localhost:5000/myimage', registry: 'localhost:5000', tag: 'latest', name: 'myimage' },
  ])('localhost image: $input', ({ input, registry, tag, name }) => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(input);
    expect(nameAndTag.registry).toBe(registry);
    expect(nameAndTag.registryURL).toBe(`https://${registry}/v2`);
    expect(nameAndTag.tag).toBe(tag);
    expect(nameAndTag.name).toBe(name);
  });

  test('invalid image protocol', () => {
    expect(() => imageRegistry.extractImageDataFromImageName('https://ghcr.io/foo/bar')).toThrow(
      'Invalid image name: https://ghcr.io/foo/bar',
    );
  });

  test('invalid empty', async () => {
    expect(() => imageRegistry.extractImageDataFromImageName('')).toThrow('Image name is empty');
  });

  test('OCI image with three path segments', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('quay.io/foo/bar/my-ext');
    expect(nameAndTag.registry).toBe('quay.io');
    expect(nameAndTag.registryURL).toBe('https://quay.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('foo/bar/my-ext');
  });

  test('OCI image with three path segments and tag', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('quay.io/foo/bar/my-ext:v1.2.3');
    expect(nameAndTag.registry).toBe('quay.io');
    expect(nameAndTag.registryURL).toBe('https://quay.io/v2');
    expect(nameAndTag.tag).toBe('v1.2.3');
    expect(nameAndTag.name).toBe('foo/bar/my-ext');
  });

  test('OCI image with four path segments', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'registry.example.com/org/team/project/image:v1.0.0',
    );
    expect(nameAndTag.registry).toBe('registry.example.com');
    expect(nameAndTag.registryURL).toBe('https://registry.example.com/v2');
    expect(nameAndTag.tag).toBe('v1.0.0');
    expect(nameAndTag.name).toBe('org/team/project/image');
  });

  test('OCI image with five path segments', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'myregistry.io/level1/level2/level3/level4/myimage:latest',
    );
    expect(nameAndTag.registry).toBe('myregistry.io');
    expect(nameAndTag.registryURL).toBe('https://myregistry.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('level1/level2/level3/level4/myimage');
  });

  test.each([
    {
      input: 'httpd@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      registry: 'index.docker.io',
      name: 'library/httpd',
    },
    {
      input: 'foo/bar@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      registry: 'index.docker.io',
      name: 'foo/bar',
    },
    {
      input: 'quay.io/org/image@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      registry: 'quay.io',
      name: 'org/image',
    },
    {
      input: 'localhost:5000/myimage@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
      registry: 'localhost:5000',
      name: 'myimage',
    },
  ])('digest format: $input', ({ input, registry, name }) => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(input);
    expect(nameAndTag.registry).toBe(registry);
    expect(nameAndTag.registryURL).toBe(`https://${registry}/v2`);
    expect(nameAndTag.tag).toBe('sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
    expect(nameAndTag.name).toBe(name);
  });

  test('tag and digest format on library image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'httpd:2.4@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    );
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
    expect(nameAndTag.name).toBe('library/httpd');
  });

  test('tag and digest format on namespaced image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'foo/bar:v1.0.0@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    );
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
    expect(nameAndTag.name).toBe('foo/bar');
  });

  test('tag and digest format with explicit registry (ghcr.io example)', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'ghcr.io/podman-desktop/pd-extension-quadlet:0.11.0@sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    );
    expect(nameAndTag.registry).toBe('ghcr.io');
    expect(nameAndTag.registryURL).toBe('https://ghcr.io/v2');
    expect(nameAndTag.tag).toBe('sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(nameAndTag.name).toBe('podman-desktop/pd-extension-quadlet');
  });

  test('tag and digest format with localhost and port', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'localhost:5000/myimage:latest@sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
    );
    expect(nameAndTag.registry).toBe('localhost:5000');
    expect(nameAndTag.registryURL).toBe('https://localhost:5000/v2');
    expect(nameAndTag.tag).toBe('sha256:abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
    expect(nameAndTag.name).toBe('myimage');
  });

  test('tag and digest format with multi-level path', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'quay.io/org/team/image:v2.1.0@sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    );
    expect(nameAndTag.registry).toBe('quay.io');
    expect(nameAndTag.registryURL).toBe('https://quay.io/v2');
    expect(nameAndTag.tag).toBe('sha256:fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210');
    expect(nameAndTag.name).toBe('org/team/image');
  });
});

test('expect getImageConfigLabels works', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // mock http responses
  const handlers = [
    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/latest', () =>
      HttpResponse.json(imageRegistryManifestMultiArchJson),
    ),

    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0',
      () => HttpResponse.json(imageRegistryManifestJson),
    ),

    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/blobs/sha256:2f65da9a67deadfb588660ad7da746c4facba696ea5cf8ab844b281f1c14bb01',
      () => HttpResponse.json(imageRegistryConfigJson),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const labels = await imageRegistry.getImageConfigLabels('my-podman-desktop-fake-registry.io/my/extension');
  expect(labels).toBeDefined();
  expect(labels['io.podman-desktop.api.version']).toBe('>= 0.12.0');
  expect(labels['org.opencontainers.image.title']).toBe('OpenShift Local');
  expect(labels['org.opencontainers.image.description']).toBe(
    'Allows the ability to start and stop OpenShift Local and use Podman Desktop to interact with it',
  );
  expect(labels['org.opencontainers.image.vendor']).toBeDefined();
});

test('expect getManifestFromImageName works', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // mock http responses
  const handlers = [
    // multi-arch index

    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/latest', () =>
      HttpResponse.json(imageRegistryManifestMultiArchJson),
    ),

    // image index
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0',
      () => HttpResponse.json(imageRegistryManifestJson),
    ),
  ];

  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const manifest = await imageRegistry.getManifestFromImageName('my-podman-desktop-fake-registry.io/my/extension');
  expect(manifest).toStrictEqual(imageRegistryManifestJson);
});

test('expect getManifestFromImageName works with digest', async () => {
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  const digest = 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const handlers = [
    http.get(`https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/${digest}`, () =>
      HttpResponse.json(imageRegistryManifestJson),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const manifest = await imageRegistry.getManifestFromImageName(
    `my-podman-desktop-fake-registry.io/my/extension@${digest}`,
  );
  expect(manifest).toStrictEqual(imageRegistryManifestJson);
});

test('expect getManifestFromImageName works with tag and digest', async () => {
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  const digest = 'sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  const handlers = [
    http.get(`https://ghcr.io/v2/podman-desktop/pd-extension-quadlet/manifests/${digest}`, () =>
      HttpResponse.json(imageRegistryManifestJson),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  // Tag is ignored when digest is present, digest is used for manifest lookup
  const manifest = await imageRegistry.getManifestFromImageName(
    `ghcr.io/podman-desktop/pd-extension-quadlet:0.11.0@${digest}`,
  );
  expect(manifest).toStrictEqual(imageRegistryManifestJson);
});

test('expect downloadAndExtractImage works', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // create a tar file with a package.json file inside
  const tmpTarFolder = path.resolve(os.tmpdir(), 'tar-test-folder');

  const tmpTar1Folder = path.resolve(tmpTarFolder, 'tar1');
  const tmpTar1File = path.resolve(tmpTar1Folder, '1.tar.gz');

  const tmpTar2Folder = path.resolve(tmpTarFolder, 'tar2');
  const tmpTar2File = path.resolve(tmpTar2Folder, '2.tar.gz');
  await fs.promises.mkdir(tmpTar1Folder, { recursive: true });
  await fs.promises.mkdir(tmpTar2Folder, { recursive: true });

  // write a package.json file inside tar1
  const packageJson = path.resolve(tmpTar1Folder, 'package.json');
  const packageJsonContent = JSON.stringify({ name: 'test-package' });
  fs.writeFileSync(packageJson, packageJsonContent);
  await nodeTar.create({ gzip: true, file: tmpTar1File, cwd: tmpTar1Folder }, ['package.json']);

  // write a README.MD file inside tar2
  const readmeMd = path.resolve(tmpTar2Folder, 'README.MD');
  const readmeMdContent = '# Test Readme';
  fs.writeFileSync(readmeMd, readmeMdContent);
  await nodeTar.create({ gzip: true, file: tmpTar2File, cwd: tmpTar2Folder }, ['README.MD']);

  const blobFile1 = fs.readFileSync(tmpTar1File);
  const blobFile2 = fs.readFileSync(tmpTar2File);

  // mock http responses
  const handlers = [
    // multi-arch index

    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/latest', () =>
      HttpResponse.json(imageRegistryManifestMultiArchJson),
    ),

    // image index
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0',
      () => HttpResponse.json(imageRegistryManifestJson),
    ),

    // file 2
    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/blobs/*', info => {
      const sha = info.params['0'];
      if (sha === 'sha256:dc0c1d0e36ea3e0b94af099c9b96012743ae22e1797eaff3308895335513d454') {
        return new HttpResponse(blobFile2, {
          headers: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment; filename=reply_file_2.tar.gz',
          },
        });
      }
      if (sha === 'sha256:ec4d84bbb887a9dba10a4551252dde152bbb42e3b02e501b44218c9c5425eac4') {
        return new HttpResponse(blobFile1, {
          headers: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment; filename=reply_file_1.tar.gz',
          },
        });
      }
      return new HttpResponse('', { status: 404 });
    }),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const destFolder = path.resolve(os.tmpdir(), 'test-folder');
  const logFn = vi.fn();
  try {
    await imageRegistry.downloadAndExtractImage('my-podman-desktop-fake-registry.io/my/extension', destFolder, logFn);

    // check that the folder exists and files are there
    const existFolder = fs.existsSync(destFolder);
    expect(existFolder).toBeTruthy();

    // check that the package.json file exists
    const existPackageJson = fs.existsSync(path.resolve(destFolder, 'package.json'));
    expect(existPackageJson).toBeTruthy();

    // check the content
    const packageJsonContent = fs.readFileSync(path.resolve(destFolder, 'package.json'), 'utf8');
    expect(packageJsonContent).toBe(packageJsonContent);

    // check that the README.MD file exists
    const existReadmeMd = fs.existsSync(path.resolve(destFolder, 'README.MD'));
    expect(existReadmeMd).toBeTruthy();

    // check the content
    const readmeMdContent = fs.readFileSync(path.resolve(destFolder, 'README.MD'), 'utf8');
    expect(readmeMdContent).toBe(readmeMdContent);

    // expect some traces in the logger
    expect(logFn).toHaveBeenCalled();
  } finally {
    // remove the folders
    await fs.promises.rm(tmpTarFolder, { recursive: true });
    await fs.promises.rm(destFolder, { recursive: true });
  }
});

test('expect downloadAndExtractImage works with zstd', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // use nock to mock http responses

  // create a tar file with a package.json file inside
  const tmpTarFolder = path.resolve(os.tmpdir(), 'tar-test-folder');

  const tmpTar1Folder = path.resolve(tmpTarFolder, 'tar1');
  const tmpZstFile = path.resolve(tmpTar1Folder, '1.tar.zst');
  await fs.promises.mkdir(tmpTar1Folder, { recursive: true });

  // write a hello world as zst content
  fs.writeFileSync(tmpZstFile, 'Hello World');

  const readTarZstFile = (): Buffer => {
    return fs.readFileSync(tmpZstFile);
  };

  // mock http responses
  const handlers = [
    // multi-arch index

    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/latest', () =>
      HttpResponse.json(imageRegistryManifestMultiArchJson),
    ),
    // image index
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0',
      () => HttpResponse.json(imageRegistryManifestZstdJson),
    ),

    // file 1
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/blobs/sha256:ec4d84bbb887a9dba10a4551252dde152bbb42e3b02e501b44218c9c5425eac4',
      () =>
        new HttpResponse(readTarZstFile(), {
          headers: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment; filename=reply_file_1.tar.gz',
          },
        }),
    ),

    // file 2
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/blobs/sha256:dc0c1d0e36ea3e0b94af099c9b96012743ae22e1797eaff3308895335513d454',
      () =>
        new HttpResponse(readTarZstFile(), {
          headers: {
            'content-type': 'application/octet-stream',
            'content-disposition': 'attachment; filename=reply_file_2.tar.gz',
          },
        }),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const destFolder = path.resolve(os.tmpdir(), 'test-folder');
  const logFn = vi.fn();

  vi.mocked(decompressZstd).mockResolvedValue();
  const spyExtract = vi.spyOn(nodeTar, 'extract').mockResolvedValue();

  try {
    await imageRegistry.downloadAndExtractImage('my-podman-desktop-fake-registry.io/my/extension', destFolder, logFn);

    // check that the folder exists and files are there
    const existFolder = fs.existsSync(destFolder);
    expect(existFolder).toBeTruthy();

    // expect some traces in the logger
    expect(logFn).toHaveBeenCalled();

    expect(decompressZstd).toHaveBeenCalledWith(expect.stringContaining('.zst'), expect.stringContaining('.tar'));
    expect(spyExtract).toHaveBeenCalledWith({ cwd: destFolder, file: expect.stringContaining('.tar') });
  } finally {
    // remove the folders
    await fs.promises.rm(tmpTarFolder, { recursive: true });
    await fs.promises.rm(destFolder, { recursive: true });
  }
});

test('expect downloadAndExtractImage to remove the temporary files when decompression fails', async () => {
  vi.spyOn(imageRegistry, 'getAuthInfo').mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });
  vi.spyOn(imageRegistry, 'getToken').mockResolvedValue('12345');

  server = setupServer(
    http.get('https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/latest', () =>
      HttpResponse.json(imageRegistryManifestMultiArchJson),
    ),
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0',
      () => HttpResponse.json(imageRegistryManifestZstdJson),
    ),
    http.get(
      'https://my-podman-desktop-fake-registry.io/v2/my/extension/blobs/:digest',
      () => new HttpResponse('zstd-content', { headers: { 'content-type': 'application/octet-stream' } }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const destFolder = path.resolve(os.tmpdir(), 'test-folder');
  // the layer is rejected, as a decompression bomb would be
  vi.mocked(decompressZstd).mockRejectedValue(new Error('possible decompression bomb'));

  try {
    await expect(
      imageRegistry.downloadAndExtractImage('my-podman-desktop-fake-registry.io/my/extension', destFolder, vi.fn()),
    ).rejects.toThrow('possible decompression bomb');

    // both the downloaded archive and the unpacked file must be gone
    const tmpFile = path.resolve(
      os.tmpdir(),
      'sha256_ec4d84bbb887a9dba10a4551252dde152bbb42e3b02e501b44218c9c5425eac4.zst',
    );
    expect(fs.existsSync(tmpFile)).toBeFalsy();
    expect(fs.existsSync(tmpFile.replace('.zst', '.tar'))).toBeFalsy();
  } finally {
    await fs.promises.rm(destFolder, { recursive: true, force: true });
  }
});

describe('expect checkCredentials', async () => {
  test('expect checkCredentials works', async () => {
    const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
    spyGetAuthInfo.mockResolvedValue({ authUrl: 'foo', scheme: 'bearer' });

    const spydoCheckCredentials = vi.spyOn(imageRegistry, 'doCheckCredentials');
    spydoCheckCredentials.mockResolvedValue();

    await imageRegistry.checkCredentials(
      'my-podman-desktop-fake-registry.io/my/extension',
      'my-username',
      'my-password',
    );
  });

  test('expect checkCredentials works with a localhost registry', async () => {
    const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
    spyGetAuthInfo.mockResolvedValue({ authUrl: 'foo', scheme: 'bearer' });

    const spydoCheckCredentials = vi.spyOn(imageRegistry, 'doCheckCredentials');
    spydoCheckCredentials.mockResolvedValue();

    await imageRegistry.checkCredentials('localhost:5000', 'my-username', 'my-password');
  });

  test('expect checkCredentials works with ignoring the certificate', async () => {
    const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
    spyGetAuthInfo.mockResolvedValue({ authUrl: 'foo', scheme: 'bearer' });

    const spydoCheckCredentials = vi.spyOn(imageRegistry, 'doCheckCredentials');
    spydoCheckCredentials.mockResolvedValue();

    await imageRegistry.checkCredentials(
      'my-podman-desktop-fake-registry.io/my/extension',
      'my-username',
      'my-password',
      true,
    );
  });

  test('test checkCredentials fails with a wrong registry input', async () => {
    const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
    spyGetAuthInfo.mockResolvedValue({ authUrl: 'foo', scheme: 'bearer' });

    const spydoCheckCredentials = vi.spyOn(imageRegistry, 'doCheckCredentials');
    spydoCheckCredentials.mockResolvedValue();

    await expect(imageRegistry.checkCredentials(':', 'my-username', 'my-password')).rejects.toThrow(
      'The format of the Registry Location is incorrect.',
    );
  });

  test('expect checkCredentials fails', async () => {
    const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
    spyGetAuthInfo.mockResolvedValue({ authUrl: 'foo', scheme: 'bearer' });

    const spydoCheckCredentials = vi.spyOn(imageRegistry, 'doCheckCredentials');
    spydoCheckCredentials.mockResolvedValue();

    await expect(imageRegistry.checkCredentials('----', 'my-username', 'my-password')).rejects.toThrow(
      'The format of the Registry Location is incorrect.',
    );
  });

  test('should add a registry and return a Disposable when registering a registry', () => {
    const reg1: Registry = {
      source: 'a-source',
      serverUrl: 'an-url',
      username: 'a-username',
      secret: 'pass',
    };
    const res1 = imageRegistry.registerRegistry(reg1);
    expectTypeOf(res1).toMatchTypeOf({} as Disposable);
    // Make a non-readonly copy, as readonly arrays are not supported by toBeArray
    const newRegistries: Registry[] = [...imageRegistry.getRegistries()];
    expect(newRegistries).toBeDefined();
    expectTypeOf(newRegistries).toBeArray();
    expect(newRegistries.length).toBe(1);
  });

  test('should not duplicate a registry, and return a Disposable, when registering a registry twice', () => {
    const reg1: Registry = {
      source: 'a-source',
      serverUrl: 'an-url',
      username: 'a-username',
      secret: 'pass',
    };
    const res1 = imageRegistry.registerRegistry(reg1);
    expectTypeOf(res1).toMatchTypeOf({} as Disposable);
    const registries1: Registry[] = [...imageRegistry.getRegistries()];
    expect(registries1).toBeDefined();
    expectTypeOf(registries1).toBeArray();
    expect(registries1.length).toBe(1);

    const res2 = imageRegistry.registerRegistry(reg1);
    expectTypeOf(res2).toMatchTypeOf({} as Disposable);
    const registries2: Registry[] = [...imageRegistry.getRegistries()];
    expect(registries2).toBeDefined();
    expectTypeOf(registries2).toBeArray();
    expect(registries2.length).toBe(1);
  });
});

test('getRegistryConfig should return only valid registries if validateRegistries is true', async () => {
  const spyCheckCredentials = vi.spyOn(imageRegistry, 'checkCredentials');
  spyCheckCredentials.mockRejectedValueOnce(new Error('something went wrong'));
  spyCheckCredentials.mockResolvedValueOnce(undefined);
  spyCheckCredentials.mockResolvedValueOnce(undefined);
  spyCheckCredentials.mockRejectedValueOnce(new Error('something went wrong'));

  const registries: Registry[] = [...imageRegistry.getRegistries()];
  expect(registries).toBeDefined();
  expectTypeOf(registries).toBeArray();
  expect(registries.length).toBe(0);

  const reg1: Registry = {
    source: 'a-source-1',
    serverUrl: 'an-url-1',
    username: 'a-username-1',
    secret: 'pass-1',
  };

  const reg2: Registry = {
    source: 'a-source-2',
    serverUrl: 'An-url-2',
    username: 'a-username-2',
    secret: 'pass-2',
  };

  const reg3: Registry = {
    source: 'a-source-3',
    serverUrl: 'an-url-3',
    username: 'a-username-3',
    secret: 'pass-3',
  };

  const reg4: Registry = {
    source: 'a-source-4',
    serverUrl: 'an-url-4',
    username: 'a-username-4',
    secret: 'pass-4',
  };

  imageRegistry.registerRegistry(reg1);
  imageRegistry.registerRegistry(reg2);
  imageRegistry.registerRegistry(reg3);
  imageRegistry.registerRegistry(reg4);

  expect(imageRegistry.getRegistries().length).toBe(4);

  const registryConfig = await imageRegistry.getRegistryConfig(false);

  expect(Object.keys(registryConfig).length).toBe(4);
  expect(Object.keys(registryConfig)).toContain('an-url-1');
  expect(Object.keys(registryConfig)).toContain('an-url-2');
  expect(Object.keys(registryConfig)).toContain('an-url-3');
  expect(Object.keys(registryConfig)).toContain('an-url-4');

  const validRegistryConfig = await imageRegistry.getRegistryConfig(true);

  expect(Object.keys(validRegistryConfig).length).toBe(2);
  expect(Object.keys(validRegistryConfig)).toContain('an-url-2');
  expect(Object.keys(validRegistryConfig)).toContain('an-url-3');
});

test('findBestManifest returns the expected manifest', () => {
  const manifests = {
    'linux-amd64': {
      platform: {
        architecture: 'amd64',
        os: 'linux',
      },
      name: 'linux-amd64',
    },
    'linux-arm64': {
      platform: {
        architecture: 'arm64',
        os: 'linux',
      },
      name: 'linux-arm64',
    },
    'windows-amd64': {
      platform: {
        architecture: 'amd64',
        os: 'windows',
      },
      name: 'windows-amd64',
    },
    'windows-arm64': {
      platform: {
        architecture: 'arm64',
        os: 'windows',
      },
      name: 'windows-arm64',
    },
    'darwin-amd64': {
      platform: {
        architecture: 'amd64',
        os: 'darwin',
      },
      name: 'darwin-amd64',
    },
  };

  // Exact matches
  expect(
    imageRegistry.findBestManifest(
      [manifests['linux-amd64'], manifests['linux-arm64'], manifests['windows-amd64'], manifests['windows-arm64']],
      'amd64',
      'linux',
    ),
  ).toHaveProperty('name', 'linux-amd64');
  expect(
    imageRegistry.findBestManifest(
      [manifests['linux-amd64'], manifests['linux-arm64'], manifests['windows-amd64'], manifests['windows-arm64']],
      'amd64',
      'windows',
    ),
  ).toHaveProperty('name', 'windows-amd64');

  // Linux by default
  expect(
    imageRegistry.findBestManifest(
      [manifests['linux-amd64'], manifests['linux-arm64'], manifests['windows-amd64'], manifests['windows-arm64']],
      'amd64',
      'darwin',
    ),
  ).toHaveProperty('name', 'linux-amd64');
  expect(
    imageRegistry.findBestManifest([manifests['windows-amd64'], manifests['linux-amd64']], 'amd64', 'darwin'),
  ).toHaveProperty('name', 'linux-amd64');

  // Only one os by default
  expect(
    imageRegistry.findBestManifest([manifests['windows-arm64'], manifests['windows-amd64']], 'amd64', 'darwin'),
  ).toBeUndefined();
  expect(
    imageRegistry.findBestManifest([manifests['windows-arm64'], manifests['windows-amd64']], 'arm64', 'darwin'),
  ).toBeUndefined();
  expect(
    imageRegistry.findBestManifest([manifests['windows-arm64'], manifests['windows-amd64']], 'unknown-arch', 'darwin'),
  ).toBeUndefined();

  // amd64 arch by default, linux os by default
  expect(
    imageRegistry.findBestManifest([manifests['windows-amd64'], manifests['linux-amd64']], 'arm64', 'darwin'),
  ).toHaveProperty('name', 'linux-amd64');

  // no default OS found
  expect(
    imageRegistry.findBestManifest([manifests['windows-amd64'], manifests['darwin-amd64']], 'amd64', 'linux'),
  ).toBeUndefined();
});

test('getManifestFromUrl returns the expected manifest with mediaType', async () => {
  const fakeManifest = {
    schemaVersion: 2,
    mediaType: 'application/vnd.oci.image.index.v1+json',
    manifests: [],
  };

  // mock http responses
  const handlers = [
    // image index

    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/latest', () =>
      HttpResponse.json(fakeManifest),
    ),
    // image index
    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/1234', () =>
      HttpResponse.json({ endManifest: true }),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  // mock findBestManifest
  const spyFindBestManifest = vi.spyOn(imageRegistry, 'findBestManifest');
  spyFindBestManifest.mockReturnValue({
    digest: 1234,
  });

  const manifest = await imageRegistry.getManifest(
    {
      name: 'foo/bar',
      tag: 'latest',
      registry: 'my-podman-desktop-fake-registry.io',
      registryURL: 'https://my-podman-desktop-fake-registry.io/v2',
    },
    'dummyToken',
  );

  expect(manifest).toBeDefined();
  expect(manifest).toHaveProperty('endManifest', true);
  expect(spyFindBestManifest).toHaveBeenCalled();
});

test('getManifestFromUrl returns the expected manifest without mediaType but with manifests', async () => {
  const fakeManifest = {
    schemaVersion: 2,
    manifests: [
      {
        dummyManifest: true,
      },
    ],
  };

  // mock http responses
  const handlers = [
    // image index

    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/latest', () =>
      HttpResponse.json(fakeManifest),
    ),
    // image index
    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/1234', () =>
      HttpResponse.json({ endManifest: true }),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  // mock findBestManifest
  const spyFindBestManifest = vi.spyOn(imageRegistry, 'findBestManifest');
  spyFindBestManifest.mockReturnValue({
    digest: 1234,
  });

  const manifest = await imageRegistry.getManifest(
    {
      name: 'foo/bar',
      tag: 'latest',
      registry: 'my-podman-desktop-fake-registry.io',
      registryURL: 'https://my-podman-desktop-fake-registry.io/v2',
    },
    'dummyToken',
  );

  expect(manifest).toBeDefined();
  expect(manifest).toHaveProperty('endManifest', true);
  expect(spyFindBestManifest).toHaveBeenCalled();
});

test('getManifestFromUrl returns the expected manifest with docker manifest v2', async () => {
  const fakeManifest = {
    schemaVersion: 2,
    mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
    manifests: [
      {
        name: 'docker-manifest',
        mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
      },
      {
        name: 'unknown-manifest',
        mediaType: 'unknown',
      },
    ],
  };

  // mock http responses
  const handlers = [
    // image index

    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/latest', () =>
      HttpResponse.json(fakeManifest),
    ),
    // image index
    http.get('https://my-podman-desktop-fake-registry.io/v2/foo/bar/manifests/1234', () =>
      HttpResponse.json({ endManifest: true }),
    ),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  // mock findBestManifest
  const spyFindBestManifest = vi.spyOn(imageRegistry, 'findBestManifest');
  spyFindBestManifest.mockReturnValue({
    digest: 1234,
  });

  const manifest = await imageRegistry.getManifest(
    {
      name: 'foo/bar',
      tag: 'latest',
      registry: 'my-podman-desktop-fake-registry.io',
      registryURL: 'https://my-podman-desktop-fake-registry.io/v2',
    },
    'dummyToken',
  );

  expect(manifest).toBeDefined();
  expect(manifest).toHaveProperty('endManifest', true);
  expect(spyFindBestManifest).toHaveBeenCalled();
  // check first item of the call and first element of the array
  expect(spyFindBestManifest.mock.calls[0]?.[0][0]).contains({ name: 'docker-manifest' });
});

test('getAuthconfigForServer returns the expected authconfig', async () => {
  imageRegistry.registerRegistry({
    serverUrl: 'my-podman-desktop-fake-registry.io',
    username: 'foo',
    secret: 'my-secret',
    source: 'podman-desktop',
  });
  const config = imageRegistry.getAuthconfigForServer('my-podman-desktop-fake-registry.io');

  expect(config).toBeDefined();
  expect(config?.username).toBe('foo');
  expect(config?.password).toBe('my-secret');
  expect(config?.serveraddress).toBe('my-podman-desktop-fake-registry.io');
});

test('getAuthconfigForServer returns docker.io authconfig when server is index.docker.io', async () => {
  imageRegistry.registerRegistry({
    serverUrl: 'docker.io',
    username: 'foo',
    secret: 'my-secret',
    source: 'podman-desktop',
  });
  const config = imageRegistry.getAuthconfigForServer('index.docker.io');

  expect(config).toBeDefined();
  expect(config?.username).toBe('foo');
  expect(config?.password).toBe('my-secret');
  expect(config?.serveraddress).toBe('https://index.docker.io/v2/');
});

test('getToken with registry auth', async () => {
  imageRegistry.registerRegistry({
    serverUrl: 'my-podman-desktop-fake-registry.io',
    username: 'foo',
    secret: 'my-secret',
    source: 'podman-desktop',
  });

  // mock http responses
  const handlers = [
    // image index

    http.get('https://my-podman-desktop-fake-registry.io', info => {
      // expect that the authorization header will be set by the getToken method
      expect(info.request.headers.get('authorization')).toBe('Basic Zm9vOm15LXNlY3JldA==');
      return HttpResponse.json({ token: '12345' });
    }),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const token = await imageRegistry.getToken(
    {
      authUrl: 'https://my-podman-desktop-fake-registry.io',
      scheme: 'http',
    },
    {
      name: 'foo/bar',
      tag: 'latest',
      registry: 'my-podman-desktop-fake-registry.io',
      registryURL: 'https://my-podman-desktop-fake-registry.io/v2',
    },
  );

  expect(token).toBeDefined();
  expect(token).toBe('12345');
});

test('getToken without registry auth', async () => {
  // mock http responses
  const handlers = [
    // image index

    http.get('https://my-podman-desktop-fake-registry.io/', () => HttpResponse.json({ token: '12345' })),
  ];
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  const token = await imageRegistry.getToken(
    {
      authUrl: 'https://my-podman-desktop-fake-registry.io',
      scheme: 'http',
    },
    {
      name: 'foo/bar',
      tag: 'latest',
      registry: 'my-podman-desktop-fake-registry.io',
      registryURL: 'https://my-podman-desktop-fake-registry.io/v2',
    },
  );

  expect(token).toBeDefined();
  expect(token).toBe('12345');
});

test('getOptions returns dispatcher for insecure mode', () => {
  imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);
  const options = imageRegistry.getOptions({ insecure: true }) as RequestInit;
  expect(options.dispatcher).toBeDefined();
});

test('getOptions selects the proxy matching the target protocol', () => {
  pxoxyIsEnabledMock.mockReturnValue(true);
  // only an https proxy is configured
  proxyGetProxyMock.mockReturnValue({
    httpProxy: undefined,
    httpsProxy: 'http://127.0.0.1:3128',
    noProxy: undefined,
  });
  imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);

  // an https target uses the https proxy
  const secure = imageRegistry.getOptions({ url: 'https://registry.local/v2/', insecure: true }) as RequestInit;
  expect(secure.dispatcher).toBeInstanceOf(ProxyAgent);

  // an http target must not fall back to the https proxy
  const insecure = imageRegistry.getOptions({ url: 'http://registry.local/v2/', insecure: true }) as RequestInit;
  expect(insecure.dispatcher).not.toBeInstanceOf(ProxyAgent);
});

test('getOptions returns empty for non-insecure mode', () => {
  imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);
  const options = imageRegistry.getOptions();
  expect(options).toEqual({});
});

test('searchImages with proxy', async () => {
  pxoxyIsEnabledMock.mockReturnValue(true);
  proxyGetProxyMock.mockReturnValue({
    httpProxy: 'http://localhost:9128',
    httpsProxy: 'http://locahost:9128',

    noProxy: '',
  });
  imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);

  const handlers = [
    http.get('https://index.docker.io/v1/search', () => {
      return new HttpResponse('', { status: 500, statusText: 'a proxy error' });
    }),
  ];

  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'error' });

  await expect(imageRegistry.searchImages({ query: 'anything' })).rejects.toThrow('searching images');
});

test('searchImages without registry', async () => {
  const list = [
    {
      name: 'image1',
      description: 'desc',
    },
  ];
  server = setupServer(http.get('https://index.docker.io/v1/search', () => HttpResponse.json({ results: list })));
  server.listen({ onUnhandledRequest: 'error' });
  const result = await imageRegistry.searchImages({ query: 'http', limit: 10 });
  expect(result).toEqual(list);
});

test('searchImages without limit', async () => {
  const list = [
    {
      name: 'image1',
      description: 'desc',
    },
  ];
  server = setupServer(http.get('https://index.docker.io/v1/search', () => HttpResponse.json({ results: list })));
  server.listen({ onUnhandledRequest: 'error' });
  const result = await imageRegistry.searchImages({ query: 'http' });
  expect(result).toEqual(list);
});

test.each([
  { registry: 'docker.io', expectedUrl: 'https://index.docker.io/v1/search' },
  { registry: 'quay.io', expectedUrl: 'https://quay.io/v1/search' },
  { registry: 'https://quay.io', expectedUrl: 'https://quay.io/v1/search' },
])('searchImages with registry $registry', async ({ registry, expectedUrl }) => {
  const list = [
    {
      name: 'image1',
      description: 'desc',
    },
  ];
  server = setupServer(http.get(expectedUrl, () => HttpResponse.json({ results: list })));
  server.listen({ onUnhandledRequest: 'error' });
  const result = await imageRegistry.searchImages({ registry, query: 'http', limit: 10 });
  expect(result).toEqual(list);
});

test('listImageTags', async () => {
  vi.spyOn(imageRegistry, 'extractImageDataFromImageName').mockReturnValue({
    name: 'a-name',
    tag: 'a-tag',
    registry: 'a-registry',
    registryURL: 'https://registry.example.com/v2',
  });
  vi.spyOn(imageRegistry, 'getAuthInfo').mockResolvedValue({
    authUrl: 'https://auth.example.com',
    scheme: 'bearer',
  });
  vi.spyOn(imageRegistry, 'getOptions').mockReturnValue({});
  vi.spyOn(imageRegistry, 'getToken').mockResolvedValue('a.token');
  server = setupServer(
    http.get('https://registry.example.com/v2/a-name/tags/list', () => HttpResponse.json({ tags: ['1', '2', '3'] })),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const result = await imageRegistry.listImageTags({ image: 'an-image' });
  expect(result).toEqual(['1', '2', '3']);
});

describe('getDigestFromImageName', () => {
  test('single-arch image: should return platform digest with no listDigest', async () => {
    vi.spyOn(imageRegistry, 'getAuthInfo').mockResolvedValue({ authUrl: 'https://auth.example.com', scheme: 'bearer' });
    vi.spyOn(imageRegistry, 'getToken').mockResolvedValue('test-token');
    vi.spyOn(
      imageRegistry as unknown as { getManifestFromURL: () => Promise<unknown> },
      'getManifestFromURL',
    ).mockResolvedValue({ manifest: {}, digest: 'sha256:abc123' });

    const result = await imageRegistry.getDigestFromImageName('nginx:latest');
    expect(result.digest).toBe('sha256:abc123');
    expect(result.listDigest).toBeUndefined();
  });

  test('multi-arch image: should return both platform digest and listDigest', async () => {
    vi.spyOn(imageRegistry, 'getAuthInfo').mockResolvedValue({ authUrl: 'https://auth.example.com', scheme: 'bearer' });
    vi.spyOn(imageRegistry, 'getToken').mockResolvedValue('test-token');
    vi.spyOn(
      imageRegistry as unknown as { getManifestFromURL: () => Promise<unknown> },
      'getManifestFromURL',
    ).mockResolvedValue({ manifest: {}, digest: 'sha256:platform', listDigest: 'sha256:list' });

    const result = await imageRegistry.getDigestFromImageName('nginx:latest');
    expect(result.digest).toBe('sha256:platform');
    expect(result.listDigest).toBe('sha256:list');
  });

  test('should throw when digest is missing from response', async () => {
    vi.spyOn(imageRegistry, 'getAuthInfo').mockResolvedValue({ authUrl: 'https://auth.example.com', scheme: 'bearer' });
    vi.spyOn(imageRegistry, 'getToken').mockResolvedValue('test-token');
    vi.spyOn(
      imageRegistry as unknown as { getManifestFromURL: () => Promise<unknown> },
      'getManifestFromURL',
    ).mockResolvedValue({ manifest: {}, digest: undefined });

    await expect(imageRegistry.getDigestFromImageName('nginx:latest')).rejects.toThrow(
      'Registry did not return a digest',
    );
  });
});

describe('checkImageUpdateStatus', () => {
  test('should return not updatable for digest-based image references', async () => {
    const result = await imageRegistry.checkImageUpdateStatus('nginx:sha256:abc123', 'sha256:abc123', []);

    expect(result.status).toBe('skipped');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('digest');
  });

  test('should return not updatable for image reference with @sha256: format', async () => {
    const result = await imageRegistry.checkImageUpdateStatus(
      'quay.io/ramalama/ramalama-whisper-server@sha256:2ce4e2751672e3baf76d6f220100160da86ff5a98001b76392aeae9da2d90b18',
      '2ce4e2751672e3baf76d6f220100160da86ff5a98001b76392aeae9da2d90b18',
      [],
    );

    expect(result.status).toBe('skipped');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('digest');
  });

  test('should return success for local image that cannot be updated from registry', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockRejectedValue(
      new Error('Image localhost/mylocal:latest not found in registry'),
    );

    const result = await imageRegistry.checkImageUpdateStatus('localhost/mylocal:latest', 'latest', []);

    expect(result.status).toBe('normal');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('local');
  });

  test('should return error status if authentication fails', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockRejectedValue(
      new Error('Authentication failed for private.registry.io'),
    );

    const result = await imageRegistry.checkImageUpdateStatus('private.registry.io/image:latest', 'latest', []);

    expect(result.status).toBe('error');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('Authentication failed');
  });

  test('should return update available when remote digest differs', async () => {
    const remoteDigest = 'sha256:newdigest';
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockResolvedValue({ digest: remoteDigest });

    const result = await imageRegistry.checkImageUpdateStatus('nginx:latest', 'latest', ['nginx@sha256:olddigest']);

    expect(result.status).toBe('normal');
    expect(result.updateAvailable).toBe(true);
    expect(result.remoteDigest).toBe(remoteDigest);
    expect(result.message).toContain('new version');
  });

  test('should return no update available when already latest version', async () => {
    const remoteDigest = 'sha256:samedigest';
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockResolvedValue({ digest: remoteDigest });

    const result = await imageRegistry.checkImageUpdateStatus('nginx:latest', 'latest', ['nginx@sha256:samedigest']);

    expect(result.status).toBe('normal');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('already the latest');
  });

  // Multi-arch image tests: Docker and Podman both store manifest list digest in RepoDigests
  test('multi-arch image: should match using list digest (Docker/Podman store list digest)', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockResolvedValue({
      digest: 'sha256:platformdigest',
      listDigest: 'sha256:listdigest',
    });

    // localDigests contains the list digest (as stored by Docker/Podman for multi-arch)
    const result = await imageRegistry.checkImageUpdateStatus('nginx:latest', 'latest', ['nginx@sha256:listdigest']);

    expect(result.updateAvailable).toBe(false);
  });

  // Single-arch image tests: Both runtimes store platform digest only
  test('single-arch image: should match using platform digest (no listDigest)', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockResolvedValue({
      digest: 'sha256:platformdigest',
      listDigest: undefined,
    });

    // localDigests contains the platform digest (single-arch image)
    const result = await imageRegistry.checkImageUpdateStatus('nginx:latest', 'latest', [
      'nginx@sha256:platformdigest',
    ]);

    expect(result.updateAvailable).toBe(false);
  });

  test('should return update available when digest does not match', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockResolvedValue({
      digest: 'sha256:newplatform',
      listDigest: 'sha256:newlist',
    });

    // localDigests has an old digest that doesn't match either remote digest
    const result = await imageRegistry.checkImageUpdateStatus('nginx:latest', 'latest', ['nginx@sha256:olddigest']);

    expect(result.updateAvailable).toBe(true);
  });

  test('should detect local image with localhost: prefix', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockRejectedValue(new Error('Not found'));

    const result = await imageRegistry.checkImageUpdateStatus('localhost:5000/myimage:tag', 'tag', []);

    expect(result.status).toBe('normal');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('local');
  });

  test('should detect local image with :local tag', async () => {
    vi.spyOn(imageRegistry, 'getDigestFromImageName').mockRejectedValue(new Error('Not found'));

    const result = await imageRegistry.checkImageUpdateStatus('myimage:local', 'local', []);

    expect(result.status).toBe('normal');
    expect(result.updateAvailable).toBe(false);
    expect(result.message).toContain('local');
  });
});
