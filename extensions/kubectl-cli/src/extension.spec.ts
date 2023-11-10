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

import { test, expect, vi } from 'vitest';
import * as extensionApi from '@podman-desktop/api';
import * as KubectlExtension from './extension';
import { afterEach } from 'node:test';

vi.mock('@podman-desktop/api', () => {
  return {
    cli: {
      createCliTool: vi.fn(),
    },
    process: {
      exec: vi.fn(),
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

const log = console.log;

const jsonStdout = {
  clientVersion: {
    major: '1',
    minor: '28',
    gitVersion: 'v1.28.3',
    gitCommit: 'a8a1abc25cad87333840cd7d54be2efaf31a3177',
    gitTreeState: 'clean',
    buildDate: '2023-10-18T11:33:16Z',
    goVersion: 'go1.20.10',
    compiler: 'gc',
    platform: 'darwin/arm64',
  },
  kustomizeVersion: 'v5.0.4-0.20230601165947-6ce0bf390ce3',
};

test('kubectl CLI tool registered when detected and extension is activated', async () => {
  vi.mocked(extensionApi.process.exec)
    .mockResolvedValueOnce({
      stderr: '',
      stdout: JSON.stringify(jsonStdout),
      command: 'kubectl version --client=true -o=json',
    })
    .mockResolvedValueOnce({
      stderr: '',
      stdout: '/path1/to/kubectl\n/path2/to/kubectl',
      command: 'kubectl version --client=true -o=json',
    });

  const deferred = new Promise<void>(resolve => {
    vi.mocked(extensionApi.cli.createCliTool).mockImplementation(() => {
      resolve();
      return {} as extensionApi.CliTool;
    });
  });

  KubectlExtension.activate();

  return deferred.then(() => {
    expect(extensionApi.cli.createCliTool).toBeCalled();
    expect(extensionApi.cli.createCliTool).toBeCalledWith(
      expect.objectContaining({
        name: 'kubectl',
        version: '1.28.3',
        path: '/path1/to/kubectl',
      }),
    );
  });
});

test('kubectl CLI tool not registered when not detected', async () => {
  vi.mocked(extensionApi.process.exec).mockRejectedValue(new Error('Error running version command'));
  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'log').mockImplementation(() => {
      resolve();
    });
  });

  KubectlExtension.activate();

  return deferred.then(() => {
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith(expect.stringContaining('Cannot detect kubectl CLI tool:'));
  });
});

test('kubectl CLI tool not registered when version json stdout cannot be parsed', async () => {
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: `{${JSON.stringify(jsonStdout)}`,
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'log').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  KubectlExtension.activate();

  return deferred.then(() => {
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith(
      expect.stringContaining('Cannot detect kubectl CLI tool: SyntaxError: Unexpected token {'),
    );
  });
});

test('kubectl CLI tool not registered when version cannot be extracted from object', async () => {
  const wrongJsonStdout = {
    clientVersion: {
      ...jsonStdout.clientVersion,
    },
  };
  delete (wrongJsonStdout.clientVersion as any).gitVersion;
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stderr: '',
    stdout: JSON.stringify(wrongJsonStdout),
    command: 'kubectl version --client=true -o=json',
  });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'log').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  KubectlExtension.activate();

  return deferred.then(() => {
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith(
      expect.stringContaining('Cannot detect kubectl CLI tool: Error: Cannot extract version from stdout'),
    );
  });
});

test('kubectl CLI tool not registered when path cannot be found', async () => {
  vi.mocked(extensionApi.process.exec)
    .mockResolvedValueOnce({
      stderr: '',
      stdout: JSON.stringify(jsonStdout),
      command: 'kubectl version --client=true -o=json',
    })
    .mockResolvedValueOnce({
      stderr: '',
      stdout: '',
      command: 'detect location command',
    });

  const deferred = new Promise<void>(resolve => {
    vi.spyOn(console, 'log').mockImplementation((message: string) => {
      log(message);
      resolve();
    });
  });

  KubectlExtension.activate();

  return deferred.then(() => {
    expect(console.log).toBeCalled();
    expect(console.log).toBeCalledWith(
      expect.stringContaining('Cannot detect kubectl CLI tool: Error: Cannot extract path form stdout'),
    );
  });
});
