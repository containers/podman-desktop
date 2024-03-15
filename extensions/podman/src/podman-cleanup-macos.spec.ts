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

import { process } from '@podman-desktop/api';
import psList from 'ps-list';
import { beforeEach, expect, test, vi } from 'vitest';

import { PodmanCleanupMacOS } from './podman-cleanup-macos';

let podmanCleanupMacOS: PodmanCleanupMacOS;

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

// mock ps-list
vi.mock('ps-list', async () => {
  return {
    default: vi.fn(),
  };
});

beforeEach(() => {
  podmanCleanupMacOS = new PodmanCleanupMacOS();
  vi.resetAllMocks();
});

test('check stopPodmanProcesses', async () => {
  // mock getProcessesToStop
  const getProcessesToStopMock = vi.spyOn(podmanCleanupMacOS, 'getProcessesToStop');
  getProcessesToStopMock.mockResolvedValue([123, 456]);

  // mock terminateProcess
  const terminateProcessMock = vi.spyOn(podmanCleanupMacOS, 'terminateProcess');
  terminateProcessMock.mockResolvedValue(undefined);

  await podmanCleanupMacOS.stopPodmanProcesses({ logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } });

  expect(terminateProcessMock).toBeCalledWith(123);
  expect(terminateProcessMock).toBeCalledWith(456);
});

test('check stopPodmanProcesses with error', async () => {
  // mock getProcessesToStop
  const getProcessesToStopMock = vi.spyOn(podmanCleanupMacOS, 'getProcessesToStop');
  getProcessesToStopMock.mockResolvedValue([123]);

  // mock killProcess
  const terminateProcessMock = vi.spyOn(podmanCleanupMacOS, 'terminateProcess');
  const terminateError = new Error('fake error');
  terminateProcessMock.mockRejectedValue(terminateError);

  const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
  await podmanCleanupMacOS.stopPodmanProcesses({ logger });

  expect(terminateProcessMock).toBeCalledWith(123);
  expect(logger.error).toBeCalledWith('Error terminating process', terminateError);
});

test('check terminateProcess', async () => {
  await podmanCleanupMacOS.terminateProcess(123456);

  expect(vi.mocked(process.exec)).toBeCalledWith('/bin/kill', ['-SIGTERM', '123456']);
});

test('check folders to delete', async () => {
  const folders = podmanCleanupMacOS.getFoldersToDelete();

  expect(folders).lengthOf(2);
});

test('check getProcessesToStop', async () => {
  vi.mocked(psList).mockResolvedValue([{ pid: 123, name: 'gvproxy', cmd: 'podman gvproxy', ppid: 123 }]);

  const processesToTerminate = await podmanCleanupMacOS.getProcessesToStop(['gvproxy']);

  expect(processesToTerminate).toStrictEqual([123]);
});

test('check getContainersConfPath', async () => {
  const containersPath = podmanCleanupMacOS.getContainersConfPath();

  expect(containersPath).includes('containers.conf');
});
