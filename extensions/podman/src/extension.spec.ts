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

import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import * as extension from './extension';
import { getPodmanCli } from './podman-cli';
import type { Configuration } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import * as fs from 'node:fs';
import { LoggerDelegator } from './util';

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
  userModeNetworking: false,
};

const machineDefaultName = 'podman-machine-default';
const machine1Name = 'podman-machine-1';

// Create fake of MachineJSON
let fakeMachineJSON: extension.MachineJSON[];
let fakeMachineInfoJSON: any;

beforeEach(() => {
  fakeMachineJSON = [
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

  fakeMachineInfoJSON = {
    Host: {
      Arch: 'amd64',
      CurrentMachine: '',
      DefaultMachine: '',
      EventsDir: 'dir1',
      MachineConfigDir: 'dir2',
      MachineImageDir: 'dir3',
      MachineState: '',
      NumberOfMachines: 5,
      OS: 'windows',
      VMType: 'wsl',
    },
  };
});

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
    context: {
      setValue: vi.fn(),
    },
    process: {
      exec: vi.fn(),
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
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve({} as extensionApi.RunResult);
  });
  await extension.createMachine(
    {
      'podman.factory.machine.cpus': '2',
      'podman.factory.machine.image-path': 'path',
      'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
      'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
    },
    undefined,
  );
  expect(spyExecPromise).toBeCalledWith(
    getPodmanCli(),
    ['machine', 'init', '--cpus', '2', '--memory', '999', '--disk-size', '232', '--image-path', 'path'],
    {
      env: {},
      logger: undefined,
      token: undefined,
    },
  );
});

test('verify create command called with correct values with user mode networking', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.resolve({} as extensionApi.RunResult);
  });
  await extension.createMachine(
    {
      'podman.factory.machine.cpus': '2',
      'podman.factory.machine.image-path': 'path',
      'podman.factory.machine.memory': '1048000000',
      'podman.factory.machine.diskSize': '250000000000',
      'podman.factory.machine.user-mode-networking': true,
    },
    undefined,
    undefined,
  );
  const parameters = [
    'machine',
    'init',
    '--cpus',
    '2',
    '--memory',
    '999',
    '--disk-size',
    '232',
    '--image-path',
    'path',
    '--user-mode-networking',
  ];
  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), parameters, {
    env: {},
    logger: undefined,
  });
  expect(console.error).not.toBeCalled();
});

test('test checkDefaultMachine, if the machine running is not default, the function will prompt', async () => {
  await extension.checkDefaultMachine(fakeMachineJSON);

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

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({} as extensionApi.RunResult);
      }),
  );
  await extension.startMachine(provider, machineInfo);

  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), ['machine', 'start', 'name'], {
    logger: new LoggerDelegator(),
  });

  expect(spyUpdateStatus).toBeCalledWith('started');
});

test('if a machine failed to start with a generic error, this is thrown', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(new Error('generic error') as extensionApi.RunError);
      }),
  );

  await expect(extension.startMachine(provider, machineInfo)).rejects.toThrow('generic error');
  expect(console.error).toBeCalled();
});

test('if a machine failed to start with a wsl distro not found error, the user is asked what to do', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(new Error('wsl bootstrap script failed: exit status 0xffffffff') as extensionApi.RunError);
      }),
  );

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
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });
  await expect(extension.startMachine(provider, machineInfo, undefined, undefined, true)).rejects.toThrow(
    'wsl bootstrap script failed: exit status 0xffffffff',
  );
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  expect(console.error).toBeCalled();
});

test('test checkDefaultMachine - if there is no machine marked as default, take the default system connection to retrieve it. Prompt as it is not running', async () => {
  // Create fake of MachineJSON
  const fakeJSON: extension.MachineJSON[] = fakeMachineJSON;
  fakeJSON[1].Default = false;

  const fakeConnectionJSON: extension.ConnectionJSON[] = [
    {
      Name: machineDefaultName,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
    {
      Name: `${machineDefaultName}-root`,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
    {
      Name: machine1Name,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
    {
      Name: `${machine1Name}-root`,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: true,
    },
  ];

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeConnectionJSON) } as extensionApi.RunResult);
      }),
  );

  await extension.checkDefaultMachine(fakeJSON);

  expect(extensionApi.window.showInformationMessage).toBeCalledWith(
    `Podman Machine '${machineDefaultName}' is running but not the default machine (default is '${machine1Name}'). This will cause podman CLI errors while trying to connect to '${machineDefaultName}'. Do you want to set it as default?`,
    'Yes',
    'Ignore',
    'Cancel',
  );
});

test('test checkDefaultMachine - if there is no machine marked as default, take the default system connection to retrieve it. Do not prompt as it is running', async () => {
  // Create fake of MachineJSON
  const fakeJSON: extension.MachineJSON[] = fakeMachineJSON;
  fakeJSON[1].Default = false;

  const fakeConnectionJSON: extension.ConnectionJSON[] = [
    {
      Name: machineDefaultName,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
    {
      Name: `${machineDefaultName}-root`,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: true,
    },
    {
      Name: machine1Name,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
    {
      Name: `${machine1Name}-root`,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
  ];

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeConnectionJSON) } as extensionApi.RunResult);
      }),
  );

  await extension.checkDefaultMachine(fakeJSON);
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
});

test('test checkDefaultMachine - if user wants to change default machine, check if it is rootful and update connection', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  const spyPrompt = vi.spyOn(extensionApi.window, 'showInformationMessage');
  spyPrompt.mockResolvedValue('Yes');

  vi.mock('node:fs');

  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  const infoContentJSON = {
    Rootful: true,
  };
  const spyReadFile = vi.spyOn(fs.promises, 'readFile');
  spyReadFile.mockResolvedValue(JSON.stringify(infoContentJSON));

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(spyExecPromise).toHaveBeenNthCalledWith(1, getPodmanCli(), [
    'system',
    'connection',
    'default',
    machineDefaultName,
  ]);

  expect(spyExecPromise).toHaveBeenNthCalledWith(2, getPodmanCli(), ['machine', 'info', '--format', 'json']);

  expect(spyExecPromise).toHaveBeenNthCalledWith(3, getPodmanCli(), [
    'system',
    'connection',
    'default',
    `${machineDefaultName}-root`,
  ]);
});

test('test checkDefaultMachine - if user wants to change machine, check that it only change the connection once if it is rootless', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  const spyPrompt = vi.spyOn(extensionApi.window, 'showInformationMessage');
  spyPrompt.mockResolvedValue('Yes');

  vi.mock('node:fs');

  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  const infoContentJSON = {
    Rootful: false,
  };
  const spyReadFile = vi.spyOn(fs.promises, 'readFile');
  spyReadFile.mockResolvedValue(JSON.stringify(infoContentJSON));

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(spyExecPromise).toHaveBeenCalledTimes(2);

  expect(spyExecPromise).toHaveBeenNthCalledWith(1, getPodmanCli(), [
    'system',
    'connection',
    'default',
    machineDefaultName,
  ]);

  expect(spyExecPromise).toHaveBeenNthCalledWith(2, getPodmanCli(), ['machine', 'info', '--format', 'json']);
});

test('test checkDefaultMachine - if user wants to change machine, check that it only changes the connection once if it fails at checking rootful because file does not exist', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  const spyPrompt = vi.spyOn(extensionApi.window, 'showInformationMessage');
  spyPrompt.mockResolvedValue('Yes');

  vi.mock('node:fs');

  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(spyExecPromise).toHaveBeenCalledTimes(2);

  expect(spyExecPromise).toHaveBeenNthCalledWith(1, getPodmanCli(), [
    'system',
    'connection',
    'default',
    machineDefaultName,
  ]);

  expect(spyExecPromise).toHaveBeenNthCalledWith(2, getPodmanCli(), ['machine', 'info', '--format', 'json']);
});

test('if user wants to change machine, check that it only change the connection once if it fails at checking rootful because file is empty', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  const spyPrompt = vi.spyOn(extensionApi.window, 'showInformationMessage');
  spyPrompt.mockResolvedValue('Yes');

  vi.mock('node:fs');

  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  const spyReadFile = vi.spyOn(fs.promises, 'readFile');
  spyReadFile.mockResolvedValue('');

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(spyExecPromise).toHaveBeenCalledTimes(2);

  expect(spyExecPromise).toHaveBeenNthCalledWith(1, getPodmanCli(), [
    'system',
    'connection',
    'default',
    machineDefaultName,
  ]);

  expect(spyExecPromise).toHaveBeenNthCalledWith(2, getPodmanCli(), ['machine', 'info', '--format', 'json']);
});
