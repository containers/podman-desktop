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

import { installBinaryToSystem } from './cli-run';
import { Detect } from './detect';
import { OS } from './os';

const os = new OS();

// Check that the kubectl binary has been installed, and if it is, set the configuration value accordingly
// also update the context.
export async function updateConfigAndContextKubectlBinary(
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const detect = new Detect(os, extensionContext.storagePath);
  await checkAndUpdateKubectlBinaryInstalledContexts(detect);
}

// Handle configuration changes (for example, when the user toggles the "Install kubectl system-wide" setting)
export function handleConfigurationChanges(extensionContext: extensionApi.ExtensionContext): void {
  const detect = new Detect(os, extensionContext.storagePath);

  extensionApi.configuration.onDidChangeConfiguration(async e => {
    if (e.affectsConfiguration('kubectl.binary.installKubectlSystemWide')) {
      await handleKubectlBinaryToggle(detect, extensionContext);
    }
  });
}

// Handle the user toggling the "Install kubectl system-wide" setting
async function handleKubectlBinaryToggle(
  detect: Detect,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const newValue = getKubectlBinarySetting();
  const isKubectlInstalled = await detect.checkSystemWideKubectl();

  // Only do something if the user has set the toggle to true and the binary is not installed,
  // Setting it from true to false will do nothing as we hide it within the UI anyways
  // if it's already true / installed correctly
  if (newValue && !isKubectlInstalled) {
    await installKubectlBinary(detect, extensionContext);
  }
}

// Install the kubectl binary to the system from the local storage path
export async function installKubectlBinary(
  detect: Detect,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const storagePath = await detect.getStoragePath();
  if (storagePath) {
    try {
      await installBinaryToSystem(storagePath, 'kubectl');
    } catch (error) {
      console.error(error);
      await extensionApi.window.showErrorMessage(`Unable to install kubectl binary: ${error}`);
      throw error;
    } finally {
      // Regardless of what happens, always update the configuration setting and context
      // for example, if this fails when installing, the configuration setting will be set back to false
      // again for the user to try again. If the installation succeeds, the configuration setting will be set to true
      // and it will dissapear from the UI, etc.
      await checkAndUpdateKubectlBinaryInstalledContexts(detect);
    }
  } else {
    await extensionApi.window.showErrorMessage(
      `Podman Desktop was unable to locate the kubectl binary in the ${extensionContext.storagePath}/bin folder. Please reinstall kubectl to ${extensionContext.storagePath}/bin and try again.`,
    );
  }
}

function getKubectlBinarySetting(): boolean {
  return (
    extensionApi.configuration.getConfiguration('kubectl.binary').get<boolean>('installKubectlSystemWide') ?? false
  );
}

// Update both the configuration as well as context values
// with the status of whether the kubectl binary has been installed
// system wide or not
async function checkAndUpdateKubectlBinaryInstalledContexts(detect: Detect): Promise<void> {
  // Detect and update the configuration setting to either true / false
  const isKubectlInstalledSystemWide = await detect.checkSystemWideKubectl();
  await extensionApi.configuration
    .getConfiguration('kubectl')
    .update('binary.installKubectlSystemWide', isKubectlInstalledSystemWide);

  // Update the kubectl onboarding context for installKubectlSystemWide is either true or false
  extensionApi.context.setValue('kubectl.isKubectlInstalledSystemWide', isKubectlInstalledSystemWide);
}
