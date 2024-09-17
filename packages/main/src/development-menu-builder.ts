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

import type { BrowserWindow, ContextMenuParams, MenuItemConstructorOptions } from 'electron';

export function buildDevelopmentMenu(
  parameters: ContextMenuParams,
  browserWindow: BrowserWindow,
  devMode: boolean,
): MenuItemConstructorOptions[] {
  // In development mode, show the "Open DevTools of Extension and Webviews" menu item
  if (devMode) {
    let extensionId = '';
    if (parameters?.linkURL?.includes('/contribs')) {
      const extensionIdVal = parameters.linkURL.split('/contribs/')[1];
      if (extensionIdVal) {
        extensionId = extensionIdVal;
        return [
          {
            label: `Open DevTools of ${decodeURI(extensionId)} Extension`,
            // make it visible when link contains contribs and we're inside the extension
            visible: parameters.linkURL.includes('/contribs/'),
            click: (): void => {
              browserWindow.webContents.send('dev-tools:open-extension', extensionId.replaceAll('%20', '-'));
            },
          },
        ];
      }
    } else if (parameters?.linkURL?.includes('/webviews/')) {
      const webviewId = parameters.linkURL.split('/webviews/')[1];
      return [
        {
          label: `Open DevTools of the webview`,
          visible: parameters.linkURL.includes('/webviews/'),
          click: (): void => {
            browserWindow.webContents.send('dev-tools:open-webview', webviewId);
          },
        },
      ];
    }
  }
  return [];
}
