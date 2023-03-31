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
import * as fs from 'node:fs';
import * as os from 'node:os';

const podmanSystemdSocket = 'podman.socket';

// Create an abstract class for compatibility mode (macOS only)
// TODO: Windows, Linux
abstract class SocketCompatibility {
  abstract isEnabled(): boolean;
  abstract enable(): Promise<void>;
  abstract disable(): Promise<void>;
  abstract details: string;
  abstract tooltipText(): string;

  // Run a sudo command with elevated privileges
  async runSudoCommand(command: string): Promise<void> {
    const sudoOptions = {
      name: 'Podman Desktop Compatibility Mode',
    };
    return new Promise((resolve, reject) => {
      sudo.exec(command, sudoOptions, (error, stdout, stderr) => {
        // podman-mac-helper does not error out on failure for some reason, so we need to check the output for
        // 'Error:' to determine if the command failed despite the exit code being 0
        // Issue: https://github.com/containers/podman/issues/17785
        // we'll most likely need to keep this check for old releases of podman-mac-helper.
        // TODO remove in the future.
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
}

export class DarwinSocketCompatibility extends SocketCompatibility {
  // Shows the details of the compatibility mode on what we do.
  details = 'The podman-mac-helper binary will be ran. This requires administrative privileges.';

  // This will show the "opposite" of what the current state is
  // "Enable" if it's currently disabled, "Disable" if it's currently enabled
  // for tooltip text
  tooltipText(): string {
    const text = 'macOS Docker socket compatibility for Podman.';
    return this.isEnabled() ? `Disable ${text}` : `Enable ${text}`;
  }

  // Find the podman-mac-helper binary which should only be located in either
  // brew or podman's install location
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

  // Check to see if com.github.containers.podman.helper-<username>.plist exists
  isEnabled(): boolean {
    const username = os.userInfo().username;
    const filename = `/Library/LaunchDaemons/com.github.containers.podman.helper-${username}.plist`;
    return fs.existsSync(filename);
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
      await this.runSudoCommand(fullCommand);
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

export class LinuxSocketCompatibility extends SocketCompatibility {
  details =
    'Administrative privileges are required to enable or disable the systemd Podman socket for Docker compatibility.';

  // This will show the "opposite" of what the current state is
  // "Enable" if it's currently disabled, "Disable" if it's currently enabled
  // for tooltip text
  tooltipText(): string {
    const text = 'Linux Docker socket compatibility for Podman.';
    return this.isEnabled() ? `Disable ${text}` : `Enable ${text}`;
  }

  // isEnabled() checks to see if /etc/systemd/system/socket.target.wants/podman.socket exists
  isEnabled(): boolean {
    const filename = '/etc/systemd/system/socket.target.wants/podman.socket';
    return fs.existsSync(filename);
  }

  // Systemctl would only ever exist in two locations. Either /usr/bin/systemctl or /bin/systemctl
  // find sytemctl and return the path
  private findSystemctl(): string {
    const pathsToCheck = ['/usr/bin/systemctl', '/bin/systemctl'];
    for (const path of pathsToCheck) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
    return '';
  }

  // Runs the systemd command either 'enable' or 'disable'
  async runSystemdCommand(command: string, description: string): Promise<void> {
    // Only allow enable or disable, throw error if anything else is inputted
    if (command != 'enable' && command != 'disable') {
      throw new Error('runSystemdCommand only accepts enable or disable as the command');
    }

    // Get the path to systemctl and throw an error if it doesn't exist
    const systemctlPath = this.findSystemctl();
    if (systemctlPath === '') {
      extensionApi.window.showErrorMessage('systemctl command not found, cannot enable or disable podman.socket', 'OK');
      return;
    }

    // Add the path to the podman.socket file to the command
    // Add `--now` to the command so systemctl will enable / disable immediateley
    // as well as the podman socket
    command = command.concat(` --now ${podmanSystemdSocket}`);

    try {
      await this.runSudoCommand(`${systemctlPath} ${command}`);
    } catch (error) {
      console.error(`Error running systemctl command: ${error}`);
      extensionApi.window.showErrorMessage(`Error running systemctl command: ${error}`, 'OK');
      return;
    }

    // After enabling the socket, ask the user if they want to create a symlink from /run/podman/podman.sock to /var/run/docker.sock
    // This is so that the user can use the Docker extension without having to change any settings (like DOCKER_HOST)
    if (command.includes('enable')) {
      const createSymlink = await extensionApi.window.showInformationMessage(
        'Would you like to create a symlink from /run/podman/podman.sock to /var/run/docker.sock?\nAlternatively, you can set: export DOCKER_HOST=unix:///run/podman/podman.sock in your shell to use Docker CLI tools.',
        'Yes',
        'Cancel',
      );
      if (createSymlink === 'Yes') {
        try {
          // TODO: Maybe don't ask for sudo password again? Do both systemctl and enable
          await this.runSudoCommand('ln -s /run/podman/podman.sock /var/run/docker.sock');
          await extensionApi.window.showInformationMessage(
            'Symlink created. You can now use the Docker-like tools with Podman without changing any settings.',
          );
        } catch (error) {
          console.error(`Error creating symlink: ${error}`);
          extensionApi.window.showErrorMessage(`Error creating symlink: ${error}`, 'OK');
          return;
        }
      }
    }

    extensionApi.window.showInformationMessage(
      `Podman systemd socket has been ${description} for Docker compatibility.`,
    );
  }

  async enable(): Promise<void> {
    return this.runSystemdCommand('enable', 'enabled');
  }

  async disable(): Promise<void> {
    return this.runSystemdCommand('disable', 'disabled');
  }
}

// TODO: Windows
export function getSocketCompatibility(): SocketCompatibility {
  switch (process.platform) {
    case 'darwin':
      return new DarwinSocketCompatibility();
    case 'linux':
      return new LinuxSocketCompatibility();
    default:
      throw new Error(`Unsupported platform ${process.platform}`);
  }
}
