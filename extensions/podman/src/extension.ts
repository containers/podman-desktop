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

import * as extensionApi from '@tmpwip/extension-api';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { RegistrySetup } from './registry-setup';

import { getAssetsFolder, isLinux, isMac, isWindows } from './util';
import { PodmanInstall } from './podman-install';
import type { InstalledPodman } from './podman-cli';
import { execPromise, getPodmanCli, getPodmanInstallation } from './podman-cli';
import { PodmanConfiguration } from './podman-configuration';
import { getDetectionChecks } from './detection-checks';
import { getDisguisedPodmanInformation, getSocketPath, isDisguisedPodman } from './warnings';

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectoryMac = path.resolve(os.homedir(), '.local/share/containers/podman/machine');
const podmanMachineSocketsSymlinkDirectoryMac = path.resolve(os.homedir(), '.podman');
const MACOS_MAX_SOCKET_PATH_LENGTH = 104;
let storedExtensionContext;
let stopLoop = false;

// current status of machines
const podmanMachinesStatuses = new Map<string, extensionApi.ProviderConnectionStatus>();
const podmanMachinesInfo = new Map<string, MachineInfo>();
const currentConnections = new Map<string, extensionApi.Disposable>();

// Warning to check to see if the socket is a disguised Podman socket,
// by default we assume it is until proven otherwise when we check
let isDisguisedPodmanSocket = true;
let disguisedPodmanSocketWatcher: extensionApi.FileSystemWatcher;

type MachineJSON = {
  Name: string;
  CPUs: number;
  Memory: string;
  DiskSize: string;
  Running: boolean;
  Starting: boolean;
};

type MachineInfo = {
  name: string;
  cpus: number;
  memory: number;
  diskSize: number;
};

async function updateMachines(provider: extensionApi.Provider): Promise<void> {
  // init machines available
  const machineListOutput = await execPromise(getPodmanCli(), ['machine', 'list', '--format', 'json']);

  // parse output
  const machines = JSON.parse(machineListOutput) as MachineJSON[];

  // update status of existing machines
  machines.forEach(machine => {
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
    }
    podmanMachinesInfo.set(machine.Name, {
      name: machine.Name,
      memory: parseInt(machine.Memory) / 1048576,
      cpus: machine.CPUs,
      diskSize: parseInt(machine.DiskSize) / 1073741824,
    });

    podmanMachinesStatuses.set(machine.Name, status);
  });

  // remove machine no longer there
  const machinesToRemove = Array.from(podmanMachinesStatuses.keys()).filter(
    machine => !machines.find(m => m.Name === machine),
  );
  machinesToRemove.forEach(machine => {
    podmanMachinesStatuses.delete(machine);
    podmanMachinesInfo.delete(machine);
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
          socketPath = await execPromise(getPodmanCli(), [
            'machine',
            'inspect',
            '--format',
            '{{.ConnectionInfo.PodmanPipe.Path}}',
            machineName,
          ]);
        } else {
          socketPath = await execPromise(getPodmanCli(), [
            'machine',
            'inspect',
            '--format',
            '{{.ConnectionInfo.PodmanSocket.Path}}',
            machineName,
          ]);
        }
      } catch (error) {
        console.debug('Podman extension:', 'Failed to read socketPath from machine inspect');
      }
      if (!socketPath) {
        if (isMac()) {
          socketPath = calcMacosSocketPath(machineName);
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
    provider.updateStatus('installed');
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
}

function calcMacosSocketPath(machineName: string): string {
  // max length for the path of a socket in macos is 104 chars
  let socketPath = path.resolve(podmanMachineSocketsDirectoryMac, machineName, 'podman.sock');
  if (socketPath.length > MACOS_MAX_SOCKET_PATH_LENGTH) {
    socketPath = path.resolve(podmanMachineSocketsSymlinkDirectoryMac, machineName, 'podman.sock');
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
    status: () => 'started',
    endpoint: {
      socketPath,
    },
  };

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  currentConnections.set('podman', disposable);
  storedExtensionContext.subscriptions.push(disposable);
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
    monitorMachines(provider);
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
  monitorProvider(provider);
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
    start: async (context): Promise<void> => {
      try {
        // start the machine
        await execPromise(getPodmanCli(), ['machine', 'start', machineInfo.name], { logger: context.log });
        provider.updateStatus('started');
      } catch (err) {
        console.error(err);
        // propagate the error
        throw err;
      }
    },
    stop: async (context): Promise<void> => {
      await execPromise(getPodmanCli(), ['machine', 'stop', machineInfo.name], { logger: context.log });
      provider.updateStatus('ready');
    },
    delete: async (): Promise<void> => {
      await execPromise(getPodmanCli(), ['machine', 'rm', '-f', machineInfo.name]);
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

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  provider.updateStatus('ready');

  // get configuration for this connection
  const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);

  // Set values for the machine
  containerConfiguration.update('machine.cpus', machineInfo.cpus);
  containerConfiguration.update('machine.memory', machineInfo.memory);
  containerConfiguration.update('machine.diskSize', machineInfo.diskSize);

  currentConnections.set(machineInfo.name, disposable);
  storedExtensionContext.subscriptions.push(disposable);
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

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  storedExtensionContext = extensionContext;
  const podmanInstall = new PodmanInstall(extensionContext.storagePath);

  const installedPodman = await getPodmanInstallation();
  const version: string | undefined = installedPodman?.version;

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

  // add links
  providerOptions.links = [
    {
      title: 'Visit the Podman website',
      url: 'https://podman.io/',
    },
    {
      title: 'Read the Podman installation guide',
      url: 'https://podman.io/getting-started/installation',
    },
    {
      title: 'Join the Podman community',
      url: 'https://podman.io/community/',
    },
  ];

  const provider = extensionApi.provider.createProvider(providerOptions);

  // Check on initial setup
  checkDisguisedPodmanSocket(provider);
  // update the status of the provider if the socket is changed, created or deleted
  disguisedPodmanSocketWatcher = setupDisguisedPodmanSocketWatcher(provider, getSocketPath());
  extensionContext.subscriptions.push(disguisedPodmanSocketWatcher);

  // provide an installation path ?
  if (podmanInstall.isAbleToInstall()) {
    provider.registerInstallation({
      install: () => podmanInstall.doInstallPodman(provider),
      preflightChecks: () => podmanInstall.getInstallChecks(),
    });
  }

  // provide an installation path ?
  // add update information asynchronously
  registerUpdatesIfAny(provider, installedPodman, podmanInstall);

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
          console.log('Podman extension:', 'Autostarting machine', machineName);
          await execPromise(getPodmanCli(), ['machine', 'start', machineName], { logger });
        }
      },
    });
  }

  extensionContext.subscriptions.push(provider);

  // allows to create machines
  if (isMac() || isWindows()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createFunction = async (params: { [key: string]: any }, logger: extensionApi.Logger): Promise<void> => {
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
        parameters.push(params['podman.factory.machine.memory']);
      }

      // disk size
      if (params['podman.factory.machine.diskSize']) {
        parameters.push('--disk-size');
        parameters.push(params['podman.factory.machine.diskSize']);
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

      // name at the end
      if (params['podman.factory.machine.name']) {
        parameters.push(params['podman.factory.machine.name']);
      }

      // name at the end
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
      await execPromise(getPodmanCli(), parameters, { logger, env });
    };

    provider.setContainerProviderConnectionFactory({
      initialize: () => createFunction({}, undefined),
      create: createFunction,
    });
  }

  // no podman for now, skip
  if (isMac()) {
    if (!fs.existsSync(podmanMachineSocketsDirectoryMac)) {
      return;
    }
    monitorMachines(provider);
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
    initDefaultLinux(provider);
  } else if (isWindows()) {
    monitorMachines(provider);
  }

  // monitor provider
  // like version, checks, warnings
  monitorProvider(provider);

  // register the registries
  const registrySetup = new RegistrySetup();
  await registrySetup.setup(extensionContext);

  const podmanConfiguration = new PodmanConfiguration();
  await podmanConfiguration.init();
}

export function deactivate(): void {
  stopLoop = true;
  console.log('stopping podman extension');
}

function setupDisguisedPodmanSocketWatcher(
  provider: extensionApi.Provider,
  socketFile: string,
): extensionApi.FileSystemWatcher {
  // Monitor the socket file for any changes, creation or deletion
  // and trigger a change if that happens

  // Add the check to the listeners as well to make sure we check on podman status change as well
  listeners.add(() => {
    checkDisguisedPodmanSocket(provider);
  });

  let socketWatcher: extensionApi.FileSystemWatcher;
  if (isLinux) {
    socketWatcher = extensionApi.fs.createFileSystemWatcher(socketFile);
  } else {
    // watch parent directory
    socketWatcher = extensionApi.fs.createFileSystemWatcher(path.dirname(socketFile));
  }

  // only trigger if the watched file is the socket file
  const updateSocket = (uri: extensionApi.Uri) => {
    if (uri.fsPath === socketFile) {
      checkDisguisedPodmanSocket(provider);
    }
  };

  socketWatcher.onDidChange(uri => {
    updateSocket(uri);
  });

  socketWatcher.onDidCreate(uri => {
    updateSocket(uri);
  });

  socketWatcher.onDidDelete(uri => {
    updateSocket(uri);
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
