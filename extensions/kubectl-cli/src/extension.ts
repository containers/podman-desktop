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

import * as path from 'node:path';

import { Octokit } from '@octokit/rest';
import type { CliTool } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

import { installBinaryToSystem } from './cli-run';
import { Detect } from './detect';
import { KubectlDownload } from './download';
import * as handler from './handler';
import type { KubectlGithubReleaseArtifactMetadata } from './kubectl-github-releases';
import { KubectlGitHubReleases } from './kubectl-github-releases';
import { OS } from './os';

interface KubectlVersionOutput {
  clientVersion: {
    major: string;
    minor: string;
    gitVersion: string;
    gitCommit: string;
    gitTreeState: string;
    buildDate: string;
    goVersion: string;
    compiler: string;
    platform: string;
  };
  kustomizeVersion: string;
}

let kubectlVersionMetadata: KubectlGithubReleaseArtifactMetadata | undefined;
let kubectlCliTool: CliTool | undefined;
let kubectlCliToolUpdaterDisposable: extensionApi.Disposable | undefined;
const os = new OS();

// Telemetry
let telemetryLogger: extensionApi.TelemetryLogger | undefined;

export function initTelemetryLogger(): void {
  telemetryLogger = extensionApi.env.createTelemetryLogger();
}

const kubectlCliName = 'kubectl';
const kubectlExecutableName = extensionApi.env.isWindows ? kubectlCliName + '.exe' : kubectlCliName;

const kubectlCliDisplayName = 'kubectl';
const kubectlCliDescription = `A command line tool for communicating with a Kubernetes cluster's control plane, using the Kubernetes API.\n\nMore information: [kubernetes.io](https://kubernetes.io/docs/reference/kubectl/)`;
const imageLocation = './icon.png';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  initTelemetryLogger();

  // Check kubectl binary has been downloaded and update both
  // the configuration setting and the context accordingly
  await handler.updateConfigAndContextKubectlBinary(extensionContext);

  // Setup configuration changes if the user toggles the "Install kubectl system-wide" boolean
  handler.handleConfigurationChanges(extensionContext);

  // Create new classes to handle the onboarding sequence
  const octokit = new Octokit();
  const detect = new Detect(os, extensionContext.storagePath);

  const kubectlGitHubReleases = new KubectlGitHubReleases(octokit);
  const kubectlDownload = new KubectlDownload(extensionContext, kubectlGitHubReleases, os);

  // ONBOARDING: Command to check kubectl is downloaded
  const onboardingCheckDownloadCommand = extensionApi.commands.registerCommand(
    'kubectl.onboarding.checkDownloadedCommand',
    async () => {
      // Check that kubectl binary has been downloaded to the storage folder.
      // instead of checking for `kubectl` on the command line, the most reliable way is to see
      // if we can get the pathname to the binary from the configuration
      const isDownloaded = await detect.getStoragePath();
      if (isDownloaded === '') {
        extensionApi.context.setValue('kubectlIsNotDownloaded', true, 'onboarding');
      } else {
        extensionApi.context.setValue('kubectlIsNotDownloaded', false, 'onboarding');
      }

      // EDGE CASE: Update system-wide download context in case the user has removed
      // the binary from the system path while podman-desktop is running (we only check on startup)
      await handler.updateConfigAndContextKubectlBinary(extensionContext);

      // CheckDownload is the first step in the onboarding sequence,
      // we will run getLatestVersionAsset so we can show the user the latest
      // latest version of kubectl that is available.
      if (!isDownloaded) {
        // Get the latest version and store the metadata in a local variable
        const kubectlLatestVersion = await kubectlDownload.getLatestVersionAsset();
        // Set the value in the context to the version we're downloading so it appears in the onboarding sequence
        if (kubectlLatestVersion) {
          kubectlVersionMetadata = kubectlLatestVersion;
          extensionApi.context.setValue('kubectlDownloadVersion', kubectlVersionMetadata.tag, 'onboarding');
        }
      }

      // Log if it's downloaded and what version is being selected for download (can be either latest, or chosen by user)
      telemetryLogger?.logUsage('kubectl.onboarding.checkDownloadedCommand', {
        downloaded: isDownloaded !== '',
        version: kubectlVersionMetadata?.tag,
      });
    },
  );

  // ONBOARDING; Command to download the kubectl binary. We will get the value that the user has "picked"
  // from the context value. This is because we have the option to either "select a version" or "download the latest"
  const onboardingDownloadKubectlCommand = extensionApi.commands.registerCommand(
    'kubectl.onboarding.downloadCommand',
    async () => {
      // If the version is undefined (checks weren't run, or the user didn't select a version)
      // we will just download the latest version
      if (kubectlVersionMetadata === undefined) {
        kubectlVersionMetadata = await kubectlDownload.getLatestVersionAsset();
      }

      let downloaded: boolean = false;
      try {
        // Download
        await kubectlDownload.download(kubectlVersionMetadata);

        // We are all done, so we can set the context value to false / downloaded to true
        extensionApi.context.setValue('kubectlIsNotDownloaded', false, 'onboarding');
        kubectlCliTool?.updateVersion({
          version: kubectlVersionMetadata.tag.slice(1),
        });
        // if installed version is the newest, dispose the updater
        const lastReleaseMetadata = await kubectlDownload.getLatestVersionAsset();
        if (lastReleaseMetadata.tag === kubectlVersionMetadata.tag) {
          kubectlCliToolUpdaterDisposable?.dispose();
        }
        downloaded = true;
      } finally {
        // Make sure we log the telemetry even if we encounter an error
        // If we have downloaded the binary, we can log it as being succcessfully downloaded
        telemetryLogger?.logUsage('kubectl.onboarding.downloadCommand', {
          successful: downloaded,
          version: kubectlVersionMetadata?.tag,
        });
      }
    },
  );

  // ONBOARDING: Prompt the user for the version of kubectl they want to download
  const onboardingPromptUserForVersionCommand = extensionApi.commands.registerCommand(
    'kubectl.onboarding.promptUserForVersion',
    async () => {
      // Prompt the user for the verison
      const kubectlRelease = await kubectlDownload.promptUserForVersion();

      // Update the context value that this is the version we are downloading
      // we'll store both the metadata as well as version number in a sepearate context value
      if (kubectlRelease) {
        kubectlVersionMetadata = kubectlRelease;
        extensionApi.context.setValue('kubectlDownloadVersion', kubectlRelease.tag, 'onboarding');
      }

      // Log the telemetry that the user picked a version
      telemetryLogger?.logUsage('kubectl.onboarding.promptUserForVersion', {
        version: kubectlRelease?.tag,
      });

      // Note, we do not refresh the UI when setValue has been set, only when "when" has been updated
      // TEMPORARY FIX until we can find a better way to do this. This forces a refresh by changing the "when" evaluation
      // of the dialog so it'll refresh the kubectlDownloadVersion value.
      extensionApi.context.setValue('kubectlShowCustomDownloadDialog', true, 'onboarding');
      extensionApi.context.setValue('kubectlShowCustomDownloadDialog', false, 'onboarding');
    },
  );

  // ONBOARDING: Install kubectl system wide step
  const onboardingInstallSystemWideCommand = extensionApi.commands.registerCommand(
    'kubectl.onboarding.installSystemWideCommand',
    async () => {
      // This is TEMPORARY until we re-add the "Installing kubectl system wide" toggle again
      // We will just call the handler function directly
      let installed: boolean = false;
      try {
        await handler.installKubectlBinary(detect, extensionContext);
        installed = true;
      } finally {
        telemetryLogger?.logUsage('kubectl.onboarding.installSystemWideCommand', {
          successful: installed,
        });
      }
    },
  );

  // Push the commands that will be used within the onboarding sequence
  extensionContext.subscriptions.push(
    onboardingCheckDownloadCommand,
    onboardingPromptUserForVersionCommand,
    onboardingDownloadKubectlCommand,
    onboardingInstallSystemWideCommand,
  );

  // Need to "ADD" a provider so we can actually press the button!
  // We set this to "unknown" so it does not appear on the dashboard (we only want it in preferences).
  const providerOptions: extensionApi.ProviderOptions = {
    name: kubectlCliDisplayName,
    id: kubectlCliDisplayName,
    status: 'unknown',
    images: {
      icon: imageLocation,
    },
  };

  providerOptions.emptyConnectionMarkdownDescription = kubectlCliDescription;

  const provider = extensionApi.provider.createProvider(providerOptions);
  extensionContext.subscriptions.push(provider);

  // Push the CLI tool as well (but it will do it postActivation so it does not block the activate() function)
  // Post activation
  setTimeout(() => {
    postActivate(extensionContext, kubectlDownload).catch((error: unknown) => {
      console.error('Error activating extension', error);
    });
  }, 0);
}

interface CliFinder {
  version: string;
  path: string;
}

export function getStorageKubectlPath(extensionContext: extensionApi.ExtensionContext): string {
  // The location of the binary (using system path)
  return path.join(extensionContext.storagePath, 'bin', kubectlExecutableName);
}

export async function findKubeCtl(extensionContext: extensionApi.ExtensionContext): Promise<CliFinder> {
  let binaryVersion = '';
  let binaryPath = '';

  // Retrieve the version of the binary by running exec with --client
  try {
    const result = await extensionApi.process.exec(kubectlExecutableName, [
      'version',
      '--client',
      'true',
      '-o',
      'json',
    ]);
    binaryVersion = extractVersion(result.stdout);

    // grab full path for Linux and mac
    if (extensionApi.env.isLinux || extensionApi.env.isMac) {
      try {
        const { stdout: fullPath } = await extensionApi.process.exec('which', [kubectlExecutableName]);
        binaryPath = fullPath;
      } catch (err) {
        console.warn('Error getting kubectl full path', err);
      }
    } else if (extensionApi.env.isWindows) {
      // grab full path for Windows
      try {
        const { stdout: fullPath } = await extensionApi.process.exec('where', [kubectlExecutableName]);
        // remove all line break/carriage return characters from full path
        const withoutCR = fullPath.replace(/(\r\n|\n|\r)/gm, '');
        binaryPath = withoutCR;
      } catch (err) {
        console.warn('Error getting kubectl full path', err);
      }
    }

    if (!binaryPath) {
      binaryPath = 'kubectl';
    }
  } catch (e) {
    console.warn(`Error getting kubectl from user PATH: ${e}, trying from extension storage path`);
    try {
      const result = await extensionApi.process.exec(getStorageKubectlPath(extensionContext), [
        'version',
        '--client',
        'true',
        '-o',
        'json',
      ]);
      binaryVersion = extractVersion(result.stdout);
      binaryPath = getStorageKubectlPath(extensionContext);
    } catch (error) {
      console.warn('Error getting kubectl version system from extension storage path', error);
    }
  }

  return { version: binaryVersion, path: binaryPath };
}

// Activate the CLI tool (check version, etc) and register the CLi so it does not block activation.
async function postActivate(
  extensionContext: extensionApi.ExtensionContext,
  kubectlDownload: KubectlDownload,
): Promise<void> {
  const { version, path } = await findKubeCtl(extensionContext);

  // Register the CLI tool so it appears in the preferences page. We will detect which version is being ran by
  // checking the binary. If it exists, we will run `--version` and parse the information.
  kubectlCliTool = extensionApi.cli.createCliTool({
    name: kubectlCliName,
    displayName: kubectlCliDisplayName,
    markdownDescription: kubectlCliDescription,
    images: {
      icon: imageLocation,
    },
    version,
    path,
  });

  // check if there is a new version to be installed and register the updater
  const lastReleaseMetadata = await kubectlDownload.getLatestVersionAsset();
  const lastReleaseVersion = lastReleaseMetadata.tag.slice(1);
  if (lastReleaseVersion !== version) {
    kubectlCliToolUpdaterDisposable = kubectlCliTool.registerUpdate({
      version: lastReleaseVersion,
      doUpdate: async _logger => {
        // download, install system wide and update cli version
        const binaryPath = await kubectlDownload.download(lastReleaseMetadata);
        await installBinaryToSystem(binaryPath, 'kubectl');
        kubectlCliTool?.updateVersion({
          version: lastReleaseVersion,
        });
        kubectlCliToolUpdaterDisposable?.dispose();
      },
    });
  }

  extensionContext.subscriptions.push(kubectlCliTool);
}

function extractVersion(stdout: string): string {
  const versionOutput = JSON.parse(stdout) as KubectlVersionOutput;
  const version: string = versionOutput?.clientVersion?.gitVersion?.replace('v', '');
  if (version) {
    return version;
  }
  throw new Error('Cannot extract version from stdout');
}
