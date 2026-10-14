/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { ActionKind, ItemInfo } from '@desktop-framework/api';
import { inject, injectable } from 'inversify';

import { IPCHandle } from '/@/plugin/api.js';
import product from '/@product.json' with { type: 'json' };

@injectable()
export class HelpMenu {
  constructor(
    @inject(IPCHandle)
    private readonly ipcHandle: IPCHandle,
  ) {}

  init(): void {
    this.ipcHandle('help-menu:getItems', async (): Promise<ItemInfo[]> => {
      return this.getItems();
    });
  }

  getItems(): ItemInfo[] {
    return product.helpMenu.items.map(item => {
      const baseItem = { icon: item.icon, title: item.title, tooltip: item.tooltip };
      if (item.command) {
        return {
          ...baseItem,
          action: {
            kind: ActionKind.COMMAND,
            parameter: item.command,
          },
          enabled: true,
        };
      } else if (item.link) {
        return {
          ...baseItem,
          action: {
            kind: ActionKind.LINK,
            parameter: item.link,
          },
          enabled: true,
        };
      }
      return { ...baseItem, enabled: false };
    });
  }
}
