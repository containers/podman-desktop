/*********************************************************************
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
 ********************************************************************/

import { arch, release } from 'node:os';

import type { RunError, RunOptions, RunResult } from '@podman-desktop/api';
import { env as envAPI, process as processAPI, window as windowAPI } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { PodmanConfiguration } from './podman-configuration';
import { RosettaProvisioner } from './rosetta';
import { execPodman } from './util';

vi.mock(import('node:os'), async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const osActual = await vi.importActual<typeof import('node:os')>('node:os');

  return {
    ...osActual,
    release: vi.fn(),
    platform: vi.fn(),
    arch: vi.fn(),
  };
});

vi.mock(import('./util'));

let rosettaProvisioner: RosettaProvisioner;

beforeEach(() => {
  vi.resetAllMocks();

  rosettaProvisioner = new RosettaProvisioner();
});

describe('checkRosettaMacArm', async () => {
  const podmanConfiguration = {
    isRosettaEnabled: vi.fn(),
  } as unknown as PodmanConfiguration;

  test('check do nothing on non-macOS', async () => {
    await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);
    // not called as not on macOS
    expect(vi.mocked(podmanConfiguration.isRosettaEnabled)).not.toBeCalled();
  });

  test('check do nothing on macOS with intel', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('x64');
    await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);
    // not called as not on arm64
    expect(vi.mocked(podmanConfiguration.isRosettaEnabled)).not.toBeCalled();
  });

  test('check no dialog on macOS with arm64 if rosetta is working', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    // rosetta is being enabled per configuration
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);

    // mock rosetta is working when executing commands
    vi.mocked(processAPI.exec).mockResolvedValue({} as RunResult);

    await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);
    // check showInformationMessage is not called
    expect(processAPI.exec).toBeCalled();
    expect(podmanConfiguration.isRosettaEnabled).toBeCalled();
    expect(windowAPI.showInformationMessage).not.toBeCalled();
  });

  test('check no dialog on macOS with arm64 if rosetta is not enabled', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    // rosetta is being enabled per configuration
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(false);

    await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);
    // do not try to execute something as disabled
    expect(processAPI.exec).not.toBeCalled();
    expect(podmanConfiguration.isRosettaEnabled).toBeCalled();
    expect(windowAPI.showInformationMessage).not.toBeCalled();
  });

  test('check dialog on macOS with arm64 if rosetta is not working', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    // rosetta is being enabled per configuration
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);

    // mock rosetta is not working when executing commands
    vi.mocked(processAPI.exec).mockRejectedValue({ stderr: 'Bad CPU' } as RunError);

    await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);
    // check showInformationMessage is not called
    expect(processAPI.exec).toBeCalled();
    expect(podmanConfiguration.isRosettaEnabled).toBeCalled();
    expect(windowAPI.showInformationMessage).toBeCalled();
  });
});

describe('needsRosettaEnableFile', () => {
  const podmanConfiguration = {
    isRosettaEnabled: vi.fn(),
  } as unknown as PodmanConfiguration;

  // Darwin 25.x = macOS 26 (Tahoe), Darwin 24.x = macOS 15 (Sequoia)
  const TAHOE = '25.3.0';
  const SEQUOIA = '24.5.0';

  test.each([
    // [description, isMac, arch, darwinRelease, podmanVersion, rosettaEnabled, vmType, expected]
    ['non-macOS', false, 'arm64', TAHOE, '5.6.0', true, 'applehv', false],
    ['macOS Intel (x64)', true, 'x64', TAHOE, '5.6.0', true, 'applehv', false],
    ['macOS Sequoia ARM64', true, 'arm64', SEQUOIA, '5.6.0', true, 'applehv', false],
    ['macOS Tahoe, Podman 5.5.0 (too old)', true, 'arm64', TAHOE, '5.5.0', true, 'applehv', false],
    ['macOS Tahoe, Podman 5.6.0, Rosetta disabled', true, 'arm64', TAHOE, '5.6.0', false, 'applehv', false],
    ['macOS Tahoe, libkrun provider', true, 'arm64', TAHOE, '5.6.0', true, 'libkrun', false],
    ['macOS Tahoe, no vmType', true, 'arm64', TAHOE, '5.6.0', true, undefined, false],
    ['macOS Tahoe, Podman 5.6.0, Rosetta enabled', true, 'arm64', TAHOE, '5.6.0', true, 'applehv', true],
    ['macOS Tahoe, Podman 5.6.1, Rosetta enabled', true, 'arm64', TAHOE, '5.6.1', true, 'applehv', true],
    ['macOS Tahoe, Podman 6.0.0, Rosetta enabled', true, 'arm64', TAHOE, '6.0.0', true, 'applehv', true],
  ] as const)(
    '%s → %s',
    async (_desc, isMac, architecture, darwinRelease, podmanVersion, rosettaEnabled, vmType, expected) => {
      vi.mocked(envAPI).isMac = isMac;
      vi.mocked(arch).mockReturnValue(architecture);
      vi.mocked(release).mockReturnValue(darwinRelease);
      vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(rosettaEnabled);

      expect(await rosettaProvisioner.needsRosettaEnableFile(podmanConfiguration, podmanVersion, vmType)).toBe(
        expected,
      );
    },
  );
});

describe('enableRosettaInMachine', () => {
  const podmanConfiguration = {
    isRosettaEnabled: vi.fn(),
  } as unknown as PodmanConfiguration;

  const machineName = 'podman-machine-default';
  const vmType = 'applehv';
  const podmanVersion = '5.6.0';
  const tahoeRelease = '25.3.0';

  test('returns false when conditions are not met (non-macOS)', async () => {
    vi.mocked(envAPI).isMac = false;
    const result = await rosettaProvisioner.enableRosettaInMachine(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(false);
    expect(execPodman).not.toBeCalled();
  });

  test('returns false when enable-rosetta file already exists in the VM', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f succeeds → file exists
    vi.mocked(execPodman).mockResolvedValue({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.enableRosettaInMachine(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(false);
    expect(execPodman).toHaveBeenCalledWith(
      ['machine', 'ssh', machineName, 'test -f /etc/containers/enable-rosetta'],
      vmType,
    );
    expect(execPodman).toHaveBeenCalledTimes(1);
  });

  test('creates enable-rosetta file and returns true when file is missing', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f fails → file missing; sudo touch succeeds
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.enableRosettaInMachine(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(true);
    expect(execPodman).toHaveBeenNthCalledWith(
      1,
      ['machine', 'ssh', machineName, 'test -f /etc/containers/enable-rosetta'],
      vmType,
    );
    expect(execPodman).toHaveBeenNthCalledWith(
      2,
      ['machine', 'ssh', machineName, 'sudo touch /etc/containers/enable-rosetta'],
      vmType,
    );
  });

  test('omits machine name from ssh commands when machineName is empty', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.enableRosettaInMachine('', vmType, podmanConfiguration, podmanVersion);
    expect(result).toBe(true);
    expect(execPodman).toHaveBeenNthCalledWith(1, ['machine', 'ssh', 'test -f /etc/containers/enable-rosetta'], vmType);
    expect(execPodman).toHaveBeenNthCalledWith(
      2,
      ['machine', 'ssh', 'sudo touch /etc/containers/enable-rosetta'],
      vmType,
    );
  });
});

describe('provisionAndRestartForRosetta', () => {
  const podmanConfiguration = {
    isRosettaEnabled: vi.fn(),
  } as unknown as PodmanConfiguration;

  const machineName = 'podman-machine-default';
  const vmType = 'applehv';
  const podmanVersion = '5.6.0';
  const tahoeRelease = '25.3.0';

  test('returns false when enableRosettaInMachine returns false (file already exists)', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f succeeds → file exists
    vi.mocked(execPodman).mockResolvedValue({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.provisionAndRestartForRosetta(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(false);
    expect(execPodman).toHaveBeenCalledTimes(1);
  });

  test.each([
    { podmanVersion: '5.6.0', usesNativeRestart: false },
    { podmanVersion: '6.0.9', usesNativeRestart: false },
    { podmanVersion: '6.1.0', usesNativeRestart: true },
  ])('selects the restart command for Podman $podmanVersion', async ({ podmanVersion, usesNativeRestart }) => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f fails → file missing; touch succeeds; native restart or fallback stop/start succeeds
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.provisionAndRestartForRosetta(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(true);

    if (usesNativeRestart) {
      expect(execPodman).toHaveBeenCalledTimes(3);
      expect(execPodman).toHaveBeenNthCalledWith(3, ['machine', 'restart', machineName], vmType, undefined);
      expect(execPodman).not.toHaveBeenCalledWith(['machine', 'stop', machineName], vmType);
      expect(execPodman).not.toHaveBeenCalledWith(['machine', 'start', machineName], vmType, undefined);
    } else {
      expect(execPodman).toHaveBeenCalledTimes(4);
      expect(execPodman).toHaveBeenNthCalledWith(3, ['machine', 'stop', machineName], vmType);
      expect(execPodman).toHaveBeenNthCalledWith(4, ['machine', 'start', machineName], vmType, undefined);
    }
  });

  test('passes options to the start command', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult);

    const options = { logger: { log: vi.fn() } } as unknown as RunOptions;
    await rosettaProvisioner.provisionAndRestartForRosetta(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
      options,
    );
    expect(execPodman).toHaveBeenNthCalledWith(4, ['machine', 'start', machineName], vmType, options);
  });

  test('returns false when conditions are not met (non-AppleHV)', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);

    const result = await rosettaProvisioner.provisionAndRestartForRosetta(
      machineName,
      'libkrun',
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(false);
    expect(execPodman).not.toBeCalled();
  });

  test('catches SSH errors from enableRosettaInMachine and returns false', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f fails, then sudo touch also fails (SSH broken)
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockRejectedValueOnce(new Error('SSH connection refused'));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await rosettaProvisioner.provisionAndRestartForRosetta(
      machineName,
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    // stop/start should not have been attempted
    expect(execPodman).toHaveBeenCalledTimes(2);
  });

  test('omits machine name from stop/start commands when machineName is empty', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult);

    const result = await rosettaProvisioner.provisionAndRestartForRosetta(
      '',
      vmType,
      podmanConfiguration,
      podmanVersion,
    );
    expect(result).toBe(true);
    expect(execPodman).toHaveBeenCalledTimes(4);
    expect(execPodman).toHaveBeenNthCalledWith(1, ['machine', 'ssh', 'test -f /etc/containers/enable-rosetta'], vmType);
    expect(execPodman).toHaveBeenNthCalledWith(
      2,
      ['machine', 'ssh', 'sudo touch /etc/containers/enable-rosetta'],
      vmType,
    );
    expect(execPodman).toHaveBeenNthCalledWith(3, ['machine', 'stop'], vmType);
    expect(execPodman).toHaveBeenNthCalledWith(4, ['machine', 'start'], vmType, undefined);
  });

  test('propagates error when machine start fails after stop', async () => {
    vi.mocked(envAPI).isMac = true;
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(release).mockReturnValue(tahoeRelease);
    vi.mocked(podmanConfiguration.isRosettaEnabled).mockResolvedValue(true);
    // test -f fails, touch succeeds, stop succeeds, start fails
    vi.mocked(execPodman)
      .mockRejectedValueOnce(new Error('exit code 1'))
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: '' } as RunResult)
      .mockRejectedValueOnce(new Error('start failed'));

    await expect(
      rosettaProvisioner.provisionAndRestartForRosetta(machineName, vmType, podmanConfiguration, podmanVersion),
    ).rejects.toThrow('start failed');
  });
});
