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

import { isLinux, isMac, isWindows } from './util';
import { PodmanInstall } from './podman-install';
import type { InstalledPodman } from './podman-cli';
import { execPromise, getPodmanCli, getPodmanInstallation } from './podman-cli';
import { PodmanConfiguration } from './podman-configuration';
import { getDetectionChecks } from './detection-checks';

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectoryMac = path.resolve(os.homedir(), '.local/share/containers/podman/machine');
let storedExtensionContext;
let stopLoop = false;

// current status of machines
const podmanMachinesStatuses = new Map<string, extensionApi.ProviderConnectionStatus>();
const podmanMachinesInfo = new Map<string, MachineInfo>();
const currentConnections = new Map<string, extensionApi.Disposable>();

type MachineJSON = {
  Name: string;
  CPUs: number;
  Memory: string;
  DiskSize: string;
  Running: boolean;
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
    const status = running ? 'started' : 'stopped';
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
      if (isMac) {
        socketPath = path.resolve(podmanMachineSocketsDirectoryMac, machineName, 'podman.sock');
      } else if (isWindows) {
        socketPath = calcWinPipeName(machineName);
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
    // if a machine is running it's started else it is ready
    if (atLeastOneMachineRunning) {
      provider.updateStatus('ready');
    } else {
      // needs to start a machine
      provider.updateStatus('configured');
    }
  }
}

function calcWinPipeName(machineName: string): string {
  const name = machineName.startsWith('podman') ? machineName : 'podman-' + machineName;
  return `//./pipe/${name}`;
}

// on linux, socket is started by the system service on a path like /run/user/1000/podman/podman.sock
async function initDefaultLinux(provider: extensionApi.Provider) {
  // grab user id of the user
  const userInfo = os.userInfo();
  const uid = userInfo.uid;

  const socketPath = `/run/user/${uid}/podman/podman.sock`;
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
      title: 'Visit the Podman Website',
      url: 'https://podman.io/',
    },
    {
      title: 'Read the Podman installation guide',
      url: 'https://podman.io/getting-started/installation',
    },
    {
      title: 'Join the Podman Community',
      url: 'https://podman.io/community/',
    },
  ];

  const provider = extensionApi.provider.createProvider(providerOptions);
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

  extensionContext.subscriptions.push(provider);

  // allows to create machines
  if (isMac || isWindows) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createFunction = async (params: { [key: string]: any }): Promise<void> => {
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

      // name at the end
      if (params['podman.factory.machine.name']) {
        parameters.push(params['podman.factory.machine.name']);
      }

      // name at the end
      if (params['podman.factory.machine.now']) {
        parameters.push('--now');
      }

      await execPromise(getPodmanCli(), parameters);
    };

    provider.setContainerProviderConnectionFactory({
      initialize: () => createFunction({}),
      create: createFunction,
    });
  }

  // no podman for now, skip
  if (isMac) {
    if (!fs.existsSync(podmanMachineSocketsDirectoryMac)) {
      return;
    }
    monitorMachines(provider);
  } else if (isLinux) {
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
    await timeout(500);
    provider.updateStatus('ready');
    const disposable = extensionApi.Disposable.create(() => {
      podmanProcess.kill();
    });
    extensionContext.subscriptions.push(disposable);
    initDefaultLinux(provider);
  } else if (isWindows) {
    monitorMachines(provider);
  }

  // monitor provider
  // like version, checks
  monitorProvider(provider);

  // register the registries
  const registrySetup = new RegistrySetup();
  await registrySetup.setup(extensionContext);

  const podmanConfiguration = new PodmanConfiguration();
  await podmanConfiguration.init(provider);
}

export function deactivate(): void {
  stopLoop = true;
  console.log('stopping podman extension');
}
