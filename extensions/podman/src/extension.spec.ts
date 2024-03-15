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

import * as fs from 'node:fs';

import type { Configuration, ContainerEngineInfo, ContainerProviderConnection } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { Disposable } from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { DarwinSocketCompatibility } from './compatibility-mode';
import { checkDisguisedPodmanSocket } from './extension';
import * as extension from './extension';
import type { InstalledPodman } from './podman-cli';
import { getPodmanCli } from './podman-cli';
import { PodmanInstall } from './podman-install';
import { isLinux, isMac, LoggerDelegator } from './util';

const config: Configuration = {
  get: () => {
    // not implemented
  },
  has: () => true,
  update: vi.fn(),
};

const registerUpdateMock = vi.fn();
const updateWarningsMock = vi.fn();
const provider: extensionApi.Provider = {
  setContainerProviderConnectionFactory: vi.fn(),
  setKubernetesProviderConnectionFactory: vi.fn(),
  registerContainerProviderConnection: vi.fn(),
  registerKubernetesProviderConnection: vi.fn(),
  registerLifecycle: vi.fn(),
  registerInstallation: vi.fn(),
  registerUpdate: registerUpdateMock,
  registerAutostart: vi.fn(),
  registerCleanup: vi.fn(),
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
  updateWarnings: updateWarningsMock,
  onDidUpdateDetectionChecks: undefined,
};

const machineInfo: extension.MachineInfo = {
  cpus: 1,
  diskSize: 1000000,
  memory: 10000000,
  name: 'name',
  userModeNetworking: false,
  cpuUsage: 0,
  diskUsage: 0,
  memoryUsage: 0,
};

const machineDefaultName = 'podman-machine-default';
const machine1Name = 'podman-machine-1';

// Create fake of MachineJSON
let fakeMachineJSON: extension.MachineJSON[];
let fakeMachineInfoJSON: any;

const telemetryLogger: extensionApi.TelemetryLogger = {
  logUsage: vi.fn(),
  logError: vi.fn(),
} as unknown as extensionApi.TelemetryLogger;

// mock ps-list
vi.mock('ps-list', async () => {
  return {
    default: vi.fn(),
  };
});

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

  (extensionApi.env.createTelemetryLogger as Mock).mockReturnValue(telemetryLogger);

  extension.initTelemetryLogger();
});

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

vi.mock('@podman-desktop/api', async () => {
  return {
    configuration: {
      getConfiguration: (): Configuration => config,
      onDidChangeConfiguration: (): any => {
        return {
          dispose: vi.fn(),
        };
      },
    },
    proxy: {
      isEnabled: (): boolean => false,
    },
    window: {
      showErrorMessage: vi.fn(),
      showInformationMessage: vi.fn(),
      showNotification: vi.fn(),
    },
    context: {
      setValue: vi.fn(),
    },
    process: {
      exec: vi.fn(),
    },
    env: {
      createTelemetryLogger: vi.fn(),
      isWindows: (): (() => boolean) => vi.fn(),
      isMac: (): (() => boolean) => vi.fn(),
      isLinux: (): (() => boolean) => vi.fn(),
    },
    containerEngine: {
      info: vi.fn(),
    },
    Disposable: {
      from: vi.fn(),
    },
  };
});

vi.mock('./qemu-helper', async () => {
  return {
    QemuHelper: vi.fn().mockImplementation(() => {
      return {
        getQemuVersion: vi.fn().mockImplementation(() => {
          return Promise.resolve('1.2.3');
        }),
      };
    }),
  };
});
vi.mock('./podman-binary-location-helper', async () => {
  return {
    PodmanBinaryLocationHelper: vi.fn().mockImplementation(() => {
      return {
        getPodmanLocationMac: vi.fn().mockImplementation(() => {
          return Promise.resolve({ source: 'unknown' });
        }),
      };
    }),
  };
});
vi.mock('./podman-info-helper', async () => {
  return {
    PodmanInfoHelper: vi.fn().mockImplementation(() => {
      return {
        updateWithPodmanInfoRecords: vi.fn().mockImplementation(() => {
          return Promise.resolve();
        }),
      };
    }),
  };
});
vi.mock('./wsl-helper', async () => {
  return {
    WslHelper: vi.fn().mockImplementation(() => {
      return {
        getWSLVersionData: vi.fn().mockImplementation(() => {
          return Promise.resolve({
            wslVersion: '1.2.3',
            kernelVersion: '1.2.3',
            windowsVersion: '1.2.3',
          });
        }),
      };
    }),
  };
});

vi.mock('./util', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('./util')>('./util');
  return {
    ...actual,
    isMac: vi.fn(),
    isWindows: vi.fn(),
    isLinux: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
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
      logger: undefined,
      token: undefined,
    },
  );

  // wait a call on telemetryLogger.logUsage
  while ((telemetryLogger.logUsage as Mock).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.init',
    expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
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
    logger: undefined,
  });
  expect(console.error).not.toBeCalled();

  // wait a call on telemetryLogger.logUsage
  while ((telemetryLogger.logUsage as Mock).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.init',
    expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
  );
});

test('verify create command called with now flag if start machine after creation is enabled', async () => {
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
      'podman.factory.machine.now': true,
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
    '--now',
  ];
  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), parameters, {
    logger: undefined,
  });
  expect(console.error).not.toBeCalled();
});

test('verify error contains name, message and stderr if creation fails', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue({
    name: 'name',
    message: 'description',
    stderr: 'error',
  });
  await expect(
    extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image-path': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.now': true,
      },
      undefined,
      undefined,
    ),
  ).rejects.toThrowError('name\ndescription\nerror\n');
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

test('if a machine is successfully reporting telemetry', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({} as extensionApi.RunResult);
      }),
  );
  await extension.startMachine(provider, machineInfo);

  // wait a call on telemetryLogger.logUsage
  while ((telemetryLogger.logUsage as Mock).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.start',
    expect.objectContaining({ hostCpus: expect.anything() }),
  );

  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), ['machine', 'start', 'name'], expect.anything());
});

test('if a machine is successfully reporting an error in telemetry', async () => {
  const customError = new Error('Error while starting podman');

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw customError;
  });
  await expect(extension.startMachine(provider, machineInfo)).rejects.toThrow(customError.message);

  // wait a call on telemetryLogger.logUsage
  while ((telemetryLogger.logUsage as Mock).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.start',
    expect.objectContaining({ hostCpus: expect.anything(), error: customError }),
  );

  expect(spyExecPromise).toBeCalledWith(getPodmanCli(), ['machine', 'start', 'name'], expect.anything());
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

test('handlecompatibilitymodesetting: enable called when configuration setting has been set to true', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  // Fake machine output
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  // Spy on get configuration to just return true regardless of handleCompatibilityModeSetting
  const spyGetConfiguration = vi.spyOn(config, 'get');
  spyGetConfiguration.mockReturnValue(true);

  // Mock that everything passes compatibility wise, since we only want to see if the function has been called.
  const socketCompatClass = new DarwinSocketCompatibility();
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('/opt/podman/bin/podman-mac-helper');

  // Mock that admin command ran successfully (since we cannot test interactive mode priv in vitest / has to be integration tests)
  const spyMacHelperCommand = vi.spyOn(socketCompatClass, 'runMacHelperCommandWithAdminPriv');
  spyMacHelperCommand.mockImplementation(() => {
    return Promise.resolve();
  });

  const getSocketCompatibilityMock = vi.fn().mockReturnValue(socketCompatClass);
  (extension as any).getSocketCompatibility = getSocketCompatibilityMock;

  // Mock async method findRunningMachine to return default
  const spyFindRunningMachine = vi.spyOn(extension, 'findRunningMachine');
  spyFindRunningMachine.mockImplementation(() => {
    return Promise.resolve('default');
  });

  // Run handleCompatibilityModeSetting
  await extension.handleCompatibilityModeSetting();

  // Check to see that the showInformationMessage asks the user to restart the machine to enable compatibility mode
  // since we are resolving as the machine is running.
  expect(extensionApi.window.showInformationMessage).toBeCalledWith(
    `Restarting your Podman machine is required to apply the changes. Would you like to restart the Podman machine 'default' now?`,
    'Yes',
    'Cancel',
  );
});

test('handlecompatibilitymodesetting: disable compatibility called when configuration setting has been set to false', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  // Fake machine output
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    () =>
      new Promise<extensionApi.RunResult>(resolve => {
        resolve({ stdout: JSON.stringify(fakeMachineInfoJSON) } as extensionApi.RunResult);
      }),
  );

  // Spy on get configuration to just return false regardless of handleCompatibilityModeSetting
  const spyGetConfiguration = vi.spyOn(config, 'get');
  spyGetConfiguration.mockReturnValue(false);

  // Mock that everything passes compatibility wise, since we only want to see if the function has been called.
  const socketCompatClass = new DarwinSocketCompatibility();
  const spyFindPodmanHelper = vi.spyOn(socketCompatClass, 'findPodmanHelper');
  spyFindPodmanHelper.mockReturnValue('/opt/podman/bin/podman-mac-helper');

  // Mock that admin command ran successfully (since we cannot test interactive mode priv in vitest / has to be integration tests)
  const spyMacHelperCommand = vi.spyOn(socketCompatClass, 'runMacHelperCommandWithAdminPriv');
  spyMacHelperCommand.mockImplementation(() => {
    return Promise.resolve();
  });

  const getSocketCompatibilityMock = vi.fn().mockReturnValue(socketCompatClass);
  (extension as any).getSocketCompatibility = getSocketCompatibilityMock;

  // Mock async method findRunningMachine to return default
  const spyFindRunningMachine = vi.spyOn(extension, 'findRunningMachine');
  spyFindRunningMachine.mockImplementation(() => {
    return Promise.resolve('');
  });

  // Spy on "promptRestart", this should only appear if the machine is running.
  const disableMessage = vi.spyOn(extensionApi.window, 'showInformationMessage');

  // Run handleCompatibilityModeSetting
  await extension.handleCompatibilityModeSetting();
  await socketCompatClass.disable();

  // Make sure that it returns that the compatibility mode has been disabled
  expect(disableMessage).toHaveBeenCalledWith('Docker socket compatibility mode for Podman has been disabled.');
});

test('ensure started machine reports default configuration', async () => {
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args[0] === 'machine' && args[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args[0] === 'machine' && args[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args[0] === 'system' && args[1] === 'connection' && args[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider);
  expect(config.update).toBeCalledWith('machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toBeCalledWith('machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toBeCalledWith('machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toBeCalledWith('machine.cpusUsage', 0);
  expect(config.update).toBeCalledWith('machine.memoryUsage', 0);
  expect(config.update).toBeCalledWith('machine.diskSizeUsage', 0);
});

test('ensure started machine reports configuration', async () => {
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args[0] === 'machine' && args[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args[0] === 'machine' && args[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args[0] === 'system' && args[1] === 'connection' && args[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider);
  (extensionApi.containerEngine.info as Mock).mockResolvedValue({
    cpus: 2,
    cpuIdle: 99,
    memory: 1048000000,
    memoryUsed: 524000000,
    diskSize: 250000000000,
    diskUsed: 50000000000,
  } as ContainerEngineInfo);
  await extension.updateMachines(provider);
  expect(config.update).toBeCalledWith('machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toBeCalledWith('machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toBeCalledWith('machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toBeCalledWith('machine.cpusUsage', 1);
  expect(config.update).toBeCalledWith('machine.memoryUsage', 50);
  expect(config.update).toBeCalledWith('machine.diskSizeUsage', 20);
});

test('ensure stopped machine reports configuration', async () => {
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args[0] === 'machine' && args[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[1]]) } as extensionApi.RunResult);
        } else if (args[0] === 'machine' && args[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args[0] === 'system' && args[1] === 'connection' && args[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[1].Name, Default: true }]),
          } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider);
  expect(config.update).toBeCalledWith('machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toBeCalledWith('machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toBeCalledWith('machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toBeCalledWith('machine.cpusUsage', 0);
  expect(config.update).toBeCalledWith('machine.memoryUsage', 0);
  expect(config.update).toBeCalledWith('machine.diskSizeUsage', 0);
});

test('ensure showNotification is not called during update', async () => {
  const showNotificationMock = vi.spyOn(extensionApi.window, 'showNotification');
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args[0] === 'machine' && args[1] === 'list') {
          reject(new Error('error'));
        }
      }),
  );

  const extensionContext = { subscriptions: [], storagePath: '' } as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(extensionContext);
  vi.spyOn(podmanInstall, 'checkForUpdate').mockImplementation((_installedPodman: InstalledPodman) => {
    return Promise.resolve({
      hasUpdate: true,
      bundledVersion: 'v1.2',
      installedVersion: 'v1',
    });
  });
  vi.spyOn(podmanInstall, 'performUpdate').mockImplementation(
    async (_provider: extensionApi.Provider, _installedPodman: InstalledPodman | undefined) => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  );

  let updater: extensionApi.ProviderUpdate;
  registerUpdateMock.mockImplementation((update: extensionApi.ProviderUpdate) => {
    updater = update;
  });
  await extension.registerUpdatesIfAny(
    provider,
    {
      version: '1.1',
    },
    podmanInstall,
  );

  // check updater is registered
  expect(updater).toBeDefined();
  expect(updater.version).equal('v1.2');

  // run the updater (it will sleep for 500ms before returning and resetting the shouldNotifySetup flag
  // run the updateMachine which should not call the showNotification func because shouldNotifySetup is false
  updater.update(undefined).catch(() => {});
  await expect(extension.updateMachines(provider)).rejects.toThrow('error');

  expect(showNotificationMock).not.toBeCalled();

  // wait 500ms so that the updater is complete and shouldNotifySetup reset. Call again the updateMachines func, this time the showNotification is called
  // as there is no update in progress
  await new Promise(resolve => setTimeout(resolve, 500));
  await expect(extension.updateMachines(provider)).rejects.toThrow('error');

  expect(showNotificationMock).toBeCalled();
});

test('provider is registered with edit capabilities on MacOS', async () => {
  // Mock platform to be darwin
  vi.mocked(isMac).mockReturnValue(true);
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });
  let registeredConnection: ContainerProviderConnection;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, machineInfo, undefined);
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection.lifecycle).toBeDefined();
  expect(registeredConnection.lifecycle.edit).toBeDefined();
});

test('provider is registered without edit capabilities on Windows', async () => {
  vi.mocked(isMac).mockReturnValue(false);
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });
  let registeredConnection: ContainerProviderConnection;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, machineInfo, undefined);
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection.lifecycle).toBeDefined();
  expect(registeredConnection.lifecycle.edit).toBeUndefined();
});

test('provider is registered without edit capabilities on Linux', async () => {
  vi.mocked(isLinux).mockReturnValue(true);
  extension.initExtensionContext({ subscriptions: [] } as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(() => {
    return Promise.reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  });
  let registeredConnection: ContainerProviderConnection;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, machineInfo, undefined);
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection.lifecycle).toBeDefined();
  expect(registeredConnection.lifecycle.edit).toBeUndefined();
});

test('checkDisguisedPodmanSocket: does not run updateWarnings when called with Linux', async () => {
  vi.mocked(isLinux).mockReturnValue(true);
  await checkDisguisedPodmanSocket(provider);
  expect(updateWarningsMock).not.toBeCalled();
});

test('checkDisguisedPodmanSocket: runs updateWarnings when called not on Linux', async () => {
  vi.mocked(isLinux).mockReturnValue(false);
  await checkDisguisedPodmanSocket(provider);
  expect(updateWarningsMock).toBeCalled();
});

test('Even with getJSONMachineList erroring, do not show setup notification on Linux', async () => {
  vi.mocked(isLinux).mockReturnValue(true);
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue({
    name: 'name',
    message: 'description',
    stderr: 'error',
  });
  await expect(extension.updateMachines(provider)).rejects.toThrow('description');
  expect(extensionApi.window.showNotification).not.toBeCalled();
});

test('If machine list is empty, do not show setup notification on Linux', async () => {
  vi.mocked(isLinux).mockReturnValue(true);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockResolvedValue({ stdout: '[]' } as extensionApi.RunResult);
  await extension.updateMachines(provider);
  expect(extensionApi.window.showNotification).not.toBeCalled();
});

test('if there are no machines, make sure checkDefaultMachine is not being ran inside updateMachines', async () => {
  const spyCheckDefaultMachine = vi.spyOn(extension, 'checkDefaultMachine');
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({ stdout: '[]' } as extensionApi.RunResult);
  await extension.updateMachines(provider);
  expect(spyCheckDefaultMachine).not.toBeCalled();
});
