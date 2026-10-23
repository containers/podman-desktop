/*********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
 ********************************************************************/

import * as extensionApi from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Registry, RegistryItem } from 'winreg';
import WinReg from 'winreg';

import { UNINSTALL_LEGACY_INSTALLER_COMMAND } from '/@/constants';
import {
  LEGACY_PODMAN_REGISTRY_ITEM_NAME,
  LEGACY_PODMAN_REGISTRY_KEY,
  PodmanWindowsLegacyInstaller,
  UNINSTALL_REGISTRY_DISPLAY_NAME_KEY,
  UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY,
} from '/@/utils/podman-windows-legacy-installer';

vi.mock(import('winreg'));

// Widens the protected parseUninstallCommand to public so it can be unit-tested directly.
class TestPodmanWindowsLegacyInstaller extends PodmanWindowsLegacyInstaller {
  public override parseUninstallCommand(uninstallString: string): [executable: string, args: string[]] {
    return super.parseUninstallCommand(uninstallString);
  }
}

const TELEMETRY_LOGGER_MOCK = {
  logUsage: vi.fn(),
} as unknown as extensionApi.TelemetryLogger;
const CANCELLATION_TOKEN_MOCK: extensionApi.CancellationToken = {
  isCancellationRequested: false,
  onCancellationRequested: vi.fn(),
};

let podmanWindowsLegacyInstaller: PodmanWindowsLegacyInstaller;

beforeEach(() => {
  vi.resetAllMocks();

  podmanWindowsLegacyInstaller = new PodmanWindowsLegacyInstaller(TELEMETRY_LOGGER_MOCK);

  vi.mocked(extensionApi.window.withProgress).mockImplementation(
    (
      _: extensionApi.ProgressOptions,
      task: (
        progress: extensionApi.Progress<{ message?: string; increment?: number }>,
        token: extensionApi.CancellationToken,
      ) => Promise<unknown>,
    ) => {
      return task({ report: vi.fn() }, CANCELLATION_TOKEN_MOCK);
    },
  );
});

describe('init', () => {
  test('expect uninstall command to be registered', async () => {
    podmanWindowsLegacyInstaller.init();

    expect(extensionApi.commands.registerCommand).toHaveBeenCalledExactlyOnceWith(
      UNINSTALL_LEGACY_INSTALLER_COMMAND,
      expect.any(Function),
    );
  });
});

describe('dispose', () => {
  test('expect register command disposable to be disposed', async () => {
    const disposable: extensionApi.Disposable = {
      dispose: vi.fn(),
    };
    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue(disposable);

    podmanWindowsLegacyInstaller.init();
    podmanWindowsLegacyInstaller.dispose();

    expect(disposable.dispose).toHaveBeenCalledOnce();
  });
});

describe('isInstalled', () => {
  test('expect true if legacy podman installer is detected', async () => {
    vi.mocked(WinReg.prototype.valueExists).mockImplementation(function (
      this: Registry,
      _: string,
      cb: (err: Error | undefined, exists: boolean) => void,
    ): Registry {
      cb(undefined, true);
      return this;
    });

    const result = await podmanWindowsLegacyInstaller.isInstalled();
    expect(result).toBeTruthy();

    expect(WinReg).toHaveBeenCalledExactlyOnceWith({
      hive: WinReg.HKLM,
      key: LEGACY_PODMAN_REGISTRY_KEY,
    });
    expect(WinReg.prototype.valueExists).toHaveBeenCalledExactlyOnceWith(
      LEGACY_PODMAN_REGISTRY_ITEM_NAME,
      expect.any(Function),
    );
  });

  test('expect false if legacy podman installer is not detected', async () => {
    vi.mocked(WinReg.prototype.valueExists).mockImplementation(function (
      this: Registry,
      _: string,
      cb: (err: Error | undefined, exists: boolean) => void,
    ): Registry {
      cb(undefined, false);
      return this;
    });

    const result = await podmanWindowsLegacyInstaller.isInstalled();
    expect(result).toBeFalsy();
  });
});

describe('parseUninstallCommand', () => {
  let installer: TestPodmanWindowsLegacyInstaller;

  beforeEach(() => {
    installer = new TestPodmanWindowsLegacyInstaller(TELEMETRY_LOGGER_MOCK);
  });

  test.each([
    {
      name: 'a bare executable with no arguments',
      input: 'C:\\podman.exe',
      expected: ['C:\\podman.exe', []],
    },
    {
      name: 'a quoted executable path containing spaces',
      input: '"C:\\Program Files\\Podman\\setup.exe"',
      expected: ['C:\\Program Files\\Podman\\setup.exe', []],
    },
    {
      name: 'a quoted executable followed by bare flags (the real Podman shape)',
      input: '"C:\\Program Files\\Podman\\setup.exe" /uninstall /quiet',
      expected: ['C:\\Program Files\\Podman\\setup.exe', ['/uninstall', '/quiet']],
    },
    {
      name: 'a bare executable followed by flags',
      input: 'C:\\podman.exe /uninstall /quiet',
      expected: ['C:\\podman.exe', ['/uninstall', '/quiet']],
    },
    {
      name: 'leading whitespace before the executable',
      input: '   "C:\\a b\\setup.exe" /quiet',
      expected: ['C:\\a b\\setup.exe', ['/quiet']],
    },
    {
      name: 'trailing whitespace after the last flag',
      input: '"C:\\a b\\setup.exe" /uninstall   ',
      expected: ['C:\\a b\\setup.exe', ['/uninstall']],
    },
    {
      name: 'tab characters as flag separators',
      input: '"C:\\a b\\setup.exe"\t/uninstall\t/quiet',
      expected: ['C:\\a b\\setup.exe', ['/uninstall', '/quiet']],
    },
    {
      name: 'runs of whitespace between flags',
      input: 'C:\\podman.exe    /uninstall',
      expected: ['C:\\podman.exe', ['/uninstall']],
    },
  ])('should parse $name', ({ input, expected }) => {
    expect(installer.parseUninstallCommand(input)).toEqual(expected);
  });

  test.each([
    { name: 'an empty string', input: '' },
    { name: 'a whitespace-only string', input: '   \t  ' },
  ])('should throw on $name', ({ input }) => {
    expect(() => installer.parseUninstallCommand(input)).toThrowError(/empty command line/);
  });

  test('correctly tokenizes a quoted flag value containing spaces', () => {
    // string-argv treats double quotes as a tokenizer-wide delimiter, not just around the
    // leading executable, so a quoted flag value with spaces is kept as a single token with
    // its quotes stripped.
    expect(installer.parseUninstallCommand('"C:\\a b\\setup.exe" /log "C:\\c d\\u.log"')).toEqual([
      'C:\\a b\\setup.exe',
      ['/log', 'C:\\c d\\u.log'],
    ]);
  });
});

describe('uninstall', () => {
  // A WiX Burn bundle writes QuietUninstallString as a quoted exe path followed by flags.
  const UNINSTALL_EXE_MOCK = 'C:\\ProgramData\\Package Cache\\{a1b2c3d4}\\podman-5.0.0-setup.exe';
  const UNINSTALL_CMD_MOCK = `"${UNINSTALL_EXE_MOCK}" /uninstall /quiet`;

  const PODMAN_UNINSTALL_REGISTRY: Registry = {
    valueExists: vi.fn(),
    get: vi.fn(),
  } as unknown as Registry;

  beforeEach(() => {
    vi.mocked(WinReg.prototype.keys).mockImplementation(function (
      this: Registry,
      cb: (err: Error | undefined, result: Registry[]) => void,
    ): Registry {
      cb(undefined, [PODMAN_UNINSTALL_REGISTRY]);
      return this;
    });

    vi.mocked(PODMAN_UNINSTALL_REGISTRY.valueExists).mockImplementation(function (
      this: Registry,
      name: string,
      cb: (err: Error, exists: boolean) => void,
    ): Registry {
      cb(undefined as unknown as Error, true);
      return this;
    });

    vi.mocked(PODMAN_UNINSTALL_REGISTRY.get).mockImplementation(function (
      this: Registry,
      name: string,
      cb: (err: Error, result: RegistryItem) => void,
    ): Registry {
      switch (name) {
        case UNINSTALL_REGISTRY_DISPLAY_NAME_KEY:
          cb(
            undefined as unknown as Error,
            {
              value: 'podman',
            } as RegistryItem,
          );
          break;
        case UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY:
          cb(
            undefined as unknown as Error,
            {
              value: UNINSTALL_CMD_MOCK,
            } as RegistryItem,
          );
          break;
        default:
          throw new Error(`unknown key ${name}`);
      }
      return this;
    });
  });

  test('should invoke the uninstall executable directly with parsed args', async () => {
    await podmanWindowsLegacyInstaller.uninstall();

    // the quoted exe path and its flags are passed as discrete args (no cmd.exe wrapper),
    // so each token is individually escaped by the admin exec path rather than shell-quoted
    expect(extensionApi.process.exec).toHaveBeenCalledWith(UNINSTALL_EXE_MOCK, ['/uninstall', '/quiet'], {
      isAdmin: true,
      logger: expect.anything(),
    });
  });

  test('expect telemetry usage to be provided for uninstall legacy', async () => {
    await podmanWindowsLegacyInstaller.uninstall();

    expect(TELEMETRY_LOGGER_MOCK.logUsage).toHaveBeenCalledWith('podman.uninstallLegacy', {
      duration: expect.any(Number),
    });
  });

  test('expect error raised during uninstall to be logged in telemetry', async () => {
    const error = new Error('Dummy Foo Bar');
    vi.mocked(WinReg.prototype.keys).mockImplementation(function (
      this: Registry,
      cb: (err: Error | undefined, result: Registry[]) => void,
    ): Registry {
      cb(error, []);
      return this;
    });

    await expect(async () => {
      return await podmanWindowsLegacyInstaller.uninstall();
    }).rejects.toThrowError(error);

    expect(TELEMETRY_LOGGER_MOCK.logUsage).toHaveBeenCalledWith(
      'podman.uninstallLegacy',
      expect.objectContaining({
        error: error,
      }),
    );
  });

  test('expect error raised from a malformed QuietUninstallString to be logged in telemetry', async () => {
    vi.mocked(PODMAN_UNINSTALL_REGISTRY.get).mockImplementation(function (
      this: Registry,
      name: string,
      cb: (err: Error, result: RegistryItem) => void,
    ): Registry {
      switch (name) {
        case UNINSTALL_REGISTRY_DISPLAY_NAME_KEY:
          cb(
            undefined as unknown as Error,
            {
              value: 'podman',
            } as RegistryItem,
          );
          break;
        case UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY:
          cb(
            undefined as unknown as Error,
            {
              value: '',
            } as RegistryItem,
          );
          break;
        default:
          throw new Error(`unknown key ${name}`);
      }
      return this;
    });

    await expect(async () => {
      return await podmanWindowsLegacyInstaller.uninstall();
    }).rejects.toThrowError(/empty command line/);

    expect(extensionApi.process.exec).not.toHaveBeenCalled();
    expect(TELEMETRY_LOGGER_MOCK.logUsage).toHaveBeenCalledWith(
      'podman.uninstallLegacy',
      expect.objectContaining({
        error: expect.any(Error),
      }),
    );
  });
});
