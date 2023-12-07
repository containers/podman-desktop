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

import { beforeEach, expect, test, vi } from 'vitest';
import { PodmanCleanupMacOS } from './podman-cleanup-macos';
import { process } from '@podman-desktop/api';
import psList from 'ps-list';

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
  // mock getProcessesToKill
  const getProcessesToKillMock = vi.spyOn(podmanCleanupMacOS, 'getProcessesToKill');
  getProcessesToKillMock.mockResolvedValue([123, 456]);

  // mock killProcess
  const killProcessMock = vi.spyOn(podmanCleanupMacOS, 'killProcess');
  killProcessMock.mockResolvedValue(undefined);

  await podmanCleanupMacOS.stopPodmanProcesses({ logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } });

  expect(killProcessMock).toBeCalledWith(123);
  expect(killProcessMock).toBeCalledWith(456);
});

test('check stopPodmanProcesses with error', async () => {
  // mock getProcessesToKill
  const getProcessesToKillMock = vi.spyOn(podmanCleanupMacOS, 'getProcessesToKill');
  getProcessesToKillMock.mockResolvedValue([123]);

  // mock killProcess
  const killProcessMock = vi.spyOn(podmanCleanupMacOS, 'killProcess');
  const killError = new Error('fake error');
  killProcessMock.mockRejectedValue(killError);

  const logger = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
  await podmanCleanupMacOS.stopPodmanProcesses({ logger });

  expect(killProcessMock).toBeCalledWith(123);
  expect(logger.error).toBeCalledWith('Error killing process', killError);
});

test('check killProcess', async () => {
  await podmanCleanupMacOS.killProcess(123456);

  expect(vi.mocked(process.exec)).toBeCalledWith('/bin/kill', ['-9', '123456']);
});

test('check folders to delete', async () => {
  const folders = podmanCleanupMacOS.getFoldersToDelete();

  expect(folders).lengthOf(2);
});

test('check getProcessesToKill', async () => {
  vi.mocked(psList).mockResolvedValue([{ pid: 123, name: 'gvproxy', cmd: 'podman gvproxy', ppid: 123 }]);

  const processesToKill = await podmanCleanupMacOS.getProcessesToKill(['gvproxy']);

  expect(processesToKill).toStrictEqual([123]);
});

test('check getContainersConfPath', async () => {
  const containersPath = podmanCleanupMacOS.getContainersConfPath();

  expect(containersPath).includes('containers.conf');
});
