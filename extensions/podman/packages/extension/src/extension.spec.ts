/**********************************************************************
 * Copyright (C) 2023 - 2026 Red Hat, Inc.
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
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import type * as proc from 'node:child_process';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import { arch } from 'node:os';
import path from 'node:path';

import type { Configuration, ContainerEngineInfo, ContainerProviderConnection } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { Disposable } from '@podman-desktop/api';
import type { Container as InversifyContainer, ServiceIdentifier } from 'inversify';
import type { Mock } from 'vitest';
import { afterEach, assert, beforeEach, describe, expect, test, vi } from 'vitest';

import * as compatibilityModeLib from '/@/compatibility-mode/compatibility-mode';
import {
  CLEANUP_REQUIRED_MACHINE_KEY,
  CREATE_WSL_MACHINE_OPTION_SELECTED_KEY,
  PODMAN_EDIT_IMPORT_NATIVE_CA,
  PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY,
  PODMAN_MACHINE_CPU_SUPPORTED_KEY,
  PODMAN_MACHINE_DISK_SUPPORTED_KEY,
  PODMAN_MACHINE_EDIT_CPU,
  PODMAN_MACHINE_EDIT_DISK_SIZE,
  PODMAN_MACHINE_EDIT_MEMORY,
  PODMAN_MACHINE_EDIT_ROOTFUL,
  PODMAN_MACHINE_MEMORY_SUPPORTED_KEY,
  WSL_HYPERV_ENABLED_KEY,
} from '/@/constants';
import { KrunkitHelper } from '/@/helpers/krunkit-helper';
import { PodmanBinaryLocationHelper } from '/@/helpers/podman-binary-location-helper';
import { PodmanInfoHelper } from '/@/helpers/podman-info-helper';
import { QemuHelper } from '/@/helpers/qemu-helper';
import type { Installer } from '/@/installer/installer';
import { WinPlatform } from '/@/platforms/win-platform';
import { PodmanProvider } from '/@/providers/podman-provider';
import type { ConnectionJSON, MachineInfo, MachineJSON } from '/@/types';
import type { InstalledPodman } from '/@/utils/podman-binary';
import { PodmanBinary } from '/@/utils/podman-binary';

import * as extension from './extension';
import {
  getImportNativeCAFromConfig,
  initCheckAndRegisterUpdate,
  initDefaultLinux,
  monitorPodmanSocket,
  registerOnboardingMachineExistsCommand,
  registerOnboardingUnsupportedPodmanMachineCommand,
  resetStopLoop,
  setWSLEnabled,
  updateProviderStatus,
} from './extension';
import { InversifyBinding } from './inject/inversify-binding';
import type { UpdateCheck } from './installer/podman-install';
import { PodmanInstall } from './installer/podman-install';
import type { PodmanRemoteConnections } from './remote/podman-remote-connections';
import * as podmanCli from './utils/podman-cli';
import type { PodmanConfiguration } from './utils/podman-configuration';
import { RosettaProvisioner } from './utils/rosetta';
import * as util from './utils/util';
import { getAssetsFolder, LIBKRUN_LABEL, LoggerDelegator, VMTYPE } from './utils/util';
import { isDisguisedPodman } from './utils/warnings';

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
  setVmProviderConnectionFactory: vi.fn(),
  registerContainerProviderConnection: vi.fn(),
  registerKubernetesProviderConnection: vi.fn(),
  registerVmProviderConnection: vi.fn(),
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
  onDidUpdateStatus: vi.fn(),
  version: '',
  updateVersion: vi.fn(),
  onDidUpdateVersion: vi.fn(),
  images: {},
  links: [],
  detectionChecks: [],
  updateDetectionChecks: vi.fn(),
  warnings: [],
  updateWarnings: updateWarningsMock,
  onDidUpdateDetectionChecks: vi.fn(),
};

const machineInfo: MachineInfo = {
  cpus: 1,
  diskSize: 1000000,
  memory: 10000000,
  name: 'name',
  userModeNetworking: false,
  cpuUsage: 0,
  diskUsage: 0,
  memoryUsage: 0,
  vmType: VMTYPE.LIBKRUN,
  port: 1234,
  remoteUsername: 'user',
  identityPath: '/path/to/key',
};

const updateMachineProviderSettingsMock = vi.fn();
const podmanConfiguration = {
  registryConfiguration: {
    getPlaybookScriptPath: vi.fn(),
  },
  updateMachineProviderSettings: updateMachineProviderSettingsMock,
} as unknown as PodmanConfiguration;

const PODMAN_PROVIDER_MOCK: PodmanProvider = {
  provider: provider,
} as unknown as PodmanProvider;

const machineDefaultName = 'podman-machine-default';
const machine1Name = 'podman-machine-1';

// Create fake of MachineJSON
let fakeMachineJSON: MachineJSON[];
let fakeMachineInfoJSON: unknown;

const telemetryLogger: extensionApi.TelemetryLogger = {
  logUsage: vi.fn(),
  logError: vi.fn(),
} as unknown as extensionApi.TelemetryLogger;

async function waitTelemetryLoggerUsage() {
  await vi.waitFor(() => expect((telemetryLogger.logUsage as Mock).mock.calls).not.toHaveLength(0));
}

vi.mock(import('node:fs'));
// mock fs.promises.readdir and use string[] as return type
const fsPromisesReaddirMock = vi.mocked(
  fs.promises.readdir as (path: string, options?: { withFileTypes: false }) => Promise<string[]>,
);

vi.mock(import('./inject/inversify-binding'));
vi.mock(import('./utils/warnings'));

// mock ps-list
vi.mock(import('ps-list'), async () => {
  return {
    default: vi.fn(),
  };
});

vi.mock(import('/@/compatibility-mode/compatibility-mode'), async () => {
  return {
    getSocketCompatibility: vi.fn(),
  };
});

vi.mock(import('./configuration/registry-configuration'), async () => {
  const RegistryConfigurationImpl = vi.fn();
  RegistryConfigurationImpl.prototype.init = vi.fn(() => []);
  return { RegistryConfigurationImpl };
});

const PODMAN_INSTALL_MOCK: PodmanInstall = {
  getUpdatePreflightChecks: vi.fn(),
  isAbleToInstall: vi.fn(),
  doInstallPodman: vi.fn(),
  checkForUpdate: vi.fn(),
} as unknown as PodmanInstall;
const WIN_PLATFORM_MOCK: WinPlatform = {
  isWSLEnabled: vi.fn(),
  isHyperVEnabled: vi.fn(),
} as unknown as WinPlatform;
const PODMAN_BINARY_MOCK: PodmanBinary = {
  getBinaryInfo: vi.fn(),
  invalidate: vi.fn(),
} as unknown as PodmanBinary;
const ROSETTA_PROVISIONER_MOCK: RosettaProvisioner = {
  checkRosettaMacArm: vi.fn(),
  needsRosettaEnableFile: vi.fn(),
  enableRosettaInMachine: vi.fn(),
  provisionAndRestartForRosetta: vi.fn(),
} as unknown as RosettaProvisioner;

beforeEach(async () => {
  fakeMachineJSON = [
    {
      Name: machineDefaultName,
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: machine1Name,
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 456,
      RemoteUsername: 'admin',
      IdentityPath: '/path/to/key1',
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
  vi.resetAllMocks();
  (extensionApi.env.createTelemetryLogger as Mock).mockReturnValue(telemetryLogger);

  // Mock withProgress to execute the task immediately
  vi.mocked(extensionApi.window.withProgress).mockImplementation((_options, task) => {
    return task({ report: vi.fn() }, {} as extensionApi.CancellationToken);
  });

  extension.initTelemetryLogger();
  extension.initExtensionNotification();
  extension.resetShouldNotifySetup();
  extension.resetWSLWarningFlag();
  extension.initPodmanRemoteConnections(undefined as unknown as PodmanRemoteConnections);

  // mock PodmanInstall class methods
  vi.mocked(PODMAN_INSTALL_MOCK.checkForUpdate).mockResolvedValue({
    hasUpdate: false,
  });

  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue(undefined);

  function getBind(identifier: ServiceIdentifier<unknown>): unknown {
    switch (identifier) {
      case PodmanInstall:
        return PODMAN_INSTALL_MOCK;
      case WinPlatform:
        return WIN_PLATFORM_MOCK;
      case PodmanBinary:
        return PODMAN_BINARY_MOCK;
      case PodmanProvider:
        return PODMAN_PROVIDER_MOCK;
      case RosettaProvisioner:
        return ROSETTA_PROVISIONER_MOCK;
    }
    throw new Error(`Unknown identifier ${String(identifier)}`);
  }

  // configure inversify
  vi.mocked(InversifyBinding.prototype.init).mockResolvedValue({
    get: getBind,
    getAsync: getBind,
  } as unknown as InversifyContainer);
  await extension.initInversify({ subscriptions: [] } as unknown as extensionApi.ExtensionContext, telemetryLogger);
});

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();
const originalConsoleWarn = console.warn;
const consoleWarnMock = vi.fn();
const originalConsoleTrace = console.trace;
const consoleTraceMock = vi.fn();

vi.mock(import('node:fs'));
vi.mock(import('node:http'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    get: vi.fn(),
  };
});
vi.mock(import('node:fs/promises'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFile: vi.fn(),
  };
});
vi.mock(import('node:child_process'), async importOriginal => {
  const childProcessActual = await importOriginal();
  return {
    ...childProcessActual,
    env: vi.fn(),
    spawn: vi.fn(),
  };
});

vi.mock(import('node:os'), async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const osActual = await vi.importActual<typeof import('node:os')>('node:os');

  return {
    ...osActual,
    release: vi.fn(),
    platform: vi.fn(),
    arch: vi.fn(),
  };
});

vi.mock(import('./helpers/qemu-helper'));
vi.mock(import('./helpers/krunkit-helper'));
vi.mock(import('./helpers/podman-binary-location-helper'));
vi.mock(import('./helpers/podman-info-helper'));
vi.mock(import('./utils/rosetta'));

vi.mock(import('./utils/util'), async importOriginal => {
  const original = await importOriginal();
  return {
    ...original,
    isMac: vi.fn(),
    isWindows: vi.fn(),
    getAssetsFolder: vi.fn(),
  };
});

beforeEach(() => {
  console.error = consoleErrorMock;
  console.warn = consoleWarnMock;
  console.trace = consoleTraceMock;
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue(config);
  vi.mocked(extensionApi.env).isMac = false;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isWindows = false;

  vi.mocked(spawn).mockReturnValue({
    on: vi.fn(),
  } as unknown as proc.ChildProcess);

  const mock = vi.spyOn(compatibilityModeLib, 'getSocketCompatibility');
  mock.mockReturnValue({
    isEnabled: () => false,
    enable: vi.fn(),
    disable: vi.fn(),
    details: '',
    tooltipText: (): string => {
      return '';
    },
  });

  vi.mocked(PodmanInfoHelper.prototype.updateWithPodmanInfoRecords).mockResolvedValue(undefined);
});

afterEach(async () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.trace = originalConsoleTrace;
  await extension.deactivate();
  vi.useRealTimers();
});

describe.each([
  { os: 'macos', expectedProvider: VMTYPE.LIBKRUN },
  { os: 'windows-wsl', expectedProvider: VMTYPE.WSL },
  { os: 'windows-hyperv', expectedProvider: VMTYPE.HYPERV },
])('verify create on %s', ({ os, expectedProvider }) => {
  const provider = expectedProvider;
  beforeEach((): void => {
    vi.mocked(extensionApi.env).isWindows = os !== 'macos';
    vi.mocked(extensionApi.env).isMac = os === 'macos';

    setWSLEnabled(provider === VMTYPE.WSL);
  });

  test.each([
    { version: '6.3.2', image: 'image' },
    { version: '5.0.0', image: 'image' },
    { version: '4.5.0', image: 'image-path' },
  ])(`verify create command called with correct values for %s`, async ({ version, image }) => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version,
    });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
        'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );
    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining([`--${image}`, 'path']),
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: provider,
        },
      },
    );
    await waitTelemetryLoggerUsage();
    expect(telemetryLogger.logUsage).toBeCalledWith(
      'podman.machine.init',
      expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
    );
  });

  test.each([
    { version: '6.1.0', image: 'image' },
    { version: '5.0.0', image: 'image' },
    { version: '4.5.0', image: 'image-path' },
  ])('verify create command called with correct image values with image URL %s', async ({ version, image }) => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version,
    });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image-uri': 'https://host/file',
        'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
        'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );
    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining([`--${image}`, 'https://host/file']),
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: provider,
        },
      },
    );

    await waitTelemetryLoggerUsage();

    expect(telemetryLogger.logUsage).toBeCalledWith(
      'podman.machine.init',
      expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom-url' }),
    );
  });

  test.each([
    { version: '6.3.2', image: 'image' },
    { version: '5.0.0', image: 'image' },
    { version: '4.5.0', image: 'image-path' },
  ])('verify create command called with correct image values with registry %s', async ({ version, image }) => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version,
    });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image-uri': 'registry/repo/image:version',
        'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
        'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );
    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining([`--${image}`, 'docker://registry/repo/image:version']),
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: provider,
        },
      },
    );

    await waitTelemetryLoggerUsage();

    expect(telemetryLogger.logUsage).toBeCalledWith(
      'podman.machine.init',
      expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom-registry' }),
    );
  });

  test.each([
    { version: '6.3.2', image: 'image' },
    { version: '5.0.0', image: 'image' },
    { version: '4.5.0', image: 'image-path' },
  ])('verify create command called with correct values with user mode networking %s', async ({ version, image }) => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version,
    });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.user-mode-networking': true,
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining([`--${image}`, 'path']),
      {
        logger: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: provider,
        },
        token: undefined,
      },
    );
    expect(console.error).not.toBeCalled();

    await waitTelemetryLoggerUsage();

    expect(telemetryLogger.logUsage).toBeCalledWith(
      'podman.machine.init',
      expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
    );
  });

  test.each([
    { version: '6.3.2', image: 'image' },
    { version: '5.0.0', image: 'image' },
    { version: '4.5.0', image: 'image-path' },
  ])(
    'verify create command called with now flag if start machine after creation is enabled %s',
    async ({ version, image }) => {
      vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
        version,
      });

      await extension.createMachine(
        {
          'podman.factory.machine.cpus': '2',
          'podman.factory.machine.image': 'path',
          'podman.factory.machine.memory': '1048000000',
          'podman.factory.machine.diskSize': '250000000000',
          'podman.factory.machine.now': true,
          'podman.factory.machine.provider': provider,
        },
        podmanConfiguration,
      );

      expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
        podmanCli.getPodmanCli(),
        expect.arrayContaining([`--${image}`, 'path']),
        {
          logger: undefined,
          env: {
            CONTAINERS_MACHINE_PROVIDER: provider,
          },
          token: undefined,
        },
      );
      expect(console.error).not.toBeCalled();
    },
  );

  test('verify error contains name, message and stderr if creation fails', async () => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });
    vi.mocked(extensionApi.process.exec).mockRejectedValueOnce({
      name: 'name',
      message: 'description',
      stderr: 'error',
    });
    await expect(
      extension.createMachine(
        {
          'podman.factory.machine.cpus': '2',
          'podman.factory.machine.image': 'path',
          'podman.factory.machine.memory': '1048000000',
          'podman.factory.machine.diskSize': '250000000000',
          'podman.factory.machine.now': true,
        },
        podmanConfiguration,
      ),
    ).rejects.toThrowError('name\ndescription\nerror\n');
  });

  test('verify create command called with embedded image if using podman v5', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(getAssetsFolder).mockReturnValue('fake');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });
    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.now': true,
      },
      podmanConfiguration,
    );

    // check telemetry is called with telemetryRecords.imagePath
    await vi.waitFor(() => {
      expect(telemetryLogger.logUsage).toBeCalledWith(
        'podman.machine.init',
        expect.objectContaining({ imagePath: 'embedded' }),
      );
    });

    expect(vi.mocked(extensionApi.process.exec)).toHaveBeenNthCalledWith(
      1,
      podmanCli.getPodmanCli(),
      expect.arrayContaining([expect.stringContaining('.zst')]),
      expect.anything(),
    );
  });

  test('verify create command called in airgap mode will try to create image', async () => {
    vi.mocked(extensionApi.env).isWindows = os !== 'macos';
    vi.mocked(extensionApi.env).isMac = os === 'macos';
    vi.mocked(getAssetsFolder).mockReturnValue('fake');
    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.now': true,
        'podman.factory.machine.win.provider': provider,
      },
      podmanConfiguration,
    );

    await vi.waitFor(() => {
      expect(telemetryLogger.logUsage).toBeCalledWith(
        'podman.machine.init',
        expect.objectContaining({ imagePath: provider === VMTYPE.HYPERV ? 'default' : 'embedded' }),
      );
    });
  });

  test('verify create command with playbook', async () => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.4.0',
    });

    const fakePlaybookPath = 'myPlaybookPath';
    vi.mocked(podmanConfiguration.registryConfiguration.getPlaybookScriptPath).mockResolvedValue(fakePlaybookPath);

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
        'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );
    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      // check playbook parameter
      [
        'machine',
        'init',
        '--cpus',
        '2',
        '--memory',
        '1000',
        '--disk-size',
        '232',
        '--image',
        'path',
        '--playbook',
        fakePlaybookPath,
        '--rootful',
      ],
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: provider,
        },
      },
    );

    await waitTelemetryLoggerUsage();

    expect(telemetryLogger.logUsage).toBeCalledWith(
      'podman.machine.init',
      expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
    );
  });

  test('createMachine passes --import-native-ca when param is true and Podman >= 6', async () => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.0.0' });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.import-native-ca': true,
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining(['--import-native-ca']),
      expect.any(Object),
    );
  });

  test('createMachine does not pass --import-native-ca when param is true but Podman < 6', async () => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.8.0' });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.import-native-ca': true,
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).not.toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining(['--import-native-ca']),
      expect.any(Object),
    );
  });

  test('createMachine does not pass --import-native-ca when param is false and Podman >= 6', async () => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.0.0' });

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
        'podman.factory.machine.import-native-ca': false,
        'podman.factory.machine.provider': provider,
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).not.toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining(['--import-native-ca']),
      expect.any(Object),
    );
  });
});

describe('createMachine on windows without an explicit provider', () => {
  let originalProvider: string | undefined;

  beforeEach(() => {
    originalProvider = process.env.CONTAINERS_MACHINE_PROVIDER;
    vi.mocked(extensionApi.env).isWindows = true;
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });
  });

  afterEach(() => {
    process.env.CONTAINERS_MACHINE_PROVIDER = originalProvider;
  });

  test('defaults to wsl when CONTAINERS_MACHINE_PROVIDER is not set', async () => {
    delete process.env.CONTAINERS_MACHINE_PROVIDER;

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining(['--image', 'path']),
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: 'wsl',
        },
      },
    );
  });

  test('uses CONTAINERS_MACHINE_PROVIDER when set', async () => {
    process.env.CONTAINERS_MACHINE_PROVIDER = 'hyperv';

    await extension.createMachine(
      {
        'podman.factory.machine.cpus': '2',
        'podman.factory.machine.image': 'path',
        'podman.factory.machine.memory': '1048000000',
        'podman.factory.machine.diskSize': '250000000000',
      },
      podmanConfiguration,
    );

    expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
      podmanCli.getPodmanCli(),
      expect.arrayContaining(['--image', 'path']),
      {
        logger: undefined,
        token: undefined,
        env: {
          CONTAINERS_MACHINE_PROVIDER: 'hyperv',
        },
      },
    );
  });
});

test.each([
  { architecture: 'arm64', expectedProvider: VMTYPE.LIBKRUN },
  { architecture: 'arm64', expectedProvider: VMTYPE.APPLEHV },
  { architecture: 'x64', expectedProvider: VMTYPE.APPLEHV },
])('verify create on mac from settings on %s', async ({ architecture, expectedProvider }) => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(arch).mockReturnValue(architecture as NodeJS.Architecture);
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
    version: '5.4.0',
  });

  await extension.createMachine(
    {
      'podman.factory.machine.cpus': '2',
      'podman.factory.machine.image': 'path',
      'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
      'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
      'podman.factory.machine.provider': expectedProvider,
    },
    podmanConfiguration,
  );

  expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
    podmanCli.getPodmanCli(),
    expect.arrayContaining([`--image`, 'path']),
    {
      logger: undefined,
      token: undefined,
      env: {
        CONTAINERS_MACHINE_PROVIDER: expectedProvider,
      },
    },
  );

  expect(updateMachineProviderSettingsMock).toBeCalledWith(expectedProvider);
  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.init',
    expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
  );
});

test.each([
  { architecture: 'arm64', expectedProvider: VMTYPE.LIBKRUN },
  { architecture: 'x64', expectedProvider: VMTYPE.APPLEHV },
])('verify create on mac from dashboard on %s', async ({ architecture, expectedProvider }) => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(arch).mockReturnValue(architecture as NodeJS.Architecture);
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
    version: '5.4.0',
  });

  await extension.createMachine(
    {
      'podman.factory.machine.cpus': '2',
      'podman.factory.machine.image': 'path',
      'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
      'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
    },
    podmanConfiguration,
  );

  expect(vi.mocked(extensionApi.process.exec)).toBeCalledWith(
    podmanCli.getPodmanCli(),
    expect.arrayContaining([`--image`, 'path']),
    {
      logger: undefined,
      token: undefined,
      env: {
        CONTAINERS_MACHINE_PROVIDER: expectedProvider,
      },
    },
  );

  expect(updateMachineProviderSettingsMock).toBeCalledWith(expectedProvider);
  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.init',
    expect.objectContaining({ cpus: '2', defaultName: true, diskSize: '250000000000', imagePath: 'custom' }),
  );
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
  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-1',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 456,
      RemoteUsername: 'admin',
      IdentityPath: '/path/to/key`',
    },
  ];

  const fakeConnectionJSON: ConnectionJSON[] = [
    {
      Name: machineDefaultName,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: true,
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
      Default: false,
    },
  ];

  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: JSON.stringify(fakeConnectionJSON),
  } as extensionApi.RunResult);

  await extension.checkDefaultMachine(fakeJSON);
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
});

test('if a machine is successfully started it changes its state to started', async () => {
  const spyUpdateStatus = vi.spyOn(provider, 'updateStatus');
  spyUpdateStatus.mockImplementation(() => {
    return;
  });

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
  await extension.startMachine(provider, podmanConfiguration, machineInfo);

  expect(spyExecPromise).toBeCalledWith(podmanCli.getPodmanCli(), ['machine', 'start', 'name'], {
    env: {
      CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
    },
    logger: new LoggerDelegator(),
  });

  expect(spyUpdateStatus).toBeCalledWith('started');
});

test('if autoStart is true, machine start uses detached mode', async () => {
  const spyUpdateStatus = vi.spyOn(provider, 'updateStatus');
  spyUpdateStatus.mockImplementation(() => {
    return;
  });

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);

  await extension.startMachine(provider, podmanConfiguration, machineInfo, undefined, undefined, undefined, true);

  expect(spyExecPromise).toHaveBeenCalledWith(podmanCli.getPodmanCli(), ['machine', 'start', 'name'], {
    env: {
      CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
    },
    logger: new LoggerDelegator(),
    detached: true,
  });

  expect(spyUpdateStatus).toHaveBeenCalledWith('started');
});

test('if a machine is successfully reporting telemetry', async () => {
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
  await extension.startMachine(provider, podmanConfiguration, machineInfo);

  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.start',
    expect.objectContaining({ hostCpus: expect.anything() }),
  );

  expect(spyExecPromise).toBeCalledWith(podmanCli.getPodmanCli(), ['machine', 'start', 'name'], expect.anything());
});

test('if a machine is successfully reporting an error in telemetry', async () => {
  const customError = new Error('Error while starting podman');

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw customError;
  });
  await expect(extension.startMachine(provider, podmanConfiguration, machineInfo)).rejects.toThrow(customError.message);

  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.start',
    expect.objectContaining({ hostCpus: expect.anything(), error: customError }),
  );

  expect(spyExecPromise).toBeCalledWith(podmanCli.getPodmanCli(), ['machine', 'start', 'name'], expect.anything());
});

test('if a machine failed to start with a generic error, this is thrown', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw new Error('generic error');
  });

  await expect(extension.startMachine(provider, podmanConfiguration, machineInfo)).rejects.toThrow('generic error');
  expect(console.error).toBeCalled();
});

test('if a machine failed to start with a wsl distro not found error, the user is asked what to do', async () => {
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw new Error('wsl bootstrap script failed: exit status 0xffffffff');
  });

  await expect(extension.startMachine(provider, podmanConfiguration, machineInfo)).rejects.toThrow(
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
  spyExecPromise.mockRejectedValue(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
  await expect(
    extension.startMachine(provider, podmanConfiguration, machineInfo, undefined, undefined, true),
  ).rejects.toThrow('wsl bootstrap script failed: exit status 0xffffffff');
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  expect(console.error).toBeCalled();
});

describe('startMachine rosetta enable-file provisioning', () => {
  beforeEach(() => {
    vi.spyOn(provider, 'updateStatus').mockImplementation(() => {});
  });

  test('calls provisionAndRestartForRosetta after successful start', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.7.0' } as InstalledPodman);
    vi.mocked(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).mockResolvedValue(false);

    await extension.startMachine(provider, podmanConfiguration, machineInfo);

    expect(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).toHaveBeenCalledWith(
      machineInfo.name,
      machineInfo.vmType,
      podmanConfiguration,
      '5.7.0',
      expect.objectContaining({ logger: expect.anything() }),
    );
    expect(provider.updateStatus).toHaveBeenCalledWith('started');
  });

  test('does not report started when provisionAndRestartForRosetta throws (restart failed)', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.7.0' } as InstalledPodman);
    vi.mocked(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).mockRejectedValue(new Error('restart failed'));

    await expect(
      extension.startMachine(provider, podmanConfiguration, machineInfo, undefined, undefined, true),
    ).rejects.toThrow('restart failed');

    expect(provider.updateStatus).not.toHaveBeenCalledWith('started');
  });

  test('skips provisionAndRestartForRosetta when podman version is not available', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue(undefined);

    await extension.startMachine(provider, podmanConfiguration, machineInfo);

    expect(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).not.toHaveBeenCalled();
    expect(provider.updateStatus).toHaveBeenCalledWith('started');
  });
});

describe('on Linux, startMachine and stopMachine should not update provider status', () => {
  beforeEach(() => {
    vi.spyOn(provider, 'updateStatus').mockImplementation(() => {});
    vi.mocked(extensionApi.env).isLinux = true;
    vi.mocked(extensionApi.env).isMac = false;
  });

  test('startMachine does not call provider.updateStatus on Linux', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.7.0' } as InstalledPodman);
    vi.mocked(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).mockResolvedValue(false);

    await extension.startMachine(provider, podmanConfiguration, machineInfo);

    expect(provider.updateStatus).not.toHaveBeenCalled();
  });

  test('stopMachine does not call provider.updateStatus on Linux', async () => {
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);

    await extension.stopMachine(provider, machineInfo);

    expect(provider.updateStatus).not.toHaveBeenCalled();
  });
});

describe('createMachine rosetta enable-file provisioning', () => {
  const createMachineBaseParams = {
    'podman.factory.machine.cpus': '2',
    'podman.factory.machine.memory': '1048000000',
    'podman.factory.machine.diskSize': '250000000000',
    'podman.factory.machine.image': 'path',
  };

  beforeEach(() => {
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.7.0' } as InstalledPodman);
    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
  });

  test('--now branch calls provisionAndRestartForRosetta', async () => {
    vi.mocked(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).mockResolvedValue(false);

    await extension.createMachine(
      { ...createMachineBaseParams, 'podman.factory.machine.now': true },
      podmanConfiguration,
    );

    expect(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).toHaveBeenCalledWith(
      '',
      expect.any(String),
      podmanConfiguration,
      '5.7.0',
      expect.anything(),
    );
  });

  test('--now branch catches error as warning', async () => {
    vi.mocked(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).mockRejectedValue(new Error('rosetta ssh fail'));

    await extension.createMachine(
      { ...createMachineBaseParams, 'podman.factory.machine.now': true },
      podmanConfiguration,
    );

    expect(console.warn).toHaveBeenCalledWith(
      'Failed to set up Rosetta enable file during machine creation: Error: rosetta ssh fail',
    );
  });

  test('stopped branch calls needsRosettaEnableFile with vmType', async () => {
    vi.mocked(ROSETTA_PROVISIONER_MOCK.needsRosettaEnableFile).mockResolvedValue(false);

    await extension.createMachine(createMachineBaseParams, podmanConfiguration);

    expect(ROSETTA_PROVISIONER_MOCK.needsRosettaEnableFile).toHaveBeenCalledWith(
      podmanConfiguration,
      '5.7.0',
      expect.any(String),
    );
    expect(ROSETTA_PROVISIONER_MOCK.provisionAndRestartForRosetta).not.toHaveBeenCalled();
  });

  test('stopped branch starts, touches file, then stops when setup is needed', async () => {
    vi.mocked(ROSETTA_PROVISIONER_MOCK.needsRosettaEnableFile).mockResolvedValue(true);

    await extension.createMachine(createMachineBaseParams, podmanConfiguration);

    const execCalls = vi.mocked(extensionApi.process.exec).mock.calls;
    const startCalls = execCalls.filter(c => (c[1] as string[]).includes('start'));
    const stopCalls = execCalls.filter(c => (c[1] as string[]).includes('stop'));
    const sshTouchCalls = execCalls.filter(
      c => (c[1] as string[]).includes('ssh') && (c[1] as string[]).some(a => a.includes('enable-rosetta')),
    );

    expect(startCalls.length).toBeGreaterThanOrEqual(1);
    expect(stopCalls.length).toBeGreaterThanOrEqual(1);
    expect(sshTouchCalls.length).toBe(1);
  });
});

test('test checkDefaultMachine - if there is no machine marked as default, take the default system connection to retrieve it. Prompt as it is not running', async () => {
  // Create fake of MachineJSON
  const fakeJSON: MachineJSON[] = fakeMachineJSON;
  fakeJSON[1].Default = false;

  const fakeConnectionJSON: ConnectionJSON[] = [
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

  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: JSON.stringify(fakeConnectionJSON),
  } as extensionApi.RunResult);

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
  const fakeJSON: MachineJSON[] = fakeMachineJSON;
  fakeJSON[1].Default = false;

  const fakeConnectionJSON: ConnectionJSON[] = [
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

  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: JSON.stringify(fakeConnectionJSON),
  } as extensionApi.RunResult);

  await extension.checkDefaultMachine(fakeJSON);
  expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
});

test('test checkDefaultMachine - if user wants to change default machine, check if it is rootful and update connection', async () => {
  const fakeInspectJSON = [
    {
      Name: 'podman-machine-default',
      Rootful: true,
    },
  ];
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stdout: JSON.stringify(fakeInspectJSON),
  } as extensionApi.RunResult);
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stdout: JSON.stringify(fakeMachineInfoJSON),
  } as extensionApi.RunResult);

  vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Yes');

  vi.mocked(fs.existsSync).mockReturnValue(true);

  const infoContentJSON = {
    Rootful: true,
  };
  vi.mocked(fs.promises.readFile).mockResolvedValue(JSON.stringify(infoContentJSON));

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(vi.mocked(extensionApi.process.exec)).toHaveBeenCalledWith(
    podmanCli.getPodmanCli(),
    ['system', 'connection', 'default', `${machineDefaultName}-root`],
    {
      env: {
        CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
      },
    },
  );
  expect(vi.mocked(extensionApi.process.exec)).toHaveBeenCalledWith(
    podmanCli.getPodmanCli(),
    ['machine', 'inspect', machineDefaultName],
    {
      env: {
        CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
      },
    },
  );
});

test('test checkDefaultMachine - if user wants to change machine, check that it only change the connection once if it is rootless', async () => {
  const fakeInspectJSON = [
    {
      Name: 'podman-machine-default',
      Rootful: false,
    },
  ];
  // return as inspect result a rootless machine
  vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
    stdout: JSON.stringify(fakeInspectJSON),
  } as extensionApi.RunResult);

  const spyPrompt = vi.spyOn(extensionApi.window, 'showInformationMessage');
  spyPrompt.mockResolvedValue('Yes');

  vi.mocked(fs.existsSync).mockReturnValue(true);

  const infoContentJSON = {
    Rootful: false,
  };
  const spyReadFile = vi.spyOn(fs.promises, 'readFile');
  spyReadFile.mockResolvedValue(JSON.stringify(infoContentJSON));

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(vi.mocked(extensionApi.process.exec)).toHaveBeenCalledWith(
    podmanCli.getPodmanCli(),
    ['system', 'connection', 'default', machineDefaultName],
    {
      env: {
        CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
      },
    },
  );
  expect(vi.mocked(extensionApi.process.exec)).toHaveBeenCalledWith(
    podmanCli.getPodmanCli(),
    ['machine', 'inspect', machineDefaultName],
    {
      env: {
        CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
      },
    },
  );
});

test('test checkDefaultMachine - if user wants to change machine, check that it only changes to rootless as machine inspect is not returning Rootful field (old versions of podman)', async () => {
  const fakeInspectJSON = [
    {
      Name: 'podman-machine-default',
    },
  ];

  const inspectCall = vi
    .mocked(extensionApi.process.exec)
    .mockResolvedValueOnce({
      stdout: JSON.stringify(fakeMachineInfoJSON),
    } as extensionApi.RunResult)
    .mockResolvedValueOnce({
      stdout: JSON.stringify(fakeInspectJSON),
    } as extensionApi.RunResult);

  const spyPrompt = vi.mocked(extensionApi.window.showInformationMessage);
  spyPrompt.mockResolvedValue('Yes');

  vi.mocked(fs.existsSync).mockReturnValue(false);

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(inspectCall).toHaveBeenCalledWith(
    podmanCli.getPodmanCli(),
    ['system', 'connection', 'default', machineDefaultName],
    {
      env: {
        CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
      },
    },
  );
  expect(inspectCall).toHaveBeenCalledWith(podmanCli.getPodmanCli(), ['machine', 'inspect', machineDefaultName], {
    env: {
      CONTAINERS_MACHINE_PROVIDER: VMTYPE.LIBKRUN,
    },
  });
});

test('test checkDefaultMachine, if the default connection is not in sync with the default machine, the function will prompt', async () => {
  const fakeConnectionJSON: ConnectionJSON[] = [
    {
      Name: machineDefaultName,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: true,
    },
    {
      Name: `${machineDefaultName}-root`,
      URI: 'uri',
      Identity: 'id',
      IsMachine: true,
      Default: false,
    },
  ];

  const fakeMachineJSON = [
    {
      Name: machineDefaultName,
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];

  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify(fakeConnectionJSON),
          } as extensionApi.RunResult);
        }
      }),
  );

  await extension.checkDefaultMachine(fakeMachineJSON);

  expect(extensionApi.window.showInformationMessage).toBeCalledWith(
    `Rootful Podman Machine '${machineDefaultName}' does not match default connection. This will cause podman CLI errors while trying to connect to '${machineDefaultName}'. Do you want to update the default connection?`,
    'Yes',
    'Ignore',
    'Cancel',
  );
});

test('ensure started machine reports default configuration', async () => {
  vi.mocked(extensionApi.env).isLinux = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);
  expect(config.update).toHaveBeenNthCalledWith(1, 'machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toHaveBeenNthCalledWith(2, 'machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toHaveBeenNthCalledWith(3, 'machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toHaveBeenNthCalledWith(4, 'machine.cpusUsage', 0);
  expect(config.update).toHaveBeenNthCalledWith(5, 'machine.memoryUsage', 0);
  expect(config.update).toHaveBeenNthCalledWith(6, 'machine.diskSizeUsage', 0);
  expect(config.update).toHaveBeenNthCalledWith(7, 'machine.rootful', true);
});

test('ensure stopped machine reports stopped provider', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isMac = true;
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          const fakeStoppedMachine = JSON.parse(JSON.stringify(fakeMachineJSON[0]));
          fakeStoppedMachine.Running = false;

          resolve({ stdout: JSON.stringify([fakeStoppedMachine]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);

  expect(provider.updateStatus).toBeCalledWith('configured');
  expect(extension.podmanMachinesStatuses.get('podman-machine-default')).toBe('stopped');
});

test('ensure running and starting machine reports starting provider', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isMac = true;
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          const fakeStoppedMachine = JSON.parse(JSON.stringify(fakeMachineJSON[0]));
          fakeStoppedMachine.Running = true;
          fakeStoppedMachine.Starting = true;

          resolve({ stdout: JSON.stringify([fakeStoppedMachine]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);

  expect(provider.updateStatus).toBeCalledWith('starting');
  expect(extension.podmanMachinesStatuses.get('podman-machine-default')).toBe('starting');
});

test('ensure running and not starting machine reports ready provider', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isMac = true;
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          const fakeStoppedMachine = JSON.parse(JSON.stringify(fakeMachineJSON[0]));
          fakeStoppedMachine.Running = true;
          fakeStoppedMachine.Starting = false;

          resolve({ stdout: JSON.stringify([fakeStoppedMachine]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({} as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);

  expect(provider.updateStatus).toBeCalledWith('ready');
  expect(extension.podmanMachinesStatuses.get('podman-machine-default')).toBe('started');
});

test('ensure started machine reports configuration', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: false }]),
          } as unknown as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);
  (extensionApi.containerEngine.info as Mock).mockResolvedValue({
    cpus: 2,
    cpuIdle: 99,
    memory: 1048000000,
    memoryUsed: 524000000,
    diskSize: 250000000000,
    diskUsed: 50000000000,
  } as ContainerEngineInfo);
  await extension.updateMachines(provider, podmanConfiguration);
  expect(config.update).toBeCalledWith('machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toBeCalledWith('machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toBeCalledWith('machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toBeCalledWith('machine.cpusUsage', 1);
  expect(config.update).toBeCalledWith('machine.memoryUsage', 50);
  expect(config.update).toBeCalledWith('machine.diskSizeUsage', 20);
  expect(config.update).toBeCalledWith('machine.rootful', false);
});

test('ensure stopped machine reports configuration', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.mocked(extensionApi.env).isLinux = true;
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[1]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[1].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'system' && args?.[1] === 'connection' && args?.[2] === 'list') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[1].Name, Default: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === '--version') {
          resolve({ stdout: 'podman version 4.9.0' } as extensionApi.RunResult);
        }
      }),
  );

  await extension.updateMachines(provider, podmanConfiguration);
  expect(config.update).toBeCalledWith('machine.cpus', fakeMachineJSON[0].CPUs);
  expect(config.update).toBeCalledWith('machine.memory', Number(fakeMachineJSON[0].Memory));
  expect(config.update).toBeCalledWith('machine.diskSize', Number(fakeMachineJSON[0].DiskSize));
  expect(config.update).toBeCalledWith('machine.cpusUsage', 0);
  expect(config.update).toBeCalledWith('machine.memoryUsage', 0);
  expect(config.update).toBeCalledWith('machine.diskSizeUsage', 0);
  expect(config.update).toBeCalledWith('machine.rootful', true);
});

test('ensure showNotification is not called during update', async () => {
  const showNotificationMock = vi.spyOn(extensionApi.window, 'showNotification');
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          reject(new Error('error'));
        } else if (args?.[0] === '--version') {
          resolve({} as extensionApi.RunResult);
        }
      }),
  );

  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    {} as unknown as extensionApi.ProviderCleanup,
    PODMAN_BINARY_MOCK,
  );
  vi.spyOn(podmanInstall, 'checkForUpdate').mockImplementation((_installedPodman: InstalledPodman | undefined) => {
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

  vi.spyOn(podmanCli, 'findPodmanInstallations').mockResolvedValue(['/usr/local/bin/podman']);

  let updater: extensionApi.ProviderUpdate | undefined;
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
  expect(updater?.version).equal('v1.2');

  // run the updater (it will sleep for 500ms before returning and resetting the shouldNotifySetup flag
  // run the updateMachine which should not call the showNotification func because shouldNotifySetup is false
  updater?.update({} as extensionApi.Logger).catch(() => {});
  await extension.updateMachines(provider, podmanConfiguration);

  expect(showNotificationMock).not.toBeCalled();

  // wait 500ms so that the updater is complete and shouldNotifySetup reset. Call again the updateMachines func, this time the showNotification is called
  // as there is no update in progress
  await new Promise(resolve => setTimeout(resolve, 500));
  await extension.updateMachines(provider, podmanConfiguration);

  expect(showNotificationMock).toBeCalled();
});

test('should not register update when there are multiple Podman installations', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);

  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    undefined,
    PODMAN_BINARY_MOCK,
  );
  const findPodmanInstallationsMock = vi.spyOn(podmanCli, 'findPodmanInstallations');

  // Mock multiple installations
  findPodmanInstallationsMock.mockResolvedValue([
    '/usr/local/bin/podman',
    '/opt/homebrew/bin/podman',
    '/usr/bin/podman',
  ]);

  vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
    hasUpdate: true,
    bundledVersion: 'v5.0.0',
    installedVersion: 'v4.9.0',
  });

  const installedPodman = { version: '4.9.0' } as InstalledPodman;

  await extension.registerUpdatesIfAny(provider, installedPodman, podmanInstall);

  expect(findPodmanInstallationsMock).toHaveBeenCalled();
  expect(registerUpdateMock).not.toHaveBeenCalled();
});

test('should register update when there is single Podman installation', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);

  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    undefined,
    PODMAN_BINARY_MOCK,
  );
  const findPodmanInstallationsMock = vi.spyOn(podmanCli, 'findPodmanInstallations');

  // Mock single installation
  findPodmanInstallationsMock.mockResolvedValue(['/usr/local/bin/podman']);

  vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
    hasUpdate: true,
    bundledVersion: 'v5.0.0',
    installedVersion: 'v4.9.0',
  });

  const installedPodman = { version: '4.9.0' } as InstalledPodman;

  await extension.registerUpdatesIfAny(provider, installedPodman, podmanInstall);

  expect(findPodmanInstallationsMock).toHaveBeenCalled();
  expect(registerUpdateMock).toHaveBeenCalled();
});

test('should register update when there are multiple Podman installations but custom binary path is set', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);

  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    undefined,
    PODMAN_BINARY_MOCK,
  );
  const findPodmanInstallationsMock = vi.spyOn(podmanCli, 'findPodmanInstallations');
  vi.spyOn(podmanCli, 'getCustomBinaryPath').mockReturnValue('/custom/path/podman');

  // Mock multiple installations
  findPodmanInstallationsMock.mockResolvedValue([
    '/usr/local/bin/podman',
    '/opt/homebrew/bin/podman',
    '/usr/bin/podman',
  ]);

  vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
    hasUpdate: true,
    bundledVersion: 'v5.0.0',
    installedVersion: 'v4.9.0',
  });

  const installedPodman = { version: '4.9.0' } as InstalledPodman;

  await extension.registerUpdatesIfAny(provider, installedPodman, podmanInstall);

  expect(findPodmanInstallationsMock).not.toHaveBeenCalled();
  expect(registerUpdateMock).toHaveBeenCalled();
});

test('update should be wrapped with withProgress to create a visible task', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);

  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    undefined,
    PODMAN_BINARY_MOCK,
  );

  vi.spyOn(podmanCli, 'findPodmanInstallations').mockResolvedValue(['/usr/local/bin/podman']);

  vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
    hasUpdate: true,
    bundledVersion: 'v5.0.0',
    installedVersion: 'v4.9.0',
  });

  vi.spyOn(podmanInstall, 'performUpdate').mockResolvedValue();

  const withProgressSpy = vi.spyOn(extensionApi.window, 'withProgress');

  const installedPodman = { version: '4.9.0' } as InstalledPodman;

  let updater: extensionApi.ProviderUpdate | undefined;
  registerUpdateMock.mockImplementation((update: extensionApi.ProviderUpdate) => {
    updater = update;
  });

  await extension.registerUpdatesIfAny(provider, installedPodman, podmanInstall);

  expect(registerUpdateMock).toHaveBeenCalled();
  expect(updater).toBeDefined();

  // Call the update function
  await updater?.update({} as extensionApi.Logger);

  // Verify withProgress was called with correct parameters
  expect(withProgressSpy).toHaveBeenCalledWith(
    { location: extensionApi.ProgressLocation.TASK_WIDGET, title: 'Updating Podman' },
    expect.any(Function),
  );

  // Verify performUpdate was called
  expect(podmanInstall.performUpdate).toHaveBeenCalledWith(provider, installedPodman);
});

test('provider is registered with edit capabilities on MacOS', async () => {
  // Mock platform to be darwin
  vi.mocked(extensionApi.env).isMac = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else {
          reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
        }
      }),
  );
  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.lifecycle).toBeDefined();
  expect(registeredConnection?.lifecycle?.edit).toBeDefined();
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_CPU, true);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_MEMORY, true);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_DISK_SIZE, true);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_ROOTFUL, true);
});

test('does not reuse a machine LastUp after a stop and restart', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const lastUp = '2025-02-01T10:00:00.000Z';
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({
    stdout: JSON.stringify([{ Name: machineInfo.name, LastUp: lastUp }]),
  } as extensionApi.RunResult);

  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  extension.podmanMachinesStatuses.set(machineInfo.name, 'started');

  await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');

  if (!registeredConnection || typeof registeredConnection.started !== 'function') {
    throw new Error('Expected the registered connection to provide a started accessor');
  }
  expect(registeredConnection.started()).toBe(lastUp);
  updateProviderStatus(provider, 'stopped', machineInfo.name);
  updateProviderStatus(provider, 'started', machineInfo.name);
  expect(registeredConnection.started()).toBeUndefined();
});

test('display name is beautified version of the name', async () => {
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else {
          reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
        }
      }),
  );
  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(
    provider,
    podmanConfiguration,
    {
      ...machineInfo,
      name: machineDefaultName,
    },
    'socket',
  );
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.displayName).toBe('Podman Machine');
  expect(registeredConnection?.name).toBe(machineDefaultName);
});

test('provider is registered with limited edit capabilities on (non-HyperV) Windows', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'set') {
          resolve({
            stdout: '',
          } as extensionApi.RunResult);
        } else {
          reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
        }
      }),
  );
  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.lifecycle).toBeDefined();
  expect(registeredConnection?.lifecycle?.edit).toBeDefined();
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_CPU, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_MEMORY, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_DISK_SIZE, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_ROOTFUL, true);
});

test('provider is registered with limited edit capabilities on (HyperV) Windows', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'set') {
          resolve({
            stdout: '',
          } as extensionApi.RunResult);
        } else {
          reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
        }
      }),
  );
  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });

  await extension.registerProviderFor(
    provider,
    podmanConfiguration,
    { ...machineInfo, vmType: VMTYPE.HYPERV },
    'socket',
  );
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.lifecycle).toBeDefined();
  expect(registeredConnection?.lifecycle?.edit).toBeDefined();
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_CPU, true);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_MEMORY, true);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_DISK_SIZE, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_ROOTFUL, true);

  await registeredConnection?.lifecycle?.edit?.({} as unknown as extensionApi.LifecycleContext, {
    'podman.machine.cpus': 1,
    'podman.machine.memory': 2,
    'podman.machine.diskSize': 3,
    'podman.machine.rootful': true,
  });
  expect(spyExecPromise).toBeCalledWith(
    'podman.exe',
    expect.arrayContaining(['machine', 'set', machineInfo.name, '--rootful=true']),
    expect.any(Object),
  );
});

describe('edit lifecycle importNativeCA', () => {
  function mockExecForMachineEdit() {
    const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
    spyExecPromise.mockImplementation(
      (_command, args) =>
        new Promise<extensionApi.RunResult>((resolve, reject) => {
          if (args?.[0] === 'machine' && args?.[1] === 'list') {
            resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
          } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
            resolve({
              stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
            } as extensionApi.RunResult);
          } else if (args?.[0] === 'machine' && args?.[1] === 'set') {
            resolve({ stdout: '' } as extensionApi.RunResult);
          } else {
            reject(new Error('unexpected command'));
          }
        }),
    );
    return spyExecPromise;
  }

  function mockRegisterConnection() {
    let registeredConnection: ContainerProviderConnection | undefined;
    vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
      registeredConnection = connection;
      return Disposable.from({ dispose: () => {} });
    });
    return () => registeredConnection;
  }

  test.each([
    { importNativeCA: true, expectedArg: '--import-native-ca=true' },
    { importNativeCA: false, expectedArg: '--import-native-ca=false' },
  ])('passes --import-native-ca=$importNativeCA when Podman >= 6', async ({ importNativeCA, expectedArg }) => {
    vi.mocked(extensionApi.env).isMac = true;
    extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.0.0' } as InstalledPodman);
    const spyExecPromise = mockExecForMachineEdit();
    const getConnection = mockRegisterConnection();

    await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
    expect(getConnection()?.lifecycle?.edit).toBeDefined();
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_EDIT_IMPORT_NATIVE_CA, true);

    await getConnection()?.lifecycle?.edit?.({} as unknown as extensionApi.LifecycleContext, {
      'podman.machine.importNativeCA': importNativeCA,
    });
    expect(spyExecPromise).toBeCalledWith(
      expect.any(String),
      expect.arrayContaining(['machine', 'set', machineInfo.name, expectedArg]),
      expect.any(Object),
    );
  });

  test('does not pass --import-native-ca when Podman < 6', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '5.3.0' } as InstalledPodman);
    const spyExecPromise = mockExecForMachineEdit();
    const getConnection = mockRegisterConnection();

    await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_EDIT_IMPORT_NATIVE_CA, false);

    await getConnection()?.lifecycle?.edit?.({} as unknown as extensionApi.LifecycleContext, {
      'podman.machine.importNativeCA': true,
    });
    expect(spyExecPromise).not.toBeCalledWith(
      expect.any(String),
      expect.arrayContaining(['--import-native-ca=true']),
      expect.any(Object),
    );
  });
});

test.each([
  {
    description: 'telemetry is tracked when rootful is set to true',
    inspectRootful: false,
    editParams: { 'podman.machine.rootful': true },
    expectedTelemetry: { event: 'podman.machine.edit.rootful', data: { isRootful: true } },
  },
  {
    description: 'telemetry is tracked when rootful is set to false',
    inspectRootful: false,
    editParams: { 'podman.machine.rootful': false },
    expectedTelemetry: { event: 'podman.machine.edit.rootful', data: { isRootful: false } },
  },
  {
    description: 'telemetry is not tracked when other settings are changed without rootful',
    inspectRootful: true,
    editParams: { 'podman.machine.cpus': '4', 'podman.machine.memory': '2048' },
    expectedTelemetry: undefined,
  },
])('$description', async ({ inspectRootful, editParams, expectedTelemetry }) => {
  vi.mocked(extensionApi.env).isMac = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: inspectRootful }]),
          } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'set') {
          resolve({
            stdout: '',
          } as extensionApi.RunResult);
        } else {
          reject(new Error('Unexpected command'));
        }
      }),
  );

  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });

  await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.lifecycle?.edit).toBeDefined();

  vi.mocked(telemetryLogger.logUsage).mockClear();

  await registeredConnection?.lifecycle?.edit?.({} as unknown as extensionApi.LifecycleContext, editParams);

  if (expectedTelemetry) {
    expect(telemetryLogger.logUsage).toHaveBeenCalledWith(expectedTelemetry.event, expectedTelemetry.data);
  } else {
    expect(telemetryLogger.logUsage).not.toHaveBeenCalled();
  }
});

test('provider is registered without edit capabilities on Linux', async () => {
  vi.mocked(extensionApi.env).isLinux = true;
  extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockImplementation(
    (_command, args) =>
      new Promise<extensionApi.RunResult>((resolve, reject) => {
        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
        } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
          resolve({
            stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
          } as extensionApi.RunResult);
        } else {
          reject(new Error('wsl bootstrap script failed: exit status 0xffffffff'));
        }
      }),
  );
  let registeredConnection: ContainerProviderConnection | undefined;
  vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
    registeredConnection = connection;
    return Disposable.from({ dispose: () => {} });
  });
  await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
  expect(registeredConnection).toBeDefined();
  expect(registeredConnection?.lifecycle).toBeDefined();
  expect(registeredConnection?.lifecycle?.edit).toBeUndefined();
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_CPU, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_MEMORY, false);
  expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_EDIT_DISK_SIZE, false);
});

describe('connection error property on lifecycle methods', () => {
  let registeredConnection: ContainerProviderConnection | undefined;
  const spySetup = () => {
    extension.initExtensionContext({ subscriptions: [] } as unknown as extensionApi.ExtensionContext);
    vi.mocked(provider.registerContainerProviderConnection).mockImplementation(connection => {
      registeredConnection = connection;
      return Disposable.from({ dispose: () => {} });
    });
  };

  const registerConnection = async () => {
    const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
    spyExecPromise.mockImplementation(
      (_command, args) =>
        new Promise<extensionApi.RunResult>((resolve, reject) => {
          if (args?.[0] === 'machine' && args?.[1] === 'list') {
            resolve({ stdout: JSON.stringify([fakeMachineJSON[0]]) } as extensionApi.RunResult);
          } else if (args?.[0] === 'machine' && args?.[1] === 'inspect') {
            resolve({
              stdout: JSON.stringify([{ Name: fakeMachineJSON[0].Name, Rootful: true }]),
            } as extensionApi.RunResult);
          } else {
            reject(new Error('command failed'));
          }
        }),
    );
    await extension.registerProviderFor(provider, podmanConfiguration, machineInfo, 'socket');
    return spyExecPromise;
  };

  test('start lifecycle clears error on success', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    registeredConnection!.error = 'previous error';
    await registeredConnection?.lifecycle?.start?.({} as extensionApi.LifecycleContext);
    expect(registeredConnection!.error).toBeUndefined();
  });

  test('start lifecycle sets error on failure', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockRejectedValue(new Error('start failed'));
    await expect(registeredConnection?.lifecycle?.start?.({} as extensionApi.LifecycleContext)).rejects.toThrow(
      'start failed',
    );
    expect(registeredConnection!.error).toBe('start failed');
  });

  test('stop lifecycle clears error on success', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    registeredConnection!.error = 'previous error';
    await registeredConnection?.lifecycle?.stop?.({} as extensionApi.LifecycleContext);
    expect(registeredConnection!.error).toBeUndefined();
  });

  test('stop lifecycle sets error on failure', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockRejectedValue(new Error('stop failed'));
    await expect(registeredConnection?.lifecycle?.stop?.({} as extensionApi.LifecycleContext)).rejects.toThrow(
      'stop failed',
    );
    expect(registeredConnection!.error).toBe('stop failed');
  });

  test('delete lifecycle clears error on success', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
    registeredConnection!.error = 'previous error';
    await registeredConnection?.lifecycle?.delete?.();
    expect(registeredConnection!.error).toBeUndefined();
  });

  test('delete lifecycle sets error on failure', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    spySetup();
    await registerConnection();
    expect(registeredConnection).toBeDefined();

    vi.spyOn(extensionApi.process, 'exec').mockRejectedValue(new Error('delete failed'));
    await expect(registeredConnection?.lifecycle?.delete?.()).rejects.toThrow('delete failed');
    expect(registeredConnection!.error).toBe('delete failed');
  });
});

test('Even with getJSONMachineList erroring, do not show setup notification on Linux', async () => {
  vi.mocked(extensionApi.env).isLinux = true;
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue({
    name: 'name',
    message: 'description',
    stderr: 'error',
  });
  await extension.updateMachines(provider, podmanConfiguration);
  expect(extensionApi.window.showNotification).not.toBeCalled();
});

test('If machine list is empty, do not show setup notification on Linux', async () => {
  vi.mocked(extensionApi.env).isLinux = true;
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockResolvedValue({ stdout: '[]' } as extensionApi.RunResult);
  await extension.updateMachines(provider, podmanConfiguration);
  expect(extensionApi.window.showNotification).not.toBeCalled();
});

test('if there are no machines, make sure checkDefaultMachine is not being ran inside updateMachines', async () => {
  const spyCheckDefaultMachine = vi.spyOn(extension, 'checkDefaultMachine');
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({ stdout: '[]' } as extensionApi.RunResult);
  await extension.updateMachines(provider, podmanConfiguration);
  expect(spyCheckDefaultMachine).not.toBeCalled();
});

test('Should notify clean machine if getJSONMachineList is erroring due to an invalid format on mac', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue({
    name: 'name',
    message: 'description',
    stderr: 'cannot unmarshal string',
  });
  await extension.updateMachines(provider, podmanConfiguration);
  expect(extensionApi.window.showNotification).toBeCalled();
  expect(extensionApi.context.setValue).toBeCalledWith(CLEANUP_REQUIRED_MACHINE_KEY, true);
});

test('No updates of machines in parallel', async () => {
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(extensionApi.env).isMac = true;
  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec');
  spyExecPromise.mockResolvedValue({ stdout: '[]' } as extensionApi.RunResult);

  const updateMachines1 = extension.updateMachines(provider, podmanConfiguration);
  const updateMachines2 = extension.updateMachines(provider, podmanConfiguration);

  await updateMachines1;

  // only call once as no parallel
  const podmanMachineListCalls = spyExecPromise.mock.calls.filter(
    call => call[0] === 'podman' && JSON.stringify(call[1]) === JSON.stringify(['machine', 'list', '--format', 'json']),
  );
  expect(podmanMachineListCalls.length).toBe(1);

  // wait the second call
  await updateMachines2;
  const podmanMachineListAfterCalls = spyExecPromise.mock.calls.filter(
    call => call[0] === 'podman' && JSON.stringify(call[1]) === JSON.stringify(['machine', 'list', '--format', 'json']),
  );
  expect(podmanMachineListAfterCalls.length).toBe(2);
});

describe('initCheckAndRegisterUpdate', () => {
  test('check there is an update', async () => {
    const podmanInstall = {
      checkForUpdate: vi.fn(),
    } as unknown as PodmanInstall;

    // disposable
    const disposeMock = vi.fn();
    registerUpdateMock.mockReturnValue({
      dispose: disposeMock,
    });

    // First call, installed is 4 and we can bump to v5
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: true,
      installedVersion: '4.0',
      bundledVersion: '5.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 1.0.0',
    } as unknown as extensionApi.RunResult);

    await initCheckAndRegisterUpdate(provider, podmanInstall);

    // check that we call registerUpdate on the provider
    expect(registerUpdateMock).toBeCalledWith({
      preflightChecks: expect.any(Function),
      update: expect.any(Function),
      version: '5.0',
    });

    // check not disposed
    expect(disposeMock).not.toBeCalled();

    // clear mock
    registerUpdateMock.mockClear();

    // ok now we mock the same bundled version (no update)
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: false,
      installedVersion: '5.0',
      bundledVersion: '5.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 5.0.0',
    } as unknown as extensionApi.RunResult);

    // check again the update
    await initCheckAndRegisterUpdate(provider, podmanInstall);

    // check that registerUpdateMock is not called as there is no update available from 5.0 to 5.0
    expect(registerUpdateMock).not.toBeCalled();

    // and the previous disposable should have been disposed
    expect(disposeMock).toBeCalled();
  });

  test('check there is no update', async () => {
    const podmanInstall = {
      checkForUpdate: vi.fn(),
    } as unknown as PodmanInstall;

    // First call, installed is 4 and we can bump to v5
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: false,
      installedVersion: '4.0',
      bundledVersion: '5.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 1.1',
    } as unknown as extensionApi.RunResult);

    await initCheckAndRegisterUpdate(provider, podmanInstall);

    // check that we call registerUpdate on the provider
    expect(registerUpdateMock).not.toBeCalled();
  });

  test('check update disappear after creating a podman machine', async () => {
    const podmanInstall = {
      checkForUpdate: vi.fn(),
    } as unknown as PodmanInstall;

    // disposable
    const disposeMock = vi.fn();
    registerUpdateMock.mockReturnValue({
      dispose: disposeMock,
    });

    // First call, installed is 4 and we can bump to v5
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: true,
      installedVersion: '4.0',
      bundledVersion: '5.0',
    });

    // mock the event
    let listener: ((event: extensionApi.RegisterContainerConnectionEvent) => void) | undefined;

    vi.mocked(extensionApi.provider.onDidRegisterContainerConnection).mockImplementation(func => {
      listener = func;
      return { dispose: (): void => {} };
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 1.1',
    } as unknown as extensionApi.RunResult);

    vi.spyOn(podmanCli, 'findPodmanInstallations').mockResolvedValue(['/usr/local/bin/podman']);

    await initCheckAndRegisterUpdate(provider, podmanInstall);

    // check that we call registerUpdate on the provider
    expect(registerUpdateMock).toBeCalledWith({
      preflightChecks: expect.any(Function),
      update: expect.any(Function),
      version: '5.0',
    });

    // check not disposed
    expect(disposeMock).not.toBeCalled();

    // clear mock
    registerUpdateMock.mockClear();

    const event: extensionApi.RegisterContainerConnectionEvent = {
      providerId: provider.id,
    } as unknown as extensionApi.RegisterContainerConnectionEvent;

    // ok now we mock v4 as there is no machine
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: false,
      installedVersion: '4.0',
      bundledVersion: '4.0',
    });

    expect(listener).toBeDefined();
    // call listener
    listener?.(event);

    // check that registerUpdateMock is not called as there is no update available from 4.0 to 5.0 as there is a machine
    expect(registerUpdateMock).not.toBeCalled();

    // and the previous disposable should have been disposed
    expect(disposeMock).toBeCalled();
  });

  test('check update appear after updating the version', async () => {
    const podmanInstall = {
      checkForUpdate: vi
        .fn()
        .mockResolvedValue({ installedVersion: undefined, hasUpdate: false, bundledVersion: undefined }),
    } as unknown as PodmanInstall;

    // disposable
    const disposeMock = vi.fn();
    registerUpdateMock.mockReturnValue({
      dispose: disposeMock,
    });

    let func = async (_s: string): Promise<void> => {};
    vi.mocked(provider.onDidUpdateVersion).mockImplementation((f: (_s: string) => Promise<void>) => {
      func = f;
      return { dispose: (): void => {} };
    });

    // fake missing
    vi.mocked(extensionApi.process.exec).mockRejectedValueOnce('');

    await initCheckAndRegisterUpdate(provider, podmanInstall);

    // check that registerUpdateMock is not called as there is no update available from 4.0 to 5.0 as there is a machine
    expect(registerUpdateMock).not.toBeCalled();

    // installed is 4 and we can bump to v5
    vi.mocked(podmanInstall.checkForUpdate).mockResolvedValueOnce({
      hasUpdate: true,
      installedVersion: '4.0',
      bundledVersion: '5.0',
    });

    // fake external installation of v1.1
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 4.0',
    } as unknown as extensionApi.RunResult);

    expect(PODMAN_BINARY_MOCK.invalidate).not.toHaveBeenCalled();

    // call the updateVersion
    await func('v1');

    // check that we call registerUpdate on the provider
    expect(registerUpdateMock).toBeCalledWith({
      preflightChecks: expect.any(Function),
      update: expect.any(Function),
      version: '5.0',
    });

    // PodmanBinary cache should be invalidate after on update event
    expect(PODMAN_BINARY_MOCK.invalidate).toHaveBeenCalledOnce();
  });
});

describe('registerOnboardingMachineExistsCommand', () => {
  test('check with error when calling podman machine ls command', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(extensionApi.process.exec).mockRejectedValue(new Error('error'));

    // perform the call
    const disposable = registerOnboardingMachineExistsCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkPodmanMachineExistsCommand',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check called with podman machine exists being false
    expect(extensionApi.context.setValue).toBeCalledWith('podmanMachineExists', false, 'onboarding');
  });

  test('check with 2 machines', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    // return an empty object for the first call
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValueOnce({
      version: '5.2.1',
    });
    // return 2 empty machines for the second call
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[{}, {}]',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingMachineExistsCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkPodmanMachineExistsCommand',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check called with podman machine exists being true as there are 2 machines
    expect(extensionApi.context.setValue).toBeCalledWith('podmanMachineExists', true, 'onboarding');
  });

  test('check with 0 machine', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    // return empty machine array
    vi.mocked(extensionApi.process.exec).mockResolvedValue({ stdout: '[]' } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingMachineExistsCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkPodmanMachineExistsCommand',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check called with podman machine exists being false as there is no machine
    expect(extensionApi.context.setValue).toBeCalledWith('podmanMachineExists', false, 'onboarding');
  });
});

describe('registerOnboardingUnsupportedPodmanMachineCommand', () => {
  test('check with v5 and previous qemu folders', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    // second call to get the machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingUnsupportedPodmanMachineCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkUnsupportedPodmanMachine',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check called with true as there are qemu folders
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedPodmanMachine', true, 'onboarding');
  });

  test('check with v5 and no previous qemu folders', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    // no qemu folders
    vi.mocked(fs.existsSync).mockReturnValue(false);

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    // first call to get the podman version
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 5.0.0',
    } as unknown as extensionApi.RunResult);

    // second call to get the machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingUnsupportedPodmanMachineCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkUnsupportedPodmanMachine',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check it is false as there are no qemu folders
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedPodmanMachine', false, 'onboarding');
  });

  test('check with v4 and qemu folders', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 4.9.3',
    } as unknown as extensionApi.RunResult);

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: 'podman version 4.9.3',
    } as unknown as extensionApi.RunResult);

    // third call to get the machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingUnsupportedPodmanMachineCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkUnsupportedPodmanMachine',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check called with false as there are qemu folders but we're with podman v4
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedPodmanMachine', false, 'onboarding');
  });

  test('check with v5 and error in JSON of machines', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    // no qemu folders
    vi.mocked(fs.existsSync).mockReturnValue(false);

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    // first call to get the podman version
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    // second call to get the machine list
    vi.mocked(extensionApi.process.exec).mockRejectedValue({
      stderr: 'incompatible machine config',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = registerOnboardingUnsupportedPodmanMachineCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.checkUnsupportedPodmanMachine',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check it is false as there are no qemu folders
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedPodmanMachine', true, 'onboarding');
  });
});

describe('registerOnboardingRemoveUnsupportedMachinesCommand', () => {
  test('check with previous qemu folders', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(fs.existsSync).mockReturnValue(true);

    // mock confirmation window message to true
    vi.mocked(extensionApi.window.showWarningMessage).mockResolvedValue('Yes');

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    // perform the call
    const disposable = extension.registerOnboardingRemoveUnsupportedMachinesCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.removeUnsupportedMachines',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // expect rm to be called
    expect(fs.promises.rm).toBeCalledWith(expect.stringContaining('qemu'), {
      recursive: true,
      maxRetries: 3,
      retryDelay: 1000,
    });

    // check called with true as there are qemu folders
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedMachineRemoved', 'ok', 'onboarding');
  });

  test('check with previous podman v4 config files', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    // mock confirmation window message to true
    vi.mocked(extensionApi.window.showWarningMessage).mockResolvedValue('Yes');

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });
    // two times false (no qemu folders)
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);

    // return an error when trying to list output
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
      stderr: 'incompatible machine config',
    } as unknown as extensionApi.RunResult);

    fsPromisesReaddirMock.mockResolvedValue(['foo.json']);

    // mock readfile
    vi.mocked(fs.promises.readFile).mockResolvedValueOnce('{"Driver": "podman"}');

    // perform the call
    const disposable = extension.registerOnboardingRemoveUnsupportedMachinesCommand();

    // checks
    expect(disposable).toBeDefined();

    // check command is called
    expect(extensionApi.commands.registerCommand).toBeCalledWith(
      'podman.onboarding.removeUnsupportedMachines',
      expect.any(Function),
    );

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // expect rm to be called
    expect(fs.promises.rm).toBeCalledWith(expect.stringContaining('foo.json'), {
      recursive: true,
      maxRetries: 3,
      retryDelay: 1000,
    });

    // check called with true as there are qemu folders
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedMachineRemoved', 'ok', 'onboarding');
  });

  test('check with previous podman v4 config files on Windows', async () => {
    vi.mocked(extensionApi.env).isWindows = true;
    vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);

    // mock confirmation window message to true
    vi.mocked(extensionApi.window.showWarningMessage).mockResolvedValue('Yes');

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValueOnce({
      version: '5.0.0',
    });

    // return an error when trying to list output
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    vi.mocked(extensionApi.process.exec).mockRejectedValueOnce({
      stdout: '[]',
      stderr: 'cannot unmarshal string',
    } as unknown as extensionApi.RunResult);

    fsPromisesReaddirMock.mockResolvedValue(['foo.json', 'podman-machine-default.json']);

    // mock readfile
    vi.mocked(fs.promises.readFile).mockResolvedValueOnce('{"Driver": "podman"}');

    // perform the call
    extension.registerOnboardingRemoveUnsupportedMachinesCommand();

    const func = vi.mocked(extensionApi.commands.registerCommand).mock.calls[0][1];
    // call the function
    await func();

    // check that we called wsl --terminate and wsl --unregister
    expect(extensionApi.process.exec).toBeCalledWith('wsl', ['--terminate', 'podman-foo']);
    expect(extensionApi.process.exec).toBeCalledWith('wsl', ['--unregister', 'podman-foo']);
    expect(extensionApi.process.exec).toBeCalledWith('wsl', ['--terminate', 'podman-machine-default']);
    expect(extensionApi.process.exec).toBeCalledWith('wsl', ['--unregister', 'podman-machine-default']);

    // check called with true
    expect(extensionApi.context.setValue).toBeCalledWith('unsupportedMachineRemoved', 'ok', 'onboarding');
  });
});

describe('socketCompatibilityMode command', () => {
  test('check telemetry sent when error on check disguised podman Mac', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    await extension.activate(getContextMock());

    const socketCommand = 'podman.socketCompatibilityMode';

    // check command is called
    expect(extensionApi.commands.registerCommand).toHaveBeenCalledWith(socketCommand, expect.any(Function));

    const func = vi
      .mocked(extensionApi.commands.registerCommand)
      .mock.calls.find(([command]) => command === socketCommand)?.[1];

    assert(func, `${socketCommand} should have been registered`);

    const error = new Error('test error');

    vi.mocked(isDisguisedPodman).mockRejectedValue(error);

    expect(isDisguisedPodman).not.toBeCalled();

    // call the function
    await func();

    expect(isDisguisedPodman).toBeCalled();

    expect(telemetryLogger.logError).toBeCalledWith('checkIfSocketDisguisedFailed', expect.objectContaining({ error }));
    expect(telemetryLogger.logUsage).not.toBeCalled();
  });
});

test('isIncompatibleMachineOutput', () => {
  const emptyResponse = extension.isIncompatibleMachineOutput(undefined);
  expect(emptyResponse).toBeFalsy();

  const unknownErrorResponse = extension.isIncompatibleMachineOutput('unknown error');
  expect(unknownErrorResponse).toBeFalsy();

  const wslErrorResponse = extension.isIncompatibleMachineOutput('cannot unmarshal string');
  expect(wslErrorResponse).toBeTruthy();

  const applehvErrorResponse = extension.isIncompatibleMachineOutput('incompatible machine config');
  expect(applehvErrorResponse).toBeTruthy();
});

test('isWSLServiceError', () => {
  expect(extension.isWSLServiceError(undefined)).toBeFalsy();
  expect(extension.isWSLServiceError('')).toBeFalsy();
  expect(extension.isWSLServiceError('unknown error')).toBeFalsy();
  expect(extension.isWSLServiceError('Wsl/Service/E_UNEXPECTED')).toBeTruthy();
  expect(extension.isWSLServiceError('exit status 0xffffffff')).toBeTruthy();
  expect(extension.isWSLServiceError('WSL_E_DEFAULT_DISTRO_NOT_FOUND')).toBeTruthy();
  expect(extension.isWSLServiceError('Error: Wsl/Service/CreateInstance')).toBeTruthy();
});

test('getJSONMachineList should handle per-provider failure and return partial results', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);
  vi.mocked(WIN_PLATFORM_MOCK.isHyperVEnabled).mockResolvedValue(false);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    return new Promise<extensionApi.RunResult>(resolve => {
      if (command !== 'wsl' && args?.[0] === '--version') {
        resolve({ stdout: 'podman version 5.1.1' } as extensionApi.RunResult);
      }
      if (command === 'wsl') {
        resolve({
          stdout:
            'WSL version: 2.2.5.0\nKernel version: 5.15.90.1\nWSLg version: 1.0.51\nMSRDC version: 1.2.3770\nDirect3D version: 1.608.2-61064218\nDXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp\nWindows version: 10.0.22621.2134',
          stderr: '',
          command: 'command',
        });
      }
      if (command === 'powershell.exe') {
        resolve({ stdout: 'True', stderr: '', command: 'command' });
      }
    });
  });
  vi.spyOn(util, 'execPodman').mockRejectedValue({
    message: 'WSL command failed',
    stderr: 'Wsl/Service/E_UNEXPECTED',
  });

  const result = await extension.getJSONMachineList();
  expect(result.list).toEqual([]);
  expect(result.error).toContain('Wsl/Service/E_UNEXPECTED');
});

test('Should show WSL warning instead of setup notification when WSL service error occurs', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({ stdout: '[]', stderr: '' } as extensionApi.RunResult);
  vi.spyOn(util, 'execPodman').mockRejectedValue({
    message: 'WSL command failed',
    stderr: 'Wsl/Service/E_UNEXPECTED',
  });

  await extension.updateMachines(provider, podmanConfiguration);
  expect(extensionApi.window.showWarningMessage).toBeCalledWith(expect.stringContaining('wsl --shutdown'));
});

test('Should show WSL warning and not setup notification when getJSONMachineList throws with WSL error', async () => {
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockRejectedValue({
    message: 'Wsl/Service/E_UNEXPECTED',
    stderr: 'Wsl/Service/E_UNEXPECTED',
  });

  await expect(extension.updateMachines(provider, podmanConfiguration)).rejects.toThrow();
  expect(extensionApi.window.showWarningMessage).toBeCalledWith(expect.stringContaining('wsl --shutdown'));
  expect(extensionApi.window.showNotification).not.toBeCalled();
});

test('Should show WSL warning only once across multiple updateMachines calls', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({ stdout: '[]', stderr: '' } as extensionApi.RunResult);
  vi.spyOn(util, 'execPodman').mockRejectedValue({
    message: 'WSL command failed',
    stderr: 'Wsl/Service/E_UNEXPECTED',
  });

  await extension.updateMachines(provider, podmanConfiguration);
  await extension.updateMachines(provider, podmanConfiguration);

  expect(extensionApi.window.showWarningMessage).toBeCalledTimes(1);
});

test('Should show setup notification when getJSONMachineList throws with non-WSL error', async () => {
  vi.mocked(extensionApi.env).isLinux = false;
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockRejectedValue({
    message: 'some other error',
    stderr: 'some other error',
  });

  await expect(extension.updateMachines(provider, podmanConfiguration)).rejects.toThrow();
  expect(extensionApi.window.showNotification).toBeCalled();
  expect(extensionApi.window.showWarningMessage).not.toBeCalled();
});

describe('calcPodmanMachineSetting', () => {
  let originalProvider: string | undefined;
  beforeEach(() => {
    originalProvider = process.env.CONTAINERS_MACHINE_PROVIDER;
  });

  afterEach(() => {
    process.env.CONTAINERS_MACHINE_PROVIDER = originalProvider;
  });

  test('setValue to true if OS is MacOS', async () => {
    vi.mocked(extensionApi.env).isWindows = false;
    await extension.calcPodmanMachineSetting();
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_CPU_SUPPORTED_KEY, true);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_MEMORY_SUPPORTED_KEY, true);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_DISK_SUPPORTED_KEY, true);
  });
  test('setValue to true if OS is Windows and uses HyperV', async () => {
    vi.mocked(extensionApi.env).isWindows = true;
    vi.spyOn(WIN_PLATFORM_MOCK, 'isHyperVEnabled').mockResolvedValue(true);

    await extension.calcPodmanMachineSetting();
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_CPU_SUPPORTED_KEY, true);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_MEMORY_SUPPORTED_KEY, true);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_DISK_SUPPORTED_KEY, true);
  });
  test('setValue to true if OS is Windows and uses WSL', async () => {
    vi.mocked(extensionApi.env).isWindows = true;
    vi.spyOn(WIN_PLATFORM_MOCK, 'isHyperVEnabled').mockResolvedValue(false);
    await extension.calcPodmanMachineSetting();
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_CPU_SUPPORTED_KEY, false);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_MEMORY_SUPPORTED_KEY, false);
    expect(extensionApi.context.setValue).toBeCalledWith(PODMAN_MACHINE_DISK_SUPPORTED_KEY, false);
  });
});

test('checkForUpdate func should be called if there is no podman installed', async () => {
  const extensionContext = { subscriptions: [], storagePath: '' } as unknown as extensionApi.ExtensionContext;
  const podmanInstall: PodmanInstall = new PodmanInstall(
    extensionContext,
    telemetryLogger,
    {} as unknown as Installer,
    {} as unknown as extensionApi.ProviderCleanup,
    PODMAN_BINARY_MOCK,
  );

  vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
    installedVersion: undefined,
    hasUpdate: false,
    bundledVersion: undefined,
  });

  await extension.initCheckAndRegisterUpdate(provider, podmanInstall);
  expect(podmanInstall.checkForUpdate).toBeCalledWith(undefined);
});

test('isLibkrunSupported should return false with 5.3.0 on intel', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(arch).mockReturnValue('x64');
  const enabled = extension.isLibkrunSupported('5.3.0');
  expect(enabled).toBeFalsy();
});

test('isLibkrunSupported should return true with prelease older than rc1', async () => {
  vi.mocked(arch).mockReturnValue('arm64');
  vi.mocked(extensionApi.env).isMac = true;
  const enabled = extension.isLibkrunSupported('5.2.0-rc2');
  expect(enabled).toBeTruthy();
});

test('isLibkrunSupported should return true with 5.2.0 version', async () => {
  vi.mocked(arch).mockReturnValue('arm64');
  vi.mocked(extensionApi.env).isMac = true;
  const enabled = extension.isLibkrunSupported('5.2.0');
  expect(enabled).toBeTruthy();
});

test('isLibkrunSupported should return false with previous 5.1.2 version', async () => {
  vi.mocked(arch).mockReturnValue('arm64');
  vi.mocked(extensionApi.env).isMac = true;
  const enabled = extension.isLibkrunSupported('5.1.2');
  expect(enabled).toBeFalsy();
});

describe('isPlaybookMachineInitSupported', () => {
  test('isPlaybookMachineInitSupported should return false with 5.3.0', async () => {
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(arch).mockReturnValue('x64');
    const enabled = extension.isPlaybookMachineInitSupported('5.3.0');
    expect(enabled).toBeFalsy();
  });

  test('isPlaybookMachineInitSupported should return true with 5.4.0 version on Windows/amd', async () => {
    vi.mocked(arch).mockReturnValue('amd64' as NodeJS.Architecture);
    vi.mocked(extensionApi.env).isWindows = true;
    const enabled = extension.isPlaybookMachineInitSupported('5.4.0');
    expect(enabled).toBeTruthy();
  });

  test('isPlaybookMachineInitSupported should return true with 5.4.0 version on arm/mac', async () => {
    vi.mocked(arch).mockReturnValue('arm64');
    vi.mocked(extensionApi.env).isMac = true;
    const enabled = extension.isPlaybookMachineInitSupported('5.4.0');
    expect(enabled).toBeTruthy();
  });
});

describe('sendTelemetryRecords', () => {
  test('krunkit found', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.1.2',
    });
    vi.mocked(PodmanBinaryLocationHelper.prototype.getPodmanLocationMac).mockResolvedValue({
      foundPath: '/opt/podman/bin/podman',
      source: 'installer',
    });
    vi.mocked(KrunkitHelper.prototype.getKrunkitVersion).mockResolvedValue('1.2.3');

    extension.sendTelemetryRecords(
      'evt',
      {
        provider: 'libkrun',
      } as Record<string, unknown>,
      false,
    );
    await waitTelemetryLoggerUsage();
    expect(telemetryLogger.logUsage).toHaveBeenCalledWith(
      'evt',
      expect.objectContaining({
        krunkitPath: '/opt/podman/bin',
        krunkitVersion: '1.2.3',
        podmanCliFoundPath: '/opt/podman/bin/podman',
        podmanCliSource: 'installer',
        podmanCliVersion: '5.1.2',
        provider: 'libkrun',
      }),
    );
  });

  test('krunkit not found', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.1.2',
    });
    vi.mocked(PodmanBinaryLocationHelper.prototype.getPodmanLocationMac).mockResolvedValue({
      foundPath: '/opt/podman/bin/podman',
      source: 'installer',
    });
    vi.mocked(KrunkitHelper.prototype.getKrunkitVersion).mockRejectedValue('command not found');

    extension.sendTelemetryRecords(
      'evt',
      {
        provider: 'libkrun',
      } as Record<string, unknown>,
      false,
    );
    await waitTelemetryLoggerUsage();
    expect(telemetryLogger.logUsage).toHaveBeenCalledWith(
      'evt',
      expect.objectContaining({
        errorKrunkitVersion: 'command not found',
        podmanCliFoundPath: '/opt/podman/bin/podman',
        podmanCliSource: 'installer',
        podmanCliVersion: '5.1.2',
        provider: 'libkrun',
      }),
    );
  });

  test('qemu found', async () => {
    extension.sendTelemetryRecords(
      'evt',
      {
        provider: 'qemu',
      } as Record<string, unknown>,
      false,
    );
    vi.mocked(extensionApi.env).isLinux = true;
    (extensionApi.env.isMac as boolean) = false;
    vi.mocked(extensionApi.env).isWindows = false;

    vi.mocked(QemuHelper.prototype.getQemuVersion).mockResolvedValue('5.5.5');

    await vi.waitFor(() => {
      expect(telemetryLogger.logUsage).toHaveBeenCalledWith(
        'evt',
        expect.objectContaining({
          provider: 'qemu',
          qemuVersion: '5.5.5',
        }),
      );
    });
  });

  test('qemu not found', async () => {
    extension.sendTelemetryRecords(
      'evt',
      {
        provider: 'qemu',
      } as Record<string, unknown>,
      false,
    );
    (extensionApi.env.isLinux as boolean) = true;
    (extensionApi.env.isMac as boolean) = false;
    vi.mocked(extensionApi.env).isWindows = false;

    vi.mocked(QemuHelper.prototype.getQemuVersion).mockRejectedValue('command not found');

    await vi.waitFor(() => {
      expect(telemetryLogger.logUsage).toHaveBeenCalledWith(
        'evt',
        expect.objectContaining({
          provider: 'qemu',
          errorQemuVersion: 'command not found',
        }),
      );
    });
  });
});

test('if a machine stopped is successfully reporting telemetry', async () => {
  vi.mocked(extensionApi.env).isMac = true;

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockResolvedValue({} as extensionApi.RunResult);
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
    version: '5.1.2',
  });
  vi.mocked(PodmanBinaryLocationHelper.prototype.getPodmanLocationMac).mockResolvedValue({
    foundPath: '/opt/podman/bin/podman',
    source: 'installer',
  });
  vi.mocked(KrunkitHelper.prototype.getKrunkitVersion).mockResolvedValue('1.2.3');
  await extension.stopMachine(provider, machineInfo);

  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.stop',
    expect.objectContaining({
      krunkitPath: '/opt/podman/bin',
      krunkitVersion: '1.2.3',
      podmanCliFoundPath: '/opt/podman/bin/podman',
      podmanCliSource: 'installer',
      podmanCliVersion: '5.1.2',
      provider: 'libkrun',
    }),
  );
  expect(spyExecPromise).toBeCalledWith(podmanCli.getPodmanCli(), ['machine', 'stop', 'name'], expect.anything());
});

test('if a machine stopped is successfully reporting an error in telemetry', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  const customError = new Error('Error while starting podman');

  const spyExecPromise = vi.spyOn(extensionApi.process, 'exec').mockImplementation(() => {
    throw customError;
  });
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
    version: '5.1.2',
  });
  vi.mocked(PodmanBinaryLocationHelper.prototype.getPodmanLocationMac).mockResolvedValue({
    foundPath: '/opt/podman/bin/podman',
    source: 'installer',
  });
  vi.mocked(KrunkitHelper.prototype.getKrunkitVersion).mockResolvedValue('1.2.3');
  await expect(extension.stopMachine(provider, machineInfo)).rejects.toThrow(customError.message);

  await waitTelemetryLoggerUsage();

  expect(telemetryLogger.logUsage).toBeCalledWith(
    'podman.machine.stop',
    expect.objectContaining({
      krunkitPath: '/opt/podman/bin',
      krunkitVersion: '1.2.3',
      podmanCliFoundPath: '/opt/podman/bin/podman',
      podmanCliSource: 'installer',
      podmanCliVersion: '5.1.2',
      error: customError,
      provider: 'libkrun',
    }),
  );

  expect(spyExecPromise).toBeCalledWith(podmanCli.getPodmanCli(), ['machine', 'stop', 'name'], expect.anything());
});

test('activate function returns an api implementation', async () => {
  vi.spyOn(PodmanInstall.prototype, 'checkForUpdate').mockResolvedValue({
    hasUpdate: false,
  } as unknown as UpdateCheck);
  const contextMock = getContextMock();
  const api = await extension.activate(contextMock);
  expect(api).toBeDefined();
  expect(typeof api.exec).toBe('function');
});

function mockExtensionForAuditTests() {
  vi.spyOn(PodmanInstall.prototype, 'checkForUpdate').mockResolvedValue({
    hasUpdate: false,
  } as unknown as UpdateCheck);
  const contextMock = getContextMock();
  vi.spyOn(provider, 'setContainerProviderConnectionFactory');
  return contextMock;
}

async function testAudit(path: string, uri: string, condition: typeof expect | typeof expect.not): Promise<void> {
  const contextMock = mockExtensionForAuditTests();
  let auditorInstance: extensionApi.Auditor | undefined;
  vi.mocked(provider.setContainerProviderConnectionFactory).mockImplementation(
    (options: extensionApi.ContainerProviderConnectionFactory, auditor: extensionApi.Auditor | undefined) => {
      auditorInstance = auditor;
      return {
        dispose: () => {},
      };
    },
  );
  await extension.activate(contextMock);
  await vi.waitFor(() => expect(vi.mocked(provider.setContainerProviderConnectionFactory)).toBeCalled());
  expect(auditorInstance).toBeDefined();
  const auditRecords: extensionApi.AuditResult = await auditorInstance!.auditItems({
    'podman.factory.machine.cpus': '2',
    'podman.factory.machine.image': path,
    'podman.factory.machine.image-uri': uri,
    'podman.factory.machine.memory': '1048000000', // 1048MB = 999.45MiB
    'podman.factory.machine.diskSize': '250000000000', // 250GB = 232.83GiB
    'podman.factory.machine.provider': LIBKRUN_LABEL,
  });
  expect(auditRecords.records).toEqual(condition.arrayContaining([expect.objectContaining({ type: 'error' })]));
}

test('activate on mac register commands for setting compatibility moide ', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(extensionApi.env).isWindows = false;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.spyOn(PodmanInstall.prototype, 'checkForUpdate').mockResolvedValue({
    hasUpdate: false,
  } as unknown as UpdateCheck);
  const contextMock = getContextMock();
  // mock getSocketCompatibility
  const disableMock = vi.fn();
  const enableMock = vi.fn();
  const isEnabledMock = vi.fn().mockReturnValue(false);
  const mock = vi.spyOn(compatibilityModeLib, 'getSocketCompatibility');
  mock.mockReturnValue({
    isEnabled: isEnabledMock,
    enable: enableMock,
    disable: disableMock,
    details: '',
    tooltipText: (): string => {
      return '';
    },
  });

  const api = await extension.activate(contextMock);
  expect(api).toBeDefined();

  // expect the command to be registered
  expect(extensionApi.commands.registerCommand).toBeCalledWith('podman.disableCompatibilityMode', expect.any(Function));

  // get the command
  const disableCallcommand = vi
    .mocked(extensionApi.commands.registerCommand)
    .mock.calls?.find(call => call[0] === 'podman.disableCompatibilityMode');
  expect(disableCallcommand).toBeDefined();
  // get the command
  const disableCommand = disableCallcommand?.[1];
  expect(disableCommand).toBeDefined();

  // call the command
  await disableCommand?.();

  // expect the command to be registered
  expect(extensionApi.commands.registerCommand).toBeCalledWith('podman.enableCompatibilityMode', expect.any(Function));

  // expect we have set the context value as well
  expect(extensionApi.context.setValue).toBeCalledWith('podman.podmanDockerCompatibilityEnabled', false);
  expect(disableMock).toBeCalled();

  // now, call the enable command
  const enableCallcommand = vi
    .mocked(extensionApi.commands.registerCommand)
    .mock.calls?.find(call => call[0] === 'podman.enableCompatibilityMode');
  expect(enableCallcommand).toBeDefined();

  // clear the calls
  vi.mocked(extensionApi.context.setValue).mockClear();
  enableMock.mockClear();
  disableMock.mockClear();
  isEnabledMock.mockReturnValue(true);

  // get the command
  const enableCommand = enableCallcommand?.[1];
  expect(enableCommand).toBeDefined();

  // call the command
  await enableCommand?.();

  // expect we have set the context value as well
  expect(extensionApi.context.setValue).toBeCalledWith('podman.podmanDockerCompatibilityEnabled', true);
  expect(enableMock).toBeCalled();
});

describe.each(['windows', 'mac', 'linux'])('podman machine properties audit on %s', os => {
  beforeEach(() => {
    vi.mocked(extensionApi.env).isWindows = os === 'windows';
    vi.mocked(extensionApi.env).isMac = os === 'mac';
    vi.mocked(extensionApi.env).isLinux = os === 'windows';
  });
  if (os === 'linux') {
    test('is not used', async () => {
      vi.mocked(fs.existsSync).mockImplementation((path: fs.PathLike) => {
        if (path.toString().endsWith('/podman/podman.sock')) {
          console.log('========>', path);
          return true;
        }
        return false;
      });
      await extension.activate(mockExtensionForAuditTests());
      await vi.waitFor(() => expect(vi.mocked(provider.setContainerProviderConnectionFactory)).not.toBeCalled());
    });
    return;
  }
  test(`reports error for image path and uri is used at the same time`, async () => {
    await testAudit('path', 'registry/repo/image:version', expect);
  });
  test(`reports no error for image path only is used`, async () => {
    await testAudit('path', '', expect.not);
  });
  test(`reports no error for image uri only is used`, async () => {
    await testAudit('', 'uri', expect.not);
  });
});

test('getJSONMachineList should only get machines from wsl if hyperv is not enabled', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    return new Promise<extensionApi.RunResult>(resolve => {
      if (command !== 'wsl' && args?.[0] === '--version') {
        resolve({
          stdout: 'podman version 5.1.1',
        } as extensionApi.RunResult);
      }
      if (command === 'wsl') {
        resolve({
          stdout:
            'WSL version: 2.2.5.0\nKernel version: 5.15.90.1\nWSLg version: 1.0.51\nMSRDC version: 1.2.3770\nDirect3D version: 1.608.2-61064218\nDXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp\nWindows version: 10.0.22621.2134',
          stderr: '',
          command: 'command',
        });
      }
      if (command === 'powershell.exe') {
        resolve({
          stdout: 'True',
          stderr: '',
          command: 'command',
        });
      }
    });
  });
  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-1',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];
  const execPodmanSpy = vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify(fakeJSON),
    stderr: '',
    command: '',
  });
  await extension.getJSONMachineList();
  expect(execPodmanSpy).toBeCalledWith(['machine', 'list', '--format', 'json'], 'wsl');
});

test('getJSONMachineList should only get machines from hyperv if wsl is not enabled', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(WIN_PLATFORM_MOCK.isHyperVEnabled).mockResolvedValue(true);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    return new Promise<extensionApi.RunResult>(resolve => {
      if (command !== 'wsl' && args?.[0] === '--version') {
        resolve({
          stdout: 'podman version 5.2.1',
        } as extensionApi.RunResult);
      }
      if (command === 'wsl') {
        resolve({
          stdout: 'WSL version: invalid',
          stderr: '',
          command: 'command',
        });
      }
      if (command === 'powershell.exe') {
        resolve({
          stdout: args?.[0] === '@(Get-Service vmms).Status' ? 'Running' : 'True',
          stderr: '',
          command: 'command',
        });
      }
    });
  });
  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-1',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];
  const execPodmanSpy = vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify(fakeJSON),
    stderr: '',
    command: '',
  });
  await extension.getJSONMachineList();
  expect(execPodmanSpy).toBeCalledWith(['machine', 'list', '--format', 'json'], 'hyperv');
});

test('getJSONMachineList should get machines from hyperv and wsl if both are enabled', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);
  vi.mocked(WIN_PLATFORM_MOCK.isHyperVEnabled).mockResolvedValue(true);
  vi.spyOn(extensionApi.process, 'exec').mockImplementation((command, args) => {
    return new Promise<extensionApi.RunResult>(resolve => {
      if (command !== 'wsl' && args?.[0] === '--version') {
        resolve({
          stdout: 'podman version 5.2.1',
        } as extensionApi.RunResult);
      }
      if (command === 'wsl') {
        resolve({
          stdout:
            'WSL version: 2.2.5.0\nKernel version: 5.15.90.1\nWSLg version: 1.0.51\nMSRDC version: 1.2.3770\nDirect3D version: 1.608.2-61064218\nDXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp\nWindows version: 10.0.22621.2134',
          stderr: '',
          command: 'command',
        });
      }
      if (command === 'powershell.exe') {
        resolve({
          stdout: args?.[0] === '@(Get-Service vmms).Status' ? 'Running' : 'True',
          stderr: '',
          command: 'command',
        });
      }
    });
  });
  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-1',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];
  const execPodmanSpy = vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify(fakeJSON),
    stderr: '',
    command: '',
  });
  await extension.getJSONMachineList();
  expect(execPodmanSpy).toHaveBeenNthCalledWith(1, ['machine', 'list', '--format', 'json'], 'wsl');
  expect(execPodmanSpy).toHaveBeenNthCalledWith(2, ['machine', 'list', '--format', 'json'], 'hyperv');
});

describe('isMachineListAllProvidersSupported', () => {
  test.each([
    { version: '6.0.0', expected: true },
    { version: '6.1.0', expected: true },
    { version: '7.0.0', expected: true },
    { version: '5.9.9', expected: false },
    { version: '5.0.0', expected: false },
    { version: '4.0.0', expected: false },
  ])('returns $expected for podman $version', ({ version, expected }) => {
    expect(extension.isMachineListAllProvidersSupported(version)).toBe(expected);
  });
});

test('getJSONMachineList should call podman machine list once without provider for podman >= 6.0 on macOS', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.0.0' });

  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-default',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.APPLEHV,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-libkrun',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.LIBKRUN,
      Port: 456,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];
  const execPodmanSpy = vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify(fakeJSON),
    stderr: '',
    command: '',
  });

  const result = await extension.getJSONMachineList();

  expect(execPodmanSpy).toHaveBeenCalledOnce();
  expect(execPodmanSpy).toHaveBeenCalledWith(['machine', 'list', '--format', 'json'], undefined);
  expect(result.list).toHaveLength(2);
  expect(result.list[0].Name).toBe('podman-machine-default');
  expect(result.list[1].Name).toBe('podman-machine-libkrun');
});

test('getJSONMachineList should call podman machine list once without provider for podman >= 6.0 on Windows', async () => {
  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.1.0' });
  vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);
  vi.mocked(WIN_PLATFORM_MOCK.isHyperVEnabled).mockResolvedValue(true);

  const fakeJSON: MachineJSON[] = [
    {
      Name: 'podman-machine-wsl',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: true,
      Starting: false,
      Default: true,
      VMType: VMTYPE.WSL,
      Port: 123,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
    {
      Name: 'podman-machine-hyperv',
      CPUs: 2,
      Memory: '1048000000',
      DiskSize: '250000000000',
      Running: false,
      Starting: false,
      Default: false,
      VMType: VMTYPE.HYPERV,
      Port: 456,
      RemoteUsername: 'user',
      IdentityPath: '/path/to/key',
    },
  ];
  const execPodmanSpy = vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify(fakeJSON),
    stderr: '',
    command: '',
  });

  const result = await extension.getJSONMachineList();

  expect(execPodmanSpy).toHaveBeenCalledOnce();
  expect(execPodmanSpy).toHaveBeenCalledWith(['machine', 'list', '--format', 'json'], undefined);
  expect(result.list).toHaveLength(2);
});

test('getJSONMachineList should update WSL/HyperV context even for podman >= 6.0 on Windows', async () => {
  // Reset wslAndHypervEnabledContextValue to false so the update triggers setValue
  extension.updateWSLHyperVEnabledContextValue(false);
  vi.clearAllMocks();

  vi.mocked(extensionApi.env).isWindows = true;
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version: '6.0.0' });
  vi.mocked(WIN_PLATFORM_MOCK.isWSLEnabled).mockResolvedValue(true);
  vi.mocked(WIN_PLATFORM_MOCK.isHyperVEnabled).mockResolvedValue(true);

  vi.spyOn(util, 'execPodman').mockResolvedValue({
    stdout: JSON.stringify([]),
    stderr: '',
    command: '',
  });

  await extension.getJSONMachineList();

  expect(extensionApi.context.setValue).toBeCalledWith(WSL_HYPERV_ENABLED_KEY, true);
});

describe('updateWSLHyperVEnabledValue', () => {
  beforeEach(() => {
    extension.updateWSLHyperVEnabledContextValue(true);
    vi.resetAllMocks();
  });
  test('setValue should be called if new value is different than wslAndHypervEnabled', async () => {
    extension.updateWSLHyperVEnabledContextValue(false);
    expect(extensionApi.context.setValue).toBeCalledWith(WSL_HYPERV_ENABLED_KEY, false);
  });
  test('setValue should not be called if new value is equal to wslAndHypervEnabled', async () => {
    extension.updateWSLHyperVEnabledContextValue(true);
    expect(extensionApi.context.setValue).not.toBeCalled();
  });
});

describe('connectionAuditor', () => {
  test('check if podman.isCreateWSLOptionSelected is set to true if podman.factory.machine.win.provider = wsl', async () => {
    // be sure isCreateWSLOptionSelected is set to false
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'hyperv',
    });

    // verify isCreateWSLOptionSelected is set to true
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'wsl',
    });
    expect(extensionApi.context.setValue).toHaveBeenLastCalledWith(CREATE_WSL_MACHINE_OPTION_SELECTED_KEY, true);
  });
  test('check if podman.isCreateWSLOptionSelected is set to true if podman.factory.machine.win.provider is undefined but wsl is enabled', async () => {
    // be sure isCreateWSLOptionSelected is set to false
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'hyperv',
    });

    // verify isCreateWSLOptionSelected is set to true
    extension.setWSLEnabled(true);

    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': undefined,
    });
    expect(extensionApi.context.setValue).toHaveBeenLastCalledWith(CREATE_WSL_MACHINE_OPTION_SELECTED_KEY, true);
  });
  test('check if podman.isCreateWSLOptionSelected is set to false if podman.factory.machine.win.provider = hyperv', async () => {
    // be sure isCreateWSLOptionSelected is set to true
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'wsl',
    });

    // verify isCreateWSLOptionSelected is set to false
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'hyperv',
    });
    expect(extensionApi.context.setValue).toHaveBeenLastCalledWith(CREATE_WSL_MACHINE_OPTION_SELECTED_KEY, false);
  });
  test('check if podman.isCreateWSLOptionSelected is set to false if podman.factory.machine.win.provider is undefined and wsl is NOT enabled', async () => {
    // be sure isCreateWSLOptionSelected is set to true
    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': 'wsl',
    });

    // verify isCreateWSLOptionSelected is set to false
    extension.setWSLEnabled(false);

    await extension.connectionAuditor({
      'podman.factory.machine.win.provider': undefined,
    });
    expect(extensionApi.context.setValue).toHaveBeenLastCalledWith(CREATE_WSL_MACHINE_OPTION_SELECTED_KEY, false);
  });
});

// https://github.com/podman-desktop/podman-desktop/issues/10173
test('activate and autostart should not duplicate machines ', async () => {
  vi.mocked(extensionApi.env).isMac = true;
  vi.mocked(extensionApi.env).isWindows = false;
  vi.mocked(extensionApi.env).isLinux = false;
  vi.spyOn(PodmanInstall.prototype, 'checkForUpdate').mockResolvedValue({
    hasUpdate: false,
  } as unknown as UpdateCheck);
  const contextMock = getContextMock();

  // mock getSocketCompatibility
  const disableMock = vi.fn();
  const enableMock = vi.fn();
  const isEnabledMock = vi.fn().mockReturnValue(false);
  const mock = vi.spyOn(compatibilityModeLib, 'getSocketCompatibility');
  mock.mockReturnValue({
    isEnabled: isEnabledMock,
    enable: enableMock,
    disable: disableMock,
    details: '',
    tooltipText: (): string => {
      return '';
    },
  });

  let podmanMachineListCalls = 0;

  vi.mocked(extensionApi.process.exec).mockImplementation(
    (_command: string, args?: string[], _options?: extensionApi.RunOptions) =>
      new Promise<extensionApi.RunResult>(resolve => {
        if (args?.[0] === '--version') {
          resolve({
            stderr: '',
            stdout: '5.0.0',
            command: '',
          });
          return;
        }

        if (args?.[0] === 'machine' && args?.[1] === 'list') {
          podmanMachineListCalls++;
          resolve({
            stderr: '',
            stdout: '[]',
            command: '',
          });
        }
      }),
  );

  const api = await extension.activate(contextMock);
  expect(api).toBeDefined();

  // check that we've registered a autostart provider
  expect(provider.registerAutostart).toBeCalled();
  const autoStartMethod = vi.mocked(provider.registerAutostart).mock.calls[0][0] as unknown as {
    start: () => Promise<void>;
  };

  // call the autostart method
  const promiseAutoStart = autoStartMethod?.start();

  vi.useFakeTimers();

  const promises = Array.from({ length: 100 }).map(() => extension.monitorMachines(provider, podmanConfiguration));

  await promiseAutoStart;

  // should be only 1 but we allow some more calls (if there is not a check to check during the autostart it would be 100+ calls)
  expect(podmanMachineListCalls).toBeLessThan(5);
  expect(promiseAutoStart).toBeDefined();

  await vi.advanceTimersByTimeAsync(5000);

  await Promise.allSettled(promises);
});

describe('macOS: tests for notifying if disguised podman socket fails / passes', () => {
  let contextMock: extensionApi.ExtensionContext;

  beforeEach(() => {
    contextMock = getContextMock();

    // Mock the get compatibility functionality.
    // we will always assuming it's "disabled" for the tests
    vi.spyOn(compatibilityModeLib, 'getSocketCompatibility').mockReturnValue({
      isEnabled: vi.fn().mockReturnValue(true),
      enable: vi.fn().mockReturnValue(true),
      disable: vi.fn(),
      details: '',
      tooltipText: (): string => {
        return '';
      },
    });
  });

  test('do not show any notifications / messages if the provider is stopped', async () => {
    // macOS only
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(extensionApi.env).isWindows = false;
    vi.mocked(extensionApi.env).isLinux = false;

    const api = await extension.activate(contextMock);
    expect(api).toBeDefined();

    // Expect that isDisguisedPodman was NOT called
    expect(isDisguisedPodman).not.toBeCalled();

    // Check that the error message is NOT shown
    expect(extensionApi.window.showNotification).not.toBeCalled();
  });
});

describe('podman-mac-helper tests', () => {
  let contextMock: extensionApi.ExtensionContext;

  beforeEach(() => {
    // Make sure it's macOS only
    vi.mocked(extensionApi.env).isMac = true;
    vi.mocked(extensionApi.env).isWindows = false;
    vi.mocked(extensionApi.env).isLinux = false;

    // Mock the context
    contextMock = getContextMock();

    // Mock the get compatibility functionality.
    // we just assume that it's false / not enabled by default to test the functionality.
    vi.spyOn(compatibilityModeLib, 'getSocketCompatibility').mockReturnValue({
      isEnabled: vi.fn(),
      enable: vi.fn().mockReturnValue(false),
      disable: vi.fn(),
      details: '',
      tooltipText: (): string => {
        return '';
      },
    });
  });

  test('mock that the provider is "stopped" and make sure that the notification is NOT shown', async () => {
    // Activate
    const api = await extension.activate(contextMock);
    expect(api).toBeDefined();

    // Make sure showNotification is not shown at all.
    expect(extensionApi.window.showNotification).not.toBeCalledWith(
      expect.objectContaining({
        body: expect.stringContaining(
          'The Podman Mac Helper is not set up, some features might not function optimally.',
        ),
      }),
    );
  });
});

const notifySetupPodmanExpectedContent = {
  title: 'Podman needs to be set up',
  body: 'The Podman extension is installed, yet requires configuration. Some features might not function optimally.',
  highlight: true,
  markdownActions: ':button[Set up]{href=/preferences/onboarding/podman-desktop.podman title="Set up Podman"}',
  silent: true,
  type: 'info',
};

describe('Check notify podman setup', () => {
  test('show setup podman notification if not on linux with shouldCleanMachine', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(fs.existsSync).mockReturnValue(true);

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    // second call to get the machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    await extension.updateMachines(provider, podmanConfiguration);

    expect(extensionApi.window.showNotification).toBeCalledWith(notifySetupPodmanExpectedContent);
  });

  test('show setup podman notification if on linux without Podman installed when monitoring', async () => {
    vi.mocked(extensionApi.env).isLinux = true;

    // Call it twice to check the notification is only shown once
    await extension.doMonitorProvider(provider);
    await extension.doMonitorProvider(provider);

    expect(extensionApi.window.showNotification).toHaveBeenCalledExactlyOnceWith(notifySetupPodmanExpectedContent);
  });

  test('do not show setup podman notification if on Mac without Podman installed when monitoring', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    // Call it twice to check the notification is only shown once
    await extension.doMonitorProvider(provider);
    await extension.doMonitorProvider(provider);

    expect(extensionApi.window.showNotification).not.toHaveBeenCalled();
  });

  test('reset the notification flag so if podman is uninstalled in future we can show the notification again', async () => {
    vi.mocked(extensionApi.env).isLinux = true;

    // No podman install

    await extension.doMonitorProvider(provider);
    expect(extensionApi.window.showNotification).toHaveBeenCalledExactlyOnceWith(notifySetupPodmanExpectedContent);

    // Podman has been installed

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValueOnce({
      version: '5.0.0',
    });

    await extension.doMonitorProvider(provider);

    expect(extensionApi.window.showNotification).toHaveBeenCalledExactlyOnceWith(notifySetupPodmanExpectedContent);

    // Podman has been uninstalled -> Show the notification a second time

    await extension.doMonitorProvider(provider);
    expect(extensionApi.window.showNotification).toHaveBeenCalledTimes(2);
    expect(extensionApi.window.showNotification).toHaveBeenLastCalledWith(notifySetupPodmanExpectedContent);
  });

  test('do not show setup podman notification if remote connections exist and machine list is empty', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    const mockRemoteConnections = {
      hasConnections: vi.fn().mockReturnValue(true),
    } as unknown as PodmanRemoteConnections;
    extension.initPodmanRemoteConnections(mockRemoteConnections);

    await extension.updateMachines(provider, podmanConfiguration);

    expect(extensionApi.window.showNotification).not.toBeCalled();
  });

  test('show setup podman notification if no remote connections and machine list is empty', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    const mockRemoteConnections = {
      hasConnections: vi.fn().mockReturnValue(false),
    } as unknown as PodmanRemoteConnections;
    extension.initPodmanRemoteConnections(mockRemoteConnections);

    await extension.updateMachines(provider, podmanConfiguration);

    expect(extensionApi.window.showNotification).toBeCalledWith(notifySetupPodmanExpectedContent);
  });

  test('set provider status to ready when remote connections exist but no local machines', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.mocked(extensionApi.commands.registerCommand).mockReturnValue({ dispose: vi.fn() });

    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
      version: '5.0.0',
    });

    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    const mockRemoteConnections = {
      hasConnections: vi.fn().mockReturnValue(true),
    } as unknown as PodmanRemoteConnections;
    extension.initPodmanRemoteConnections(mockRemoteConnections);

    await extension.updateMachines(provider, podmanConfiguration);

    expect(provider.updateStatus).toBeCalledWith('ready');
  });

  test('do not show setup notification on error if remote connections exist', async () => {
    vi.mocked(extensionApi.env).isMac = true;

    vi.spyOn(extensionApi.process, 'exec').mockRejectedValue({
      name: 'name',
      message: 'description',
      stderr: 'error',
    });

    const mockRemoteConnections = {
      hasConnections: vi.fn().mockReturnValue(true),
    } as unknown as PodmanRemoteConnections;
    extension.initPodmanRemoteConnections(mockRemoteConnections);

    await extension.updateMachines(provider, podmanConfiguration);
    expect(extensionApi.window.showNotification).not.toBeCalled();
    expect(extensionApi.context.setValue).toBeCalledWith('podmanRemoteConnectionExists', true, 'onboarding');
  });
});

describe('monitorProvider', () => {
  test('should run the monitoring loop once and then stop correctly', async () => {
    const mockDoMonitorProvider = vi.fn().mockResolvedValue(undefined);

    vi.useFakeTimers();

    const contextMock = getContextMock();
    await extension.activate(contextMock);

    // Start the monitor. DO NOT await it, since it's a "never-ending" loop.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    extension.monitorProvider(provider, mockDoMonitorProvider);

    expect(mockDoMonitorProvider).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(8000);

    expect(mockDoMonitorProvider).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(8000);
    expect(mockDoMonitorProvider).toHaveBeenCalledTimes(3);

    await extension.deactivate();

    await vi.runAllTimersAsync();
    expect(mockDoMonitorProvider).toHaveBeenCalledTimes(3);
  });
});

describe('activate sets PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY', () => {
  const cases = (
    [
      ['5.0.0', false],
      ['5.4.2', false],
      ['5.9.9', false],
      ['6.0.0', true],
      ['6.1.0', true],
      ['6.3.2', true],
      ['7.0.0', true],
    ] as const
  ).map(([version, supported]) => ({ version, supported }));

  test.for(cases)('Podman $version sets native CA import supported to $supported', async ({ version, supported }) => {
    vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({ version } as InstalledPodman);
    vi.spyOn(PodmanInstall.prototype, 'checkForUpdate').mockResolvedValue({
      hasUpdate: false,
    } as unknown as UpdateCheck);
    await extension.activate(getContextMock());
    expect(extensionApi.context.setValue).toHaveBeenCalledWith(PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY, supported);
  });
});

describe('getImportNativeCAFromConfig', () => {
  test('should return false when machineInspect is undefined', async () => {
    const result = await getImportNativeCAFromConfig('machine1', undefined);
    expect(result).toBe(false);
  });

  test('should return false when ConfigDir is missing', async () => {
    const result = await getImportNativeCAFromConfig('machine1', { Rootful: true });
    expect(result).toBe(false);
  });

  test('should return false when ConfigDir.Path is missing', async () => {
    const result = await getImportNativeCAFromConfig('machine1', { ConfigDir: {} });
    expect(result).toBe(false);
  });

  test('should return true when config file has ImportNativeCA set to true', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify({ ImportNativeCA: true }));
    const configDir = path.join('some', 'config', 'dir');
    const result = await getImportNativeCAFromConfig('machine1', { ConfigDir: { Path: configDir } });
    expect(result).toBe(true);
    expect(readFile).toHaveBeenCalledWith(path.join(configDir, 'machine1.json'), 'utf-8');
  });

  test('should return false when config file has ImportNativeCA set to false', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify({ ImportNativeCA: false }));
    const result = await getImportNativeCAFromConfig('machine1', {
      ConfigDir: { Path: path.join('some', 'config', 'dir') },
    });
    expect(result).toBe(false);
  });

  test('should return false when config file does not have ImportNativeCA field', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify({ Rootful: true }));
    const result = await getImportNativeCAFromConfig('machine1', {
      ConfigDir: { Path: path.join('some', 'config', 'dir') },
    });
    expect(result).toBe(false);
  });

  test('should return false when reading config file throws an error', async () => {
    vi.mocked(readFile).mockRejectedValueOnce(new Error('ENOENT: no such file'));
    const result = await getImportNativeCAFromConfig('machine1', {
      ConfigDir: { Path: path.join('nonexistent', 'dir') },
    });
    expect(result).toBe(false);
  });

  test('should construct correct file path from configDir and machineName', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify({ ImportNativeCA: true }));
    const configDir = path.join('home', 'user', '.config', 'containers', 'podman', 'machine', 'applehv');
    await getImportNativeCAFromConfig('my-vm', { ConfigDir: { Path: configDir } });
    expect(readFile).toHaveBeenCalledWith(path.join(configDir, 'my-vm.json'), 'utf-8');
  });
});

describe('provider status updates on podman socket liveness change', () => {
  function setupSocketMonitorWithStatus(alive: boolean): void {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetStopLoop();
    if (alive) {
      vi.mocked(http.get).mockImplementation(((_options: unknown, callback?: (res: http.IncomingMessage) => void) => {
        const request = new EventEmitter() as http.ClientRequest;
        const response = new EventEmitter() as http.IncomingMessage;
        response.statusCode = 200;
        callback?.(response);
        response.emit('data', '');
        response.emit('end');
        return request;
      }) as typeof http.get);
    } else {
      vi.mocked(http.get).mockImplementation(((_options: unknown, _callback?: (res: http.IncomingMessage) => void) => {
        const request = new EventEmitter() as http.ClientRequest;
        queueMicrotask(() => request.emit('error', new Error('connect error')));
        return request;
      }) as typeof http.get);
    }
  }

  test.each([
    { from: 'started' as const, to: 'stopped' as const, expectedProviderStatus: 'stopped' },
    { from: 'stopped' as const, to: 'started' as const, expectedProviderStatus: 'ready' },
  ])(
    'sets provider to $expectedProviderStatus when native socket transitions from $from to $to on Linux',
    ({ from, to, expectedProviderStatus }) => {
      vi.mocked(extensionApi.env).isLinux = true;
      updateProviderStatus(provider, from);
      updateProviderStatus(provider, to);

      expect(provider.updateStatus).toHaveBeenCalledWith(expectedProviderStatus);
    },
  );

  test('does not call provider.updateStatus when status has not changed', () => {
    vi.mocked(extensionApi.env).isLinux = true;
    updateProviderStatus(provider, 'started');

    expect(provider.updateStatus).not.toHaveBeenCalled();
  });

  test('does not call provider.updateStatus on non-Linux', () => {
    vi.mocked(extensionApi.env).isLinux = false;

    updateProviderStatus(provider, 'started');

    expect(provider.updateStatus).not.toHaveBeenCalled();
  });

  test('updates machine status map when machineName is provided', () => {
    updateProviderStatus(provider, 'started', 'my-machine');

    expect(extension.podmanMachinesStatuses.get('my-machine')).toBe('started');
    expect(provider.updateStatus).not.toHaveBeenCalled();
  });

  test('monitorPodmanSocket updates provider to stopped when native socket is not alive', async () => {
    vi.mocked(extensionApi.env).isLinux = true;
    setupSocketMonitorWithStatus(false);
    updateProviderStatus(provider, 'started');
    vi.mocked(provider.updateStatus).mockClear();

    const promise = monitorPodmanSocket(provider, '/socket');
    await vi.advanceTimersByTimeAsync(5000);
    await promise;

    expect(provider.updateStatus).toHaveBeenCalledWith('stopped');
  });

  test('monitorPodmanSocket updates provider to ready when native socket is alive', async () => {
    vi.mocked(extensionApi.env).isLinux = true;
    setupSocketMonitorWithStatus(true);
    updateProviderStatus(provider, 'stopped');
    vi.mocked(provider.updateStatus).mockClear();

    const promise = monitorPodmanSocket(provider, '/socket');
    await vi.advanceTimersByTimeAsync(5000);
    await promise;

    expect(provider.updateStatus).toHaveBeenCalledWith('ready');
  });

  test('monitorPodmanSocket sets machine status to started when machine socket is alive', async () => {
    setupSocketMonitorWithStatus(true);
    extension.podmanMachinesStatuses.set('test-machine', 'stopped');

    const promise = monitorPodmanSocket(provider, '/socket', 'test-machine');
    await vi.advanceTimersByTimeAsync(5000);
    await promise;

    expect(extension.podmanMachinesStatuses.get('test-machine')).toBe('started');
  });

  test('monitorPodmanSocket sets machine status to stopped when machine socket is not alive', async () => {
    setupSocketMonitorWithStatus(false);
    extension.podmanMachinesStatuses.set('test-machine', 'started');

    const promise = monitorPodmanSocket(provider, '/socket', 'test-machine');
    await vi.advanceTimersByTimeAsync(5000);
    await promise;

    expect(extension.podmanMachinesStatuses.get('test-machine')).toBe('stopped');
  });

  test('initDefaultLinux registers container connection when socket exists', async () => {
    vi.mocked(extensionApi.env).isLinux = true;
    setupSocketMonitorWithStatus(false);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    extension.initExtensionContext(getContextMock());

    await initDefaultLinux(provider);

    expect(provider.registerContainerProviderConnection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Podman', type: 'podman' }),
    );
  });
});

function getContextMock() {
  return {
    subscriptions: [],
    secrets: {
      delete: vi.fn(),
      get: vi.fn(),
      onDidChange: vi.fn(),
      store: vi.fn(),
    },
  } as unknown as extensionApi.ExtensionContext;
}
