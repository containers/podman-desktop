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
import type { ProxySettings } from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PodmanConfiguration } from './podman-configuration';
import { ProxyConfigurationHandler } from './proxy-configuration-update-handler';

vi.mock('@podman-desktop/api');

interface TestableProxyConfigurationHandler {
  getProxySetting(podmanConfiguration: PodmanConfiguration): Promise<ProxySettings>;
  updateProxySetting(proxySettings: ProxySettings | undefined, podmanConfiguration: PodmanConfiguration): Promise<void>;
  updateRosettaSetting(useRosetta: boolean, podmanConfiguration: PodmanConfiguration): Promise<void>;
}

describe('ProxyConfigurationHandler', () => {
  let proxyConfigurationHandler: ProxyConfigurationHandler & TestableProxyConfigurationHandler;
  let podmanConfiguration: PodmanConfiguration;

  beforeEach(() => {
    proxyConfigurationHandler = new ProxyConfigurationHandler() as ProxyConfigurationHandler &
      TestableProxyConfigurationHandler;
    podmanConfiguration = {
      readUserConfig: vi.fn(),
      writeUserConfig: vi.fn(),
    } as unknown as PodmanConfiguration;
  });

  describe('getProxySetting', () => {
    test('should return proxy settings from valid TOML config file', async () => {
      const tomlConfigFile: Record<string, unknown> = {
        engine: {
          env: ['https_proxy=https://localhost', 'http_proxy=http://localhost', 'no_proxy=localhost,127.0.0.1'],
        },
      };
      (podmanConfiguration.readUserConfig as Mock).mockResolvedValue(tomlConfigFile);

      const result = await proxyConfigurationHandler.getProxySetting(podmanConfiguration);

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

      const result = await proxyConfigurationHandler.getProxySetting(podmanConfiguration);

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

      const result = await proxyConfigurationHandler.getProxySetting(podmanConfiguration);

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

      const result = await proxyConfigurationHandler.getProxySetting(podmanConfiguration);

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

      await proxyConfigurationHandler.updateProxySetting(proxySettings, podmanConfiguration);

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

      await proxyConfigurationHandler.updateProxySetting(undefined, podmanConfiguration);

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

      await proxyConfigurationHandler.updateProxySetting(proxySettings, podmanConfiguration);

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

      await proxyConfigurationHandler.updateProxySetting(proxySettings, podmanConfiguration);

      const expectedConfig: Record<string, unknown> = {
        engine: {
          env: ['https_proxy=https://localhost', 'http_proxy=http://localhost', 'no_proxy=localhost,127.0.0.1'],
        },
      };

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });
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

      await proxyConfigurationHandler.updateRosettaSetting(true, podmanConfiguration);

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

      await proxyConfigurationHandler.updateRosettaSetting(false, podmanConfiguration);

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

      await proxyConfigurationHandler.updateRosettaSetting(false, podmanConfiguration);

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

      await proxyConfigurationHandler.updateRosettaSetting(true, podmanConfiguration);

      const expectedConfig: Record<string, unknown> = {};

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });

    test('should handle readUserConfig failure gracefully', async () => {
      (podmanConfiguration.readUserConfig as Mock).mockRejectedValue(new Error('Failed to read config'));

      await proxyConfigurationHandler.updateRosettaSetting(true, podmanConfiguration);

      const expectedConfig: Record<string, unknown> = {};

      expect(podmanConfiguration.writeUserConfig).toHaveBeenCalledWith(expectedConfig);
    });
  });
});
