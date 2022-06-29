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

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin';

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

export function execPromise(command: string, args?: string[], logger?: extensionApi.Logger): Promise<string> {
  const env = process.env;
  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac) {
    env.PATH = getInstallationPath();
  } else if (env.FLATPAK_ID) {
    // need to execute the command on the host
    args = ['--host', command, ...args];
    command = 'flatpak-spawn';
  }
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    const process = spawn(command, args, { env });
    process.on('error', err => {
      reject(err);
    });
    process.stdout.setEncoding('utf8');
    process.stdout.on('data', data => {
      output += data;
      logger?.log(data);
    });
    process.stderr.setEncoding('utf8');
    process.stderr.on('data', data => {
      err += data;
      logger?.error(data);
    });

    process.on('close', exitCode => {
      if (exitCode !== 0) {
        reject(err);
      }
      resolve(output.trim());
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
