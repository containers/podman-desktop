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

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import * as shellPath from 'shell-path';
import type { Mock, MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Detect } from './detect';
import { OS } from './os';

const osMock: OS = {
  isWindows: vi.fn(),
  isLinux: vi.fn(),
  isMac: vi.fn(),
};

let detect: Detect;

vi.mock(import('shell-path'));
vi.mock(import('node:fs'));
vi.mock(import('node:http'));

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

describe('Check for Docker Compose', async () => {
  test('not installed', async () => {
    const customError = { exitCode: -1 } as extensionApi.RunError;
    vi.mocked(extensionApi.process.exec).mockImplementation(() => {
      throw customError;
    });
    const result = await detect.checkForDockerCompose();
    expect(result).toBeFalsy();
  });

  test('installed', async () => {
    vi.mocked(extensionApi.process.exec).mockResolvedValue({} as extensionApi.RunResult);
    const result = await detect.checkForDockerCompose();
    expect(result).toBeTruthy();
  });
});

describe('Check for System Wide Podman Compose', async () => {
  test('not installed', async () => {
    const customError = { exitCode: -1 } as extensionApi.RunError;
    vi.mocked(extensionApi.process.exec).mockRejectedValue(customError);
    const result = await detect.checkSystemWidePodmanCompose();
    expect(result).toBeFalsy();
  });

  test('installed', async () => {
    vi.mocked(extensionApi.process.exec).mockResolvedValue({} as extensionApi.RunResult);
    const result = await detect.checkSystemWidePodmanCompose();
    expect(result).toBeTruthy();
  });
});

describe('Check for path', async () => {
  const customError = { exitCode: -1 } as extensionApi.RunError;
  test('not included', async () => {
    vi.mocked(extensionApi.process.exec).mockImplementation(() => {
      throw customError;
    });
    vi.mocked(shellPath.shellPath).mockResolvedValue('/different-path');
    const result = await detect.checkStoragePath();
    expect(result).toBeFalsy();
  });

  test('included', async () => {
    vi.mocked(extensionApi.process.exec).mockImplementation(() => {
      throw customError;
    });
    vi.mocked(shellPath.shellPath).mockResolvedValue(path.resolve('/', 'storage-path', 'bin'));
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
    const existSyncSpy = vi.mocked(fs.existsSync);
    existSyncSpy.mockReturnValue(true);

    const result = await detect.getStoragePath();
    expect(result).toBe(path.resolve('/', 'storage-path', 'bin', 'docker-compose'));
  });
});

describe('Check getDockerComposePath uses proper tooling by platform', () => {
  beforeEach(() => {
    vi.mocked(extensionApi.process.exec).mockResolvedValue({
      exitCode: 0,
      stdout: 'hello-world',
    } as extensionApi.RunError);
  });

  test('linux should use which', async () => {
    (extensionApi.env.isLinux as boolean) = true;
    (extensionApi.env.isWindows as boolean) = false;
    (extensionApi.env.isMac as boolean) = false;

    await detect.getDockerComposePath('docker-compose');
    expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['docker-compose']);
  });

  test('mac should use which', async () => {
    (extensionApi.env.isMac as boolean) = true;
    (extensionApi.env.isWindows as boolean) = false;
    (extensionApi.env.isLinux as boolean) = false;

    await detect.getDockerComposePath('docker-compose');
    expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['docker-compose']);
  });

  test('windows should use which', async () => {
    (extensionApi.env.isWindows as boolean) = true;
    (extensionApi.env.isMac as boolean) = false;
    (extensionApi.env.isLinux as boolean) = false;

    await detect.getDockerComposePath('docker-compose');
    expect(extensionApi.process.exec).toHaveBeenCalledWith('where.exe', ['docker-compose']);
  });
});

describe('parseVersion', () => {
  test('missing content', async () => {
    expect(() => {
      detect['parseVersion']('{}');
    }).toThrowError('malformed version output');
  });

  test('invalid version type', async () => {
    expect(() => {
      detect['parseVersion'](
        JSON.stringify({
          version: true,
        }),
      );
    }).toThrowError('malformed version output');
  });

  test('valid version', async () => {
    expect(
      detect['parseVersion'](
        JSON.stringify({
          version: 'potatoes',
        }),
      ),
    ).toBe('potatoes');
  });
});

describe('Check default socket path', async () => {
  test('linux', async () => {
    (osMock.isLinux as Mock).mockReturnValue(true);
    (osMock.isMac as Mock).mockReturnValue(false);
    (osMock.isWindows as Mock).mockReturnValue(false);
    const result = detect.getSocketPath();
    expect(result).toBe('/var/run/docker.sock');
  });

  test('macOS', async () => {
    (osMock.isLinux as Mock).mockReturnValue(false);
    (osMock.isMac as Mock).mockReturnValue(true);
    (osMock.isWindows as Mock).mockReturnValue(false);
    const result = detect.getSocketPath();
    expect(result).toBe('/var/run/docker.sock');
  });

  test('windows', async () => {
    (osMock.isLinux as Mock).mockReturnValue(false);
    (osMock.isMac as Mock).mockReturnValue(false);
    (osMock.isWindows as Mock).mockReturnValue(true);
    const result = detect.getSocketPath();
    expect(result).toBe('//./pipe/docker_engine');
  });
});

type HttpGet = (
  options: http.RequestOptions | string | URL,
  callback?: (res: http.IncomingMessage) => void,
) => http.ClientRequest;

describe('Check docker socket', async () => {
  test('is alive', async () => {
    const socketPathMock = vi.spyOn(detect, 'getSocketPath');
    socketPathMock.mockResolvedValue('/foo/docker.sock');

    const spyGet: MockInstance<HttpGet> = vi.mocked(http.get);
    const clientRequestEmitter = new EventEmitter();
    const myRequest = clientRequestEmitter as http.ClientRequest;

    spyGet.mockImplementation((_url, callback?: (res: http.IncomingMessage) => void) => {
      const emitter = new EventEmitter();
      callback?.(emitter as http.IncomingMessage);

      // mock fake data
      emitter.emit('data', 'foo');

      // mock a successful response
      (emitter as http.IncomingMessage).statusCode = 200;
      emitter.emit('end', {});
      return myRequest;
    });

    const result = await detect.checkDefaultSocketIsAlive();
    expect(result).toBeTruthy();
  });

  test('test ping invalid status', async () => {
    const socketPathMock = vi.spyOn(detect, 'getSocketPath');
    socketPathMock.mockResolvedValue('/foo/docker.sock');

    const spyGet: MockInstance<HttpGet> = vi.mocked(http.get);
    const clientRequestEmitter = new EventEmitter();
    const myRequest = clientRequestEmitter as http.ClientRequest;

    spyGet.mockImplementation((_url, callback?: (res: http.IncomingMessage) => void) => {
      const emitter = new EventEmitter();
      callback?.(emitter as http.IncomingMessage);

      // mock an invalid response
      (emitter as http.IncomingMessage).statusCode = 500;
      emitter.emit('end', {});
      return myRequest;
    });

    const result = await detect.checkDefaultSocketIsAlive();
    expect(result).toBeFalsy();
  });

  test('test error', async () => {
    const socketPathMock = vi.spyOn(detect, 'getSocketPath');
    socketPathMock.mockResolvedValue('/foo/docker.sock');

    const spyGet: MockInstance<HttpGet> = vi.mocked(http.get);
    const clientRequestEmitter = new EventEmitter();
    const myRequest = clientRequestEmitter as http.ClientRequest;
    const spyOnce = vi.spyOn(clientRequestEmitter, 'once');

    spyGet.mockImplementation((_url, callback?: (res: http.IncomingMessage) => void) => {
      const emitter = new EventEmitter();
      callback?.(emitter as http.IncomingMessage);

      // send an error
      setTimeout(() => {
        clientRequestEmitter.emit('error', new Error('test error'));
      }, 500);

      return myRequest;
    });

    const result = await detect.checkDefaultSocketIsAlive();
    expect(result).toBeFalsy();
    expect(spyOnce).toBeCalledWith('error', expect.any(Function));
    expect(console.debug).toBeCalledWith('Error while pinging docker', expect.any(Error));
  });
});

describe('getDockerComposeBinaryInfo', () => {
  test('expects to return binary info as updatable after user chancels password request dialog', async () => {
    const os = new OS();
    const executable = os.isWindows() ? 'docker-compose' + '.exe' : 'docker-compose';
    vi.mocked(extensionApi.process.exec).mockResolvedValue({
      command: '',
      stdout: '{"version":"v2.38.0"}',
      stderr: '',
    });
    vi.spyOn(detect, 'getStoragePath').mockResolvedValue(`extension/storage/${executable}`);
    vi.spyOn(detect, 'getDockerComposePath').mockResolvedValue(`extension/storage/${executable}`);
    const binaryInfo = await detect.getDockerComposeBinaryInfo(executable);
    expect(binaryInfo.updatable).equals(true);
  });
});
