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

import { Disposable } from './types/disposable';
import type { Telemetry } from '/@/plugin/telemetry/telemetry';

export interface CommandHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thisArg: any;
}

export class CommandRegistry {
  constructor(private readonly telemetry: Telemetry) {}

  private commands = new Map<string, CommandHandler>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
    if (this.commands.has(command)) {
      throw new Error(`command '${command}' already exists`);
    }
    // keep command
    this.commands.set(command, {
      callback,
      thisArg,
    });
    return Disposable.create(() => {
      this.commands.delete(command);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeCommand<T = unknown>(commandId: string, ...args: any[]): Promise<T> {
    const telemetryOptions = { commandId: commandId };
    try {
      // command is on node world, just execute it
      if (this.commands.has(commandId)) {
        const command = this.commands.get(commandId);
        if (command) {
          return command.callback.apply(command.thisArg, args);
        }
      }

      // should try to execute on client side
      throw new Error('Unknown command: ' + commandId);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (telemetryOptions as any).error = err;
      throw err;
    } finally {
      this.telemetry
        .track('executeCommand', telemetryOptions)
        .catch((err: unknown) => console.error('Unable to track', err));
    }
  }

  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }
}
