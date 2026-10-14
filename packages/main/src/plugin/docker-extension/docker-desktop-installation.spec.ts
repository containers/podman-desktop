/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import * as fs from 'node:fs';

import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { RequestConfig } from '@docker/extension-api-client-types/dist/v1/http-service.js';
import type Dockerode from 'dockerode';
import type { IpcMainEvent } from 'electron';
import { http, HttpResponse } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { Directories } from '/@/plugin/directories.js';

import { DockerDesktopInstallation } from './docker-desktop-installation.js';

vi.mock(import('node:fs'));

let dockerDesktopInstallation: TestDockerDesktopInstallation;

const contributionManagerLoadMetadataMock = vi.fn();
const contributionManagerInitMock = vi.fn();
const contributionManagerFindComposeBinaryMock = vi.fn();
const contributionManagerEnhanceComposeFileMock = vi.fn();
const containerProviderStartVMMock = vi.fn();
const contributionManager = {
  init: contributionManagerInitMock,
  loadMetadata: contributionManagerLoadMetadataMock,
  findComposeBinary: contributionManagerFindComposeBinaryMock,
  enhanceComposeFile: contributionManagerEnhanceComposeFileMock,
  startVM: containerProviderStartVMMock,
} as unknown as ContributionManager;

const containerProviderGetFirstRunningConnectionMock = vi.fn();
const containerProviderRegistryPullImageMock = vi.fn();
const containerProviderRegistry = {
  getFirstRunningConnection: containerProviderGetFirstRunningConnectionMock,
  pullImage: containerProviderRegistryPullImageMock,
} as unknown as ContainerProviderRegistry;
const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getContributionStorageDir: () => '/fake-contribution-storage-directory',
} as unknown as Directories;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

let server: SetupServer | undefined = undefined;

class TestDockerDesktopInstallation extends DockerDesktopInstallation {
  override isHttpMethod(methodName: string): boolean {
    return super.isHttpMethod(methodName);
  }

  override assertHttpMethod(methodName: string): string {
    return super.assertHttpMethod(methodName);
  }

  override async handleExtensionVMServiceRequest(port: string, config: RequestConfig): Promise<unknown> {
    return super.handleExtensionVMServiceRequest(port, config);
  }

  override async handlePluginInstall(event: IpcMainEvent, imageName: string, logCallbackId: number): Promise<void> {
    return super.handlePluginInstall(event, imageName, logCallbackId);
  }
}

beforeAll(async () => {
  dockerDesktopInstallation = new TestDockerDesktopInstallation(
    apiSender,
    containerProviderRegistry,
    contributionManager,
    directories,
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  server?.close();
});

test('Check isHttpMethod', async () => {
  expect(dockerDesktopInstallation.isHttpMethod('GET')).toBeTruthy();
  expect(dockerDesktopInstallation.isHttpMethod('get')).toBeTruthy();
  expect(dockerDesktopInstallation.isHttpMethod('put')).toBeTruthy();
  expect(dockerDesktopInstallation.isHttpMethod('POST')).toBeTruthy();
  expect(dockerDesktopInstallation.isHttpMethod('delete')).toBeTruthy();

  // invalid
  expect(dockerDesktopInstallation.isHttpMethod('ff')).toBeFalsy();
});

test('Check asHttpMethod', async () => {
  expect(dockerDesktopInstallation.assertHttpMethod('GET')).toBe('GET');
  expect(dockerDesktopInstallation.assertHttpMethod('get')).toBe('get');

  expect(() => dockerDesktopInstallation.assertHttpMethod('foobar')).toThrowError('Invalid method');
});

describe('handleExtensionVMServiceRequest', () => {
  const checkMessage = (result: unknown, expected: string): void => {
    expect(result && typeof result === 'object' && 'message' in result).toBeTruthy();
    let message: unknown = '';
    if (result && typeof result === 'object' && 'message' in result) {
      message = result.message;
    }
    expect(message).toBe(expected);
  };

  test('Check GET raw text', async () => {
    const reply = 'hello world';
    server = setupServer(http.get('http://localhost:10000/foo/bar', () => new HttpResponse(reply)));
    server.listen({ onUnhandledRequest: 'error' });

    const result = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'GET',
      url: '/foo/bar',
      headers: {},
      data: undefined,
    });

    // check response
    expect(result).toBe(reply);
  });

  test('Check GET with JSON', async () => {
    const reply = {
      message: 'hello world',
    };
    server = setupServer(http.get('http://localhost:10000/foo/bar', () => HttpResponse.json(reply)));
    server.listen({ onUnhandledRequest: 'error' });

    const result = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'GET',
      url: '/foo/bar',
      headers: {
        'X-foo': 'foobar',
      },
      data: undefined,
    });

    // check content is JSON and with correct output
    checkMessage(result, 'hello world');
  });

  test('Check POST with JSON', async () => {
    const dataToSend = {
      foo: 'bar',
    };

    const reply = {
      message: 'hello world',
    };

    server = setupServer(
      http.post('http://localhost:10000/foo/bar', async info => {
        const bodyContent = await new Response(info.request.body).text();
        expect(bodyContent).toEqual(JSON.stringify(dataToSend));
        return HttpResponse.json(reply);
      }),
    );
    server.listen({ onUnhandledRequest: 'error' });

    const result = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'POST',
      url: '/foo/bar',
      headers: {},
      data: dataToSend,
    });

    // check content is JSON and with correct output
    checkMessage(result, 'hello world');
  });

  test('Check DELETE ', async () => {
    const reply = {
      message: 'hello world',
    };

    server = setupServer(http.delete('http://localhost:10000/foo/bar', () => HttpResponse.json(reply)));
    server.listen({ onUnhandledRequest: 'error' });

    const result = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'DELETE',
      url: '/foo/bar',
      headers: { 'X-foo': 'foobar' },
      data: undefined,
    });

    // check content is JSON and with correct output
    checkMessage(result, 'hello world');
  });

  test('Check PUT access 401', async () => {
    // errror
    server = setupServer(http.put('http://localhost:10000/foo/bar', () => new HttpResponse('', { status: 401 })));
    server.listen({ onUnhandledRequest: 'error' });

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'PUT',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('Unable to get access');
  });

  test('Check PUT access 403', async () => {
    // errror
    server = setupServer(http.put('http://localhost:10000/foo/bar', () => new HttpResponse('', { status: 403 })));
    server.listen({ onUnhandledRequest: 'error' });

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'PUT',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('Unable to get access');
  });

  test('Check PATCH error ', async () => {
    server = setupServer(
      http.patch(
        'http://localhost:10000/foo/bar',
        () => new HttpResponse('', { status: 500, statusText: 'Dummy error' }),
      ),
    );
    server.listen({ onUnhandledRequest: 'error' });

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'PATCH',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('Dummy error');
  });

  test('Check unknown error ', async () => {
    vi.spyOn(dockerDesktopInstallation, 'assertHttpMethod').mockImplementation(() => {
      throw new Error('foo error');
    });

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'Invalid',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('foo error');
  });
});

test('Check handlePluginInstall', async () => {
  const allReplies: string[] = [];

  const ipcMainEventReplyMock = vi.fn().mockImplementation((channel: string, ...args: unknown[]) => {
    allReplies.push(`${channel}=>${args.join(',')}`);
  });

  const ipcMainEvent = {
    reply: ipcMainEventReplyMock,
  } as unknown as IpcMainEvent;

  const imageNameToInstall = 'foo/bar:latest';

  const providerConnectionListImagesMock = vi.fn();
  const providerConnectionGetImageMock = vi.fn();

  const providerConnectionMock = {
    listImages: providerConnectionListImagesMock,
    getImage: providerConnectionGetImageMock,
  } as unknown as Dockerode;

  // mock containerRegistry.getFirstRunningConnection()
  containerProviderGetFirstRunningConnectionMock.mockReturnValue([
    {} as unknown as ProviderContainerConnectionInfo,
    providerConnectionMock,
  ]);

  // mock listImages
  const matchingImage = { RepoTags: [imageNameToInstall], Id: '123456Id' };
  providerConnectionListImagesMock.mockResolvedValue([matchingImage]);

  // mock fs.unlinkSync
  vi.mocked(fs.unlinkSync).mockResolvedValue();

  const imageAnalysis = {
    Config: {
      Labels: {
        'org.opencontainers.image.title': 'FooTitle',
        'org.opencontainers.image.description': 'Foo description',
        'org.opencontainers.image.vendor': 'Foo vendor',
        'com.docker.desktop.extension.api.version': '1.0.0',
      },
    },
  };

  // mock getImage
  providerConnectionGetImageMock.mockReturnValue({
    remove: vi.fn(),
    inspect: vi.fn().mockResolvedValue(imageAnalysis),
  });

  // mock exportContentOfContainer
  vi.spyOn(dockerDesktopInstallation, 'exportContentOfContainer').mockResolvedValue();

  // mock unpackTarFile
  vi.spyOn(dockerDesktopInstallation, 'unpackTarFile').mockResolvedValue();

  // mock extractDockerDesktopFiles
  vi.spyOn(dockerDesktopInstallation, 'extractDockerDesktopFiles').mockResolvedValue();

  // mock findComposeBinary
  contributionManagerFindComposeBinaryMock.mockResolvedValue('/my-compose-binary');

  // mock enhanceComposeFile
  contributionManagerEnhanceComposeFileMock.mockResolvedValue('/my-enhanced-compose-file.yaml');

  contributionManagerLoadMetadataMock.mockResolvedValue({
    name: 'My Extension',
    vm: {
      composefile: 'docker-compose.yaml',
    },
  });

  const logCallbackId = 2503;

  await dockerDesktopInstallation.handlePluginInstall(ipcMainEvent, imageNameToInstall, logCallbackId);

  // check we received end event
  expect(allReplies).toEqual(
    expect.arrayContaining(['docker-desktop-plugin:install-end=>2503,Extension Successfully installed.']),
  );

  // checked no error
  expect(allReplies.filter(line => line.includes('docker-desktop-plugin:install-error')).length).toEqual(0);

  // contribution manager is called
  expect(contributionManagerInitMock).toBeCalled();

  expect(containerProviderStartVMMock).toBeCalledWith('My Extension', '/my-enhanced-compose-file.yaml', true);
});
