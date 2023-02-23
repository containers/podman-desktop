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

export interface Menu {
  command: string;
  title: string;
}

export class MenuRegistry {
  private menus = new Map<string, Menu[]>();

  registerMenus(menus: { [key: string]: Menu[] }): void {
    for (const name in menus) {
      const contextMenus = menus[name];
      contextMenus.forEach(menu => this.registerMenu(name, menu));
    }
  }

  registerMenu(context: string, menu: Menu): void {
    let contextMenus = this.menus.get(context);
    if (!contextMenus) {
      contextMenus = [];
      this.menus.set(context, contextMenus);
    }
    contextMenus.push(menu);
  }

  getContributedMenus(context: string): Menu[] {
    return this.menus.get(context) || [];
  }
}
