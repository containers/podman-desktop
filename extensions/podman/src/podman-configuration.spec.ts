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
import type { ProxySettings } from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  DarwinPodmanConfiguration,
  HyperVConfiguration,
  LinuxPodmanConfiguration,
  merge,
  PodmanConfiguration,
  ProxyConfiguration,
  RosettaConfiguration,
  WindowsPodmanConfiguration,
} from './podman-configuration';

vi.mock('node:os');
vi.mock('node:path');
vi.mock('node:fs');
vi.mock('@podman-desktop/api');

interface TestablePodmanConfiguration {
  isValid(path: PathLike): boolean;
  userConfigPath(): PathLike;
  addConfigs(dirPath: PathLike): Promise<PathLike[]>;
  readConfigFromFile(path: PathLike): Promise<Record<string, unknown>>;
  writeConfigToFile(path: PathLike, config: Record<string, unknown>): Promise<void>;
  readUserConfig(): Promise<Record<string, unknown>>;
  writeUserConfig(config: Record<string, unknown>): Promise<void>;
  systemConfigs(): Promise<PathLike[]>;
}

interface TestableProxyConfiguration {
  getProxySetting(): Promise<ProxySettings>;
  updateProxySetting(proxySettings: ProxySettings | undefined): Promise<void>;
}

interface TestableRosettaConfiguration {
  updateRosettaSetting(useRosetta: boolean): Promise<void>;
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
      machine: {
        provider: 'hyperv',
      },
    };
    vi.spyOn(config, 'readConfig').mockResolvedValue(configData);

    const result = await new HyperVConfiguration(config).isHyperVEnabled();

    expect(result).toBe(true);
  });

  test('should return false if configuration does not contain property satisfying predicate', async () => {
    const configData: Record<string, unknown> = {
      machine: {
        provider: 'docker',
      },
    };
    vi.spyOn(config, 'readConfig').mockResolvedValue(configData);

    const result = await new HyperVConfiguration(config).isHyperVEnabled();

    expect(result).toBe(false);
  });

  test('should return false if reading configuration fails', async () => {
    vi.spyOn(config, 'readConfig').mockRejectedValue(new Error('Failed to read configuration'));

    const result = await new HyperVConfiguration(config).isHyperVEnabled();

    expect(result).toBe(false);
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

describe('ProxyConfiguration', () => {
  let proxyConfiguration: ProxyConfiguration & TestableProxyConfiguration;
  let podmanConfiguration: PodmanConfiguration;

  beforeEach(() => {
    podmanConfiguration = {
      readUserConfig: vi.fn(),
      writeUserConfig: vi.fn(),
    } as unknown as PodmanConfiguration;
    proxyConfiguration = new ProxyConfiguration(podmanConfiguration) as ProxyConfiguration & TestableProxyConfiguration;
  });

  describe('getProxySetting', () => {
    test('should return proxy settings from valid TOML config file', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {
          env: ['https_proxy=https://localhost', 'http_proxy=http://localhost', 'no_proxy=localhost,127.0.0.1'],
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const result = await proxyConfiguration.getProxySetting();

      const expected: ProxySettings = {
        httpProxy: 'http://localhost',
        httpsProxy: 'https://localhost',
        noProxy: 'localhost,127.0.0.1',
      };

      expect(result).toEqual(expected);
    });

    test('should return undefined for missing proxy settings', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {
          env: ['some_other_setting=value'],
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const result = await proxyConfiguration.getProxySetting();

      const expected: ProxySettings = {
        httpProxy: undefined,
        httpsProxy: undefined,
        noProxy: undefined,
      };

      expect(result).toEqual(expected);
    });

    test('should handle missing engine section gracefully', async () => {
      const tomlConfigFile: Record<string, unknown> = {};
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const result = await proxyConfiguration.getProxySetting();

      const expected: ProxySettings = {
        httpProxy: undefined,
        httpsProxy: undefined,
        noProxy: undefined,
      };

      expect(result).toEqual(expected);
    });

    test('should log warning and return undefined if reading config fails', async () => {
      const consoleWarnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (podmanConfiguration.readUserConfig as Mock).mockRejectedValue(new Error('Failed to read config'));

      const result = await proxyConfiguration.getProxySetting();

      const expected: ProxySettings = {
        httpProxy: undefined,
        httpsProxy: undefined,
        noProxy: undefined,
      };

      expect(result).toEqual(expected);
      expect(consoleWarnMock).toHaveBeenCalledWith(
        'Failed to process podman user configuration: Failed to read config',
      );

      consoleWarnMock.mockRestore();
    });
  });

  describe('updateProxySetting', () => {
    test('should update proxy settings in user config', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {
          env: ['some_other_setting=value'],
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const proxySettings: ProxySettings = {
        httpProxy: 'http://localhost',
        httpsProxy: 'https://localhost',
        noProxy: 'localhost,127.0.0.1',
      };

      await proxyConfiguration.updateProxySetting(proxySettings);

      const expectedConfig: Record<string, unknown> = {
        engine: {
          env: [
            'some_other_setting=value',
            'https_proxy=https://localhost',
            'http_proxy=http://localhost',
            'no_proxy=localhost,127.0.0.1',
          ],
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should remove proxy settings from user config if undefined', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {
          env: [
            'https_proxy=https://localhost',
            'http_proxy=http://localhost',
            'no_proxy=localhost,127.0.0.1',
            'some_other_setting=value',
          ],
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      await proxyConfiguration.updateProxySetting(undefined);

      const expectedConfig: Record<string, unknown> = {
        engine: {
          env: ['some_other_setting=value'],
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should handle missing engine section gracefully', async () => {
      const tomlConfigFile: Record<string, unknown> = {};
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const proxySettings: ProxySettings = {
        httpProxy: 'http://localhost',
        httpsProxy: 'https://localhost',
        noProxy: 'localhost,127.0.0.1',
      };

      await proxyConfiguration.updateProxySetting(proxySettings);

      const expectedConfig: Record<string, unknown> = {
        engine: {
          env: ['https_proxy=https://localhost', 'http_proxy=http://localhost', 'no_proxy=localhost,127.0.0.1'],
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should create env array if it does not exist', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {},
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const proxySettings: ProxySettings = {
        httpProxy: 'http://localhost',
        httpsProxy: 'https://localhost',
        noProxy: 'localhost,127.0.0.1',
      };

      await proxyConfiguration.updateProxySetting(proxySettings);

      const expectedConfig: Record<string, unknown> = {
        engine: {
          env: ['https_proxy=https://localhost', 'http_proxy=http://localhost', 'no_proxy=localhost,127.0.0.1'],
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });
  });
});

describe('RosettaConfiguration', () => {
  let rosettaConfiguration: RosettaConfiguration & TestableRosettaConfiguration;
  let podmanConfiguration: PodmanConfiguration;

  beforeEach(() => {
    podmanConfiguration = {
      readUserConfig: vi.fn(),
      writeUserConfig: vi.fn(),
    } as unknown as PodmanConfiguration;
    rosettaConfiguration = new RosettaConfiguration(podmanConfiguration) as RosettaConfiguration &
      TestableRosettaConfiguration;
  });

  describe('updateRosettaSetting', () => {
    test('should remove rosetta setting when useRosetta is true', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        machine: {
          rosetta: false,
          memory: 4096,
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      await rosettaConfiguration.updateRosettaSetting(true);

      const expectedConfig: Record<string, unknown> = {
        machine: {
          memory: 4096,
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should set rosetta to false when useRosetta is false', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        machine: {
          memory: 4096,
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      await rosettaConfiguration.updateRosettaSetting(false);

      const expectedConfig: Record<string, unknown> = {
        machine: {
          rosetta: false,
          memory: 4096,
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should handle missing machine section gracefully', async () => {
      const tomlConfigFile: Record<string, unknown> = {};
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      await rosettaConfiguration.updateRosettaSetting(false);

      const expectedConfig: Record<string, unknown> = {
        machine: {
          rosetta: false,
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should do nothing if machine config is missing and useRosetta is true', async () => {
      const tomlConfigFile: Record<string, unknown> = {};
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      await rosettaConfiguration.updateRosettaSetting(true);

      const expectedConfig: Record<string, unknown> = {};

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should handle readUserConfig failure gracefully', async () => {
      (podmanConfiguration.readUserConfig as Mock).mockRejectedValue(new Error('Failed to read config'));

      await rosettaConfiguration.updateRosettaSetting(true);

      const expectedConfig: Record<string, unknown> = {};

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });
  });

  describe('isRosettaEnabled', () => {
    test('check rosetta is enabled', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        machine: {
          rosetta: true,
          memory: 4096,
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const isEnabled = await rosettaConfiguration.isRosettaEnabled();

      expect(isEnabled).toBeTruthy();
    });

    test('check rosetta is enabled if file is not containing rosetta setting (default value is true)', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        machine: {
          memory: 4096,
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const isEnabled = await rosettaConfiguration.isRosettaEnabled();

      expect(isEnabled).toBeTruthy();
    });

    test('check rosetta is disabled', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        machine: {
          rosetta: false,
          memory: 4096,
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const isEnabled = await rosettaConfiguration.isRosettaEnabled();

      expect(isEnabled).toBeFalsy();
    });
  });
});
