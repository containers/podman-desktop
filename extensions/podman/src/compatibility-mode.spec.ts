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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { afterEach, expect, test, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { getSocketCompatibility, DarwinSocketCompatibility, LinuxSocketCompatibility } from './compatibility-mode';
import * as extensionApi from '@podman-desktop/api';
import type { Readable } from 'node:stream';

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showErrorMessage: vi.fn(),
      showInformationMessage: vi.fn(),
    },
  };
});

// macOS tests

vi.mock('runSudoMacHelperCommand', () => {
  return vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('darwin: compatibility mode binary not found failure', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  // Mock that the binary is not found
  const socketCompatClass = new DarwinSocketCompatibility();
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('');

  // Expect the error to show when it's not found / enable isn't ran.
  await socketCompatClass.enable();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith('podman-mac-helper binary not found.', 'OK');
});

test('darwin: DarwinSocketCompatibility class, test runSudoMacHelperCommand ran within runCommand', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  const socketCompatClass = new DarwinSocketCompatibility();

  // Mock that the binary is found
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('/opt/podman/bin/podman-mac-helper');

  // Mock that sudo ran successfully (since we cannot test sudo-prompt in vitest / has to be integration tests)
  const spyMacHelperCommand = vi.spyOn(socketCompatClass, 'runSudoMacHelperCommand');
  spyMacHelperCommand.mockImplementation(() => {
    return Promise.resolve();
  });

  // Run the command
  await socketCompatClass.runCommand('enable', 'enabled');

  // Expect that mac helper command was ran
  expect(spyMacHelperCommand).toHaveBeenCalled();
});

test('darwin: mock fs.existsSync returns /usr/local/bin/podman-mac-helper', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  // mock existsSync to return true only if '/usr/local/bin/podman-mac-helper' is passed in,
  // forcing it to return false for all other paths.
  // this imitates that the binary is found in /usr/local/bin and not other folders
  vi.mock('fs', () => {
    return {
      existsSync: (path: string) => {
        return path === '/usr/local/bin/podman-mac-helper';
      },
    };
  });

  // Mock that the binary is found
  const socketCompatClass = new DarwinSocketCompatibility();

  // Run findPodmanHelper
  const binaryPath = socketCompatClass.findPodmanHelper();

  // Expect binaryPath to be /usr/local/bin/podman-mac-helper
  expect(binaryPath).toBe('/usr/local/bin/podman-mac-helper');
});

// Linux tests
test('linux: compatibility mode pass', async () => {
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });
  expect(() => getSocketCompatibility()).toBeTruthy();
});

// Fail when trying to use runSystemdCommand with a command that's not "enable" or "disable"
test('linux: fail when trying to use runSystemdCommand with a command that is not "enable" or "disable"', async () => {
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  const socketCompatClass = new LinuxSocketCompatibility();
  await expect(socketCompatClass.runSystemdCommand('start', 'enabled')).rejects.toThrowError(
    'runSystemdCommand only accepts enable or disable as the command',
  );
});

test('linux: pass enabling when systemctl command exists', async () => {
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Mock that execSync runs successfully
  vi.mock('child_process', () => {
    return {
      execSync: vi.fn(),
      spawn: vi.fn(),
    };
  });

  const on: any = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
    if (event === 'data') {
      cb('');
    }
  }) as unknown as Readable;
  vi.mocked(spawn).mockReturnValue({
    stdout: { on, setEncoding: vi.fn() },
    stderr: { on, setEncoding: vi.fn() },
    on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
      if (event === 'close') {
        cb(0);
      }
    }),
  } as any);

  const socketCompatClass = new LinuxSocketCompatibility();

  // Expect enable() to pass since systemctl command exists
  await expect(socketCompatClass.enable()).resolves.toBeUndefined();
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();
});

// Windows tests
test('windows: compatibility mode fail', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'win32',
  });

  // Expect getSocketCompatibility to return error since Linux is not supported yet
  expect(() => getSocketCompatibility()).toThrowError();
});
