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

import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import * as extension from './extension';
import * as podmanCli from './podman-cli';
import { getPodmanCli } from './podman-cli';
import type { Configuration } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

const config: Configuration = {
  get: () => {
    // not implemented
  },
  has: () => true,
  update: () => Promise.resolve(),
};

const provider: extensionApi.Provider = {
  setContainerProviderConnectionFactory: vi.fn(),
  setKubernetesProviderConnectionFactory: vi.fn(),
  registerContainerProviderConnection: vi.fn(),
  registerKubernetesProviderConnection: vi.fn(),
  registerLifecycle: vi.fn(),
  registerInstallation: vi.fn(),
  registerUpdate: vi.fn(),
  registerAutostart: vi.fn(),
  dispose: vi.fn(),
  name: '',
  id: '',
  status: 'started',
  updateStatus: vi.fn(),
  onDidUpdateStatus: undefined,
  version: '',
  updateVersion: vi.fn(),
  onDidUpdateVersion: undefined,
  images: undefined,
  links: [],
  detectionChecks: [],
  updateDetectionChecks: vi.fn(),
  warnings: [],
  updateWarnings: vi.fn(),
  onDidUpdateDetectionChecks: undefined,
};

const machineInfo: extension.MachineInfo = {
  cpus: 1,
  diskSize: 1000000,
  memory: 10000000,
  name: 'name',
};

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

vi.mock('@podman-desktop/api', async () => {
  return {
    configuration: {
      getConfiguration: () => config,
    },
    proxy: {
      isEnabled: () => false,
    },
    window: {
      showInformationMessage: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  console.error = consoleErrorMock;
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('verify create command called with correct values', async () => {
  const spyExecPromise = vi.spyOn(podmanCli, 'execPromise');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve('');
  });
  await extension.createMachine(
    {
      'podman.factory.machine.cpus': '2',
      'podman.factory.machine.image-path': 'path',
      'podman.factory.machine.memory': '1048000000',
      'podman.factory.machine.diskSize': '250000000000',
    },
    undefined,
  );
  expect(spyExecPromise).toBeCalledWith(
    getPodmanCli(),
    ['machine', 'init', '--cpus', '2', '--memory', '1048', '--disk-size', '250', '--image-path', 'path'],
    {
      env: {},
      logger: undefined,
    },
    undefined,
  );
  expect(console.error).not.toBeCalled();
});

test('test checkDefaultMachine, if the machine running is not default, the function will prompt', async () => {
  const machineDefaultName = 'podman-machine-default';
  const machine1Name = 'podman-machine-1';

  // Create fake of MachineJSON
  const fakeJSON: extension.MachineJSON[] = [
    {
      Name: machineDefaultName,
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: false,
    },
    {
      Name: machine1Name,
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: true,
    },
  ];

  await extension.checkDefaultMachine(fakeJSON);

  expect(extensionApi.window.showInformationMessage).toBeCalledWith(
    `Podman Machine '${machineDefaultName}' is running but not the default machine (default is '${machine1Name}'). This will cause podman CLI errors while trying to connect to '${machineDefaultName}'. Do you want to set it as default?`,
    'Yes',
    'Ignore',
    'Cancel',
  );
});

test('checkDefaultMachine: do not prompt if the running machine is already the default', async () => {
  // Create fake of MachineJSON
  const fakeJSON: extension.MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
    },
    {
      Name: 'podman-machine-1',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
    },
  ];

  await extension.checkDefaultMachine(fakeJSON);
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
});

test('if a machine is successfully started it changes its state to started', async () => {
  const spyUpdateStatus = vi.spyOn(provider, 'updateStatus');
  spyUpdateStatus.mockImplementation(() => {
    return;
  });

  const spyExecPromise = vi.spyOn(podmanCli, 'execPromise');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve('');
  });
  await extension.startMachine(provider, machineInfo);

  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), ['machine', 'start', 'name'], {
    logger: undefined,
  });

  expect(spyUpdateStatus).toBeCalledWith('started');
});

test('if a machine failed to start with a generic error, this is thrown', async () => {
  const spyExecPromise = vi.spyOn(podmanCli, 'execPromise');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('generic error'));
  });

  await expect(extension.startMachine(provider, machineInfo)).rejects.toThrow('generic error');
  expect(console.error).toBeCalled();
});

test('if a machine failed to start with a wsl distro not found error, the user is asked what to do', async () => {
  const spyExecPromise = vi.spyOn(podmanCli, 'execPromise');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });

  await expect(extension.startMachine(provider, machineInfo)).rejects.toThrow(
    'wsl bootstrap script failed: exit status 0xffffffff',
  );
  expect(extensionApi.window.showInformationMessage).toBeCalledWith(
    `Error while starting Podman Machine '${machineInfo.name}'. The WSL bootstrap script failed: exist status 0xffffffff. The machine is probably broken and should be deleted and reinitialized. Do you want to recreate it?`,
    'Yes',
    'Cancel',
  );
  expect(console.error).toBeCalled();
});

test('if a machine failed to start with a wsl distro not found error but the skipHandleError is false, the error is thrown', async () => {
  const spyExecPromise = vi.spyOn(podmanCli, 'execPromise');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });
  await expect(extension.startMachine(provider, machineInfo, undefined, true)).rejects.toThrow(
    'wsl bootstrap script failed: exit status 0xffffffff',
  );
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  expect(console.error).toBeCalled();
});
