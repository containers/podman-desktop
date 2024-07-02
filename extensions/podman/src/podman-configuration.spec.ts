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

import type { Dirent, PathLike } from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import toml from '@ltd/j-toml';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PropertyPredicate } from './podman-configuration';
import {
  DarwinPodmanConfiguration,
  HyperVProperty,
  LinuxPodmanConfiguration,
  merge,
  PodmanConfiguration,
  RegexBasedPropertyPredicate,
  stringify,
  WindowsPodmanConfiguration,
} from './podman-configuration';

vi.mock('node:os');
vi.mock('node:path');
vi.mock('node:fs');

class TestRegexBasedPropertyPredicate extends RegexBasedPropertyPredicate {
  private readonly pattern: RegExp;

  constructor(pattern: RegExp) {
    super();
    this.pattern = pattern;
  }

  getRegexPattern(): RegExp {
    return this.pattern;
  }
}

interface TestablePodmanConfiguration {
  isValid(path: PathLike): boolean;
  userConfigPath(): PathLike;
  addConfigs(dirPath: PathLike): Promise<PathLike[]>;
  readConfigFromFile(path: PathLike): Promise<Record<string, unknown>>;
  writeConfigToFile(path: PathLike, config: Record<string, unknown>): Promise<void>;
  readUserConfig(): Promise<Record<string, unknown>>;
  writeUserConfig(config: Record<string, unknown>): Promise<void>;
  isPropertySet(predicate: PropertyPredicate): Promise<boolean>;
  systemConfigs(): Promise<PathLike[]>;
}

class TestPodmanConfiguration extends PodmanConfiguration {
  constructor() {
    super();
    this.configPath = 'containers/containers.conf';
    this.userOverrideContainersConfig = `.config/${this.configPath}`;
  }

  protected defaultContainersConfig(): PathLike {
    return '/etc/containers/containers.conf';
  }

  protected overrideContainersConfigPath(): PathLike {
    return '/usr/local/etc/containers/containers.conf';
  }
}

describe('stringify', () => {
  test('should correctly stringify a simple table', () => {
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
      nested: {
        nestedKey1: 'nestedValue1',
        nestedKey2: 100,
      },
    };
    const result = stringify(table);
    const expected = toml.stringify(table as never, { newline: '\n' });

    expect(result).toBe(expected);
  });

  test('should handle empty table', () => {
    const table: Record<string, unknown> = {};
    const result = stringify(table);
    const expected = toml.stringify(table as never, { newline: '\n' });

    expect(result).toBe(expected);
  });

  test('should handle complex table', () => {
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
      nested: {
        nestedKey1: 'nestedValue1',
        nestedKey2: 100,
      },
      array: [1, 2, 3],
      datetime: '1970-01-01 00:00:00.9999',
    };
    const result = stringify(table);
    const expected = toml.stringify(table as never, { newline: '\n' });

    expect(result).toBe(expected);
  });
});

describe('merge', () => {
  test('should correctly merge two simple tables', () => {
    const table1: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
    };
    const table2: Record<string, unknown> = {
      key2: 100,
      key3: true,
    };
    const result = merge(table1, table2);
    const expected: Record<string, unknown> = {
      key1: 'value1',
      key2: 100,
      key3: true,
    };

    expect(result).toEqual(expected);
  });

  test('should handle merging with empty table', () => {
    const table1: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
    };
    const table2: Record<string, unknown> = {};
    const result = merge(table1, table2);
    const expected: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
    };

    expect(result).toEqual(expected);
  });

  test('should handle nested tables', () => {
    const table1: Record<string, unknown> = {
      nested: {
        key1: 'value1',
      },
    };
    const table2: Record<string, unknown> = {
      nested: {
        key2: 'value2',
      },
    };
    const result = merge(table1, table2);
    const expected: Record<string, unknown> = {
      nested: {
        key1: 'value1',
        key2: 'value2',
      },
    };

    expect(result).toEqual(expected);
  });

  test('should handle arrays in tables', () => {
    const table1: Record<string, unknown> = {
      array: [1, 2, 3],
    };
    const table2: Record<string, unknown> = {
      array: [4, 5],
    };
    const result = merge(table1, table2);
    const expected: Record<string, unknown> = {
      array: [4, 5],
    };

    expect(result).toEqual(expected);
  });
});

describe('RegexBasedPropertyPredicate', () => {
  test('should return true if pattern matches the stringified table', () => {
    const pattern = /key1\s*=\s*'value1'/;
    const predicate = new TestRegexBasedPropertyPredicate(pattern);
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
    };

    expect(predicate.check(table)).toBe(true);
  });

  test('should return false if pattern does not match the stringified table', () => {
    const pattern = /key1\s*=\s*'value1'/;
    const predicate = new TestRegexBasedPropertyPredicate(pattern);
    const table: Record<string, unknown> = {
      key3: 'value3',
      key2: 42,
    };

    expect(predicate.check(table)).toBe(false);
  });
});

describe('HyperVProperty', () => {
  test('should return true if provider is hyperv', () => {
    const table: Record<string, unknown> = {
      provider: 'hyperv',
    };

    expect(new HyperVProperty().check(table)).toBe(true);
  });

  test('should return false if provider is not hyperv', () => {
    const table: Record<string, unknown> = {
      provider: 'docker',
    };

    expect(new HyperVProperty().check(table)).toBe(false);
  });

  test('should return false if provider key is missing', () => {
    const table: Record<string, unknown> = {
      key: 'value',
    };

    expect(new HyperVProperty().check(table)).toBe(false);
  });
});

describe('PodmanConfiguration', () => {
  let config: TestPodmanConfiguration & TestablePodmanConfiguration;

  beforeEach(() => {
    config = new TestPodmanConfiguration() as TestPodmanConfiguration & TestablePodmanConfiguration;
    vi.clearAllMocks();
  });

  test('should return XDG_RUNTIME_DIR path if it is set and valid', () => {
    process.env.XDG_RUNTIME_DIR = '/run/user/1000';
    (os.homedir as unknown as Mock).mockReturnValue('/home/user');
    (path.join as unknown as Mock).mockImplementation((...args) => {
      const result = args.join('/');
      console.log(`path.join called with args: ${args}, returning: ${result}`);
      return result;
    });

    config.isValid = vi.fn().mockReturnValue(true);

    const expectedPath = '/run/user/1000/containers/containers.conf';
    const result = config.userConfigPath();
    expect(result).toBe(expectedPath);
  });

  test('should return home directory path if XDG_RUNTIME_DIR is not set', () => {
    delete process.env.XDG_RUNTIME_DIR;
    (os.homedir as unknown as Mock).mockReturnValue('/home/user');
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));

    const expectedPath = '/home/user/.config/containers/containers.conf';
    const result = config.userConfigPath();
    expect(result).toBe(expectedPath);
  });

  test('should return home directory path if XDG_RUNTIME_DIR is set but not valid', () => {
    process.env.XDG_RUNTIME_DIR = '/run/user/1000';
    (os.homedir as unknown as Mock).mockReturnValue('/home/user');
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));

    config.isValid = vi.fn().mockReturnValue(false);

    const expectedPath = '/home/user/.config/containers/containers.conf';
    const result = config.userConfigPath();
    expect(result).toBe(expectedPath);
  });

  test('should return an array of valid config paths from directory', async () => {
    const dirPath = '/etc/containers/containers.conf.d';
    const entries: Dirent[] = [
      { name: 'valid1.conf', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'valid2.conf', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'notAConf.txt', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'directory', isFile: () => false, isDirectory: () => true } as Dirent,
    ];

    (fsPromises.readdir as unknown as Mock).mockResolvedValue(entries);
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));

    console.log(`Calling addConfigs with dirPath: ${dirPath}`);
    const result = await config.addConfigs(dirPath);
    console.log(`Result from addConfigs: ${JSON.stringify(result)}`);

    const expected = ['/etc/containers/containers.conf.d/valid1.conf', '/etc/containers/containers.conf.d/valid2.conf'];

    expect(result).toEqual(expected);
  });

  test('should return an empty array if no valid config paths found', async () => {
    const dirPath = '/etc/containers/containers.conf.d';
    const entries: Dirent[] = [
      { name: 'notAConf.txt', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'directory', isFile: () => false, isDirectory: () => true } as Dirent,
    ];

    (fsPromises.readdir as Mock).mockResolvedValue(entries);
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));

    console.log(`Calling addConfigs with dirPath: ${dirPath}`);
    const result = await config.addConfigs(dirPath);
    console.log(`Result from addConfigs: ${JSON.stringify(result)}`);

    const expected: PathLike[] = [];

    expect(result).toEqual(expected);
  });

  test('should sort the array of config paths', async () => {
    const dirPath = '/etc/containers/containers.conf.d';
    const entries: Dirent[] = [
      { name: 'b.conf', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'a.conf', isFile: () => true, isDirectory: () => false } as Dirent,
      { name: 'c.conf', isFile: () => true, isDirectory: () => false } as Dirent,
    ];

    (fsPromises.readdir as Mock).mockResolvedValue(entries);
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));

    console.log(`Calling addConfigs with dirPath: ${dirPath}`);
    const result = await config.addConfigs(dirPath);
    console.log(`Result from addConfigs: ${JSON.stringify(result)}`);

    const expected = [
      '/etc/containers/containers.conf.d/a.conf',
      '/etc/containers/containers.conf.d/b.conf',
      '/etc/containers/containers.conf.d/c.conf',
    ];

    expect(result).toEqual(expected);
  });

  test('should return false if path is undefined', () => {
    const result = config.isValid(undefined as unknown as PathLike);
    expect(result).toBe(false);
  });

  test('should return false if path is an empty string', () => {
    const result = config.isValid('');
    expect(result).toBe(false);
  });

  test('should return false if path contains only spaces', () => {
    const result = config.isValid('   ');
    expect(result).toBe(false);
  });

  test('should return true if path is a valid string', () => {
    const result = config.isValid('/valid/path');
    expect(result).toBe(true);
  });

  test('should return true if path is a valid PathLike object', () => {
    const result = config.isValid({ toString: () => '/valid/path' } as PathLike);
    expect(result).toBe(true);
  });

  test('should read and parse valid TOML file', async () => {
    const filePath = '/path/to/config.toml';
    const fileContent = `
      key1 = 'value1'
      key2 = 42
      key3 = true
    `;
    (fsPromises.readFile as Mock).mockResolvedValue(fileContent);

    const result = await config.readConfigFromFile(filePath);
    const expected = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };

    expect(result).toEqual(expected);
  });

  test('should throw an error if file does not exist', async () => {
    const filePath = '/path/to/nonexistent.toml';
    (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));

    await expect(config.readConfigFromFile(filePath)).rejects.toThrow('ENOENT: no such file or directory');
  });

  test('should throw an error if file contains invalid TOML', async () => {
    const filePath = '/path/to/invalid.toml';
    const fileContent = `
      key1 = 'value1'
      key2 = 42
      key3 = true
      invalidToml
    `;
    (fsPromises.readFile as Mock).mockResolvedValue(fileContent);

    await expect(config.readConfigFromFile(filePath)).rejects.toThrow();
  });

  test('should write configuration to file successfully', async () => {
    const filePath = '/path/to/config.toml';
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };
    (fsPromises.writeFile as Mock).mockResolvedValue(undefined);

    await config.writeConfigToFile(filePath, table);

    const expectedContent = toml.stringify(table as never, { newline: '\n' });
    expect(fsPromises.writeFile).toHaveBeenCalledWith(filePath, expectedContent);
  });

  test('should throw an error if writing to file fails', async () => {
    const filePath = '/path/to/config.toml';
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };
    (fsPromises.writeFile as Mock).mockRejectedValue(new Error('EACCES: permission denied'));

    await expect(config.writeConfigToFile(filePath, table)).rejects.toThrow('EACCES: permission denied');
  });

  test('should read and parse valid user config TOML file', async () => {
    const filePath = '/home/user/.config/containers/containers.conf';
    const fileContent = `
      key1 = 'value1'
      key2 = 42
      key3 = true
    `;
    (fsPromises.readFile as Mock).mockResolvedValue(fileContent);
    vi.spyOn(config, 'userConfigPath').mockReturnValue(filePath);

    const result = await config.readUserConfig();
    const expected = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };

    expect(result).toEqual(expected);
  });

  test('should throw an error if user config file does not exist', async () => {
    const filePath = '/home/user/.config/containers/containers.conf';
    (fsPromises.readFile as Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));
    vi.spyOn(config, 'userConfigPath').mockReturnValue(filePath);

    await expect(config.readUserConfig()).rejects.toThrow('ENOENT: no such file or directory');
  });

  test('should throw an error if user config file contains invalid TOML', async () => {
    const filePath = '/home/user/.config/containers/containers.conf';
    const fileContent = `
      key1 = 'value1'
      key2 = 42
      key3 = true
      invalidToml
    `;
    (fsPromises.readFile as Mock).mockResolvedValue(fileContent);
    vi.spyOn(config, 'userConfigPath').mockReturnValue(filePath);

    await expect(config.readUserConfig()).rejects.toThrow();
  });

  test('should write user configuration to file successfully', async () => {
    const filePath = '/home/user/.config/containers/containers.conf';
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };
    (fsPromises.writeFile as Mock).mockResolvedValue(undefined);
    vi.spyOn(config, 'userConfigPath').mockReturnValue(filePath);

    await config.writeUserConfig(table);

    const expectedContent = toml.stringify(table as never, { newline: '\n' });
    expect(fsPromises.writeFile).toHaveBeenCalledWith(filePath, expectedContent);
  });

  test('should throw an error if writing user config to file fails', async () => {
    const filePath = '/home/user/.config/containers/containers.conf';
    const table: Record<string, unknown> = {
      key1: 'value1',
      key2: 42,
      key3: true,
    };
    (fsPromises.writeFile as Mock).mockRejectedValue(new Error('EACCES: permission denied'));
    vi.spyOn(config, 'userConfigPath').mockReturnValue(filePath);

    await expect(config.writeUserConfig(table)).rejects.toThrow('EACCES: permission denied');
  });

  test('should return true if configuration contains property satisfying predicate', async () => {
    const configData: Record<string, unknown> = {
      provider: 'hyperv',
    };
    vi.spyOn(config, 'readConfig').mockResolvedValue(configData);

    const predicate = new HyperVProperty();
    const result = await config.isPropertySet(predicate);

    expect(result).toBe(true);
  });

  test('should return false if configuration does not contain property satisfying predicate', async () => {
    const configData: Record<string, unknown> = {
      provider: 'docker',
    };
    vi.spyOn(config, 'readConfig').mockResolvedValue(configData);

    const predicate = new HyperVProperty();
    const result = await config.isPropertySet(predicate);

    expect(result).toBe(false);
  });

  test('should throw an error if reading configuration fails', async () => {
    vi.spyOn(config, 'readConfig').mockRejectedValue(new Error('Failed to read configuration'));

    const predicate = new HyperVProperty();
    await expect(config.isPropertySet(predicate)).rejects.toThrow('Failed to read configuration');
  });

  test('should return an array of valid system config paths', async () => {
    process.env.CONTAINERS_CONF = '/etc/containers/containers.conf';
    const configPaths = [
      '/etc/containers/containers.conf',
      '/usr/share/containers.conf',
      '/usr/local/etc/containers/containers.conf',
      '/usr/local/etc/containers/containers.conf.d/valid.conf',
      '/home/user/.config/containers/containers.conf',
      '/home/user/.config/containers/containers.conf.d/valid.conf',
    ];

    (fsPromises.access as Mock).mockResolvedValue(undefined);
    vi.spyOn(config, 'defaultContainersConfig' as never).mockReturnValue('/usr/share/containers.conf' as never);
    vi.spyOn(config, 'overrideContainersConfigPath' as never).mockReturnValue(
      '/usr/local/etc/containers/containers.conf' as never,
    );
    vi.spyOn(config, 'userConfigPath').mockReturnValue('/home/user/.config/containers/containers.conf');
    vi.spyOn(config, 'addConfigs').mockImplementation((dirPath: PathLike): Promise<PathLike[]> => {
      let mockedReturnPath: string | undefined;

      if (dirPath === '/usr/local/etc/containers/containers.conf.d') {
        mockedReturnPath = '/usr/local/etc/containers/containers.conf.d/valid.conf';
      } else if (dirPath === '/home/user/.config/containers/containers.conf.d') {
        mockedReturnPath = '/home/user/.config/containers/containers.conf.d/valid.conf';
      }

      if (mockedReturnPath) {
        return Promise.resolve([mockedReturnPath]);
      } else {
        return Promise.resolve([]);
      }
    });
    vi.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'));

    let result = await config.systemConfigs();

    expect(result).toEqual(configPaths);

    delete process.env.CONTAINERS_CONF;
    const configPathsExcludedEnv = [
      '/usr/share/containers.conf',
      '/usr/local/etc/containers/containers.conf',
      '/usr/local/etc/containers/containers.conf.d/valid.conf',
      '/home/user/.config/containers/containers.conf',
      '/home/user/.config/containers/containers.conf.d/valid.conf',
    ];

    result = await config.systemConfigs();

    expect(result).toEqual(configPathsExcludedEnv);
  });

  test('should throw an error if accessing a config file fails', async () => {
    process.env.CONTAINERS_CONF = '/not/valid/containers.conf';

    (fsPromises.access as Mock).mockRejectedValue(new Error('ENOENT: no such file or directory'));
    vi.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'));

    await expect(config.systemConfigs()).rejects.toThrow('ENOENT: no such file or directory');
  });
});

describe('DarwinPodmanConfiguration', () => {
  let config: DarwinPodmanConfiguration & TestablePodmanConfiguration;

  beforeEach(() => {
    config = new DarwinPodmanConfiguration() as DarwinPodmanConfiguration & TestablePodmanConfiguration;
    vi.clearAllMocks();
  });

  test('should return default containers config path', () => {
    const expectedPath = '/usr/share/containers/containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));
    config['configPath'] = 'containers/containers.conf';
    const result = config.defaultContainersConfig();
    expect(result).toBe(expectedPath);
  });

  test('should return override containers config path', () => {
    const expectedPath = '/usr/local/etc/containers/containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));
    config['configPath'] = 'containers/containers.conf';
    const result = config.overrideContainersConfigPath();
    expect(result).toBe(expectedPath);
  });
});

describe('LinuxPodmanConfiguration', () => {
  let config: LinuxPodmanConfiguration & TestablePodmanConfiguration;

  beforeEach(() => {
    config = new LinuxPodmanConfiguration() as LinuxPodmanConfiguration & TestablePodmanConfiguration;
    vi.clearAllMocks();
  });

  test('should return default containers config path', () => {
    const expectedPath = '/usr/share/containers/containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));
    config['configPath'] = 'containers/containers.conf';
    const result = config.defaultContainersConfig();
    expect(result).toBe(expectedPath);
  });

  test('should return override containers config path', () => {
    const expectedPath = '/usr/local/etc/containers/containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('/'));
    config['configPath'] = 'containers/containers.conf';
    const result = config.overrideContainersConfigPath();
    expect(result).toBe(expectedPath);
  });
});

describe('WindowsPodmanConfiguration', () => {
  let config: WindowsPodmanConfiguration & TestablePodmanConfiguration;

  beforeEach(() => {
    config = new WindowsPodmanConfiguration() as WindowsPodmanConfiguration & TestablePodmanConfiguration;
    vi.clearAllMocks();
  });

  test('should return default containers config path', () => {
    const expectedPath = '';
    const result = config.defaultContainersConfig();
    expect(result).toBe(expectedPath);
  });

  test('should return override containers config path', () => {
    process.env.PROGRAMDATA = '%PROGRAMDATA%';
    const expectedPath = '%PROGRAMDATA%\\containers\\containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('\\'));
    config['configPath'] = 'containers\\containers.conf';
    const result = config.overrideContainersConfigPath();
    expect(result).toBe(expectedPath);
  });

  test('should return user containers config path', () => {
    process.env.APPDATA = '%APPDATA%';
    const expectedPath = '%APPDATA%\\containers\\containers.conf';
    (path.join as unknown as Mock).mockImplementation((...args) => args.join('\\'));
    config['configPath'] = 'containers\\containers.conf';
    const result = config.userConfigPath();
    expect(result).toBe(expectedPath);
  });
});
