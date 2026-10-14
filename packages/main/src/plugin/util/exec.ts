/**********************************************************************
 * Copyright (C) 2023 - 2026 Red Hat, Inc.
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
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';

import type { RunError, RunOptions, RunResult } from '@desktop-framework/extension-api';
import * as sudo from '@expo/sudo-prompt';

import type { Proxy } from '/@/plugin/proxy.js';
import { isLinux, isMac, isWindows } from '/@/util.js';

export const macosExtraPath = '/opt/podman/bin:/usr/local/bin:/opt/homebrew/bin:/opt/local/bin';

class RunErrorImpl extends Error implements RunError {
  constructor(
    override readonly name: string,
    override readonly message: string,
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

  async exec(command: string, args?: string[], options?: RunOptions): Promise<RunResult> {
    let env = { ...process.env };

    if (options?.env) {
      env = Object.assign(env, options.env);
    }

    if (this.proxy.isEnabled()) {
      if (this.proxy.proxy?.httpsProxy) {
        env['HTTPS_PROXY'] = `${this.proxy.proxy.httpsProxy}`;
      }
      if (this.proxy.proxy?.httpProxy) {
        env['HTTP_PROXY'] = `${this.proxy.proxy.httpProxy}`;
      }
      if (this.proxy.proxy?.noProxy) {
        env['NO_PROXY'] = this.proxy.proxy.noProxy;
      }
    }

    if (isMac() || isWindows()) {
      env['PATH'] = getInstallationPath(env['PATH']);
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
            if (!/^[a-zA-Z_]\w*$/.test(key)) {
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
        const escapedArgs = (args ?? []).map(arg =>
          arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/ /g, '\\ '),
        );
        const shellScript = `${command} ${escapedArgs.join(' ')}`;
        const escapedShellScript = shellScript.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        args = [
          '-e',
          `do shell script "${escapedShellScript}" with prompt "Podman Desktop requires admin privileges " with administrator privileges`,
        ];
        command = 'osascript';
      } else if (isLinux()) {
        args = [command, ...(args ?? [])];
        command = 'pkexec';
      }
    }

    if (env['FLATPAK_ID']) {
      const customEnvVariables: string[] = [];
      for (const envVar in options?.env) {
        customEnvVariables.push(`--env=${envVar}=${options.env[envVar]}`);
      }
      args = ['--host', ...customEnvVariables, command, ...(args ?? [])];
      command = 'flatpak-spawn';
    }

    const cwd = options?.cwd;

    if (options?.detached) {
      // On Windows, detached:true sets DETACHED_PROCESS which conflicts
      // with CREATE_NO_WINDOW (windowsHide), causing console windows to
      // flash. Use cmd.exe /c as a non-detached wrapper so windowsHide
      // takes effect, while the spawned command runs independently.
      const childProcess = isWindows()
        ? // eslint-disable-next-line sonarjs/no-os-command-from-path, sonarjs/os-command
          spawn('cmd.exe', ['/d', '/c', command, ...(args ?? [])], { env, cwd, stdio: 'ignore', windowsHide: true })
        : spawn(command, args ?? [], { env, cwd, detached: true, stdio: 'ignore' });
      childProcess.unref();
      return this.awaitChildProcess(childProcess, command, { stdout: '', stderr: '' });
    }

    const childProcess = spawn(command, args ?? [], { env, cwd });
    const output = { stdout: '', stderr: '' };

    childProcess.stdout.setEncoding(options?.encoding ?? 'utf8');
    childProcess.stderr.setEncoding(options?.encoding ?? 'utf8');

    childProcess.stdout.on('data', data => {
      output.stdout += data.toString();
      options?.logger?.log(data);
    });

    childProcess.stderr.on('data', data => {
      output.stderr += data.toString();
      options?.logger?.warn(data);
    });

    return this.awaitChildProcess(childProcess, command, output, options);
  }

  private awaitChildProcess(
    childProcess: ChildProcess,
    command: string,
    output: { stdout: string; stderr: string },
    options?: RunOptions,
  ): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      options?.token?.onCancellationRequested(() => {
        if (!childProcess.killed) {
          childProcess.kill();
          options?.logger?.error('Execution cancelled');
          reject(
            new RunErrorImpl(
              'Execution cancelled',
              'Failed to execute command: Execution cancelled',
              1,
              command,
              output.stdout.trim(),
              output.stderr.trim(),
              true,
              childProcess.killed,
            ),
          );
        }
        options?.logger?.error('Failed to execute cancel: Process has been already killed');
        reject(
          new RunErrorImpl(
            'Failed to execute cancel: Process has been already killed',
            'Failed to execute cancel: Process has been already killed',
            1,
            command,
            output.stdout.trim(),
            output.stderr.trim(),
            false,
            childProcess.killed,
          ),
        );
      });

      childProcess.on('error', error => {
        options?.logger?.error(`Failed to execute command: ${error.message}`);
        reject(
          new RunErrorImpl(
            error.name,
            `Failed to execute command: ${error.message}`,
            1,
            command,
            output.stdout.trim(),
            output.stderr.trim(),
            false,
            childProcess.killed,
          ),
        );
      });

      childProcess.on('close', exitCode => {
        if (exitCode === 0) {
          const result: RunResult = {
            command,
            stdout: output.stdout.trim(),
            stderr: output.stderr.trim(),
          };
          resolve(result);
        } else {
          const stderr = output.stderr.trim();
          const message = stderr
            ? `Command execution failed with exit code ${exitCode}: ${stderr}`
            : `Command execution failed with exit code ${exitCode}`;
          options?.logger?.error(message);
          const errResult: RunError = new RunErrorImpl(
            message,
            message,
            exitCode ?? 1,
            command,
            output.stdout.trim(),
            stderr,
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
  envPATH ??= process.env['PATH'];

  if (isWindows()) {
    return [
      join(homedir(), 'AppData', 'Local', 'Programs', 'Podman'),
      'c:\\Program Files\\RedHat\\Podman',
      envPATH ?? '',
    ].join(delimiter);
  } else if (isMac()) {
    if (!envPATH) {
      return macosExtraPath;
    } else {
      return macosExtraPath.concat(':').concat(envPATH);
    }
  } else {
    return envPATH ?? '';
  }
}
