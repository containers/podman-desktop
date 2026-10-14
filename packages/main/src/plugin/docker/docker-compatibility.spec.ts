/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { Stats } from 'node:fs';
import { promises } from 'node:fs';

import type { DockerSocketServerInfoType, ProviderInfo } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { ProviderContainerConnection } from '@desktop-framework/extension-api';
import type * as Dockerode from 'dockerode';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { DefaultConfiguration } from '/@/plugin/default-configuration.js';
import type { Directories } from '/@/plugin/directories.js';
import type { LockedConfiguration } from '/@/plugin/locked-configuration.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import * as util from '/@/util.js';

import { DockerCompatibility } from './docker-compatibility.js';

let configurationRegistry: ConfigurationRegistry;

const providerRegistry: ProviderRegistry = {
  getContainerConnections: vi.fn(),
  getProviderInfos: vi.fn(),
} as unknown as ProviderRegistry;

class TestDockerCompatibility extends DockerCompatibility {
  public override getTypeFromServerInfo(
    info: { OperatingSystem?: string },
    podmanInfo?: unknown,
  ): DockerSocketServerInfoType {
    return super.getTypeFromServerInfo(info, podmanInfo);
  }
}

// mock exists sync
vi.mock(import('node:fs'));

const dockerodeInfoMock = vi.fn();
const dockerodePodmanInfoMock = vi.fn();

vi.mock(import('dockerode'), async () => {
  class DockerodeMock {
    async info(): Promise<unknown> {
      return dockerodeInfoMock();
    }
    async podmanInfo(): Promise<unknown> {
      return dockerodePodmanInfoMock();
    }
  }

  return { default: DockerodeMock } as unknown as typeof Dockerode;
});

vi.mock(import('/@/util.js'));

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  configurationRegistry = new ConfigurationRegistry(
    {} as ApiSenderType,
    {} as Directories,
    {} as DefaultConfiguration,
    {} as LockedConfiguration,
  );
  configurationRegistry.registerConfigurations = vi.fn();
  configurationRegistry.deregisterConfigurations = vi.fn();
});

test('should register a configuration', async () => {
  const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);
  dockerCompatibility.init();

  expect(configurationRegistry.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.dockerCompatibility');
  expect(configurationNode?.title).toBe('Docker Compatibility');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(1);
  expect(configurationNode?.properties?.[TestDockerCompatibility.ENABLED_FULL_KEY]).toBeDefined();
  expect(configurationNode?.properties?.[TestDockerCompatibility.ENABLED_FULL_KEY]?.type).toBe('boolean');
  expect(configurationNode?.properties?.[TestDockerCompatibility.ENABLED_FULL_KEY]?.default).toBeFalsy();
  expect(configurationNode?.properties?.[TestDockerCompatibility.ENABLED_FULL_KEY]?.hidden).toBeFalsy();
});

describe('getTypeFromServerInfo', async () => {
  test('Docker Desktop', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);
    const serverInfo = {
      OperatingSystem: 'Docker Desktop',
    };
    expect(dockerCompatibility.getTypeFromServerInfo(serverInfo)).toBe('docker');
  });

  test('check podman OS without podman info', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);
    const serverInfo = {
      OperatingSystem: 'podman',
    };

    const podmanInfo = undefined;

    expect(dockerCompatibility.getTypeFromServerInfo(serverInfo, podmanInfo)).toBe('podman');
  });

  test('check podman OS with podman info', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);
    const serverInfo = {
      OperatingSystem: 'foo',
    };

    const podmanInfo = {
      ServerVersion: '1.0.0',
    };

    expect(dockerCompatibility.getTypeFromServerInfo(serverInfo, podmanInfo)).toBe('podman');
  });

  test('check unknown', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);
    const serverInfo = {
      OperatingSystem: 'random',
    };

    const podmanInfo = undefined;

    expect(dockerCompatibility.getTypeFromServerInfo(serverInfo, podmanInfo)).toBe('unknown');
  });
});

describe('resolveLinkIfAny', async () => {
  test('on Windows return same path', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    vi.mocked(util.isWindows).mockReturnValue(true);
    const path = '/var/run/docker.sock';
    expect(await dockerCompatibility.resolveLinkIfAny(path)).toBe(path);
  });

  test('on macOS or Linux without symlink return same path', async () => {
    vi.mocked(util.isWindows).mockReturnValue(false);
    const isSymbolicLink = vi.fn();
    vi.spyOn(promises, 'lstat').mockResolvedValue({
      isSymbolicLink,
    } as unknown as Stats);
    vi.mocked(isSymbolicLink).mockReturnValue(false);
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    const path = '/var/run/docker.sock';
    expect(await dockerCompatibility.resolveLinkIfAny(path)).toBe(path);
  });

  test('on macOS or Linux with a symlink return different path', async () => {
    const path = '/var/run/docker.sock';
    const newPath = '/var/run/docker.sock2';

    vi.mocked(util.isWindows).mockReturnValue(false);
    const isSymbolicLink = vi.fn();
    vi.spyOn(promises, 'lstat').mockResolvedValue({
      isSymbolicLink,
    } as unknown as Stats);
    // mock readlink
    vi.spyOn(promises, 'readlink').mockResolvedValue(newPath);
    // symbolic link first and then not a symbolic link
    vi.mocked(isSymbolicLink).mockReturnValueOnce(true);
    vi.mocked(isSymbolicLink).mockReturnValueOnce(false);
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    expect(await dockerCompatibility.resolveLinkIfAny(path)).toBe(newPath);

    // check if readlink is called
    expect(promises.readlink).toBeCalledWith(path);
  });
});

describe('getSystemDockerSocketMappingStatus', async () => {
  test('on Windows', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    vi.spyOn(dockerCompatibility, 'getTypeFromServerInfo').mockReturnValue('docker');
    vi.mocked(util.isWindows).mockReturnValue(true);

    dockerodePodmanInfoMock.mockResolvedValue({
      ServerVersion: '1.0.0',
    });

    dockerodeInfoMock.mockResolvedValue({
      ServerVersion: '1.0.0',
      OperatingSystem: 'podman',
      OSType: 'foo',
      Architecture: 'bar',
    });

    expect(await dockerCompatibility.getSystemDockerSocketMappingStatus()).toEqual({
      serverInfo: {
        architecture: 'bar',
        operatingSystem: 'podman',
        osType: 'foo',
        serverVersion: '1.0.0',
        type: 'docker',
      },
      status: 'running',
    });
  });

  test('error on dockerode call', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    vi.mocked(util.isWindows).mockReturnValue(true);

    dockerodeInfoMock.mockRejectedValue(new Error('test error'));

    expect(await dockerCompatibility.getSystemDockerSocketMappingStatus()).toEqual({
      status: 'unreachable',
    });
  });

  test('on macOS', async () => {
    const dockerCompatibility = new TestDockerCompatibility(configurationRegistry, providerRegistry);

    vi.spyOn(dockerCompatibility, 'getTypeFromServerInfo').mockReturnValue('docker');
    vi.mocked(util.isWindows).mockReturnValue(false);
    vi.mocked(util.isMac).mockReturnValue(true);

    // mock resolveLinkIfAny
    vi.spyOn(dockerCompatibility, 'resolveLinkIfAny').mockResolvedValue(DockerCompatibility.UNIX_SOCKET_PATH);

    // connection
    const connection = {
      providerId: 'fooProvider',
      connection: {
        name: 'myDummyConnection',

        endpoint: {
          socketPath: DockerCompatibility.UNIX_SOCKET_PATH,
        },
      },
    } as unknown as ProviderContainerConnection;
    vi.mocked(providerRegistry.getContainerConnections).mockReturnValue([connection]);

    const providerInfo = {
      id: 'fooProvider',
      name: 'Foo Provider',
      internalId: 'fooProviderInternalId',
    } as unknown as ProviderInfo;
    vi.mocked(providerRegistry.getProviderInfos).mockReturnValue([providerInfo]);

    dockerodePodmanInfoMock.mockResolvedValue({
      ServerVersion: '1.0.0',
    });

    dockerodeInfoMock.mockResolvedValue({
      ServerVersion: '1.0.0',
      OperatingSystem: 'podman',
      OSType: 'foo',
      Architecture: 'bar',
    });

    expect(await dockerCompatibility.getSystemDockerSocketMappingStatus()).toEqual({
      connectionInfo: {
        displayName: 'myDummyConnection',
        link: '/preferences/container-connection/view/fooProviderInternalId/bXlEdW1teUNvbm5lY3Rpb24=/L3Zhci9ydW4vZG9ja2VyLnNvY2s=/summary',
        name: 'myDummyConnection',
        provider: {
          id: 'fooProvider',
          name: 'Foo Provider',
        },
      },
      serverInfo: {
        architecture: 'bar',
        operatingSystem: 'podman',
        osType: 'foo',
        serverVersion: '1.0.0',
        type: 'docker',
      },
      status: 'running',
    });
  });
});
