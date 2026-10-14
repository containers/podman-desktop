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

import * as fs from 'node:fs';
import { chmod, readFile, writeFile } from 'node:fs/promises';

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { RegistryConfiguration, RegistryConfigurationFile } from '/@/configuration/registry-configuration';

import type { ContainersAuthConfigFile } from './registry-setup';
import { RegistrySetup } from './registry-setup';

// allow us to test protected methods
export class TestRegistrySetup extends RegistrySetup {
  publicReadAuthFile(): Promise<ContainersAuthConfigFile> {
    return super.readAuthFile();
  }

  getAuthFileLocation(): string {
    return super.getAuthFileLocation();
  }

  updateRegistries(): Promise<void> {
    return super.updateRegistries();
  }

  publicWriteAuthFile(data: string): Promise<void> {
    return super.writeAuthFile(data);
  }

  publicUpdateRegistriesConf(registry: extensionApi.Registry, isNew = false): Promise<void> {
    return super.updateRegistriesConf(registry, isNew);
  }

  publicRemoveFromRegistriesConf(registry: extensionApi.Registry): Promise<void> {
    return super.removeFromRegistriesConf(registry);
  }
}

let registrySetup: TestRegistrySetup;

// mock the fs module
vi.mock(import('node:fs'));
vi.mock(import('node:fs/promises'));

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const consoleErroMock = vi.fn();
const consoleWarnMock = vi.fn();

const mockRegistryConfiguration: RegistryConfiguration = {
  init: vi.fn(),
  getPlaybookScriptPath: vi.fn(),
  readRegistriesConfContent: vi.fn(),
  saveRegistriesConfContent: vi.fn(),
};

beforeAll(() => {
  registrySetup = new TestRegistrySetup(mockRegistryConfiguration);
});

beforeEach(() => {
  vi.resetAllMocks();
  console.error = consoleErroMock;
  console.warn = consoleWarnMock;
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

test('should work with invalid JSON auth file', async () => {
  // mock the existSync
  const existSyncSpy = vi.mocked(fs.existsSync);
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  vi.mocked(readFile).mockResolvedValue('invalid json');

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to be empty
  expect(authFile).toEqual({});

  // expect read with the correct file
  expect(readFile).toHaveBeenCalledWith(authJsonLocation, 'utf-8');

  // expect error was logged
  expect(consoleErroMock).toHaveBeenCalledWith('Error parsing auth file', expect.anything());
});

test('should work with JSON auth file', async () => {
  // mock the existSync
  const existSyncSpy = vi.mocked(fs.existsSync);
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  const auth = Buffer.from('user:password').toString('base64');
  vi.mocked(readFile).mockResolvedValue(JSON.stringify({ auths: { 'myregistry.io': { auth: auth } } }));

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to have a single entry
  expect(authFile.auths?.['myregistry.io']).toBeDefined();
  expect(authFile.auths?.['myregistry.io'].auth).toBe(auth);
  expect(authFile.auths?.['myregistry.io']['podmanDesktopAlias']).not.toBeDefined();

  // expect read with the correct file
  expect(readFile).toHaveBeenCalledWith(authJsonLocation, 'utf-8');
});

test('should work with JSON auth file and alias', async () => {
  // mock the existSync
  const existSyncSpy = vi.mocked(fs.existsSync);
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  const auth = Buffer.from('user:password').toString('base64');
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({ auths: { 'myregistry.io': { auth: auth, podmanDesktopAlias: 'alias' } } }),
  );

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to have a single entry
  expect(authFile.auths?.['myregistry.io']).toBeDefined();
  expect(authFile.auths?.['myregistry.io'].auth).toBe(auth);
  expect(authFile.auths?.['myregistry.io']['podmanDesktopAlias']).toBe('alias');

  // expect read with the correct file
  expect(readFile).toHaveBeenCalledWith(authJsonLocation, 'utf-8');
});

test('should send a warning in console if registry auth value is invalid', async () => {
  // mock the existSync
  const existSyncMock = vi.mocked(fs.existsSync);
  existSyncMock.mockReturnValue(true);

  // mock the readFile
  const auth = Buffer.from('user:password').toString('base64');
  const invalidAuth = Buffer.from('userpassword').toString('base64');
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({
      auths: {
        'myregistry.io': { auth: auth, podmanDesktopAlias: 'alias' },
        'myinvalidregistry.io': { auth: invalidAuth, podmanDesktopAlias: 'alias1' },
      },
    }),
  );

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  await registrySetup.updateRegistries();

  // expect read with the correct file
  expect(readFile).toHaveBeenCalledWith(authJsonLocation, 'utf-8');
  expect(consoleWarnMock).toHaveBeenCalledWith('Invalid auth value for myinvalidregistry.io');
});

const [username, secret] = 'userpassword'.split(':');

test.each([
  {
    fileAuth: {
      'myregistry1.io': { auth: Buffer.from('user:password').toString('base64'), podmanDesktopAlias: 'alias' },
    },
    registeredRegistry: {
      source: 'podman',
      serverUrl: 'myregistry1.io',
      username: 'user',
      secret: 'password1',
    },
    timesCalled: 1,
  },
  {
    fileAuth: {
      'myinvalidregistry1.io': { auth: Buffer.from('userpassword').toString('base64'), podmanDesktopAlias: 'alias1' },
    },
    registeredRegistry: {
      source: 'podman',
      serverUrl: 'myinvalidregistry1.io',
      username: username,
      secret: secret,
    },
    timesCalled: 0,
  },
])(
  'do not write existing registries that did not change values to auth.json',
  async ({ fileAuth, registeredRegistry, timesCalled }) => {
    // mock the existSync
    const existSyncMock = vi.mocked(fs.existsSync);
    existSyncMock.mockReturnValue(true);

    // mock the readFile
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({}));

    // mock the location
    const authJsonLocation = '/tmp/containers/auth.json';
    const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
    mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

    let onRegisterRegistry: ((e: extensionApi.Registry) => unknown) | undefined;

    vi.mocked(extensionApi.registry.onDidRegisterRegistry).mockImplementation(callback => {
      onRegisterRegistry = callback;

      return {
        dispose: vi.fn(),
      };
    });

    await registrySetup.setup();

    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ auths: fileAuth }));

    expect(onRegisterRegistry).toBeDefined();

    onRegisterRegistry?.(registeredRegistry);

    await vi.waitFor(() => expect(writeFile).toHaveBeenCalledTimes(timesCalled));
  },
);

test('writeAuthFile should call writeFile and chmod with 0o600', async () => {
  const data = JSON.stringify({ auth: {} });
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  await registrySetup.publicWriteAuthFile(data);

  expect(writeFile).toHaveBeenCalledWith(authJsonLocation, data, {
    encoding: 'utf8',
    mode: 0o600,
  });
  expect(chmod).toHaveBeenCalledWith(authJsonLocation, 0o600);
});

test('updateRegistriesConf should add a new insecure registry when it does not exist', async () => {
  const emptyConfig: RegistryConfigurationFile = { registry: [] };
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockResolvedValue(emptyConfig);

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'https://myregistry.io',
    username: 'user',
    secret: 'pass',
    insecure: true,
  };

  await registrySetup.publicUpdateRegistriesConf(registry, true); // isNew=true

  expect(mockRegistryConfiguration.readRegistriesConfContent).toHaveBeenCalled();
  expect(mockRegistryConfiguration.saveRegistriesConfContent).toHaveBeenCalledWith({
    registry: [
      {
        location: 'myregistry.io',
        insecure: true,
      },
    ],
  });
});

test('updateRegistriesConf should update an existing registry when isNew=false', async () => {
  const existingConfig: RegistryConfigurationFile = {
    registry: [
      {
        location: 'myregistry.io',
        insecure: false,
      },
    ],
  };
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockResolvedValue(existingConfig);

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'https://myregistry.io',
    username: 'user',
    secret: 'pass',
    insecure: true,
  };

  await registrySetup.publicUpdateRegistriesConf(registry, false); // isNew=false

  expect(mockRegistryConfiguration.saveRegistriesConfContent).toHaveBeenCalledWith({
    registry: [
      {
        location: 'myregistry.io',
        insecure: true,
      },
    ],
  });
});

test('updateRegistriesConf should warn and skip when new registry already exists in file', async () => {
  const existingConfig: RegistryConfigurationFile = {
    registry: [
      {
        location: 'myregistry.io',
        insecure: false,
        blocked: true,
      },
    ],
  };
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockResolvedValue(existingConfig);

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'https://myregistry.io',
    username: 'user',
    secret: 'pass',
    insecure: true,
  };

  await registrySetup.publicUpdateRegistriesConf(registry, true); // isNew=true

  // Should warn
  expect(consoleWarnMock).toHaveBeenCalledWith(
    expect.stringContaining('Registry myregistry.io already exists in registries.conf'),
  );

  // Should NOT save (existing config should remain unchanged)
  expect(mockRegistryConfiguration.saveRegistriesConfContent).not.toHaveBeenCalled();
});

test('updateRegistriesConf should handle serverUrl without protocol', async () => {
  const emptyConfig: RegistryConfigurationFile = { registry: [] };
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockResolvedValue(emptyConfig);

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'myregistry.io',
    username: 'user',
    secret: 'pass',
    insecure: false,
  };

  await registrySetup.publicUpdateRegistriesConf(registry, true); // isNew=true

  expect(mockRegistryConfiguration.saveRegistriesConfContent).toHaveBeenCalledWith({
    registry: [
      {
        location: 'myregistry.io',
        insecure: false,
      },
    ],
  });
});

test('removeFromRegistriesConf should remove a registry and strip protocol', async () => {
  const existingConfig: RegistryConfigurationFile = {
    registry: [
      {
        location: 'myregistry.io',
        insecure: true,
      },
      {
        location: 'otherregistry.io',
        insecure: false,
      },
    ],
  };
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockResolvedValue(existingConfig);

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'https://myregistry.io',
    username: 'user',
    secret: 'pass',
  };

  await registrySetup.publicRemoveFromRegistriesConf(registry);

  expect(mockRegistryConfiguration.saveRegistriesConfContent).toHaveBeenCalledWith({
    registry: [
      {
        location: 'otherregistry.io',
        insecure: false,
      },
    ],
  });
});

test('updateRegistriesConf should handle errors gracefully', async () => {
  vi.mocked(mockRegistryConfiguration.readRegistriesConfContent).mockRejectedValue(
    new Error('Failed to read registries.conf'),
  );

  const registry: extensionApi.Registry = {
    source: 'podman',
    serverUrl: 'https://myregistry.io',
    username: 'user',
    secret: 'pass',
  };

  // Should not throw, but log error
  await registrySetup.publicUpdateRegistriesConf(registry, true);

  expect(consoleErroMock).toHaveBeenCalledWith(
    'Error updating registries.conf for registry',
    'https://myregistry.io',
    expect.any(Error),
  );
  expect(mockRegistryConfiguration.saveRegistriesConfContent).not.toHaveBeenCalled();
});
