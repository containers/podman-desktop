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

import * as fs from 'node:fs';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installBinaryToSystem, localBinDir } from './cli-run';

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      showInformationMessage: vi.fn().mockReturnValue(Promise.resolve('Yes')),
      showErrorMessage: vi.fn(),
      withProgress: vi.fn(),
      showNotification: vi.fn(),
      showWarningMessage: vi.fn(),
    },
    process: {
      exec: vi.fn(),
    },
    ProgressLocation: {
      APP_ICON: 1,
    },
  };
});

// mock exists sync
vi.mock('node:fs', async () => {
  return {
    existsSync: vi.fn(),
  };
});

let previousPath: string | undefined;

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  previousPath = process.env.PATH;
  process.env.PATH = localBinDir;
});

afterEach(() => {
  process.env.PATH = previousPath;
});

test('error: expect installBinaryToSystem to fail with a non existing binary', async () => {
  // Mock the platform to be linux
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((_, reject) => {
        const error: extensionApi.RunError = {
          name: '',
          message: 'Command failed',
          exitCode: 1603,
          command: 'command',
          stdout: 'stdout',
          stderr: 'stderr',
          cancelled: false,
          killed: false,
        };

        reject(error);
      }),
  );

  // Expect await installBinaryToSystem to throw an error
  await expect(installBinaryToSystem('test', 'tmpBinary')).rejects.toThrowError();
});

test('success: installBinaryToSystem on mac with /usr/local/bin already created', async () => {
  // Mock the platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  // Mock existsSync to be true since within the function it's doing: !fs.existsSync(localBinDir)
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  // Run installBinaryToSystem which will trigger the spyOn mock
  await installBinaryToSystem('test', 'tmpBinary');

  // check called with admin being true
  expect(extensionApi.process.exec).toBeCalledWith(
    'exec',
    expect.arrayContaining(['cp', '-f', 'test', `${path.sep}usr${path.sep}local${path.sep}bin${path.sep}tmpBinary`]),
    expect.objectContaining({ isAdmin: true }),
  );
});

test('success: installBinaryToSystem on linux with /usr/local/bin NOT created yet (expect mkdir -p command)', async () => {
  // Mock the platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Mock existsSync to be false since within the function it's doing: !fs.existsSync(localBinDir)
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  // Run installBinaryToSystem which will trigger the spyOn mock
  await installBinaryToSystem('test', 'tmpBinary');

  // check called with admin being true
  expect(extensionApi.process.exec).toBeCalledWith(
    '/bin/sh',
    expect.arrayContaining([
      '-c',
      `mkdir -p /usr/local/bin && cp test ${path.sep}usr${path.sep}local${path.sep}bin${path.sep}tmpBinary`,
    ]),
    expect.objectContaining({ isAdmin: true }),
  );
});

test('success: installBinaryToSystem to show warning if binary path not in PATH', async () => {
  // Mock the platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  process.env.PATH = '';

  // Mock existsSync to be false since within the function it's doing: !fs.existsSync(localBinDir)
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  // Run installBinaryToSystem which will trigger the spyOn mock
  await installBinaryToSystem('test', 'tmpBinary');

  // check called with admin being true
  expect(extensionApi.process.exec).toBeCalledWith(
    '/bin/sh',
    expect.arrayContaining([
      '-c',
      `mkdir -p /usr/local/bin && cp test ${path.sep}usr${path.sep}local${path.sep}bin${path.sep}tmpBinary`,
    ]),
    expect.objectContaining({ isAdmin: true }),
  );
  expect(extensionApi.window.showWarningMessage).toBeCalled();
});
