/**********************************************************************
 * Copyright (C) 2023 - 2026 Red Hat, Inc.
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

import type { ChildProcess, ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';
import { homedir, platform } from 'node:os';
import { delimiter, join } from 'node:path';
import type { Readable } from 'node:stream';

import * as sudo from '@expo/sudo-prompt';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Proxy } from '/@/plugin/proxy.js';
import { isLinux, isMac, isWindows } from '/@/util.js';

import { Exec, getInstallationPath, macosExtraPath } from './exec.js';

// Widens the protected escapeWindowsAdminArg to public so it can be unit-tested directly.
class TestExec extends Exec {
  public override escapeWindowsAdminArg(value: string): string {
    return super.escapeWindowsAdminArg(value);
  }
}

// Mock sudo-prompt exec to resolve everytime.
vi.mock(import('@expo/sudo-prompt'));
vi.mock(import('/@/util.js'));
vi.mock(import('node:child_process'));

const setEncodingMock = vi.fn();

describe('exec', () => {
  const proxy: Proxy = {
    isEnabled: vi.fn().mockReturnValue(false),
  } as unknown as Proxy;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const exec = new Exec(proxy);

  test('should run the command and resolve with the result', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const { stdout } = await exec.exec(command, args);

    expect(spawnMock).toHaveBeenCalledWith(command, args, { env: expect.any(Object) });
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should run the command with custom cwd and resolve with the result', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];
    const cwd = '/tmp';

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const { stdout } = await exec.exec(command, args, { cwd });

    // caller should contains the cwd provided
    expect(spawnMock).toHaveBeenCalledWith(command, args, expect.objectContaining({ cwd: cwd }));
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should reject with an error when the command execution returns non-zero exit code', async () => {
    const command = 'nonexistent-command';

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('');
      }
    }) as unknown as Readable;
    vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(1);
        }
      }),
    } as unknown as ChildProcess);
    const execResult = exec.exec(command);
    await expect(execResult).rejects.toThrowError(/Command execution failed with exit code 1/);
    await expect(execResult).rejects.toThrowError(Error);
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should reject with an error when the process error event received', async () => {
    const command = 'nonexistent-command';

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('');
      }
    }) as unknown as Readable;
    const error = new Error('Error message');
    vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: Error) => void) => {
        if (event === 'error') {
          cb(error);
        }
      }),
    } as unknown as ChildProcess);
    const execResult = exec.exec(command);
    await expect(execResult).rejects.toThrowError(/Failed to execute command: Error message/);
    await expect(execResult).rejects.toThrowError(Error);
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should reject with an error when the execution is cancelled on macOS and linux', async () => {
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

    const childProcessMock: unknown = {
      killed: false,
      stdout: { on: vi.fn(), setEncoding: setEncodingMock },
      stderr: { on: vi.fn(), setEncoding: setEncodingMock },
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

    const result = exec.exec(command, args, options);
    await expect(result).rejects.toThrowError(/Execution cancelled/);
    await expect(result).rejects.toThrowError(Error);
    expect((childProcessMock as unknown as ChildProcess).kill).toHaveBeenCalled();
    expect(options.logger.error).toHaveBeenCalledWith('Execution cancelled');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should reject with an error when the callback called with error in admin mode on windows', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];
    const error = new Error('Error message');
    vi.mocked(isWindows).mockReturnValue(true);

    (sudo.exec as Mock).mockImplementation((_command, _options, callback) => {
      callback(error);
    });

    const execResult = exec.exec(command, args, { isAdmin: true });

    await expect(execResult).rejects.toThrowError(/Failed to execute command: Error message/);
    await expect(execResult).rejects.toThrowError(Error);
  });

  test('should run the command and set HTTP_PROXY', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const httpProxy = {
      isEnabled: vi.fn().mockReturnValue(true),
      proxy: {
        httpProxy: 'http://127.0.0.1:8888',
      },
    } as unknown as Proxy;
    const httpExec = new Exec(httpProxy);

    const { stdout } = await httpExec.exec(command, args);

    expect(spawnMock).toHaveBeenCalledWith(command, args, {
      env: expect.objectContaining({ HTTP_PROXY: 'http://127.0.0.1:8888' }),
    });
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should run the command and set HTTPS_PROXY', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const httpsProxy = {
      isEnabled: vi.fn().mockReturnValue(true),
      proxy: {
        httpsProxy: 'http://127.0.0.1:8888',
      },
    } as unknown as Proxy;
    const httpsExec = new Exec(httpsProxy);

    const { stdout } = await httpsExec.exec(command, args);

    expect(spawnMock).toHaveBeenCalledWith(command, args, {
      env: expect.objectContaining({ HTTPS_PROXY: 'http://127.0.0.1:8888' }),
    });
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should run the command and set NO_PROXY', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const noProxy = {
      isEnabled: vi.fn().mockReturnValue(true),
      proxy: {
        noProxy: '127.0.0.1',
      },
    } as unknown as Proxy;
    const noProxyExec = new Exec(noProxy);

    const { stdout } = await noProxyExec.exec(command, args);

    expect(spawnMock).toHaveBeenCalledWith(command, args, { env: expect.objectContaining({ NO_PROXY: '127.0.0.1' }) });
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf8');
  });

  test('should run the command with privileges on macOS', async () => {
    const command = 'echo';
    const args = ['Hello, "World"!'];

    vi.mocked(isMac).mockReturnValue(true);

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const { stdout } = await exec.exec(command, args, { isAdmin: true });

    // caller should contains the cwd provided
    expect(spawnMock).toHaveBeenCalledWith(
      'osascript',
      expect.arrayContaining([
        '-e',
        'do shell script "echo Hello,\\\\ \\\\\\"World\\\\\\"!" with prompt "Podman Desktop requires admin privileges " with administrator privileges',
      ]),
      expect.anything(),
    );
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
  });

  test('should run the command with privileges on Linux', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    vi.mocked(isLinux).mockReturnValue(true);

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    const { stdout } = await exec.exec(command, args, { isAdmin: true });

    // caller should contains the cwd provided
    expect(spawnMock).toHaveBeenCalledWith(
      'pkexec',
      expect.arrayContaining(['echo', 'Hello, World!']),
      expect.anything(),
    );
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
  });

  test('should run the command with privileges and set env variables on flatpak Linux', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    vi.mocked(isLinux).mockReturnValue(true);

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    // emulate flatpak environment
    const { stdout } = await exec.exec(command, args, {
      env: { FLATPAK_ID: 'true', var1: 'value1', var2: 'value2' },
      isAdmin: true,
    });

    // caller should contains the cwd provided
    expect(spawnMock).toHaveBeenCalledWith(
      'flatpak-spawn',
      expect.arrayContaining(['--host', '--env=var1=value1', '--env=var2=value2', 'pkexec', 'echo', 'Hello, World!']),
      expect.anything(),
    );
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
  });

  test('should run the command with privileges using exec on Windows', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];
    vi.mocked(isWindows).mockReturnValue(true);

    (sudo.exec as Mock).mockImplementation((_command, _options, callback) => {
      callback(undefined);
    });

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    await exec.exec(command, args, { isAdmin: true });

    // caller should not have called spawn but the sudo.exec api
    expect(spawnMock).not.toHaveBeenCalled();
    // args must be individually escaped (CWE-78 fix) rather than naively joined;
    // 'echo' has no characters that need quoting, so it is left unchanged
    expect(sudo.exec).toBeCalledWith('echo "Hello, World!"', expect.anything(), expect.anything());
  });

  test('should run the command with privileges on Windows and remove unsupported environment', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];
    vi.mocked(isWindows).mockReturnValue(true);
    let options:
      | {
          env?: { [p: string]: string };
        }
      | undefined;

    vi.mocked(sudo.exec).mockImplementation((_command, _options, callback) => {
      callback?.();
      if (typeof _options === 'object' && 'env' in _options) {
        options = _options;
      }
    });

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: vi.fn() },
      stderr: { on, setEncoding: vi.fn() },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    await exec.exec(command, args, { isAdmin: true, env: { 'MY(VAR': 'myvalue' } });

    // caller should not have called spawn but the sudo.exec api
    expect(spawnMock).not.toHaveBeenCalled();
    expect(sudo.exec).toBeCalledWith('echo "Hello, World!"', expect.anything(), expect.anything());
    expect(options).toBeDefined();
    expect(options?.env).toBeDefined();
    expect(options?.env?.['MY(VAR']).not.toBeDefined();
  });

  test.each([
    {
      description: 'should neutralize cmd.exe metacharacters in an admin arg on Windows (CWE-78)',
      // simulates an attacker-controlled USERPROFILE-derived path containing a command separator;
      // the injected "& calc.exe &" segment must stay inside the quoted argument, not be split out
      // as a sibling command by cmd.exe's parser; 'del' itself has no characters that need quoting
      command: 'del',
      args: ['C:\\Users\\victim & calc.exe &\\AppData\\Local\\Microsoft\\WindowsApps\\kind.exe'],
      expectedSudoCommand: 'del "C:\\Users\\victim & calc.exe &\\AppData\\Local\\Microsoft\\WindowsApps\\kind.exe"',
    },
    {
      description: 'should double percent signs in an admin arg on Windows to prevent batch variable expansion',
      command: 'del',
      args: ['C:\\Users\\%COMPUTERNAME%\\kind.exe'],
      expectedSudoCommand: 'del "C:\\Users\\%%COMPUTERNAME%%\\kind.exe"',
    },
    {
      description: 'should pass through a pre-quoted admin arg on Windows (API backward compatibility)',
      // extensions historically pre-quoted paths containing spaces before exec({ isAdmin });
      // the already-quoted token is handed through unchanged, not rejected or double-quoted
      command: 'copy',
      args: ['test', '"C:\\Program Files\\Podman\\kind.exe"'],
      expectedSudoCommand: 'copy test "C:\\Program Files\\Podman\\kind.exe"',
    },
    {
      description: 'should quote an admin command containing spaces on Windows',
      // the legacy uninstaller passes a raw exe path (e.g. under "Program Files") as the command;
      // the command token itself is quoted, not just the args
      command: 'C:\\Program Files\\Podman\\podman-setup.exe',
      args: ['/uninstall', '/quiet'],
      expectedSudoCommand: '"C:\\Program Files\\Podman\\podman-setup.exe" /uninstall /quiet',
    },
    {
      description: 'should pass through a pre-quoted admin command on Windows (API backward compatibility)',
      // the already-quoted command is handed through unchanged, not double-quoted
      command: '"C:\\Program Files\\Podman\\podman-setup.exe"',
      args: [] as string[],
      expectedSudoCommand: '"C:\\Program Files\\Podman\\podman-setup.exe"',
    },
  ])('$description', async ({ command, args, expectedSudoCommand }) => {
    vi.mocked(isWindows).mockReturnValue(true);

    vi.mocked(sudo.exec).mockImplementation((_command, _options, callback) => {
      callback?.(undefined);
    });

    await exec.exec(command, args, { isAdmin: true });

    expect(sudo.exec).toBeCalledWith(expectedSudoCommand, expect.anything(), expect.anything());
  });

  test('should reject an admin arg containing a double quote on Windows with a RunError-shaped rejection', async () => {
    const command = 'del';
    const args = ['C:\\Users\\victim"\\kind.exe'];
    vi.mocked(isWindows).mockReturnValue(true);

    const execResult = exec.exec(command, args, { isAdmin: true });

    await expect(execResult).rejects.toThrowError(/double quotes are not allowed/);
    // the rejection must carry the same RunError shape as every other failure
    // path in this file, not a bare Error from escapeWindowsAdminArg
    await expect(execResult).rejects.toMatchObject({
      exitCode: 1,
      stdout: '',
      stderr: '',
      cancelled: false,
      killed: false,
    });
    expect(sudo.exec).not.toHaveBeenCalled();
  });

  test('should reject an admin arg containing a line break on Windows', async () => {
    const command = 'del';
    const args = ['C:\\Users\\victim\nkind.exe'];
    vi.mocked(isWindows).mockReturnValue(true);

    await expect(exec.exec(command, args, { isAdmin: true })).rejects.toThrowError(/line breaks are not allowed/);
    expect(sudo.exec).not.toHaveBeenCalled();
  });

  function mockDetachedProcess(event: string, eventArg: unknown): { spawnMock: Mock; unrefMock: Mock } {
    const unrefMock = vi.fn();
    const onMock = vi.fn().mockImplementation((evt: string, cb: (arg0: unknown) => void) => {
      if (evt === event) {
        cb(eventArg);
      }
    });
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      unref: unrefMock,
      on: onMock,
      killed: false,
    } as unknown as ChildProcess);
    return { spawnMock, unrefMock };
  }

  test.each([
    { description: 'without custom cwd', cwd: undefined },
    { description: 'with custom cwd', cwd: '/opt/app' },
  ])('should spawn a detached process and resolve $description', async ({ cwd }) => {
    const command = 'my-daemon';
    const args = ['--background'];
    const { spawnMock, unrefMock } = mockDetachedProcess('close', 0);

    const result = await exec.exec(command, args, { detached: true, cwd });

    const expectedOpts: Record<string, unknown> = { detached: true, stdio: 'ignore' };
    if (cwd) expectedOpts['cwd'] = cwd;
    expect(spawnMock).toHaveBeenCalledWith(command, args, expect.objectContaining(expectedOpts));
    expect(unrefMock).toHaveBeenCalled();
    expect(result).toEqual({ command, stdout: '', stderr: '' });
  });

  test('should wrap with cmd.exe on Windows to avoid console window flash', async () => {
    vi.mocked(isWindows).mockReturnValue(true);

    const command = 'my-daemon';
    const args = ['--background'];
    const { spawnMock, unrefMock } = mockDetachedProcess('close', 0);

    const result = await exec.exec(command, args, { detached: true });

    expect(spawnMock).toHaveBeenCalledWith(
      'cmd.exe',
      ['/d', '/c', command, ...args],
      expect.objectContaining({ stdio: 'ignore', windowsHide: true }),
    );
    expect(spawnMock).not.toHaveBeenCalledWith(command, args, expect.anything());
    expect(unrefMock).toHaveBeenCalled();
    expect(result).toEqual({ command, stdout: '', stderr: '' });
  });

  test.each([
    {
      description: 'non-zero exit code',
      event: 'close',
      eventArg: 42,
      expectedError: /Command execution failed with exit code 42/,
    },
    {
      description: 'error event',
      event: 'error',
      eventArg: new Error('spawn ENOENT'),
      expectedError: /Failed to execute command: spawn ENOENT/,
    },
  ])('should reject when detached process emits $description', async ({ event, eventArg, expectedError }) => {
    mockDetachedProcess(event, eventArg);

    const execResult = exec.exec('failing-command', [], { detached: true });

    await expect(execResult).rejects.toThrowError(expectedError);
    await expect(execResult).rejects.toThrowError(Error);
  });

  test('should run the command and set specific encoding', async () => {
    const command = 'echo';
    const args = ['Hello, World!'];

    vi.mocked(isLinux).mockReturnValue(true);

    const on = vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
      if (event === 'data') {
        cb('Hello, World!');
      }
    }) as unknown as Readable;
    const spawnMock = vi.mocked(spawn).mockReturnValue({
      stdout: { on, setEncoding: setEncodingMock },
      stderr: { on, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(0);
        }
      }),
    } as unknown as ChildProcess);

    // emulate flatpak environment
    const { stdout } = await exec.exec(command, args, {
      env: { FLATPAK_ID: 'true' },
      isAdmin: true,
      encoding: 'utf16le',
    });

    // caller should contains the cwd provided
    expect(spawnMock).toHaveBeenCalledWith(
      'flatpak-spawn',
      expect.arrayContaining(['--host', 'pkexec', 'echo', 'Hello, World!']),
      expect.anything(),
    );
    expect(stdout).toBeDefined();
    expect(stdout).toContain('Hello, World!');
    expect(setEncodingMock).toBeCalledWith('utf16le');
  });

  test('should include stderr in error message on non-zero exit code', async () => {
    const command = 'failing-cmd';

    const stdoutOn = vi
      .fn()
      .mockImplementation((_event: string, _cb: (arg0: string) => void) => {}) as unknown as Readable;
    const stderrOn = vi.fn().mockImplementation((event: string, cb: (arg0: string) => void) => {
      if (event === 'data') {
        cb('permission denied');
      }
    }) as unknown as Readable;
    vi.mocked(spawn).mockReturnValue({
      stdout: { on: stdoutOn, setEncoding: setEncodingMock },
      stderr: { on: stderrOn, setEncoding: setEncodingMock },
      on: vi.fn().mockImplementation((event: string, cb: (arg0: number) => void) => {
        if (event === 'close') {
          cb(1);
        }
      }),
    } as unknown as ChildProcess);

    await expect(exec.exec(command)).rejects.toThrowError(
      'Command execution failed with exit code 1: permission denied',
    );
  });
});

describe('escapeWindowsAdminArg', () => {
  let testExec: TestExec;

  beforeEach(() => {
    testExec = new TestExec({ isEnabled: vi.fn().mockReturnValue(false) } as unknown as Proxy);
  });

  test.each([
    { description: 'a Windows built-in command', input: 'del', expected: 'del' },
    { description: 'a Windows built-in command', input: 'copy', expected: 'copy' },
    {
      description: 'a benign value containing spaces, wrapped in double quotes',
      input: 'C:\\Program Files\\Podman\\kind.exe',
      expected: '"C:\\Program Files\\Podman\\kind.exe"',
    },
    {
      description: 'cmd.exe metacharacters, kept literal inside the quotes',
      input: 'a & b | c',
      expected: '"a & b | c"',
    },
    {
      description: 'a percent sign, doubled to avoid batch variable expansion',
      input: 'C:\\Users\\%COMPUTERNAME%',
      expected: '"C:\\Users\\%%COMPUTERNAME%%"',
    },
    {
      description: 'a plus sign (copy concatenation metacharacter)',
      input: 'C:\\tmp\\a+b.exe',
      expected: '"C:\\tmp\\a+b.exe"',
    },
    {
      description: 'an equals sign (cmd token separator)',
      input: 'C:\\tmp\\a=b.exe',
      expected: '"C:\\tmp\\a=b.exe"',
    },
    {
      description: 'an already-quoted token with no inner quotes (backward compatibility)',
      input: '"C:\\Program Files\\Podman\\kind.exe"',
      expected: '"C:\\Program Files\\Podman\\kind.exe"',
    },
    {
      description: 'an already-quoted token, still doubling % inside it',
      input: '"C:\\Users\\%COMPUTERNAME%"',
      expected: '"C:\\Users\\%%COMPUTERNAME%%"',
    },
    {
      // `C:\dir with space\` must not become `"C:\dir with space\"` (that escapes the quote
      // for CommandLineToArgvW); the trailing backslash is doubled instead.
      description: 'a single trailing backslash, doubled so the closing quote stays literal',
      input: 'C:\\dir with space\\',
      expected: '"C:\\dir with space\\\\"',
    },
    {
      description: 'a run of trailing backslashes, all doubled',
      input: 'C:\\dir with space\\\\',
      expected: '"C:\\dir with space\\\\\\\\"',
    },
  ])('should handle $description', ({ input, expected }) => {
    expect(testExec.escapeWindowsAdminArg(input)).toBe(expected);
  });

  test.each([
    {
      description: 'embedded double quotes',
      input: 'C:\\Users\\"victim"',
      expectedError: /double quotes are not allowed/,
    },
    {
      description: 'embedded line breaks',
      input: 'C:\\Users\\victim\r\nkind.exe',
      expectedError: /line breaks are not allowed/,
    },
  ])('should throw on $description', ({ input, expectedError }) => {
    expect(() => testExec.escapeWindowsAdminArg(input)).toThrowError(expectedError);
  });
});

describe('getInstallationPath', () => {
  let originalPath: string | undefined;

  beforeEach(() => {
    originalPath = process.env['PATH'];
  });

  afterEach(() => {
    process.env['PATH'] = originalPath;
  });

  describe('windows', {
    // as the getInstallationPath is using `node:path` and it is platform specific
    // we cannot assert on non-windows platforms properly
    skip: platform() !== 'win32',
  }, () => {
    beforeEach(() => {
      vi.mocked(isWindows).mockReturnValue(true);
      vi.mocked(isMac).mockReturnValue(false);
    });

    test('should return the installation paths for Windows', () => {
      process.env['PATH'] = '';

      const path = getInstallationPath();

      const parts = path.split(delimiter);
      expect(parts).toContain(join(homedir(), 'AppData', 'Local', 'Programs', 'Podman'));
      expect(parts).toContain('c:\\Program Files\\RedHat\\Podman');
    });

    test('should return the installation paths for Windows with pre-filled PATH', () => {
      process.env['PATH'] = 'c:\\Local';

      const path = getInstallationPath();

      const parts = path.split(delimiter);
      expect(parts).toContain(join(homedir(), 'AppData', 'Local', 'Programs', 'Podman'));
      expect(parts).toContain('c:\\Program Files\\RedHat\\Podman');
      expect(parts).toContain('c:\\Local');
    });

    test('should return the installation paths for Windows with defined param', () => {
      process.env['PATH'] = 'c:\\Local';

      const path = getInstallationPath('c:\\Directory');

      const parts = path.split(delimiter);
      expect(parts).toContain(join(homedir(), 'AppData', 'Local', 'Programs', 'Podman'));
      expect(parts).toContain('c:\\Program Files\\RedHat\\Podman');
      expect(parts).toContain('c:\\Directory');
    });
  });

  test('should return the installation path for macOS', () => {
    vi.mocked(isWindows).mockReturnValue(false);
    vi.mocked(isMac).mockReturnValue(true);

    process.env['PATH'] = '/usr/bin';

    const path = getInstallationPath();

    expect(path).toBe(`${macosExtraPath}:/usr/bin`);
  });

  test('should return the installation path for macOS with defined param', () => {
    vi.mocked(isWindows).mockReturnValue(false);
    vi.mocked(isMac).mockReturnValue(true);

    process.env['PATH'] = '/usr/bin';

    const path = getInstallationPath('/usr/other');

    expect(path).toBe(`${macosExtraPath}:/usr/other`);
  });

  test('should return the installation path for other platforms', () => {
    vi.mocked(isWindows).mockReturnValue(false);
    vi.mocked(isMac).mockReturnValue(false);
    process.env['PATH'] = '/usr/bin'; // Example PATH for other platforms

    const path = getInstallationPath();

    expect(path).toBe('/usr/bin');
  });

  test('should return the installation path for other platforms with defined param', () => {
    vi.mocked(isWindows).mockReturnValue(false);
    vi.mocked(isMac).mockReturnValue(false);
    process.env['PATH'] = '/usr/bin'; // Example PATH for other platforms

    const path = getInstallationPath('/usr/other');

    expect(path).toBe('/usr/other');
  });
});
