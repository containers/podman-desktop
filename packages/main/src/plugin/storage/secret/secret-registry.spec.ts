/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { SecretRegistry } from '/@/plugin/storage/secret/secret-registry.js';
import type { Directories } from '/@/plugin/directories.js';
import type { IEncryptionService } from '/@/plugin/storage/encryption/encryptionService.js';

const mocks = vi.hoisted(() => ({
  getConfigurationDirectoryMock: vi.fn(),
  existsSyncMock: vi.fn(),
  mkdirSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  encryptMock: vi.fn(),
  decryptMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
}));

beforeAll(() => {
  // mock the fs module
  vi.mock('node:fs');
});

beforeEach(() => {
  vi.clearAllMocks();
});

const directoriesMock = {
  getConfigurationDirectory: mocks.getConfigurationDirectoryMock,
} as unknown as Directories;

const encryptionServiceMock = {
  encrypt: mocks.encryptMock,
  decrypt: mocks.decryptMock,
} as unknown as IEncryptionService;

vi.mock('node:fs', async () => {
  return {
    existsSync: mocks.existsSyncMock,
    mkdirSync: mocks.mkdirSyncMock,
    readFileSync: mocks.readFileSyncMock,
    writeFileSync: mocks.writeFileSyncMock,
  };
});

test('keys should be empty when init not called', () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  expect(storage.keys().length).toBe(0);
});

test('init should load from disk the existing file', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);

  // Mock config path
  mocks.getConfigurationDirectoryMock.mockReturnValue('dummy-path');
  // Simulate the file exists
  mocks.existsSyncMock.mockReturnValue(true);
  // Mock empty object
  mocks.readFileSyncMock.mockReturnValue('{}');

  await storage.init();

  expect(mocks.getConfigurationDirectoryMock).toHaveBeenCalled();
  expect(mocks.readFileSyncMock).toHaveBeenCalled();

  // When file exist, we do not call mkdir
  expect(mocks.mkdirSyncMock).not.toHaveBeenCalled();

  expect(storage.keys().length).toBe(0);
});

test('init should load from disk the existing secrets', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);

  // Mock config path
  mocks.getConfigurationDirectoryMock.mockReturnValue('dummy-path');
  // Simulate the file exists
  mocks.existsSyncMock.mockReturnValue(true);
  // Mock empty object
  mocks.readFileSyncMock.mockReturnValue('{"crypt-dummy-key": "\\"crypt-dummy-value\\""}');
  // Mock decrypt service
  mocks.decryptMock.mockImplementation(value => {
    switch (value) {
      case 'crypt-dummy-key':
        return 'dummy-key';
      case '"crypt-dummy-value"':
        return '"dummy-value"';
    }
  });

  await storage.init();

  expect(mocks.getConfigurationDirectoryMock).toHaveBeenCalled();
  expect(mocks.readFileSyncMock).toHaveBeenCalled();
  expect(mocks.decryptMock).toHaveBeenCalledTimes(2); // one for the key, one for the value

  // When file exist, we do not call mkdir
  expect(mocks.mkdirSyncMock).not.toHaveBeenCalled();

  expect(storage.keys().length).toBe(1);
  expect(storage.get('dummy-key')).toBe('dummy-value');
});

test('save should save to disk the in-memory secrets', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  // Mock decrypt service
  mocks.encryptMock.mockImplementation(value => {
    switch (value) {
      case 'dummy-number-key':
        return 'crypt-dummy-key';
      case '85':
        return 'crypt-85';
    }
  });

  // Mock config path
  mocks.getConfigurationDirectoryMock.mockReturnValue('dummy-path');
  storage.store('dummy-number-key', 85);

  await storage.save();

  expect(mocks.writeFileSyncMock).toHaveBeenCalledWith(expect.any(String), '{"crypt-dummy-key":"crypt-85"}');
});

test('getNumber on string should raise an error', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  storage.store('dummy', 'string');
  expect(() => storage.getNumber('dummy')).toThrowError('wrong value type');
});

test('getBoolean on string should raise an error', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  storage.store('dummy', 'string');
  expect(() => storage.getBoolean('dummy')).toThrowError('wrong value type');
});

test('getObject on string should raise an error', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  storage.store('dummy', 'string');
  expect(() => storage.getObject('dummy')).toThrowError('wrong value type');
});

test('storeAll should store all the item provided', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  storage.storeAll([
    {
      key: 'dummy-1',
      value: 5,
    },
    {
      key: 'dummy-2',
      value: true,
    },
    {
      key: 'dummy-3',
      value: 'dummy-str',
    },
  ]);

  expect(storage.getNumber('dummy-1')).toBe(5);
  expect(storage.getBoolean('dummy-2')).toBe(true);
  expect(storage.get('dummy-3')).toBe('dummy-str');
});

test('remove should remove the item', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);
  storage.storeAll([
    {
      key: 'dummy-1',
      value: 5,
    },
    {
      key: 'dummy-2',
      value: true,
    },
  ]);

  storage.remove('dummy-1');

  expect(storage.keys()).toStrictEqual(['dummy-2']);
});

test('onDidChangeSecret should be fired when an item is inserted', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);

  const listener = vi.fn();
  storage.onDidChangeSecret(listener);

  storage.store('dummy', 'dummy-value');

  expect(listener).toHaveBeenCalledWith([{ key: 'dummy' }]);
});

test('onDidChangeSecret should be fired when an item is inserted', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);

  const listener = vi.fn();
  storage.onDidChangeSecret(listener);

  storage.store('dummy', 'dummy-value');

  expect(listener).toHaveBeenCalledWith([{ key: 'dummy' }]);
});

test('onDidChangeSecret should be fired when multiple items are inserted', async () => {
  const storage = new SecretRegistry(directoriesMock, encryptionServiceMock);

  const listener = vi.fn();
  storage.onDidChangeSecret(listener);

  storage.storeAll([
    {
      key: 'dummy-1',
      value: 5,
    },
    {
      key: 'dummy-2',
      value: true,
    },
  ]);

  expect(listener).toHaveBeenCalledWith([{ key: 'dummy-1' }, { key: 'dummy-2' }]);
});
