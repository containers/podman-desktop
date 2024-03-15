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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';

import type { RequestConfig } from '@docker/extension-api-client-types/dist/v1/http-service.js';
import type Dockerode from 'dockerode';
import type { IpcMainEvent } from 'electron';
import type { Method } from 'got';
import nock from 'nock';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '../api.js';
import type { ProviderContainerConnectionInfo } from '../api/provider-info.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ContributionManager } from '../contribution-manager.js';
import type { Directories } from '../directories.js';
import { DockerDesktopInstallation } from './docker-desktop-installation.js';

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

class TestDockerDesktopInstallation extends DockerDesktopInstallation {
  // transform the method name to a got method
  isGotMethod(methodName: string): methodName is Method {
    return super.isGotMethod(methodName);
  }

  asGotMethod(methodName: string): Method {
    return super.asGotMethod(methodName);
  }

  async handleExtensionVMServiceRequest(port: string, config: RequestConfig): Promise<unknown> {
    return super.handleExtensionVMServiceRequest(port, config);
  }

  async handlePluginInstall(event: IpcMainEvent, imageName: string, logCallbackId: number): Promise<void> {
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

test('Check isGotMethod', async () => {
  expect(dockerDesktopInstallation.isGotMethod('GET')).toBeTruthy();
  expect(dockerDesktopInstallation.isGotMethod('get')).toBeTruthy();
  expect(dockerDesktopInstallation.isGotMethod('put')).toBeTruthy();
  expect(dockerDesktopInstallation.isGotMethod('POST')).toBeTruthy();
  expect(dockerDesktopInstallation.isGotMethod('delete')).toBeTruthy();

  // invalid
  expect(dockerDesktopInstallation.isGotMethod('ff')).toBeFalsy();
});

test('Check asGotMethod', async () => {
  expect(dockerDesktopInstallation.asGotMethod('GET')).toBe('GET');
  expect(dockerDesktopInstallation.asGotMethod('get')).toBe('get');

  expect(() => dockerDesktopInstallation.asGotMethod('foobar')).toThrowError('Invalid method');
});

describe('handleExtensionVMServiceRequest', () => {
  test('Check GET raw text', async () => {
    const reply = 'hello world';

    nock('http://localhost:10000').get('/foo/bar').reply(200, reply);

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

    nock('http://localhost:10000').get('/foo/bar').reply(200, reply);

    const result: any = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'GET',
      url: '/foo/bar',
      headers: {
        'X-foo': 'foobar',
      },
      data: undefined,
    });

    // check content is JSON and with correct output
    expect(result.message).toBe('hello world');
  });

  test('Check POST with JSON', async () => {
    const dataToSend = {
      foo: 'bar',
    };

    const reply = {
      message: 'hello world',
    };
    nock('http://localhost:10000')
      .post('/foo/bar', body => {
        // check that the body is correct
        expect(body).toEqual({ foo: 'bar' });
        return true;
      })
      .reply(200, reply);

    const result: any = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'POST',
      url: '/foo/bar',
      headers: {},
      data: dataToSend,
    });

    // check content is JSON and with correct output
    expect(result.message).toBe('hello world');
  });

  test('Check DELETE ', async () => {
    const reply = {
      message: 'hello world',
    };

    nock('http://localhost:10000').delete('/foo/bar').reply(200, reply);

    const result: any = await dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
      method: 'DELETE',
      url: '/foo/bar',
      headers: { 'X-foo': 'foobar' },
      data: undefined,
    });

    // check content is JSON and with correct output
    expect(result.message).toBe('hello world');
  });

  test('Check PUT access 401', async () => {
    const reply = {
      message: 'hello world',
    };

    // errror
    nock('http://localhost:10000').put('/foo/bar').reply(401, reply);

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
    const reply = {
      message: 'hello world',
    };

    // errror
    nock('http://localhost:10000').put('/foo/bar').reply(403, reply);

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
    // errror
    nock('http://localhost:10000').put('/foo/bar').replyWithError('Dummy error');

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'PUT',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('Dummy error');
  });

  test('Check unknown error ', async () => {
    vi.spyOn(dockerDesktopInstallation, 'asGotMethod').mockImplementationOnce(() => {
      throw 'foo error';
    });

    await expect(
      dockerDesktopInstallation.handleExtensionVMServiceRequest('10000', {
        method: 'Invalid',
        headers: {},
        url: '/foo/bar',
        data: undefined,
      }),
    ).rejects.toThrowError('Unknown error: foo error');
  });
});

test('Check handlePluginInstall', async () => {
  vi.mock('node:fs');

  const allReplies: string[] = [];

  const ipcMainEventReplyMock = vi.fn().mockImplementation((channel: string, ...args: any[]) => {
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
  vi.spyOn(fs, 'unlinkSync').mockResolvedValue();

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
