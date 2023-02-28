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

import type { Mock } from 'vitest';
import * as shellPath from 'shell-path';

import { afterEach, beforeEach, describe, expect, test, vi, vitest } from 'vitest';
import { Detect } from './detect';
import type { CliRun } from './cli-run';

const cliRunMock: CliRun = {
  extensionContext: {
    storagePath: '/storage-path',
  },
  runCommand: vi.fn(),
  getPath: vi.fn(),
} as unknown as CliRun;

let composeDetect: Detect;

vi.mock('shell-path', () => {
  return {
    shellPath: vi.fn(),
  };
});

beforeEach(() => {
  composeDetect = new Detect(cliRunMock, '/storage-path');
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

describe('Check for Docker Compose', async () => {
  test('not installed', async () => {
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: -1 });
    const result = await composeDetect.checkForDockerCompose();
    expect(result).toBeFalsy();
  });

  test('installed', async () => {
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: 0 });
    const result = await composeDetect.checkForDockerCompose();
    expect(result).toBeTruthy();
  });
});

describe('Check for Python Docker Compose', async () => {
  test('not installed', async () => {
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: -1 });
    const result = await composeDetect.checkForPythonPodmanCompose();
    expect(result).toBeFalsy();
  });

  test('installed', async () => {
    const stdOut = `['podman', '--version', '']
    using podman version: 4.4.1
    podman-composer version  1.0.3
    podman --version
    podman version 4.4.1
    exit code: 0`;
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: 0, stdOut });
    const result = await composeDetect.checkForPythonPodmanCompose();
    expect(result).toBeTruthy();
  });

  test('alias to docker-compose', async () => {
    const stdOut = 'Docker Compose version v2.11.1';
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: 0, stdOut });
    const result = await composeDetect.checkForPythonPodmanCompose();
    expect(result).toBeFalsy();
  });
});

describe('Check for path', async () => {
  test('not included', async () => {
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: -1 });
    vitest.spyOn(shellPath, 'shellPath').mockResolvedValue('/different-path');
    const result = await composeDetect.checkStoragePath();
    expect(result).toBeFalsy();
  });

  test('included', async () => {
    (cliRunMock.runCommand as Mock).mockResolvedValue({ exitCode: -1 });
    vitest.spyOn(shellPath, 'shellPath').mockResolvedValue('/storage-path/bin');
    const result = await composeDetect.checkStoragePath();
    expect(result).toBeTruthy();
  });
});
