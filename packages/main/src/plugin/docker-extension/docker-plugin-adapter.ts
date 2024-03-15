/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import * as os from 'node:os';

import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';

import type { SimpleContainerInfo } from '../api/container-info.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ContributionManager } from '../contribution-manager.js';

export interface RawExecResult {
  cmd?: string;
  killed?: boolean;
  signal?: string;
  code?: number;
  stdout: string;
  stderr: string;
}

export class DockerPluginAdapter {
  static MACOS_EXTRA_PATH = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin:/opt/podman/bin';

  constructor(
    private contributionManager: ContributionManager,
    private containerRegistry: ContainerProviderRegistry,
  ) {}

  filterDockerArgs(cmd: string, args: string[]): string[] {
    // filter out the "-v", "/var/run/docker.sock:/var/run/docker.sock" from args
    let result: string[] = [];
    for (let i = args.length - 1; i >= 0; i--) {
      const j = i - 1;
      if (j >= 0 && args[j] === '-v' && args[i] === '/var/run/docker.sock:/var/run/docker.sock') {
        i--;
      } else {
        result = [args[i], ...result];
      }
    }
    return [cmd, ...result];
  }

  protected addExtraPathToEnv(extensionId: string, env: NodeJS.ProcessEnv): void {
    // add host path of the contribution
    const contributionPath = this.contributionManager.getExtensionPath(extensionId);
    if (contributionPath) {
      if (os.platform() === 'win32') {
        if (process.env.Path) {
          env.Path = `${contributionPath};${process.env.Path}`;
        } else {
          env.Path = `${contributionPath}`;
        }
      } else {
        env.PATH = `${contributionPath}:${env.PATH}`;
      }
    }
  }

  protected async getVmServiceContainer(contributionId: string): Promise<SimpleContainerInfo> {
    // found the matching container

    const containers = await this.containerRegistry.listSimpleContainers();

    // filter all containers for this extension (matching 'io.podman_desktop.PodmanDesktop.extensionName' === extensionName)
    const matchingContainers = containers.filter(
      container => container.Labels['io.podman_desktop.PodmanDesktop.extensionName'] === contributionId,
    );

    if (matchingContainers.length === 0) {
      throw new Error(
        `No container having the label 'io.podman_desktop.PodmanDesktop.extensionName' == ${contributionId} found.`,
      );
    }

    // get the matching container having label 'io.podman_desktop.PodmanDesktop.vm-service'] = 'true';'
    const vmServiceContainer = matchingContainers.find(
      container => container.Labels['io.podman_desktop.PodmanDesktop.vm-service'] === 'true',
    );

    if (!vmServiceContainer) {
      throw new Error(`No container having the label 'io.podman_desktop.PodmanDesktop.vm-service' == 'true' found.`);
    }
    return vmServiceContainer;
  }

  async handleExec(
    contributionId: string,
    launcher: string | undefined,
    cmd: string,
    args: string[],
  ): Promise<RawExecResult> {
    const execResult: RawExecResult = {
      cmd,
      stdout: '',
      stderr: '',
    };

    // in case of VM_SERVICE, we need to execute the command in the container
    if (launcher === 'VM_SERVICE') {
      const vmServiceContainer = await this.getVmServiceContainer(contributionId);

      // ok we do have the container, let's execute the command in it
      const containerId = vmServiceContainer.Id;
      const engineId = vmServiceContainer.engineId;

      // merge command and args
      const fullCommandLine = [cmd, ...args];

      return new Promise(resolve => {
        const onStdout = (data: Buffer): void => {
          execResult.stdout += data.toString();
        };
        const onStderr = (data: Buffer): void => {
          execResult.stderr += data.toString();
        };

        this.containerRegistry
          .execInContainer(engineId, containerId, fullCommandLine, onStdout, onStderr)
          .then(() => {
            execResult.code = 0;
            resolve(execResult);
          })
          .catch((error: unknown) => {
            console.log('got error', error);
            execResult.code = 1;
            execResult.killed = true;
            execResult.signal = String(error);
            resolve(execResult);
          });
      });
    }

    const env = process.env;
    if (os.platform() === 'darwin' && env.PATH) {
      env.PATH = env.PATH.concat(':').concat(DockerPluginAdapter.MACOS_EXTRA_PATH);
    }

    // In production mode, applications don't have access to the 'user' path like brew
    return new Promise(resolve => {
      // need to add launcher as command and we move command as the first arg
      let updatedCommand;
      let updatedArgs;
      if (launcher) {
        updatedCommand = launcher;
        updatedArgs = this.filterDockerArgs(cmd, args);
      } else {
        this.addExtraPathToEnv(contributionId, env);
        updatedCommand = cmd;
        updatedArgs = args;
      }

      const spawnProcess = spawn(updatedCommand, updatedArgs, { env, shell: true });
      spawnProcess.stdout.setEncoding('utf8');
      spawnProcess.stdout.on('data', data => {
        execResult.stdout += data;
      });
      spawnProcess.stderr.setEncoding('utf8');
      spawnProcess.stderr.on('data', data => {
        execResult.stderr += data;
      });

      spawnProcess.on('close', code => {
        if (code) {
          execResult.code = code;
        } else {
          execResult.code = 0;
        }

        resolve(execResult);
      });
      spawnProcess.on('error', error => {
        execResult.killed = true;
        execResult.signal = error.toString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).stderr = execResult.stderr;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).stdout = execResult.stdout;
        resolve(error as unknown as RawExecResult);
      });
    });
  }

  async handleExecWithOptions(
    event: IpcMainEvent,
    contributionId: string,
    launcher: string | undefined,
    cmd: string,
    streamCallbackId: number,
    options: { splitOutputLines?: boolean },
    args: string[],
  ): Promise<void> {
    // in case of VM_SERVICE, we need to execute the command in the container
    if (launcher === 'VM_SERVICE') {
      // found the matching container

      const vmServiceContainer = await this.getVmServiceContainer(contributionId);

      // ok we do have the container, let's execute the command in it
      const containerId = vmServiceContainer.Id;
      const engineId = vmServiceContainer.engineId;

      // merge command and args
      const fullCommandLine = [cmd, ...args];

      const onStdout = (data: Buffer): void => {
        event.reply('docker-plugin-adapter:execWithOptions-callback-stdout', streamCallbackId, data);
      };
      const onStderr = (data: Buffer): void => {
        event.reply('docker-plugin-adapter:execWithOptions-callback-stderr', streamCallbackId, data);
      };

      try {
        await this.containerRegistry.execInContainer(engineId, containerId, fullCommandLine, onStdout, onStderr);
        event.reply('docker-plugin-adapter:execWithOptions-callback-close', streamCallbackId, 0);
      } catch (error) {
        event.reply('docker-plugin-adapter:execWithOptions-callback-error', streamCallbackId, error);
        event.reply('docker-plugin-adapter:execWithOptions-callback-close', streamCallbackId, 1);
      }
      return;
    }

    // need to add launcher as command and we move command as the first arg
    let updatedCommand;
    let updatedArgs;
    const env = process.env;
    if (os.platform() === 'darwin' && env.PATH) {
      env.PATH = env.PATH.concat(':').concat(DockerPluginAdapter.MACOS_EXTRA_PATH);
    }
    if (launcher) {
      updatedCommand = launcher;
      updatedArgs = this.filterDockerArgs(cmd, args);
    } else {
      this.addExtraPathToEnv(contributionId, env);

      updatedCommand = cmd;
      updatedArgs = args;
    }

    const spawnProcess = spawn(updatedCommand, updatedArgs, { env });

    let isSplitOutputLines = false;
    if (options.splitOutputLines) {
      isSplitOutputLines = true;
    }

    let stdoutLines = '';
    spawnProcess.stdout.setEncoding('utf8');
    spawnProcess.stdout.on('data', (data: string) => {
      if (!isSplitOutputLines) {
        // send back the data
        event.reply('docker-plugin-adapter:execWithOptions-callback-stdout', streamCallbackId, data);
      } else {
        // append the text
        stdoutLines += data;

        // iterate on each newLine
        let index = stdoutLines.indexOf('\n');
        while (index >= 0) {
          // we do have newlines
          const line = stdoutLines.substring(0, index);
          stdoutLines = stdoutLines.substring(index + 1);
          event.reply('docker-plugin-adapter:execWithOptions-callback-stdout', streamCallbackId, line);

          // update index
          index = stdoutLines.indexOf('\n');
        }
      }
    });
    spawnProcess.stderr.setEncoding('utf8');
    spawnProcess.stderr.on('data', data => {
      // send back the data
      event.reply('docker-plugin-adapter:execWithOptions-callback-stderr', streamCallbackId, data);
    });

    spawnProcess.on('close', code => {
      event.reply('docker-plugin-adapter:execWithOptions-callback-close', streamCallbackId, code);
    });
    spawnProcess.on('error', error => {
      event.reply('docker-plugin-adapter:execWithOptions-callback-error', streamCallbackId, error);
    });
  }

  init(): void {
    ipcMain.handle(
      'docker-plugin-adapter:exec',
      async (
        event: IpcMainInvokeEvent,
        contributionId: string,
        launcher: string | undefined,
        cmd: string,
        args: string[],
      ): Promise<unknown> => {
        return this.handleExec(contributionId, launcher, cmd, args);
      },
    );

    ipcMain.on(
      'docker-plugin-adapter:execWithOptions',
      (
        event: IpcMainEvent,
        contributionId: string,
        launcher: string | undefined,
        cmd: string,
        streamCallbackId: number,
        options: { splitOutputLines?: boolean },
        args: string[],
      ): void => {
        this.handleExecWithOptions(event, contributionId, launcher, cmd, streamCallbackId, options, args).catch(
          (error: unknown) => {
            event.reply('docker-plugin-adapter:execWithOptions-callback-error', streamCallbackId, error);
          },
        );
      },
    );
  }
}
