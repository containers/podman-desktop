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

import type { BrowserWindow } from 'electron';

import type { ConfigurationRegistry } from './plugin/configuration-registry.js';

export class OpenDevTools {
  open(browserWindow: BrowserWindow, configurationRegistry?: ConfigurationRegistry): void {
    if (import.meta.env.DEV) {
      // grab configuration option
      const preferencesConfiguration = configurationRegistry?.getConfiguration('preferences');
      let openDevToolsConfiguration = preferencesConfiguration?.get<
        'left' | 'right' | 'bottom' | 'undocked' | 'detach' | 'none'
      >('OpenDevTools');

      // undocked mode by default
      if (!openDevToolsConfiguration) {
        openDevToolsConfiguration = 'undocked';
      }

      // open dev tools if not none
      if (openDevToolsConfiguration !== 'none') {
        browserWindow?.webContents.openDevTools({ mode: openDevToolsConfiguration });
      }
    }
  }
}
