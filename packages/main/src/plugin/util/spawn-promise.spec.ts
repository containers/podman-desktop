/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { spawn } from 'node:child_process';
import type { Readable } from 'node:stream';

import { beforeEach, expect, test, vi } from 'vitest';

import { spawnWithPromise } from './spawn-promise.js';

// mock spawn
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('expect correct parsing', async () => {
  const stdoutOutput = 'foo';
  const command = '/bin/foo';
  const commandArgs = ['bar', 'baz'];

  const on: any = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
    if (event === 'data') {
      cb(stdoutOutput);
    }
  }) as unknown as Readable;

  vi.mocked(spawn).mockReturnValue({
    stdout: { on, setEncoding: vi.fn() },
    on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
      if (event === 'exit') {
        cb(0);
      }
    }),
  } as any);
  const result = await spawnWithPromise(command, commandArgs);
  expect(vi.mocked(spawn)).toBeCalledWith(command, commandArgs);
  expect(result).toBeDefined();
  expect(result.stdout).toBe(stdoutOutput);
  expect(result.error).toBeUndefined();
  expect(result.exitCode).toBe(0);
});

test('expect do not fail if error', async () => {
  const stdoutOutput = 'foo';

  const on: any = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
    if (event === 'data') {
      cb(stdoutOutput);
    }
  }) as unknown as Readable;

  vi.mocked(spawn).mockReturnValue({
    stdout: { on, setEncoding: vi.fn() },
    on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
      if (event === 'exit') {
        cb(1);
      }
    }),
  } as any);
  const result = await spawnWithPromise('invalidCommand');
  // should be empty output in case of error
  expect(result).toBeDefined();
  expect(result.stdout).toBe('');
  expect(result.exitCode).toBe(1);
  expect(result.error).toMatch('Unable to execute the command');
});
