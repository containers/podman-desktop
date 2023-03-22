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
import { getSocketCompatibility, DarwinSocketCompatibility, WindowsSocketCompatibility } from './compatibility-mode';
import * as extensionApi from '@podman-desktop/api';

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
    },
  };
});

// macOS tests

vi.mock('runSudoMacHelperCommand', () => {
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
  socketCompatClass.runCommand('enable', 'enabled');

  // Expect that mac helper command was ran
  expect(spyMacHelperCommand).toHaveBeenCalled();
});

// Linux tests

test('linux: compatibility mode fail', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Expect getSocketCompatibility to return error since Linux is not supported yet
  expect(() => getSocketCompatibility()).toThrowError();
});

// Windows tests

test('windows: compatibility mode pass', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'win32',
  });

  // Expect getSocketCompatibility to return error since Linux is not supported yet
  expect(() => getSocketCompatibility()).toBeTruthy();
});

test('windows: fail when docker is detected when enabling', async () => {
  // Test Windows functionality
  const socketCompatClass = new WindowsSocketCompatibility();

  // Mock that isDockerRunning returns true
  const spyIsDockerRunning = vi.spyOn(socketCompatClass, 'isDockerRunning');
  spyIsDockerRunning.mockImplementation(() => {
    return Promise.resolve(true);
  });

  await socketCompatClass.enable();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
});

test('windows: fail when disabling functionality, prompt for docker to be running', async () => {
  const socketCompatClass = new WindowsSocketCompatibility();
  const spyIsDockerRunning = vi.spyOn(socketCompatClass, 'isDockerRunning');
  spyIsDockerRunning.mockImplementation(() => {
    return Promise.resolve(false);
  });

  // 'Errors' because it will prompt that docker is not running.
  await socketCompatClass.disable();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
});

test('windows: test that restart is called when enabling and docker is not runnning', async () => {
  const socketCompatClass = new WindowsSocketCompatibility();
  const spyIsDockerRunning = vi.spyOn(socketCompatClass, 'isDockerRunning');
  spyIsDockerRunning.mockImplementation(() => {
    return Promise.resolve(false);
  });

  const spyRestart = vi.spyOn(socketCompatClass, 'restartPodmanMachineWithConfirmation');
  spyRestart.mockImplementation(() => {
    return Promise.resolve();
  });

  await socketCompatClass.enable();
  expect(spyRestart).toHaveBeenCalled();
});

test('windows: test that restart is called when disabling and docker is running', async () => {
  const socketCompatClass = new WindowsSocketCompatibility();
  const spyIsDockerRunning = vi.spyOn(socketCompatClass, 'isDockerRunning');
  spyIsDockerRunning.mockImplementation(() => {
    return Promise.resolve(true);
  });
  const spyRestart = vi.spyOn(socketCompatClass, 'restartPodmanMachineWithConfirmation');
  spyRestart.mockImplementation(() => {
    return Promise.resolve();
  });
  await socketCompatClass.disable();
  expect(spyRestart).toHaveBeenCalled();
});
