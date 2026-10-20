/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
 ********************************************************************/

import { arch, release } from 'node:os';

import type { RunError, RunOptions } from '@podman-desktop/api';
import { env, process as processAPI, window } from '@podman-desktop/api';
import { injectable } from 'inversify';
import { compare, gte } from 'semver';

import type { PodmanConfiguration } from './podman-configuration';
import { execPodman, VMTYPE } from './util';

export const ROSETTA_ENABLE_FILE = '/etc/containers/enable-rosetta';
export const PODMAN_MINIMUM_VERSION_FOR_MACHINE_RESTART = '6.1.0';

// Darwin kernel major version for macOS Tahoe (macOS 26)
const MACOS_TAHOE_DARWIN_MAJOR_VERSION = 25;

// Podman 5.6 introduced the /etc/containers/enable-rosetta opt-in mechanism
// for machines running with Linux kernel 6.13+ on macOS Tahoe
const PODMAN_MINIMUM_VERSION_FOR_ROSETTA_ENABLE_FILE = '5.6.0';

@injectable()
export class RosettaProvisioner {
  /**
   * Returns true when all conditions for the /etc/containers/enable-rosetta
   * opt-in are satisfied: AppleHV provider on macOS Tahoe+ ARM64 with Rosetta
   * enabled and Podman 5.6+.
   * Does not require the machine to be running — safe to call before starting it.
   */
  async needsRosettaEnableFile(
    podmanConfiguration: PodmanConfiguration,
    podmanVersion: string,
    vmType?: string,
  ): Promise<boolean> {
    if (!env.isMac || arch() !== 'arm64') return false;

    if (vmType !== VMTYPE.APPLEHV) return false;

    // The Apple-side fix only landed in macOS Tahoe (Darwin 25.x / macOS 26)
    const darwinMajor = Number.parseInt(release().split('.')[0], 10);
    if (darwinMajor < MACOS_TAHOE_DARWIN_MAJOR_VERSION) return false;

    // The enable-rosetta file mechanism was introduced in Podman 5.6 machine images
    if (compare(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_ROSETTA_ENABLE_FILE) < 0) return false;

    return podmanConfiguration.isRosettaEnabled();
  }

  /**
   * Creates /etc/containers/enable-rosetta inside a running Podman VM when needed.
   * This is required on macOS Tahoe with Podman 5.6+ because the newer machine
   * image (kernel 6.13+) disabled Rosetta by default; Apple fixed the kernel
   * incompatibility in Tahoe so the opt-in file re-enables it.
   *
   * Returns true if the file was created, meaning the machine must be restarted
   * for Rosetta to become active. The machine must be running when this is called.
   * https://blog.podman.io/2025/08/podman-5-6-released-rosetta-status-update/
   */
  async enableRosettaInMachine(
    machineName: string,
    vmType: string | undefined,
    podmanConfiguration: PodmanConfiguration,
    podmanVersion: string,
  ): Promise<boolean> {
    if (!(await this.needsRosettaEnableFile(podmanConfiguration, podmanVersion, vmType))) return false;

    const args = machineName ? [machineName] : [];
    // Check if the file already exists so we avoid an unnecessary restart
    try {
      await execPodman(['machine', 'ssh', ...args, `test -f ${ROSETTA_ENABLE_FILE}`], vmType);
      return false; // file already present, nothing to do
    } catch {
      // non-zero exit means the file is missing — fall through to create it
    }

    await execPodman(['machine', 'ssh', ...args, `sudo touch ${ROSETTA_ENABLE_FILE}`], vmType);
    return true;
  }

  /**
   * Provisions /etc/containers/enable-rosetta inside a running Podman VM and
   * restarts the machine so the binfmt_misc handler registers Rosetta.
   *
   * Returns true if a restart was performed, false if nothing was needed.
   *
   * Errors during file creation (SSH) are caught and logged as warnings because
   * the machine is still running. Errors during machine restart are propagated
   * because the machine state may have changed.
   * https://blog.podman.io/2025/08/podman-5-6-released-rosetta-status-update/
   */
  async provisionAndRestartForRosetta(
    machineName: string,
    vmType: string | undefined,
    podmanConfiguration: PodmanConfiguration,
    podmanVersion: string,
    options?: RunOptions,
  ): Promise<boolean> {
    let fileCreated: boolean;
    try {
      fileCreated = await this.enableRosettaInMachine(machineName, vmType, podmanConfiguration, podmanVersion);
    } catch (err) {
      console.warn(`Failed to provision Rosetta enable file: ${err}`);
      return false;
    }
    if (!fileCreated) return false;

    const args = machineName ? [machineName] : [];
    // Restart errors propagate so the caller does not report a stale status.
    if (gte(podmanVersion, PODMAN_MINIMUM_VERSION_FOR_MACHINE_RESTART)) {
      await execPodman(['machine', 'restart', ...args], vmType, options);
    } else {
      await execPodman(['machine', 'stop', ...args], vmType);
      await execPodman(['machine', 'start', ...args], vmType, options);
    }
    return true;
  }

  async checkRosettaMacArm(podmanConfiguration: PodmanConfiguration): Promise<void> {
    // check that rosetta is there for macOS / arm as the machine may fail to start
    if (env.isMac && arch() === 'arm64') {
      const isEnabled = await podmanConfiguration.isRosettaEnabled();
      if (isEnabled) {
        // call the command `arch -arch x86_64 uname -m` to check if rosetta is enabled
        // if not installed, it will fail
        try {
          await processAPI.exec('arch', ['-arch', 'x86_64', 'uname', '-m']);
        } catch (error: unknown) {
          const runError = error as RunError;
          if (runError.stderr?.includes('Bad CPU')) {
            // rosetta is enabled but not installed, it will fail, stop from there and prompt the user to install rosetta or disable rosetta support
            const result = await window.showInformationMessage(
              'Podman machine is configured to use Rosetta but the support is not installed. The startup of the machine will fail.\nDo you want to install Rosetta? Rosetta is allowing to execute amd64 images on Apple silicon architecture.',
              'Yes',
              'No',
              'Disable rosetta support',
            );
            if (result === 'Yes') {
              // ask the person to perform the installation using cli
              await window.showInformationMessage(
                'Please install Rosetta from the command line by running `softwareupdate --install-rosetta`',
              );
            } else if (result === 'Disable rosetta support') {
              await podmanConfiguration.updateRosettaSetting(false);
            }
          }
        }
      }
    }
  }
}
