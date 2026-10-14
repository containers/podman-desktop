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

import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
// to use vi.spyOn(os, methodName)
import * as os from 'node:os';

import { commands, env, window } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { DefaultRegistryLoader } from './default-registry-loader';
import type { RegistryConfigurationFile } from './registry-configuration';
import { ActionEnum, RegistryConfigurationImpl } from './registry-configuration';

let registryConfiguration: RegistryConfigurationImpl;
vi.mock(import('node:fs'));
vi.mock(import('node:fs/promises'));

// need to mock some functions due to exported function getJSONMachineList using os.homedir
vi.mock(import('node:os'), async () => {
  return {
    tmpdir: vi.fn().mockReturnValue('fake-tmp'),
    homedir: vi.fn().mockReturnValue('fake-homedir'),
  };
});
vi.mock(import('/@/extension'));

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.mocked(env).isWindows = false;
  vi.mocked(env).isMac = false;
  vi.mocked(env).isLinux = false;
  vi.spyOn(os, 'tmpdir').mockReturnValue('fake-tmp');
  vi.spyOn(os, 'homedir').mockReturnValue('fake-homedir');
  registryConfiguration = new RegistryConfigurationImpl();
});

describe('getRegistryConfFilePath', () => {
  test('expect correct path on Windows', async () => {
    vi.mocked(env).isWindows = true;
    const file = registryConfiguration.getRegistryConfFilePath();
    // file should be inside the home directory
    expect(file).toContain(os.homedir());
    // filename should be registries.conf
    expect(file).toContain('registries.conf');
  });

  test('expect correct path on macOS', async () => {
    vi.mocked(env).isMac = true;
    const file = registryConfiguration.getRegistryConfFilePath();
    // file should be inside the home directory
    expect(file).toContain(os.homedir());
    // filename should be registries.conf
    expect(file).toContain('registries.conf');
  });
});

describe('getPathToRegistriesConfInsideVM', () => {
  test('expect correct path on Windows', async () => {
    vi.mocked(env).isWindows = true;

    // mock the config path being usually computed
    vi.spyOn(registryConfiguration, 'getRegistryConfFilePath').mockReturnValue('C:\\Users\\foo\\registries.conf');
    const file = registryConfiguration.getPathToRegistriesConfInsideVM();
    expect(file).toBe('/mnt/c/Users/foo/registries.conf');
  });

  test('expect correct path on macOS', async () => {
    vi.mocked(env).isMac = true;
    // mock the config path being usually computed
    const pathOnHost = '/Users/foo/.config/containers/registries.conf';
    vi.spyOn(registryConfiguration, 'getRegistryConfFilePath').mockReturnValue(pathOnHost);
    const file = registryConfiguration.getPathToRegistriesConfInsideVM();
    // path on host and in vm should be the same
    expect(file).toBe(pathOnHost);
  });
});

describe('getPlaybookScriptPath', () => {
  test('expect correct script', async () => {
    vi.mocked(env).isMac = true;

    // mock the config path being usually computed
    vi.spyOn(registryConfiguration, 'getPathToRegistriesConfInsideVM').mockReturnValue(
      '/fake/path with spaces/inside/vm',
    );

    // call the method
    const playbookPath = await registryConfiguration.getPlaybookScriptPath();
    // expect the path to be inside the extension storage path
    expect(playbookPath).toContain(os.tmpdir());

    // we should have written content
    expect(vi.mocked(writeFile)).toBeCalledWith(
      expect.stringContaining('playbook-setup-registry-conf-file.yml'),
      expect.stringContaining(
        'ansible.builtin.file:\n        src: "/fake/path with spaces/inside/vm"\n        dest: "/etc/containers/registries.conf.d/999-podman-desktop-registries-from-host.conf"\n        state: link',
      ),
      'utf-8',
    );
  });
});

describe('init', () => {
  const fakeDisposable = { dispose: vi.fn() };
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(registryConfiguration, 'registerSetupRegistryCommand').mockReturnValue(fakeDisposable);
    vi.spyOn(registryConfiguration, 'loadDefaultUserRegistries').mockResolvedValue(undefined);
  });

  test('check command is registered', async () => {
    const disposables = await registryConfiguration.init();
    expect(disposables).toEqual([fakeDisposable]);
    // expect we called the method to register the command
    expect(registryConfiguration.registerSetupRegistryCommand).toBeCalled();
  });
});

test('registerSetupRegistryCommand', async () => {
  registryConfiguration.registerSetupRegistryCommand();
  expect(commands.registerCommand).toBeCalledWith('podman.setupRegistry', expect.any(Function));
});

describe('readRegistriesConfContent', async () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('file does not exist', async () => {
    vi.spyOn(registryConfiguration, 'getRegistryConfFilePath').mockReturnValue('fake-path');
    vi.mocked(existsSync).mockReturnValue(false);
    const content = await registryConfiguration.readRegistriesConfContent();
    expect(content).toStrictEqual({ registry: [] });
  });

  test('read the content', async () => {
    vi.spyOn(registryConfiguration, 'saveRegistriesConfContent').mockResolvedValue();
    vi.spyOn(registryConfiguration, 'getRegistryConfFilePath').mockReturnValue('fake-path');
    vi.mocked(existsSync).mockReturnValue(true);

    vi.mocked(readFile).mockResolvedValue('[[registry]]\nlocation = "docker.io"');
    const content = await registryConfiguration.readRegistriesConfContent();
    expect(content).toEqual({
      registry: [
        {
          location: 'docker.io',
        },
      ],
    });
    expect(registryConfiguration.saveRegistriesConfContent).toBeCalled();
  });
});

describe('saveRegistriesConfContent', async () => {
  test('file ', async () => {
    const content: RegistryConfigurationFile = {
      registry: [
        {
          location: 'docker.io',
          mirror: [
            {
              location: 'localhost:5000',
            },
          ],
        },
      ],
    };
    await registryConfiguration.saveRegistriesConfContent(content);
    expect(writeFile).toBeCalledWith(
      expect.stringContaining('registries.conf'),
      expect.stringContaining(
        '[[registry]]\nlocation = "docker.io"\n\n[[registry.mirror]]\nlocation = "localhost:5000"',
      ),
      'utf-8',
    );
  });
});

describe('setupRegistryCommandCallback', async () => {
  beforeEach(() => {
    vi.spyOn(registryConfiguration, 'displayRegistryQuickPick').mockResolvedValue();
    vi.spyOn(registryConfiguration, 'checkRegistryConfFileExistsInVm').mockResolvedValue(true);
  });

  test('mac/Windows', async () => {
    vi.mocked(env).isMac = true;
    vi.mocked(env).isWindows = true;

    await registryConfiguration.setupRegistryCommandCallback();
    expect(registryConfiguration.checkRegistryConfFileExistsInVm).toBeCalled();
    expect(registryConfiguration.displayRegistryQuickPick).toBeCalled();
  });

  test('mac/Windows fail check', async () => {
    vi.mocked(env).isMac = true;
    vi.mocked(env).isWindows = true;
    vi.spyOn(registryConfiguration, 'checkRegistryConfFileExistsInVm').mockResolvedValue(false);

    await registryConfiguration.setupRegistryCommandCallback();
    expect(registryConfiguration.displayRegistryQuickPick).not.toBeCalled();
  });

  test('linux', async () => {
    vi.mocked(env).isLinux = true;

    await registryConfiguration.setupRegistryCommandCallback();
    expect(registryConfiguration.checkRegistryConfFileExistsInVm).not.toBeCalled();
    expect(registryConfiguration.displayRegistryQuickPick).toBeCalled();
  });
});

describe('displayRegistryQuickPick', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // start from nothing
    vi.spyOn(registryConfiguration, 'readRegistriesConfContent').mockResolvedValue({ registry: [] });
    vi.spyOn(registryConfiguration, 'saveRegistriesConfContent').mockResolvedValue();
  });

  test('should display quick pick with registry options', async () => {
    // first reply is we select add registry action
    const actionQuickPickItem = { actionName: ActionEnum.ADD_REGISTRY_ACTION, label: ActionEnum.ADD_REGISTRY_ACTION };
    vi.mocked(window.showQuickPick).mockResolvedValueOnce(actionQuickPickItem);
    // then it's asking the location registry and we will enter docker.io
    vi.mocked(window.showInputBox).mockResolvedValueOnce('docker.io');

    // now we select the mirror action
    const selectARegitryChoice = { entry: { location: 'docker.io' }, label: 'docker.io' };
    vi.mocked(window.showQuickPick).mockResolvedValueOnce(selectARegitryChoice);
    // then we say we want to use ghcr.io as mirror
    vi.mocked(window.showInputBox).mockResolvedValueOnce('ghcr.io');

    // then we say we end the configuration
    const endQuickPickItem = { actionName: ActionEnum.END_REGISTRY_ACTION, label: ActionEnum.END_REGISTRY_ACTION };
    vi.mocked(window.showQuickPick).mockResolvedValueOnce(endQuickPickItem);

    await registryConfiguration.displayRegistryQuickPick();

    // now we check what we're saving
    expect(registryConfiguration.saveRegistriesConfContent).toBeCalledWith({
      registry: [
        {
          location: 'docker.io',
          mirror: [
            {
              location: 'ghcr.io',
            },
          ],
        },
      ],
    });
  });
});

test('when loadDefaultUserRegistries is called, make sure it calls all three functions for configuring the registry', async () => {
  const mockDefaultRegistryLoader = {
    loadFromConfiguration: vi.fn().mockReturnValue([
      {
        prefix: 'registry1',
        location: '/registry1/foo',
        blocked: true,
        mirror: [{ location: 'mirror1/foo' }],
      },
      {
        prefix: 'registry2',
        location: '/registry2/foo',
        blocked: true,
      },
    ]),
    resolveConflicts: vi.fn().mockImplementation((defaultRegs, existingRegs) => [...existingRegs, ...defaultRegs]),
  } as unknown as DefaultRegistryLoader;

  registryConfiguration = new RegistryConfigurationImpl(mockDefaultRegistryLoader);

  vi.spyOn(registryConfiguration, 'readRegistriesConfContent').mockResolvedValue({ registry: [] });
  vi.spyOn(registryConfiguration, 'saveRegistriesConfContent').mockResolvedValue();
  vi.spyOn(registryConfiguration, 'checkRegistryConfFileExistsInVm').mockResolvedValue(true);

  vi.mocked(env).isMac = true;

  // Time to call the method!
  await registryConfiguration.loadDefaultUserRegistries();

  // We make sure that ALL the methods are called as expected (since we are merging)
  expect(mockDefaultRegistryLoader.loadFromConfiguration).toBeCalled();
  expect(mockDefaultRegistryLoader.resolveConflicts).toBeCalled();
  expect(registryConfiguration.saveRegistriesConfContent).toBeCalled();
});

test('when loadDefaultUserRegistries is called and there are no default registries, it does not check podman machine VM or save', async () => {
  const mockDefaultRegistryLoader = {
    loadFromConfiguration: vi.fn().mockReturnValue([]),
    resolveConflicts: vi.fn(),
  } as unknown as DefaultRegistryLoader;

  registryConfiguration = new RegistryConfigurationImpl(mockDefaultRegistryLoader);

  vi.spyOn(registryConfiguration, 'readRegistriesConfContent').mockResolvedValue({ registry: [] });
  vi.spyOn(registryConfiguration, 'saveRegistriesConfContent').mockResolvedValue();
  const checkVmSpy = vi.spyOn(registryConfiguration, 'checkRegistryConfFileExistsInVm').mockResolvedValue(true);

  vi.mocked(env).isMac = true;

  await registryConfiguration.loadDefaultUserRegistries();

  // Only loadFromConfiguration should be called - VM check should be skipped when no registries configured
  expect(mockDefaultRegistryLoader.loadFromConfiguration).toBeCalled();
  expect(checkVmSpy).not.toBeCalled();
  expect(mockDefaultRegistryLoader.resolveConflicts).not.toBeCalled();
  expect(registryConfiguration.saveRegistriesConfContent).not.toBeCalled();
});

test('when loadDefaultUserRegistries encounters an error (ex. podman not installed), it handles gracefully and does not block extension startup', async () => {
  // Simulate podman not being installed by having checkRegistryConfFileExistsInVm throw
  // an error of 'spawn podman ENOENT' (which is what happens when trying to run podman when it's not installed)
  const mockDefaultRegistryLoader = {
    loadFromConfiguration: vi.fn().mockReturnValue([{ prefix: 'registry1', location: '/registry1/foo' }]),
    resolveConflicts: vi.fn(),
  } as unknown as DefaultRegistryLoader;
  registryConfiguration = new RegistryConfigurationImpl(mockDefaultRegistryLoader);
  vi.spyOn(registryConfiguration, 'checkRegistryConfFileExistsInVm').mockRejectedValue(
    new Error('spawn podman ENOENT'),
  );
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  // Mock the environment to macOS to make sure we are doing the "VM" check (mac uses podman machine)
  vi.mocked(env).isMac = true;

  // Should not throw and is handled gracefully, as we cannot setup registries if podman if podman is not installed
  // and we do not want to block extension startup in this case
  await expect(registryConfiguration.loadDefaultUserRegistries()).resolves.toBeUndefined();

  // Verify warning was logged on startup
  expect(consoleWarnSpy).toHaveBeenCalledWith('Unable to load default user registries:', expect.any(Error));

  // We expect the configuration to still attempt to load the default registries (since mockDefaultRegistryLoader is returning the registry values)
  expect(mockDefaultRegistryLoader.loadFromConfiguration).toBeCalled();
});
