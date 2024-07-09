/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { getSystemBinaryPath, installBinaryToSystem } from './cli-run';
import type { ComposeGithubReleaseArtifactMetadata } from './compose-github-releases';
import { ComposeGitHubReleases } from './compose-github-releases';
import { Detect } from './detect';
import { ComposeDownload } from './download';
import * as handler from './handler';
import { OS } from './os';

let composeVersionMetadata: ComposeGithubReleaseArtifactMetadata | undefined;
let composeCliTool: extensionApi.CliTool | undefined;
let composeCliToolUpdaterDisposable: extensionApi.Disposable | undefined;
const os = new OS();

// Telemetry
let telemetryLogger: extensionApi.TelemetryLogger | undefined;

export function initTelemetryLogger(): void {
  telemetryLogger = extensionApi.env.createTelemetryLogger();
}

const composeCliName = 'docker-compose';
const composeDisplayName = 'Compose';
const composeDescription = `The Compose extension provides optional command line support for [Compose files](https://compose-spec.io/) with Podman.\n\nMore information: [Podman Desktop Documentation](https://podman-desktop.io/docs/tags/compose)`;
const imageLocation = './icon.png';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  initTelemetryLogger();

  // Check docker-compose binary has been downloaded and update both
  // the configuration setting and the context accordingly
  await handler.updateConfigAndContextComposeBinary(extensionContext);

  // Setup configuration changes if the user toggles the "Install compose system-wide" boolean
  handler.handleConfigurationChanges(extensionContext);

  // Create new classes to handle the onboarding sequence
  const octokit = new Octokit();
  const detect = new Detect(os, extensionContext.storagePath);

  const composeGitHubReleases = new ComposeGitHubReleases(octokit);
  const composeDownload = new ComposeDownload(extensionContext, composeGitHubReleases, os);

  // ONBOARDING: Command to check compose is downloaded
  const onboardingCheckDownloadCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.checkDownloadedCommand',
    async () => {
      // Check that docker-compose binary has been downloaded to the storage folder.
      // instead of checking for `docker-compose` on the command line, the most reliable way is to see
      // if we can get the pathname to the binary from the configuration
      const isDownloaded = await detect.getStoragePath();
      if (isDownloaded === '') {
        extensionApi.context.setValue('composeIsNotDownloaded', true, 'onboarding');
      } else {
        extensionApi.context.setValue('composeIsNotDownloaded', false, 'onboarding');
      }

      // EDGE CASE: Update system-wide download context in case the user has removed
      // the binary from the system path while podman-desktop is running (we only check on startup)
      await handler.updateConfigAndContextComposeBinary(extensionContext);

      // CheckDownload is the first step in the onboarding sequence,
      // we will run getLatestVersionAsset so we can show the user the latest
      // latest version of compose that is available.
      if (!isDownloaded) {
        // Get the latest version and store the metadata in a local variable
        const composeLatestVersion = await composeDownload.getLatestVersionAsset();
        // Set the value in the context to the version we're downloading so it appears in the onboarding sequence
        if (composeLatestVersion) {
          composeVersionMetadata = composeLatestVersion;
          extensionApi.context.setValue('composeDownloadVersion', composeVersionMetadata.tag, 'onboarding');
        }
      }

      // Log if it's downloaded and what version is being selected for download (can be either latest, or chosen by user)
      telemetryLogger?.logUsage('compose.onboarding.checkDownloadedCommand', {
        downloaded: isDownloaded === '' ? false : true,
        version: composeVersionMetadata?.tag,
      });
    },
  );

  // ONBOARDING; Command to download the compose binary. We will get the value that the user has "picked"
  // from the context value. This is because we have the option to either "select a version" or "download the latest"
  const onboardingDownloadComposeCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.downloadCommand',
    async () => {
      // If the version is undefined (checks weren't run, or the user didn't select a version)
      // we will just download the latest version
      if (composeVersionMetadata === undefined) {
        composeVersionMetadata = await composeDownload.getLatestVersionAsset();
      }

      let downloaded: boolean = false;
      try {
        // Download
        await composeDownload.download(composeVersionMetadata);

        // We are all done, so we can set the context value to false / downloaded to true
        extensionApi.context.setValue('composeIsNotDownloaded', false, 'onboarding');
        downloaded = true;

        // register the cli tool if necessary
        if (!composeCliTool) {
          await registerCLITool(composeDownload, detect);
        }
      } finally {
        // Make sure we log the telemetry even if we encounter an error
        // If we have downloaded the binary, we can log it as being succcessfully downloaded
        telemetryLogger?.logUsage('compose.onboarding.downloadCommand', {
          successful: downloaded,
          version: composeVersionMetadata?.tag,
        });
      }
    },
  );

  // ONBOARDING: Prompt the user for the version of Compose they want to download
  const onboardingPromptUserForVersionCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.promptUserForVersion',
    async () => {
      // Prompt the user for the verison
      const composeRelease = await composeDownload.promptUserForVersion();

      // Update the context value that this is the version we are downloading
      // we'll store both the metadata as well as version number in a sepearate context value
      if (composeRelease) {
        composeVersionMetadata = composeRelease;
        extensionApi.context.setValue('composeDownloadVersion', composeRelease.tag, 'onboarding');
      }

      // Log the telemetry that the user picked a version
      telemetryLogger?.logUsage('compose.onboarding.promptUserForVersion', {
        version: composeRelease?.tag,
      });

      // Note, we do not refresh the UI when setValue has been set, only when "when" has been updated
      // TEMPORARY FIX until we can find a better way to do this. This forces a refresh by changing the "when" evaluation
      // of the dialog so it'll refresh the composeDownloadVersion value.
      extensionApi.context.setValue('composeShowCustomDownloadDialog', true, 'onboarding');
      extensionApi.context.setValue('composeShowCustomDownloadDialog', false, 'onboarding');
    },
  );

  // ONBOARDING: Install compose system wide step
  const onboardingInstallSystemWideCommand = extensionApi.commands.registerCommand(
    'compose.onboarding.installSystemWideCommand',
    async () => {
      // This is TEMPORARY until we re-add the "Installing compose system wide" toggle again
      // We will just call the handler function directly
      let installed: boolean = false;
      try {
        await handler.installComposeBinary(detect, extensionContext);
        // update the cli version
        const versionInstalled = composeVersionMetadata?.tag.replace('v', '');
        if (!versionInstalled) {
          return;
        }
        // update the version and the path
        composeCliTool?.updateVersion({
          version: versionInstalled,
          path: getSystemBinaryPath(composeCliName),
        });
        // if installed version is the newest, dispose the updater
        const lastReleaseMetadata = await composeDownload.getLatestVersionAsset();
        if (lastReleaseMetadata.tag.replace('v', '').trim() === versionInstalled) {
          composeCliToolUpdaterDisposable?.dispose();
        }
        installed = true;
      } finally {
        telemetryLogger?.logUsage('compose.onboarding.installSystemWideCommand', {
          successful: installed,
        });
      }
    },
  );

  // Push the commands that will be used within the onboarding sequence
  extensionContext.subscriptions.push(
    onboardingCheckDownloadCommand,
    onboardingPromptUserForVersionCommand,
    onboardingDownloadComposeCommand,
    onboardingInstallSystemWideCommand,
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

  // Push the CLI tool as well (but it will do it postActivation so it does not block the activate() function)
  // Post activation
  setTimeout(() => {
    registerCLITool(composeDownload, detect).catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);
}

// Activate the CLI tool (check version, etc) and register the CLi so it does not block activation.
async function registerCLITool(composeDownload: ComposeDownload, detect: Detect): Promise<void> {
  // build executable name for current platform
  const executable = os.isWindows() ? composeCliName + '.exe' : composeCliName;

  // binary info
  let binaryInfo: { version: string; path: string; updatable?: boolean } | undefined = undefined;

  // let's check for system-wide
  const installedSystemWide = await detect.checkSystemWideDockerCompose();
  if (installedSystemWide) {
    binaryInfo = await detect.getDockerComposeBinaryInfo(executable);
  } else {
    // if not installed, let's check for local version
    const extensionExecutable = await detect.getStoragePath();
    // if local version exists
    if (extensionExecutable.length !== 0) {
      binaryInfo = await detect.getDockerComposeBinaryInfo(executable, detect.getExtensionStorageBin());
    }
  }

  // if no binary detected let's just stop here
  if (!binaryInfo) return;

  // update existing CLI tool
  if (composeCliTool) {
    composeCliTool.updateVersion({
      version: removeVersionPrefix(binaryInfo.version),
      path: binaryInfo.path,
    });
  } else {
    // Register the CLI tool so it appears in the preferences page.
    composeCliTool = extensionApi.cli.createCliTool({
      name: composeCliName,
      displayName: composeDisplayName,
      markdownDescription: composeDescription,
      images: {
        icon: imageLocation,
      },
      version: removeVersionPrefix(binaryInfo.version),
      path: binaryInfo.path,
    });
  }

  // check if there is a new version to be installed and register the updater
  const lastReleaseMetadata = await composeDownload.getLatestVersionAsset();
  const lastReleaseVersion = removeVersionPrefix(lastReleaseMetadata.tag);
  const currentVersion = removeVersionPrefix(binaryInfo.version);

  if (lastReleaseVersion !== currentVersion) {
    composeCliToolUpdaterDisposable = composeCliTool.registerUpdate({
      version: lastReleaseVersion,
      doUpdate: async _logger => {
        if (!binaryInfo?.updatable) {
          throw new Error(
            `Cannot update ${binaryInfo?.path} version ${currentVersion} to ${lastReleaseVersion} as it was not installed by podman-desktop`,
          );
        }

        // download, install system wide and update cli version
        await composeDownload.download(lastReleaseMetadata);
        // get the binary in the extension folder
        const binaryPath = await detect.getStoragePath();
        await installBinaryToSystem(binaryPath, composeCliName);
        composeCliTool?.updateVersion({
          version: lastReleaseVersion,
        });
        composeCliToolUpdaterDisposable?.dispose();
      },
    });
  }
}

function removeVersionPrefix(version: string): string {
  return version.replace('v', '').trim();
}

export async function deactivate(): Promise<void> {
  // Dispose the CLI tool
  if (composeCliTool) {
    composeCliTool.dispose();
    composeCliTool = undefined;
  }
}
