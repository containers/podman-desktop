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

import * as extensionApi from '@podman-desktop/api';
import * as sudo from 'sudo-prompt';
import * as fs from 'fs';

// Create an abstract class for compatibility mode (macOS only)
// TODO: Windows, Linux
abstract class SocketCompatibility {
  abstract enable(): Promise<void>;
  abstract disable(): Promise<void>;
  abstract details: string;
}

export class DarwinSocketCompatibility extends SocketCompatibility {
  // Shows the details of the compatibility mode on what we do.
  details = `The podman-mac-helper binary will be ran in order to enable or disable compatibility mode. 
    This requires administrative privileges.`;

  findPodmanHelper(): string {
    const homebrewPath = '/opt/homebrew/bin/podman-mac-helper';
    const podmanPath = '/opt/podman/bin/podman-mac-helper';

    if (fs.existsSync(homebrewPath)) {
      return homebrewPath;
    } else if (fs.existsSync(podmanPath)) {
      return podmanPath;
    } else {
      return '';
    }
  }

  async runCommand(command: string, description: string): Promise<void> {
    // Find the podman-mac-helper binary
    const podmanHelperBinary = this.findPodmanHelper();
    if (podmanHelperBinary === '') {
      extensionApi.window.showErrorMessage('podman-mac-helper binary not found.', 'OK');
      return;
    }

    const fullCommand = `${podmanHelperBinary} ${command}`;
    try {
      await runSudoMacHelperCommand(fullCommand);
      extensionApi.window.showInformationMessage(`Docker socket compatibility mode for Podman has been ${description}.
      Restart your Podman machine to apply the changes.`);
    } catch (error) {
      console.error(`Error running podman-mac-helper: ${error}`);
      extensionApi.window.showErrorMessage(`Error running podman-mac-helper: ${error}`, 'OK');
    }
  }

  // Enable the compatibility mode by running podman-mac-helper install
  // Run the command with sudo privileges and output the result to the user
  async enable(): Promise<void> {
    return this.runCommand('install', 'enabled');
  }

  async disable(): Promise<void> {
    return this.runCommand('uninstall', 'disabled');
  }
}

// TODO: Windows, Linux
export function getSocketCompatibility(): SocketCompatibility {
  switch (process.platform) {
    case 'darwin':
      return new DarwinSocketCompatibility();
    default:
      throw new Error(`Unsupported platform ${process.platform}`);
  }
}

// Run sudo command for podman mac helper
async function runSudoMacHelperCommand(command: string): Promise<void> {
  const sudoOptions = {
    name: 'Podman Desktop Compatibility Mode',
  };
  return new Promise((resolve, reject) => {
    sudo.exec(command, sudoOptions, (error, stdout, stderr) => {
      console.log('sudo command output: ', stdout, stderr);

      // podman-mac-helper does not error out on failure for some reason, so we need to check the output for
      // 'Error:' to determine if the command failed despite the exit code being 0
      // Issue: https://github.com/containers/podman/issues/17785
      // we'll most likely need to keep this check for old releases of podman-mac-helper.
      if (stderr?.includes('Error:')) {
        reject(stderr);
      }

      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
