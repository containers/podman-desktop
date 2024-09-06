/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { MenuItemConstructorOptions } from 'electron';
import { Menu } from 'electron';
import { aboutMenuItem } from 'electron-util/main';

import type { ZoomLevelHandler } from './plugin/zoom-level-handler.js';

export class ApplicationMenuBuilder {
  #zoomLevelHandler: ZoomLevelHandler;

  constructor(zoomLevelHandler: ZoomLevelHandler) {
    this.#zoomLevelHandler = zoomLevelHandler;
  }

  build(): Electron.Menu | undefined {
    const menu = Menu.getApplicationMenu(); // get default menu
    if (!menu) {
      return undefined;
    }

    return Menu.buildFromTemplate(
      menu.items.map(i => {
        // add the About entry only in the help menu
        if (i.role === 'help' && i.submenu) {
          const aboutMenuSubItem = aboutMenuItem({});
          aboutMenuSubItem.label = 'About';

          // create new submenu
          // also add a separator before the About entry
          const newSubMenu = Menu.buildFromTemplate([...i.submenu.items, { type: 'separator' }, aboutMenuSubItem]);
          return { ...i, submenu: newSubMenu };
        } else if (i.role?.toLocaleLowerCase() === 'viewmenu' && i.submenu) {
          // replace the Zoom In item by a new custom item
          const newZoomInMenuItem: MenuItemConstructorOptions = {
            label: 'Zoom In',
            accelerator: 'CommandOrControl+Plus',
            click: () => {
              this.#zoomLevelHandler.zoomIn();
            },
          };
          // hidden entry to register a shortcut
          const newZoomInMenuItemAlt: MenuItemConstructorOptions = {
            label: 'Zoom In alt',
            visible: false,
            accelerator: 'CommandOrControl+numadd',
            click: () => {
              this.#zoomLevelHandler.zoomIn();
            },
          };

          // replace the Zoom Out item by a new custom item
          const newZoomOutMenuItem: MenuItemConstructorOptions = {
            label: 'Zoom Out',
            accelerator: 'CommandOrControl+-',
            click: () => {
              this.#zoomLevelHandler.zoomOut();
            },
          };
          // hidden entry to register a shortcut
          const newZoomOutMenuItemAlt: MenuItemConstructorOptions = {
            label: 'Zoom Out alt',
            visible: false,
            accelerator: 'CommandOrControl+numsub',
            click: () => {
              this.#zoomLevelHandler.zoomOut();
            },
          };

          // replace the Actual item by a new custom item
          const newZoomResetMenuItem: MenuItemConstructorOptions = {
            label: 'Actual Size',
            accelerator: 'CommandOrControl+0',
            click: () => {
              this.#zoomLevelHandler.resetZoom();
            },
          };
          // hidden entry to register a shortcut
          const newZoomOResetMenuItemAlt: MenuItemConstructorOptions = {
            label: 'Actual Size alt',
            visible: false,
            accelerator: 'CommandOrControl+num0',
            click: () => {
              this.#zoomLevelHandler.resetZoom();
            },
          };

          const items = Menu.buildFromTemplate([newZoomInMenuItemAlt, newZoomOutMenuItemAlt, newZoomOResetMenuItemAlt]);
          for (const item of items.items) {
            i.submenu.items.push(item);
          }

          // replace the "Zoom In" item stored inside the submenu by this one
          const newSubMenu = Menu.buildFromTemplate(
            i.submenu.items.map(item => {
              if (item.label === 'Zoom In') {
                return newZoomInMenuItem;
              } else if (item.label === 'Zoom Out') {
                return newZoomOutMenuItem;
              } else if (item.label === 'Actual Size') {
                return newZoomResetMenuItem;
              } else {
                return item;
              }
            }),
          );

          return { ...i, submenu: newSubMenu };
        }

        return i;
      }),
    );
  }
}
