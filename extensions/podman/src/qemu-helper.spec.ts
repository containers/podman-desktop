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

import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { QemuHelper } from './qemu-helper';

let qemuHelper: TestQemuHelper;

class TestQemuHelper extends QemuHelper {
  public getArch(): NodeJS.Architecture {
    return super.getArch();
  }
}

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  qemuHelper = new TestQemuHelper();
  vi.resetAllMocks();
});

test('should grab correct versions using arm64', async () => {
  const wslOutput = `QEMU emulator version 8.1.1
Copyright (c) 2003-2023 Fabrice Bellard and the QEMU Project developers
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  // use a specific arch for the test
  vi.spyOn(qemuHelper, 'getArch').mockReturnValue('arm64');

  const qemuVersion = await qemuHelper.getQemuVersion();

  expect(qemuVersion).toBe('8.1.1');

  // expect called with qemu-system-aarch64 (as it's arm64)
  expect(extensionApi.process.exec).toHaveBeenCalledWith('qemu-system-aarch64', ['--version'], undefined);
});

test('should grab correct versions using x64', async () => {
  const wslOutput = `QEMU emulator version 8.1.1
Copyright (c) 2003-2023 Fabrice Bellard and the QEMU Project developers
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  // use a specific arch for the test
  vi.spyOn(qemuHelper, 'getArch').mockReturnValue('x64');

  const qemuVersion = await qemuHelper.getQemuVersion();

  expect(qemuVersion).toBe('8.1.1');

  // expect called with qemu-system-aarch64 (as it's arm64)
  expect(extensionApi.process.exec).toHaveBeenCalledWith('qemu-system-x86_64', ['--version'], undefined);
});

test('should grab correct using a given path', async () => {
  const wslOutput = `QEMU emulator version 8.1.1
Copyright (c) 2003-2023 Fabrice Bellard and the QEMU Project developers
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  // use a specific arch for the test
  vi.spyOn(qemuHelper, 'getArch').mockReturnValue('x64');

  const fakePath = '/my-dummy-path';

  const qemuVersion = await qemuHelper.getQemuVersion(fakePath);

  expect(qemuVersion).toBe('8.1.1');

  // expect called with qemu-system-aarch64 (as it's arm64) and having the right PATH object
  expect(extensionApi.process.exec).toHaveBeenCalledWith('qemu-system-x86_64', ['--version'], {
    env: {
      PATH: fakePath,
    },
  });
});

test('check arch', async () => {
  const arch = qemuHelper.getArch();

  expect(arch).toBe(process.arch);
});
