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

import * as net from 'node:net';
import { type NetworkInterfaceInfoIPv4, networkInterfaces } from 'node:os';

export interface PortStatus {
  available: boolean;
  message?: string;
}

/**
 * Find a free port starting from the given port
 */
export async function getFreePort(port = 0): Promise<number> {
  if (port < 1024) {
    port = 9000;
  }
  let isFree = false;
  while (!isFree) {
    isFree = (await isFreePort(port)).available;
    if (!isFree) {
      port++;
    }
  }

  return port;
}

/**
 * Find a free port range
 */
export async function getFreePortRange(rangeSize: number): Promise<string> {
  let port = 9000;
  let startPort = port;

  do {
    const portStatus = await isFreePort(port);
    if (portStatus.available) {
      ++port;
    } else {
      ++port;
      startPort = port;
    }
  } while (port + 1 - startPort <= rangeSize);

  return `${startPort}-${port - 1}`;
}

function isFreeAddressPort(address: string, port: number): Promise<PortStatus> {
  const server = net.createServer();
  return new Promise(resolve =>
    server
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          resolve({
            available: false,
            message: `Port ${port} is already in use.`,
          });
        } else if (error.code === 'EACCES') {
          resolve({
            available: false,
            message: 'Operation require administrative privileges.',
          });
        } else {
          resolve({
            available: false,
            message: `Failed to check port status: ${error}`,
          });
        }
      })
      .on('listening', () => server.close(() => resolve({ available: true })))
      .listen(port, address),
  );
}

export async function isFreePort(port: number): Promise<PortStatus> {
  if (isNaN(port) || port > 65535) {
    return {
      available: false,
      message: 'The port must have an integer value within the range from 1025 to 65535.',
    };
  } else if (port < 1024) {
    return {
      available: false,
      message: 'The port must be greater than 1024.',
    };
  }

  const intfs = getIPv4Interfaces();
  // Test this special interface separately, or it will interfere with other tests done in parallel
  const portCheckStatus = await isFreeAddressPort('0.0.0.0', port);
  if (!portCheckStatus.available) {
    return portCheckStatus;
  }
  const checkInterfaces = await Promise.all(intfs.map(intf => isFreeAddressPort(intf, port)));
  const combinedPortChecks = checkInterfaces.filter(check => !check.available);
  if (combinedPortChecks && combinedPortChecks.length > 0) {
    // Means, that some check was not successful and port is not available
    return {
      available: false,
      message: combinedPortChecks.map(check => check.message).join('\n'),
    };
  }
  return { available: true };
}

function getIPv4Interfaces(): string[] {
  const intfs = networkInterfaces();
  if (!intfs) {
    return [];
  }
  return Object.values(intfs)
    .flat()
    .filter((intf): intf is NetworkInterfaceInfoIPv4 => !!intf && intf.family === 'IPv4' && !!intf.address)
    .map(intf => intf.address);
}
