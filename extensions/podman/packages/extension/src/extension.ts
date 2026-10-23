/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

import type { ContainerEngineInfo, RunError } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import type { PodmanExtensionApi, PodmanRunOptions } from '@podman-desktop/podman-extension-api';
import { Mutex } from 'async-mutex';
import { compare } from 'semver';

import { getSocketCompatibility } from '/@/compatibility-mode/compatibility-mode';
import {
  CLEANUP_REQUIRED_MACHINE_KEY,
  CREATE_WSL_MACHINE_OPTION_SELECTED_KEY,
  PODMAN_DOCKER_COMPAT_ENABLE_KEY,
  PODMAN_EDIT_IMPORT_NATIVE_CA,
  PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY,
  PODMAN_MACHINE_CPU_SUPPORTED_KEY,
  PODMAN_MACHINE_DISK_SUPPORTED_KEY,
  PODMAN_MACHINE_EDIT_CPU,
  PODMAN_MACHINE_EDIT_DISK_SIZE,
  PODMAN_MACHINE_EDIT_MEMORY,
  PODMAN_MACHINE_EDIT_ROOTFUL,
  PODMAN_MACHINE_MEMORY_SUPPORTED_KEY,
  PODMAN_PROVIDER_LIBKRUN_SUPPORTED_KEY,
  ROOTFUL_MACHINE_INIT_SUPPORTED_KEY,
  START_NOW_MACHINE_INIT_SUPPORTED_KEY,
  USER_MODE_NETWORKING_SUPPORTED_KEY,
  WSL_HYPERV_ENABLED_KEY,
} from '/@/constants';
import { WinPlatform } from '/@/platforms/win-platform';
import { PodmanProvider } from '/@/providers/podman-provider';
import type { ConnectionJSON, MachineInfo, MachineJSON, MachineJSONListOutput, MachineListOutput } from '/@/types';
import type { InstalledPodman } from '/@/utils/podman-binary';
import { PodmanBinary } from '/@/utils/podman-binary';

import { CertificateDetectionService } from './certificate-detection/certificate-detection-service';
import { PodmanCertificateSync } from './certificate-sync/podman-certificate-sync';
import { getDetectionChecks } from './checks/detection-checks';
import { MacKrunkitPodmanMachineCreationCheck, MacPodmanInstallCheck } from './checks/macos-checks';
import { PodmanCleanupMacOS } from './cleanup/podman-cleanup-macos';
import { PodmanCleanupWindows } from './cleanup/podman-cleanup-windows';
import { KrunkitHelper } from './helpers/krunkit-helper';
import { PodmanBinaryLocationHelper } from './helpers/podman-binary-location-helper';
import { PodmanInfoHelper } from './helpers/podman-info-helper';
import { QemuHelper } from './helpers/qemu-helper';
import { WslHelper } from './helpers/wsl-helper';
import { InversifyBinding } from './inject/inversify-binding';
import { PodmanInstall } from './installer/podman-install';
import { PodmanRemoteConnections } from './remote/podman-remote-connections';
import { ExtensionNotifications } from './utils/notifications';
import { getPodmanCli } from './utils/podman-cli';
import { PodmanConfiguration } from './utils/podman-configuration';
import { ProviderConnectionShellAccessImpl } from './utils/podman-machine-stream';
import { RegistrySetup } from './utils/registry-setup';
import { ROSETTA_ENABLE_FILE, RosettaProvisioner } from './utils/rosetta';
import {
  appConfigDir,
  appHomeDir,
  execPodman,
  getAssetsFolder,
  getMultiplePodmanInstallationsWarnings,
  getProviderByLabel,
  getProviderLabel,
  LoggerDelegator,
  VMTYPE,
} from './utils/util';
import { isDisguisedPodman } from './utils/warnings';

let inversifyBinding: InversifyBinding | undefined;

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectory = path.resolve(os.homedir(), appHomeDir(), 'machine');
const podmanMachineSocketsSymlinkDirectoryMac = path.resolve(os.homedir(), '.podman');
const MACOS_MAX_SOCKET_PATH_LENGTH = 104;
let isMovedPodmanSocket = false;
let storedExtensionContext: extensionApi.ExtensionContext | undefined;
let stopLoop = false;
let autoMachineStarted = false;
let autoMachineName: string | undefined;

// System default notifier
let defaultMachineNotify = !extensionApi.env.isLinux;
let defaultConnectionNotify = !extensionApi.env.isLinux;
let defaultMachineMonitor = true;

// current status of machines
export const podmanMachinesStatuses = new Map<string, extensionApi.ProviderConnectionStatus>();
let podmanProviderStatus: extensionApi.ProviderConnectionStatus = 'started';
const podmanMachinesInfo = new Map<string, MachineInfo>();
const currentConnections = new Map<string, extensionApi.Disposable>();
const containerProviderConnections = new Map<string, extensionApi.ContainerProviderConnection>();

// Telemetry
let telemetryLogger: extensionApi.TelemetryLogger;

let winPlatform: WinPlatform;
let podmanBinary: PodmanBinary;
let rosettaProvisioner: RosettaProvisioner;

let certificateDetectionService: CertificateDetectionService | undefined;
let certificateDetectionInterval: NodeJS.Timeout | undefined;

const wslHelper = new WslHelper();
const qemuHelper = new QemuHelper();
const krunkitHelper = new KrunkitHelper();
const podmanBinaryHelper = new PodmanBinaryLocationHelper();
const podmanInfoHelper = new PodmanInfoHelper();

const updateMachinesMutex = new Mutex();

let createWSLMachineOptionSelected = false;
let wslAndHypervEnabledContextValue = false;
let wslEnabled = false;
let wslWarningShown = false;

let extensionNotifications: ExtensionNotifications;
let podmanRemoteConnections: PodmanRemoteConnections | undefined;

export function isIncompatibleMachineOutput(output: string | undefined): boolean {
  // apple HV v4 to v5 machine config error
  const APPLE_HV_V4_V5_ERROR = 'incompatible machine config';

  // wsl v4 to v5 machine config error
  const WSL_V4_V5_ERROR = 'cannot unmarshal string';

  if (output) {
    return output.includes(APPLE_HV_V4_V5_ERROR) || output.includes(WSL_V4_V5_ERROR);
  } else {
    return false;
  }
}

export function isWSLServiceError(output: string | undefined): boolean {
  if (!output) {
    return false;
  }
  const lower = output.toLowerCase();
  return lower.includes('wsl/service/') || lower.includes('exit status 0xffffffff') || lower.includes('wsl_e_');
}

export async function updateMachines(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
): Promise<void> {
  // do not run multiple updates at the same time
  await updateMachinesMutex.runExclusive(async () => doUpdateMachines(provider, podmanConfiguration));
}

async function doUpdateMachines(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
): Promise<void> {
  const hasRemoteConnections = podmanRemoteConnections?.hasConnections() ?? false;
  extensionApi.context.setValue('podmanRemoteConnectionExists', hasRemoteConnections, 'onboarding');

  // init machines available
  let machineListOutput: MachineJSONListOutput;
  try {
    machineListOutput = await getJSONMachineList();
  } catch (error) {
    let shouldCleanMachine = false;
    // check if field stderr is present in the error object
    const runError = error as RunError;
    if (runError.stderr) {
      shouldCleanMachine = isIncompatibleMachineOutput(runError.stderr);
    }

    if (isWSLServiceError(runError.stderr ?? runError.message)) {
      if (!wslWarningShown) {
        wslWarningShown = true;
        await extensionApi.window.showWarningMessage(
          `Podman machines cannot be listed due to a WSL error. Try running 'wsl --shutdown' in a terminal and restarting the machine from Podman Desktop. Error: ${runError.stderr ?? runError.message}`,
        );
      }
    } else if (!hasRemoteConnections) {
      extensionNotifications.notifySetupPodmanNotLinux();
    }

    extensionApi.context.setValue(CLEANUP_REQUIRED_MACHINE_KEY, shouldCleanMachine);
    throw error;
  }

  // parse output
  const machines = machineListOutput.list;
  extensionApi.context.setValue('podmanMachineExists', machines.length > 0, 'onboarding');
  const installedPodman = await podmanBinary.getBinaryInfo();
  let shouldCleanMachine = false;
  if (installedPodman) {
    shouldCleanMachine = shouldNotifyQemuMachinesWithV5(installedPodman);
  }
  // check if the machine needs to be cleaned for v4 --> v5 format
  if (!shouldCleanMachine) {
    shouldCleanMachine = isIncompatibleMachineOutput(machineListOutput.error);
  }

  // check if there are WSL service errors in the accumulated error output
  if (isWSLServiceError(machineListOutput.error)) {
    if (!wslWarningShown) {
      wslWarningShown = true;
      await extensionApi.window.showWarningMessage(
        `Some Podman machines may not be visible due to a WSL error. Try running 'wsl --shutdown' in a terminal. Error: ${machineListOutput.error.trim()}`,
      );
    }
  } else {
    wslWarningShown = false;
  }

  // invalid machines is not making the provider working properly so always notify
  // but skip if remote connections exist and no cleanup is needed
  if (shouldCleanMachine || (machines.length === 0 && !hasRemoteConnections)) {
    // push setup notification
    extensionNotifications.notifySetupPodmanNotLinux();
  }

  extensionApi.context.setValue(CLEANUP_REQUIRED_MACHINE_KEY, shouldCleanMachine);

  // if there is at least one machine (or remote connection) which does not need to be cleaned
  // and the OS is not Linux, podman is correctly setup so if there is an old notification
  // asking the user to take action we dispose it as not needed anymore
  if (!shouldCleanMachine && (machines.length > 0 || hasRemoteConnections) && !extensionApi.env.isLinux) {
    extensionNotifications.disposeNotification();
  }

  // update status of existing machines
  for (const machine of machines) {
    const running = machine?.Running === true;
    let status: extensionApi.ProviderConnectionStatus = running ? 'started' : 'stopped';

    // update the status to starting if the machine is running but still starting
    const starting = machine?.Starting === true;
    if (starting) {
      status = 'starting';
    }

    let machineInfo: ContainerEngineInfo | undefined = undefined;
    if (running) {
      try {
        machineInfo = await extensionApi.containerEngine.info(`podman.${machine.Name}`);
      } catch (err: unknown) {
        console.warn(` Can't get machine ${machine.Name} resource usage error ${err}`);
      }
    }

    const previousStatus = podmanMachinesStatuses.get(machine.Name);
    if (previousStatus !== status) {
      // notify status change
      listeners.forEach(listener => listener(machine.Name, status));
      podmanMachinesStatuses.set(machine.Name, status);
    }

    const userModeNetworking = extensionApi.env.isWindows ? !!machine.UserModeNetworking : true;
    podmanMachinesInfo.set(machine.Name, {
      name: machine.Name,
      memory: machineInfo?.memory ?? Number(machine.Memory),
      cpus: machineInfo?.cpus ?? machine.CPUs,
      diskSize: machineInfo?.diskSize ?? Number(machine.DiskSize),
      userModeNetworking: userModeNetworking,
      cpuUsage: machineInfo?.cpuIdle !== undefined ? 100 - machineInfo?.cpuIdle : 0,
      diskUsage:
        machineInfo?.diskUsed !== undefined && machineInfo?.diskSize !== undefined && machineInfo?.diskSize > 0
          ? (machineInfo?.diskUsed * 100) / machineInfo?.diskSize
          : 0,
      memoryUsage:
        machineInfo?.memory !== undefined && machineInfo?.memoryUsed !== undefined && machineInfo?.memoryUsed > 0
          ? (machineInfo?.memoryUsed * 100) / machineInfo?.memory
          : 0,
      vmType: machine.VMType,
      port: machine.Port,
      remoteUsername: machine.RemoteUsername,
      identityPath: machine.IdentityPath,
    });

    if (!podmanMachinesStatuses.has(machine.Name)) {
      podmanMachinesStatuses.set(machine.Name, status);
    }

    const containerProviderConnection = containerProviderConnections.get(machine.Name);
    const podmanMachineInfo = podmanMachinesInfo.get(machine.Name);
    if (containerProviderConnection && podmanMachineInfo) {
      await updateContainerConfiguration(containerProviderConnection, podmanMachineInfo);
    }
  }

  // remove machine no longer there
  const machinesToRemove = Array.from(podmanMachinesStatuses.keys()).filter(
    machine => !machines.find(m => m.Name === machine),
  );
  machinesToRemove.forEach(machine => {
    podmanMachinesStatuses.delete(machine);
    podmanMachinesInfo.delete(machine);
    containerProviderConnections.delete(machine);
  });

  // create connections for new machines
  const connectionsToCreate = Array.from(podmanMachinesStatuses.keys()).filter(
    machineStatusKey => !currentConnections.has(machineStatusKey),
  );
  await Promise.all(
    connectionsToCreate.map(async machineName => {
      // podman.sock link
      let socketPath;
      try {
        if (extensionApi.env.isWindows) {
          const { stdout: socket } = await extensionApi.process.exec(getPodmanCli(), [
            'machine',
            'inspect',
            '--format',
            '{{.ConnectionInfo.PodmanPipe.Path}}',
            machineName,
          ]);
          socketPath = socket;
        } else {
          const podmanMachineInfo = podmanMachinesInfo.get(machineName);
          const { stdout: socket } = await execPodman(
            ['machine', 'inspect', '--format', '{{.ConnectionInfo.PodmanSocket.Path}}', machineName],
            podmanMachineInfo?.vmType,
          );
          socketPath = socket;
        }
      } catch (error) {
        console.debug('Podman extension:', 'Failed to read socketPath from machine inspect');
      }
      if (!socketPath) {
        if (extensionApi.env.isMac) {
          socketPath = calcMacosSocketPath(machineName);
        } else if (extensionApi.env.isLinux) {
          socketPath = calcLinuxSocketPath(machineName);
        } else if (extensionApi.env.isWindows) {
          socketPath = winPlatform.calcPipeName(machineName);
        }
      }
      const podmanMachineInfo = podmanMachinesInfo.get(machineName);
      if (podmanMachineInfo && socketPath) {
        await registerProviderFor(provider, podmanConfiguration, podmanMachineInfo, socketPath);
      }
    }),
  );

  // delete connections for machines no longer there
  machinesToRemove.forEach(machine => {
    const disposable = currentConnections.get(machine);
    if (disposable) {
      disposable.dispose();
      currentConnections.delete(machine);
    }
  });

  // If the machine length is zero and we are on macOS or Windows,
  // we will update the provider as being 'installed', or ready / starting / configured if there is a machine
  // if we are on Linux, ignore this as podman machine is OPTIONAL and the provider status in Linux is based upon
  // the native podman installation / not machine.
  if (!extensionApi.env.isLinux) {
    if (machines.length === 0 && !hasRemoteConnections) {
      if (provider.status !== 'configuring' && installedPodman) {
        provider.updateStatus('installed');
      }
    } else if (machines.length === 0 && hasRemoteConnections) {
      provider.updateStatus('ready');
    } else {
      /*
       * The machine can have 3 states, based on `Starting` and `Running` fields:
       * - !Running && !Starting -> configured
       * -  Running &&  Starting -> starting
       * -  Running && !Starting -> ready
       */
      const atLeastOneMachineRunning = machines.some(machine => machine.Running && !machine.Starting);
      const atLeastOneMachineStarting = machines.some(machine => machine.Starting);
      // if a machine is running it's started else it is ready
      if (atLeastOneMachineRunning) {
        provider.updateStatus('ready');
      } else if (atLeastOneMachineStarting) {
        // update to starting
        provider.updateStatus('starting');
      } else {
        // needs to start a machine
        provider.updateStatus('configured');
      }

      // Finally, we check to see if the machine that is running is set by default or not on the CLI
      // this will create a dialog that will ask the user if they wish to set the running machine as default.
      // this should only run if we at least one machine
      await checkDefaultMachine(machines);
    }
  }

  // Only do the check if the provider is ready
  if (provider.status === 'ready') {
    await extensionNotifications.checkMacSocket();
  }
}

export async function checkDefaultMachine(machines: MachineJSON[]): Promise<void> {
  // As a last check, let's see if the machine that is running is set by default or not on the CLI.
  // if it isn't, we should prompt the user to set it as default, or else podman CLI commands will not work
  const ROOTFUL_SUFFIX = '-root';
  const runningMachine = machines.find(machine => machine.Running);
  let defaultMachine = machines.find(machine => machine.Default);
  // It may happen that the default machine has not been found because the rootful connection is set as default
  // if so, we try to find the default system connection and use it to identify the default machine
  if (!defaultMachine) {
    const defaultConnection = await getDefaultConnection();
    let defaultConnectionName = defaultConnection?.Name;
    if (defaultConnectionName?.endsWith(ROOTFUL_SUFFIX)) {
      defaultConnectionName = defaultConnectionName.substring(0, defaultConnectionName.length - 5);
    }
    defaultMachine = machines.find(machine => machine.Name === defaultConnectionName);

    if (runningMachine && runningMachine.Name === defaultConnectionName) {
      runningMachine.Default = true;
    }
  }

  // check if connection is in sync with machine. If the default connection is rootless but the machine is rootful ask the user to update the connection
  if (defaultConnectionNotify && !!runningMachine?.Default) {
    const defaultConnection = await getDefaultConnection();
    const isRootful = await isRootfulMachine(runningMachine);
    if (!defaultConnection?.Name.endsWith(ROOTFUL_SUFFIX) && isRootful) {
      const result = await extensionApi.window.showInformationMessage(
        `${isRootful ? 'Rootful' : 'Rootless'} Podman Machine '${runningMachine.Name}' does not match default connection. This will cause podman CLI errors while trying to connect to '${runningMachine.Name}'. Do you want to update the default connection?`,
        'Yes',
        'Ignore',
        'Cancel',
      );
      if (result === 'Yes') {
        try {
          const connectionName = isRootful ? `${runningMachine.Name}${ROOTFUL_SUFFIX}` : runningMachine.Name;
          // make it the default to run the info command
          await execPodman(['system', 'connection', 'default', connectionName], runningMachine.VMType);
        } catch (error) {
          // eslint-disable-next-line quotes
          console.error("Error running 'podman system connection default': ", error);
          await extensionApi.window.showErrorMessage(`Error running 'podman system connection default': ${error}`);
          return;
        }
        await extensionApi.window.showInformationMessage(
          `Podman Machine '${runningMachine.Name}' is now the default machine on the CLI.`,
          'OK',
        );
      } else if (result === 'Ignore') {
        // If the user chooses to ignore, we should not notify them again until Podman Desktop is restarted.
        defaultConnectionNotify = false;
      }
    }
  }

  if (defaultMachineNotify && defaultMachineMonitor && runningMachine && !runningMachine.Default) {
    // Make sure we do notifyDefault = false so we don't keep notifying the user when this dialog is open.
    defaultMachineMonitor = false;

    const defaultMachineText = defaultMachine ? `(default is '${defaultMachine.Name}')` : '';
    // Create an information message to ask the user if they wish to set the running machine as default.
    const result = await extensionApi.window.showInformationMessage(
      `Podman Machine '${runningMachine.Name}' is running but not the default machine ${defaultMachineText}. This will cause podman CLI errors while trying to connect to '${runningMachine.Name}'. Do you want to set it as default?`,
      'Yes',
      'Ignore',
      'Cancel',
    );
    if (result === 'Yes') {
      // check if machine is rootless or rootful
      const machineIsRootful = await isRootfulMachine(runningMachine);

      try {
        const connectionName = machineIsRootful ? `${runningMachine.Name}${ROOTFUL_SUFFIX}` : runningMachine.Name;
        // make it the default to run the info command
        await execPodman(['system', 'connection', 'default', connectionName], runningMachine.VMType);
      } catch (error) {
        // eslint-disable-next-line quotes
        console.error("Error running 'podman system connection default': ", error);
        await extensionApi.window.showErrorMessage(`Error running 'podman system connection default': ${error}`);
        return;
      }
      await extensionApi.window.showInformationMessage(
        `Podman Machine '${runningMachine.Name}' is now the default machine on the CLI.`,
        'OK',
      );
    } else if (result === 'Ignore') {
      // If the user chooses to ignore, we should not notify them again until Podman Desktop is restarted.
      defaultMachineNotify = false;
    }

    defaultMachineMonitor = true;
  }
}

async function getMachineInspect(
  machineDetails: MachineJSON | MachineInfo,
): Promise<Record<string, unknown> | undefined> {
  let vmType: string;
  let machineName: string;
  if ('name' in machineDetails) {
    machineName = machineDetails.name;
    vmType = machineDetails.vmType;
  } else {
    machineName = machineDetails.Name;
    vmType = machineDetails.VMType;
  }
  try {
    const { stdout: machineInspectJson } = await execPodman(['machine', 'inspect', machineName], vmType);
    const machinesInspect = JSON.parse(machineInspectJson) as Record<string, unknown>[];
    return machinesInspect.find((machine: Record<string, unknown>) => machine.Name === machineName);
  } catch (error) {
    console.error('Error when inspecting machine: ', error);
  }
  return undefined;
}

async function isRootfulMachine(machineDetails: MachineJSON | MachineInfo): Promise<boolean> {
  const machineInspect = await getMachineInspect(machineDetails);
  return (machineInspect?.Rootful as boolean) ?? false;
}

function isRootfulFromInspect(machineInspect: Record<string, unknown> | undefined): boolean {
  return (machineInspect?.Rootful as boolean) ?? false;
}

export async function getImportNativeCAFromConfig(
  machineName: string,
  machineInspect: Record<string, unknown> | undefined,
): Promise<boolean> {
  const configDir = (machineInspect?.ConfigDir as { Path?: string })?.Path;
  if (!configDir) {
    return false;
  }
  try {
    const configFile = path.join(configDir, `${machineName}.json`);
    const content = JSON.parse(await readFile(configFile, 'utf-8'));
    return content.ImportNativeCA ?? false;
  } catch (error) {
    console.error('Error reading ImportNativeCA from machine config: ', error);
  }
  return false;
}

async function getDefaultConnection(): Promise<ConnectionJSON | undefined> {
  // init machines available
  const { stdout: connectionListOutput } = await extensionApi.process.exec(getPodmanCli(), [
    'system',
    'connection',
    'list',
    '--format',
    'json',
  ]);

  // parse output
  const connections = JSON.parse(connectionListOutput) as ConnectionJSON[];

  return connections.find(connection => connection.Default);
}

async function updateContainerConfiguration(
  containerProviderConnection: extensionApi.ContainerProviderConnection,
  machineInfo: MachineInfo,
): Promise<void> {
  // get configuration for this connection
  const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);
  const machineInspect = await getMachineInspect(machineInfo);
  const isRootful = isRootfulFromInspect(machineInspect);

  // Set values for the machine
  await containerConfiguration.update('machine.cpus', machineInfo.cpus);
  await containerConfiguration.update('machine.cpusUsage', machineInfo.cpuUsage);
  await containerConfiguration.update('machine.memory', machineInfo.memory);
  await containerConfiguration.update('machine.memoryUsage', machineInfo.memoryUsage);
  await containerConfiguration.update('machine.diskSize', machineInfo.diskSize);
  await containerConfiguration.update('machine.diskSizeUsage', machineInfo.diskUsage);

  await containerConfiguration.update('machine.rootful', isRootful);

  const importNativeCA = await getImportNativeCAFromConfig(machineInfo.name, machineInspect);
  await containerConfiguration.update('machine.importNativeCA', importNativeCA);
}

function calcMacosSocketPath(machineName: string): string {
  // max length for the path of a socket in macos is 104 chars
  let socketPath = path.resolve(podmanMachineSocketsDirectory, machineName, 'podman.sock');
  if (socketPath.length > MACOS_MAX_SOCKET_PATH_LENGTH) {
    socketPath = path.resolve(podmanMachineSocketsSymlinkDirectoryMac, machineName, 'podman.sock');
  }
  return socketPath;
}

function calcLinuxSocketPath(machineName: string): string {
  let socketPath = path.resolve(podmanMachineSocketsDirectory, machineName, 'podman.sock');
  if (isMovedPodmanSocket) {
    socketPath = path.resolve(podmanMachineSocketsDirectory, 'qemu', 'podman.sock');
  }
  return socketPath;
}

function getLinuxSocketPath(): string {
  // grab user id of the user
  const userInfo = os.userInfo();
  const uid = userInfo.uid;

  return `/run/user/${uid}/podman/podman.sock`;
}

// on linux, socket is started by the system service on a path like /run/user/1000/podman/podman.sock
export async function initDefaultLinux(provider: extensionApi.Provider): Promise<void> {
  const socketPath = getLinuxSocketPath();
  if (!fs.existsSync(socketPath)) {
    return;
  }

  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: 'Podman',
    type: 'podman',
    status: () => podmanProviderStatus,
    endpoint: {
      socketPath,
    },
  };

  monitorPodmanSocket(provider, socketPath).catch((error: unknown) => {
    console.error('Error monitoring podman socket', error);
  });

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  currentConnections.set('podman', disposable);
  storedExtensionContext?.subscriptions.push(disposable);
}

async function isPodmanSocketAlive(socketPath: string): Promise<boolean> {
  const pingUrl = {
    path: '/_ping',
    socketPath,
  };
  return new Promise<boolean>(resolve => {
    const req = http.get(pingUrl, res => {
      res.on('data', () => {
        // do nothing
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    req.once('error', () => {
      resolve(false);
    });
  });
}

export async function monitorPodmanSocket(
  provider: extensionApi.Provider,
  socketPath: string,
  machineName?: string,
): Promise<void> {
  // call us again
  if (!stopMonitoringPodmanSocket(machineName)) {
    try {
      const alive = await isPodmanSocketAlive(socketPath);
      if (!alive) {
        updateProviderStatus(provider, 'stopped', machineName);
      } else {
        updateProviderStatus(provider, 'started', machineName);
      }
    } catch (error) {
      // ignore the update of machines
    }
    await timeout(5000);
    monitorPodmanSocket(provider, socketPath, machineName).catch((error: unknown) => {
      console.error('Error monitoring podman socket', error);
    });
  }
}

function stopMonitoringPodmanSocket(machineName?: string): boolean {
  if (machineName) {
    return stopLoop || !podmanMachinesStatuses.has(machineName);
  }
  return stopLoop;
}

export function updateProviderStatus(
  provider: extensionApi.Provider,
  status: extensionApi.ProviderConnectionStatus,
  machineName?: string,
): void {
  if (machineName) {
    podmanMachinesStatuses.set(machineName, status);
  } else {
    const previousStatus = podmanProviderStatus;
    podmanProviderStatus = status;

    if (extensionApi.env.isLinux && previousStatus !== status) {
      provider.updateStatus(status === 'started' ? 'ready' : 'stopped');
    }
  }
}

async function timeout(time: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
}

export async function monitorMachines(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
): Promise<void> {
  // call us again
  if (!stopLoop) {
    try {
      await updateMachines(provider, podmanConfiguration);
    } catch (error) {
      console.warn('Error updating podman machines', error);
    }

    await timeout(5000);
    monitorMachines(provider, podmanConfiguration).catch((error: unknown) => {
      console.error('Error monitoring podman machines', error);
    });
  }
}

function shouldNotifyQemuMachinesWithV5(installedPodman: InstalledPodman): boolean {
  // if on macOS we have some files from qemu it needs to be removed/cleaned
  // check if the qemu files are present in  ~/.config/containers/podman/machine/qemu or ~/.local/share/containers/podman/machine/qemu
  // get current podman version
  if (extensionApi.env.isMac && installedPodman.version.startsWith('5.')) {
    const qemuSharePath = path.resolve(os.homedir(), appHomeDir(), 'machine', 'qemu');
    const qemuConfigPath = path.resolve(os.homedir(), appConfigDir(), 'machine', 'qemu');
    if (fs.existsSync(qemuSharePath) || fs.existsSync(qemuConfigPath)) {
      return true;
    }
  }
  return false;
}

export async function monitorProvider(
  provider: extensionApi.Provider,
  monitorAction: (provider: extensionApi.Provider) => Promise<void>,
): Promise<void> {
  // call us again
  if (!stopLoop) {
    await monitorAction(provider);
    await timeout(8000);
    monitorProvider(provider, monitorAction).catch((error: unknown) => {
      console.error('Error monitoring podman provider', error);
    });
  }
}

export async function doMonitorProvider(provider: extensionApi.Provider): Promise<void> {
  try {
    const installedPodman = await podmanBinary.getBinaryInfo();
    provider.updateDetectionChecks(getDetectionChecks(installedPodman));

    const warnings = await getMultiplePodmanInstallationsWarnings(installedPodman);
    provider.updateWarnings(warnings);

    // update version
    if (!installedPodman) {
      provider.updateStatus('not-installed');
      extensionApi.context.setValue('podmanIsNotInstalled', true, 'onboarding');
      // if podman is not installed and the OS is linux we show the podman onboarding notification (if it has not been shown earlier)
      // this should be limited to Linux as in other OSes the onboarding workflow is enabled based on the podman machine existence
      // and the notification is handled by checking the machine
      if (extensionApi.env.isLinux) {
        // push setup notification
        extensionNotifications.notifySetupPodman();
      }
    } else if (installedPodman.version) {
      provider.updateVersion(installedPodman.version);
      // update provider status if someone has installed podman externally
      if (provider.status === 'not-installed') {
        provider.updateStatus('installed');
      }

      extensionApi.context.setValue('podmanIsNotInstalled', false, 'onboarding');
      // if podman has been installed, we reset the notification flag so if podman is uninstalled in future we can show the notification again
      if (extensionApi.env.isLinux) {
        // notification is no more required
        extensionNotifications.disposeNotification();
      }
    }
  } catch (error) {
    // ignore the update
  }
}

function prettyMachineName(machineName: string): string {
  let name;
  if (machineName === 'podman-machine-default') {
    name = 'Podman Machine';
  } else if (machineName.startsWith('podman-machine-')) {
    const sub = machineName.substring('podman-machine-'.length);
    name = `Podman Machine ${sub}`;
  } else {
    name = machineName;
  }
  return name;
}

export async function registerProviderFor(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
  machineInfo: MachineInfo,
  socketPath: string,
): Promise<void> {
  const isHyperVMachine = extensionApi.env.isWindows && machineInfo.vmType === VMTYPE.HYPERV;

  const isEditMemorySupported = extensionApi.env.isMac || isHyperVMachine;
  const isEditCPUSupported = extensionApi.env.isMac || isHyperVMachine;
  const isEditDiskSizeSupported = extensionApi.env.isMac;
  const isEditRootfulSupported = extensionApi.env.isMac || extensionApi.env.isWindows;

  const podmanInstallation = await podmanBinary.getBinaryInfo();
  const podmanVersion = podmanInstallation?.version;
  const isEditImportNativeCASupported = podmanVersion ? isPodman6OrLater(podmanVersion) : false;

  const isEditSupported =
    isEditMemorySupported ||
    isEditCPUSupported ||
    isEditDiskSizeSupported ||
    isEditRootfulSupported ||
    isEditImportNativeCASupported;

  extensionApi.context.setValue(PODMAN_MACHINE_EDIT_MEMORY, isEditMemorySupported);
  extensionApi.context.setValue(PODMAN_MACHINE_EDIT_CPU, isEditCPUSupported);
  extensionApi.context.setValue(PODMAN_MACHINE_EDIT_DISK_SIZE, isEditDiskSizeSupported);
  extensionApi.context.setValue(PODMAN_MACHINE_EDIT_ROOTFUL, isEditRootfulSupported);
  extensionApi.context.setValue(PODMAN_EDIT_IMPORT_NATIVE_CA, isEditImportNativeCASupported);

  const lifecycle: extensionApi.ProviderConnectionLifecycle = {
    start: async (context, logger): Promise<void> => {
      try {
        await startMachine(provider, podmanConfiguration, machineInfo, context, logger, undefined, false);
        containerProviderConnection.error = undefined;
      } catch (err) {
        containerProviderConnection.error = err instanceof Error ? err.message : String(err);
        throw err;
      }
    },
    stop: async (context, logger): Promise<void> => {
      try {
        await stopMachine(provider, machineInfo, context, logger);
        containerProviderConnection.error = undefined;
      } catch (err) {
        containerProviderConnection.error = err instanceof Error ? err.message : String(err);
        throw err;
      }
    },
    delete: async (logger): Promise<void> => {
      try {
        await execPodman(['machine', 'rm', '-f', machineInfo.name], machineInfo.vmType, {
          logger,
        });
        containerProviderConnection.error = undefined;
      } catch (err) {
        containerProviderConnection.error = err instanceof Error ? err.message : String(err);
        throw err;
      }
    },
  };
  // support edit only on MacOS and Windows with limited editing capabilities for HyperV and WSL machines
  if (isEditSupported) {
    lifecycle.edit = async (context, params, logger, _token): Promise<void> => {
      let effective = false;
      const args = ['machine', 'set', machineInfo.name];
      let isRootful: boolean | undefined;

      for (const key of Object.keys(params)) {
        if (isEditCPUSupported && key === 'podman.machine.cpus') {
          args.push('--cpus', params[key]);
          effective = true;
        } else if (isEditMemorySupported && key === 'podman.machine.memory') {
          args.push('--memory', Math.floor(params[key] / (1024 * 1024)).toString());
          effective = true;
        } else if (isEditDiskSizeSupported && key === 'podman.machine.diskSize') {
          args.push('--disk-size', Math.floor(params[key] / (1024 * 1024 * 1024)).toString());
          effective = true;
        } else if (isEditRootfulSupported && key === 'podman.machine.rootful') {
          args.push(`--rootful=${params[key]}`);
          effective = true;
          isRootful = params[key];
        } else if (isEditImportNativeCASupported && key === 'podman.machine.importNativeCA') {
          args.push(`--import-native-ca=${params[key]}`);
          effective = true;
        }
      }
      if (effective) {
        const state = podmanMachinesStatuses.get(machineInfo.name);
        try {
          if (state === 'started') {
            await lifecycle.stop?.(context, logger);
          }
          await execPodman(args, machineInfo.vmType, {
            logger: new LoggerDelegator(context, logger),
          });

          // Track telemetry if rootful/rootless switch was changed
          if (isRootful !== undefined) {
            telemetryLogger.logUsage('podman.machine.edit.rootful', { isRootful });
          }
          containerProviderConnection.error = undefined;
        } catch (err) {
          containerProviderConnection.error = err instanceof Error ? err.message : String(err);
          throw err;
        } finally {
          if (state === 'started') {
            await lifecycle.start?.(context, logger);
          }
        }
      }
    };
  }

  const providerConnectionShellAccess = new ProviderConnectionShellAccessImpl(machineInfo);
  storedExtensionContext?.subscriptions.push(providerConnectionShellAccess);
  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: machineInfo.name,
    displayName: prettyMachineName(machineInfo.name),
    type: 'podman',
    status: () => podmanMachinesStatuses.get(machineInfo.name) ?? 'unknown',
    shellAccess: providerConnectionShellAccess,
    lifecycle,
    endpoint: {
      socketPath,
    },
    vmType: machineInfo.vmType,
    vmTypeDisplayName: getProviderLabel(machineInfo.vmType),
  };

  // Since Podman 4.5, machines are using the same path for all sockets of machines
  // so a machine is not distinguishable from another one.
  // monitorPodmanSocket(socketPath, machineInfo.name);
  containerProviderConnections.set(machineInfo.name, containerProviderConnection);

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  if (!extensionApi.env.isLinux) {
    provider.updateStatus('ready');
  }

  // get configuration for this connection
  const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);
  const machineInspect = await getMachineInspect(machineInfo);
  const isRootful = isRootfulFromInspect(machineInspect);

  // Set values for the machine
  await containerConfiguration.update('machine.cpus', machineInfo.cpus);
  await containerConfiguration.update('machine.memory', machineInfo.memory);
  await containerConfiguration.update('machine.diskSize', machineInfo.diskSize);
  await containerConfiguration.update('machine.cpusUsage', machineInfo.cpuUsage);
  await containerConfiguration.update('machine.memoryUsage', machineInfo.memoryUsage);
  await containerConfiguration.update('machine.diskSizeUsage', machineInfo.diskUsage);

  await containerConfiguration.update('machine.rootful', isRootful);

  const importNativeCA = await getImportNativeCAFromConfig(machineInfo.name, machineInspect);
  await containerConfiguration.update('machine.importNativeCA', importNativeCA);

  currentConnections.set(machineInfo.name, disposable);
  storedExtensionContext?.subscriptions.push(disposable);
}

export async function startMachine(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
  machineInfo: MachineInfo,
  context?: extensionApi.LifecycleContext,
  logger?: extensionApi.Logger,
  skipHandleError?: boolean,
  autoStart?: boolean,
): Promise<void> {
  const telemetryRecords: Record<string, unknown> = {};
  telemetryRecords.provider = machineInfo.vmType;
  const startTime = performance.now();

  await rosettaProvisioner.checkRosettaMacArm(podmanConfiguration);

  try {
    // start the machine
    const runOptions: extensionApi.RunOptions = {
      logger: new LoggerDelegator(context, logger),
    };

    if (autoStart) {
      runOptions.detached = true;
    }

    await execPodman(['machine', 'start', machineInfo.name], machineInfo.vmType, runOptions);

    // Provision /etc/containers/enable-rosetta if needed (macOS Tahoe + AppleHV + Podman 5.6+).
    // If the file was just created, restart the machine so the binfmt_misc handler registers.
    // SSH/file-creation errors are caught inside rosettaProvisioner.provisionAndRestartForRosetta;
    // stop/start errors propagate so the provider status stays accurate.
    // https://blog.podman.io/2025/08/podman-5-6-released-rosetta-status-update/
    const podmanInstallation = await podmanBinary.getBinaryInfo();
    if (podmanInstallation?.version) {
      await rosettaProvisioner.provisionAndRestartForRosetta(
        machineInfo.name,
        machineInfo.vmType,
        podmanConfiguration,
        podmanInstallation.version,
        { logger: new LoggerDelegator(context, logger) },
      );
    }

    if (!extensionApi.env.isLinux) {
      provider.updateStatus('started');
    }
  } catch (err) {
    telemetryRecords.error = err;
    if (skipHandleError) {
      console.error(err);
      // propagate the error
      throw err;
    }
    await doHandleError(provider, machineInfo, podmanConfiguration, typeof err === 'string' ? err : (err as RunError));
  } finally {
    // send telemetry event
    const endTime = performance.now();
    telemetryRecords.duration = endTime - startTime;
    telemetryRecords.autoStart = autoStart === true;
    sendTelemetryRecords('podman.machine.start', telemetryRecords, true);
  }
}

export async function stopMachine(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  context?: extensionApi.LifecycleContext,
  logger?: extensionApi.Logger,
): Promise<void> {
  const startTime = performance.now();
  const telemetryRecords: Record<string, unknown> = {};
  telemetryRecords.provider = machineInfo.vmType;
  try {
    await execPodman(['machine', 'stop', machineInfo.name], machineInfo.vmType, {
      logger: new LoggerDelegator(context, logger),
    });
    if (!extensionApi.env.isLinux) {
      provider.updateStatus('stopped');
    }
  } catch (err: unknown) {
    telemetryRecords.error = err;
    throw err;
  } finally {
    // send telemetry event
    const endTime = performance.now();
    telemetryRecords.duration = endTime - startTime;
    sendTelemetryRecords('podman.machine.stop', telemetryRecords, false);
  }
}

async function doHandleError(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  podmanConfiguration: PodmanConfiguration,
  error: string | RunError,
): Promise<void> {
  let errText: string = '';

  if (typeof error === 'object' && 'message' in error) {
    errText = error.message.toString();
  } else if (typeof error === 'string') {
    errText = error;
  }

  if (errText.toLowerCase().includes('wsl bootstrap script failed: exit status 0xffffffff')) {
    const handled = await doHandleWSLDistroNotFoundError(provider, machineInfo, podmanConfiguration);
    if (handled) {
      return;
    }
  }

  console.error(error);
  // propagate the error
  throw error;
}

async function doHandleWSLDistroNotFoundError(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  podmanConfiguration: PodmanConfiguration,
): Promise<boolean> {
  const result = await extensionApi.window.showInformationMessage(
    `Error while starting Podman Machine '${machineInfo.name}'. The WSL bootstrap script failed: exist status 0xffffffff. The machine is probably broken and should be deleted and reinitialized. Do you want to recreate it?`,
    'Yes',
    'Cancel',
  );
  if (result === 'Yes') {
    return await extensionApi.window.withProgress(
      { location: extensionApi.ProgressLocation.TASK_WIDGET, title: `Initializing ${machineInfo.name}` },
      async progress => {
        progress.report({ increment: 5 });
        try {
          provider.updateStatus('configuring');
          await extensionApi.process.exec(getPodmanCli(), ['machine', 'rm', '-f', machineInfo.name]);
          progress.report({ increment: 40 });
          await createMachine(
            {
              'podman.factory.machine.name': machineInfo.name,
              'podman.factory.machine.cpus': machineInfo.cpus,
              'podman.factory.machine.memory': machineInfo.memory,
              'podman.factory.machine.diskSize': machineInfo.diskSize,
            },
            podmanConfiguration,
          );
        } catch (error) {
          console.error(error);
        } finally {
          progress.report({ increment: -1 });
        }
        return true;
      },
    );
  }

  return false;
}

export async function registerUpdatesIfAny(
  provider: extensionApi.Provider,
  installedPodman: InstalledPodman | undefined,
  podmanInstall: PodmanInstall,
): Promise<extensionApi.Disposable | undefined> {
  const updateInfo = await podmanInstall.checkForUpdate(installedPodman);
  const warnings = await getMultiplePodmanInstallationsWarnings(installedPodman);
  if (updateInfo.hasUpdate && updateInfo.bundledVersion && warnings.length === 0) {
    return provider.registerUpdate({
      version: updateInfo.bundledVersion,
      update: () => {
        // disable notification before the update to prevent the notification to be shown and re-enabled when update is done
        extensionNotifications.shouldNotifySetup = false;
        return extensionApi.window.withProgress(
          { location: extensionApi.ProgressLocation.TASK_WIDGET, title: 'Updating Podman' },
          async () => {
            try {
              return await podmanInstall.performUpdate(provider, installedPodman);
            } finally {
              extensionNotifications.shouldNotifySetup = true;
            }
          },
        );
      },
      preflightChecks: () => podmanInstall.getUpdatePreflightChecks() ?? [],
    });
  }
}

export function initTelemetryLogger(): void {
  telemetryLogger = extensionApi.env.createTelemetryLogger();
}

export function initExtensionContext(extensionContext: extensionApi.ExtensionContext): void {
  storedExtensionContext = extensionContext;
}

export function initExtensionNotification(): void {
  extensionNotifications = new ExtensionNotifications(telemetryLogger);
}

export function initPodmanRemoteConnections(remoteConnections: PodmanRemoteConnections): void {
  podmanRemoteConnections = remoteConnections;
}

const currentUpdatesDisposables: extensionApi.Disposable[] = [];
export async function initCheckAndRegisterUpdate(
  provider: extensionApi.Provider,
  podmanInstall: PodmanInstall,
): Promise<void> {
  // provide an installation path ?
  // add update information asynchronously
  const checkForUpdate = async (): Promise<void> => {
    // remove previous updates
    for (const disposable of currentUpdatesDisposables) {
      disposable.dispose();
    }
    currentUpdatesDisposables.length = 0;
    const podmanInstalledValue = await podmanBinary.getBinaryInfo();
    const disposable = await registerUpdatesIfAny(provider, podmanInstalledValue, podmanInstall);
    if (disposable) {
      currentUpdatesDisposables.push(disposable);
    }
  };
  await checkForUpdate();

  // register onDidUpdateVersion
  provider.onDidUpdateVersion(async () => {
    podmanBinary.invalidate();
    await checkForUpdate();
  });

  extensionApi.provider.onDidRegisterContainerConnection(event => {
    if (event.providerId === provider.id) {
      // check for update
      checkForUpdate().catch((error: unknown) => {
        console.error('Error checking for update', error);
      });
    }
  });

  extensionApi.provider.onDidUnregisterContainerConnection(event => {
    if (event.providerId === provider.id) {
      // check for update
      checkForUpdate().catch((error: unknown) => {
        console.error('Error checking for update', error);
      });
    }
  });
}

export function registerOnboardingMachineExistsCommand(): extensionApi.Disposable {
  return extensionApi.commands.registerCommand('podman.onboarding.checkPodmanMachineExistsCommand', async () => {
    let machineLength;
    try {
      const machineListOutput = await getJSONMachineList();
      machineLength = machineListOutput.list.length;
    } catch (error) {
      machineLength = 0;
    }
    extensionApi.context.setValue('podmanMachineExists', machineLength > 0, 'onboarding');
  });
}

export function registerOnboardingUnsupportedPodmanMachineCommand(): extensionApi.Disposable {
  return extensionApi.commands.registerCommand('podman.onboarding.checkUnsupportedPodmanMachine', async () => {
    let isUnsupported = false;
    const installedPodman = await podmanBinary.getBinaryInfo();
    if (installedPodman) {
      isUnsupported = shouldNotifyQemuMachinesWithV5(installedPodman);
    }

    // check if the machine needs to be cleaned for v4 --> v5 format
    if (!isUnsupported) {
      try {
        const machineListOutput = await getJSONMachineList();
        isUnsupported = isIncompatibleMachineOutput(machineListOutput.error);
      } catch (error) {
        // check if stderr in the error object
        const runError = error as RunError;
        if (runError.stderr) {
          isUnsupported = isIncompatibleMachineOutput(runError.stderr);
        }
      }
    }

    extensionApi.context.setValue('unsupportedPodmanMachine', isUnsupported, 'onboarding');
  });
}

export function registerOnboardingRemoveUnsupportedMachinesCommand(): extensionApi.Disposable {
  return extensionApi.commands.registerCommand('podman.onboarding.removeUnsupportedMachines', async () => {
    const fileAndFoldersToRemove = [];
    const wslMachinesToUnregister = [];

    const installedPodman = await podmanBinary.getBinaryInfo();

    if (extensionApi.env.isMac && installedPodman?.version.startsWith('5.')) {
      // remove the qemu machines folder
      const qemuSharePath = path.resolve(os.homedir(), appHomeDir(), 'machine', 'qemu');
      const qemuConfigPath = path.resolve(os.homedir(), appConfigDir(), 'machine', 'qemu');

      // remove folders if exists
      if (fs.existsSync(qemuSharePath)) {
        fileAndFoldersToRemove.push(qemuSharePath);
      }
      if (fs.existsSync(qemuConfigPath)) {
        fileAndFoldersToRemove.push(qemuConfigPath);
      }

      // prompt the user to confirm
      if (fileAndFoldersToRemove.length > 0) {
        const result = await extensionApi.window.showWarningMessage(
          'Removing old unsupported provider Podman machines will delete all of their data. Confirm approval?',
          'Yes',
          'No',
        );
        if (result === 'No') {
          return;
        }
      }
    }

    // check if unmarshalling errors
    let machineListError: string;
    try {
      const machineListOutput = await getJSONMachineList();
      machineListError = machineListOutput.error;
    } catch (error) {
      machineListError = (error as RunError).stderr;
    }

    let machineFolderToCheck: string | undefined;
    // check invalid config files only with v5
    if (installedPodman?.version.startsWith('5.')) {
      if (extensionApi.env.isMac) {
        machineFolderToCheck = path.resolve(os.homedir(), appConfigDir(), 'machine', 'applehv');
      } else if (extensionApi.env.isWindows) {
        machineFolderToCheck = path.resolve(os.homedir(), appConfigDir(), 'machine', 'wsl');
      }
    }
    if (machineFolderToCheck && isIncompatibleMachineOutput(machineListError) && fs.existsSync(machineFolderToCheck)) {
      // check for JSON files in the folder
      const files = await fs.promises.readdir(machineFolderToCheck);
      const machineFilesToAnalyze = files.filter(file => file.endsWith('.json'));
      let machineConfigJson: { GvProxy?: string } = {};
      const machineFolderToCheckValue = machineFolderToCheck;
      const allMachines = await Promise.all(
        machineFilesToAnalyze.map(async file => {
          // read content of the file
          const absoluteFile = path.join(machineFolderToCheckValue, file);
          try {
            const machineConfigJsonRaw = await fs.promises.readFile(absoluteFile, 'utf-8');
            machineConfigJson = JSON.parse(machineConfigJsonRaw);
          } catch (error: unknown) {
            console.error('Error reading machine file', file, error);
          }
          let machineName = file.replace('.json', '');
          if (machineName !== 'podman-machine-default') {
            machineName = `podman-${machineName}`;
          }

          return {
            file,
            machineName,
            machineFile: absoluteFile,
            json: machineConfigJson,
          };
        }),
      );

      const invalidMachines = allMachines.filter(machine => {
        // check if the machine has GvProxy field, if it doesn't, it's an invalid machine
        return !machine.json.GvProxy;
      });

      // prompt to remove these invalid machines
      if (invalidMachines.length > 0) {
        const result = await extensionApi.window.showWarningMessage(
          `Removing old unsupported Podman machines "${invalidMachines.map(m => m.machineName).join(', ')}" will delete all of their data. Confirm approval?`,
          'Yes',
          'No',
        );
        if (result === 'No') {
          return;
        }
        for (const machine of invalidMachines) {
          fileAndFoldersToRemove.push(machine.machineFile);
          if (machine.machineFile.includes('wsl') && extensionApi.env.isWindows) {
            wslMachinesToUnregister.push(machine.machineName);
          }
        }
      }
    }

    const errors: string[] = [];

    // stop and unregister old WSL machines
    for (const wslMachineName of wslMachinesToUnregister) {
      try {
        await extensionApi.process.exec('wsl', ['--terminate', wslMachineName]);
        await extensionApi.process.exec('wsl', ['--unregister', wslMachineName]);
      } catch (error) {
        console.error('Error removing WSL machine', wslMachineName, error);
        errors.push(`Unable to remove the WSL machine ${wslMachineName}: ${String(error)}`);
      }
    }

    if (fileAndFoldersToRemove.length > 0) {
      for (const folder of fileAndFoldersToRemove) {
        try {
          await fs.promises.rm(folder, { recursive: true, retryDelay: 1000, maxRetries: 3 });
        } catch (error) {
          console.error('Error removing folder', folder, error);
          errors.push(`Unable to remove the folder ${folder}: ${String(error)}`);
        }
      }

      extensionNotifications.disposeNotification();
    }

    if (errors.length > 0) {
      await extensionApi.window.showErrorMessage(`Error removing unsupported Podman machines. ${errors.join('\n')}`);
    }

    extensionApi.context.setValue('unsupportedMachineRemoved', 'ok', 'onboarding');
  });
}

async function exec(args: string[], options?: PodmanRunOptions): Promise<extensionApi.RunResult> {
  return execPodman(args, options?.connection?.connection.vmTypeDisplayName, options);
}

export async function initInversify(
  extensionContext: extensionApi.ExtensionContext,
  telemetryLogger: extensionApi.TelemetryLogger,
): Promise<{ podmanInstall: PodmanInstall; winPlatform: WinPlatform; podmanProvider: PodmanProvider }> {
  // create inversify binding for the extension
  inversifyBinding = new InversifyBinding(extensionContext, telemetryLogger);
  const inversifyContainer = await inversifyBinding.init();

  const podmanInstall = inversifyContainer.get(PodmanInstall);
  winPlatform = inversifyContainer.get(WinPlatform);
  podmanBinary = inversifyContainer.get(PodmanBinary);
  rosettaProvisioner = inversifyContainer.get(RosettaProvisioner);
  const podmanProvider = await inversifyContainer.getAsync(PodmanProvider);

  return { podmanInstall, winPlatform, podmanProvider };
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<PodmanExtensionApi> {
  stopLoop = false;

  initExtensionContext(extensionContext);

  initTelemetryLogger();

  initExtensionNotification();

  if (telemetryLogger) {
    await initializeCertificateDetection(telemetryLogger);
  }

  const { podmanInstall, podmanProvider } = await initInversify(extensionContext, telemetryLogger);

  const installedPodman = await podmanBinary.getBinaryInfo();
  const version: string | undefined = installedPodman?.version;

  if (version) {
    extensionApi.context.setValue(ROOTFUL_MACHINE_INIT_SUPPORTED_KEY, isRootfulMachineInitSupported(version));
    extensionApi.context.setValue(START_NOW_MACHINE_INIT_SUPPORTED_KEY, isStartNowAtMachineInitSupported(version));
    extensionApi.context.setValue(USER_MODE_NETWORKING_SUPPORTED_KEY, isUserModeNetworkingSupported(version));
    extensionApi.context.setValue(PODMAN_PROVIDER_LIBKRUN_SUPPORTED_KEY, isLibkrunSupported(version));
    extensionApi.context.setValue(PODMAN_IMPORT_NATIVE_CA_SUPPORTED_KEY, isPodman6OrLater(version));
    isMovedPodmanSocket = isPodmanSocketLocationMoved(version);
  }

  const podmanConfiguration = new PodmanConfiguration(extensionContext);
  await podmanConfiguration.init();

  const provider = podmanProvider.provider;

  // Compatibility mode status bar item
  // only available for macOS
  if (extensionApi.env.isMac) {
    // Register the command for disabling the do not show mac helper setting permanently
    extensionContext.subscriptions.push(extensionNotifications.setupNotificationMacPodman());

    // register two commands to enable and disable compatibility mode
    extensionContext.subscriptions.push(
      extensionApi.commands.registerCommand('podman.disableCompatibilityMode', async () => {
        await switchCompatibilityMode(false);
      }),
    );
    extensionContext.subscriptions.push(
      extensionApi.commands.registerCommand('podman.enableCompatibilityMode', async () => {
        await switchCompatibilityMode(true);
      }),
    );

    // Get the socketCompatibilityClass for the current OS.
    const socketCompatibilityMode = getSocketCompatibility();
    // update the initial context value
    const compatibilityEnabled = socketCompatibilityMode.isEnabled();
    extensionApi.context.setValue(PODMAN_DOCKER_COMPAT_ENABLE_KEY, compatibilityEnabled);

    // Create a modal dialog to ask the user if they want to enable or disable compatibility mode
    const command = extensionApi.commands.registerCommand('podman.socketCompatibilityMode', async () => {
      // Manually check to see if the socket is disguised (this will be called when pressing the status bar item)
      let isDisguisedPodmanSocket: boolean;
      try {
        isDisguisedPodmanSocket = await isDisguisedPodman();
      } catch (error: unknown) {
        telemetryLogger.logError('checkIfSocketDisguisedFailed', { error });
        console.debug('Error while check if the socket is disguised', error);
        await extensionApi.window.showInformationMessage('Could not get if Podman is disguised');
        return;
      }
      // We use isEnabled() as we do not want to "renable" again if the user has already enabled it.
      if (!isDisguisedPodmanSocket && !socketCompatibilityMode.isEnabled()) {
        const result = await extensionApi.window.showInformationMessage(
          `Do you want to enable Docker socket compatibility mode for Podman?\n\n${socketCompatibilityMode.details}`,
          'Enable',
          'Cancel',
        );

        if (result === 'Enable') {
          await switchCompatibilityMode(true);
        }
      } else {
        const result = await extensionApi.window.showInformationMessage(
          `Do you want to disable Docker socket compatibility mode for Podman?\n\n${socketCompatibilityMode.details}`,
          'Disable',
          'Cancel',
        );

        if (result === 'Disable') {
          await switchCompatibilityMode(false);
        }
      }
    });

    // Push the results of the command so we can unload it later
    extensionContext.subscriptions.push(command);

    // Do the check if the provider is actually ready.
    if (provider.status === 'ready') {
      await extensionNotifications.checkMacSocket();
    }
  }

  const doAutoStart = async (
    logger: extensionApi.Logger,
    autostartContext: extensionApi.AutostartContext,
  ): Promise<void> => {
    // If autostart has been enabled for the machine, try to start it.
    try {
      await updateMachines(provider, podmanConfiguration);
    } catch (error) {
      // ignore the update of machines
    }

    // do we have a running machine ?
    const isRunningMachine = Array.from(podmanMachinesStatuses.values()).find(
      connectionStatus => connectionStatus === 'started' || connectionStatus === 'starting',
    );
    if (isRunningMachine) {
      console.log('Podman extension:', 'Do not start a machine as there is already one starting or started');
      return;
    }

    // start the first machine if any
    const machines = Array.from(podmanMachinesStatuses.entries());
    if (machines.length > 0) {
      const [machineName] = machines[0];
      if (!podmanMachinesInfo.has(machineName)) {
        console.error('Unable to retrieve machine infos to be autostarted', machineName);
      } else {
        console.log('Podman extension:', 'Autostarting machine', machineName);
        const machineInfo = podmanMachinesInfo.get(machineName);
        const containerProviderConnection = containerProviderConnections.get(machineName);
        if (containerProviderConnection && machineInfo) {
          const context: extensionApi.LifecycleContext = extensionApi.provider.getProviderLifecycleContext(
            provider.id,
            containerProviderConnection,
          );
          await startMachine(provider, podmanConfiguration, machineInfo, context, logger, undefined, true);
          autostartContext.updateContainerConnection(containerProviderConnection);
          autoMachineStarted = true;
          autoMachineName = machineName;
        }
      }
    }
  };

  provider.registerAutostart({
    start: async (logger: extensionApi.Logger, autostartContext: extensionApi.AutostartContext) => {
      await doAutoStart(logger, autostartContext);
    },
  });

  extensionContext.subscriptions.push(provider);

  start(extensionContext, provider, podmanInstall, podmanConfiguration, version).catch((error: unknown) => {
    console.error('Error starting the Podman extension', error);
  });

  return {
    exec,
  };
}

export async function start(
  extensionContext: extensionApi.ExtensionContext,
  provider: extensionApi.Provider,
  podmanInstall: PodmanInstall,
  podmanConfiguration: PodmanConfiguration,
  version?: string,
): Promise<void> {
  await initCheckAndRegisterUpdate(provider, podmanInstall);

  if (version) {
    wslEnabled = await winPlatform.isWSLEnabled();
    const isWslAndHyperEnabled = wslEnabled && (await winPlatform.isHyperVEnabled());
    updateWSLHyperVEnabledContextValue(isWslAndHyperEnabled);
  }

  if (extensionApi.env.isMac) {
    provider.registerCleanup(new PodmanCleanupMacOS());
  } else if (extensionApi.env.isWindows) {
    provider.registerCleanup(new PodmanCleanupWindows());
  }

  // provide an installation path ?
  if (podmanInstall.isAbleToInstall()) {
    // init all install checks
    const installChecks = podmanInstall.getInstallChecks() ?? [];
    for (const check of installChecks) {
      await check.init?.();
    }
    provider.registerInstallation({
      install: () => podmanInstall.doInstallPodman(provider),
      preflightChecks: () => installChecks,
    });
  }

  // We allow creating machines for both macOS and Windows
  // but not Linux. The reasoning being is that podman for Linux is
  // NOT packaged with qemu + kvm by default. So, we don't want to
  // create machines on Linux via Podman Desktop, however we will still support
  // the lifecycle management of one.
  if (extensionApi.env.isMac || extensionApi.env.isWindows) {
    const handleCreateMachine = (
      params: Record<string, unknown>,
      logger?: extensionApi.Logger,
      token?: extensionApi.CancellationToken,
    ): Promise<void> => {
      return createMachine(params, podmanConfiguration, logger, token);
    };

    provider.setContainerProviderConnectionFactory(
      {
        initialize: () => handleCreateMachine({}),
        create: handleCreateMachine,
        creationDisplayName: 'Podman machine',
      },
      {
        auditItems: async (items: extensionApi.AuditRequestItems) => {
          return await connectionAuditor(items);
        },
      },
    );
  }

  // Linux has native container support (no need for Podman Machine), so we don't need to create machines.
  // Below is Linux specific code:
  // * Monitors the system service for an unlimited time
  // * Uses the native system socket
  if (extensionApi.env.isLinux) {
    // on Linux, need to run the system service for unlimited time
    let command = 'podman';
    let args = ['system', 'service', '--time=0'];
    const env = process.env;
    if (env.FLATPAK_ID) {
      // need to execute the command on the host
      command = 'flatpak-spawn';
      args = ['--host', 'podman', ...args];
    }
    const podmanProcess = spawn(command, args);
    podmanProcess.on('error', err => {
      console.error('Failed to spawn process.', err);
    });

    // check for up to 5s to see if the socket is being made available
    const socketPath = getLinuxSocketPath();
    let socketFound = false;
    for (let i = 0; i < 50; i++) {
      if (fs.existsSync(socketPath)) {
        socketFound = true;
        break;
      }
      await timeout(100);
    }
    if (!socketFound) {
      console.error(
        'Podman extension:',
        `Could not find the socket at ${socketPath} after 5s. The command podman system service --time=0 did not work to start the podman socket.`,
      );
    }

    provider.updateStatus('ready');
    const disposable = extensionApi.Disposable.create(() => {
      podmanProcess.kill();
    });

    extensionContext.subscriptions.push(disposable);
    initDefaultLinux(provider).catch((error: unknown) => {
      console.error('Error while initializing default linux', error);
    });
  }

  // Initialize remote connections before machine monitoring so hasConnections()
  // is populated before the first updateMachines() call
  podmanRemoteConnections = new PodmanRemoteConnections(extensionContext, provider);
  await podmanRemoteConnections.start();

  // Podman Machine support is on macOS, Windows and Linux
  // Despite Linux having native container support, Podman Machine is still supported on Linux
  // so let's monitor for the machines
  monitorMachines(provider, podmanConfiguration).catch((error: unknown) => {
    console.error('Error while monitoring machines', error);
  });

  // monitor provider
  // like version, checks, warnings
  monitorProvider(provider, doMonitorProvider).catch((error: unknown) => {
    console.error('Error while monitoring provider', error);
  });

  const onboardingCheckInstallationCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.checkInstalledCommand',
    async () => {
      const installation = await podmanBinary.getBinaryInfo();
      const installed = installation ? true : false;
      extensionApi.context.setValue('podmanIsNotInstalled', !installed, 'onboarding');
      telemetryLogger?.logUsage('podman.onboarding.checkInstalledCommand', {
        status: installed,
        version: installation?.version ?? '',
      });
    },
  );
  const onboardingUnsupportedPodmanMachineCommand = registerOnboardingUnsupportedPodmanMachineCommand();
  const onboardingRemoveUnsupportedMachinesCommand = registerOnboardingRemoveUnsupportedMachinesCommand();

  const onboardingCheckPodmanMachineExistsCommand = registerOnboardingMachineExistsCommand();

  const onboardingCheckReqsCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.checkRequirementsCommand',
    async () => {
      const checks = podmanInstall.getInstallChecks() ?? [];
      const result = [];
      let successful = true;
      let hasBlockingFailure = false;
      for (const check of checks) {
        try {
          const checkResult = await check.execute();

          result.push({
            name: check.title,
            successful: checkResult.successful,
            description: checkResult.description,
            docLinks: checkResult.docLinks,
            docLinksDescription: checkResult.docLinksDescription,
            fixCommand: checkResult.fixCommand,
          });

          if (!checkResult.successful) {
            successful = false;
            if (checkResult.severity !== 'warning') {
              hasBlockingFailure = true;
            }
          }
        } catch (err) {
          result.push({
            name: check.title,
            successful: false,
            description:
              err instanceof Error ? err.message : typeof err === 'object' ? err?.toString() : 'unknown error',
          });
          successful = false;
          hasBlockingFailure = true;
        }
      }

      const warnings = [];
      const telemetryRecords: Record<string, unknown> = {};
      telemetryRecords.successful = successful;

      for (const res of result) {
        const warning = {
          state: res.successful ? 'successful' : 'failed',
          description: res.description ?? res.name,
          docDescription: res.docLinksDescription,
          docLinks: res.docLinks,
          command: res.fixCommand,
        };
        warnings.push(warning);
        if (!res.successful) {
          telemetryRecords[res.name] = res.description ?? res.name;
        }
      }

      extensionApi.context.setValue(
        'requirementsStatus',
        successful ? 'ok' : hasBlockingFailure ? 'failed' : 'warnings',
        'onboarding',
      );
      extensionApi.context.setValue('warningsMarkdown', warnings, 'onboarding');
      telemetryLogger?.logUsage('podman.onboarding.checkRequirementsCommand', telemetryRecords);
    },
  );

  const onboardingInstallPodmanCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.installPodman',
    async () => {
      let installation: InstalledPodman | undefined;
      let installed = false;
      const telemetryOptions: Record<string, unknown> = {};
      try {
        await podmanInstall.doInstallPodman(provider);
        installation = await podmanBinary.getBinaryInfo();
        installed = installation ? true : false;
        extensionApi.context.setValue('podmanIsNotInstalled', !installed, 'onboarding');
      } catch (e) {
        console.error(e);
        extensionApi.context.setValue('podmanIsNotInstalled', true, 'onboarding');
        telemetryOptions.error = e;
      } finally {
        telemetryOptions.version = installation?.version ?? '';
        telemetryOptions.installed = installed;
        telemetryLogger?.logUsage('podman.onboarding.installPodman', telemetryOptions);
      }
    },
  );

  extensionContext.subscriptions.push(
    onboardingCheckInstallationCommand,
    onboardingCheckPodmanMachineExistsCommand,
    onboardingCheckReqsCommand,
    onboardingInstallPodmanCommand,
    onboardingUnsupportedPodmanMachineCommand,
    onboardingRemoveUnsupportedMachinesCommand,
  );

  const podmanCertSync = new PodmanCertificateSync(podmanMachinesStatuses, podmanMachinesInfo);
  const syncCertsCommand = extensionApi.commands.registerCommand('podman.synchronizeCertificates', async () => {
    await podmanCertSync.synchronizeAll();
  });
  extensionContext.subscriptions.push(syncCertsCommand);

  // register the registries
  const registrySetup = new RegistrySetup(podmanConfiguration.registryConfiguration);
  extensionContext.subscriptions.push(await registrySetup.setup());

  await calcPodmanMachineSetting();
}

export async function connectionAuditor(items: extensionApi.AuditRequestItems): Promise<extensionApi.AuditResult> {
  const records: extensionApi.AuditRecord[] = [];

  if (items['podman.factory.machine.image-uri'] && items['podman.factory.machine.image']) {
    records.push({
      type: 'error',
      record: `'Image' and 'Image URI' fields are both filled. Please fill only one or leave both fields empty.`,
    });
  }

  const podmanCheck = new MacPodmanInstallCheck().execute();
  // If is podman check not successful => installed with brew (does not contain krunkit & libkrun)
  if (!(await podmanCheck).successful) {
    const krunKitCheck = new MacKrunkitPodmanMachineCreationCheck().execute();
    if (!(await krunKitCheck).successful) {
      records.push({
        type: 'warning',
        record: `There is a problem finding the 'krunkit' binary. Try to install it manually, or install Podman from the installer.`,
      });
    }
  }

  const winProvider = items['podman.factory.machine.win.provider'];
  // set createWSLMachineOptionSelected if the user actively selected wsl from the list in the UI, or
  // if the list is not visible (so only one provider is active) and the provider is wsl
  const isWSL = winProvider === 'wsl' || (winProvider === undefined && wslEnabled);
  if (createWSLMachineOptionSelected !== isWSL) {
    createWSLMachineOptionSelected = isWSL;
    extensionApi.context.setValue(CREATE_WSL_MACHINE_OPTION_SELECTED_KEY, createWSLMachineOptionSelected);
  }

  return {
    records,
  };
}

export async function calcPodmanMachineSetting(): Promise<void> {
  let cpuSupported = true;
  let memorySupported = true;
  let diskSupported = true;

  if (extensionApi.env.isWindows) {
    const isHyperV = await winPlatform.isHyperVEnabled();
    cpuSupported = isHyperV;
    memorySupported = isHyperV;
    diskSupported = isHyperV;
  }

  extensionApi.context.setValue(PODMAN_MACHINE_CPU_SUPPORTED_KEY, cpuSupported);
  extensionApi.context.setValue(PODMAN_MACHINE_MEMORY_SUPPORTED_KEY, memorySupported);
  extensionApi.context.setValue(PODMAN_MACHINE_DISK_SUPPORTED_KEY, diskSupported);
}

// Function that checks to see if the default machine is running and return a string
export async function findRunningMachine(): Promise<string | undefined> {
  let runningMachine: string | undefined;

  // Find the machines
  const machineListOutput = await getJSONMachineList();
  const machines = machineListOutput.list;

  // Find the machine that is running
  const found: MachineJSON | undefined = machines.find(machine => machine?.Running);

  if (found) {
    runningMachine = found.Name;
  }

  return runningMachine;
}

async function stopAutoStartedMachine(): Promise<void> {
  if (!autoMachineStarted || !autoMachineName) {
    console.log('No machine to stop');
    return;
  }
  const machineListOutput = await getJSONMachineList();

  const machines = machineListOutput.list;

  // Find the autostarted machine and check its status
  const currentMachine: MachineJSON | undefined = machines.find(machine => machine?.Name === autoMachineName);

  if (!currentMachine?.Running && !currentMachine?.Starting) {
    console.log('No machine to stop');
    autoMachineStarted = false;
    return;
  }
  console.log('stopping autostarted machine', autoMachineName);
  await execPodman(['machine', 'stop', autoMachineName], currentMachine.VMType);
}

export async function getJSONMachineList(): Promise<MachineJSONListOutput> {
  const installedPodman = await podmanBinary.getBinaryInfo();

  let hypervEnabled = false;
  wslEnabled = await winPlatform.isWSLEnabled();
  if (await winPlatform.isHyperVEnabled()) {
    hypervEnabled = true;
  }
  updateWSLHyperVEnabledContextValue(wslEnabled && hypervEnabled);

  // For Podman >= 6.0, machine list returns all machines across all providers by default,
  // so a single call without specifying a provider is sufficient.
  if (installedPodman && isMachineListAllProvidersSupported(installedPodman.version)) {
    const machineListOutput = await getJSONMachineListByProvider();
    return {
      list: JSON.parse(machineListOutput.stdout) as MachineJSON[],
      error: machineListOutput.stderr,
    };
  }

  // For Podman < 6.0, iterate per provider to collect all machines.
  const containerMachineProviders: (string | undefined)[] = [];
  // if libkrun is supported we want to show both applehv and libkrun machines
  if (installedPodman && isLibkrunSupported(installedPodman.version)) {
    containerMachineProviders.push(...['applehv', 'libkrun']);
  }

  if (wslEnabled) {
    containerMachineProviders.push('wsl');
  }

  if (hypervEnabled) {
    containerMachineProviders.push('hyperv');
  }

  if (containerMachineProviders.length === 0) {
    // in all other cases we set undefined so that it executes normally by using the default container provider
    containerMachineProviders.push(undefined);
  }

  const list: MachineJSON[] = [];
  let error = '';
  for (const provider of containerMachineProviders) {
    try {
      const machineListOutput = await getJSONMachineListByProvider(provider);
      list.push(...(JSON.parse(machineListOutput.stdout) as MachineJSON[]));
      error += machineListOutput.stderr + '\n';
    } catch (err) {
      const runError = err as RunError;
      error += (runError.stderr ?? runError.message ?? String(err)) + '\n';
    }
  }

  return { list, error };
}

export async function getJSONMachineListByProvider(containerMachineProvider?: string): Promise<MachineListOutput> {
  const { stdout, stderr } = await execPodman(['machine', 'list', '--format', 'json'], containerMachineProvider);
  return { stdout, stderr };
}

export function resetStopLoop(): void {
  stopLoop = false;
}

export async function deactivate(): Promise<void> {
  stopLoop = true;
  console.log('stopping podman extension');
  await stopAutoStartedMachine().then(() => {
    if (autoMachineStarted) {
      console.log('stopped autostarted machine', autoMachineName);
    }
  });

  // cleanup
  listeners.clear();
  podmanMachinesInfo.clear();
  currentConnections.clear();
  containerProviderConnections.clear();

  await inversifyBinding?.dispose();
  inversifyBinding = undefined;

  if (certificateDetectionInterval) {
    clearInterval(certificateDetectionInterval);
    certificateDetectionInterval = undefined;
  }
  certificateDetectionService = undefined;
}

const PODMAN_MINIMUM_VERSION_FOR_NOW_FLAG_INIT = '4.0.0';

// Checks if start now flag at machine init is supported.
export function isStartNowAtMachineInitSupported(podmanVersion: string): boolean {
  return compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_NOW_FLAG_INIT) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_ROOTFUL_MACHINE_INIT = '4.1.0';

// Checks if rootful machine init is supported.
export function isRootfulMachineInitSupported(podmanVersion: string): boolean {
  return compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_ROOTFUL_MACHINE_INIT) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_PLAYBOOK_MACHINE_INIT = '5.4.0';

// Checks if playbook option is supported.
export function isPlaybookMachineInitSupported(podmanVersion: string): boolean {
  return compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_PLAYBOOK_MACHINE_INIT) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION = '4.5.0';

export function isPodmanSocketLocationMoved(podmanVersion: string): boolean {
  return extensionApi.env.isLinux && compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING = '4.6.0';

// Checks if user mode networking is supported. Only Windows platform allows this parameter to be tuned
export function isUserModeNetworkingSupported(podmanVersion: string): boolean {
  return extensionApi.env.isWindows && compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_LIBKRUN_SUPPORT = '5.2.0-rc1';

// Checks if libkrun is supported. Only Mac/silicon platform allows this parameter to be tuned
export function isLibkrunSupported(podmanVersion: string): boolean {
  return (
    extensionApi.env.isMac &&
    os.arch() === 'arm64' &&
    compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_LIBKRUN_SUPPORT) >= 0
  );
}

// Set wslEnabled. Used for testing purposes
export function setWSLEnabled(enabled: boolean): void {
  wslEnabled = enabled;
}

export function isPodman5OrLater(podmanVersion: string): boolean {
  return compare(podmanVersion, '5.0.0') >= 0;
}

export function isPodman6OrLater(podmanVersion: string): boolean {
  return compare(podmanVersion, '6.0.0') >= 0;
}

// Checks if `podman machine list` returns all machines across all providers without specifying one.
export function isMachineListAllProvidersSupported(podmanVersion: string): boolean {
  return isPodman6OrLater(podmanVersion);
}

export function sendTelemetryRecords(
  eventName: string,
  telemetryRecords: Record<string, unknown>,
  includeMachineStats: boolean,
): void {
  const sendJob = async (): Promise<void> => {
    // add CLI version
    const installedPodman = await podmanBinary.getBinaryInfo();
    if (installedPodman) {
      telemetryRecords.podmanCliVersion = installedPodman.version;
    }

    // add host cpu and memory
    const hostMemory = os.totalmem();
    telemetryRecords.hostMemory = hostMemory;
    const hostCpus = os.cpus();
    telemetryRecords.hostCpus = hostCpus.length;
    telemetryRecords.hostCpuModel = hostCpus[0].model;

    // on macOS, try to see if podman is coming from brew or from the installer
    // and display version of krunkit
    if (extensionApi.env.isMac) {
      let krunkitPath: string | undefined;

      try {
        const podmanBinaryResult = await podmanBinaryHelper.getPodmanLocationMac();

        telemetryRecords.podmanCliSource = podmanBinaryResult.source;
        if (podmanBinaryResult.source === 'installer') {
          krunkitPath = '/opt/podman/bin';
        }
        telemetryRecords.podmanCliFoundPath = podmanBinaryResult.foundPath;
        if (podmanBinaryResult.error) {
          telemetryRecords.errorPodmanSource = podmanBinaryResult.error;
        }
      } catch (error) {
        telemetryRecords.errorPodmanSource = error;
        console.trace('unable to check from which path podman is coming', error);
      }

      if (telemetryRecords.provider === 'libkrun') {
        // add krunkit version
        try {
          const krunkitVersion = await krunkitHelper.getKrunkitVersion(krunkitPath);
          if (krunkitPath) {
            telemetryRecords.krunkitPath = krunkitPath;
          }
          telemetryRecords.krunkitVersion = krunkitVersion;
        } catch (error) {
          console.trace('unable to check krunkit version', error);
          telemetryRecords.errorKrunkitVersion = error;
        }
      }
    } else if (extensionApi.env.isWindows) {
      // try to get wsl version
      try {
        const wslVersionData = await wslHelper.getWSLVersionData();
        telemetryRecords.wslVersion = wslVersionData.wslVersion;
        telemetryRecords.wslWindowsVersion = wslVersionData.windowsVersion;
        telemetryRecords.wslKernelVersion = wslVersionData.kernelVersion;
      } catch (error) {
        console.trace('unable to check wsl version', error);
        telemetryRecords.errorWslVersion = error;
      }
    } else if (extensionApi.env.isLinux && telemetryRecords.provider === 'qemu') {
      try {
        telemetryRecords.qemuVersion = await qemuHelper.getQemuVersion();
      } catch (err: unknown) {
        console.trace('unable to check qemu version', err);
        telemetryRecords.errorQemuVersion = err;
      }
    }

    // add server side information about the machine
    if (includeMachineStats && (extensionApi.env.isMac || extensionApi.env.isWindows)) {
      // add info from 'podman info command'
      await podmanInfoHelper.updateWithPodmanInfoRecords(telemetryRecords);
    }
    telemetryLogger?.logUsage(eventName, telemetryRecords);
  };

  sendJob().catch((error: unknown) => {
    console.error('Error while logging telemetry', error);
  });
}

export async function createMachine(
  params: { [key: string]: unknown },
  podmanConfiguration: PodmanConfiguration,
  logger?: extensionApi.Logger,
  token?: extensionApi.CancellationToken,
): Promise<void> {
  const parameters: string[] = [];
  parameters.push('machine');
  parameters.push('init');

  const telemetryRecords: Record<string, unknown> = {};

  let provider: string | undefined;
  if (params['podman.factory.machine.provider'] && typeof params['podman.factory.machine.provider'] === 'string') {
    if (os.arch() === 'x64') {
      // Intel machine
      provider = VMTYPE.APPLEHV;
    } else {
      provider = getProviderByLabel(params['podman.factory.machine.provider']);
    }
    await podmanConfiguration.updateMachineProviderSettings(provider as VMTYPE);
    telemetryRecords.provider = provider;
  } else if (
    params['podman.factory.machine.win.provider'] &&
    typeof params['podman.factory.machine.win.provider'] === 'string'
  ) {
    provider = params['podman.factory.machine.win.provider'];
    telemetryRecords.provider = provider;
  } else {
    if (extensionApi.env.isWindows) {
      provider = process.env.CONTAINERS_MACHINE_PROVIDER ?? 'wsl';
      telemetryRecords.provider = provider;
    } else if (extensionApi.env.isMac) {
      if (os.arch() === 'x64') {
        // Intel machine
        provider = VMTYPE.APPLEHV;
      } else {
        provider = VMTYPE.LIBKRUN;
      }
      await podmanConfiguration.updateMachineProviderSettings(provider as VMTYPE);
      telemetryRecords.provider = provider;
    }
  }

  // cpus
  if (params['podman.factory.machine.cpus'] && typeof params['podman.factory.machine.cpus'] === 'string') {
    let cpusValue = params['podman.factory.machine.cpus'];
    // libkrun has an issue that prevent to start a machine that has been created with more than 8 cpus, so we limit it here
    if (provider === VMTYPE.LIBKRUN && parseInt(cpusValue) > 8) {
      cpusValue = '8';
    }
    parameters.push('--cpus');
    parameters.push(cpusValue);
    telemetryRecords.cpus = cpusValue;
  }

  // memory
  if (params['podman.factory.machine.memory']) {
    parameters.push('--memory');
    const memoryAsMiB = +params['podman.factory.machine.memory'] / (1024 * 1024);
    // Hyper-V requires VMs to have memory in 2 MB increments. So we round it
    const roundedMemoryMiB = Math.floor((memoryAsMiB + 1) / 2) * 2;
    parameters.push(roundedMemoryMiB.toString());
    telemetryRecords.memory = params['podman.factory.machine.memory'];
  }

  // disk size
  if (params['podman.factory.machine.diskSize']) {
    parameters.push('--disk-size');
    const diskAsGiB = +params['podman.factory.machine.diskSize'] / (1024 * 1024 * 1024);
    parameters.push(Math.floor(diskAsGiB).toString());
    telemetryRecords.diskSize = params['podman.factory.machine.diskSize'];
  }

  const podmanInstallation = await podmanBinary.getBinaryInfo();
  const version = podmanInstallation?.version;
  // check for podman major version
  const isPodmanV5OrLater = version ? isPodman5OrLater(version) : false;
  // image
  if (params['podman.factory.machine.image'] && typeof params['podman.factory.machine.image'] === 'string') {
    if (isPodmanV5OrLater) {
      parameters.push('--image');
    } else {
      parameters.push('--image-path');
    }
    parameters.push(params['podman.factory.machine.image']);
    telemetryRecords.imagePath = 'custom';
  } else if (
    params['podman.factory.machine.image-uri'] &&
    typeof params['podman.factory.machine.image-uri'] === 'string'
  ) {
    const imageUri = params['podman.factory.machine.image-uri'].trim();
    if (isPodmanV5OrLater) {
      parameters.push('--image');
    } else {
      parameters.push('--image-path');
    }
    if (imageUri.startsWith('https://') || imageUri.startsWith('http://')) {
      parameters.push(imageUri);
      telemetryRecords.imagePath = 'custom-url';
    } else {
      parameters.push(`docker://${imageUri}`);
      telemetryRecords.imagePath = 'custom-registry';
    }
  } else if (extensionApi.env.isMac || (extensionApi.env.isWindows && provider === 'wsl')) {
    // check if we have an embedded asset for the image path for macOS or Windows
    const assetImagePath = path.resolve(getAssetsFolder(), `podman-image-${process.arch}.zst`);

    // Use embedded image only for Podman 5 and onwards
    if (fs.existsSync(assetImagePath) && isPodmanV5OrLater) {
      parameters.push('--image');
      parameters.push(assetImagePath);
      telemetryRecords.imagePath = 'embedded';
    }
  }
  telemetryRecords.imagePath ??= 'default';

  if (params['podman.factory.machine.rootful'] === undefined) {
    // should be rootful mode if version supports this mode and only if rootful is not provided (false or true)
    if (version) {
      const isRootfulSupported = isRootfulMachineInitSupported(version);
      if (isRootfulSupported) {
        params['podman.factory.machine.rootful'] = true;
      }
    }
  }

  // if playbook option is supported
  if (version && isPlaybookMachineInitSupported(version)) {
    // add the playbook option
    parameters.push('--playbook');
    // get the playbook script
    const playbookPath = await podmanConfiguration.registryConfiguration.getPlaybookScriptPath();
    parameters.push(playbookPath);
  }

  if (params['podman.factory.machine.rootful']) {
    parameters.push('--rootful');
    telemetryRecords.rootless = false;
    telemetryRecords.rootful = true;
  } else {
    telemetryRecords.rootless = true;
    telemetryRecords.rootful = false;
  }

  if (params['podman.factory.machine.user-mode-networking']) {
    parameters.push('--user-mode-networking');
    telemetryRecords.userModeNetworking = true;
  }

  const isPodmanV6OrLater = version ? isPodman6OrLater(version) : false;
  if (params['podman.factory.machine.import-native-ca'] && isPodmanV6OrLater) {
    parameters.push('--import-native-ca');
    telemetryRecords.importNativeCA = true;
  } else {
    telemetryRecords.importNativeCA = false;
  }

  // name at the end
  const args = [];
  let machineName = '';
  if (params['podman.factory.machine.name'] && typeof params['podman.factory.machine.name'] === 'string') {
    args.push(params['podman.factory.machine.name']);
    machineName = params['podman.factory.machine.name'];
    parameters.push(params['podman.factory.machine.name']);
    telemetryRecords.customName = params['podman.factory.machine.name'];
    telemetryRecords.defaultName = false;
  } else {
    telemetryRecords.defaultName = true;
  }

  // starts now
  if (params['podman.factory.machine.now']) {
    parameters.push('--now');
    telemetryRecords.start = true;
  } else {
    telemetryRecords.start = false;
  }

  const startTime = performance.now();
  try {
    await execPodman(parameters, provider, {
      logger,
      token,
    });
  } catch (error) {
    telemetryRecords.error = error;
    const runError = error as RunError;

    // if known error
    if (runError.stderr?.includes('VM already exists')) {
      telemetryRecords.errorCode = 'ErrVMAlreadyExists';
    } else if (runError.stderr?.includes('VM already running or starting')) {
      telemetryRecords.errorCode = 'ErrVMAlreadyRunning';
    } else if (runError.stderr?.includes('only one VM can be active at a time')) {
      telemetryRecords.errorCode = 'ErrMultipleActiveVM';
    }

    let errorMessage = runError.name ? `${runError.name}\n` : '';
    errorMessage += runError.message ? `${runError.message}\n` : '';
    errorMessage += runError.stderr ? `${runError.stderr}\n` : '';
    throw errorMessage || error;
  } finally {
    const endTime = performance.now();
    telemetryRecords.duration = endTime - startTime;
    sendTelemetryRecords('podman.machine.init', telemetryRecords, false);
  }
  // On macOS Tahoe with AppleHV + Podman 5.6+, provision /etc/containers/enable-rosetta
  // inside the VM as part of machine creation so Rosetta is active from first use.
  // https://blog.podman.io/2025/08/podman-5-6-released-rosetta-status-update/
  if (extensionApi.env.isMac && version) {
    try {
      if (params['podman.factory.machine.now']) {
        await rosettaProvisioner.provisionAndRestartForRosetta(machineName, provider, podmanConfiguration, version, {
          logger,
        });
      } else {
        // Machine is stopped. Check conditions without SSH first; only start/stop
        // the machine temporarily when actually needed.
        const setupNeeded = await rosettaProvisioner.needsRosettaEnableFile(podmanConfiguration, version, provider);
        if (setupNeeded) {
          await execPodman(['machine', 'start', ...args], provider, { logger });
          try {
            await execPodman(['machine', 'ssh', ...args, `sudo touch ${ROSETTA_ENABLE_FILE}`], provider);
          } finally {
            await execPodman(['machine', 'stop', ...args], provider);
          }
        }
      }
    } catch (err) {
      console.warn(`Failed to set up Rosetta enable file during machine creation: ${err}`);
    }
  }

  extensionApi.context.setValue('podmanMachineExists', true, 'onboarding');
  extensionNotifications.disposeNotification();
}

export function resetShouldNotifySetup(): void {
  extensionNotifications.shouldNotifySetup = true;
}

export function resetWSLWarningFlag(): void {
  wslWarningShown = false;
}

async function switchCompatibilityMode(enabled: boolean): Promise<void> {
  const socketCompatibilityMode = getSocketCompatibility();

  if (enabled) {
    await socketCompatibilityMode.enable();
  } else {
    await socketCompatibilityMode.disable();
  }
  // update the context value
  extensionApi.context.setValue(PODMAN_DOCKER_COMPAT_ENABLE_KEY, socketCompatibilityMode.isEnabled());
}

export function updateWSLHyperVEnabledContextValue(value: boolean): void {
  if (wslAndHypervEnabledContextValue !== value) {
    wslAndHypervEnabledContextValue = value;
    extensionApi.context.setValue(WSL_HYPERV_ENABLED_KEY, value);
  }
}

async function initializeCertificateDetection(telemetryLogger: extensionApi.TelemetryLogger): Promise<void> {
  certificateDetectionService = new CertificateDetectionService(telemetryLogger, {
    enableTelemetry: true,
  });

  // Initial detection
  _doDetectCustomCertificates(certificateDetectionService);

  // Set up periodic detection (every 24 hours)
  certificateDetectionInterval = setInterval(
    () => {
      if (certificateDetectionService) {
        _doDetectCustomCertificates(certificateDetectionService);
      }
    },
    24 * 60 * 60 * 1000,
  );
}

function _doDetectCustomCertificates(certificateService: CertificateDetectionService): void {
  certificateService.detectCustomCertificates().catch((error: unknown) => {
    console.warn(`Can't detect custom registry certificates: ${error}`);
  });
}
