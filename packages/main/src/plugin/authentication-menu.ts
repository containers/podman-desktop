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

import type { MenuItem, MenuItemConstructorOptions } from 'electron';
import { BrowserWindow, Menu } from 'electron';

import type { AuthenticationImpl } from './authentication.js';
import type { NavigationManager } from './navigation/navigation-manager.js';

export async function showAccountsMenu(
  x: number,
  y: number,
  auth: AuthenticationImpl,
  navigation: NavigationManager,
): Promise<void> {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: 'Manage authentication',
      click: (): void => {
        navigation.navigateToAuthentication().catch(console.error);
      },
    },
    {
      type: 'separator',
    } as MenuItem,
  ];
  const menuInfo = await auth.getAccountsMenuInfo();
  menuInfo.forEach(item => {
    if ('requestId' in item) {
      template.push({
        label: item.label,
        click: (): void => {
          auth.executeSessionRequest(item.requestId).catch(console.error);
        },
      });
    } else {
      template.push({
        label: item.label,
        submenu: [
          {
            label: 'Sign out',
            click: (): void => {
              auth.signOut(item.providerId, item.sessionId).catch(console.error);
            },
          },
        ],
      });
    }
  });
  const menu = Menu.buildFromTemplate(template);
  const zf = BrowserWindow.getFocusedWindow()?.webContents.getZoomFactor();
  const zoomFactor = zf ? zf : 1;
  menu.popup({
    x: Math.round(x * zoomFactor),
    y: Math.round(y * zoomFactor),
  });
}
