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
import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import type * as extensionApi from '@podman-desktop/api';
import type { KindInstaller } from './kind-installer';
import type { CancellationToken } from '@podman-desktop/api';

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
    const result = await runCliCommand('kind', ['--version'], { env: { PATH: getKindPath() } });
    if (result.exitCode === 0) {
      return 'kind';
    }
  } catch (e) {
    // ignore and try another way
  }

  const assetInfo = await installer.getAssetInfo();
  if (assetInfo) {
    try {
      const result = await runCliCommand(assetInfo.name, ['--version'], {
        env: { PATH: getKindPath().concat(path.delimiter).concat(pathAddition) },
      });
      if (result.exitCode === 0) {
        return pathAddition.concat(path.sep).concat(isWindows() ? assetInfo.name + '.exe' : assetInfo.name);
      }
    } catch (e) {
      // ignore
    }
  }
  return undefined;
}

export function runCliCommand(
  command: string,
  args: string[],
  options?: RunOptions,
  token?: CancellationToken,
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    let stdOut = '';
    let stdErr = '';
    let err = '';
    let env = Object.assign({}, process.env); // clone original env object

    // In production mode, applications don't have access to the 'user' path like brew
    if (isMac() || isWindows()) {
      env.PATH = getKindPath();
      if (isWindows()) {
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

    const spawnProcess = spawn(command, args, { shell: isWindows(), env });

    // if the token is cancelled, kill the process and reject the promise
    token?.onCancellationRequested(() => {
      killProcess(spawnProcess);
      options?.logger?.error('Execution cancelled');
      // reject the promise
      reject(new Error('Execution cancelled'));
    });
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
      if (args?.[0] === 'create' || args?.[0] === 'delete') {
        if (options?.logger) {
          options.logger.log(data);
        }
        if (typeof data === 'string' && data.indexOf('error') >= 0) {
          stdErr += data;
        } else {
          stdOut += data;
        }
      } else {
        stdErr += data;
      }
    });

    spawnProcess.on('close', exitCode => {
      if (exitCode == 0) {
        resolve({ exitCode, stdOut, stdErr, error: err });
      } else {
        if (options?.logger) {
          options.logger.error(stdErr);
        }
        reject(new Error(stdErr));
      }
    });
  });
}

function killProcess(spawnProcess: ChildProcess) {
  if (isWindows()) {
    spawn('taskkill', ['/pid', spawnProcess.pid?.toString(), '/f', '/t']);
  } else {
    spawnProcess.kill();
  }
}
