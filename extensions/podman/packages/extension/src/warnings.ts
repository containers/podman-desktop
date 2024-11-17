/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import http from 'node:http';
import * as os from 'node:os';

import type * as extensionApi from '@podman-desktop/api';

const DEFAULT_TIMEOUT = 5000;

// Explanations
const detailsExplanation = 'Docker socket is not reachable. Docker specific tools may not work.';

// Default socket paths
const windowsSocketPath = '//./pipe/docker_engine';
const defaultSocketPath = '/var/run/docker.sock';

// Return the warning information to the user if the socket is not a disguised Podman socket
export function getDisguisedPodmanInformation(): extensionApi.ProviderInformation {
  let details: string;

  // Set the details message based on the OS
  switch (os.platform()) {
    case 'win32':
      details = detailsExplanation;
      break;
    case 'darwin':
      // Due to how `podman-mac-helper` does not (by default) map the emulator to /var/run/docker.sock, we need to explain
      // that the user must go on the Podman Desktop website for more information. This is because the user must manually
      // map the socket to /var/run/docker.sock if not done by `podman machine` already (podman machine automatically maps the socket if Docker is not running)
      details = detailsExplanation.concat(` Press 'Docker Compatibility' button to enable.`);
      break;
    default:
      details = detailsExplanation;
      break;
  }

  // Return ProviderInformation with the details message
  return {
    name: 'Docker Socket Compatibility',
    details,
  };
}

// Async function that checks to see if the current Docker socket is a disguised Podman socket
export async function isDisguisedPodman(): Promise<boolean> {
  const socketPath = getSocketPath();
  return isDisguisedPodmanPath(socketPath, DEFAULT_TIMEOUT);
}

export async function isDisguisedPodmanPath(socketPath: string, timeout?: number): Promise<boolean> {
  const options: http.RequestOptions = {
    path: '/libpod/_ping',
    socketPath,
    method: 'GET',
  };
  // add timeout if provided
  if (timeout) {
    options.timeout = timeout;
  }

  return new Promise<boolean>(resolve => {
    const req = http.request(options, res => {
      res.on('data', () => {
        // do nothing
      });

      res.on('end', () => {
        // true if status code is OK
        resolve(res.statusCode === 200);
      });
    });

    // in case of error, it's not reachable
    req.once('error', err => {
      console.debug('Error while pinging docker as podman', err);
      resolve(false);
    });

    // in case of timeout, it's not reachable
    req.on('timeout', () => {
      resolve(false);
    });

    req.end();
  });
}

// Function that checks whether you are running windows, mac or linux and returns back
// the correct Docker socket location
export function getSocketPath(): string {
  let socketPath: string = defaultSocketPath;
  if (os.platform() === 'win32') {
    socketPath = windowsSocketPath;
  }
  return socketPath;
}
