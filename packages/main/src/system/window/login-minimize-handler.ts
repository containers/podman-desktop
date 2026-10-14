/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { app, type BrowserWindow } from 'electron';

/**
 * On macOS, app.setLoginItemSettings() does not support passing CLI arguments,
 * so a login item launch cannot be told to start minimized the way the
 * --minimize flag does on Windows. The preferences.login.minimize setting is
 * the only signal available, and it is only readable once the configuration
 * registry has been built.
 *
 * This class applies that setting to a window whose show was deferred until
 * the registry arrived.
 */
export class LoginMinimizeHandler {
  apply(browserWindow: BrowserWindow, configurationRegistry: IConfigurationRegistry): void {
    const preferencesConfig = configurationRegistry.getConfiguration('preferences');
    const minimize = preferencesConfig.get<boolean>('login.minimize');
    if (minimize) {
      app.dock?.hide();
    } else {
      browserWindow.show();
    }
  }
}
