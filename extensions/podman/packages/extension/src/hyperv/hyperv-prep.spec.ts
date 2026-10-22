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

import type { RunError } from '@podman-desktop/api';
import { Container } from 'inversify';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { HyperVPrep, type HyperVPrepStatus } from '/@/hyperv/hyperv-prep';
import { PodmanBinary } from '/@/utils/podman-binary';
import { execPodman } from '/@/utils/util';

vi.mock(import('/@/utils/util'));
vi.mock(import('/@/utils/podman-binary'));

const podmanBinaryMock = new PodmanBinary();

class TestHyperVPrep extends HyperVPrep {
  parseStatusOutput(stdout: string): HyperVPrepStatus {
    return super.parseStatus(stdout);
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
});

async function createHyperVPrep(): Promise<HyperVPrep> {
  const container = new Container();
  container.bind(PodmanBinary).toConstantValue(podmanBinaryMock);
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
