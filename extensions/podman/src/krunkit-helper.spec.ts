/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { KrunkitHelper } from './krunkit-helper';

let krunkitHelper: KrunkitHelper;

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  krunkitHelper = new KrunkitHelper();
  vi.resetAllMocks();
});

test('should grab correct version', async () => {
  const output = `krunkit 0.1.2
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: output,
  } as extensionApi.RunResult);

  // use a specific arch for the test
  const version = await krunkitHelper.getKrunkitVersion();

  expect(version).toBe('0.1.2');

  // expect called with qemu-system-aarch64 (as it's arm64)
  expect(extensionApi.process.exec).toHaveBeenCalledWith('krunkit', ['--version'], undefined);
});

test('should grab correct version using a given path', async () => {
  const output = `krunkit 0.1.2
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: output,
  } as extensionApi.RunResult);

  const fakePath = '/my-dummy-path';

  const version = await krunkitHelper.getKrunkitVersion(fakePath);

  expect(version).toBe('0.1.2');

  expect(extensionApi.process.exec).toHaveBeenCalledWith('krunkit', ['--version'], {
    env: {
      PATH: fakePath,
    },
  });
});
