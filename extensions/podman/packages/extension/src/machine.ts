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
import * as extensionApi from '@podman-desktop/api';

import type { MachineJSON } from './extension';
import { getDefaultConnection } from './extension';
import { execPodman, isLinux } from './util';

// System default notifier
let defaultMachineNotify = !isLinux();
let defaultConnectionNotify = !isLinux();
let defaultMachineMonitor = true;

export async function checkDefaultMachine(machines: MachineJSON[]): Promise<void> {
  // As a last check, let's see if the machine that is running is set by default or not on the CLI.
  // if it isn't, we should prompt the user to set it as default, or else podman CLI commands will not work
  const ROOTFUL_SUFFIX = '-root';
  const runningMachine = machines.find(machine => machine.Running);
  let defaultMachine = machines.find(machine => machine.Default);
  // It may happen that the default machine has not been found because the rootful connection is set as default
  // if so, we try to find the default system connection and use it to identify the default machine
  if (!defaultMachine) {
    const defaultConnection = await getDefaultConnection();
    let defaultConnectionName = defaultConnection?.Name;
    if (defaultConnectionName?.endsWith(ROOTFUL_SUFFIX)) {
      defaultConnectionName = defaultConnectionName.substring(0, defaultConnectionName.length - 5);
    }
    defaultMachine = machines.find(machine => machine.Name === defaultConnectionName);

    if (runningMachine && runningMachine.Name === defaultConnectionName) {
      runningMachine.Default = true;
    }
  }

  // check if connection is in sync with machine. If the default connection is rootless but the machine is rootful ask the user to update the connection
  if (defaultConnectionNotify && !!runningMachine?.Default) {
    const defaultConnection = await getDefaultConnection();
    const isRootful = await isRootfulMachine(runningMachine);
    if (!defaultConnection?.Name.endsWith(ROOTFUL_SUFFIX) && isRootful) {
      const result = await extensionApi.window.showInformationMessage(
        `${isRootful ? 'Rootful' : 'Rootless'} Podman Machine '${runningMachine.Name}' does not match default connection. This will cause podman CLI errors while trying to connect to '${runningMachine.Name}'. Do you want to update the default connection?`,
        'Yes',
        'Ignore',
        'Cancel',
      );
      if (result === 'Yes') {
        try {
          const connectionName = isRootful ? `${runningMachine.Name}${ROOTFUL_SUFFIX}` : runningMachine.Name;
          // make it the default to run the info command
          await execPodman(['system', 'connection', 'default', connectionName], runningMachine.VMType);
        } catch (error) {
          // eslint-disable-next-line quotes
          console.error("Error running 'podman system connection default': ", error);
          await extensionApi.window.showErrorMessage(`Error running 'podman system connection default': ${error}`);
          return;
        }
        await extensionApi.window.showInformationMessage(
          `Podman Machine '${runningMachine.Name}' is now the default machine on the CLI.`,
          'OK',
        );
      } else if (result === 'Ignore') {
        // If the user chooses to ignore, we should not notify them again until Podman Desktop is restarted.
        defaultConnectionNotify = false;
      }
    }
  }

  if (defaultMachineNotify && defaultMachineMonitor && runningMachine && !runningMachine.Default) {
    // Make sure we do notifyDefault = false so we don't keep notifying the user when this dialog is open.
    defaultMachineMonitor = false;

    const defaultMachineText = defaultMachine ? `(default is '${defaultMachine.Name}')` : '';
    // Create an information message to ask the user if they wish to set the running machine as default.
    const result = await extensionApi.window.showInformationMessage(
      `Podman Machine '${runningMachine.Name}' is running but not the default machine ${defaultMachineText}. This will cause podman CLI errors while trying to connect to '${runningMachine.Name}'. Do you want to set it as default?`,
      'Yes',
      'Ignore',
      'Cancel',
    );
    if (result === 'Yes') {
      // check if machine is rootless or rootful
      const machineIsRootful = await isRootfulMachine(runningMachine);

      try {
        const connectionName = machineIsRootful ? `${runningMachine.Name}${ROOTFUL_SUFFIX}` : runningMachine.Name;
        // make it the default to run the info command
        await execPodman(['system', 'connection', 'default', connectionName], runningMachine.VMType);
      } catch (error) {
        // eslint-disable-next-line quotes
        console.error("Error running 'podman system connection default': ", error);
        await extensionApi.window.showErrorMessage(`Error running 'podman system connection default': ${error}`);
        return;
      }
      await extensionApi.window.showInformationMessage(
        `Podman Machine '${runningMachine.Name}' is now the default machine on the CLI.`,
        'OK',
      );
    } else if (result === 'Ignore') {
      // If the user chooses to ignore, we should not notify them again until Podman Desktop is restarted.
      defaultMachineNotify = false;
    }

    defaultMachineMonitor = true;
  }
}

async function isRootfulMachine(machineJSON: MachineJSON): Promise<boolean> {
  let isRootful = false;
  try {
    const { stdout: machineInspectJson } = await execPodman(
      ['machine', 'inspect', machineJSON.Name],
      machineJSON.VMType,
    );
    const machinesInspect = JSON.parse(machineInspectJson);
    // find the machine name in the array
    const machineInspect = machinesInspect.find((machine: { Name: string }) => machine.Name === machineJSON.Name);
    isRootful = machineInspect?.Rootful ?? false;
  } catch (error) {
    console.error('Error when checking rootful machine: ', error);
  }
  return isRootful;
}
