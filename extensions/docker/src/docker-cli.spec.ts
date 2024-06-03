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
import { expect, test, vi } from 'vitest';

import { getDockerInstallation } from './docker-cli';

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    env: {},
    process: {
      exec: vi.fn(),
    },
  };
});

test('should not return podman version', async () => {
  const podmanOutput = 'podman version 4.8.3';

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: podmanOutput,
  } as extensionApi.RunResult);

  const installedDocker = await getDockerInstallation();

  expect(installedDocker).toBeUndefined();
});

test('should return docker version', async () => {
  const dockerOutput = 'Docker version 25.0.2, build 29cf629';

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: dockerOutput,
  } as extensionApi.RunResult);

  const installedDocker = await getDockerInstallation();

  expect(installedDocker).toBeDefined();
  expect(installedDocker?.version).toBe('25.0.2');
});
