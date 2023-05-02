/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import type { ApiSenderType } from './api';

import { ImageRegistry } from './image-registry';
import type { Proxy } from './proxy';
import type { Telemetry } from './telemetry/telemetry';
import type { Certificates } from './certificates';
import nock from 'nock';
import * as imageRegistryManifestMultiArchJson from '../../tests/resources/data/plugin/image-registry-manifest-multi-arch-index.json';
import * as imageRegistryManifestJson from '../../tests/resources/data/plugin/image-registry-manifest-index.json';
import * as imageRegistryConfigJson from '../../tests/resources/data/plugin/image-registry-config.json';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as nodeTar from 'tar';

let imageRegistry: ImageRegistry;

beforeAll(async () => {
  const telemetry: Telemetry = {} as Telemetry;
  const certificates: Certificates = {
    init: vi.fn(),
    getAllCertificates: vi.fn(),
  } as unknown as Certificates;
  const proxy: Proxy = {
    onDidStateChange: vi.fn(),
    onDidUpdateProxy: vi.fn(),
    isEnabled: vi.fn(),
  } as unknown as Proxy;

  imageRegistry = new ImageRegistry({} as ApiSenderType, telemetry, certificates, proxy);
});

beforeEach(() => {
  vi.clearAllMocks();
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

describe('extractImageDataFromImageName', () => {
  test('library image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('httpd');
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('library/httpd');
  });

  test('library image with custom tag', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('httpd:1.2.3');
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('1.2.3');
    expect(nameAndTag.name).toBe('library/httpd');
  });

  test('simple image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('foo/bar');
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('foo/bar');
  });

  test('simple image with custom tag', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('foo/bar:myTag');
    expect(nameAndTag.registry).toBe('index.docker.io');
    expect(nameAndTag.registryURL).toBe('https://index.docker.io/v2');
    expect(nameAndTag.tag).toBe('myTag');
    expect(nameAndTag.name).toBe('foo/bar');
  });

  test('quay.io image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('quay.io/foo/bar');
    expect(nameAndTag.registry).toBe('quay.io');
    expect(nameAndTag.registryURL).toBe('https://quay.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('foo/bar');
  });

  test('ghcr.io image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:latest',
    );
    expect(nameAndTag.registry).toBe('ghcr.io');
    expect(nameAndTag.registryURL).toBe('https://ghcr.io/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('redhat-developer/podman-desktop-sandbox-ext');
  });

  test('ghcr.io image with tag', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName(
      'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:myTag',
    );
    expect(nameAndTag.registry).toBe('ghcr.io');
    expect(nameAndTag.registryURL).toBe('https://ghcr.io/v2');
    expect(nameAndTag.tag).toBe('myTag');
    expect(nameAndTag.name).toBe('redhat-developer/podman-desktop-sandbox-ext');
  });

  test('localhost image', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('localhost/myimage');
    expect(nameAndTag.registry).toBe('localhost');
    expect(nameAndTag.registryURL).toBe('https://localhost/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('myimage');
  });

  test('localhost custom port', () => {
    const nameAndTag = imageRegistry.extractImageDataFromImageName('localhost:5000/myimage');
    expect(nameAndTag.registry).toBe('localhost:5000');
    expect(nameAndTag.registryURL).toBe('https://localhost:5000/v2');
    expect(nameAndTag.tag).toBe('latest');
    expect(nameAndTag.name).toBe('myimage');
  });

  test('invalid image protocol', () => {
    expect(() => imageRegistry.extractImageDataFromImageName('https://ghcr.io/foo/bar')).toThrow(
      'Invalid image name: https://ghcr.io/foo/bar',
    );
  });

  test('invalid empty', async () => {
    expect(() => imageRegistry.extractImageDataFromImageName('')).toThrow('Image name is empty');
  });
});

test('expect getImageConfigLabels works', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // use nock to mock http responses

  // multi-arch index
  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/manifests/latest')
    .reply(200, imageRegistryManifestMultiArchJson);

  // image index
  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0')
    .reply(200, imageRegistryManifestJson);

  // config blob
  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/blobs/sha256:2f65da9a67deadfb588660ad7da746c4facba696ea5cf8ab844b281f1c14bb01')
    .reply(200, imageRegistryConfigJson);

  const labels = await imageRegistry.getImageConfigLabels('my-podman-desktop-fake-registry.io/my/extension');
  expect(labels).toBeDefined();
  expect(labels['io.podman-desktop.api.version']).toBe('>= 0.12.0');
  expect(labels['org.opencontainers.image.title']).toBe('OpenShift Local');
  expect(labels['org.opencontainers.image.description']).toBe(
    'Allows the ability to start and stop OpenShift Local and use Podman Desktop to interact with it',
  );
  expect(labels['org.opencontainers.image.vendor']).toBeDefined();
});

test('expect downloadAndExtractImage works', async () => {
  // need to mock the http request
  const spyGetAuthInfo = vi.spyOn(imageRegistry, 'getAuthInfo');
  spyGetAuthInfo.mockResolvedValue({ authUrl: 'http://foobar', scheme: 'bearer' });

  // need to mock the http request
  const spyGetToken = vi.spyOn(imageRegistry, 'getToken');
  spyGetToken.mockResolvedValue('12345');

  // use nock to mock http responses

  // multi-arch index
  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/manifests/latest')
    .reply(200, imageRegistryManifestMultiArchJson);

  // image index
  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/manifests/sha256:791352c5f8969387d576cae0586f24a12e716db584c117a15a6138812ddbaef0')
    .reply(200, imageRegistryManifestJson);

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

  const readTarFile1 = () => {
    return fs.readFileSync(tmpTar1File);
  };
  const readTarFile2 = () => {
    return fs.readFileSync(tmpTar2File);
  };

  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/blobs/sha256:ec4d84bbb887a9dba10a4551252dde152bbb42e3b02e501b44218c9c5425eac4')
    .reply(200, readTarFile1(), {
      'content-type': 'application/octet-stream',
      'content-disposition': 'attachment; filename=reply_file_2.tar.gz',
    });

  nock('https://my-podman-desktop-fake-registry.io')
    .get('/v2/my/extension/blobs/sha256:dc0c1d0e36ea3e0b94af099c9b96012743ae22e1797eaff3308895335513d454')
    .reply(200, readTarFile2(), {
      'content-type': 'application/octet-stream',
      'content-disposition': 'attachment; filename=reply_file_2.tar.gz',
    });

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
