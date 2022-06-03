import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { ipcMain } from 'electron';

import * as os from 'node:os';
import { spawn } from 'child_process';
import type { ContributionManager } from '../contribution-manager';

export interface RawExecResult {
  cmd?: string;
  killed?: boolean;
  signal?: string;
  code?: number;
  stdout: string;
  stderr: string;
}

export class DockerPluginAdapter {
  constructor(private contributionManager: ContributionManager) {}

  filterDockerArgs(cmd: string, args: string[]): string[] {
    // filter out the "-v", "/var/run/docker.sock:/var/run/docker.sock" from args
    let result: string[] = [];
    for (let i = args.length - 1; i >= 0; i--) {
      const j = i - 1;
      if (j >= 0 && args[j] === '-v' && args[i] === '/var/run/docker.sock:/var/run/docker.sock') {
        i--;
        continue;
      } else {
        result = [args[i], ...result];
      }
    }
    return [cmd, ...result];
  }

  protected addExtraPathToEnv(extensionId: string, env: NodeJS.ProcessEnv) {
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
        env.PATH = `${contributionPath}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`;
      }
    }
  }

  init() {
    ipcMain.handle(
      'docker-plugin-adapter:exec',
      (
        event: IpcMainInvokeEvent,
        contributionId: string,
        launcher: string | undefined,
        cmd: string,
        args: string[],
      ): Promise<unknown> => {
        const execResult: RawExecResult = {
          cmd,
          stdout: '',
          stderr: '',
        };

        const env = process.env;
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

          const spawnProcess = spawn(updatedCommand, updatedArgs, { env });
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
            if (code === 0) {
              resolve(execResult);
            } else {
              resolve(execResult);
            }
          });
          spawnProcess.on('error', error => {
            execResult.killed = true;
            execResult.signal = error.toString();
            resolve(error);
          });
        });
      },
    );

    ipcMain.on(
      'docker-plugin-adapter:execWithOptions',
      async (
        event: IpcMainEvent,
        contributionId: string,
        launcher: string | undefined,
        cmd: string,
        streamCallbackId: number,
        options: { splitOutputLines?: boolean },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: any[],
      ): Promise<void> => {
        // need to add launcher as command and we move command as the first arg
        let updatedCommand;
        let updatedArgs;
        const env = process.env;
        if (launcher) {
          updatedCommand = launcher;
          updatedArgs = this.filterDockerArgs(cmd, args);
        } else {
          this.addExtraPathToEnv(contributionId, env);

          updatedCommand = cmd;
          updatedArgs = args;
        }

        const spawnProcess = spawn(updatedCommand, updatedArgs, { env });
        spawnProcess.stdout.setEncoding('utf8');
        spawnProcess.stdout.on('data', data => {
          // send back the data
          event.reply('docker-plugin-adapter:execWithOptions-callback-stdout', streamCallbackId, data);
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
      },
    );
  }
}
