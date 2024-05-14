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

/**
 * Find a free port starting from the given port
 */
export async function getFreePort(port = 0): Promise<number> {
  if (port < 1024) {
    port = 9000;
  }
  let isFree = false;
  while (!isFree) {
    try {
      await isFreePort(port);
      isFree = true;
    } catch (e) {
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
    try {
      await isFreePort(port);
      ++port;
    } catch (e) {
      ++port;
      startPort = port;
    }
  } while (port + 1 - startPort <= rangeSize);

  return `${startPort}-${port - 1}`;
}

function isFreeAddressPort(address: string, port: number): Promise<boolean> {
  const server = net.createServer();
  return new Promise((resolve, reject) =>
    server
      .on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is already in use.`));
        } else if (error.code === 'EACCES') {
          reject(new Error('Operation require administrative privileges.'));
        } else {
          reject(new Error(`Failed to check port status: ${error}`));
        }
      })
      .on('listening', () => server.close(() => resolve(true)))
      .listen(port, address),
  );
}

export async function isFreePort(port: number): Promise<boolean> {
  if (isNaN(port) || port > 65535) {
    throw new Error('The port must have an integer value within the range from 1025 to 65535.');
  } else if (port < 1024) {
    throw new Error('The port must be greater than 1024.');
  }

  const intfs = getIPv4Interfaces();

  await isFreeAddressPort('0.0.0.0', port);
  await Promise.all(intfs.map(intf => isFreeAddressPort(intf, port)));

  return true;
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
