/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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
import * as os from 'node:os';
import * as path from 'node:path';

import type { ExtensionContext, ProxySettings } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PodmanConfiguration } from './podman-configuration';
import { VMTYPE } from './util';

vi.mock(import('node:fs'));

const extensionContext: ExtensionContext = {} as unknown as ExtensionContext;

// allows to call protected methods
class TestPodmanConfiguration extends PodmanConfiguration {
  readContainersConfigFile(): Promise<string> {
    return super.readContainersConfigFile();
  }
}

let podmanConfiguration: TestPodmanConfiguration;

beforeEach(() => {
  vi.mocked(extensionApi.env).isLinux = false;
  podmanConfiguration = new TestPodmanConfiguration(extensionContext);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('should return true if regex is satisfied', async () => {
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(`
[machine]
provider = "hyperv"
memory = 4096
    `);
  const found = await podmanConfiguration.matchRegexpInContainersConfig(/provider\s*=\s*"hyperv"/);
  expect(found).toBeTruthy();
});

test('should return false if regex is not satisfied', async () => {
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(`
[machine]
provider = "wsl"
memory = 4096
    `);
  const found = await podmanConfiguration.matchRegexpInContainersConfig(/provider\s*=\s*"hyperv"/);
  expect(found).toBeFalsy();
});

test('when enable rosetta is set to true and there is already a file with rosetta = false, write rosetta = true.', async () => {
  const configFileContent = `
[machine]
memory = 4096
rosetta = false
    `;
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(configFileContent);
  vi.mocked(fs.existsSync).mockReturnValue(true);

  await podmanConfiguration.updateRosettaSetting(true);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    expect.stringContaining('rosetta = true'),
  );
});

test('should disable Rosetta when useRosetta is false', async () => {
  const configFileContent = `
[machine]
memory = 4096
rosetta = true
    `;
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue(configFileContent);
  vi.mocked(fs.existsSync).mockReturnValue(true);

  await podmanConfiguration.updateRosettaSetting(false);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    expect.stringContaining('rosetta = false'),
  );
});

test('if rosetta is set to true and the file does NOT exist, create the file with rosetta = true.', async () => {
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
  vi.mocked(fs.existsSync).mockReturnValue(false);

  await podmanConfiguration.updateRosettaSetting(true);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    expect.stringContaining('rosetta = true'),
  );
});

test('if rosetta is set to false and the file does NOT exist, create the file with rosetta = false.', async () => {
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
  vi.mocked(fs.existsSync).mockReturnValue(false);

  await podmanConfiguration.updateRosettaSetting(false);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    expect.stringContaining('rosetta = false'),
  );
});

describe('isRosettaEnabled', () => {
  test('check rosetta is enabled', async () => {
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nrosetta=true');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeTruthy();
  });

  test('check rosetta is enabled if file is not containing rosetta setting (default value is true)', async () => {
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeTruthy();
  });

  test('check rosetta is disabled', async () => {
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
    vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nrosetta=false');

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const isEnabled = await podmanConfiguration.isRosettaEnabled();

    expect(isEnabled).toBeFalsy();
  });
});

test('when provider is set to applehv provider and there is already a file with provider = libkrun, remove it.', async () => {
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nprovider = "libkrun"');

  vi.mocked(fs.existsSync).mockReturnValue(true);

  await podmanConfiguration.updateMachineProviderSettings(VMTYPE.APPLEHV);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    // should not contain provider
    expect.not.stringContaining('provider'),
  );
});

test('should update provider', async () => {
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('[machine]\nprovider = "applehv"');

  vi.mocked(fs.existsSync).mockReturnValue(true);

  await podmanConfiguration.updateMachineProviderSettings(VMTYPE.LIBKRUN);

  expect(fs.promises.writeFile).toHaveBeenCalledWith(
    podmanConfiguration.getContainersFileLocation(),
    // should contain provider
    expect.stringContaining('provider = "libkrun"'),
  );
});

test('if provider is set default one (on CLI) and the file does NOT exist, do not try and create the file.', async () => {
  vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();
  vi.spyOn(fs.promises, 'readFile').mockResolvedValue('');
  vi.spyOn(podmanConfiguration, 'readContainersConfigFile').mockResolvedValue('');
  vi.mocked(fs.existsSync).mockReturnValue(false);

  await podmanConfiguration.updateMachineProviderSettings(VMTYPE.APPLEHV);

  expect(fs.promises.writeFile).not.toHaveBeenCalled();
});

describe('when the containers configuration directory does not exist', () => {
  test.each<{
    name: string;
    update: (configuration: PodmanConfiguration) => Promise<void>;
    expectedContent: string[];
  }>([
    {
      name: 'Rosetta setting',
      update: (configuration): Promise<void> => configuration.updateRosettaSetting(true),
      expectedContent: ['rosetta = true'],
    },
    {
      name: 'machine provider setting',
      update: (configuration): Promise<void> => configuration.updateMachineProviderSettings(VMTYPE.LIBKRUN),
      expectedContent: ['provider = "libkrun"'],
    },
    {
      name: 'proxy settings',
      update: (configuration): Promise<void> =>
        configuration.updateProxySettings({
          httpProxy: 'http://localhost:3128',
          httpsProxy: 'http://localhost:3129',
          noProxy: 'localhost,127.0.0.1',
        }),
      expectedContent: [
        'http_proxy=http://localhost:3128',
        'https_proxy=http://localhost:3129',
        'no_proxy=localhost,127.0.0.1',
      ],
    },
  ])('$name creates the directory before writing containers.conf', async ({ update, expectedContent }) => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await update(podmanConfiguration);

    const location = podmanConfiguration.getContainersFileLocation();
    const mkdirMock = vi.mocked(fs.promises.mkdir);
    const writeFileMock = vi.mocked(fs.promises.writeFile);
    expect(mkdirMock).toHaveBeenCalledWith(path.dirname(location), { recursive: true });
    for (const expected of expectedContent) {
      expect(writeFileMock).toHaveBeenCalledWith(location, expect.stringContaining(expected));
    }
    expect(mkdirMock.mock.invocationCallOrder[0]).toBeLessThan(writeFileMock.mock.invocationCallOrder[0]);
  });

  test.each([
    { name: 'unset', xdgConfigHome: undefined },
    { name: 'empty', xdgConfigHome: '' },
  ])('creates the Linux config under the home directory when XDG_CONFIG_HOME is $name', async ({ xdgConfigHome }) => {
    vi.mocked(extensionApi.env).isLinux = true;
    vi.stubEnv('XDG_RUNTIME_DIR', undefined);
    vi.stubEnv('XDG_CONFIG_HOME', xdgConfigHome);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await podmanConfiguration.updateProxySettings({
      httpProxy: 'http://localhost:3128',
      httpsProxy: undefined,
      noProxy: undefined,
    });

    const location = path.resolve(os.homedir(), '.config', 'containers', 'containers.conf');
    expect(podmanConfiguration.getContainersFileLocation()).toBe(location);
    expect(fs.promises.mkdir).toHaveBeenCalledWith(path.dirname(location), { recursive: true });
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      location,
      expect.stringContaining('http_proxy=http://localhost:3128'),
    );
  });

  test('creates the Linux config under XDG_CONFIG_HOME when set', async () => {
    vi.mocked(extensionApi.env).isLinux = true;
    const configHome = path.resolve(os.homedir(), 'custom-config');
    vi.stubEnv('XDG_CONFIG_HOME', configHome);
    vi.stubEnv('XDG_RUNTIME_DIR', path.resolve(os.homedir(), 'runtime'));
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await podmanConfiguration.updateProxySettings({
      httpProxy: 'http://localhost:3128',
      httpsProxy: undefined,
      noProxy: undefined,
    });

    const location = path.resolve(configHome, 'containers', 'containers.conf');
    expect(podmanConfiguration.getContainersFileLocation()).toBe(location);
    expect(fs.promises.mkdir).toHaveBeenCalledWith(path.dirname(location), { recursive: true });
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      location,
      expect.stringContaining('http_proxy=http://localhost:3128'),
    );
  });
});

test('doUpdateProxySettings should be called one at the time', async () => {
  const proxySettings: ProxySettings = {
    httpProxy: 'httpProxy',
    httpsProxy: 'httpsProxy',
    noProxy: 'noProxy',
  };

  // Mock updateProxySettings
  const doUpdateProxySettingsMock = vi.spyOn(podmanConfiguration, 'doUpdateProxySettings').mockResolvedValue();

  // Simultaneously call the function twice
  const call1 = podmanConfiguration.updateProxySettings(undefined);
  const call2 = podmanConfiguration.updateProxySettings(proxySettings);

  await call1;
  expect(doUpdateProxySettingsMock).toHaveBeenCalledTimes(1);
  expect(doUpdateProxySettingsMock.mock.calls[0][0]).toBe(undefined);

  await call2;
  expect(doUpdateProxySettingsMock).toHaveBeenCalledTimes(2);
  expect(doUpdateProxySettingsMock.mock.calls[1][0]).toBe(proxySettings);
});
