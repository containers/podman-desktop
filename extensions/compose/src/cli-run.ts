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

import * as os from 'node:os';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type * as extensionApi from '@podman-desktop/api';
export const isWindows = os.platform() === 'win32';
export const isMac = os.platform() === 'darwin';
export const isLinux = os.platform() === 'linux';

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
  constructor(private readonly extensionContext: extensionApi.ExtensionContext) {}

  getPath(): string {
    const env = process.env;

    // extension storage bin path (where to store binaries)
    const extensionBinPath = resolve(this.extensionContext.storagePath, 'bin');

    if (isMac) {
      if (!env.PATH) {
        return macosExtraPath.concat(':').concat(extensionBinPath);
      } else {
        return env.PATH.concat(':').concat(macosExtraPath).concat(':').concat(extensionBinPath);
      }
    } else if (isWindows) {
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
      if (isMac || isWindows) {
        env.PATH = this.getPath();
        if (isWindows) {
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

      const spawnProcess = spawn(command, args, { shell: isWindows, env });
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
}
