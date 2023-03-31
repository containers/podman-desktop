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

import { expect, test, vi } from 'vitest';
import { getSocketCompatibility, DarwinSocketCompatibility, LinuxSocketCompatibility } from './compatibility-mode';
import * as extensionApi from '@podman-desktop/api';

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showErrorMessage: vi.fn(),
    },
  };
});

// macOS tests

vi.mock('runSudoCommand', () => {
  return vi.fn();
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

test('darwin: DarwinSocketCompatibility class, test runSudoCommand ran within runCommand', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  const socketCompatClass = new DarwinSocketCompatibility();

  // Mock that the binary is found
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('/opt/podman/bin/podman-mac-helper');

  // Mock that sudo ran successfully (since we cannot test sudo-prompt in vitest / has to be integration tests)
  const spyMacHelperCommand = vi.spyOn(socketCompatClass, 'runSudoCommand');
  spyMacHelperCommand.mockImplementation(() => {
    return Promise.resolve();
  });

  // Run the command
  socketCompatClass.runCommand('enable', 'enabled');

  // Expect that mac helper command was ran
  expect(spyMacHelperCommand).toHaveBeenCalled();
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
    };
  });

  const socketCompatClass = new LinuxSocketCompatibility();

  // Expect enable() to pass since systemctl command exists
  await expect(socketCompatClass.enable()).resolves.toBeUndefined();
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
