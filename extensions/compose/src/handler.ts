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

// Check that the docker compose binary has been installed, and if it is, set the configuration value accordingly
// also update the context.
export async function updateConfigAndContextComposeBinary(
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const detect = new Detect(os, extensionContext.storagePath);
  await checkAndUpdateComposeBinaryInstalledContexts(detect);
}

export async function isDockerComposeInstalledSystemWide(
  extensionContext: extensionApi.ExtensionContext,
): Promise<boolean> {
  const detect = new Detect(os, extensionContext.storagePath);
  return await detect.checkSystemWideDockerCompose();
}

// Handle configuration changes (for example, when the user toggles the "Install compose system-wide" setting)
export function handleConfigurationChanges(extensionContext: extensionApi.ExtensionContext): void {
  const detect = new Detect(os, extensionContext.storagePath);

  extensionApi.configuration.onDidChangeConfiguration(async e => {
    if (e.affectsConfiguration('compose.binary.installComposeSystemWide')) {
      await handleComposeBinaryToggle(detect, extensionContext);
    }
  });
}

// Handle the user toggling the "Install compose system-wide" setting
async function handleComposeBinaryToggle(
  detect: Detect,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const newValue = getComposeBinarySetting();
  const isDockerComposeInstalled = await detect.checkSystemWideDockerCompose();

  // Only do something if the user has set the toggle to true and the binary is not installed,
  // Setting it from true to false will do nothing as we hide it within the UI anyways
  // if it's already true / installed correctly
  if (newValue && !isDockerComposeInstalled) {
    await installComposeBinary(detect, extensionContext);
  }
}

// Install the compose binary to the system from the local storage path
export async function installComposeBinary(
  detect: Detect,
  extensionContext: extensionApi.ExtensionContext,
): Promise<void> {
  const storagePath = await detect.getStoragePath();
  if (storagePath) {
    try {
      await installBinaryToSystem(storagePath, 'docker-compose');
    } catch (error) {
      console.error(error);
      await extensionApi.window.showErrorMessage(`Unable to install docker-compose binary: ${error}`);
      throw error;
    } finally {
      // Regardless of what happens, always update the configuration setting and context
      // for example, if this fails when installing, the configuration setting will be set back to false
      // again for the user to try again. If the installation succeeds, the configuration setting will be set to true
      // and it will dissapear from the UI, etc.
      await checkAndUpdateComposeBinaryInstalledContexts(detect);
    }
  } else {
    await extensionApi.window.showErrorMessage(
      `Podman Desktop was unable to locate the docker-compose binary in the ${extensionContext.storagePath}/bin folder. Please reinstall docker-compose to ${extensionContext.storagePath}/bin and try again.`,
    );
  }
}

function getComposeBinarySetting(): boolean {
  return (
    extensionApi.configuration.getConfiguration('compose.binary').get<boolean>('installComposeSystemWide') ?? false
  );
}

// Update both the configuration as well as context values
// with the status of whether the docker compose binary has been installed
// system wide or not
async function checkAndUpdateComposeBinaryInstalledContexts(detect: Detect): Promise<void> {
  // Detect and update the configuration setting to either true / false
  const isDockerComposeInstalledSystemWide = await detect.checkSystemWideDockerCompose();
  await extensionApi.configuration
    .getConfiguration('compose')
    .update('binary.installComposeSystemWide', isDockerComposeInstalledSystemWide);

  // Update the compose onboarding context for installComposeSystemWide is either true or false
  extensionApi.context.setValue('compose.isComposeInstalledSystemWide', isDockerComposeInstalledSystemWide);
}
