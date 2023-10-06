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

import { expect, test, vi } from 'vitest';
import type { RunResult } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { getDockerCli } from './docker-cli';

vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

test('no client if no Docker installed', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('No Docker client'));
  });
  const cli = await getDockerCli();
  expect(cli).toBeUndefined();
});

test('no client if no Docker version returned', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve({ stdout: '' } as RunResult);
  });
  const cli = await getDockerCli();
  expect(cli).toBeUndefined();
});

test('client if Docker version returned', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve({ stdout: 'Docker version 24.0.6, build ed223bc' } as RunResult);
  });
  const cli = await getDockerCli();
  expect(cli).toBeDefined();
});

test('client does not support context', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve({ stdout: 'Docker version 24.0.6, build ed223bc' } as RunResult);
  });
  const cli = await getDockerCli();
  expect(cli).toBeDefined();
  expect(cli.isContextSupported()).toBeTruthy();
});

test('create context if no context', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation((command: string, args?: string[]) => {
    if (args?.length === 1 && args[0] === '-v') {
      return Promise.resolve({ stdout: 'Docker version 24.0.6, build ed223bc' } as RunResult);
    } else if (args?.length > 1 && args[0] === 'context' && args[1] === 'list') {
      return Promise.resolve({ stdout: '[]' } as RunResult);
    } else if (args?.length > 1 && args[0] === 'context' && args[1] === 'create') {
      return Promise.resolve({ stdout: '' } as RunResult);
    }
    return Promise.reject(new Error('Unknown command'));
  });
  const cli = await getDockerCli();
  expect(cli).toBeDefined();
  expect(cli.isContextSupported()).toBeTruthy();
  await cli.registerMachine('mymachine', '/var/run/podman.sock', false);
  expect(spyExecPromise).toHaveBeenNthCalledWith(1, 'docker', ['-v']);
  expect(spyExecPromise).toHaveBeenNthCalledWith(2, 'docker', ['context', 'list', '--format', 'json']);
  expect(spyExecPromise).toHaveBeenNthCalledWith(3, 'docker', [
    'context',
    'create',
    'mymachine',
    '--docker',
    expect.anything(),
    '--description',
    'Podman machine mymachine',
  ]);
});

test('update context if context', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation((command: string, args?: string[]) => {
    if (args?.length === 1 && args[0] === '-v') {
      return Promise.resolve({ stdout: 'Docker version 24.0.6, build ed223bc' } as RunResult);
    } else if (args?.length > 1 && args[0] === 'context' && args[1] === 'list') {
      return Promise.resolve({ stdout: '[{"Name": "mymachine"}]' } as RunResult);
    } else if (args?.length > 1 && args[0] === 'context' && args[1] === 'update') {
      return Promise.resolve({ stdout: '' } as RunResult);
    }
    return Promise.reject(new Error('Unknown command'));
  });
  const cli = await getDockerCli();
  expect(cli).toBeDefined();
  expect(cli.isContextSupported()).toBeTruthy();
  await cli.registerMachine('mymachine', '/var/run/podman.sock', false);
  expect(spyExecPromise).toHaveBeenNthCalledWith(1, 'docker', ['-v']);
  expect(spyExecPromise).toHaveBeenNthCalledWith(2, 'docker', ['context', 'list', '--format', 'json']);
  expect(spyExecPromise).toHaveBeenNthCalledWith(3, 'docker', [
    'context',
    'update',
    'mymachine',
    '--docker',
    expect.anything(),
    '--description',
    'Podman machine mymachine',
  ]);
});
