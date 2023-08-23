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

import * as os from 'node:os';
import * as path from 'node:path';
import * as sudo from 'sudo-prompt';
import * as extensionApi from '@podman-desktop/api';
import type { KindInstaller } from './kind-installer';
import * as http from 'node:http';

const windows = os.platform() === 'win32';
export function isWindows(): boolean {
  return windows;
}
const mac = os.platform() === 'darwin';
export function isMac(): boolean {
  return mac;
}
const linux = os.platform() === 'linux';
export function isLinux(): boolean {
  return linux;
}

export interface SpawnResult {
  stdOut: string;
  stdErr: string;
  error: undefined | string;
}

export interface RunOptions {
  env?: NodeJS.ProcessEnv;
  logger?: extensionApi.Logger;
}

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

export function getKindPath(): string {
  const env = process.env;
  if (isMac()) {
    if (!env.PATH) {
      return macosExtraPath;
    } else {
      return env.PATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return env.PATH;
  }
}

// search if kind is available in the path
export async function detectKind(pathAddition: string, installer: KindInstaller): Promise<string> {
  try {
    await extensionApi.process.exec('kind', ['--version'], { env: { PATH: getKindPath() } });
    return 'kind';
  } catch (e) {
    // ignore and try another way
  }

  const assetInfo = await installer.getAssetInfo();
  if (assetInfo) {
    try {
      await extensionApi.process.exec(assetInfo.name, ['--version'], {
        env: { PATH: getKindPath().concat(path.delimiter).concat(pathAddition) },
      });
      return pathAddition.concat(path.sep).concat(isWindows() ? assetInfo.name + '.exe' : assetInfo.name);
    } catch (e) {
      console.error(e);
    }
  }
  return undefined;
}

// Takes a binary path (e.g. /tmp/kind) and installs it to the system. Renames it based on binaryName
// supports Windows, Linux and macOS
// If using Windows or Mac, we will use sudo-prompt in order to elevate the privileges
// If using Linux, we'll use pkexec and polkit support to ask for privileges.
// When running in a flatpak, we'll use flatpak-spawn to execute the command on the host
export async function installBinaryToSystem(binaryPath: string, binaryName: string): Promise<void> {
  const system = process.platform;

  // Before copying the file, make sure it's executable (chmod +x) for Linux and Mac
  if (system === 'linux' || system === 'darwin') {
    try {
      await extensionApi.process.exec('chmod', ['+x', binaryPath]);
      console.log(`Made ${binaryPath} executable`);
    } catch (error) {
      throw new Error(`Error making binary executable: ${error}`);
    }
  }

  // Create the appropriate destination path (Windows uses AppData/Local, Linux and Mac use /usr/local/bin)
  // and the appropriate command to move the binary to the destination path
  let destinationPath: string;
  let command: string[];
  if (system === 'win32') {
    destinationPath = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WindowsApps', `${binaryName}.exe`);
    command = ['copy', `"${binaryPath}"`, `"${destinationPath}"`];
  } else {
    destinationPath = path.join('/usr/local/bin', binaryName);
    command = ['cp', binaryPath, destinationPath];
  }

  // If windows or mac, use sudo-prompt to elevate the privileges
  // if Linux, use sudo and polkit support
  if (system === 'win32' || system === 'darwin') {
    return new Promise<void>((resolve, reject) => {
      // Convert the command array to a string for sudo prompt
      // the name is used for the prompt
      const sudoOptions = {
        name: `${binaryName} Binary Installation`,
      };
      const sudoCommand = command.join(' ');
      sudo.exec(sudoCommand, sudoOptions, error => {
        if (error) {
          console.error(`Failed to install '${binaryName}' binary: ${error}`);
          reject(error);
        } else {
          console.log(`Successfully installed '${binaryName}' binary.`);
          resolve();
        }
      });
    });
  } else {
    try {
      // Use pkexec in order to elevate the prileges / ask for password for copying to /usr/local/bin
      await extensionApi.process.exec('pkexec', command);
      console.log(`Successfully installed '${binaryName}' binary.`);
    } catch (error) {
      console.error(`Failed to install '${binaryName}' binary: ${error}`);
      throw error;
    }
  }
}

export async function getMemTotalInfo(socketPath: string): Promise<number> {
  const versionUrl = {
    path: '/info',
    socketPath: socketPath,
  };

  interface Info {
    MemTotal: number;
  }

  return new Promise<number>((resolve, reject) => {
    const req = http.get(versionUrl, res => {
      const body = [];
      res.on('data', chunk => {
        body.push(chunk);
      });

      res.on('end', err => {
        if (res.statusCode === 200) {
          try {
            resolve((JSON.parse(Buffer.concat(body).toString()) as Info).MemTotal);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(err.message));
        }
      });
    });

    req.once('error', err => {
      reject(new Error(err.message));
    });
  });
}
