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

import { WinInstaller } from './podman-install';
import { beforeEach, expect, test, vi, afterEach } from 'vitest';
import * as extensionApi from '@podman-desktop/api';
import * as fs from 'node:fs';
import * as os from 'node:os';

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

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
  };
});

const progress = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  report: () => {},
};

beforeEach(() => {
  vi.clearAllMocks();
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

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
  const result = await installer.update();
  expect(result).toBeFalsy();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
});

test('expect winbit preflight check return successful result if the arch is x64', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'x64',
  });

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winBitCheck = preflights[0];
  const result = await winBitCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winbit preflight check return successful result if the arch is arm64', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'arm64',
  });

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winBitCheck = preflights[0];
  const result = await winBitCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winbit preflight check return failure result if the arch is not supported', async () => {
  Object.defineProperty(process, 'arch', {
    value: 'x86',
  });

  const installer = new WinInstaller();
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
  vi.spyOn(os, 'release').mockReturnValue('10.0.19000');

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winversion preflight check return failure result if the version is greater than 9. and less than min build version', async () => {
  vi.spyOn(os, 'release').mockReturnValue('10.0.1000');

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winVersionCheck = preflights[1];
  const result = await winVersionCheck.execute();
  expect(result.description).equal('To be able to run WSL2 you need Windows 10 Build 18362 or later.');
  expect(result.docLinksDescription).equal('Learn about WSL requirements:');
  expect(result.docLinks[0].url).equal(
    'https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2',
  );
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});

test('expect winversion preflight check return failure result if the version is less than 10.0.0', async () => {
  vi.spyOn(os, 'release').mockReturnValue('9.0.19000');

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winMemoryCheck = preflights[2];
  const result = await winMemoryCheck.execute();
  expect(result.successful).toBeTruthy();
});

test('expect winMemory preflight check return failure result if the machine has less than 6GB of memory', async () => {
  const SYSTEM_MEM = 4 * 1024 * 1024 * 1024;
  vi.spyOn(os, 'totalmem').mockReturnValue(SYSTEM_MEM);

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
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

  const installer = new WinInstaller();
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

test('expect winWSL2 preflight check return successful result if the machine has WSL2 installed', async () => {
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

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
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

  const installer = new WinInstaller();
  const preflights = installer.getPreflightChecks();
  const winWSLCheck = preflights[4];
  const result = await winWSLCheck.execute();
  expect(result.description).equal('Could not detect WSL2');
  expect(result.docLinks[0].url).equal('https://learn.microsoft.com/en-us/windows/wsl/install');
  expect(result.docLinks[0].title).equal('WSL2 Manual Installation Steps');
});
