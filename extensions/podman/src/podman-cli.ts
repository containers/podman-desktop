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
import { spawn } from 'node:child_process';
import { isMac, isWindows } from './util';
import type { CancellationToken, Logger } from '@podman-desktop/api';
import { configuration } from '@podman-desktop/api';

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

export function getInstallationPath(): string {
  const env = process.env;
  if (isWindows()) {
    return `c:\\Program Files\\RedHat\\Podman;${env.PATH}`;
  } else if (isMac()) {
    if (!env.PATH) {
      return macosExtraPath;
    } else {
      return env.PATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return env.PATH;
  }
}

export function getPodmanCli(): string {
  // If we have a custom binary path regardless if we are running Windows or not
  const customBinaryPath = getCustomBinaryPath();
  if (customBinaryPath) {
    return customBinaryPath;
  }

  if (isWindows()) {
    return 'podman.exe';
  }
  return 'podman';
}

// Get the Podman binary path from configuration podman.binary.path
// return string or undefined
export function getCustomBinaryPath(): string | undefined {
  return configuration.getConfiguration('podman').get('binary.path');
}

export interface ExecOptions {
  logger?: Logger;
  env?: NodeJS.ProcessEnv | undefined;
}

export function execPromise(
  command: string,
  args?: string[],
  options?: ExecOptions,
  token?: CancellationToken,
): Promise<string> {
  let env = Object.assign({}, process.env); // clone original env object

  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac() || isWindows()) {
    env.PATH = getInstallationPath();
  } else if (env.FLATPAK_ID) {
    // need to execute the command on the host
    args = ['--host', command, ...args];
    command = 'flatpak-spawn';
  }

  if (options?.env) {
    env = Object.assign(env, options.env);
  }
  return new Promise((resolve, reject) => {
    let stdOut = '';
    let stdErr = '';
    const process = spawn(command, args, { env });
    // if the token is cancelled, kill the process and reject the promise
    token?.onCancellationRequested(() => {
      process.kill();
      // reject the promise
      reject('Execution cancelled');
    });
    process.on('error', error => {
      let content = '';
      if (stdOut && stdOut !== '') {
        content += stdOut + '\n';
      }
      if (stdErr && stdErr !== '') {
        content += stdErr + '\n';
      }
      reject(content + error);
    });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      stdOut += data;
      options?.logger?.log(data);
    });
    process.stderr.setEncoding('utf8');
    process.stderr.on('data', data => {
      stdErr += data;
      options?.logger?.error(data);
    });

    process.on('close', exitCode => {
      let content = '';
      if (stdOut && stdOut !== '') {
        content += stdOut + '\n';
      }
      if (stdErr && stdErr !== '') {
        content += stdErr + '\n';
      }

      if (exitCode !== 0) {
        reject(content);
      }
      resolve(stdOut.trim());
    });
  });
}

export interface InstalledPodman {
  version: string;
}

export async function getPodmanInstallation(): Promise<InstalledPodman | undefined> {
  try {
    const versionOut = await execPromise(getPodmanCli(), ['--version']);
    const versionArr = versionOut.split(' ');
    const version = versionArr[versionArr.length - 1];
    return { version };
  } catch (err) {
    // no podman binary
    return undefined;
  }
}
