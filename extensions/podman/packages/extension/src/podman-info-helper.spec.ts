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
import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { PodmanInfoHelper } from './podman-info-helper';

let podmanInfoHelper: PodmanInfoHelper;

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  podmanInfoHelper = new PodmanInfoHelper();
  vi.resetAllMocks();
});

test('should grab podman from the installer', async () => {
  const records: Record<string, unknown> = {};

  const jsonObject = {
    host: {
      arch: 'arm64',
      buildahVersion: '1.31.2',
      conmon: {
        package: 'conmon-2.1.7-2.fc38.aarch64',
        path: '/usr/bin/conmon',
        version: 'conmon version 2.1.7, commit: ',
      },
      cpus: 2,
      cpuUtilization: {
        userPercent: 0.28,
        systemPercent: 0.66,
        idlePercent: 99.06,
      },
      databaseBackend: 'boltdb',
      distribution: {
        distribution: 'fedora',
        variant: 'coreos',
        version: '38',
      },
      eventLogger: 'journald',
      freeLocks: 2048,
      hostname: 'localhost.localdomain',
      kernel: '6.4.15-200.fc38.aarch64',
      logDriver: 'journald',
      memFree: 3384516608,
      memTotal: 3796164608,
      networkBackend: 'netavark',
      networkBackendInfo: {
        backend: 'netavark',
        version: 'netavark 1.7.0',
        package: 'netavark-1.7.0-1.fc38.aarch64',
        path: '/usr/libexec/podman/netavark',
        dns: {
          version: 'aardvark-dns 1.7.0',
          package: 'aardvark-dns-1.7.0-1.fc38.aarch64',
          path: '/usr/libexec/podman/aardvark-dns',
        },
      },
      ociRuntime: {
        name: 'crun',
        package: 'crun-1.9-1.fc38.aarch64',
        path: '/usr/bin/crun',
        version:
          'crun version 1.9\ncommit: a538ac4ea1ff319bcfe2bf81cb5c6f687e2dc9d3\nrundir: /run/crun\nspec: 1.0.0\n+SYSTEMD +SELINUX +APPARMOR +CAP +SECCOMP +EBPF +CRIU +LIBKRUN +WASM:wasmedge +YAJL',
      },
      os: 'linux',
    },
    version: {
      APIVersion: '4.6.2',
      Version: '4.6.2',
      GoVersion: 'go1.20.7',
      GitCommit: '',
      BuiltTime: 'Tue Sep 12 22:07:26 2023',
      Built: 1694549246,
      OsArch: 'linux/arm64',
      Os: 'linux',
    },
  };

  (extensionApi.process.exec as Mock).mockResolvedValue({
    stdout: JSON.stringify(jsonObject),
  } as extensionApi.RunResult);

  await podmanInfoHelper.updateWithPodmanInfoRecords(records);

  expect(records.podmanMachineArch).toBe('arm64');
  expect(records.podmanMachineBuildahVersion).toBe('1.31.2');
  expect(records.podmanMachineConmonVersion).toContain('conmon version 2.1.7');
  expect(records.podmanMachineCpus).toBe(2);
  expect(records.podmanMachineDatabaseBackend).toBe('boltdb');
  expect(records.podmanMachineDistribution).toStrictEqual({
    distribution: 'fedora',
    variant: 'coreos',
    version: '38',
  });
  expect(records.podmanMachineKernel).toBe('6.4.15-200.fc38.aarch64');
  expect(records.podmanMachineMemFree).toBe(3384516608);
  expect(records.podmanMachineMemTotal).toBe(3796164608);
  expect(records.podmanMachineNetworkBackend).toBe('netavark');
  expect(records.podmanMachineNetworkBackendVersion).toBe('netavark 1.7.0');
  expect(records.podmanMachineNetworkOciRuntime).toBeDefined();
  expect((records.podmanMachineNetworkOciRuntime as any).name).toBe('crun');

  expect(records.podmanMachineVersion).toBe('4.6.2');
  expect(records.podmanMachineVersionBuiltTime).toBe('Tue Sep 12 22:07:26 2023');
  expect(records.podmanMachineVersionGo).toBe('go1.20.7');
  expect(records.podmanMachineOsArch).toBe('linux/arm64');

  // expect called with podman info command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('podman', ['info', '--format', 'json']);
});

test('error grab podman from the installer', async () => {
  (extensionApi.process.exec as Mock).mockImplementation(() => {
    throw new Error('error');
  });

  const records: Record<string, unknown> = {};

  await podmanInfoHelper.updateWithPodmanInfoRecords(records);

  expect(records.errorPodmanMachineInfo).toBeTruthy();
  expect(records.errorPodmanMachineInfoMessage).toBeDefined();

  // expect called with podman info command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('podman', ['info', '--format', 'json']);
});
