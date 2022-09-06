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
import { spawn } from 'node:child_process';

export const isWindows = os.platform() === 'win32';
export const isMac = os.platform() === 'darwin';
export const isLinux = os.platform() === 'linux';

/**
 * @returns true if app running in dev mode
 */
export function isDev(): boolean {
  const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
  const envSet = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
  return isEnvSet ? envSet : false;
}

export interface SpawnResult {
  exitCode: number;
  stdOut: string;
  stdErr: string;
}

export interface RunOptions {
  env?: NodeJS.ProcessEnv;
}

export function runCliCommand(command: string, args: string[], options?: RunOptions): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    let env = Object.assign({}, process.env); // clone original env object
    if (options?.env) {
      env = Object.assign(env, options.env);
    }

    const spawnProcess = spawn(command, args, { shell: isWindows, env });
    spawnProcess.on('error', err => {
      reject(err);
    });
    spawnProcess.stdout.setEncoding('utf8');
    spawnProcess.stdout.on('data', data => {
      output += data;
    });
    spawnProcess.stderr.setEncoding('utf8');
    spawnProcess.stderr.on('data', data => {
      err += data;
    });

    spawnProcess.on('close', exitCode => {
      resolve({ exitCode, stdOut: output, stdErr: err });
    });
  });
}
