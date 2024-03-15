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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import * as shellPath from 'shell-path';
import { afterEach, beforeEach, describe, expect, test, vi, vitest } from 'vitest';

import { Detect } from './detect';
import type { OS } from './os';

const osMock: OS = {
  isWindows: vi.fn(),
  isLinux: vi.fn(),
  isMac: vi.fn(),
};

let detect: Detect;

vi.mock('shell-path', () => {
  return {
    shellPath: vi.fn(),
  };
});

vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

const originalConsoleDebug = console.debug;

beforeEach(() => {
  console.debug = vi.fn();
  detect = new Detect(osMock, '/storage-path');
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  console.debug = originalConsoleDebug;
});

describe('Check for kubectl', async () => {
  test('not installed', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(
      () =>
        new Promise<extensionApi.RunResult>((resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ exitCode: -1 } as extensionApi.RunError);
        }),
    );
    const result = await detect.checkForKubectl();
    expect(result).toBeFalsy();
  });

  test('installed', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(
      () =>
        new Promise<extensionApi.RunResult>(resolve => {
          resolve({} as extensionApi.RunResult);
        }),
    );
    const result = await detect.checkForKubectl();
    expect(result).toBeTruthy();
  });
});

describe('Check for path', async () => {
  test('not included', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(
      () =>
        new Promise<extensionApi.RunResult>((resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ exitCode: -1 } as extensionApi.RunError);
        }),
    );
    vitest.spyOn(shellPath, 'shellPath').mockResolvedValue('/different-path');
    const result = await detect.checkStoragePath();
    expect(result).toBeFalsy();
  });

  test('included', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockImplementation(
      () =>
        new Promise<extensionApi.RunResult>((resolve, reject) => {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ exitCode: -1 } as extensionApi.RunError);
        }),
    );
    vitest.spyOn(shellPath, 'shellPath').mockResolvedValue(path.resolve('/', 'storage-path', 'bin'));
    const result = await detect.checkStoragePath();
    expect(result).toBeTruthy();
  });
});

// Write a test for getStoragePath
describe('Check storage path', async () => {
  test('not found', async () => {
    const result = await detect.getStoragePath();
    expect(result).toBe('');
  });

  test('found', async () => {
    vi.mock('node:fs');
    const existSyncSpy = vi.spyOn(fs, 'existsSync');
    existSyncSpy.mockImplementation(() => true);

    const result = await detect.getStoragePath();
    expect(result).toBe(path.resolve('/', 'storage-path', 'bin', 'kubectl'));
  });
});
