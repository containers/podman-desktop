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

import fs from 'node:fs';
import path from 'node:path';

import { app } from 'electron';

import type { ConfigurationRegistry } from '../plugin/configuration-registry.js';

/**
 * On macOS, startup on login is done via a plist file
 * that is installed in ~/Library/LaunchAgents
 * This class manages the creation and deletion of the plist file
 */
export class MacosStartup {
  private podmanDesktopBinaryPath;
  private plistFile;
  private configurationRegistry: ConfigurationRegistry;

  constructor(configurationRegistry: ConfigurationRegistry) {
    this.configurationRegistry = configurationRegistry;

    // grab current path of the binary
    this.podmanDesktopBinaryPath = app.getPath('exe');

    // Check if we already have a plist file ?
    this.plistFile = path.resolve(app.getPath('home'), 'Library/LaunchAgents/io.podman_desktop.PodmanDesktop.plist');
  }

  shouldEnable(): boolean {
    // if it's not in applications, do not enable it
    if (
      !this.podmanDesktopBinaryPath.startsWith('/Applications/') &&
      !this.podmanDesktopBinaryPath.startsWith(app.getPath('home') + '/Applications/')
    ) {
      console.warn('Skipping Start on Login option as the app is not starting from an Applications folder');
      return false;
    }

    return true;
  }

  async enable(): Promise<void> {
    // Check the preferences for login.minimize has been enabled
    // as this may change each time it's enabled (changed from true to false, etc.)
    // it's also to make sure that settings weren't changed while async function was running
    // so we check the configuration within the function
    const preferencesConfig = this.configurationRegistry.getConfiguration('preferences');
    const minimize = preferencesConfig.get<boolean>('login.minimize');
    const minimizeSettings = minimize ? '<string>--minimize</string>' : '';

    // comes from a volume ? do nothing
    if (this.podmanDesktopBinaryPath.startsWith('/Volumes/')) {
      console.warn(`Cannot enable the start on login, running from a volume ${this.podmanDesktopBinaryPath}`);
      return;
    }

    // write the file
    const plistContent =
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.podman_desktop.PodmanDesktop</string>
    <key>ProgramArguments</key>
    <array>
        <string>${this.podmanDesktopBinaryPath}</string>
        ` +
      minimizeSettings +
      `
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${app.getPath('home')}/Library/Logs/Podman Desktop/launchd-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${app.getPath('home')}/Library/Logs/Podman Desktop/launchd-stderr.log</string>
</dict>
</plist>
`;

    // ensure the parent directory of the plist file exists
    await fs.promises.mkdir(path.dirname(this.plistFile), { recursive: true });

    // write the file
    await fs.promises.writeFile(this.plistFile, plistContent, 'utf-8');
    console.info(
      `Installing Podman Desktop startup file at ${this.plistFile} using ${this.podmanDesktopBinaryPath} location.`,
    );
  }

  async disable(): Promise<void> {
    // remove the file at this.podmanDesktopBinaryPath only if it exists
    if (fs.existsSync(this.plistFile)) {
      await fs.promises.unlink(this.plistFile);
    }
  }
}
