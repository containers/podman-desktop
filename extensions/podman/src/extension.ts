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
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { spawn } from 'child_process';

type StatusHandler = (name: string, event: extensionApi.ProviderConnectionStatus) => void;

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';
const isLinux = os.platform() === 'linux';

const listeners = new Set<StatusHandler>();
const podmanMachineSocketsDirectoryMac = path.resolve(os.homedir(), '.local/share/containers/podman/machine');
const podmanMachineDirectoryWindows = path.resolve(os.homedir(), '.local/share/containers/podman/machine/wsl/wsldist');
let storedExtensionContext;
let stopLoop = false;

// current status of machines
const podmanMachinesStatuses = new Map<string, extensionApi.ProviderConnectionStatus>();
const currentConnections = new Map<string, extensionApi.Disposable>();

type MachineJSON = {
  Name: string;
  Running: boolean;
};

async function updateMachines(provider: extensionApi.Provider): Promise<void> {
  // init machines available
  const machineListOutput = await execPromise('podman', ['machine', 'list', '--format', 'json']);

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
    podmanMachinesStatuses.set(machine.Name, status);
  });

  // remove machine no longer there
  const machinesToRemove = Array.from(podmanMachinesStatuses.keys()).filter(
    machine => !machines.find(m => m.Name === machine),
  );
  machinesToRemove.forEach(machine => podmanMachinesStatuses.delete(machine));

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
        socketPath = `//./pipe/podman-${machineName}`;
      }
      registerProviderFor(provider, machineName, socketPath);
    }),
  );

  // delete connections for machines no longer there
  machinesToRemove.forEach(machine => {
    const disposable = currentConnections.get(machine);
    if (disposable) {
      console.log('disposing the connection', machine);
      disposable.dispose();
      currentConnections.delete(machine);
    }
  });
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
    name = 'Podman';
  } else if (machineName.startsWith('podman-machine-')) {
    const sub = machineName.substring('podman-machine-'.length);
    name = `Podman(${sub})`;
  } else {
    name = `Podman(${machineName})`;
  }
  return name;
}
async function registerProviderFor(provider: extensionApi.Provider, machineName: string, socketPath: string) {
  const lifecycle: extensionApi.ProviderConnectionLifecycle = {
    start: async (): Promise<void> => {
      // start the machine
      console.log(`executing podman machine start ${machineName}`);
      await execPromise('podman', ['machine', 'start', machineName]);
      console.log(`podman machine ${machineName} started`);
    },
    stop: async (): Promise<void> => {
      console.log(`executing podman machine stop ${machineName}`);
      await execPromise('podman', ['machine', 'stop', machineName]);
      console.log(`podman machine ${machineName} stopped`);
    },
  };

  const containerProviderConnection: extensionApi.ContainerProviderConnection = {
    name: prettyMachineName(machineName),
    type: 'podman',
    status: () => podmanMachinesStatuses.get(machineName),
    lifecycle,
    endpoint: {
      socketPath,
    },
  };

  const disposable = provider.registerContainerProviderConnection(containerProviderConnection);
  currentConnections.set(machineName, disposable);
  storedExtensionContext.subscriptions.push(disposable);
}

function execPromise(command, args?: string[]): Promise<string> {
  const env = process.env;
  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac) {
    env.PATH = env.PATH.concat(':/usr/local/bin').concat(':/opt/homebrew/bin');
  }
  return new Promise((resolve, reject) => {
    let output = '';
    const process = spawn(command, args, { env });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      output += data;
    });

    process.on('close', () => resolve(output.trim()));
    process.on('error', err => reject(err));
  });
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  storedExtensionContext = extensionContext;

  const provider = extensionApi.provider.createProvider({ name: 'Podman', status: 'unknown' });
  extensionContext.subscriptions.push(provider);

  // no podman for now, skip
  if (isMac) {
    if (!fs.existsSync(podmanMachineSocketsDirectoryMac)) {
      return;
    }
    monitorMachines(provider);
  } else if (isLinux) {
    // on Linux, need to run the system service for unlimited time
    const process = spawn('podman', ['system', 'service', '--time=0']);
    await timeout(500);
    const disposable = extensionApi.Disposable.create(() => {
      process.kill();
    });
    extensionContext.subscriptions.push(disposable);
    initDefaultLinux(provider);
  } else if (isWindows) {
    if (!fs.existsSync(podmanMachineDirectoryWindows)) {
      return;
    }
    monitorMachines(provider);
  }
}

export function deactivate(): void {
  stopLoop = true;
  console.log('stopping podman extension');
}
