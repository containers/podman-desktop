/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import * as fs from 'node:fs/promises';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { Directories } from '/@/plugin/directories.js';
import type { UserForwardConfig } from '/@/plugin/kubernetes-port-forward-model.js';
import {
  ConfigManagementService,
  FileBasedConfigStorage,
  type FileBasedStorage,
  type ForwardConfigStorage,
  PreferenceFolderBasedStorage,
} from '/@/plugin/kubernetes-port-forward-storage.js';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  access: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));

class TestFileBasedConfigStorage extends FileBasedConfigStorage {
  public async ensureStorageInitialized(): Promise<void> {
    return super.ensureStorageInitialized();
  }

  public _createForward(config: UserForwardConfig): void {
    super._createForward(config);
  }

  public _deleteForward(config: UserForwardConfig): void {
    super._deleteForward(config);
  }

  public _updateForward(config: UserForwardConfig, newConfig: UserForwardConfig): void {
    super._updateForward(config, newConfig);
  }
}

describe('PreferenceFolderBasedStorage', () => {
  const mockDirectories = {
    getConfigurationDirectory: vi.fn().mockReturnValue('/mock/config/directory'),
  } as unknown as Directories;

  test('should initialize storage correctly', async () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    const mkdirMock = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const accessMock = vi.spyOn(fs, 'access').mockRejectedValue({ code: 'ENOENT' });
    const writeFileMock = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    await storage.initStorage();

    expect(mkdirMock).toHaveBeenCalledWith('/mock/config/directory', { recursive: true });
    expect(accessMock).toHaveBeenCalledWith('/mock/config/directory/port-forwards.json');
    expect(writeFileMock).toHaveBeenCalledWith('/mock/config/directory/port-forwards.json', JSON.stringify([]));
  });

  test('should throw error if storage is already initialized', async () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    storage['initialized'] = true;

    await expect(storage.initStorage()).rejects.toThrow('Storage has already been initialized.');
  });

  test('should return storage path if initialized', () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    storage['initialized'] = true;

    const result = storage.getStoragePath();
    expect(result).toBe('/mock/config/directory/port-forwards.json');
  });

  test('should throw error if storage is not initialized when getting path', () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    expect(() => storage.getStoragePath()).toThrow('Storage has not been initialized yet.');
  });

  test('should return true if storage is initialized', () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    storage['initialized'] = true;
    expect(storage.isStorageInitialized()).toBe(true);
  });

  test('should return false if storage is not initialized', () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    expect(storage.isStorageInitialized()).toBe(false);
  });

  test('should throw error if accessing the file fails for a reason other than ENOENT', async () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    const mkdirMock = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    const accessMock = vi.spyOn(fs, 'access').mockRejectedValue(new Error('EACCES'));

    await expect(storage.initStorage()).rejects.toThrow('EACCES');
    expect(mkdirMock).toHaveBeenCalledWith('/mock/config/directory', { recursive: true });
    expect(accessMock).toHaveBeenCalledWith('/mock/config/directory/port-forwards.json');
  });

  test('should log and throw error if mkdir fails', async () => {
    const storage = new PreferenceFolderBasedStorage(mockDirectories);
    const mkdirMock = vi.spyOn(fs, 'mkdir').mockRejectedValue(new Error('EACCES'));

    await expect(storage.initStorage()).rejects.toThrow('EACCES');
    expect(mkdirMock).toHaveBeenCalledWith('/mock/config/directory', { recursive: true });
  });
});

describe('FileBasedConfigStorage', () => {
  const mockFileStorage: FileBasedStorage = {
    initStorage: vi.fn().mockResolvedValue(undefined),
    isStorageInitialized: vi.fn().mockReturnValue(true),
    getStoragePath: vi.fn().mockReturnValue('/mock/storage/path'),
  };

  const sampleConfig: UserForwardConfig = {
    name: 'test-name',
    namespace: 'test-namespace',
    kind: 0,
    forwards: [{ localPort: 8080, remotePort: 80 }],
    displayName: 'test-display-name',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create forward configuration', async () => {
    const storage = new FileBasedConfigStorage(mockFileStorage, 'test-key');
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({}));
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    await storage.createForward(sampleConfig);

    expect(storage['configs']).toContainEqual(sampleConfig);
  });

  test('should delete forward configuration', async () => {
    const storage = new FileBasedConfigStorage(mockFileStorage, 'test-key');
    storage['configs'] = [sampleConfig];
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({}));
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    await storage.deleteForward(sampleConfig);

    expect(storage['configs']).not.toContainEqual(sampleConfig);
  });

  test('should update forward configuration', async () => {
    const newConfig = { ...sampleConfig, displayName: 'new-display-name' };
    const storage = new FileBasedConfigStorage(mockFileStorage, 'test-key');
    storage['configs'] = [sampleConfig];
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({}));
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    await storage.updateForward(sampleConfig, newConfig);

    expect(storage['configs']).toContainEqual(newConfig);
  });

  test('should list all forward configurations', async () => {
    const storage = new FileBasedConfigStorage(mockFileStorage, 'test-key');
    storage['configs'] = [sampleConfig];
    vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({}));
    vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

    const result = await storage.listForwards();

    expect(result).toContainEqual(sampleConfig);
  });

  test('should initialize storage if not initialized', async () => {
    mockFileStorage.isStorageInitialized = vi.fn().mockReturnValue(false);
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');
    const readFileMock = vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({}));

    await storage.ensureStorageInitialized();

    expect(mockFileStorage.initStorage).toHaveBeenCalled();
    expect(readFileMock).toHaveBeenCalled();
  });

  test('should throw an error if creating forward configuration with existing display name', () => {
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');
    storage['configs'] = [sampleConfig];

    expect(() => storage._createForward(sampleConfig)).toThrow(
      'Found existed forward configuration with the same display name.',
    );
  });

  test('should throw an error if deleting a non-existing forward configuration', () => {
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');

    expect(() => storage._deleteForward(sampleConfig)).toThrow(
      `Forward configuration with display name ${sampleConfig.displayName} not found.`,
    );
  });

  test('should throw an error if updating a non-existing forward configuration', () => {
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');
    const newConfig = { ...sampleConfig, displayName: 'new-display-name' };

    expect(() => storage._updateForward(sampleConfig, newConfig)).toThrow(
      `Forward configuration with display name ${sampleConfig.displayName} not found.`,
    );
  });

  test('should set configs from storage if configKey exists', async () => {
    const configMap = {
      'test-key': [sampleConfig],
      'other-key': [],
    };
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');
    const readFileMock = vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(configMap));

    await storage.ensureStorageInitialized();

    expect(storage['configs']).toEqual([sampleConfig]);
    expect(readFileMock).toHaveBeenCalled();
  });

  test('should set configs to empty array if configKey does not exist', async () => {
    const configMap = {
      'other-key': [],
    };
    const storage = new TestFileBasedConfigStorage(mockFileStorage, 'test-key');
    const readFileMock = vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(configMap));

    await storage.ensureStorageInitialized();

    expect(storage['configs']).toEqual([]);
    expect(readFileMock).toHaveBeenCalled();
  });
});

describe('ConfigManagementService', () => {
  const mockConfigStorage: ForwardConfigStorage = {
    createForward: vi.fn(),
    deleteForward: vi.fn(),
    updateForward: vi.fn(),
    listForwards: vi.fn(),
  } as unknown as ForwardConfigStorage;

  const sampleConfig: UserForwardConfig = {
    name: 'test-name',
    namespace: 'test-namespace',
    kind: 0,
    forwards: [{ localPort: 8080, remotePort: 80 }],
    displayName: 'test-display-name',
  };

  test('should create forward configuration', async () => {
    mockConfigStorage.createForward = vi.fn().mockResolvedValue(sampleConfig);
    const service = new ConfigManagementService(mockConfigStorage);

    const result = await service.createForward(sampleConfig);

    expect(result).toEqual(sampleConfig);
    expect(mockConfigStorage.createForward).toHaveBeenCalledWith(sampleConfig);
  });

  test('should delete forward configuration', async () => {
    const service = new ConfigManagementService(mockConfigStorage);

    await service.deleteForward(sampleConfig);

    expect(mockConfigStorage.deleteForward).toHaveBeenCalledWith(sampleConfig);
  });

  test('should list all forward configurations', async () => {
    mockConfigStorage.listForwards = vi.fn().mockResolvedValue([sampleConfig]);
    const service = new ConfigManagementService(mockConfigStorage);

    const result = await service.listForwards();

    expect(result).toEqual([sampleConfig]);
    expect(mockConfigStorage.listForwards).toHaveBeenCalled();
  });
});
