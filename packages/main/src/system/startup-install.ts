/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import * as os from 'node:os';

import type { ConfigurationRegistry, IConfigurationNode } from '../plugin/configuration-registry.js';
import { MacosStartup } from './macos-startup.js';
import { WindowsStartup } from './windows-startup.js';

export class StartupInstall {
  private osStartup: MacosStartup | WindowsStartup | undefined;

  constructor(private configurationRegistry: ConfigurationRegistry) {
    // macos ?
    if (os.platform() === 'darwin') {
      this.osStartup = new MacosStartup(configurationRegistry);
    } else if (os.platform() === 'win32') {
      this.osStartup = new WindowsStartup(configurationRegistry);
    }
  }

  async enableStartupOnLogin(): Promise<void> {
    await this.osStartup?.enable();
  }

  async disableStartupOnLogin(): Promise<void> {
    await this.osStartup?.disable();
  }

  async configure(): Promise<void> {
    // development mode, do nothing
    if (!import.meta.env.PROD) {
      console.log('Development mode, skipping startup install');
      return;
    }

    // only for mac or windows
    // skip for linux
    if (os.platform() === 'linux') {
      return;
    }

    // should we enable it for the specific OS ?
    if (!this.osStartup?.shouldEnable()) {
      return;
    }

    // add configuration
    const loginStartConfigurationNode: IConfigurationNode = {
      id: 'preferences.login.start',
      title: 'Start on login',
      type: 'object',
      properties: {
        ['preferences.login.start']: {
          description: 'Start Podman Desktop when you log in',
          type: 'boolean',
          default: true,
        },
      },
    };
    const startMinimizeConfigurationNode: IConfigurationNode = {
      id: 'preferences.login.minimize',
      title: 'Minimize on login',
      type: 'object',
      properties: {
        ['preferences.login.minimize']: {
          description: 'Minimize Podman Desktop when you log in',
          type: 'boolean',
          default: false,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([loginStartConfigurationNode, startMinimizeConfigurationNode]);

    // add notification handling

    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === 'preferences.login.start') {
        if (e.value === true) {
          await this.enableStartupOnLogin();
        } else {
          await this.disableStartupOnLogin();
        }
      }
      // If the "minimize on start" option has changed, we need to update the startup configuration
      if (e.key === 'preferences.login.minimize') {
        // Only enable if we actually want to start on login
        const dashboardConfiguration = this.configurationRegistry.getConfiguration('preferences.login');
        const enabled = dashboardConfiguration.get<boolean>('start');
        if (enabled) {
          await this.enableStartupOnLogin();
        }
      }
    });

    // setup as per the configuration
    const dashboardConfiguration = this.configurationRegistry.getConfiguration('preferences.login');
    const startOnLogin = dashboardConfiguration.get<boolean>('start');
    if (startOnLogin) {
      await this.enableStartupOnLogin();
    }
  }
}
