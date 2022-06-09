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
import * as childProcess from 'node:child_process';
// import * as which from 'which';
import type { Status } from './daemon-commander';
import { DaemonCommander } from './daemon-commander';
import { LogProvider } from './log-provider';

const commander = new DaemonCommander();
let daemonProcess: childProcess.ChildProcess;
let statusFetchTimer: NodeJS.Timer;

let crcStatus: Status;

const crcLogProvider = new LogProvider(commander);

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // detect preset of CRC
  const preset = await readPreset();

  // create CRC provider
  const provider = extensionApi.provider.createProvider({ name: 'CodeReady Containers', id: 'crc', status: 'unknown' });
  extensionContext.subscriptions.push(provider);

  const daemonStarted = await daemonStart();
  if (!daemonStarted) {
    return;
  }

  try {
    // initial status
    crcStatus = await commander.status();
  } catch (err) {
    console.error('error in CRC extension', err);
  }

  const providerLifecycle: extensionApi.ProviderLifecycle = {
    status: () => convertToStatus(crcStatus?.CrcStatus),

    start: async context => {
      try {
        crcLogProvider.startSendingLogs(context.log);
        await commander.start();
      } catch (err) {
        console.error(err);
      }
    },
    stop: async () => {
      console.log('extension:crc: receive the call stop');
      try {
        await commander.stop();
        crcLogProvider.stopSendingLogs();
      } catch (err) {
        console.error(err);
      }
    },
  };

  provider.registerLifecycle(providerLifecycle);
  if (preset === 'Podman') {
    // podman connection ?
    registerPodmanConnection(provider, extensionContext);
  } else if (preset === 'OpenShift') {
    // OpenShift
    registerOpenShiftLocalCluster(provider, extensionContext);
  }

  startStatusUpdateTimer();
}

async function daemonStart(): Promise<boolean> {
  // const crc = await crcBinary();
  // console.error(`Crc: ${crc}`);
  // if (!crc) {
  //   return false;
  // }
  // launching the daemon

  // TODO: this is temporary
  if (os.platform() !== 'darwin') {
    return false;
  }

  daemonProcess = childProcess.spawn('/usr/local/bin/crc', ['daemon', '--watchdog'], {
    detached: true,
    windowsHide: true,
  });

  daemonProcess.on('error', err => {
    const msg = `Backend failure, Backend failed to start: ${err}`;
    // TODO: show error on UI!
    console.error('Backend failure', msg);
  });

  daemonProcess.stdout.on('date', () => {
    // noop
  });

  daemonProcess.stderr.on('data', () => {
    // noop
  });

  return true;
}

function registerPodmanConnection(provider: extensionApi.Provider, extensionContext: extensionApi.ExtensionContext) {
  let socketPath;
  const isWindows = os.platform() === 'win32';
  if (isWindows) {
    socketPath = '//./pipe/crc-podman';
  } else {
    socketPath = path.resolve(os.homedir(), '.crc/machines/crc/docker.sock');
  }

  if (fs.existsSync(socketPath)) {
    const status = () => convertToStatus(crcStatus?.CrcStatus);

    const containerConnection: extensionApi.ContainerProviderConnection = {
      name: 'Podman',
      type: 'podman',
      endpoint: {
        socketPath,
      },
      status,
    };

    const disposable = provider.registerContainerProviderConnection(containerConnection);
    extensionContext.subscriptions.push(disposable);
  } else {
    console.error(`Could not find crc podman socket at ${socketPath}`);
  }
}

export function deactivate(): void {
  console.log('stopping crc extension');
  if (daemonProcess) {
    daemonProcess.kill();
  }
  if (statusFetchTimer) {
    clearInterval(statusFetchTimer);
  }
}

async function registerOpenShiftLocalCluster(
  provider: extensionApi.Provider,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const status = () => convertToStatus(crcStatus?.CrcStatus);
  const apiURL = 'https://api.crc.testing:6443';
  const kubernetesProviderConnection: extensionApi.KubernetesProviderConnection = {
    name: 'OpenShift',
    endpoint: {
      apiURL,
    },
    status,
  };

  const disposable = provider.registerKubernetesProviderConnection(kubernetesProviderConnection);
  extensionContext.subscriptions.push(disposable);
}

function convertToStatus(crcStatus: string): extensionApi.ProviderConnectionStatus {
  switch (crcStatus) {
    case 'Running':
      return 'started';
    case 'Starting':
      return 'starting';
    case 'Stopping':
      return 'stopping';
    case 'Stopped':
      return 'stopped';
    default:
      return 'unknown';
  }
}

async function startStatusUpdateTimer(): Promise<void> {
  statusFetchTimer = setInterval(async () => {
    crcStatus = await commander.status();
  }, 2000);
}

// async function crcBinary(): Promise<string> {
//   return which('crc');
// }

function execPromise(command, args?: string[]): Promise<string> {
  const env = process.env;
  // In production mode, applications don't have access to the 'user' path like brew
  return new Promise((resolve, reject) => {
    let output = '';
    const process = childProcess.spawn(command, args, { env });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      output += data;
    });

    process.on('close', () => resolve(output.trim()));
    process.on('error', err => reject(err));
  });
}

async function readPreset(): Promise<'Podman' | 'OpenShift' | 'unknown'> {
  try {
    const stdout = await execPromise('crc', ['config', 'get', 'preset']);
    if (stdout.includes('podman')) {
      return 'Podman';
    } else if (stdout.includes('openshift')) {
      return 'OpenShift';
    } else {
      return 'unknown';
    }
  } catch (err) {
    console.log('error while getting preset', err);
    return 'unknown';
  }
}
