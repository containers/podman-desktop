/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { InstalledPodman } from './podman-cli';
import type { Installer, PodmanInfo, UpdateCheck } from './podman-install';
import {
  getBundledPodmanVersion,
  HyperVCheck,
  PodmanInstall,
  WinInstaller,
  WSL2Check,
  WSLVersionCheck,
} from './podman-install';
import * as podmanInstallObj from './podman-install';
import { releaseNotes } from './podman5.json';
import * as utils from './util';

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

const extensionContext = {
  subscriptions: [],
} as unknown as extensionApi.ExtensionContext;

// mock ps-list
vi.mock('ps-list', async () => {
  return {
    default: vi.fn(),
  };
});

// mock release
vi.mock('node:os', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('node:os')>('node:os');
  return {
    ...actual,
    release: vi.fn(),
    totalmem: vi.fn(),
  };
});

vi.mock('@podman-desktop/api', async () => {
  return {
    commands: {
      registerCommand: vi.fn(),
    },
    env: {
      isMac: true,
      openExternal: vi.fn(),
    },
    window: {
      withProgress: vi.fn(),
      showNotification: vi.fn(),
      showErrorMessage: vi.fn(),
      showInformationMessage: vi.fn(),
      showWarningMessage: vi.fn(),
    },
    ProgressLocation: {},
    process: {
      exec: vi.fn(),
    },
    configuration: {
      getConfiguration: vi.fn(),
    },
    Uri: {
      parse: vi.fn(),
    },
  };
});

vi.mock('./util', async () => {
  return {
    getAssetsFolder: vi.fn().mockReturnValue(''),
    runCliCommand: vi.fn(),
    appHomeDir: vi.fn().mockReturnValue(''),
    normalizeWSLOutput: vi.fn().mockImplementation((s: string) => s),
    isLinux: vi.fn(),
    isWindows: vi.fn(),
    isMac: vi.fn(),
    execPodman: vi.fn(),
  };
});

const progress = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  report: (): void => {},
};

beforeEach(() => {
  vi.clearAllMocks();
  // reset array of subscriptions
  extensionContext.subscriptions.length = 0;
  console.error = consoleErrorMock;
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => false,
    has: vi.fn(),
    update: vi.fn(),
  });
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('expect update on windows to show notification in case of 0 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, {} as unknown as extensionApi.CancellationToken);
  });

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => Promise.resolve({} as extensionApi.RunResult));

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.mocked(fs.readdirSync).mockReturnValue([]);

  const installer = new WinInstaller(extensionContext);
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).toHaveBeenCalled();
});

test('expect update on windows not to show notification in case of 1602 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, {} as unknown as extensionApi.CancellationToken);
  });
  const customError = { exitCode: 1602 } as extensionApi.RunError;
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw customError;
  });

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.mocked(fs.readdirSync).mockReturnValue([]);

  const installer = new WinInstaller(extensionContext);
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).not.toHaveBeenCalled();
});

test('expect update on windows to throw error if non zero exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, {} as unknown as extensionApi.CancellationToken);
  });
  const customError = { exitCode: -1, stderr: 'CustomError' } as extensionApi.RunError;

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw customError;
  });

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.mocked(fs.readdirSync).mockReturnValue([]);

  const installer = new WinInstaller(extensionContext);
  const result = await installer.update();
  expect(result).toBeFalsy();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
});

test('expect winbit preflight check return successful result if the arch is x64', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'x64',
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winBitCheck = preflights[0];
  const result = await winBitCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winbit preflight check return successful result if the arch is arm64', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'arm64',
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winBitCheck = preflights[0];
  const result = await winBitCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winbit preflight check return failure result if the arch is not supported', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'x86',
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winBitCheck = preflights[0];
  const result = await winBitCheck.execute();
  expect(result.description).equal('WSL2 works only on 64bit OS.');
  expect(result.docLinksDescription).equal('Learn about WSL requirements:');
  expect(result.docLinks?.[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winversion preflight check return successful result if the version is greater than min valid version', async () => {
  vi.spyOn(os, 'release').mockReturnValue('10.0.19043');

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winversion preflight check return failure result if the version is greater than 9. and less than min build version', async () => {
  vi.spyOn(os, 'release').mockReturnValue('10.0.19042');

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.description).equal('To be able to run WSL2 you need Windows 10 Build 19043 or later.');
  expect(result.docLinksDescription).equal('Learn about WSL requirements:');
  expect(result.docLinks?.[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winversion preflight check return failure result if the version is less than 10.0.0', async () => {
  vi.spyOn(os, 'release').mockReturnValue('9.0.19000');

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.description).equal('WSL2 works only on Windows 10 and newest OS');
  expect(result.docLinksDescription).equal('Learn about WSL requirements:');
  expect(result.docLinks?.[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winMemory preflight check return successful result if the machine has more than 5GB of memory', async () => {
  const SYSTEM_MEM = 7 * 1024 * 1024 * 1024;
  vi.spyOn(os, 'totalmem').mockReturnValue(SYSTEM_MEM);

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winMemoryCheck = preflights[2];
  const result = await winMemoryCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winMemory preflight check return failure result if the machine has less than 5GB of memory', async () => {
  const SYSTEM_MEM = 4 * 1024 * 1024 * 1024;
  vi.spyOn(os, 'totalmem').mockReturnValue(SYSTEM_MEM);

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winMemoryCheck = preflights[2];
  const result = await winMemoryCheck.execute();
  expect(result.description).equal('You need at least 5GB to run Podman.');
  expect(result.docLinksDescription).toBeUndefined();
  expect(result.docLinks).toBeUndefined();
  expect(result.fixCommand).toBeUndefined();
});

test('expect winVirtualMachine preflight check return successful result if the virtual machine platform feature is enabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() =>
    Promise.resolve({
      stdout: 'VirtualMachinePlatform',
      stderr: '',
      command: 'command',
    }),
  );

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winVirtualMachine preflight check return successful result if the virtual machine platform feature is disabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() =>
    Promise.resolve({
      stdout: 'some message',
      stderr: '',
      command: 'command',
    }),
  );

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.description).equal('Virtual Machine Platform should be enabled to be able to run Podman.');
  expect(result.docLinksDescription).equal('Learn about how to enable the Virtual Machine Platform feature:');
  expect(result.docLinks?.[0].url).equal(
    'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
  );
  expect(result.docLinks?.[0].title).equal('Enable Virtual Machine Platform');
});

test('expect winVirtualMachine preflight check return successful result if there is an error when checking if virtual machine platform feature is enabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw new Error();
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.description).equal('Virtual Machine Platform should be enabled to be able to run Podman.');
  expect(result.docLinksDescription).equal('Learn about how to enable the Virtual Machine Platform feature:');
  expect(result.docLinks?.[0].url).equal(
    'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
  );
  expect(result.docLinks?.[0].title).equal('Enable Virtual Machine Platform');
});

test('expect WSLVersion preflight check return fail result if wsl --version command fails its execution', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue('');

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL version should be >= 1.2.5.');
  expect(result.docLinksDescription).equal(`Call 'wsl --version' in a terminal to check your wsl version.`);
});

test('expect WSLVersion preflight check return fail result if first line output do not contain any colon symbol', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'unknown message',
    stderr: '',
    command: 'command',
  });

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL version should be >= 1.2.5.');
  expect(result.docLinksDescription).equal(`Call 'wsl --version' in a terminal to check your wsl version.`);
});

test('expect WSLVersion preflight check return fail result if first line output do not contain any wsl word', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'unknown message: 1.2.5.0',
    stderr: '',
    command: 'command',
  });

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL version should be >= 1.2.5.');
  expect(result.docLinksDescription).equal(`Call 'wsl --version' in a terminal to check your wsl version.`);
});

test('expect WSLVersion preflight check return fail result if first line output contain an invalid version', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'WSL version: 1.1.3',
    stderr: '',
    command: 'command',
  });

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.description).equal('Your WSL version is 1.1.3 but it should be >= 1.2.5.');
  expect(result.docLinksDescription).equal(
    `Call 'wsl --update' to update your WSL installation. If you do not have access to the Windows store you can run 'wsl --update --web-download'. If you still receive an error please contact your IT administator as 'Windows Store Applications' may have been disabled.`,
  );
});

test('expect WSLVersion preflight check return fail result if first line output contain a version equal to the minimum supported version', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'WSL version: 1.2.5.0',
    stderr: '',
    command: 'command',
  });

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect WSLVersion preflight check return fail result if first line output contain a version greater than the minimum supported version', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'WSL version: 2.4.0',
    stderr: '',
    command: 'command',
  });

  const winWSLCheck = new WSLVersionCheck();
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return successful result if the machine has WSL2 installed and do not need to reboot', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: 'True',
        stderr: '',
        command: 'command',
      });
    } else {
      return Promise.resolve({
        stdout: 'blabla',
        stderr: '',
        command: 'command',
      });
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return failure result if the machine has WSL2 installed but needs a reboot', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: 'True',
        stderr: '',
        command: 'command',
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === '-l') {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            exitCode: -1,
            stdout: 'random error message\nError code: Wsl/WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED',
            stderr: '',
            command: 'command',
          });
        } else {
          // eslint-disable-next-line prefer-promise-reject-errors
          resolve({
            stdout: 'blabla',
            stderr: '',
            command: 'command',
          });
        }
      });
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.description).equal(
    'WSL2 seems to be installed but the system needs to be restarted so the changes can take effect.',
  );
  expect(result.docLinksDescription).equal(
    `If already restarted, call 'wsl --install --no-distribution' in a terminal.`,
  );
  expect(result.docLinks?.[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
});

test('expect winWSL2 preflight check return successful result if the machine has WSL2 installed and the reboot check fails with a code different from WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: 'True',
        stderr: '',
        command: 'command',
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === '-l') {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            exitCode: -1,
            stdout: 'random error message\nError code: Wsl/WSL_E_DEFAULT_DISTRO_NOT_FOUND',
            stderr: '',
            command: 'command',
          });
        } else {
          // eslint-disable-next-line prefer-promise-reject-errors
          resolve({
            stdout: 'blabla',
            stderr: '',
            command: 'command',
          });
        }
      });
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return failure result if user do not have wsl but he is admin', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: 'True',
        stderr: '',
        command: 'command',
      });
    } else {
      return Promise.resolve({
        stdout: '',
        stderr: '',
        command: 'command',
      });
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL2 is not installed.');
  expect(result.docLinksDescription).equal(`Call 'wsl --install --no-distribution' in a terminal.`);
  expect(result.docLinks?.[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 preflight check return failure result if user do not have wsl but he is not admin', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: 'False',
        stderr: '',
        command: 'command',
      });
    } else {
      return Promise.resolve({
        stdout: '',
        stderr: '',
        command: 'command',
      });
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL2 is not installed or you do not have permissions to run WSL2.');
  expect(result.docLinksDescription).equal('Contact your Administrator to setup WSL2.');
  expect(result.docLinks?.[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 preflight check return failure result if it fails when checking if wsl is installed', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return Promise.resolve({
        stdout: '',
        stderr: '',
        command: 'command',
      });
    } else {
      throw new Error();
    }
  });

  const winWSLCheck = new WSL2Check(extensionContext);
  const result = await winWSLCheck.execute();
  expect(result.description).equal('Could not detect WSL2');
  expect(result.docLinks?.[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks?.[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 init to register WSLInstall command', async () => {
  const registerCommandMock = vi.spyOn(extensionApi.commands, 'registerCommand');
  const winWSLCheck = new WSL2Check(extensionContext);
  await winWSLCheck.init?.();
  expect(registerCommandMock).toBeCalledWith('podman.onboarding.installWSL', expect.any(Function));
});

test('expect winWSL2 command to be registered as disposable', async () => {
  const registerCommandMock = vi.spyOn(extensionApi.commands, 'registerCommand');
  const disposableMock = {
    dispose: vi.fn(),
  };
  registerCommandMock.mockReturnValue(disposableMock);
  const winWSLCheck = new WSL2Check(extensionContext);
  await winWSLCheck.init?.();
  expect(registerCommandMock).toBeCalledWith('podman.onboarding.installWSL', expect.any(Function));

  // should contain a subscription with a disposable function
  expect(extensionContext.subscriptions[0]).toBeDefined();
  expect(extensionContext.subscriptions[0].dispose).toBeDefined();
});

describe('HyperV', () => {
  test('expect HyperV preflight check return failure result if it fails when checking admin user', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      throw new Error();
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).equal('You must have administrative rights to run Hyper-V Podman machines');
    expect(result.docLinks?.[0].url).equal(
      'https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v',
    );
    expect(result.docLinks?.[0].title).equal('Hyper-V Manual Installation Steps');
  });

  test('expect HyperV preflight check return failure result if non admin user', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      return Promise.resolve({
        stdout: 'False',
        stderr: '',
        command: 'command',
      });
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).equal('You must have administrative rights to run Hyper-V Podman machines');
    expect(result.docLinks?.[0].url).equal(
      'https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v',
    );
    expect(result.docLinks?.[0].title).equal('Hyper-V Manual Installation Steps');
  });

  test('expect HyperV preflight check return failure result if Podman Desktop is not run with elevated privileges', async () => {
    let index = 0;
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      if (index++ < 1) {
        return Promise.resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      } else {
        throw new Error();
      }
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).equal(
      'You must run Podman Desktop with administrative rights to run Hyper-V Podman machines.',
    );
    expect(result.docLinks).toBeUndefined();
  });

  test('expect HyperV preflight check return failure result if HyperV not installed', async () => {
    let index = 0;
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      if (index++ <= 1) {
        return Promise.resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      } else {
        throw new Error();
      }
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).equal('Hyper-V is not installed on your system.');
    expect(result.docLinks?.[0].url).equal(
      'https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v',
    );
    expect(result.docLinks?.[0].title).equal('Hyper-V Manual Installation Steps');
  });

  test('expect HyperV preflight check return failure result if HyperV not running', async () => {
    let index = 0;
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      if (index++ <= 2) {
        return Promise.resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      } else {
        throw new Error();
      }
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).equal('Hyper-V is not running on your system.');
    expect(result.docLinks?.[0].url).equal(
      'https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v',
    );
    expect(result.docLinks?.[0].title).equal('Hyper-V Manual Installation Steps');
  });

  test('expect HyperV preflight check return OK', async () => {
    let index = 0;
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
      if (index++ < 4) {
        return Promise.resolve({
          stdout: index === 4 ? 'Running' : 'True',
          stderr: '',
          command: 'command',
        });
      } else {
        throw new Error();
      }
    });

    const hyperVCheck = new HyperVCheck();
    const result = await hyperVCheck.execute();
    expect(result.successful).toBeTruthy();
    expect(result.description).toBeUndefined();
    expect(result.docLinks?.[0].url).toBeUndefined();
    expect(result.docLinks?.[0].title).toBeUndefined();
  });
});

describe('getBundledPodmanVersion', () => {
  test('should return the podman 5 version', async () => {
    const version = getBundledPodmanVersion();
    expect(version.startsWith('5')).toBeTruthy();
    expect(version.startsWith('4')).toBeFalsy();
  });
});

class TestPodmanInstall extends PodmanInstall {
  async stopPodmanMachinesIfAnyBeforeUpdating(): Promise<boolean> {
    return super.stopPodmanMachinesIfAnyBeforeUpdating();
  }

  async wipeAllDataBeforeUpdatingToV5(installed: InstalledPodman, updateCheck: UpdateCheck): Promise<boolean> {
    return super.wipeAllDataBeforeUpdatingToV5(installed, updateCheck);
  }

  getProviderCleanup(): extensionApi.ProviderCleanup {
    if (!this.providerCleanup) {
      throw new Error('providerCleanup is not defined');
    }
    return this.providerCleanup;
  }

  getInstaller(): Installer | undefined {
    return super.getInstaller();
  }
}

describe('update checks', () => {
  test('stopPodmanMachinesIfAnyBeforeUpdating with an error', async () => {
    const podmanInstall = new TestPodmanInstall(extensionContext);

    // return empty machine list
    vi.mocked(extensionApi.process.exec).mockRejectedValue('invalid');

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  });

  test('stopPodmanMachinesIfAnyBeforeUpdating with no machine running', async () => {
    const podmanInstall = new TestPodmanInstall(extensionContext);

    // return empty machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted as it is not running
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  });

  test('stopPodmanMachinesIfAnyBeforeUpdating with one machine running', async () => {
    const podmanInstall = new TestPodmanInstall(extensionContext);

    vi.spyOn(extensionApi.process, 'exec').mockResolvedValueOnce({
      stdout: 'podman version 5.0.0',
    } as extensionApi.RunResult);

    // return empty machine list
    vi.spyOn(utils, 'execPodman').mockResolvedValueOnce({
      stdout: JSON.stringify([{ Name: 'test', Running: true, VMType: 'libkrun' }]),
    } as unknown as extensionApi.RunResult);

    // mock user response
    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted as it is not running
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();

    // check we called the stop command
    expect(extensionApi.process.exec).toHaveBeenCalledWith(expect.stringContaining('podman'), [
      'machine',
      'stop',
      'test',
    ]);
  });

  test('wipeAllDataBeforeUpdatingToV5 with podman 4.9 -> 5.0', async () => {
    const podmanInstall = new TestPodmanInstall(extensionContext);

    // mock the getActions
    const providerCleanup = podmanInstall.getProviderCleanup();
    expect(providerCleanup).toBeDefined();

    // fake actions
    const action1Exectute = vi.fn();
    const action1 = {
      name: 'test',
      execute: action1Exectute,
    };

    vi.spyOn(providerCleanup, 'getActions').mockResolvedValue([action1]);

    // mock user response
    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.wipeAllDataBeforeUpdatingToV5(
      {
        version: '4.9.3',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '5.0.0',
      } as unknown as UpdateCheck,
    );

    // expect user is prompted
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();

    // getActions should have been called
    expect(providerCleanup.getActions).toHaveBeenCalled();

    // action should have been called
    expect(action1Exectute).toHaveBeenCalled();
  });

  test('wipeAllDataBeforeUpdatingToV5 no action with podman 4.9.1 -> 4.9.2', async () => {
    const podmanInstall = new TestPodmanInstall(extensionContext);

    // mock the getActions
    const providerCleanup = podmanInstall.getProviderCleanup();
    expect(providerCleanup).toBeDefined();
    vi.spyOn(providerCleanup, 'getActions');

    await podmanInstall.wipeAllDataBeforeUpdatingToV5(
      {
        version: '4.9.1',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '4.9.2',
      } as unknown as UpdateCheck,
    );

    // expect user is not prompted
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();

    // getActions should not have been called
    expect(providerCleanup.getActions).not.toHaveBeenCalled();
  });
});

test('checkForUpdate should return no installed version if there is no lastRunInfo', async () => {
  const podmanInstall = new TestPodmanInstall(extensionContext);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue(undefined);
  const result = await podmanInstall.checkForUpdate(undefined);
  expect(result).toStrictEqual({ installedVersion: undefined, hasUpdate: false, bundledVersion: undefined });
});

test('checkForUpdate should return no installed version if there is lastRunInfo but it has no version', async () => {
  const podmanInstall = new TestPodmanInstall(extensionContext);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate(undefined);
  expect(result).toStrictEqual({ installedVersion: undefined, hasUpdate: false, bundledVersion: undefined });
});

test('checkForUpdate should return installed version and no update if the installed version is the latest', async () => {
  const podmanInstall = new TestPodmanInstall(extensionContext);
  vi.spyOn(podmanInstall, 'getInstaller').mockReturnValue({
    requireUpdate: vi.fn().mockReturnValue(false),
  } as unknown as Installer);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate({
    version: '1.1',
  });
  expect(result).toStrictEqual({
    installedVersion: '1.1',
    hasUpdate: false,
    bundledVersion: podmanInstallObj.getBundledPodmanVersion(),
  });
});

test('checkForUpdate should return installed version and update if the installed version is NOT the latest', async () => {
  const podmanInstall = new TestPodmanInstall(extensionContext);
  vi.spyOn(podmanInstall, 'getInstaller').mockReturnValue({
    requireUpdate: vi.fn().mockReturnValue(true),
  } as unknown as Installer);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate({
    version: '1.1',
  });
  expect(result).toStrictEqual({
    installedVersion: '1.1',
    hasUpdate: true,
    bundledVersion: podmanInstallObj.getBundledPodmanVersion(),
  });
});

const providerMock: extensionApi.Provider = {} as unknown as extensionApi.Provider;

describe('performUpdate', () => {
  test('should raise an error if no podmanInfo provided', async () => {
    const podmanInstall: TestPodmanInstall = new TestPodmanInstall(extensionContext);

    await expect(() => {
      return podmanInstall.performUpdate(providerMock, undefined);
    }).rejects.toThrowError('The podman extension has not been successfully initialized');
  });

  test('should call showWarningMessage if stopPodmanMachinesIfAnyBeforeUpdating resolve false', async () => {
    const podmanInstall: TestPodmanInstall = new TestPodmanInstall(extensionContext);
    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;
    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });
    // E.g. user cancel stop
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(false);

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.window.showWarningMessage).toHaveBeenCalledWith('Podman update has been canceled.', 'OK');
  });

  test('should call showInformationMessage ', async () => {
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue(undefined);

    const podmanInstall: TestPodmanInstall = new TestPodmanInstall(extensionContext);
    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;

    // all podman machine are stopped
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(true);
    // return true if data have been cleaned or if user skip it
    vi.spyOn(podmanInstall, 'wipeAllDataBeforeUpdatingToV5').mockResolvedValue(true);

    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      'You have Podman 1.0.0.\nDo you want to update to 0.9.8?',
      'Yes',
      'No',
      'Ignore',
      'Open release notes',
    );
  });

  test('user clicking on Open release note should open external link', async () => {
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Open release notes');

    const podmanInstall: TestPodmanInstall = new TestPodmanInstall(extensionContext);
    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;

    // all podman machine are stopped
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(true);
    // return true if data have been cleaned or if user skip it
    vi.spyOn(podmanInstall, 'wipeAllDataBeforeUpdatingToV5').mockResolvedValue(true);

    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.Uri.parse).toHaveBeenCalledWith(releaseNotes.href);
    expect(extensionApi.env.openExternal).toHaveBeenCalled();
  });
});
