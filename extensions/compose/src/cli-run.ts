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

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import * as path from 'node:path';
import * as sudo from 'sudo-prompt';
import * as os from 'node:os';
import type * as extensionApi from '@podman-desktop/api';
import type { OS } from './os';

export interface SpawnResult {
  exitCode: number;
  stdOut: string;
  stdErr: string;
  error: undefined | string;
}

export interface RunOptions {
  env?: NodeJS.ProcessEnv;
  logger?: extensionApi.Logger;
}

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin';

export class CliRun {
  constructor(private readonly extensionContext: extensionApi.ExtensionContext, private os: OS) {}

  getPath(): string {
    const env = process.env;

    // extension storage bin path (where to store binaries)
    const extensionBinPath = resolve(this.extensionContext.storagePath, 'bin');

    if (this.os.isMac()) {
      if (!env.PATH) {
        return macosExtraPath.concat(':').concat(extensionBinPath);
      } else {
        return env.PATH.concat(':').concat(macosExtraPath).concat(':').concat(extensionBinPath);
      }
    } else if (this.os.isWindows()) {
      return env.PATH.concat(';').concat(extensionBinPath);
    } else {
      return env.PATH.concat(':').concat(extensionBinPath);
    }
  }

  runCommand(command: string, args: string[], options?: RunOptions): Promise<SpawnResult> {
    return new Promise(resolve => {
      let stdOut = '';
      let stdErr = '';
      let err = '';
      let env = Object.assign({}, process.env); // clone original env object

      // In production mode, applications don't have access to the 'user' path like brew
      if (this.os.isMac() || this.os.isWindows()) {
        env.PATH = this.getPath();
        if (this.os.isWindows()) {
          // Escape any whitespaces in command
          command = `"${command}"`;
        }
      } else if (env.FLATPAK_ID) {
        // need to execute the command on the host
        args = ['--host', command, ...args];
        command = 'flatpak-spawn';
      }

      if (options?.env) {
        env = Object.assign(env, options.env);
      }

      const spawnProcess = spawn(command, args, { shell: this.os.isWindows(), env });
      // do not reject as we want to store exit code in the result
      spawnProcess.on('error', error => {
        if (options?.logger) {
          options.logger.error(error);
        }
        stdErr += error;
        err += error;
      });

      spawnProcess.stdout.setEncoding('utf8');
      spawnProcess.stdout.on('data', data => {
        if (options?.logger) {
          options.logger.log(data);
        }
        stdOut += data;
      });
      spawnProcess.stderr.setEncoding('utf8');
      spawnProcess.stderr.on('data', data => {
        if (options?.logger) {
          // log create to stdout instead of stderr
          if (args?.[0] === 'create') {
            options.logger.log(data);
          } else {
            options.logger.error(data);
          }
        }
        stdErr += data;
      });

      spawnProcess.on('close', exitCode => {
        resolve({ exitCode, stdOut, stdErr, error: err });
      });
    });
  }

  // Takes a binary path (e.g. /tmp/docker-compose) and installs it to the system. Renames it based on binaryName
  // supports Windows, Linux and macOS
  // If using Windows or Mac, we will use sudo-prompt in order to elevate the privileges
  // If using Linux, we'll use pkexec and polkit support to ask for privileges.
  // When running in a flatpak, we'll use flatpak-spawn to execute the command on the host
  async installBinaryToSystem(binaryPath: string, binaryName: string): Promise<void> {
    const system = process.platform;

    // Before copying the file, make sure it's executable (chmod +x) for Linux and Mac
    if (system === 'linux' || system === 'darwin') {
      try {
        await this.runCommand('chmod', ['+x', binaryPath]);
        console.log(`Made ${binaryPath} executable`);
      } catch (error) {
        throw new Error(`Error making binary executable: ${error}`);
      }
    }

    // Create the appropriate destination path (Windows uses AppData/Local, Linux and Mac use /usr/local/bin)
    // and the appropriate command to move the binary to the destination path
    let destinationPath: string;
    let command: string[];
    if (system == 'win32') {
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
          name: 'Binary Installation',
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
        await this.runCommand('pkexec', command);
        console.log(`Successfully installed '${binaryName}' binary.`);
      } catch (error) {
        console.error(`Failed to install '${binaryName}' binary: ${error}`);
        throw error;
      }
    }
  }
}
