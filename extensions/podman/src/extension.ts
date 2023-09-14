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

import * as extensionApi from '@podman-desktop/api';
import * as path from 'node:path';
import * as os from 'node:os';
import * as http from 'node:http';
import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { RegistrySetup } from './registry-setup';

import { getAssetsFolder, isLinux, isMac, isWindows, appHomeDir, LoggerDelegator } from './util';
import { PodmanInstall } from './podman-install';
import type { InstalledPodman } from './podman-cli';
import { getPodmanCli, getPodmanInstallation } from './podman-cli';
import { PodmanConfiguration } from './podman-configuration';
import { getDetectionChecks } from './detection-checks';
import { getDisguisedPodmanInformation, getSocketPath, isDisguisedPodman } from './warnings';
import { getSocketCompatibility } from './compatibility-mode';
import type { RunError } from '@podman-desktop/api';
import { compareVersions } from 'compare-versions';

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectory = path.resolve(os.homedir(), appHomeDir(), 'machine');
const podmanMachineSocketsSymlinkDirectoryMac = path.resolve(os.homedir(), '.podman');
const MACOS_MAX_SOCKET_PATH_LENGTH = 104;
let isMovedPodmanSocket = false;
let storedExtensionContext;
let stopLoop = false;
let autoMachineStarted = false;
let autoMachineName;

// System default notifier
let defaultMachineNotify = true;
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
};

async function updateMachines(provider: extensionApi.Provider): Promise<void> {
  // init machines available
  const machineListOutput = await getJSONMachineList();

  // parse output
  const machines = JSON.parse(machineListOutput) as MachineJSON[];
  extensionApi.context.setValue('podmanMachineExists', machines.length > 0, 'onboarding');

  // update status of existing machines
  for (const machine of machines) {
    const running = machine?.Running === true;
    let status: extensionApi.ProviderConnectionStatus = running ? 'started' : 'stopped';

    // update the status to starting if the machine is starting but not yet running
    const starting = machine?.Starting === true;
    if (!running && starting) {
      status = 'starting';
    }

    const previousStatus = podmanMachinesStatuses.get(machine.Name);
    if (previousStatus !== status) {
      // notify status change
      listeners.forEach(listener => listener(machine.Name, status));
      podmanMachinesStatuses.set(machine.Name, status);
    }

    const userModeNetworking = isWindows() ? machine.UserModeNetworking : true;
    podmanMachinesInfo.set(machine.Name, {
      name: machine.Name,
      memory: parseInt(machine.Memory),
      cpus: machine.CPUs,
      diskSize: parseInt(machine.DiskSize),
      userModeNetworking: userModeNetworking,
    });

    if (!podmanMachinesStatuses.has(machine.Name)) {
      podmanMachinesStatuses.set(machine.Name, status);
    }

    if (containerProviderConnections.has(machine.Name)) {
      const containerProviderConnection = containerProviderConnections.get(machine.Name);
      await updateContainerConfiguration(containerProviderConnection, podmanMachinesInfo.get(machine.Name));
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
      await registerProviderFor(provider, podmanMachinesInfo.get(machineName), socketPath);
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

  // no machine, it's installed
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
  }

  // Finally, we check to see if the machine that is running is set by default or not on the CLI
  // this will create a dialog that will ask the user if they wish to set the running machine as default.
  await checkDefaultMachine(machines);
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
    if (defaultConnectionName.endsWith(ROOTFUL_SUFFIX)) {
      defaultConnectionName = defaultConnectionName.substring(0, defaultConnectionName.length - 5);
    }
    defaultMachine = machines.find(machine => machine.Name === defaultConnectionName);

    if (runningMachine?.Name === defaultConnectionName) {
      runningMachine.Default = true;
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
      try {
        // make it the default to run the info command
        await extensionApi.process.exec(getPodmanCli(), ['system', 'connection', 'default', runningMachine.Name]);
      } catch (error) {
        // eslint-disable-next-line quotes
        console.error("Error running 'podman system connection default': ", error);
        await extensionApi.window.showErrorMessage(`Error running 'podman system connection default': ${error}`);
        return;
      }

      try {
        // after updating the default connection using the rootless connection, we verify if the machine has been
        // created as rootful. If so, the default connection must be set to the rootful connection
        const { stdout: machineInfoJson } = await extensionApi.process.exec(getPodmanCli(), [
          'machine',
          'info',
          '--format',
          'json',
        ]);
        const machineInfo = JSON.parse(machineInfoJson);
        const filepath = path.join(machineInfo.Host.MachineConfigDir, `${runningMachine.Name}.json`);
        if (fs.existsSync(filepath)) {
          const machineConfigJson = await fs.promises.readFile(filepath, 'utf8');
          if (machineConfigJson && machineConfigJson.length > 0) {
            const machineConfig = JSON.parse(machineConfigJson);
            // if it's rootful let's update the connection to the rootful one
            if (machineConfig.Rootful) {
              await extensionApi.process.exec(getPodmanCli(), [
                'system',
                'connection',
                'default',
                `${runningMachine.Name}${ROOTFUL_SUFFIX}`,
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Error when checking rootful machine: ', error);
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
  await containerConfiguration.update('machine.memory', machineInfo.memory);
  await containerConfiguration.update('machine.diskSize', machineInfo.diskSize);
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
async function initDefaultLinux(provider: extensionApi.Provider) {
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
  storedExtensionContext.subscriptions.push(disposable);
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

async function monitorPodmanSocket(socketPath: string, machineName?: string) {
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

function stopMonitoringPodmanSocket(machineName?: string) {
  if (machineName) {
    return stopLoop || !podmanMachinesStatuses.has(machineName);
  }
  return stopLoop;
}

function updateProviderStatus(status: extensionApi.ProviderConnectionStatus, machineName?: string) {
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

async function monitorMachines(provider: extensionApi.Provider) {
  // call us again
  if (!stopLoop) {
    try {
      await updateMachines(provider);
    } catch (error) {
      // ignore the update of machines
    }
    await timeout(5000);
    monitorMachines(provider).catch((error: unknown) => {
      console.error('Error monitoring podman machines', error);
    });
  }
}

async function monitorProvider(provider: extensionApi.Provider) {
  // call us again
  if (!stopLoop) {
    try {
      const installedPodman = await getPodmanInstallation();
      provider.updateDetectionChecks(getDetectionChecks(installedPodman));

      // update version
      if (!installedPodman) {
        provider.updateStatus('not-installed');
      } else if (installedPodman.version) {
        provider.updateVersion(installedPodman.version);
        // update provider status if someone has installed podman externally
        if (provider.status === 'not-installed') {
          provider.updateStatus('installed');
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
    name = `Podman Machine ${machineName}`;
  }
  return name;
}

async function registerProviderFor(provider: extensionApi.Provider, machineInfo: MachineInfo, socketPath: string) {
  const lifecycle: extensionApi.ProviderConnectionLifecycle = {
    start: async (context, logger): Promise<void> => {
      await startMachine(provider, machineInfo, context, logger);
    },
    stop: async (context, logger): Promise<void> => {
      await extensionApi.process.exec(getPodmanCli(), ['machine', 'stop', machineInfo.name], {
        logger: new LoggerDelegator(context, logger),
      });
      provider.updateStatus('ready');
    },
    delete: async (logger): Promise<void> => {
      await extensionApi.process.exec(getPodmanCli(), ['machine', 'rm', '-f', machineInfo.name], { logger });
    },
  };

  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: prettyMachineName(machineInfo.name),
    type: 'podman',
    status: () => podmanMachinesStatuses.get(machineInfo.name),
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

  currentConnections.set(machineInfo.name, disposable);
  storedExtensionContext.subscriptions.push(disposable);
}

export async function startMachine(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  context?: extensionApi.LifecycleContext,
  logger?: extensionApi.Logger,
  skipHandleError?: boolean,
): Promise<void> {
  try {
    // start the machine
    await extensionApi.process.exec(getPodmanCli(), ['machine', 'start', machineInfo.name], {
      logger: new LoggerDelegator(context, logger),
    });
    provider.updateStatus('started');
  } catch (err) {
    if (skipHandleError) {
      console.error(err);
      // propagate the error
      throw err;
    }

    await doHandleError(provider, machineInfo, err);
  }
}

async function doHandleError(
  provider: extensionApi.Provider,
  machineInfo: MachineInfo,
  error: string | RunError,
): Promise<void> {
  let errText: string;

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

async function registerUpdatesIfAny(
  provider: extensionApi.Provider,
  installedPodman: InstalledPodman,
  podmanInstall: PodmanInstall,
): Promise<void> {
  const updateInfo = await podmanInstall.checkForUpdate(installedPodman);
  if (updateInfo.hasUpdate) {
    provider.registerUpdate({
      version: updateInfo.bundledVersion,
      update: () => podmanInstall.performUpdate(provider, installedPodman),
      preflightChecks: () => podmanInstall.getUpdatePreflightChecks(),
    });
  }
}

export const USER_MODE_NETWORKING_SUPPORTED_KEY = 'podman.isUserModeNetworkingSupported';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  storedExtensionContext = extensionContext;
  const podmanInstall = new PodmanInstall(extensionContext.storagePath);

  const installedPodman = await getPodmanInstallation();
  const version: string | undefined = installedPodman?.version;

  if (version) {
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

  const provider = extensionApi.provider.createProvider(providerOptions);

  // Check on initial setup
  await checkDisguisedPodmanSocket(provider);

  // Update the status of the provider if the socket is changed, created or deleted
  disguisedPodmanSocketWatcher = setupDisguisedPodmanSocketWatcher(provider, getSocketPath());
  if (disguisedPodmanSocketWatcher) {
    extensionContext.subscriptions.push(disguisedPodmanSocketWatcher);
  }

  // Compatibility mode status bar item
  // only available for macOS or Linux (for now).
  if (isMac() || isLinux()) {
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
    provider.registerInstallation({
      install: () => podmanInstall.doInstallPodman(provider),
      preflightChecks: () => podmanInstall.getInstallChecks(),
    });
  }

  // provide an installation path ?
  // add update information asynchronously
  await registerUpdatesIfAny(provider, installedPodman, podmanInstall);

  // register autostart if enabled
  if (isMac() || isWindows()) {
    try {
      await updateMachines(provider);
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
            const context: extensionApi.LifecycleContext = extensionApi.provider.getProviderLifecycleContext(
              provider.id,
              containerProviderConnection,
            );
            await startMachine(provider, machineInfo, context, logger);
            autoMachineStarted = true;
            autoMachineName = machineName;
          }
        }
      },
    });
  }

  extensionContext.subscriptions.push(provider);

  // allows to create machines
  if (isMac() || isWindows()) {
    provider.setContainerProviderConnectionFactory({
      initialize: () => createMachine({}, undefined),
      create: createMachine,
      creationDisplayName: 'Podman machine',
    });
  }

  // no podman for now, skip
  if (isMac()) {
    if (!fs.existsSync(podmanMachineSocketsDirectory)) {
      return;
    }
    monitorMachines(provider).catch((error: unknown) => {
      console.error('Error while monitoring machines', error);
    });
  } else if (isLinux()) {
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
  } else if (isWindows()) {
    monitorMachines(provider).catch((error: unknown) => {
      console.error('Error while monitoring machines', error);
    });
  }

  // monitor provider
  // like version, checks, warnings
  monitorProvider(provider).catch((error: unknown) => {
    console.error('Error while monitoring provider', error);
  });

  const onboardingCheckInstallationCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.checkPodmanInstalled',
    async () => {
      const installation = await getPodmanInstallation();
      const installed = installation ? true : false;
      extensionApi.context.setValue('podmanIsNotInstalled', !installed, 'onboarding');
    },
  );

  const onboardingCheckReqsCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.checkPodmanRequirements',
    async () => {
      const checks = podmanInstall.getInstallChecks();
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

      let warningsMarkdown = '';

      for (const res of result) {
        warningsMarkdown += `* ${res.successful ? '✅' : '❌'} ${res.name} \n`;
        if (res.description) {
          warningsMarkdown += res.description;
          if (res.docLinks) {
            warningsMarkdown += ' See: ';
            for (const link of res.docLinks) {
              warningsMarkdown += `[${link.title}](${link.url}) `;
            }
            warningsMarkdown += '\n';
          }
        }
      }

      extensionApi.context.setValue('requirementsStatus', successful ? 'ok' : 'failed', 'onboarding');
      extensionApi.context.setValue('warningsMarkdown', warningsMarkdown, 'onboarding');
    },
  );

  const onboardingInstallPodmanCommand = extensionApi.commands.registerCommand(
    'podman.onboarding.installPodman',
    async () => {
      try {
        await podmanInstall.doInstallPodman(provider);
        const installation = await getPodmanInstallation();
        const installed = installation ? true : false;
        extensionApi.context.setValue('podmanIsNotInstalled', !installed, 'onboarding');
      } catch (e) {
        console.error(e);
        extensionApi.context.setValue('podmanIsNotInstalled', true, 'onboarding');
      }
    },
  );

  extensionContext.subscriptions.push(
    onboardingCheckInstallationCommand,
    onboardingCheckReqsCommand,
    onboardingInstallPodmanCommand,
  );

  // register the registries
  const registrySetup = new RegistrySetup();
  await registrySetup.setup();

  const podmanConfiguration = new PodmanConfiguration();
  await podmanConfiguration.init();
}

// Function that checks to see if the default machine is running and return a string
export async function findRunningMachine(): Promise<string> {
  let runningMachine: string;

  // Find the machines
  const machineListOutput = await getJSONMachineList();
  const machines = JSON.parse(machineListOutput) as MachineJSON[];

  // Find the machine that is running
  const found: MachineJSON = machines.find(machine => machine?.Running);

  if (found) {
    runningMachine = found.Name;
  }

  return runningMachine;
}

async function stopAutoStartedMachine() {
  if (!autoMachineStarted) {
    console.log('No machine to stop');
    return;
  }
  const machineListOutput = await getJSONMachineList();

  const machines = JSON.parse(machineListOutput) as MachineJSON[];

  // Find the autostarted machine and check its status
  const currentMachine: MachineJSON = machines.find(machine => machine?.Name === autoMachineName);

  if (!currentMachine?.Running && !currentMachine?.Starting) {
    console.log('No machine to stop');
    autoMachineStarted = false;
    return;
  }
  console.log('stopping autostarted machine', autoMachineName);
  await extensionApi.process.exec(getPodmanCli(), ['machine', 'stop', autoMachineName]);
}

async function getJSONMachineList(): Promise<string> {
  const { stdout } = await extensionApi.process.exec(getPodmanCli(), ['machine', 'list', '--format', 'json']);
  return stdout;
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

const PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION = '4.5.0';

export function isPodmanSocketLocationMoved(podmanVersion: string) {
  return isLinux() && compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_NEW_SOCKET_LOCATION) >= 0;
}

const PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING = '4.6.0';

// Checks if user mode networking is supported. Only Windows platform allows this parameter to be tuned
export function isUserModeNetworkingSupported(podmanVersion: string) {
  return isWindows() && compareVersions(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_USER_MODE_NETWORKING) >= 0;
}

export async function createMachine(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  logger: extensionApi.Logger,
  token?: extensionApi.CancellationToken,
): Promise<void> {
  const parameters = [];
  parameters.push('machine');
  parameters.push('init');

  // cpus
  if (params['podman.factory.machine.cpus']) {
    parameters.push('--cpus');
    parameters.push(params['podman.factory.machine.cpus']);
  }

  // memory
  if (params['podman.factory.machine.memory']) {
    parameters.push('--memory');
    const memoryAsMiB = +params['podman.factory.machine.memory'] / (1024 * 1024);
    parameters.push(Math.floor(memoryAsMiB).toString());
  }

  // disk size
  if (params['podman.factory.machine.diskSize']) {
    parameters.push('--disk-size');
    const diskAsGiB = +params['podman.factory.machine.diskSize'] / (1024 * 1024 * 1024);
    parameters.push(Math.floor(diskAsGiB).toString());
  }

  // disk size
  if (params['podman.factory.machine.image-path']) {
    parameters.push('--image-path');
    parameters.push(params['podman.factory.machine.image-path']);
  } else if (isMac() || isWindows()) {
    // check if we have an embedded asset for the image path for macOS or Windows
    let suffix = '';
    if (isWindows()) {
      suffix = `-${process.arch}.tar.xz`;
    } else if (isMac()) {
      suffix = `-${process.arch}.qcow2.xz`;
    }
    const assetImagePath = path.resolve(getAssetsFolder(), `podman-image${suffix}`);
    // check if the file exists and if it does, use it
    if (fs.existsSync(assetImagePath)) {
      parameters.push('--image-path');
      parameters.push(assetImagePath);
    }
  }

  // rootful
  if (params['podman.factory.machine.rootful']) {
    parameters.push('--rootful');
  }

  if (params['podman.factory.machine.user-mode-networking']) {
    parameters.push('--user-mode-networking');
  }

  // name at the end
  if (params['podman.factory.machine.name']) {
    parameters.push(params['podman.factory.machine.name']);
  }

  // starts now
  if (params['podman.factory.machine.now']) {
    parameters.push('--now');
  }

  // Add proxy environment variables if proxy is enabled
  const proxyEnabled = extensionApi.proxy.isEnabled();
  const env = {};
  if (proxyEnabled) {
    const proxySettings = extensionApi.proxy.getProxySettings();
    if (proxySettings?.httpProxy) {
      if (isWindows()) {
        env['env:http_proxy'] = proxySettings.httpProxy;
      } else {
        env['http_proxy'] = proxySettings.httpProxy;
      }
    }
    if (proxySettings?.httpsProxy) {
      if (isWindows()) {
        env['env:https_proxy'] = proxySettings.httpsProxy;
      } else {
        env['https_proxy'] = proxySettings.httpsProxy;
      }
    }
  }
  await extensionApi.process.exec(getPodmanCli(), parameters, { logger, env, token });
  extensionApi.context.setValue('podmanMachineExists', true, 'onboarding');
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
  const updateSocket = async (uri: extensionApi.Uri) => {
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

async function checkDisguisedPodmanSocket(provider: extensionApi.Provider) {
  // Check to see if the socket is disguised or not. If it is, we'll push a warning up
  // to the plugin library to the let the provider know that there is a warning
  const disguisedCheck = await isDisguisedPodman();
  if (isDisguisedPodmanSocket !== disguisedCheck) {
    isDisguisedPodmanSocket = disguisedCheck;
  }

  // If isDisguisedPodmanSocket is true, we'll push a warning up to the plugin library with getDisguisedPodmanWarning()
  // If isDisguisedPodmanSocket is false, we'll push an empty array up to the plugin library to clear the warning
  // as we have no other warnings to display (or implemented)
  const retrievedWarnings = isDisguisedPodmanSocket ? [] : [getDisguisedPodmanInformation()];
  provider.updateWarnings(retrievedWarnings);
}
