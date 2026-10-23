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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

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
let registryProviderDisposable: extensionApi.Disposable;
let registryEventDisposables: extensionApi.Disposable[];

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

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(extensionApi.Disposable.create).mockImplementation(dispose => ({ dispose }) as extensionApi.Disposable);
  registryProviderDisposable = { dispose: vi.fn() };
  registryEventDisposables = [{ dispose: vi.fn() }, { dispose: vi.fn() }, { dispose: vi.fn() }];
  vi.mocked(extensionApi.registry.registerRegistryProvider).mockReturnValue(registryProviderDisposable);
  vi.mocked(extensionApi.registry.onDidRegisterRegistry).mockReturnValue(registryEventDisposables[0]);
  vi.mocked(extensionApi.registry.onDidUnregisterRegistry).mockReturnValue(registryEventDisposables[1]);
  vi.mocked(extensionApi.registry.onDidUpdateRegistry).mockReturnValue(registryEventDisposables[2]);
  registrySetup = new TestRegistrySetup(mockRegistryConfiguration);
  console.error = consoleErroMock;
  console.warn = consoleWarnMock;
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

test('should watch auth file when it does not exist at startup', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(false);
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({ auths: { 'myregistry.io': { auth: Buffer.from('user:password').toString('base64') } } }),
  );
  let authFileListener: fs.StatsListener | undefined;
  vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
    authFileListener = listener;
    return {} as fs.StatWatcher;
  });

  const disposable = await registrySetup.setup();

  expect(fs.watchFile).toHaveBeenCalledWith(authJsonLocation, expect.any(Function));
  expect(readFile).not.toHaveBeenCalled();

  expect(authFileListener).toBeDefined();
  authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
  expect(readFile).not.toHaveBeenCalled();
  expect(extensionApi.registry.unregisterRegistry).not.toHaveBeenCalled();

  vi.mocked(fs.existsSync).mockReturnValue(true);
  authFileListener?.({ nlink: 1 } as fs.Stats, {} as fs.Stats);

  await vi.waitFor(() => expect(extensionApi.registry.registerRegistry).toHaveBeenCalledTimes(1));

  disposable.dispose();
  expect(fs.unwatchFile).toHaveBeenCalledWith(authJsonLocation, authFileListener);
});

test('should ignore a stale auth file read when the file is deleted during creation handling', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  let authFileExists = false;
  vi.mocked(fs.existsSync).mockImplementation(() => authFileExists);
  let authFileListener: fs.StatsListener | undefined;
  vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
    authFileListener = listener;
    return {} as fs.StatWatcher;
  });
  let resolveReadFile: ((value: string) => void) | undefined;
  vi.mocked(readFile).mockReturnValue(
    new Promise(resolve => {
      resolveReadFile = resolve;
    }),
  );

  await registrySetup.setup();

  authFileExists = true;
  authFileListener?.({ nlink: 1 } as fs.Stats, {} as fs.Stats);
  await vi.waitFor(() => expect(readFile).toHaveBeenCalledOnce());

  authFileExists = false;
  authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
  resolveReadFile?.(
    JSON.stringify({ auths: { 'stale.io': { auth: Buffer.from('user:password').toString('base64') } } }),
  );
  await new Promise(resolve => setTimeout(resolve, 0));

  expect(extensionApi.registry.registerRegistry).not.toHaveBeenCalled();
});

test('should ignore a stale registry event read after the auth file is deleted', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  let authFileExists = true;
  vi.mocked(fs.existsSync).mockImplementation(() => authFileExists);
  let authFileListener: fs.StatsListener | undefined;
  vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
    authFileListener = listener;
    return {} as fs.StatWatcher;
  });
  let onRegisterRegistry: ((registry: extensionApi.Registry) => unknown) | undefined;
  vi.mocked(extensionApi.registry.onDidRegisterRegistry).mockImplementation(callback => {
    onRegisterRegistry = callback;
    return registryEventDisposables[0];
  });
  let resolveReadFile: ((value: string) => void) | undefined;
  vi.mocked(readFile)
    .mockResolvedValueOnce(JSON.stringify({ auths: {} }))
    .mockReturnValueOnce(
      new Promise(resolve => {
        resolveReadFile = resolve;
      }),
    );

  const disposable = await registrySetup.setup();
  const event = onRegisterRegistry?.({
    source: 'external',
    serverUrl: 'stale.io',
    username: 'user',
    secret: 'password',
  });
  await vi.waitFor(() => expect(readFile).toHaveBeenCalledTimes(2));

  authFileExists = false;
  authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
  resolveReadFile?.(JSON.stringify({ auths: {} }));
  await event;

  expect(writeFile).not.toHaveBeenCalled();
  expect(mockRegistryConfiguration.saveRegistriesConfContent).not.toHaveBeenCalled();
  disposable.dispose();
});

test('should dispose registry subscriptions and ignore events after disposal', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(false);
  let onRegisterRegistry: ((registry: extensionApi.Registry) => unknown) | undefined;
  let onUnregisterRegistry: ((registry: extensionApi.Registry) => unknown) | undefined;
  let onUpdateRegistry: ((registry: extensionApi.Registry) => unknown) | undefined;
  vi.mocked(extensionApi.registry.onDidRegisterRegistry).mockImplementation(callback => {
    onRegisterRegistry = callback;
    return registryEventDisposables[0];
  });
  vi.mocked(extensionApi.registry.onDidUnregisterRegistry).mockImplementation(callback => {
    onUnregisterRegistry = callback;
    return registryEventDisposables[1];
  });
  vi.mocked(extensionApi.registry.onDidUpdateRegistry).mockImplementation(callback => {
    onUpdateRegistry = callback;
    return registryEventDisposables[2];
  });

  const disposable = await registrySetup.setup();
  disposable.dispose();

  expect(registryProviderDisposable.dispose).toHaveBeenCalledOnce();
  for (const eventDisposable of registryEventDisposables) {
    expect(eventDisposable.dispose).toHaveBeenCalledOnce();
  }
  expect(fs.unwatchFile).toHaveBeenCalledWith(authJsonLocation, expect.any(Function));

  const registry: extensionApi.Registry = {
    source: 'external',
    serverUrl: 'example.io',
    username: 'user',
    secret: 'password',
  };
  await Promise.all([onRegisterRegistry?.(registry), onUnregisterRegistry?.(registry), onUpdateRegistry?.(registry)]);

  expect(readFile).not.toHaveBeenCalled();
  expect(writeFile).not.toHaveBeenCalled();
  expect(mockRegistryConfiguration.saveRegistriesConfContent).not.toHaveBeenCalled();
});

test('should clean up the watcher and registry subscriptions when initial setup fails', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({ auths: { 'myregistry.io': { auth: Buffer.from('user:password').toString('base64') } } }),
  );
  const setupError = new Error('Failed to register registry');
  vi.mocked(extensionApi.registry.registerRegistry).mockImplementation(() => {
    throw setupError;
  });
  let authFileListener: fs.StatsListener | undefined;
  vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
    authFileListener = listener;
    return {} as fs.StatWatcher;
  });

  await expect(registrySetup.setup()).rejects.toThrow(setupError);

  expect(fs.unwatchFile).toHaveBeenCalledWith(authJsonLocation, authFileListener);
  expect(registryProviderDisposable.dispose).toHaveBeenCalledOnce();
  for (const eventDisposable of registryEventDisposables) {
    expect(eventDisposable.dispose).toHaveBeenCalledOnce();
  }
});

test('should unregister registries added before initial setup fails', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({
      auths: {
        'first.io': { auth: Buffer.from('user:password').toString('base64') },
        'second.io': { auth: Buffer.from('user:password').toString('base64') },
      },
    }),
  );
  const setupError = new Error('Failed to register second registry');
  vi.mocked(extensionApi.registry.registerRegistry).mockImplementation(registry => {
    if (registry.serverUrl === 'second.io') {
      throw setupError;
    }
    return extensionApi.Disposable.create(() => undefined);
  });

  await expect(registrySetup.setup()).rejects.toThrow(setupError);

  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledOnce();
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'first.io' }),
  );
});

test('should retain and retry a registry when auth-file removal fails', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(readFile).mockResolvedValueOnce(
    JSON.stringify({ auths: { 'first.io': { auth: Buffer.from('user:password').toString('base64') } } }),
  );
  await registrySetup.updateRegistries();

  const unregisterError = new Error('Failed to unregister registry');
  vi.mocked(extensionApi.registry.unregisterRegistry).mockImplementationOnce(() => {
    throw unregisterError;
  });
  vi.mocked(readFile).mockResolvedValue(JSON.stringify({ auths: {} }));

  await expect(registrySetup.updateRegistries()).resolves.toBeUndefined();
  expect(consoleErroMock).toHaveBeenCalledWith('Error unregistering registry', 'first.io', unregisterError);

  await registrySetup.updateRegistries();
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(2);
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenLastCalledWith(
    expect.objectContaining({ serverUrl: 'first.io' }),
  );
});

test('should not treat an auth-file removal as an external unregister', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(readFile)
    .mockResolvedValueOnce(
      JSON.stringify({ auths: { 'first.io': { auth: Buffer.from('user:password').toString('base64') } } }),
    )
    .mockResolvedValue(JSON.stringify({ auths: {} }));

  let onUnregisterRegistry: ((registry: extensionApi.Registry) => unknown) | undefined;
  vi.mocked(extensionApi.registry.onDidUnregisterRegistry).mockImplementation(callback => {
    onUnregisterRegistry = callback;
    return registryEventDisposables[1];
  });
  vi.mocked(extensionApi.registry.unregisterRegistry).mockImplementation(registry => {
    onUnregisterRegistry?.(registry);
  });

  const disposable = await registrySetup.setup();
  await registrySetup.updateRegistries();

  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'first.io' }),
  );
  expect(readFile).toHaveBeenCalledTimes(2);
  expect(writeFile).not.toHaveBeenCalled();
  expect(mockRegistryConfiguration.saveRegistriesConfContent).not.toHaveBeenCalled();

  disposable.dispose();
});

test('should unregister registries when auth file is deleted and reload them when it is recreated', async () => {
  const authJsonLocation = '/containers/auth.json';
  vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({ auths: { 'first.io': { auth: Buffer.from('user:password').toString('base64') } } }),
  );
  let authFileListener: fs.StatsListener | undefined;
  vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
    authFileListener = listener;
    return {} as fs.StatWatcher;
  });

  await registrySetup.setup();
  expect(extensionApi.registry.registerRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'first.io' }),
  );

  authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'first.io' }),
  );

  vi.mocked(readFile).mockResolvedValue(
    JSON.stringify({
      auths: {
        'second.io': { auth: Buffer.from('user:password').toString('base64') },
        'third.io': { auth: Buffer.from('user:password').toString('base64') },
      },
    }),
  );
  authFileListener?.({ nlink: 1 } as fs.Stats, {} as fs.Stats);

  await vi.waitFor(() => expect(extensionApi.registry.registerRegistry).toHaveBeenCalledTimes(3));

  const unregisterError = new Error('Failed to unregister registry');
  vi.mocked(extensionApi.registry.unregisterRegistry).mockImplementation(registry => {
    if (registry.serverUrl === 'second.io') {
      throw unregisterError;
    }
  });
  expect(() => authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats)).not.toThrow();
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'second.io' }),
  );
  expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledWith(
    expect.objectContaining({ serverUrl: 'third.io' }),
  );
  expect(consoleErroMock).toHaveBeenCalledWith('Error unregistering registry', 'second.io', unregisterError);

  vi.mocked(extensionApi.registry.unregisterRegistry).mockReturnValue(undefined);
  vi.mocked(readFile).mockResolvedValue(JSON.stringify({ auths: {} }));
  authFileListener?.({ nlink: 1 } as fs.Stats, {} as fs.Stats);

  await vi.waitFor(() => {
    const unregisterAttempts = vi.mocked(extensionApi.registry.unregisterRegistry).mock.calls;
    const secondRegistryAttempts = unregisterAttempts.filter(([registry]) => registry.serverUrl === 'second.io');
    const thirdRegistryAttempts = unregisterAttempts.filter(([registry]) => registry.serverUrl === 'third.io');
    expect(secondRegistryAttempts).toHaveLength(2);
    expect(thirdRegistryAttempts).toHaveLength(1);
  });
});

test('should retry failed unregisters while the auth file stays absent', async () => {
  vi.useFakeTimers();
  try {
    const authJsonLocation = '/containers/auth.json';
    vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
    let authFileExists = true;
    vi.mocked(fs.existsSync).mockImplementation(() => authFileExists);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ auths: { 'first.io': { auth: Buffer.from('user:password').toString('base64') } } }),
    );
    let authFileListener: fs.StatsListener | undefined;
    vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
      authFileListener = listener;
      return {} as fs.StatWatcher;
    });
    vi.mocked(extensionApi.registry.unregisterRegistry).mockImplementation(() => {
      throw new Error('Failed to unregister registry');
    });

    const disposable = await registrySetup.setup();
    authFileExists = false;
    authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
    expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(2_000);
    expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(5_000);
    expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(3);
    disposable.dispose();
  } finally {
    vi.useRealTimers();
  }
});

test('should stop unregister retries when the auth file is recreated before the watcher fires', async () => {
  vi.useFakeTimers();
  try {
    const authJsonLocation = '/containers/auth.json';
    vi.spyOn(registrySetup, 'getAuthFileLocation').mockReturnValue(authJsonLocation);
    let authFileExists = true;
    vi.mocked(fs.existsSync).mockImplementation(() => authFileExists);
    vi.mocked(readFile).mockResolvedValue(
      JSON.stringify({ auths: { 'first.io': { auth: Buffer.from('user:password').toString('base64') } } }),
    );
    let authFileListener: fs.StatsListener | undefined;
    vi.mocked(fs.watchFile).mockImplementation((_path, listener) => {
      authFileListener = listener;
      return {} as fs.StatWatcher;
    });
    vi.mocked(extensionApi.registry.unregisterRegistry).mockImplementation(() => {
      throw new Error('Failed to unregister registry');
    });

    const disposable = await registrySetup.setup();
    authFileExists = false;
    authFileListener?.({ nlink: 0 } as fs.Stats, {} as fs.Stats);
    expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(1);

    authFileExists = true;
    await vi.advanceTimersByTimeAsync(1_000);
    expect(extensionApi.registry.unregisterRegistry).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(readFile).toHaveBeenCalledTimes(2));
    disposable.dispose();
  } finally {
    vi.useRealTimers();
  }
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
