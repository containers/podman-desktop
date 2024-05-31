/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

export interface RunOptions {
  env?: NodeJS.ProcessEnv;
  logger?: extensionApi.Logger;
}

const localBinDir = '/usr/local/bin';

// Takes a binary path (e.g. /tmp/kubectl) and installs it to the system. Renames it based on binaryName
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
  let args: string[] = [];
  let command: string | undefined;
  if (system === 'win32') {
    destinationPath = path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'WindowsApps', `${binaryName}.exe`);
    command = 'copy';
    args = [`"${binaryPath}"`, `"${destinationPath}"`];
  } else if (system === 'darwin') {
    destinationPath = path.join(localBinDir, binaryName);
    command = 'exec';
    args = ['cp', binaryPath, destinationPath];
  } else if (system === 'linux') {
    destinationPath = path.join(localBinDir, binaryName);
    command = '/bin/sh';
    args = ['-c', `cp ${binaryPath} ${destinationPath}`];
  }

  // If on macOS or Linux, check to see if the /usr/local/bin directory exists,
  // if it does not, then add mkdir -p /usr/local/bin to the start of the command when moving the binary.
  if ((system === 'linux' || system === 'darwin') && !fs.existsSync(localBinDir)) {
    if (system === 'darwin') {
      args.unshift('mkdir', '-p', localBinDir, '&&');
    } else {
      // add mkdir -p /usr/local/bin just after the first item or args array (so it'll be in the -c shell instruction)
      args[args.length - 1] = `mkdir -p /usr/local/bin && ${args[args.length - 1]}`;
    }
  }

  try {
    // Use admin prileges / ask for password for copying to /usr/local/bin
    if (!command) {
      throw new Error('No command defined');
    }
    await extensionApi.process.exec(command, args, { isAdmin: true });
    console.log(`Successfully installed '${binaryName}' binary.`);
  } catch (error) {
    console.error(`Failed to install '${binaryName}' binary: ${error}`);
    throw error;
  }
}
