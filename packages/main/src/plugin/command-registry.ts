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

import { type ApiSenderType } from './api.js';
import { type CommandInfo } from './api/command-info.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';

export interface RawCommand {
  command?: string;
  title?: string;
  category?: string;
  description?: string;
  icon?: string | { light: string; dark: string };
  keybinding?: string;
  enablement?: string;
}

export interface CommandHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thisArg: any;
}

export class CommandRegistry {
  constructor(
    private apiSender: ApiSenderType,
    private readonly telemetry: Telemetry,
  ) {
    // init empty array
    this.commandPaletteCommands.set(CommandRegistry.GLOBAL, []);
  }

  private commands = new Map<string, CommandHandler>();

  static readonly GLOBAL = 'GLOBAL';
  private commandPaletteCommands = new Map<string, RawCommand[]>();

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
      this.telemetry.track('executeCommand', telemetryOptions);
    }
  }

  hasCommand(commandId: string): boolean {
    return this.commands.has(commandId);
  }

  getCommandPaletteCommands(): CommandInfo[] {
    // we return the commands from commandPaletteCommands map
    const commandInfos: CommandInfo[] = [];
    this.commandPaletteCommands.forEach(commands => {
      commands.forEach(command => {
        if (!command.command) {
          return;
        }
        commandInfos.push({
          id: command.command,
          title: command.category ? `${command.category}: ${command.title}` : command.title,
          enablement: command.enablement,
        });
      });
    });

    // need to sort based on the title
    commandInfos.sort((a, b) => {
      if (a.title && b.title) {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return commandInfos;
  }

  registerCommandPalette(...extensionCommands: RawCommand[]): Disposable {
    const disposables: Disposable[] = [];

    extensionCommands.forEach(command => {
      this.commandPaletteCommands.get(CommandRegistry.GLOBAL)?.push(command);
      disposables.push(
        Disposable.create(() => {
          // grab the global commands
          const globalCommands = this.commandPaletteCommands.get(CommandRegistry.GLOBAL);
          if (globalCommands) {
            // search matching command
            const index = globalCommands.findIndex(cmd => cmd.command === command.command);
            if (index > -1) {
              // remove it
              globalCommands.splice(index, 1);
            }
          }
        }),
      );
    });
    this.apiSender.send('commands-added');

    disposables.push(
      Disposable.create(() => {
        this.apiSender.send('commands-removed');
      }),
    );

    return Disposable.from(...disposables);
  }

  registerCommandsFromExtension(extensionId: string, extensionCommands: RawCommand[]): Disposable {
    // add the commands
    this.commandPaletteCommands.set(extensionId, extensionCommands);
    this.apiSender.send('commands-added');

    return Disposable.create(() => {
      this.commandPaletteCommands.delete(extensionId);
      this.apiSender.send('commands-removed');
    });
  }
}
