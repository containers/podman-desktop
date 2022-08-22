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

import type * as extensionApi from '@tmpwip/extension-api';
import { isMac, isWindows } from './util';

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

export function getInstallationPath(): string {
  const env = process.env;
  if (isWindows) {
    return 'c:\\Program Files\\RedHat\\Podman\\podman.exe';
  } else if (isMac) {
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
  if (isWindows) {
    return getInstallationPath();
  }
  return 'podman';
}

export interface ExecOptions {
  logger?: extensionApi.Logger;
  env?: NodeJS.ProcessEnv | undefined;
}

export function execPromise(command: string, args?: string[], options?: ExecOptions): Promise<string> {
  let env = Object.assign({}, process.env); // clone original env object

  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac) {
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
