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

import type { ChildProcessWithoutNullStreams } from 'child_process';
import { spawn } from 'child_process';
import type { RunError, RunOptions, RunResult } from '@podman-desktop/api';
import { isMac, isWindows } from '../../util.js';
import type { Proxy } from '../proxy.js';

export const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

export class Exec {
  constructor(private proxy: Proxy) {}

  exec(command: string, args?: string[], options?: RunOptions): Promise<RunResult> {
    let env = Object.assign({}, process.env);

    if (options?.env) {
      env = Object.assign(env, options.env);
    }

    if (this.proxy.isEnabled()) {
      if (this.proxy.proxy?.httpsProxy) {
        env.HTTPS_PROXY = `http://${this.proxy.proxy.httpsProxy}`;
      }
      if (this.proxy.proxy?.httpProxy) {
        env.HTTP_PROXY = `http://${this.proxy.proxy.httpProxy}`;
      }
      if (this.proxy.proxy?.noProxy) {
        env.NO_PROXY = this.proxy.proxy.noProxy;
      }
    }

    if (isMac() || isWindows()) {
      env.PATH = getInstallationPath(env.PATH);
    } else if (env.FLATPAK_ID) {
      args = ['--host', command, ...(args || [])];
      command = 'flatpak-spawn';
    }

    let cwd: string;
    if (options?.cwd) {
      cwd = options.cwd;
    }

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';

      const childProcess: ChildProcessWithoutNullStreams = spawn(command, args, { env, cwd });

      options?.token?.onCancellationRequested(() => {
        if (!childProcess.killed) {
          childProcess.kill();
          options?.logger?.error('Execution cancelled');
          const errResult: RunError = {
            name: 'Execution cancelled',
            message: 'Failed to execute command: Execution cancelled',
            exitCode: 1,
            command,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            cancelled: true,
            killed: childProcess.killed,
          };
          reject(errResult);
        }
        options?.logger?.error('Failed to execute cancel: Process has been already killed');
        const errResult: RunError = {
          name: 'Failed to execute cancel: Process has been already killed',
          message: 'Failed to execute cancel: Process has been already killed',
          exitCode: 1,
          command,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          cancelled: false,
          killed: childProcess.killed,
        };
        reject(errResult);
      });

      childProcess.stdout.setEncoding('utf8');
      childProcess.stderr.setEncoding('utf8');

      childProcess.stdout.on('data', data => {
        stdout += data.toString();
        options?.logger?.log(data);
      });

      childProcess.stderr.on('data', data => {
        stderr += data.toString();
        options?.logger?.warn(data);
      });

      childProcess.on('error', error => {
        options?.logger?.error(`Failed to execute command: ${error.message}`);
        const errResult: RunError = {
          name: error.name,
          message: `Failed to execute command: ${error.message}`,
          exitCode: 1,
          command,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          cancelled: false,
          killed: childProcess.killed,
        };
        reject(errResult);
      });

      childProcess.on('exit', exitCode => {
        if (exitCode === 0) {
          const result: RunResult = {
            command,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
          };
          resolve(result);
        } else {
          options?.logger?.error(`Command execution failed with exit code ${exitCode}`);
          const errResult: RunError = {
            name: `Command execution failed with exit code ${exitCode}`,
            message: `Command execution failed with exit code ${exitCode}`,
            exitCode: exitCode || 1,
            command,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            cancelled: false,
            killed: childProcess.killed,
          };
          reject(errResult);
        }
      });
    });
  }
}

export function getInstallationPath(envPATH?: string): string {
  if (!envPATH) {
    envPATH = process.env.PATH;
  }

  if (isWindows()) {
    return `c:\\Program Files\\RedHat\\Podman;${envPATH}`;
  } else if (isMac()) {
    if (!envPATH) {
      return macosExtraPath;
    } else {
      return envPATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return envPATH || '';
  }
}
