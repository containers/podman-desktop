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

import { existsSync, promises } from 'node:fs';
import * as path from 'node:path';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { AbsPodmanCleanup } from './podman-cleanup-abstract';

const containersConfPath = '/fake/containers.conf';
class TestAbsPodmanCleanup extends AbsPodmanCleanup {
  getFoldersToDelete(): string[] {
    throw new Error('Method not implemented.');
  }
  getContainersConfPath(): string {
    return containersConfPath;
  }

  async stopPodmanProcesses(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
let absPodmanCleanup: TestAbsPodmanCleanup;

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

// mock exists sync
vi.mock('node:fs', async () => {
  return {
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
      rm: vi.fn(),
    },
  };
});

beforeEach(() => {
  absPodmanCleanup = new TestAbsPodmanCleanup();
  vi.resetAllMocks();
});

describe.each([{ os: 'macos' }, { os: 'windows' }])('check ssh keys removal ', ({ os }) => {
  test(`check ssh keys removal on ${os}`, async () => {
    // mock readFile
    const readFileMock = vi.spyOn(promises, 'readFile');

    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleases REST API
    const containersConfContent = fsActual.readFileSync(
      path.resolve(__dirname, `../tests/resources/containers-${os}.conf`),
      'utf8',
    );

    readFileMock.mockResolvedValue(containersConfContent);

    // mock existsSync
    vi.mocked(existsSync).mockReturnValue(true);

    // mock rm
    const rmMock = vi.spyOn(promises, 'rm');
    rmMock.mockResolvedValue(undefined);

    await absPodmanCleanup.removeSshKeys({ logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } });

    // expect call
    expect(existsSync).toBeCalledWith(containersConfPath);
    if (os === 'macos') {
      expect(rmMock).toHaveBeenNthCalledWith(1, '/Users/foobar/.ssh/podman-machine-default');
      expect(rmMock).toHaveBeenNthCalledWith(2, '/Users/foobar/.ssh/podman-machine-default.pub');
    } else if (os === 'windows') {
      expect(rmMock).toHaveBeenNthCalledWith(1, 'c:\\\\Users\\\\foobar\\\\.ssh\\\\podman-machine-default');
      expect(rmMock).toHaveBeenNthCalledWith(2, 'c:\\\\Users\\\\foobar\\\\.ssh\\\\podman-machine-default.pub');
    }

    expect(readFileMock).toBeCalledWith(containersConfPath, 'utf8');
  });
});

test('check getActions', async () => {
  // mock methods
  const removePodmanFoldersMock = vi.spyOn(absPodmanCleanup, 'removePodmanFolders');
  removePodmanFoldersMock.mockResolvedValue(undefined);

  const removeSshKeysMock = vi.spyOn(absPodmanCleanup, 'removeSshKeys');
  removeSshKeysMock.mockResolvedValue(undefined);

  const stopPodmanProcessesMock = vi.spyOn(absPodmanCleanup, 'stopPodmanProcesses');
  stopPodmanProcessesMock.mockResolvedValue(undefined);

  const actions = await absPodmanCleanup.getActions();

  expect(actions).toHaveLength(3);

  // execute all 3 actions
  for (const action of actions) {
    await action.execute.apply(absPodmanCleanup, [{ logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } }]);
  }

  // expect calls
  expect(removePodmanFoldersMock).toBeCalled();
  expect(removeSshKeysMock).toBeCalled();
  expect(stopPodmanProcessesMock).toBeCalled();
});

test('check removePodmanFolders', async () => {
  // mock removePodmanFolders

  // mock methods
  const getFoldersToDeleteMock = vi.spyOn(absPodmanCleanup, 'getFoldersToDelete');
  getFoldersToDeleteMock.mockReturnValue(['/fake/folder1', '/fake/folder2']);

  // mock rm
  const rmMock = vi.spyOn(promises, 'rm');
  rmMock.mockResolvedValue(undefined);

  // mock existsSync
  vi.mocked(existsSync).mockReturnValue(true);

  await absPodmanCleanup.removePodmanFolders();

  // expect calls
  expect(rmMock).toBeCalledWith('/fake/folder1', { recursive: true });
  expect(rmMock).toBeCalledWith('/fake/folder2', { recursive: true });
});
