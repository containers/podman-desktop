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
import { isDisguisedPodman } from './warnings';
import { LifecycleContextImpl } from './lifecycle-context';

// Create an abstract class for compatibility mode (macOS only)
// TODO: Linux
abstract class SocketCompatibility {
  abstract isEnabled(): Promise<boolean>;
  abstract enable(): Promise<void>;
  abstract disable(): Promise<void>;
  abstract details: string;
  abstract tooltipText(): string;

  // Get all the current providers
  // Filter through providers and check if Docker is running.
  async isDockerRunning(): Promise<boolean> {
    const providers = extensionApi.provider.getContainerConnections();

    const dockerProviders = providers.filter(provider => {
      return provider.connection.type === 'docker' && provider.connection.status() === 'started';
    });

    return dockerProviders.length > 0;
  }

  async restartPodmanMachineWithConfirmation(): Promise<void> {
    // Ask the user for confirmation if they want to restart the podman machine
    const confirmation = await extensionApi.window.showInformationMessage(
      'Restarting Podman is required for compatibility mode to function. Containers will be restarted. Are you sure you want to continue?',
      'Continue',
      'Cancel',
    );
    if (confirmation === 'Continue') {
      // Create a logging interface for lifecycle so we can use the start() and stop() functionalities
      const lifecycleContext = new LifecycleContextImpl();

      // Get all the containers
      // Filter through podmanMachine and find the podman machine provider
      // Go through podmanMachines and find the one that's 'started'
      const providers = extensionApi.provider.getContainerConnections();
      const podmanMachines = providers.filter(provider => {
        return provider.connection.type === 'podman';
      });

      const startedPodmanMachine = podmanMachines.find(machine => {
        return machine.connection.status() === 'started';
      });

      // If we find a started podman machine, then stop and start it
      // if no started podman machine is found, then find a stopped podman machine and start it
      // if neither is found, error out.
      if (startedPodmanMachine) {
        // Must wait for the stop to finish before starting the machine aynchronously
        await startedPodmanMachine.connection.lifecycle.stop(lifecycleContext);
        startedPodmanMachine.connection.lifecycle.start(lifecycleContext);
      } else {
        // Find all the stopped podman machines
        const stoppedPodmanMachine = podmanMachines.filter(machine => {
          return machine.connection.status() === 'stopped';
        });

        // If one is found, start it
        // if multiple ones are found, ask the user to select one using showQuickPick
        if (stoppedPodmanMachine.length === 1) {
          stoppedPodmanMachine[0].connection.lifecycle.start(lifecycleContext);
        } else if (stoppedPodmanMachine.length > 1) {
          const selection = await extensionApi.window.showQuickPick(
            stoppedPodmanMachine.map(machine => machine.connection.name),
            {
              placeHolder: 'Multiple stopped Podman machines detected, select one to start',
            },
          );

          // Find the podman machine that matches the selection and start it.
          if (selection) {
            const selectedMachine = stoppedPodmanMachine.find(machine => {
              return machine.connection.name === selection;
            });
            selectedMachine?.connection.lifecycle.start(lifecycleContext);
          }
        } else {
          extensionApi.window.showErrorMessage('No Podman machines are available to restart. Check the resource page.');
        }
      }
    }
  }
}

export class DarwinSocketCompatibility extends SocketCompatibility {
  // Shows the details of the compatibility mode on what we do.
  details = 'The podman-mac-helper binary will be run. This requires administrative privileges.';

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
  async isEnabled(): Promise<boolean> {
    const username = os.userInfo().username;
    const filename = `/Library/LaunchDaemons/com.github.containers.podman.helper-${username}.plist`;
    return fs.existsSync(filename);
  }

  // Run sudo command for podman mac helper
  async runSudoMacHelperCommand(command: string): Promise<void> {
    const sudoOptions = {
      name: 'Podman Desktop Compatibility Mode',
    };
    return new Promise((resolve, reject) => {
      sudo.exec(command, sudoOptions, (error, stdout, stderr) => {
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

  async runCommand(command: string, description: string): Promise<void> {
    // Find the podman-mac-helper binary
    const podmanHelperBinary = this.findPodmanHelper();
    if (podmanHelperBinary === '') {
      extensionApi.window.showErrorMessage('podman-mac-helper binary not found.', 'OK');
      return;
    }

    const fullCommand = `${podmanHelperBinary} ${command}`;
    try {
      await this.runSudoMacHelperCommand(fullCommand);
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

export class WindowsSocketCompatibility extends SocketCompatibility {
  // Shows the details of the compatibility mode on what we do.
  details = '';

  tooltipText(): string {
    const text = 'Windows Docker socket compatibility for Podman.';
    return this.isEnabled() ? `Disable ${text}` : `Enable ${text}`;
  }

  // Returns if it's enabled or not, the only way to check this is
  // to see if isDisguised works or not.
  async isEnabled(): Promise<boolean> {
    const isDisguisedPodmanSocket = await isDisguisedPodman();
    return isDisguisedPodmanSocket;
  }

  // Enabling requires:
  // Stopping Docker
  // Restarting Podman machine
  async enable(): Promise<void> {
    // Check to see if Docker provider is still running
    // Create a recursive loop to check if Docker is still running and ask the user to stop it, (cancel will exit)
    const dockerUp = await this.isDockerRunning();
    if (dockerUp) {
      await extensionApi.window.showInformationMessage(
        'Docker is running. Please stop Docker before enabling the compatibility mode.',
        'OK',
      );
      return;
    }

    // Restart the podman machine
    await this.restartPodmanMachineWithConfirmation();
  }

  // Disabling requires:
  // Starting Docker (overrides the compatibility socket)
  // Restarting Podman machine (to use not use the compatibility socket)
  async disable(): Promise<void> {
    // Check to see if Docker is stopped
    // Create a recursive loop to check if Docker is still running and ask the user to stop it, (cancel will exit)
    const dockerDown = !(await this.isDockerRunning());
    if (dockerDown) {
      await extensionApi.window.showInformationMessage(
        'Start Docker before continuing. To disable Podman compatibility mode, Docker must be started to override the emulated socket.',
        'OK',
      );
      return;
    }

    // Restart the podman machine
    await this.restartPodmanMachineWithConfirmation();

    // Temporary, due to: https://github.com/containers/podman-desktop/issues/1819
    // Tell the user to restart Podman Desktop
    await extensionApi.window.showInformationMessage('Podman Desktop must be restarted to apply the changes.', 'OK');
  }
}

export function getSocketCompatibility(): SocketCompatibility {
  switch (process.platform) {
    case 'darwin':
      return new DarwinSocketCompatibility();
    case 'win32':
      return new WindowsSocketCompatibility();
    default:
      throw new Error(`Unsupported platform ${process.platform}`);
  }
}
