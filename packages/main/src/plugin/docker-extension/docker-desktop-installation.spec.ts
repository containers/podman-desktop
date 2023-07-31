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

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Method } from 'got';
import type { ContributionManager } from '../contribution-manager.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ApiSenderType } from '../api.js';
import type { Directories } from '../directories.js';
import { DockerDesktopInstallation } from './docker-desktop-installation.js';
import type { RequestConfig } from '@docker/extension-api-client-types/dist/v1/http-service.js';
import nock from 'nock';

let dockerDesktopInstallation: TestDockerDesktopInstallation;

const contributionManager = {} as unknown as ContributionManager;
const containerProviderRegistry = {} as unknown as ContainerProviderRegistry;
const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
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
});
