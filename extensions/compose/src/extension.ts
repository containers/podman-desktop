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

import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';
import { Detect } from './detect';
import { ComposeExtension } from './compose-extension';
import type { ComposeGithubReleaseArtifactMetadata } from './compose-github-releases';
import { ComposeGitHubReleases } from './compose-github-releases';
import { OS } from './os';
import { ComposeWrapperGenerator } from './compose-wrapper-generator';
import * as path from 'path';
import * as handler from './handler';
import { ComposeInstallation } from './installation';

let composeExtension: ComposeExtension | undefined;
let composeVersionMetadata: ComposeGithubReleaseArtifactMetadata | undefined;

const composeCliName = 'docker-compose';
const composeDisplayName = 'Compose';
const composeDescription = `Compose is a specification for defining and running multi-container applications. We support both [podman compose](https://docs.podman.io/en/latest/markdown/podman-compose.1.html) and [docker compose](https://github.com/docker/compose) commands.\n\nMore information: [compose-spec.io](https://compose-spec.io/)`;
const imageLocation = './icon.png';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // Post activation
  setTimeout(() => {
    postActivate(extensionContext).catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);

  // Check docker-compose binary has been installed and update both
  // the configuration setting and the context accordingly
  await handler.updateConfigAndContextComposeBinary(extensionContext);

  // Setup configuration changes if the user toggles the "Install compose system-wide" boolean
  handler.handleConfigurationChanges(extensionContext);

  // Create new classes to handle the onboarding sequence
  const octokit = new Octokit();
  const os = new OS();
  const detect = new Detect(os, extensionContext.storagePath);

  const composeGitHubReleases = new ComposeGitHubReleases(octokit);
  const composeInstallation = new ComposeInstallation(extensionContext, composeGitHubReleases, os);

  // ONBOARDING: Command to check compose installation
  const onboardingCheckInstallationCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.checkComposeInstalled',
    async () => {
      // Check that docker-compose binary has been installed to the storage folder.
      // instead of checking for `docker-compose` on the command line, the most reliable way is to see
      // if we can get the pathname to the binary from the configuration
      const isInstalled = await detect.getStoragePath();
      if (isInstalled === '') {
        extensionApi.context.setValue('composeIsNotInstalled', true, 'onboarding');
      } else {
        extensionApi.context.setValue('composeIsNotInstalled', false, 'onboarding');
      }

      // EDGE CASE: Update system-wide installation context in case the user has removed
      // the binary from the system path while podman-desktop is running (we only check on startup)
      await handler.updateConfigAndContextComposeBinary(extensionContext);

      // CheckInstallation is the first step in the onboarding sequence,
      // we will run getLatestVersionAsset so we can show the user the latest
      // latest version of compose that is available.
      if (!isInstalled) {
        // Get the latest version and store the metadata in a local variable
        const composeLatestVersion = await composeInstallation.getLatestVersionAsset();
        // Set the value in the context to the version we're installing so it appears in the onboarding sequence
        if (composeLatestVersion) {
          composeVersionMetadata = composeLatestVersion;
          extensionApi.context.setValue('composeInstallVersion', composeVersionMetadata.tag, 'onboarding');
        }
      }
    },
  );

  // ONBOARDING; Command to install the compose binary. We will get the value that the user has "picked"
  // from the context value. This is because we have the option to either "select a version" or "install the latest"
  const onboardingInstallComposeCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.installCompose',
    async () => {
      // If the version is undefined (checks weren't run, or the user didn't select a version)
      // we will just install the latest version
      if (composeVersionMetadata === undefined) {
        composeVersionMetadata = await composeInstallation.getLatestVersionAsset();
      }

      // Install
      await composeInstallation.install(composeVersionMetadata);

      // We are all done, so we can set the context value to false
      extensionApi.context.setValue('composeIsNotInstalled', false, 'onboarding');
    },
  );

  // ONBOARDING: Prompt the user for the version of Compose they want to install
  const onboardingPromptUserForVersionCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.promptUserForVersion',
    async () => {
      // Prompt the user for the verison
      const composeRelease = await composeInstallation.promptUserForVersion();

      // Update the context value that this is the version we are installing
      // we'll store both the metadata as well as version number in a sepearate context value
      if (composeRelease) {
        composeVersionMetadata = composeRelease;
        extensionApi.context.setValue('composeInstallVersion', composeRelease.tag, 'onboarding');
      }

      // Note, we do not refresh the UI when setValue has been set, only when "when" has been updated
      // TEMPORARY FIX until we can find a better way to do this. This forces a refresh by changing the "when" evaluation
      // of the dialog so it'll refresh the composeInstallVersion value.
      extensionApi.context.setValue('composeShowCustomInstallDialog', true, 'onboarding');
      extensionApi.context.setValue('composeShowCustomInstallDialog', false, 'onboarding');
    },
  );

  // Push the commands that will be used within the onboarding sequence
  extensionContext.subscriptions.push(
    onboardingCheckInstallationCommand,
    onboardingPromptUserForVersionCommand,
    onboardingInstallComposeCommand,
  );

  // Need to "ADD" a provider so we can actually press the button!
  // We set this to "unknown" so it does not appear on the dashboard (we only want it in preferences).
  const providerOptions: extensionApi.ProviderOptions = {
    name: composeDisplayName,
    id: composeDisplayName,
    status: 'unknown',
    images: {
      icon: imageLocation,
    },
  };

  providerOptions.emptyConnectionMarkdownDescription = composeDescription;

  const provider = extensionApi.provider.createProvider(providerOptions);
  extensionContext.subscriptions.push(provider);

  // Register the CLI extension, this will allow us to show the CLI version, update the CLI, installation, etc.
  extensionApi.cli.createCliTool({
    name: composeCliName,
    displayName: composeDisplayName,
    markdownDescription: composeDescription,
    images: {
      icon: imageLocation,
    },
  });
}

async function postActivate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const octokit = new Octokit();
  const os = new OS();
  const podmanComposeGenerator = new ComposeWrapperGenerator(os, path.resolve(extensionContext.storagePath, 'bin'));
  composeExtension = new ComposeExtension(
    extensionContext,
    new Detect(os, extensionContext.storagePath),
    new ComposeGitHubReleases(octokit),
    os,
    podmanComposeGenerator,
  );
  await composeExtension.activate();
}

export async function deactivate(): Promise<void> {
  if (composeExtension) {
    await composeExtension.deactivate();
  }
}
