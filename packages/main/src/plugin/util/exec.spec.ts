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

import { expect, describe, test, vi, beforeEach, afterEach } from 'vitest';
import { getInstallationPath, macosExtraPath, exec } from './exec.js';
import * as util from '../../util.js';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import { spawn } from 'child_process';
import type { Readable } from 'node:stream';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('exec', () => {
  test('should run the command and resolve with the result', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    vi.mock('child_process', () => {
      return {
        spawn: vi.fn(),
      };
    });

    const on: any = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'exit') {
          cb(0);
        }
      }),
    } as any);

    const { stdout } = await exec(command, args);

    expect(spawnMock).toHaveBeenCalledWith(command, args, { env: expect.any(Object) });
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
  });

  test('should reject with an error when the command execution fails', async () => {
    const command = 'nonexistent-command';

    vi.mock('child_process', () => {
      return {
        spawn: vi.fn(),
      };
    });

    const on: any = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('');
      }
    }) as unknown as Readable;
    vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'exit') {
          cb(1);
        }
      }),
    } as any);

    await expect(exec(command)).rejects.toThrowError(/Command execution failed with exit code 1/);
  });

  test('should reject with an error when the execution is cancelled', async () => {
    const command = 'sleep';
    const args = ['1'];
    const cancellationToken = {
      isCancellationRequested: true,
      onCancellationRequested: vi.fn(),
    };
    const options = {
      token: cancellationToken,
      logger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
    };

    vi.mock('child_process', () => {
      return {
        spawn: vi.fn(),
      };
    });

    const childProcessMock: unknown = {
      killed: false,
      stdout: { on: vi.fn(), setEncoding: vi.fn() },
      stderr: { on: vi.fn(), setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'exit') {
          cb(0);
        }
      }),
      kill: vi.fn(),
    };
    vi.mocked(spawn).mockReturnValue(childProcessMock as ChildProcessWithoutNullStreams);

    vi.mocked(cancellationToken.onCancellationRequested).mockImplementationOnce((handler: () => void) => {
      handler();
    });

    await expect(exec(command, args, options)).rejects.toThrowError(/Execution cancelled/);

    expect((childProcessMock as any).kill).toHaveBeenCalled();
    expect(options.logger.error).toHaveBeenCalledWith('Execution cancelled');
  });
});

vi.mock('./util', () => {
  return {
    isWindows: vi.fn(),
    isMac: vi.fn(),
  };
});

describe('getInstallationPath', () => {
  let originalPath: string | undefined;

  beforeEach(() => {
    originalPath = process.env.PATH;
  });

  afterEach(() => {
    process.env.PATH = originalPath;
  });

  test('should return the installation path for Windows', () => {
    vi.spyOn(util, 'isWindows').mockImplementation(() => true);
    vi.spyOn(util, 'isMac').mockImplementation(() => false);
    process.env.PATH = '';

    const path = getInstallationPath();

    expect(path).toBe('c:\\Program Files\\RedHat\\Podman;');
  });

  test('should return the installation path for macOS', () => {
    vi.spyOn(util, 'isWindows').mockImplementation(() => false);
    vi.spyOn(util, 'isMac').mockImplementation(() => true);

    process.env.PATH = '/usr/bin';

    const path = getInstallationPath();

    expect(path).toBe(`/usr/bin:${macosExtraPath}`);
  });

  test('should return the installation path for other platforms', () => {
    vi.spyOn(util, 'isWindows').mockImplementation(() => false);
    vi.spyOn(util, 'isMac').mockImplementation(() => false);
    process.env.PATH = '/usr/bin'; // Example PATH for other platforms

    const path = getInstallationPath();

    expect(path).toBe('/usr/bin');
  });
});
