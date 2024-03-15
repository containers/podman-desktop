/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { WinInstaller } from './podman-install';

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
    window: {
      withProgress: vi.fn(),
      showNotification: vi.fn(),
      showErrorMessage: vi.fn(),
    },
    ProgressLocation: {},
    process: {
      exec: vi.fn(),
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
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('expect update on windows to show notification in case of 0 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({} as extensionApi.RunResult);
      }),
  );

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);

  const installer = new WinInstaller(extensionContext);
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).toHaveBeenCalled();
});

test('expect update on windows not to show notification in case of 1602 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ exitCode: 1602 } as extensionApi.RunError);
      }),
  );

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);

  const installer = new WinInstaller(extensionContext);
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).not.toHaveBeenCalled();
});

test('expect update on windows to throw error if non zero exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ exitCode: -1, stderr: 'CustomError' } as extensionApi.RunError);
      }),
  );

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);

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
  expect(result.docLinks[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
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
  expect(result.docLinks[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winversion preflight check return failure result if the version is less than 10.0.0', async () => {
  vi.spyOn(os, 'release').mockReturnValue('9.0.19000');

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.description).equal('WSL2 works only on Windows 10 and newest OS');
  expect(result.docLinksDescription).equal('Learn about WSL requirements:');
  expect(result.docLinks[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winMemory preflight check return successful result if the machine has more than 6GB of memory', async () => {
  const SYSTEM_MEM = 7 * 1024 * 1024 * 1024;
  vi.spyOn(os, 'totalmem').mockReturnValue(SYSTEM_MEM);

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winMemoryCheck = preflights[2];
  const result = await winMemoryCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winMemory preflight check return failure result if the machine has less than 6GB of memory', async () => {
  const SYSTEM_MEM = 4 * 1024 * 1024 * 1024;
  vi.spyOn(os, 'totalmem').mockReturnValue(SYSTEM_MEM);

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winMemoryCheck = preflights[2];
  const result = await winMemoryCheck.execute();
  expect(result.description).equal('You need at least 6GB to run Podman.');
  expect(result.docLinksDescription).toBeUndefined();
  expect(result.docLinks).toBeUndefined();
  expect(result.fixCommand).toBeUndefined();
});

test('expect winVirtualMachine preflight check return successful result if the virtual machine platform feature is enabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'VirtualMachinePlatform',
          stderr: '',
          command: 'command',
        });
      }),
  );

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winVirtualMachine preflight check return successful result if the virtual machine platform feature is disabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'some message',
          stderr: '',
          command: 'command',
        });
      }),
  );

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.description).equal('Virtual Machine Platform should be enabled to be able to run Podman.');
  expect(result.docLinksDescription).equal('Learn about how to enable the Virtual Machine Platform feature:');
  expect(result.docLinks[0].url).equal(
    'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
  );
  expect(result.docLinks[0].title).equal('Enable Virtual Machine Platform');
});

test('expect winVirtualMachine preflight check return successful result if there is an error when checking if virtual machine platform feature is enabled', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((_, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('');
      }),
  );

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winVirtualMachinePlatformCheck = preflights[3];
  const result = await winVirtualMachinePlatformCheck.execute();
  expect(result.description).equal('Virtual Machine Platform should be enabled to be able to run Podman.');
  expect(result.docLinksDescription).equal('Learn about how to enable the Virtual Machine Platform feature:');
  expect(result.docLinks[0].url).equal(
    'https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-3---enable-virtual-machine-feature',
  );
  expect(result.docLinks[0].title).equal('Enable Virtual Machine Platform');
});

test('expect WSLVersion preflight check return fail result if wsl --version command fails its execution', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue('');

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect WSLVersion preflight check return fail result if first line output contain a version greater than the minimum supported version', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: 'WSL version: 2.4.0',
    stderr: '',
    command: 'command',
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return successful result if the machine has WSL2 installed and do not need to reboot', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'blabla',
          stderr: '',
          command: 'command',
        });
      });
    }
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return failure result if the machine has WSL2 installed but needs a reboot', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args[0] === '-l') {
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.description).equal(
    'WSL2 seems to be installed but the system needs to be restarted so the changes can take effect.',
  );
});

test('expect winWSL2 preflight check return successful result if the machine has WSL2 installed and the reboot check fails with a code different from WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args[0] === '-l') {
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

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winWSL2 preflight check return failure result if user do not have wsl but he is admin', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: '',
          stderr: '',
          command: 'command',
        });
      });
    }
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL2 is not installed.');
  expect(result.docLinksDescription).equal(`Call 'wsl --install --no-distribution' in a terminal.`);
  expect(result.docLinks[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 preflight check return failure result if user do not have wsl but he is not admin', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: 'False',
          stderr: '',
          command: 'command',
        });
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: '',
          stderr: '',
          command: 'command',
        });
      });
    }
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.description).equal('WSL2 is not installed or you do not have permissions to run WSL2.');
  expect(result.docLinksDescription).equal('Contact your Administrator to setup WSL2.');
  expect(result.docLinks[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 preflight check return failure result if it fails when checking if wsl is installed', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(command => {
    if (command === 'powershell.exe') {
      return new Promise<extensionApi.RunResult>((_, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('');
      });
    } else {
      return new Promise<extensionApi.RunResult>((resolve, _) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        resolve({
          stdout: '',
          stderr: '',
          command: 'command',
        });
      });
    }
  });

  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  const result = await winWSLCheck.execute();
  expect(result.description).equal('Could not detect WSL2');
  expect(result.docLinks[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winWSL2 init to register WSLInstall command', async () => {
  const registerCommandMock = vi.spyOn(extensionApi.commands, 'registerCommand');
  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  await winWSLCheck.init();
  expect(registerCommandMock).toBeCalledWith('podman.onboarding.installWSL', expect.any(Function));
});

test('expect winWSL2 command to be registered as disposable', async () => {
  const registerCommandMock = vi.spyOn(extensionApi.commands, 'registerCommand');
  const disposableMock = {
    dispose: vi.fn(),
  };
  registerCommandMock.mockReturnValue(disposableMock);
  const installer = new WinInstaller(extensionContext);
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[5];
  await winWSLCheck.init();
  expect(registerCommandMock).toBeCalledWith('podman.onboarding.installWSL', expect.any(Function));

  // should contain a subscription with a disposable function
  expect(extensionContext.subscriptions[0]).toBeDefined();
  expect(extensionContext.subscriptions[0].dispose).toBeDefined();
});
