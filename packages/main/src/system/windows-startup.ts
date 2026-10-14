/* eslint-disable simple-import-sort/imports */
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

import { existsSync, unlink } from 'node:fs';
import path from 'node:path';
import { app, type LaunchItems } from 'electron';
import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';

/**
 * On Windows, launching program automatically on startup is done via %APPDATA%\Roaming\Microsoft\Windows\Start Menu\Programs\Startup folder
 * This class manages the creation and deletion of the startup file
 * It uses a vbs script as using a bat script displays a blank terminal window
 */
export class WindowsStartup {
  private podmanDesktopBinaryPath;
  private configurationRegistry: IConfigurationRegistry;

  constructor(configurationRegistry: IConfigurationRegistry) {
    // configuration settings
    this.configurationRegistry = configurationRegistry;

    // grab current path of the binary
    this.podmanDesktopBinaryPath = app.getPath('exe');
  }

  // enable only if we're not using a temporary path / portable mode
  shouldEnable(): boolean {
    if (!process.env['PORTABLE_EXECUTABLE_FILE'] && this.podmanDesktopBinaryPath.startsWith(app.getPath('temp'))) {
      console.warn('Skipping start on login option as the app is running from a temporary path');
      return false;
    }
    return true;
  }

  /**
   * Registers the Windows startup item with the current arguments.
   * An existing item keeps its enabled state unless `forceEnable` is set, so updating
   * arguments does not override a startup item disabled in Task Manager.
   */
  async enable(forceEnable = false): Promise<void> {
    if (!this.shouldEnable()) {
      return;
    }
    const preferencesConfig = this.configurationRegistry.getConfiguration('preferences');
    const minimize = preferencesConfig.get<boolean>('login.minimize');

    // after https://github.com/podman-desktop/podman-desktop/pull/13056 there is a leftover startup file that we need to remove
    const windowsStartupFoler = path.resolve(app.getPath('appData'), 'Microsoft/Windows/Start Menu/Programs/Startup');
    const startupFile = path.resolve(windowsStartupFoler, 'podman-desktop.vbs');

    if (existsSync(startupFile)) {
      unlink(startupFile, (err: unknown) => {
        console.error(`Got error when removing ${startupFile} file: ${err}`);
      });
    }

    // We pass in "--minimize" so electron can read the flag on first startup.
    const args = minimize ? ['--minimized'] : [];
    const loginItemPath = `"${this.resolveBinaryPath()}"`;
    const matchingLaunchItem = this.findMatchingLaunchItem();

    app.setLoginItemSettings({
      openAtLogin: true,
      path: loginItemPath,
      args,
      enabled: forceEnable || (matchingLaunchItem?.enabled ?? true),
    });
  }

  /**
   * Reflects the matching Windows startup item's enabled state in preferences.
   * Run before registering preference listeners to preserve external overrides
   * without changing the Windows startup item. Windows removes the entry when it is disabled,
   * so a missing entry is treated as disabled.
   */
  async syncStartupPreference(): Promise<void> {
    const matchingLaunchItem = this.findMatchingLaunchItem();

    await this.configurationRegistry.updateConfigurationValue(
      'preferences.login.start',
      matchingLaunchItem ? matchingLaunchItem.enabled : false,
    );
  }

  async disable(): Promise<void> {
    app.setLoginItemSettings({
      openAtLogin: false,
    });
  }

  /** Returns the Windows startup item registered for the startup executable, if any. */
  private findMatchingLaunchItem(): LaunchItems | undefined {
    const startupExecutablePath = path.normalize(this.resolveBinaryPath()).toLowerCase();
    return app
      .getLoginItemSettings()
      .launchItems.find(launchItem => path.normalize(launchItem.path).toLowerCase() === startupExecutablePath);
  }

  /** Returns the portable or installed executable path used for Windows startup. */
  private resolveBinaryPath(): string {
    // In portable mode, register the portable file rather than the temporary
    // directory where it is expanded.
    if (process.env['PORTABLE_EXECUTABLE_FILE']) {
      this.podmanDesktopBinaryPath = process.env['PORTABLE_EXECUTABLE_FILE'];
      return this.podmanDesktopBinaryPath;
    }

    // An update can install a new binary in AppData/Local before it is running.
    const programsData = path.resolve(app.getPath('appData'), '..', 'local/Programs/podman-desktop');
    const podmanDesktopInPrograms = path.resolve(programsData, 'Podman Desktop.exe');
    if (existsSync(podmanDesktopInPrograms)) {
      this.podmanDesktopBinaryPath = podmanDesktopInPrograms;
    }

    return this.podmanDesktopBinaryPath;
  }
}
