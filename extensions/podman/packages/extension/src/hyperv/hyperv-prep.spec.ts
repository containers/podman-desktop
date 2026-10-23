/**********************************************************************
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
 ***********************************************************************/

import type { RunError, TelemetryLogger } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { Container } from 'inversify';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { HYPERV_PREP_COMMAND, HYPERV_PREP_RELOGIN_MESSAGE } from '/@/constants';
import { HyperVPrep, type HyperVPrepStatus } from '/@/hyperv/hyperv-prep';
import { TelemetryLoggerSymbol } from '/@/inject/symbols';
import { PodmanBinary } from '/@/utils/podman-binary';
import { execPodman } from '/@/utils/util';

vi.mock(import('@podman-desktop/api'));
vi.mock(import('/@/utils/util'));
vi.mock(import('/@/utils/podman-binary'));

const podmanBinaryMock = new PodmanBinary();

const telemetryLoggerMock: TelemetryLogger = {
  onDidChangeEnableStates: vi.fn(() => ({ dispose: vi.fn() })),
  isUsageEnabled: true,
  isErrorsEnabled: true,
  logError: vi.fn(),
  logUsage: vi.fn(),
  dispose: vi.fn(),
};

class TestHyperVPrep extends HyperVPrep {
  parseStatusOutput(stdout: string): HyperVPrepStatus {
    return super.parseStatus(stdout);
  }

  runPrep(): Promise<void> {
    return super.run();
  }
}

const APPLIED_STATUS_OUTPUT = `Hyper-V vsock registry entries:
  No vsock registry entries found.
Hyper-V Administrators group membership:
  Current user is a member`;

const NEEDED_STATUS_OUTPUT = `Hyper-V vsock registry entries:
  No vsock registry entries found.
Hyper-V Administrators group membership:
  Current user is NOT a member`;

function createRunError(message: string, overrides: Partial<RunError> = {}): RunError {
  return Object.assign(new Error(message), {
    exitCode: 1,
    command: 'podman system hyperv-prep',
    stdout: '',
    stderr: '',
    cancelled: false,
    killed: false,
    ...overrides,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(PodmanBinary.prototype.getBinaryInfo).mockResolvedValue({ version: '6.0.0' });
  vi.mocked(execPodman).mockResolvedValue({
    stdout: APPLIED_STATUS_OUTPUT,
    stderr: '',
    command: 'podman system hyperv-prep --status',
  });
  vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Yes');
  vi.mocked(extensionApi.window.withProgress).mockImplementation((_options, task) => {
    const cancellationToken: extensionApi.CancellationToken = {
      isCancellationRequested: false,
      onCancellationRequested: () => ({ dispose: vi.fn() }),
    };
    return task({ report: vi.fn() }, cancellationToken);
  });
  vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });
});

async function createHyperVPrep(): Promise<HyperVPrep> {
  const container = new Container();
  container.bind(PodmanBinary).toConstantValue(podmanBinaryMock);
  container.bind(TelemetryLoggerSymbol).toConstantValue(telemetryLoggerMock);
  container.bind(HyperVPrep).toSelf();

  return container.getAsync(HyperVPrep);
}

describe('HyperVPrep.parseStatus', () => {
  test.each([
    {
      name: 'returns applied when the current user is a group member',
      stdout: APPLIED_STATUS_OUTPUT,
      expectedStatus: 'applied',
    },
    {
      name: 'returns notApplied when the current user is not a group member',
      stdout: NEEDED_STATUS_OUTPUT,
      expectedStatus: 'notApplied',
    },
    {
      name: 'returns notApplied when registry entries exist but the user is not a group member',
      stdout: `Hyper-V vsock registry entries:
  GuestCommunicationServices VSock registry entries: 2
Hyper-V Administrators group membership:
  Current user is NOT a member`,
      expectedStatus: 'notApplied',
    },
    { name: 'returns notApplied when the membership section is missing', stdout: '', expectedStatus: 'notApplied' },
  ])('$name', ({ stdout, expectedStatus }) => {
    const hyperVPrep = new TestHyperVPrep();
    expect(hyperVPrep.parseStatusOutput(stdout)).toBe(expectedStatus);
  });
});

describe('HyperVPrep.isSupported', () => {
  test.each([
    { name: 'returns false for Podman 5', version: '5.4.0', expected: false },
    { name: 'returns false for a Podman 6 release candidate', version: '6.0.0-rc1', expected: false },
    { name: 'returns true for Podman 6', version: '6.0.0', expected: true },
    { name: 'returns true for Podman 6.1', version: '6.1.0', expected: true },
  ])('$name', async ({ version, expected }) => {
    vi.mocked(PodmanBinary.prototype.getBinaryInfo).mockResolvedValue({ version });

    const hyperVPrep = await createHyperVPrep();

    expect(await hyperVPrep.isSupported()).toBe(expected);
  });

  test.each(['not-a-version', '', '6'])('returns false for invalid Podman version %j', async version => {
    vi.mocked(PodmanBinary.prototype.getBinaryInfo).mockResolvedValue({ version });
    const hyperVPrep = await createHyperVPrep();

    await expect(hyperVPrep.isSupported()).resolves.toBe(false);
  });
});

describe('HyperVPrep.getStatus', () => {
  test('parses the output of podman system hyperv-prep --status', async () => {
    const hyperVPrep = await createHyperVPrep();
    vi.mocked(execPodman).mockResolvedValueOnce({
      stdout: NEEDED_STATUS_OUTPUT,
      stderr: '',
      command: 'podman system hyperv-prep --status',
    });

    await expect(hyperVPrep.getStatus()).resolves.toBe('notApplied');
    expect(execPodman).toHaveBeenCalledWith(['system', 'hyperv-prep', '--status']);
  });

  test.each([{ message: 'access denied' }, { message: 'status unavailable' }])(
    'throws when podman reports "$message"',
    async ({ message }) => {
      const hyperVPrep = await createHyperVPrep();
      const error = createRunError(`Failed to execute command: ${message}`, {
        command: 'podman system hyperv-prep --status',
        stderr: message,
      });
      vi.mocked(execPodman).mockRejectedValueOnce(error);

      await expect(hyperVPrep.getStatus()).rejects.toBe(error);
    },
  );
});

describe('HyperVPrep.run', () => {
  test('executes podman system hyperv-prep with admin privileges', async () => {
    const hyperVPrep = new TestHyperVPrep();
    vi.mocked(execPodman).mockResolvedValueOnce({
      stdout: '',
      stderr: '',
      command: 'podman system hyperv-prep',
    });

    await hyperVPrep.runPrep();

    expect(execPodman).toHaveBeenCalledWith(['system', 'hyperv-prep'], undefined, { isAdmin: true });
  });
});

async function setupHyperVPrepCommand(): Promise<(...args: never[]) => unknown> {
  await createHyperVPrep();

  const registration = vi
    .mocked(extensionApi.commands.registerCommand)
    .mock.calls.find(([command]) => command === HYPERV_PREP_COMMAND);
  assert(registration, 'Hyper-V preparation command should be registered');
  assert(typeof registration[1] === 'function', 'Hyper-V preparation handler should be a function');

  return registration[1];
}

describe('HyperVPrep command lifecycle', () => {
  test('registers the command and disposes it on deactivation', async () => {
    const disposable = { dispose: vi.fn() };
    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue(disposable);
    const hyperVPrep = await createHyperVPrep();

    expect(extensionApi.commands.registerCommand).toHaveBeenCalledWith(HYPERV_PREP_COMMAND, expect.any(Function));
    expect(extensionApi.commands.registerCommand).toHaveBeenCalledTimes(1);

    hyperVPrep.dispose();

    expect(disposable.dispose).toHaveBeenCalledOnce();
  });
});

describe('HyperVPrep command handler', () => {
  test('shows why preparation is unavailable when Podman 6 is not available', async () => {
    vi.mocked(PodmanBinary.prototype.getBinaryInfo).mockResolvedValue({ version: '5.4.0' });
    const callback = await setupHyperVPrepCommand();

    await callback();

    expect(execPodman).not.toHaveBeenCalled();
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      'Hyper-V preparation requires Podman 6.0.0 or later.',
    );
  });

  test('runs prep when needed and confirmed', async () => {
    const callback = await setupHyperVPrepCommand();
    vi.mocked(execPodman)
      .mockResolvedValueOnce({ stdout: NEEDED_STATUS_OUTPUT, stderr: '', command: 'status' })
      .mockResolvedValueOnce({ stdout: '', stderr: '', command: 'run' });

    await callback();

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      'Prepare Hyper-V now? Administrator approval (UAC) is required.',
      'Yes',
      'No',
    );
    expect(extensionApi.window.withProgress).toHaveBeenCalled();
    expect(execPodman).toHaveBeenCalledWith(['system', 'hyperv-prep'], undefined, { isAdmin: true });
    expect(telemetryLoggerMock.logUsage).toHaveBeenCalledWith('podman.hypervPrep');
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('Hyper-V preparation completed successfully.'),
    );
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining(HYPERV_PREP_RELOGIN_MESSAGE),
    );
  });

  test('skips prep when user declines confirmation', async () => {
    const callback = await setupHyperVPrepCommand();
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('No');
    vi.mocked(execPodman).mockResolvedValueOnce({ stdout: NEEDED_STATUS_OUTPUT, stderr: '', command: 'status' });

    await callback();

    expect(execPodman).toHaveBeenCalledWith(['system', 'hyperv-prep', '--status']);
    expect(execPodman).not.toHaveBeenCalledWith(['system', 'hyperv-prep'], undefined, { isAdmin: true });
  });

  test('shows status when prep is already applied', async () => {
    const callback = await setupHyperVPrepCommand();
    vi.mocked(execPodman).mockResolvedValueOnce({ stdout: APPLIED_STATUS_OUTPUT, stderr: '', command: 'status' });

    await callback();

    expect(execPodman).toHaveBeenCalledWith(['system', 'hyperv-prep', '--status']);
    expect(execPodman).not.toHaveBeenCalledWith(['system', 'hyperv-prep'], undefined, { isAdmin: true });
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      expect.stringContaining('Hyper-V preparation is already applied.'),
    );
  });

  test.each([
    {
      name: 'stderr',
      error: createRunError('Failed to execute command: Access is denied.', { stderr: 'Access is denied.' }),
      message: 'Access is denied.',
    },
    {
      name: 'message when stderr is empty',
      error: createRunError('Failed to execute command: Execution cancelled', { cancelled: true }),
      message: 'Failed to execute command: Execution cancelled',
    },
  ])('shows the $name from a RunError', async ({ message, error }) => {
    const callback = await setupHyperVPrepCommand();
    vi.mocked(execPodman)
      .mockResolvedValueOnce({ stdout: NEEDED_STATUS_OUTPUT, stderr: '', command: 'status' })
      .mockRejectedValueOnce(error);

    await callback();

    expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith(`Hyper-V preparation failed: ${message}`);
    expect(telemetryLoggerMock.logError).toHaveBeenCalledWith('hypervPrepFailed', { error });
  });

  test('prefers RunError stderr to its generic message', async () => {
    const callback = await setupHyperVPrepCommand();
    const error = createRunError('Failed to execute command: Administrator approval failed', {
      stderr: 'Administrator approval was denied',
    });
    vi.mocked(execPodman)
      .mockResolvedValueOnce({ stdout: NEEDED_STATUS_OUTPUT, stderr: '', command: 'status' })
      .mockRejectedValueOnce(error);

    await callback();

    expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith(
      'Hyper-V preparation failed: Administrator approval was denied',
    );
    expect(telemetryLoggerMock.logError).toHaveBeenCalledWith('hypervPrepFailed', { error });
  });

  test('shows a user-facing error when the initial status check fails', async () => {
    const callback = await setupHyperVPrepCommand();
    const error = createRunError('Failed to execute command: Access denied', {
      command: 'podman system hyperv-prep --status',
      stderr: 'Access denied',
    });
    vi.mocked(execPodman).mockRejectedValueOnce(error);

    await callback();

    expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith(
      'Hyper-V preparation status check failed: Access denied',
    );
    expect(telemetryLoggerMock.logError).toHaveBeenCalledWith('hypervPrepStatusCheckFailed', { error });
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  });
});
