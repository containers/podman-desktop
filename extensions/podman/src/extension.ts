/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';

import type { ContainerEngineInfo, RunError } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { compareVersions } from 'compare-versions';

import { getSocketCompatibility } from './compatibility-mode';
import { getDetectionChecks } from './detection-checks';
import { PodmanBinaryLocationHelper } from './podman-binary-location-helper';
import { PodmanCleanupMacOS } from './podman-cleanup-macos';
import { PodmanCleanupWindows } from './podman-cleanup-windows';
import type { InstalledPodman } from './podman-cli';
import { getPodmanCli, getPodmanInstallation } from './podman-cli';
import { PodmanConfiguration } from './podman-configuration';
import { PodmanInfoHelper } from './podman-info-helper';
import { PodmanInstall } from './podman-install';
import { QemuHelper } from './qemu-helper';
import { RegistrySetup } from './registry-setup';
import { appConfigDir, appHomeDir, getAssetsFolder, isLinux, isMac, isWindows, LoggerDelegator } from './util';
import { getDisguisedPodmanInformation, getSocketPath, isDisguisedPodman } from './warnings';
import { WslHelper } from './wsl-helper';

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
let defaultMachineNotify = !isLinux();
let defaultConnectionNotify = !isLinux();
let defaultMachineMonitor = true;

// current status of machines
const podmanMachinesStatuses = new Map<string, extensionApi.ProviderConnectionStatus>();
let podmanProviderStatus: extensionApi.ProviderConnectionStatus = 'started';
const podmanMachinesInfo = new Map<string, MachineInfo>();
const currentConnections = new Map<string, extensionApi.Disposable>();
const containerProviderConnections = new Map<string, extensionApi.ContainerProviderConnection>();

// Warning to check to see if the socket is a disguised Podman socket,
// by default we assume it is until proven otherwise when we check
let isDisguisedPodmanSocket = true;
let disguisedPodmanSocketWatcher: extensionApi.FileSystemWatcher | undefined;

// Configuration buttons
const configurationCompatibilityMode = 'setting.dockerCompatibility';
let telemetryLogger: extensionApi.TelemetryLogger | undefined;

const wslHelper = new WslHelper();
const qemuHelper = new QemuHelper();
const podmanBinaryHelper = new PodmanBinaryLocationHelper();
const podmanInfoHelper = new PodmanInfoHelper();

let shouldNotifySetup = true;
const setupPodmanNotification: extensionApi.NotificationOptions = {
  title: 'Podman needs to be set up',
  body: 'The Podman extension is installed, yet requires configuration. Some features might not function optimally.',
  type: 'info',
  markdownActions: ':button[Set up]{href=/preferences/onboarding/podman-desktop.podman title="Set up Podman"}',
  highlight: true,
  silent: true,
};
let notificationDisposable: extensionApi.Disposable;

export type MachineJSON = {
  Name: string;
  CPUs: number;
  Memory: string;
  DiskSize: string;
  Running: boolean;
  Starting: boolean;
  Default: boolean;
  UserModeNetworking?: boolean;
};

export type ConnectionJSON = {
  Name: string;
  URI: string;
  Identity: string;
  IsMachine: boolean;
  Default: boolean;
};

export type MachineInfo = {
  name: string;
  cpus: number;
  memory: number;
  diskSize: number;
  userModeNetworking: boolean;
  cpuUsage: number;
  diskUsage: number;
  memoryUsage: number;
};

export type MachineListOutput = {
  stdout: string;
  stderr: string;
};

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

export async function updateMachines(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
): Promise<void> {
  // init machines available
  let machineListOutput: MachineListOutput;
  try {
    machineListOutput = await getJSONMachineList();
  } catch (error) {
    let shouldCleanMachine = false;
    // check if field stderr is present in the error object
    const runError = error as RunError;
    if (runError.stderr) {
      shouldCleanMachine = isIncompatibleMachineOutput(runError.stderr);
    }
    extensionApi.context.setValue(CLEANUP_REQUIRED_MACHINE_KEY, shouldCleanMachine);

    // Only on macOS and Windows should we show the setup notification
    // if for some reason doing getJSONMachineList fails..
    if (shouldNotifySetup && !isLinux()) {
      // push setup notification
      notificationDisposable = extensionApi.window.showNotification(setupPodmanNotification);
      shouldNotifySetup = false;
    }
    throw error;
  }

  // parse output
  const machines = JSON.parse(machineListOutput.stdout) as MachineJSON[];
  extensionApi.context.setValue('podmanMachineExists', machines.length > 0, 'onboarding');
  const installedPodman = await getPodmanInstallation();
  let shouldCleanMachine = false;
  if (installedPodman) {
    shouldCleanMachine = shouldNotifyQemuMachinesWithV5(installedPodman);
  }
  // check if the machine needs to be cleaned for v4 --> v5 format
  if (!shouldCleanMachine) {
    shouldCleanMachine = isIncompatibleMachineOutput(machineListOutput.stderr);
  }

  // invalid machines is not making the provider working properly so always notify
  if (shouldCleanMachine && shouldNotifySetup && !isLinux()) {
    // push setup notification
    notificationDisposable = extensionApi.window.showNotification(setupPodmanNotification);
    shouldCleanMachine = false;
  }

  extensionApi.context.setValue(CLEANUP_REQUIRED_MACHINE_KEY, shouldCleanMachine);

  // Only show the notification on macOS and Windows
  // as Podman is already installed on Linux and machine is OPTIONAL.
  if (shouldNotifySetup && machines.length === 0 && !isLinux()) {
    // push setup notification
    notificationDisposable = extensionApi.window.showNotification(setupPodmanNotification);
    shouldNotifySetup = false;
  }

  // update status of existing machines
  for (const machine of machines) {
    const running = machine?.Running === true;
    let status: extensionApi.ProviderConnectionStatus = running ? 'started' : 'stopped';

    // update the status to starting if the machine is starting but not yet running
    const starting = machine?.Starting === true;
    if (!running && starting) {
      status = 'starting';
    }

    let machineInfo: ContainerEngineInfo | undefined = undefined;
    if (running) {
      try {
        machineInfo = await extensionApi.containerEngine.info(`podman.${prettyMachineName(machine.Name)}`);
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

    const userModeNetworking = isWindows() ? !!machine.UserModeNetworking : true;
    podmanMachinesInfo.set(machine.Name, {
      name: machine.Name,
      memory: machineInfo?.memory ? machineInfo.memory : Number(machine.Memory),
      cpus: machineInfo?.cpus ? machineInfo.cpus : machine.CPUs,
      diskSize: machineInfo?.diskSize ? machineInfo.diskSize : Number(machine.DiskSize),
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
        if (isWindows()) {
          const { stdout: socket } = await extensionApi.process.exec(getPodmanCli(), [
            'machine',
            'inspect',
            '--format',
            '{{.ConnectionInfo.PodmanPipe.Path}}',
            machineName,
          ]);
          socketPath = socket;
        } else {
          const { stdout: socket } = await extensionApi.process.exec(getPodmanCli(), [
            'machine',
            'inspect',
            '--format',
            '{{.ConnectionInfo.PodmanSocket.Path}}',
            machineName,
          ]);
          socketPath = socket;
        }
      } catch (error) {
        console.debug('Podman extension:', 'Failed to read socketPath from machine inspect');
      }
      if (!socketPath) {
        if (isMac()) {
          socketPath = calcMacosSocketPath(machineName);
        } else if (isLinux()) {
          socketPath = calcLinuxSocketPath(machineName);
        } else if (isWindows()) {
          socketPath = calcWinPipeName(machineName);
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
  if (!isLinux()) {
    if (machines.length === 0) {
      if (provider.status !== 'configuring') {
        provider.updateStatus('installed');
      }
    } else {
      const atLeastOneMachineRunning = machines.some(machine => machine.Running);
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
    const isRootful = await isRootfulMachine(runningMachine.Name);
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
          await extensionApi.process.exec(getPodmanCli(), ['system', 'connection', 'default', connectionName]);
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
      const machineIsRootful = await isRootfulMachine(runningMachine.Name);

      try {
        const connectionName = machineIsRootful ? `${runningMachine.Name}${ROOTFUL_SUFFIX}` : runningMachine.Name;
        // make it the default to run the info command
        await extensionApi.process.exec(getPodmanCli(), ['system', 'connection', 'default', connectionName]);
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

async function isRootfulMachine(machineName: string): Promise<boolean> {
  let isRootful = false;
  try {
    const { stdout: machineInspectJson } = await extensionApi.process.exec(getPodmanCli(), [
      'machine',
      'inspect',
      machineName,
    ]);
    const machinesInspect = JSON.parse(machineInspectJson);
    // find the machine name in the array
    const machineInspect = machinesInspect.find((machine: { Name: string }) => machine.Name === machineName);
    isRootful = machineInspect?.Rootful ?? false;
  } catch (error) {
    console.error('Error when checking rootful machine: ', error);
  }
  return isRootful;
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

  // Set values for the machine
  await containerConfiguration.update('machine.cpus', machineInfo.cpus);
  await containerConfiguration.update('machine.cpusUsage', machineInfo.cpuUsage);
  await containerConfiguration.update('machine.memory', machineInfo.memory);
  await containerConfiguration.update('machine.memoryUsage', machineInfo.memoryUsage);
  await containerConfiguration.update('machine.diskSize', machineInfo.diskSize);
  await containerConfiguration.update('machine.diskSizeUsage', machineInfo.diskUsage);
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

function calcWinPipeName(machineName: string): string {
  const name = machineName.startsWith('podman') ? machineName : 'podman-' + machineName;
  return `//./pipe/${name}`;
}

function getLinuxSocketPath(): string {
  // grab user id of the user
  const userInfo = os.userInfo();
  const uid = userInfo.uid;

  return `/run/user/${uid}/podman/podman.sock`;
}

// on linux, socket is started by the system service on a path like /run/user/1000/podman/podman.sock
async function initDefaultLinux(provider: extensionApi.Provider): Promise<void> {
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

  monitorPodmanSocket(socketPath).catch((error: unknown) => {
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

async function monitorPodmanSocket(socketPath: string, machineName?: string): Promise<void> {
  // call us again
  if (!stopMonitoringPodmanSocket(machineName)) {
    try {
      const alive = await isPodmanSocketAlive(socketPath);
      if (!alive) {
        updateProviderStatus('stopped', machineName);
      } else {
        updateProviderStatus('started', machineName);
      }
    } catch (error) {
      // ignore the update of machines
    }
    await timeout(5000);
    monitorPodmanSocket(socketPath, machineName).catch((error: unknown) => {
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

function updateProviderStatus(status: extensionApi.ProviderConnectionStatus, machineName?: string): void {
  if (machineName) {
    podmanMachinesStatuses.set(machineName, status);
  } else {
    podmanProviderStatus = status;
  }
}

async function timeout(time: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
}

async function monitorMachines(
  provider: extensionApi.Provider,
  podmanConfiguration: PodmanConfiguration,
): Promise<void> {
  // call us again
  if (!stopLoop) {
    try {
      await updateMachines(provider, podmanConfiguration);
    } catch (error) {
      // ignore the update of machines
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

async function monitorProvider(provider: extensionApi.Provider): Promise<void> {
  // call us again
  if (!stopLoop) {
    try {
      const installedPodman = await getPodmanInstallation();
      provider.updateDetectionChecks(getDetectionChecks(installedPodman));

      // update version
      if (!installedPodman) {
        provider.updateStatus('not-installed');
        extensionApi.context.setValue('podmanIsNotInstalled', true, 'onboarding');
        // if podman is not installed and the OS is linux we show the podman onboarding notification (if it has not been shown earlier)
        // this should be limited to Linux as in other OSes the onboarding workflow is enabled based on the podman machine existance
        // and the notification is handled by checking the machine
        if (isLinux() && shouldNotifySetup) {
          // push setup notification
          notificationDisposable = extensionApi.window.showNotification(setupPodmanNotification);
          shouldNotifySetup = false;
        }
      } else if (installedPodman.version) {
        provider.updateVersion(installedPodman.version);
        // update provider status if someone has installed podman externally
        if (provider.status === 'not-installed') {
          provider.updateStatus('installed');
        }

        extensionApi.context.setValue('podmanIsNotInstalled', false, 'onboarding');
        // if podman has been installed, we reset the notification flag so if podman is uninstalled in future we can show the notification again
        if (isLinux()) {
          shouldNotifySetup = true;
          // notification is no more required
          notificationDisposable?.dispose();
        }
      }
    } catch (error) {
      // ignore the update
    }
  }
  await timeout(8000);
  monitorProvider(provider).catch((error: unknown) => {
    console.error('Error monitoring podman provider', error);
  });
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
  const lifecycle: extensionApi.ProviderConnectionLifecycle = {
    start: async (context, logger): Promise<void> => {
      await startMachine(provider, podmanConfiguration, machineInfo, context, logger, undefined, false);
    },
    stop: async (context, logger): Promise<void> => {
      await extensionApi.process.exec(getPodmanCli(), ['machine', 'stop', machineInfo.name], {
        logger: new LoggerDelegator(context, logger),
      });
      provider.updateStatus('stopped');
    },
    delete: async (logger): Promise<void> => {
      await extensionApi.process.exec(getPodmanCli(), ['machine', 'rm', '-f', machineInfo.name], { logger });
    },
  };
  //support edit only on MacOS as Podman WSL is nop and generates errors
  if (isMac()) {
    lifecycle.edit = async (context, params, logger, _token): Promise<void> => {
      let effective = false;
      const args = ['machine', 'set', machineInfo.name];
      for (const key of Object.keys(params)) {
        if (key === 'podman.machine.cpus') {
          args.push('--cpus', params[key]);
          effective = true;
        } else if (key === 'podman.machine.memory') {
          args.push('--memory', Math.floor(params[key] / (1024 * 1024)).toString());
          effective = true;
        } else if (key === 'podman.machine.diskSize') {
          args.push('--disk-size', Math.floor(params[key] / (1024 * 1024 * 1024)).toString());
          effective = true;
        }
      }
      if (effective) {
        const state = podmanMachinesStatuses.get(machineInfo.name);
        try {
          if (state === 'started') {
            await lifecycle.stop?.(context, logger);
          }
          await extensionApi.process.exec(getPodmanCli(), args, {
            logger: new LoggerDelegator(context, logger),
          });
        } finally {
          if (state === 'started') {
            await lifecycle.start?.(context, logger);
          }
        }
      }
    };
  }

  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: prettyMachineName(machineInfo.name),
    type: 'podman',
    status: () => podmanMachinesStatuses.get(machineInfo.name) ?? 'unknown',
    lifecycle,
    endpoint: {
      socketPath,
    },
  };

  // Since Podman 4.5, machines are using the same path for all sockets of machines
  // so a machine is not distinguishable from another one.
  // monitorPodmanSocket(socketPath, machineInfo.name);
  containerProviderConnections.set(machineInfo.name, containerProviderConnection);

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  provider.updateStatus('ready');

  // get configuration for this connection
  const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);

  // Set values for the machine
  await containerConfiguration.update('machine.cpus', machineInfo.cpus);
  await containerConfiguration.update('machine.memory', machineInfo.memory);
  await containerConfiguration.update('machine.diskSize', machineInfo.diskSize);
  await containerConfiguration.update('machine.cpusUsage', machineInfo.cpuUsage);
  await containerConfiguration.update('machine.memoryUsage', machineInfo.memoryUsage);
  await containerConfiguration.update('machine.diskSizeUsage', machineInfo.diskUsage);

  currentConnections.set(machineInfo.name, disposable);
  storedExtensionContext?.subscriptions.push(disposable);
}

export async function checkRosettaMacArm(podmanConfiguration: PodmanConfiguration): Promise<void> {
  // check that rosetta is there for macOS / arm as the machine may fail to start
  if (isMac() && os.arch() === 'arm64') {
    const isEnabled = await podmanConfiguration.isRosettaEnabled();
    if (isEnabled) {
      // call the command `arch -arch x86_64 uname -m` to check if rosetta is enabled
      // if not installed, it will fail
      try {
        await extensionApi.process.exec('arch', ['-arch', 'x86_64', 'uname', '-m']);
      } catch (error: unknown) {
        const runError = error as RunError;
        if (runError.stderr?.includes('Bad CPU')) {
          // rosetta is enabled but not installed, it will fail, stop from there and prompt the user to install rosetta or disable rosetta support
          const result = await extensionApi.window.showInformationMessage(
            'Podman machine is configured to use Rosetta but the support is not installed. The startup of the machine will fail.\nDo you want to install Rosetta? Rosetta is allowing to execute amd64 images on Apple silicon architecture.',
            'Yes',
            'No',
            'Disable rosetta support',
          );
          if (result === 'Yes') {
            // ask the person to perform the installation using cli
            await extensionApi.window.showInformationMessage(
              'Please install Rosetta from the command line by running `softwareupdate --install-rosetta`',
            );
          } else if (result === 'Disable rosetta support') {
            await podmanConfiguration.updateRosettaSetting(false);
          }
        }
      }
    }
  }
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
  const startTime = performance.now();

  await checkRosettaMacArm(podmanConfiguration);

  try {
    // start the machine
    await extensionApi.process.exec(getPodmanCli(), ['machine', 'start', machineInfo.name], {
      logger: new LoggerDelegator(context, logger),
    });
    provider.updateStatus('started');
  } catch (err) {
    telemetryRecords.error = err;
    if (skipHandleError) {
      console.error(err);
      // propagate the error
      throw err;
    }
    await doHandleError(provider, machineInfo, typeof err === 'string' ? err : (err as RunError));
  } finally {
    // send telemetry event
    const endTime = performance.now();
    telemetryRecords.duration = endTime - startTime;
    telemetryRecords.autoStart = autoStart === true;
    sendTelemetryRecords('podman.machine.start', telemetryRecords, true);
  }
}

async function doHandleError(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  error: string | RunError,
): Promise<void> {
  let errText: string = '';

  if (typeof error === 'object' && 'message' in error) {
    errText = error.message.toString();
  } else if (typeof error === 'string') {
    errText = error;
  }

  if (errText.toLowerCase().includes('wsl bootstrap script failed: exit status 0xffffffff')) {
    const handled = await doHandleWSLDistroNotFoundError(provider, machineInfo);
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
            undefined,
            undefined,
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
  if (updateInfo.hasUpdate && updateInfo.bundledVersion) {
    return provider.registerUpdate({
      version: updateInfo.bundledVersion,
      update: () => {
        // disable notification before the update to prevent the notification to be shown and re-enabled when update is done
        shouldNotifySetup = false;
        return podmanInstall.performUpdate(provider, installedPodman).finally(() => (shouldNotifySetup = true));
      },
      preflightChecks: () => podmanInstall.getUpdatePreflightChecks() ?? [],
    });
  }
}

export const ROOTFUL_MACHINE_INIT_SUPPORTED_KEY = 'podman.isRootfulMachineInitSupported';
export const USER_MODE_NETWORKING_SUPPORTED_KEY = 'podman.isUserModeNetworkingSupported';
export const START_NOW_MACHINE_INIT_SUPPORTED_KEY = 'podman.isStartNowAtMachineInitSupported';
export const CLEANUP_REQUIRED_MACHINE_KEY = 'podman.needPodmanMachineCleanup';
export const PODMAN_MACHINE_CPU_SUPPORTED_KEY = 'podman.podmanMachineCpuSupported';
export const PODMAN_MACHINE_MEMORY_SUPPORTED_KEY = 'podman.podmanMachineMemorySupported';
export const PODMAN_MACHINE_DISK_SUPPORTED_KEY = 'podman.podmanMachineDiskSupported';

export function initTelemetryLogger(): void {
  telemetryLogger = extensionApi.env.createTelemetryLogger();
}

export function initExtensionContext(extensionContext: extensionApi.ExtensionContext): void {
  storedExtensionContext = extensionContext;
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
    const podmanInstalledValue = await getPodmanInstallation();
    const disposable = await registerUpdatesIfAny(provider, podmanInstalledValue, podmanInstall);
    if (disposable) {
      currentUpdatesDisposables.push(disposable);
    }
  };
  await checkForUpdate();

  // register onDidUpdateVersion
  provider.onDidUpdateVersion(async () => {
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
      const machines = JSON.parse(machineListOutput.stdout) as MachineJSON[];
      machineLength = machines.length;
    } catch (error) {
      machineLength = 0;
    }
    extensionApi.context.setValue('podmanMachineExists', machineLength > 0, 'onboarding');
  });
}

export function registerOnboardingUnsupportedPodmanMachineCommand(): extensionApi.Disposable {
  return extensionApi.commands.registerCommand('podman.onboarding.checkUnsupportedPodmanMachine', async () => {
    let isUnsupported = false;
    const installedPodman = await getPodmanInstallation();
    if (installedPodman) {
      isUnsupported = shouldNotifyQemuMachinesWithV5(installedPodman);
    }

    // check if the machine needs to be cleaned for v4 --> v5 format
    if (!isUnsupported) {
      try {
        const machineListOutput = await getJSONMachineList();
        isUnsupported = isIncompatibleMachineOutput(machineListOutput.stderr);
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

    const installedPodman = await getPodmanInstallation();

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
    let machineListError = '';
    try {
      const machineListOutput = await getJSONMachineList();
      machineListError = machineListOutput.stderr;
    } catch (error) {
      machineListError = (error as RunError).stderr;
    }

    let machineFolderToCheck: string | undefined;
    // check invalid config files only with v5
    if (installedPodman?.version.startsWith('5.')) {
      if (isMac()) {
        machineFolderToCheck = path.resolve(os.homedir(), appConfigDir(), 'machine', 'applehv');
      } else if (isWindows()) {
        machineFolderToCheck = path.resolve(os.homedir(), appConfigDir(), 'machine', 'wsl');
      }
    }
    if (machineFolderToCheck && isIncompatibleMachineOutput(machineListError) && fs.existsSync(machineFolderToCheck)) {
      // check for JSON files in the folder
      const files = await fs.promises.readdir(machineFolderToCheck);
      const machineFilesToAnalyze = files.filter(file => file.endsWith('.json'));
      let machineConfigJson: { GvProxy?: string } = {};
      const allMachines = await Promise.all(
        machineFilesToAnalyze.map(async file => {
          // read content of the file
          const absoluteFile = path.join(machineFolderToCheck, file);
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
          if (machine.machineFile.includes('wsl') && isWindows()) {
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

      shouldNotifySetup = true;
      // notification is no more required
      notificationDisposable?.dispose();
    }

    if (errors.length > 0) {
      await extensionApi.window.showErrorMessage(`Error removing unsupported Podman machines. ${errors.join('\n')}`);
    }

    extensionApi.context.setValue('unsupportedMachineRemoved', 'ok', 'onboarding');
  });
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  initExtensionContext(extensionContext);

  initTelemetryLogger();

  const podmanInstall = new PodmanInstall(extensionContext);

  const installedPodman = await getPodmanInstallation();
  const version: string | undefined = installedPodman?.version;

  if (version) {
    extensionApi.context.setValue(ROOTFUL_MACHINE_INIT_SUPPORTED_KEY, isRootfulMachineInitSupported(version));
    extensionApi.context.setValue(START_NOW_MACHINE_INIT_SUPPORTED_KEY, isStartNowAtMachineInitSupported(version));
    extensionApi.context.setValue(USER_MODE_NETWORKING_SUPPORTED_KEY, isUserModeNetworkingSupported(version));
    isMovedPodmanSocket = isPodmanSocketLocationMoved(version);
  }

  const detectionChecks: extensionApi.ProviderDetectionCheck[] = [];
  let status: extensionApi.ProviderStatus = 'not-installed';
  if (version) {
    status = 'installed';
  }
  // update detection checks
  detectionChecks.push(...getDetectionChecks(installedPodman));

  const providerOptions: extensionApi.ProviderOptions = {
    name: 'Podman',
    id: 'podman',
    detectionChecks,
    status,
    version,
  };

  // add images
  providerOptions.images = {
    icon: './icon.png',
    logo: './logo.png',
  };

  // Empty connection descriptive message
  providerOptions.emptyConnectionMarkdownDescription =
    'Podman is a lightweight, open-source container runtime and image management tool that enables users to run and manage containers without the need for a separate daemon.\n\nMore information: [podman.io](https://podman.io/)';

  const corePodmanEngineLinkGroup = 'Core Podman Engine';

  // add links
  providerOptions.links = [
    {
      title: 'Website',
      url: 'https://podman.io/',
    },
    {
      title: 'Installation guide',
      url: 'https://podman.io/getting-started/installation',
    },
    {
      title: 'Docker compatibility guide',
      url: 'https://podman-desktop.io/docs/troubleshooting#warning-about-docker-compatibility-mode',
    },
    {
      title: 'Join the community',
      url: 'https://podman.io/community/',
    },
    {
      title: 'Getting started with containers',
      url: 'https://podman.io/getting-started/',
      group: corePodmanEngineLinkGroup,
    },
    {
      title: 'View podman commands',
      url: 'https://docs.podman.io/en/latest/Commands.html',
      group: corePodmanEngineLinkGroup,
    },
    {
      title: 'Set up podman',
      url: 'https://podman.io/getting-started/installation',
      group: corePodmanEngineLinkGroup,
    },
    {
      title: 'View all tutorials',
      url: 'https://docs.podman.io/en/latest/Tutorials.html',
      group: corePodmanEngineLinkGroup,
    },
  ];

  const podmanConfiguration = new PodmanConfiguration();
  await podmanConfiguration.init();

  const provider = extensionApi.provider.createProvider(providerOptions);

  // Check on initial setup
  await checkDisguisedPodmanSocket(provider);

  // Update the status of the provider if the socket is changed, created or deleted
  disguisedPodmanSocketWatcher = setupDisguisedPodmanSocketWatcher(provider, getSocketPath());
  if (disguisedPodmanSocketWatcher) {
    extensionContext.subscriptions.push(disguisedPodmanSocketWatcher);
  }

  // Compatibility mode status bar item
  // only available for macOS
  if (isMac()) {
    // Handle any configuration changes (for example, changing the boolean button for compatibility mode)
    extensionApi.configuration.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration(`podman.${configurationCompatibilityMode}`)) {
        await handleCompatibilityModeSetting();
      }
    });

    // Get the socketCompatibilityClass for the current OS.
    const socketCompatibilityMode = getSocketCompatibility();

    // Create a status bar item to show the status of compatibility mode as well as
    // create a command so when you can disable / enable compatibility mode
    const statusBarItem = extensionApi.window.createStatusBarItem();
    statusBarItem.text = 'Docker Compatibility';
    statusBarItem.command = 'podman.socketCompatibilityMode';

    // Use tooltip text from class
    statusBarItem.tooltip = socketCompatibilityMode.tooltipText();

    statusBarItem.iconClass = 'fa fa-plug';
    statusBarItem.show();
    extensionContext.subscriptions.push(statusBarItem);

    // Create a modal dialog to ask the user if they want to enable or disable compatibility mode
    const command = extensionApi.commands.registerCommand('podman.socketCompatibilityMode', async () => {
      // Manually check to see if the socket is disguised (this will be called when pressing the status bar item)
      const isDisguisedPodmanSocket = await isDisguisedPodman();

      // We use isEnabled() as we do not want to "renable" again if the user has already enabled it.
      if (!isDisguisedPodmanSocket && !socketCompatibilityMode.isEnabled()) {
        const result = await extensionApi.window.showInformationMessage(
          `Do you want to enable Docker socket compatibility mode for Podman?\n\n${socketCompatibilityMode.details}`,
          'Enable',
          'Cancel',
        );

        if (result === 'Enable') {
          await socketCompatibilityMode.enable();
        }
      } else {
        const result = await extensionApi.window.showInformationMessage(
          `Do you want to disable Docker socket compatibility mode for Podman?\n\n${socketCompatibilityMode.details}`,
          'Disable',
          'Cancel',
        );

        if (result === 'Disable') {
          await socketCompatibilityMode.disable();
        }
      }
      // Use tooltip text from class
      statusBarItem.tooltip = socketCompatibilityMode.tooltipText();
    });

    // Push the results of the command so we can unload it later
    extensionContext.subscriptions.push(command);
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

  if (isMac()) {
    provider.registerCleanup(new PodmanCleanupMacOS());
  } else if (isWindows()) {
    provider.registerCleanup(new PodmanCleanupWindows());
  }

  await initCheckAndRegisterUpdate(provider, podmanInstall);

  // If autostart has been enabled for the machine, try to start it.
  try {
    await updateMachines(provider, podmanConfiguration);
  } catch (error) {
    // ignore the update of machines
  }
  provider.registerAutostart({
    start: async (logger: extensionApi.Logger) => {
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
            autoMachineStarted = true;
            autoMachineName = machineName;
          }
        }
      }
    },
  });

  extensionContext.subscriptions.push(provider);

  // We allow creating machines for both macOS and Windows
  // but not Linux. The reasoning being is that podman for Linux is
  // NOT packaged with qemu + kvm by default. So, we don't want to
  // create machines on Linux via Podman Desktop, however we will still support
  // the lifecycle management of one.
  if (isMac() || isWindows()) {
    provider.setContainerProviderConnectionFactory({
      initialize: () => createMachine({}, undefined),
      create: createMachine,
      creationDisplayName: 'Podman machine',
    });
  }

  // Linux has native container support (no need for Podman Machine), so we don't need to create machines.
  // Below is Linux specific code:
  // * Monitors the system service for an unlimited time
  // * Uses the native system socket
  if (isLinux()) {
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

  // Podman Machine support is on macOS, Windows and Linux
  // Despite Linux having native container support, Podman Machine is still supported on Linux
  // so let's monitor for the machines
  monitorMachines(provider, podmanConfiguration).catch((error: unknown) => {
    console.error('Error while monitoring machines', error);
  });

  // monitor provider
  // like version, checks, warnings
  monitorProvider(provider).catch((error: unknown) => {
    console.error('Error while monitoring provider', error);
  });

  const onboardingCheckInstallationCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.checkInstalledCommand',
    async () => {
      const installation = await getPodmanInstallation();
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
          }
        } catch (err) {
          result.push({
            name: check.title,
            successful: false,
            description:
              err instanceof Error ? err.message : typeof err === 'object' ? err?.toString() : 'unknown error',
          });
          successful = false;
        }
      }

      const warnings = [];
      const telemetryRecords: Record<string, unknown> = {};
      telemetryRecords.successful = successful;

      for (const res of result) {
        const warning = {
          state: res.successful ? 'successful' : 'failed',
          description: res.description ? res.description : res.name,
          docDescription: res.docLinksDescription,
          docLinks: res.docLinks,
          command: res.fixCommand,
        };
        warnings.push(warning);
        if (!res.successful) {
          telemetryRecords[res.name] = res.description ? res.description : res.name;
        }
      }

      extensionApi.context.setValue('requirementsStatus', successful ? 'ok' : 'failed', 'onboarding');
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
        installation = await getPodmanInstallation();
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

  // register the registries
  const registrySetup = new RegistrySetup();
  await registrySetup.setup();

  await calcPodmanMachineSetting(podmanConfiguration);
}

export async function calcPodmanMachineSetting(podmanConfiguration: PodmanConfiguration): Promise<void> {
  let cpuSupported = true;
  let memorySupported = true;
  let diskSupported = true;

  if (isWindows()) {
    const isPodmanHyperv_Env = process.env.CONTAINERS_MACHINE_PROVIDER === 'hyperv';
    const isPodmanHyperv_Config = await podmanConfiguration.matchRegexpInContainersConfig(/provider\s*=\s*"hyperv"/);
    cpuSupported = isPodmanHyperv_Env || isPodmanHyperv_Config;
    memorySupported = isPodmanHyperv_Env || isPodmanHyperv_Config;
    diskSupported = isPodmanHyperv_Env || isPodmanHyperv_Config;
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
  const machines = JSON.parse(machineListOutput.stdout) as MachineJSON[];

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

  const machines = JSON.parse(machineListOutput.stdout) as MachineJSON[];

  // Find the autostarted machine and check its status
  const currentMachine: MachineJSON | undefined = machines.find(machine => machine?.Name === autoMachineName);

  if (!currentMachine?.Running && !currentMachine?.Starting) {
    console.log('No machine to stop');
    autoMachineStarted = false;
    return;
  }
  console.log('stopping autostarted machine', autoMachineName);
  await extensionApi.process.exec(getPodmanCli(), ['machine', 'stop', autoMachineName]);
}

export async function getJSONMachineList(): Promise<MachineListOutput> {
  const { stdout, stderr } = await extensionApi.process.exec(getPodmanCli(), ['machine', 'list', '--format', 'json']);
  return { stdout, stderr };
}

export async function deactivate(): Promise<void> {
  stopLoop = true;
  console.log('stopping podman extension');
  await stopAutoStartedMachine().then(() => {
    if (autoMachineStarted) {
      console.log('stopped autostarted machine', autoMachineName);
    }
  });
}

const PODMAN_MINIMUM_VERSION_FOR_NOW_FLAG_INIT = '4.0.0';

// Checks if start now flag at machine init is supported.
export function isStartNowAtMachineInitSupported(podmanVersion: string): boolean {
  return compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_NOW_FLAG_INIT) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_ROOTFUL_MACHINE_INIT = '4.1.0';

// Checks if rootful machine init is supported.
export function isRootfulMachineInitSupported(podmanVersion: string): boolean {
  return compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_ROOTFUL_MACHINE_INIT) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION = '4.5.0';

export function isPodmanSocketLocationMoved(podmanVersion: string): boolean {
  return isLinux() && compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING = '4.6.0';

// Checks if user mode networking is supported. Only Windows platform allows this parameter to be tuned
export function isUserModeNetworkingSupported(podmanVersion: string): boolean {
  return isWindows() && compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING) >= 0;
}

function sendTelemetryRecords(
  eventName: string,
  telemetryRecords: Record<string, unknown>,
  includeMachineStats: boolean,
): void {
  const sendJob = async (): Promise<void> => {
    // add CLI version
    const installedPodman = await getPodmanInstallation();
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
    // and display version of qemu
    if (extensionApi.env.isMac) {
      let qemuPath: string | undefined;

      try {
        const podmanBinaryResult = await podmanBinaryHelper.getPodmanLocationMac();

        telemetryRecords.podmanCliSource = podmanBinaryResult.source;
        if (podmanBinaryResult.source === 'installer') {
          qemuPath = '/opt/podman/qemu/bin';
        }
        telemetryRecords.podmanCliFoundPath = podmanBinaryResult.foundPath;
        if (podmanBinaryResult.error) {
          telemetryRecords.errorPodmanSource = podmanBinaryResult.error;
        }
      } catch (error) {
        telemetryRecords.errorPodmanSource = error;
        console.trace('unable to check from which path podman is coming', error);
      }

      // add qemu version
      try {
        const qemuVersion = await qemuHelper.getQemuVersion(qemuPath);
        if (qemuPath) {
          telemetryRecords.qemuPath = qemuPath;
        }
        telemetryRecords.qemuVersion = qemuVersion;
      } catch (error) {
        console.trace('unable to check qemu version', error);
        telemetryRecords.errorQemuVersion = error;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  logger?: extensionApi.Logger,
  token?: extensionApi.CancellationToken,
): Promise<void> {
  const parameters = [];
  parameters.push('machine');
  parameters.push('init');

  const telemetryRecords: Record<string, unknown> = {};

  // cpus
  if (params['podman.factory.machine.cpus']) {
    parameters.push('--cpus');
    parameters.push(params['podman.factory.machine.cpus']);
    telemetryRecords.cpus = params['podman.factory.machine.cpus'];
  }

  // memory
  if (params['podman.factory.machine.memory']) {
    parameters.push('--memory');
    const memoryAsMiB = +params['podman.factory.machine.memory'] / (1024 * 1024);
    parameters.push(Math.floor(memoryAsMiB).toString());
    telemetryRecords.memory = params['podman.factory.machine.memory'];
  }

  // disk size
  if (params['podman.factory.machine.diskSize']) {
    parameters.push('--disk-size');
    const diskAsGiB = +params['podman.factory.machine.diskSize'] / (1024 * 1024 * 1024);
    parameters.push(Math.floor(diskAsGiB).toString());
    telemetryRecords.diskSize = params['podman.factory.machine.diskSize'];
  }

  // image-path
  if (params['podman.factory.machine.image-path']) {
    parameters.push('--image-path');
    parameters.push(params['podman.factory.machine.image-path']);
    telemetryRecords.imagePath = 'custom';
  } else if (isMac() || isWindows()) {
    // check if we have an embedded asset for the image path for macOS or Windows
    let suffix = '';
    if (isWindows()) {
      suffix = `-${process.arch}.tar.xz`;
    } else if (isMac()) {
      suffix = `-${process.arch}.zst`;
    }

    const assetImagePath = path.resolve(getAssetsFolder(), `podman-image${suffix}`);

    const podmanInstallation = await getPodmanInstallation();

    // Use embedded image only for Podman 5 and onwards
    if (fs.existsSync(assetImagePath) && podmanInstallation?.version.startsWith('5.')) {
      parameters.push('--image-path');
      parameters.push(assetImagePath);
      telemetryRecords.imagePath = 'embedded';
    }
  }
  if (!telemetryRecords.imagePath) {
    telemetryRecords.imagePath = 'default';
  }

  if (params['podman.factory.machine.rootful'] === undefined) {
    // should be rootful mode if version supports this mode and only if rootful is not provided (false or true)
    const installedPodman = await getPodmanInstallation();
    const version: string | undefined = installedPodman?.version;
    if (version) {
      const isRootfulSupported = isRootfulMachineInitSupported(version);
      if (isRootfulSupported) {
        params['podman.factory.machine.rootful'] = true;
      }
    }
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

  // name at the end
  if (params['podman.factory.machine.name']) {
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
    await extensionApi.process.exec(getPodmanCli(), parameters, { logger, token });
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
  extensionApi.context.setValue('podmanMachineExists', true, 'onboarding');
  shouldNotifySetup = true;
  // notification is no more required
  notificationDisposable?.dispose();
}

export function resetShouldNotifySetup(): void {
  shouldNotifySetup = true;
}

function setupDisguisedPodmanSocketWatcher(
  provider: extensionApi.Provider,
  socketFile: string,
): extensionApi.FileSystemWatcher | undefined {
  // Monitor the socket file for any changes, creation or deletion
  // and trigger a change if that happens

  // Add the check to the listeners as well to make sure we check on podman status change as well
  listeners.add(() => {
    checkDisguisedPodmanSocket(provider).catch((error: unknown) => {
      console.error('Error while checking disguised podman socket', error);
    });
  });

  let socketWatcher: extensionApi.FileSystemWatcher | undefined = undefined;
  if (isLinux()) {
    socketWatcher = extensionApi.fs.createFileSystemWatcher(socketFile);
  } else if (isMac()) {
    // watch parent directory
    socketWatcher = extensionApi.fs.createFileSystemWatcher(path.dirname(socketFile));
  }

  // only trigger if the watched file is the socket file
  const updateSocket = async (uri: extensionApi.Uri): Promise<void> => {
    if (uri.fsPath === socketFile) {
      await checkDisguisedPodmanSocket(provider);
    }
  };

  socketWatcher?.onDidChange(async uri => {
    await updateSocket(uri);
  });

  socketWatcher?.onDidCreate(async uri => {
    await updateSocket(uri);
  });

  socketWatcher?.onDidDelete(async uri => {
    await updateSocket(uri);
  });

  return socketWatcher;
}

export async function checkDisguisedPodmanSocket(provider: extensionApi.Provider): Promise<void> {
  // Check to see if the socket is disguised or not. If it is, we'll push a warning up
  // to the plugin library to the let the provider know that there is a warning
  const disguisedCheck = await isDisguisedPodman();
  if (isDisguisedPodmanSocket !== disguisedCheck) {
    isDisguisedPodmanSocket = disguisedCheck;
  }

  // If it's disguised on startup, set the enable-docker-compatibility setting accordingly
  await extensionApi.configuration.getConfiguration('podman').update(configurationCompatibilityMode, disguisedCheck);

  // If isDisguisedPodmanSocket is true, we'll push a warning up to the plugin library with getDisguisedPodmanWarning()
  // If isDisguisedPodmanSocket is false, we'll push an empty array up to the plugin library to clear the warning
  // as we have no other warnings to display (or implemented)

  // NOTE: LINUX SUPPORT
  // Linux does not support compatibility mode button, so do not sending the warning
  if (!isLinux()) {
    const retrievedWarnings = isDisguisedPodmanSocket ? [] : [getDisguisedPodmanInformation()];
    provider.updateWarnings(retrievedWarnings);
  }
}

// Shortform for getting the compatibility mode setting
function getCompatibilityModeSetting(): boolean {
  return extensionApi.configuration.getConfiguration('podman').get<boolean>(configurationCompatibilityMode) ?? false;
}

// Handle the setting by checking the compatibility
// and retrieving the correct socket compatibility class as well
export async function handleCompatibilityModeSetting(): Promise<void> {
  const compatibilityMode = getCompatibilityModeSetting();
  const socketCompatibilityMode = getSocketCompatibility();

  if (compatibilityMode) {
    await socketCompatibilityMode.enable();
  } else {
    await socketCompatibilityMode.disable();
  }
}
