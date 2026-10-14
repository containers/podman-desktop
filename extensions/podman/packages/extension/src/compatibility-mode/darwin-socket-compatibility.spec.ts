/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { existsSync, type PathLike } from 'node:fs';
import { userInfo } from 'node:os';

import * as extensionApi from '@podman-desktop/api';
import { window } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DarwinSocketCompatibility } from '/@/compatibility-mode/darwin-socket-compatibility';
import * as extension from '/@/extension';
import { findRunningMachine } from '/@/extension';
import * as util from '/@/utils/util';

vi.mock(import('/@/extension'));
vi.mock(import('node:fs'));
vi.mock(
  import('/@/utils/util'),
  (): Partial<typeof util> => ({
    appHomeDir: () => 'appHomeDir',
    execPodman: vi.fn(),
  }),
);

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();

  // Mock that findRunningMachine returns undefined
  vi.mocked(findRunningMachine).mockResolvedValue(undefined);

  // mock existsSync to return true only if '/usr/local/bin/podman-mac-helper' is passed in,
  // forcing it to return false for all other paths.
  // this imitates that the binary is found in /usr/local/bin and not other folders
  vi.mocked(existsSync).mockImplementation((path: PathLike): boolean => {
    return path === '/usr/local/bin/podman-mac-helper';
  });

  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });
});

test('darwin: compatibility mode binary not found failure', async () => {
  // Mock that the binary is not found
  const socketCompatClass = new DarwinSocketCompatibility();
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('');

  // Expect the error to show when it's not found / enable isn't ran.
  await socketCompatClass.enable();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith('podman-mac-helper binary not found.', 'OK');
});

test('darwin: DarwinSocketCompatibility class, test runMacHelperCommandWithAdminPriv ran within runCommand', async () => {
  const socketCompatClass = new DarwinSocketCompatibility();

  // Mock that the binary is found
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('/opt/podman/bin/podman-mac-helper');

  // Mock that admin command ran successfully (since we cannot test interactive mode priv in vitest / has to be integration tests)
  const spyMacHelperCommand = vi.spyOn(socketCompatClass, 'runMacHelperCommandWithAdminPriv');
  spyMacHelperCommand.mockResolvedValue(undefined);

  // Run the command
  await socketCompatClass.runCommand('enable', 'enabled');

  // Expect that mac helper command was ran
  expect(spyMacHelperCommand).toHaveBeenCalled();
});

test('darwin: DarwinSocketCompatibility class, test promptRestart ran within runCommand', async () => {
  const socketCompatClass = new DarwinSocketCompatibility();

  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);

  const spyFindRunningMachine = vi.mocked(extension.findRunningMachine);
  spyFindRunningMachine.mockResolvedValue('default');

  // Mock that enable ran successfully
  const spyEnable = vi.spyOn(socketCompatClass, 'runCommand');
  spyEnable.mockResolvedValue(undefined);

  const spyPromptRestart = vi.spyOn(socketCompatClass, 'promptRestart');

  // Run the command
  await socketCompatClass.enable();

  // Expect that promptRestart was ran
  expect(spyPromptRestart).toHaveBeenCalled();
});

test('darwin: mock fs.existsSync returns /usr/local/bin/podman-mac-helper', async () => {
  // Mock that the binary is found
  const socketCompatClass = new DarwinSocketCompatibility();

  // Run findPodmanHelper
  const binaryPath = socketCompatClass.findPodmanHelper();

  // Expect binaryPath to be /usr/local/bin/podman-mac-helper
  expect(binaryPath).toBe('/usr/local/bin/podman-mac-helper');
});

describe('tooltip', () => {
  test.each<{
    enabled: boolean;
    text: string;
  }>([
    {
      enabled: true,
      text: 'Disable macOS Docker socket compatibility for Podman.',
    },
    {
      enabled: false,
      text: 'Enable macOS Docker socket compatibility for Podman.',
    },
  ])('text should be $text when isEnabled is $enabled', ({ enabled, text }) => {
    // Mock that the binary is found
    const socketCompatClass = new DarwinSocketCompatibility();

    vi.spyOn(socketCompatClass, 'isEnabled').mockReturnValue(enabled);

    expect(socketCompatClass.tooltipText()).toEqual(text);
  });
});

describe('isEnabled', () => {
  test('should return true if corresponding file exists', () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const socketCompatClass = new DarwinSocketCompatibility();

    expect(socketCompatClass.isEnabled()).toBeTruthy();
    expect(existsSync).toHaveBeenCalledExactlyOnceWith(
      `/Library/LaunchDaemons/com.github.containers.podman.helper-${userInfo().username}.plist`,
    );
  });

  test('should return false if corresponding file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const socketCompatClass = new DarwinSocketCompatibility();

    expect(socketCompatClass.isEnabled()).toBeFalsy();
    expect(existsSync).toHaveBeenCalledExactlyOnceWith(
      `/Library/LaunchDaemons/com.github.containers.podman.helper-${userInfo().username}.plist`,
    );
  });
});

describe('runMacHelperCommandWithAdminPriv', () => {
  test('should use the extension api with admin argument', async () => {
    vi.mocked(extensionApi.process.exec).mockResolvedValue({
      stderr: '',
      stdout: '',
      command: 'foo',
    });

    const socketCompatClass = new DarwinSocketCompatibility();
    await socketCompatClass.runMacHelperCommandWithAdminPriv('foo', ['bar']);

    expect(extensionApi.process.exec).toHaveBeenCalledExactlyOnceWith('foo', ['bar'], { isAdmin: true });
  });

  test('stderr with error should throw its content', async () => {
    vi.mocked(extensionApi.process.exec).mockResolvedValue({
      stderr: 'Error: foo',
      stdout: '',
      command: 'foo',
    });

    const socketCompatClass = new DarwinSocketCompatibility();

    await expect(() => {
      return socketCompatClass.runMacHelperCommandWithAdminPriv('foo', ['bar']);
    }).rejects.toThrowError('Unable to run command: Error: Error: foo');
  });
});

describe('promptRestart', () => {
  const PODMAN_MACHINE_MOCK = 'podman-machine-default';

  test('should ask the user to confirm', async () => {
    const socketCompatClass = new DarwinSocketCompatibility();

    await socketCompatClass.promptRestart(PODMAN_MACHINE_MOCK);

    expect(window.showInformationMessage).toHaveBeenCalledExactlyOnceWith(expect.any(String), 'Yes', 'Cancel');
  });

  test('should exec stop & start with user confirmation', async () => {
    vi.mocked(window.showInformationMessage).mockResolvedValue('Yes');
    const socketCompatClass = new DarwinSocketCompatibility();

    await socketCompatClass.promptRestart(PODMAN_MACHINE_MOCK);

    expect(util.execPodman).toHaveBeenCalledWith(['machine', 'stop', PODMAN_MACHINE_MOCK]);
    expect(util.execPodman).toHaveBeenCalledWith(['machine', 'start', PODMAN_MACHINE_MOCK]);
  });
});

test('darwin: test promptRestart IS NOT ran when findRunningMachine returns undefined for enable AND disable', async () => {
  const socketCompatClass = new DarwinSocketCompatibility();

  // Mock that enable ran successfully
  vi.spyOn(socketCompatClass, 'runCommand').mockResolvedValue(undefined);

  // Mock that disable ran successfully
  vi.spyOn(socketCompatClass, 'runCommand').mockResolvedValue(undefined);

  const spyPromptRestart = vi.spyOn(extensionApi.window, 'showInformationMessage');

  // Enable shouldn't call promptRestart
  await socketCompatClass.enable();
  expect(spyPromptRestart).not.toHaveBeenCalled();

  // Disable shouldn't call promptRestart
  await socketCompatClass.disable();
  expect(spyPromptRestart).not.toHaveBeenCalled();
});
