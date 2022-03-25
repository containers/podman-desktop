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

type StatusHandler = (event: extensionApi.ProviderStatus) => void;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const commander = new DaemonCommander();
let daemonProcess: childProcess.ChildProcess;
let statusFetchTimer: NodeJS.Timer;

let crcStatus: Status;

const statusHandlers = new Set<StatusHandler>();

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  let socketPath;
  const isWindows = os.platform() === 'win32';
  if (isWindows) {
    socketPath = '//./pipe/crc-podman';
  } else {
    socketPath = path.resolve(os.homedir(), '.crc/machines/crc/docker.sock');
  }

  const dockerContainerProvider: extensionApi.ContainerProvider = {
    provideName: () => 'crc/podman',

    provideConnection: async (): Promise<string> => {
      return socketPath;
    },
  };
  if (fs.existsSync(socketPath)) {
    const disposable = await extensionApi.container.registerContainerProvider(dockerContainerProvider);
    extensionContext.subscriptions.push(disposable);
    console.log('crc extension is active');
  } else {
    console.error(`Could not find crc podman socket at ${socketPath}`);
  }

  registerCrcCluster();
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

async function registerCrcCluster(): Promise<void> {
  try {
    const daemonStarted = await daemonStart();
    if (!daemonStarted) {
      return;
    }
    await delay(8000);

    // initial status
    crcStatus = await commander.status();
  } catch (err) {
    console.error(err);
  }

  const clusterLifecycle: extensionApi.ProviderLifecycle = {
    provideName: () => 'CRC',
    start: async () => {
      try {
        await commander.start();
      } catch (err) {
        console.error(err);
      }
    },
    stop: async () => {
      try {
        await commander.stop();
      } catch (err) {
        console.error(err);
      }
    },
    status: () => {
      return convertToStatus(crcStatus.CrcStatus);
    },
    handleLifecycleChange: async handler => {
      statusHandlers.add(handler);
      if (!statusFetchTimer) {
        startStatusUpdateTimer();
      }
    },
  };
  extensionApi.kubernetes.registerLifecycle(clusterLifecycle);
}

function convertToStatus(crcStatus: string): extensionApi.ProviderStatus {
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
    statusHandlers.forEach(h => h(convertToStatus(crcStatus.CrcStatus)));
  }, 2000);
}

// async function crcBinary(): Promise<string> {
//   return which('crc');
// }

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
