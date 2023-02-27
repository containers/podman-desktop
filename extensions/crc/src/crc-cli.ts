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
import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { isMac, isWindows } from './util';

import type { Logger } from '@tmpwip/extension-api';

const macosExtraPath = '/usr/local/bin:/opt/local/bin';
const crcWindowsInstallPath = 'c:\\Program Files\\Red Hat OpenShift Local';

let daemonProcess: ChildProcess;

export function getInstallationPath(): string {
  const env = process.env;
  if (isWindows()) {
    return `${crcWindowsInstallPath};${env.PATH}`;
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

export function getCrcCli(): string {
  if (isWindows()) {
    return 'crc.exe';
  }
  return 'crc';
}

export interface ExecOptions {
  logger?: Logger;
  env: NodeJS.ProcessEnv | undefined;
}

export function execPromise(command: string, args?: string[], options?: ExecOptions): Promise<string> {
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
    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');

    process.stdout.on('data', data => {
      stdOut += data;
      options?.logger?.log(data);
    });

    process.stderr.on('data', data => {
      stdErr += data;
      options?.logger?.error(data);
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

export interface CrcVersion {
  version: string;
  openshiftVersion: string;
  podmanVersion: string;
}

export async function getCrcVersion(): Promise<CrcVersion | undefined> {
  try {
    const versionOut = await execPromise(getCrcCli(), ['version', '-o', 'json']);
    if (versionOut) {
      return JSON.parse(versionOut);
    }
  } catch (err) {
    // no crc binary or we cant parse output
  }

  return undefined;
}

export async function daemonStart(): Promise<boolean> {
  let command = getCrcCli();
  let args = ['daemon', '--watchdog'];

  const env = Object.assign({}, process.env); // clone original env object

  // In production mode, applications don't have access to the 'user' path like brew
  if (isMac() || isWindows()) {
    env.PATH = getInstallationPath();
  } else if (env.FLATPAK_ID) {
    // need to execute the command on the host
    args = ['--host', command, ...args];
    command = 'flatpak-spawn';
  }

  // launching the daemon
  daemonProcess = spawn(command, args, {
    detached: true,
    windowsHide: true,
    env,
  });

  daemonProcess.on('error', err => {
    const msg = `CRC daemon failure, daemon failed to start: ${err}`;
    console.error('CRC failure', msg);
  });

  return true;
}

export function daemonStop() {
  if (daemonProcess && daemonProcess.exitCode !== null) {
    daemonProcess.kill();
  }
}
