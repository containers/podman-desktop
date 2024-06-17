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

import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';

import type { RunError, RunOptions, RunResult } from '@podman-desktop/api';
import * as sudo from 'sudo-prompt';

import { isLinux, isMac, isWindows } from '../../util.js';
import type { Proxy } from '../proxy.js';

export const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

class RunErrorImpl extends Error implements RunError {
  constructor(
    readonly name: string,
    readonly message: string,
    readonly exitCode: number,
    readonly command: string,
    readonly stdout: string,
    readonly stderr: string,
    readonly cancelled: boolean,
    readonly killed: boolean,
  ) {
    super(message);
    Object.setPrototypeOf(this, RunErrorImpl.prototype);
  }
}

export class Exec {
  constructor(private proxy: Proxy) {}

  exec(command: string, args?: string[], options?: RunOptions): Promise<RunResult> {
    let env = Object.assign({}, process.env);

    if (options?.env) {
      env = Object.assign(env, options.env);
    }

    if (this.proxy.isEnabled()) {
      if (this.proxy.proxy?.httpsProxy) {
        env.HTTPS_PROXY = `${this.proxy.proxy.httpsProxy}`;
      }
      if (this.proxy.proxy?.httpProxy) {
        env.HTTP_PROXY = `${this.proxy.proxy.httpProxy}`;
      }
      if (this.proxy.proxy?.noProxy) {
        env.NO_PROXY = this.proxy.proxy.noProxy;
      }
    }

    if (isMac() || isWindows()) {
      env.PATH = getInstallationPath(env.PATH);
    }

    // do we have an admin task ?
    // if yes, will use sudo-prompt on windows and osascript on mac and pkexec on linux
    if (options?.isAdmin) {
      if (isWindows()) {
        return new Promise<RunResult>((resolve, reject) => {
          // Convert the command array to a string for sudo prompt
          // the name is used for the prompt

          // convert process.env to { [key: string]: string; }'
          const sudoEnv = env as { [key: string]: string };
          /*
           * sudo prompt verify keys and does not support keys with special characters
           * ( or ) on Windows
           * See https://github.com/jorangreef/sudo-prompt/blob/c3cc31a51bc50fe21fadcbf76a88609c0c77026f/index.js#L96
           */
          for (const key of Object.keys(sudoEnv)) {
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              delete sudoEnv[key];
            }
          }
          const sudoOptions = {
            name: 'Admin usage',
            env: sudoEnv,
          };
          const sudoCommand = `${command} ${(args ?? []).join(' ')}`;

          const callback = (error?: Error, stdout?: string | Buffer, stderr?: string | Buffer): void => {
            if (error) {
              // need to return a RunError
              const errResult: RunError = new RunErrorImpl(
                error.name,
                `Failed to execute command: ${error.message}`,
                1,
                sudoCommand,
                stdout?.toString() ?? '',
                stderr?.toString() ?? '',
                false,
                false,
              );

              reject(errResult);
            }
            const result: RunResult = {
              command,
              stdout: stdout?.toString() ?? '',
              stderr: stderr?.toString() ?? '',
            };
            // in case of success
            resolve(result);
          };

          sudo.exec(sudoCommand, sudoOptions, callback);
        });
      } else if (isMac()) {
        args = [
          '-e',
          `do shell script "${command} ${(args ?? []).join(
            ' ',
          )}" with prompt "Podman Desktop requires admin privileges " with administrator privileges`,
        ];
        command = 'osascript';
      } else if (isLinux()) {
        args = [command, ...(args ?? [])];
        command = 'pkexec';
      }
    }

    if (env.FLATPAK_ID) {
      args = ['--host', command, ...(args ?? [])];
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
          const errResult: RunError = new RunErrorImpl(
            'Execution cancelled',
            'Failed to execute command: Execution cancelled',
            1,
            command,
            stdout.trim(),
            stderr.trim(),
            true,
            childProcess.killed,
          );
          reject(errResult);
        }
        options?.logger?.error('Failed to execute cancel: Process has been already killed');
        const errResult: RunError = new RunErrorImpl(
          'Failed to execute cancel: Process has been already killed',
          'Failed to execute cancel: Process has been already killed',
          1,
          command,
          stdout.trim(),
          stderr.trim(),
          false,
          childProcess.killed,
        );
        reject(errResult);
      });

      childProcess.stdout.setEncoding(options?.encoding ?? 'utf8');
      childProcess.stderr.setEncoding(options?.encoding ?? 'utf8');

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
        const errResult: RunError = new RunErrorImpl(
          error.name,
          `Failed to execute command: ${error.message}`,
          1,
          command,
          stdout.trim(),
          stderr.trim(),
          false,
          childProcess.killed,
        );
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
          const errResult: RunError = new RunErrorImpl(
            `Command execution failed with exit code ${exitCode}`,
            `Command execution failed with exit code ${exitCode}`,
            exitCode ?? 1,
            command,
            stdout.trim(),
            stderr.trim(),
            false,
            childProcess.killed,
          );
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
    return envPATH ?? '';
  }
}
