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
import { promisify } from 'node:util';
import { isLinux, isMac, isWindows } from './util';
import {
  fetchLatestPodmanVersion,
  getBundledPodmanVersion,
  installBundledPodman,
  installPodman,
} from './podman-install';
import { lte } from 'semver';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectoryMac = path.resolve(os.homedir(), '.local/share/containers/podman/machine');
const podmanMachineDirectoryWindows = path.resolve(os.homedir(), '.local/share/containers/podman/machine/wsl/wsldist');
let storedExtensionContext;
let stopLoop = false;

let podmanInfo: PodmanInfo;
let updateCheckTimer: NodeJS.Timer;

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

interface PodmanInfo {
  podmanVersion: string;
  lastUpdateCheck: number;
}

function getPodman(): string {
  if (isWindows) {
    return 'c:\\Program Files\\RedHat\\Podman\\podman.exe';
  }
  return 'podman';
}

async function updateMachines(provider: extensionApi.Provider): Promise<void> {
  // init machines available
  const machineListOutput = await execPromise(getPodman(), ['machine', 'list', '--format', 'json']);

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
      registerProviderFor(provider, podmanMachinesInfo.get(machineName), socketPath);
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
    updateMachines(provider);
    await timeout(5000);
    monitorMachines(provider);
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
    name = `Podman Machine ${machineName}`;
  }
  return name;
}
async function registerProviderFor(provider: extensionApi.Provider, machineInfo: MachineInfo, socketPath: string) {
  const lifecycle: extensionApi.ProviderConnectionLifecycle = {
    start: async (context): Promise<void> => {
      try {
        // start the machine
        await execPromise(getPodman(), ['machine', 'start', machineInfo.name], context.log);
      } catch (err) {
        console.error(err);
      }
    },
    stop: async (context): Promise<void> => {
      await execPromise(getPodman(), ['machine', 'stop', machineInfo.name], context.log);
    },
    delete: async (): Promise<void> => {
      await execPromise(getPodman(), ['machine', 'rm', '-f', machineInfo.name]);
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

  // get configuration for this connection
  const containerConfiguration = extensionApi.configuration.getConfiguration('podman', containerProviderConnection);

  // Set values for the machine
  containerConfiguration.update('machine.cpus', machineInfo.cpus);
  containerConfiguration.update('machine.memory', machineInfo.memory);
  containerConfiguration.update('machine.diskSize', machineInfo.diskSize);

  currentConnections.set(machineInfo.name, disposable);
  storedExtensionContext.subscriptions.push(disposable);
}

function execPromise(command: string, args?: string[], logger?: extensionApi.Logger): Promise<string> {
  const env = process.env;
  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac) {
    env.PATH = env.PATH.concat(':/usr/local/bin').concat(':/opt/homebrew/bin');
  } else if (env.FLATPAK_ID) {
    // need to execute the command on the host
    args = ['--host', command, ...args];
    command = 'flatpak-spawn';
  }
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    const process = spawn(command, args, { env });
    process.on('error', err => {
      reject(err);
    });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      output += data;
      logger?.log(data);
    });
    process.stderr.setEncoding('utf8');
    process.stderr.on('data', data => {
      err += data;
      logger?.error(data);
    });

    process.on('close', exitCode => {
      if (exitCode !== 0) {
        reject(err);
      }
      resolve(output.trim());
    });
  });
}

async function getLastRunInfo(storagePath: string): Promise<PodmanInfo | undefined> {
  const podmanInfoPath = path.resolve(storagePath, 'podman-ext.json');
  if (!fs.existsSync(storagePath)) {
    await promisify(fs.mkdir)(storagePath);
  }

  if (!fs.existsSync(podmanInfoPath)) {
    return undefined;
  }

  try {
    const infoBuffer = await readFile(podmanInfoPath);
    return JSON.parse(infoBuffer.toString('utf8'));
  } catch (err) {
    console.error(err);
  }

  return undefined;
}

interface InstalledPodman {
  version: string;
}

export async function getPodmanInstallation(): Promise<InstalledPodman | undefined> {
  try {
    const versionOut = await execPromise(getPodman(), ['--version']);
    const versionArr = versionOut.split(' ');
    const version = versionArr[versionArr.length - 1];
    return { version };
  } catch (err) {
    // no podman binary
    return undefined;
  }
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  storedExtensionContext = extensionContext;
  const podmanInfoRaw = await getLastRunInfo(extensionContext.storagePath);
  podmanInfo = new PodmanInfoImpl(podmanInfoRaw, extensionContext.storagePath);
  const bundledPodmanVersion = getBundledPodmanVersion();

  if (!podmanInfoRaw) {
    const installedPodman = await getPodmanInstallation();
    if (!installedPodman) {
      const dialogResult = await extensionApi.window.showInformationMessage(
        'Podman',
        `Podman is not installed on this system, would you like to install Podman ${bundledPodmanVersion}?`,
        'Yes',
        'No',
      );
      if (dialogResult === 'Yes') {
        await installBundledPodman();
        const newInstalledPodman = await getPodmanInstallation();
        // write podman version
        if (newInstalledPodman) {
          podmanInfo.podmanVersion = newInstalledPodman.version;
        }
      } else {
        return; // exiting as without podman this extension useless
      }
    } else {
      //TODO: check if podman requires update
      // startPodmanUpdateCheck();
      checkInstalledPodmanVersion(installedPodman.version, bundledPodmanVersion);
    }
  } else {
    //TODO: check if podman requires update
    // startPodmanUpdateCheck();
    checkInstalledPodmanVersion(podmanInfo.podmanVersion, bundledPodmanVersion);
  }

  const provider = extensionApi.provider.createProvider({ name: 'Podman', id: 'podman', status: 'unknown' });
  extensionContext.subscriptions.push(provider);

  // allows to create machines
  if (isMac || isWindows) {
    provider.setContainerProviderConnectionFactory({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: async (params: { [key: string]: any }): Promise<void> => {
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

        await execPromise(getPodman(), parameters);
      },
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
    const disposable = extensionApi.Disposable.create(() => {
      podmanProcess.kill();
    });
    extensionContext.subscriptions.push(disposable);
    initDefaultLinux(provider);
  } else if (isWindows) {
    if (!fs.existsSync(podmanMachineDirectoryWindows)) {
      return;
    }
    monitorMachines(provider);
  }

  // register the registries
  const registrySetup = new RegistrySetup();
  await registrySetup.setup(extensionContext);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function startPodmanUpdateCheck(): void {
  const currentTime = new Date().getMilliseconds();
  const oneDay = 86400000;
  if (currentTime - podmanInfo.lastUpdateCheck < oneDay) {
    doCheckUpdate();
  } else {
    // setup timer
    updateCheckTimer = setTimeout(() => doCheckUpdate(), oneDay - currentTime - podmanInfo.lastUpdateCheck);
  }
}

async function doCheckUpdate(): Promise<void> {
  const latestVersion = await fetchLatestPodmanVersion();
  if (latestVersion.name !== podmanInfo.podmanVersion) {
    //TODO: better to use some sort of notifications for this
    const answer = await extensionApi.window.showInformationMessage(
      'Podman Update',
      `There are new Podman ${latestVersion.name}.\nDo you want to install it?`,
      'Yes',
      'No',
    );
    if (answer === 'Yes') {
      await installPodman(latestVersion);
      const newInstalledPodman = await getPodmanInstallation();
      // write podman version
      if (newInstalledPodman) {
        podmanInfo.podmanVersion = newInstalledPodman.version;
      }
    }
  }

  podmanInfo.lastUpdateCheck = new Date().getMilliseconds();
}

async function checkInstalledPodmanVersion(installedVersion: string, bundledVersion: string): Promise<void> {
  if (lte(installedVersion, bundledVersion)) {
    const answer = await extensionApi.window.showInformationMessage(
      'Podman',
      `You have Podman ${installedVersion}.\nDo you want to update to ${bundledVersion}?`,
      'Yes',
      'No',
    );
    if (answer === 'Yes') {
      await installBundledPodman();
      podmanInfo.podmanVersion = bundledVersion;
    }
  }
}

export function deactivate(): void {
  stopLoop = true;
  if (updateCheckTimer) {
    clearTimeout(updateCheckTimer);
    updateCheckTimer = undefined;
  }
  console.log('stopping podman extension');
}

class PodmanInfoImpl implements PodmanInfo {
  constructor(private podmanInfo: PodmanInfo, private readonly storagePath: string) {
    if (!podmanInfo) {
      this.podmanInfo = { lastUpdateCheck: 0 } as PodmanInfo;
    }
  }

  set podmanVersion(version: string) {
    if (this.podmanInfo.podmanVersion !== version) {
      this.podmanInfo.podmanVersion = version;
      this.writeInfo();
    }
  }

  get podmanVersion(): string {
    return this.podmanInfo.podmanVersion;
  }

  set lastUpdateCheck(lastCheck: number) {
    if (this.podmanInfo.lastUpdateCheck !== lastCheck) {
      this.podmanInfo.lastUpdateCheck = lastCheck;
      this.writeInfo();
    }
  }

  get lastUpdateCheck(): number {
    return this.podmanInfo.lastUpdateCheck;
  }

  private async writeInfo(): Promise<void> {
    try {
      const podmanInfoPath = path.resolve(this.storagePath, 'podman-ext.json');
      await writeFile(podmanInfoPath, JSON.stringify(this.podmanInfo));
    } catch (err) {
      console.error(err);
    }
  }
}
