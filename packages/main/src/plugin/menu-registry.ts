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
import type { CommandRegistry } from './command-registry.js';
import { Disposable } from './types/disposable.js';

export interface Menu {
  command: string;
  title: string;
  when?: string;
  disabled?: string;
  icon?: string;
}

export enum MenuContext {
  DASHBOARD_IMAGE = 'dashboard/image',
  DASHBOARD_CONTAINER = 'dashboard/container',
  DASHBOARD_POD = 'dashboard/pod',
  DASHBOARD_COMPOSE = 'dashboard/compose',
}

export class MenuRegistry {
  private menus = new Map<string, Map<string, Menu>>();

  constructor(private commandRegisty: CommandRegistry) {}

  registerMenus(menus: { [key: string]: Menu[] }): Disposable {
    for (const name in menus) {
      const contextMenus = menus[name];
      contextMenus.forEach(menu => this.registerMenu(name, menu));
    }

    return Disposable.create(() => {
      this.unregisterMenus(menus);
    });
  }

  unregisterMenus(menus: { [key: string]: Menu[] }): void {
    for (const name in menus) {
      const contextMenus = menus[name];
      contextMenus.forEach(menu => this.unregisterMenu(name, menu));
    }
  }

  registerMenu(context: string, menu: Menu): void {
    let contextMenus = this.menus.get(context);

    // do we have a single match for the command ? if yes, get the command
    const matchingCommandDefinition = this.commandRegisty
      .getCommandPaletteCommands()
      .find(command => command.id === menu.command);
    // apply the icon if one
    if (matchingCommandDefinition?.icon) {
      menu.icon = matchingCommandDefinition.icon;
    }

    if (!contextMenus) {
      contextMenus = new Map<string, Menu>();
      this.menus.set(context, contextMenus);
    }
    contextMenus.set(menu.command, menu);
  }

  unregisterMenu(context: string, menu: Menu): void {
    const contextMenus = this.menus.get(context);
    contextMenus?.delete(menu.command);
  }

  getContributedMenus(context: string): Menu[] {
    const menus = this.menus.get(context);
    if (menus) {
      return Array.from(menus?.values()).filter(menu => this.commandRegisty.hasCommand(menu.command)) || [];
    }
    return [];
  }
}
