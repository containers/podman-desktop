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

import * as fs from 'node:fs';
import * as path from 'node:path';

import { Octokit } from '@octokit/rest';
import type { CliTool, Logger, ProviderUpdate } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

import { getSystemBinaryPath, installBinaryToSystem } from './cli-run';
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

interface KubectlState {
  version?: string;
  path?: string;
}

// State machine for version and path
export const vpState: KubectlState = {};

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  initTelemetryLogger();
  // Check kubectl binary has been downloaded and update both
  // the configuration setting and the context accordingly
  await handler.updateConfigAndContextKubectlBinary(extensionContext);

  // Setup configuration changes if the user toggles the "Install kubectl system-wide" boolean
  handler.handleConfigurationChanges(extensionContext);

  // Create new classes to handle the onboarding sequence
  const detect = new Detect(os, extensionContext.storagePath);

  // Create the Octokit factory for GitHub authentication
  const octokitFactory = async (): Promise<Octokit> => {
    const auth = await extensionApi.authentication.getSession('github-authentication', []);
    return new Octokit({ auth: auth?.accessToken });
  };

  const kubectlGitHubReleases = new KubectlGitHubReleases(octokitFactory);
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
      kubectlVersionMetadata ??= await kubectlDownload.getLatestVersionAsset();

      let downloaded: boolean = false;
      try {
        // Download
        await kubectlDownload.download(kubectlVersionMetadata);

        // We are all done, so we can set the context value to false / downloaded to true
        extensionApi.context.setValue('kubectlIsNotDownloaded', false, 'onboarding');
        // update the cli version
        vpState.version = kubectlVersionMetadata?.tag.slice(1);
        if (!vpState.version) {
          return;
        }
        vpState.path = getSystemBinaryPath(kubectlCliName);
        // update the version and the path
        kubectlCliTool?.updateVersion({
          version: vpState.version,
          path: vpState.path,
          installationSource: 'extension',
        });
        downloaded = true;
      } finally {
        // Make sure we log the telemetry even if we encounter an error
        // If we have downloaded the binary, we can log it as being successfully downloaded
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
      // Prompt the user for the version
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
  postActivate(extensionContext, kubectlDownload, provider).catch((error: unknown) => {
    console.error('Error activating extension', error);
  });
}

interface CliFinder {
  version?: string;
  path?: string;
}

export function getStorageKubectlPath(extensionContext: extensionApi.ExtensionContext): string {
  // The location of the binary (using system path)
  return path.join(extensionContext.storagePath, 'bin', kubectlExecutableName);
}

export async function findKubeCtl(extensionContext: extensionApi.ExtensionContext): Promise<CliFinder> {
  // Retrieve the version of the binary by running exec with --client
  try {
    const result = await extensionApi.process.exec(kubectlExecutableName, [
      'version',
      '--client',
      'true',
      '-o',
      'json',
    ]);
    vpState.version = extractVersion(result.stdout);
    // grab full path for Linux and mac
    if (extensionApi.env.isLinux || extensionApi.env.isMac) {
      try {
        const { stdout: fullPath } = await extensionApi.process.exec('which', [kubectlExecutableName]);
        vpState.path = fullPath;
      } catch (err) {
        console.warn('Error getting kubectl full path', err);
      }
    } else if (extensionApi.env.isWindows) {
      // grab full path for Windows
      try {
        const { stdout: fullPath } = await extensionApi.process.exec('where', [kubectlExecutableName]);
        // remove all line break/carriage return characters from full path
        const withoutCR = fullPath.replace(/(\r\n|\n|\r)/gm, '');
        vpState.path = withoutCR;
      } catch (err) {
        console.warn('Error getting kubectl full path', err);
      }
    }

    vpState.path ??= 'kubectl';
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
      vpState.version = extractVersion(result.stdout);
      vpState.path = getStorageKubectlPath(extensionContext);
    } catch (error) {
      console.warn('Error getting kubectl version system from extension storage path', error);
    }
  }
  return { version: vpState.version, path: vpState.path };
}

// Activate the CLI tool (check version, etc) and register the CLi so it does not block activation.
async function postActivate(
  extensionContext: extensionApi.ExtensionContext,
  kubectlDownload: KubectlDownload,
  provider: extensionApi.Provider,
): Promise<void> {
  await findKubeCtl(extensionContext);

  let installationSource: extensionApi.CliToolInstallationSource | undefined;
  if (vpState.path) {
    const systemPath = getSystemBinaryPath(kubectlCliName);
    const localStorage = getStorageKubectlPath(extensionContext);
    installationSource =
      path.normalize(vpState.path) === path.normalize(systemPath) ||
      path.normalize(vpState.path) === path.normalize(localStorage)
        ? 'extension'
        : 'external';
  }

  // Register the CLI tool so it appears in the preferences page. We will detect which version is being ran by
  // checking the binary. If it exists, we will run `--version` and parse the information.
  kubectlCliTool = extensionApi.cli.createCliTool({
    name: kubectlCliName,
    displayName: kubectlCliDisplayName,
    markdownDescription: kubectlCliDescription,
    images: {
      icon: imageLocation,
    },
    version: vpState.version,
    path: vpState.path,
    installationSource,
  });

  extensionContext.subscriptions.push(kubectlCliTool);

  if (vpState.version) {
    provider.updateVersion(vpState.version);
  }

  // create and register the installer
  let releaseToInstall: KubectlGithubReleaseArtifactMetadata | undefined;
  let releaseVersionToInstall: string | undefined;
  // check if there is a new version to be installed and register the updater
  let releaseToUpdateTo: KubectlGithubReleaseArtifactMetadata | undefined;
  let releaseVersionToUpdateTo: string | undefined;
  let latestAsset: KubectlGithubReleaseArtifactMetadata | undefined;
  try {
    latestAsset = await kubectlDownload.getLatestVersionAsset();
  } catch (error: unknown) {
    console.error('Error when downloading kubectl CLI latest release information.', String(error));
  }

  let kubectlProviderUpdateDisposable: extensionApi.Disposable | undefined;
  let kubectlProviderUpdate: ProviderUpdate | undefined;

  const update = {
    version: latestAsset?.tag.slice(1) !== kubectlCliTool.version ? latestAsset?.tag.slice(1) : undefined,
    selectVersion: async (): Promise<string> => {
      const selected = await kubectlDownload.promptUserForVersion();
      releaseToUpdateTo = selected;
      releaseVersionToUpdateTo = selected.tag.slice(1);
      return releaseVersionToUpdateTo;
    },
    doUpdate: async (): Promise<void> => {
      if (!releaseToUpdateTo || !releaseVersionToUpdateTo) {
        if (latestAsset) {
          releaseToUpdateTo = latestAsset;
          releaseVersionToUpdateTo = latestAsset.tag.slice(1);
        } else {
          throw new Error(`Cannot update ${path}. No release selected.`);
        }
      }
      // download, install system wide and update cli version
      const storagePath = await kubectlDownload.download(releaseToUpdateTo);
      await installBinaryToSystem(storagePath, 'kubectl');
      kubectlCliTool?.updateVersion({
        version: releaseVersionToUpdateTo,
        installationSource: 'extension',
      });
      vpState.version = releaseVersionToUpdateTo;
      provider.updateVersion(releaseVersionToUpdateTo);
      if (releaseToUpdateTo === latestAsset) {
        delete update.version;
        kubectlProviderUpdateDisposable?.dispose();
      } else {
        update.version = latestAsset?.tag.slice(1);
        if (kubectlProviderUpdate) {
          kubectlProviderUpdate.version = latestAsset?.tag.slice(1) ?? kubectlProviderUpdate.version;
          kubectlProviderUpdateDisposable?.dispose();
          kubectlProviderUpdateDisposable = provider.registerUpdate(kubectlProviderUpdate);
        }
      }
      releaseVersionToUpdateTo = undefined;
      releaseToUpdateTo = undefined;
    },
  };

  kubectlCliToolUpdaterDisposable = kubectlCliTool.registerInstaller({
    selectVersion: async (latest?: boolean) => {
      let selected: KubectlGithubReleaseArtifactMetadata;
      if (latest) {
        selected = latestAsset ?? (await kubectlDownload.getLatestVersionAsset());
      } else {
        selected = await kubectlDownload.promptUserForVersion();
      }
      releaseToInstall = selected;
      releaseVersionToInstall = selected.tag.slice(1);
      return releaseVersionToInstall;
    },
    doInstall: async _logger => {
      if (vpState.version) {
        throw new Error(`Cannot install ${kubectlCliName}. Version ${vpState.version} is already installed.`);
      }
      if (!releaseToInstall || !releaseVersionToInstall) {
        throw new Error(`Cannot update ${kubectlCliName}. No release selected.`);
      }
      // download, install system wide and update cli version
      const storagePath = await kubectlDownload.download(releaseToInstall);
      await installBinaryToSystem(storagePath, 'kubectl');
      kubectlCliTool?.updateVersion({
        version: releaseVersionToInstall,
        installationSource: 'extension',
      });
      vpState.version = releaseVersionToInstall;
      provider.updateVersion(releaseVersionToInstall);
      if (releaseToInstall === latestAsset) {
        delete update.version;
      } else {
        update.version = latestAsset?.tag.slice(1);
      }
      releaseVersionToInstall = undefined;
      releaseToInstall = undefined;
    },
    doUninstall: async _logger => {
      if (!vpState.version) {
        throw new Error(`Cannot uninstall ${kubectlCliName}. No version detected.`);
      }

      // delete the executable stored in the storage folder
      const storagePath = getStorageKubectlPath(extensionContext);
      await deleteFile(storagePath);

      // delete the executable in the system path
      const systemPath = getSystemBinaryPath(kubectlCliName);
      await deleteFile(systemPath);

      // update the version to undefined
      vpState.version = undefined;
      provider.updateVersion();
      kubectlProviderUpdateDisposable?.dispose();
    },
  });

  extensionContext.subscriptions.push(kubectlCliToolUpdaterDisposable);

  // if the tool has been installed by the user externally desktop, it cannot be updated
  if (installationSource === 'external') {
    return;
  }

  kubectlCliToolUpdaterDisposable = kubectlCliTool.registerUpdate(update);

  extensionContext.subscriptions.push(kubectlCliToolUpdaterDisposable);

  if (update.version) {
    kubectlProviderUpdate = {
      version: update.version,
      update: async (_logger: Logger): Promise<void> => {
        releaseToUpdateTo = undefined;
        releaseVersionToUpdateTo = undefined;
        await update.doUpdate();
      },
    };
    kubectlProviderUpdateDisposable = provider.registerUpdate(kubectlProviderUpdate);
  }
}

function extractVersion(stdout: string): string {
  const versionOutput = JSON.parse(stdout) as KubectlVersionOutput;
  const version: string = versionOutput?.clientVersion?.gitVersion?.replace('v', '');
  if (version) {
    return version;
  }
  throw new Error('Cannot extract version from stdout');
}

async function deleteFile(filePath: string): Promise<void> {
  if (filePath && fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error.code === 'EACCES' || error.code === 'EPERM')
      ) {
        await deleteFileAsAdmin(filePath);
      } else {
        throw error;
      }
    }
  }
}

async function deleteFileAsAdmin(filePath: string): Promise<void> {
  const args: string[] = [filePath];
  const command = extensionApi.env.isWindows ? 'del' : 'rm';

  try {
    // Use admin privileges
    await extensionApi.process.exec(command, args, { isAdmin: true });
  } catch (error) {
    console.error(`Failed to uninstall '${filePath}': ${error}`);
    throw error;
  }
}
