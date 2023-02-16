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
import type { Status } from './daemon-commander';
import { DaemonCommander } from './daemon-commander';
import { LogProvider } from './log-provider';
import { isWindows } from './util';
import { daemonStart, daemonStop, getCrcVersion } from './crc-cli';
import { getCrcDetectionChecks } from './detection-checks';

const commander = new DaemonCommander();
let statusFetchTimer: NodeJS.Timer;

let crcStatus: Status;

const crcLogProvider = new LogProvider(commander);

const defaultStatus = { CrcStatus: 'Unknown', Preset: 'Unknown' };

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const crcVersion = await getCrcVersion();

  const detectionChecks: extensionApi.ProviderDetectionCheck[] = [];
  let status: extensionApi.ProviderStatus = 'not-installed';
  let preset = 'unknown';
  if (crcVersion) {
    status = 'installed';

    const daemonStarted = await daemonStart();
    if (!daemonStarted) {
      //TODO handle this
      return;
    }

    try {
      // initial status
      crcStatus = await commander.status();
    } catch (err) {
      console.error('error in CRC extension', err);
      crcStatus = defaultStatus;
    }

    // detect preset of CRC
    preset = readPreset(crcStatus);

    startStatusUpdateTimer();
  }

  detectionChecks.push(...getCrcDetectionChecks(crcVersion));

  // create CRC provider
  const provider = extensionApi.provider.createProvider({
    name: 'CRC',
    id: 'crc',
    version: crcVersion?.version,
    status: status,
    detectionChecks: detectionChecks,
    images: {
      icon: './icon.png',
      logo: './icon.png',
    },
  });
  extensionContext.subscriptions.push(provider);

  const daemonStarted = await daemonStart();
  if (!daemonStarted) {
    return;
  }

  const providerLifecycle: extensionApi.ProviderLifecycle = {
    status: () => convertToProviderStatus(crcStatus?.CrcStatus),

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
}

function registerPodmanConnection(provider: extensionApi.Provider, extensionContext: extensionApi.ExtensionContext) {
  let socketPath;

  if (isWindows()) {
    socketPath = '//./pipe/crc-podman';
  } else {
    socketPath = path.resolve(os.homedir(), '.crc/machines/crc/docker.sock');
  }

  if (fs.existsSync(socketPath)) {
    const status = () => convertToConnectionStatus(crcStatus?.CrcStatus);

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

  daemonStop();

  if (statusFetchTimer) {
    clearInterval(statusFetchTimer);
  }
}

async function registerOpenShiftLocalCluster(
  provider: extensionApi.Provider,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const status = () => convertToConnectionStatus(crcStatus?.CrcStatus);
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

function convertToConnectionStatus(crcStatus: string): extensionApi.ProviderConnectionStatus {
  switch (crcStatus) {
    case 'Running':
      return 'started';
    case 'Starting':
      return 'starting';
    case 'Stopping':
      return 'stopping';
    case 'Stopped':
    case 'No Cluster':
      return 'stopped';
    default:
      return 'unknown';
  }
}

function convertToProviderStatus(crcStatus: string): extensionApi.ProviderStatus {
  switch (crcStatus) {
    case 'Running':
      return 'started';
    case 'Starting':
      return 'starting';
    case 'Stopping':
      return 'stopping';
    case 'Stopped':
      return 'stopped';
    case 'No Cluster':
      return 'configured';
    default:
      return 'not-installed';
  }
}

async function startStatusUpdateTimer(): Promise<void> {
  statusFetchTimer = setInterval(async () => {
    try {
      crcStatus = await commander.status();
    } catch (e) {
      console.error('CRC Status tick: ' + e);
      crcStatus = defaultStatus;
    }
  }, 1000);
}

function readPreset(crcStatus: Status): 'Podman' | 'OpenShift' | 'unknown' {
  try {
    switch (crcStatus.Preset) {
      case 'podman':
        return 'Podman';
      case 'openshift':
        return 'OpenShift';
      default:
        return 'unknown';
    }
  } catch (err) {
    console.log('error while getting preset', err);
    return 'unknown';
  }
}
