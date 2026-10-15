/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { execSync } from 'node:child_process';

import type { Locator, Page } from '@playwright/test';
import test, { expect as playExpect } from '@playwright/test';

import { ResourceElementActions } from '/@/model/core/operations';
import { ResourceElementState } from '/@/model/core/states';
import type { PodmanVirtualizationProviders } from '/@/model/core/types';
import { matchesProviderVariant, PodmanMachinePrivileges } from '/@/model/core/types';
import { CLIToolsPage } from '/@/model/pages/cli-tools-page';
import type { DashboardPage } from '/@/model/pages/dashboard-page';
import { ExperimentalPage } from '/@/model/pages/experimental-page';
import { PreferencesPage } from '/@/model/pages/preferences-page';
import { RegistriesPage } from '/@/model/pages/registries-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { SettingsBar } from '/@/model/pages/settings-bar';
import { VolumeDetailsPage } from '/@/model/pages/volume-details-page';
import { NavigationBar } from '/@/model/workbench/navigation';
import { isLinux } from '/@/utility/platform';
import { waitUntil, waitWhile } from '/@/utility/wait';

/**
 * Stop and delete container defined by its name
 * @param page playwright's page object
 * @param name name of container to be removed
 */
export async function deleteContainer(page: Page, name: string): Promise<void> {
  return test.step(`Delete container with name ${name}`, async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    await playExpect(containers.heading).toBeVisible({ timeout: 10_000 });
    const container = await containers.getContainerRowByName(name);
    // check for container existence
    if (container === undefined) {
      console.log(`container '${name}' does not exist, skipping...`);
    } else {
      // stop container first, might not be running
      const stopButton = container.getByRole('button').and(container.getByLabel('Stop Container'));
      if ((await stopButton.count()) > 0) await stopButton.click();

      // delete the container
      const deleteButton = container.getByRole('button').and(container.getByLabel('Delete Container'));
      await deleteButton.click();
      await handleConfirmationDialog({ page, dialogTitle: 'Delete Container?', buttonName: 'Delete' });
      // wait for container to disappear
      try {
        console.log('Waiting for container to get deleted ...');
        await playExpect
          .poll(async () => await containers.getContainerRowByName(name), { timeout: 30_000 })
          .toBeFalsy();
      } catch (error) {
        if (!(error as Error).message.includes('Page is empty')) {
          throw Error(`Error waiting for container '${name}' to get removed, ${error}`);
        }
      }
    }
  });
}

/**
 * Delete image defined by its name
 * @param page playwright's page object
 * @param name name of image to be removed
 */
export async function deleteImage(page: Page, name: string): Promise<void> {
  return test.step(`Delete image ${name}`, async () => {
    const navigationBar = new NavigationBar(page);
    const images = await navigationBar.openImages();
    await playExpect(images.heading).toBeVisible({ timeout: 10_000 });
    const row = await images.getImageRowByName(name);
    if (row === undefined) {
      console.log(`image '${name}' does not exist, skipping...`);
    } else {
      const deleteButton = row.getByRole('button', { name: 'Delete Image' });
      if (await deleteButton.isEnabled()) {
        await deleteButton.click();
        await handleConfirmationDialog({ page, dialogTitle: 'Delete Image?', buttonName: 'Delete' });
      } else {
        throw Error(`Cannot delete image ${name}, because it is in use`);
      }
      // wait for image to disappear
      try {
        console.log('image deleting, waiting...');
        await waitWhile(
          async () => {
            const images = await new NavigationBar(page).openImages();
            const result = await images.getImageRowByName(name);
            return !!result;
          },
          { timeout: 10_000, sendError: false },
        );
      } catch (error) {
        if (!(error as Error).message.includes('Page is empty')) {
          throw Error(`Error waiting for image '${name}' to get removed, ${error}`);
        }
      }
    }
  });
}

export async function deleteRegistry(page: Page, name: string, failIfNotExist = false): Promise<void> {
  return test.step(`Delete registry ${name}`, async () => {
    const navigationBar = new NavigationBar(page);
    const settingsBar = await navigationBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);
    const registryRecord = await registryPage.getRegistryRowByName(name);
    await waitUntil(() => registryRecord.isVisible(), { sendError: failIfNotExist });
    if (await registryRecord.isVisible()) {
      // it might be that the record exist but there are no credentials -> it is default registry and it is empty
      // or if there is a kebab memu available
      const dropdownMenu = registryRecord.getByRole('button', { name: 'kebab menu' });
      if (await dropdownMenu.isVisible()) {
        await registryPage.removeRegistry(name);
      }
    }
  });
}

export async function createRegistryAndVerify(
  page: Page,
  url: string,
  username: string,
  pswd: string,
  registryLabel: string,
  handleUntrustedCert?: boolean,
): Promise<void> {
  return test.step('Create registry and verify', async () => {
    const navigationBar = new NavigationBar(page);
    const settingsBar = await navigationBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);
    await registryPage.createRegistry(url, username, pswd, handleUntrustedCert);
    const registryRow = await registryPage.getRegistryRowByName(registryLabel);
    await playExpect(registryRow.getByText(username)).toBeVisible({ timeout: 50_000 });
  });
}

export async function removeRegistryAndVerify(page: Page, registryLabel: string, username: string): Promise<void> {
  return test.step('Remove registry and verify', async () => {
    const navigationBar = new NavigationBar(page);
    const settingsBar = await navigationBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);
    await registryPage.removeRegistry(registryLabel);
    const registryRow = await registryPage.getRegistryRowByName(registryLabel);
    await playExpect(registryRow.getByText(username)).toBeHidden();
  });
}

export async function pushImageExpectFailure(page: Page, pushButton: Locator): Promise<string> {
  return test.step('Push image and expect failure', async () => {
    const dialog = page.getByRole('dialog', { name: 'Push image', exact: true });

    await playExpect(pushButton).toBeEnabled();
    await pushButton.click();

    await playExpect(dialog).toBeVisible({ timeout: 10_000 });

    const pushConfirmButton = dialog.getByRole('button', { name: 'Push image' });
    await playExpect(pushConfirmButton).toBeEnabled();
    await pushConfirmButton.click();

    const doneButton = dialog.getByRole('button', { name: 'Done' });
    await playExpect(doneButton).toBeEnabled({ timeout: 60_000 });

    const dialogContent = (await dialog.textContent()) ?? '';

    await doneButton.click();
    await playExpect(dialog).toBeHidden({ timeout: 10_000 });

    return dialogContent;
  });
}

export async function deletePod(page: Page, name: string, timeout = 50_000): Promise<void> {
  return test.step(`Delete pod ${name}`, async () => {
    const navigationBar = new NavigationBar(page);
    const pods = await navigationBar.openPods();
    await playExpect(pods.heading).toBeVisible({ timeout: 10_000 });
    const pod = await pods.getPodRowByName(name);
    // check if pod exists
    if (pod === undefined) {
      console.log(`pod '${name}' does not exist, skipping...`);
    } else {
      // delete the pod
      const deleteButton = pod.getByRole('button').and(pod.getByLabel('Delete Pod'));
      await deleteButton.click();
      // config delete dialog
      await handleConfirmationDialog({ page, dialogTitle: 'Delete Pod?', buttonName: 'Delete' });
      // wait for pod to disappear
      try {
        console.log('Waiting for pod to get deleted ...');
        await waitWhile(
          async () => {
            return !!(await pods.getPodRowByName(name));
          },
          { timeout: timeout },
        );
      } catch (error) {
        if (!(error as Error).message.includes('Page is empty')) {
          throw Error(`Error waiting for pod '${name}' to get removed, ${error}`);
        }
      }
    }
  });
}

/**
 * Delete network defined by its name
 * @param page playwright's page object
 * @param name name of network to be removed
 */
export async function deleteNetwork(page: Page, name: string): Promise<void> {
  return test.step(`Delete network with name ${name}`, async () => {
    const navigationBar = new NavigationBar(page);
    const networksPage = await navigationBar.openNetworks();
    await playExpect(networksPage.heading).toBeVisible({ timeout: 10_000 });
    const networkExists = await networksPage.networkExists(name);

    if (!networkExists) {
      console.log(`network '${name}' does not exist, skipping...`);
    } else {
      await networksPage.deleteNetwork(name);

      try {
        console.log('Waiting for network to get deleted ...');
        await playExpect
          .poll(async () => await networksPage.getNetworkRowByName(name), { timeout: 30_000 })
          .toBeFalsy();
      } catch (error) {
        if (!(error as Error).message.includes('Page is empty')) {
          throw Error(`Error waiting for network '${name}' to get removed, ${error}`);
        }
      }
    }
  });
}

export interface HandleConfirmationDialogOptions {
  page: Page;
  dialogTitle: string | RegExp;
  /** Button to click in the dialog. Defaults to 'Yes'. */
  buttonName?: string;
  /** If the dialog transitions to a follow-up state, click this button next. */
  followUpButton?: string;
  timeout?: number;
  signal?: AbortSignal;
}

// Handles dialog that has accessible name `dialogTitle` and either confirms or rejects it.
export async function handleConfirmationDialog({
  page,
  dialogTitle,
  buttonName = 'Yes',
  followUpButton,
  timeout = 10_000,
  signal,
}: HandleConfirmationDialogOptions): Promise<void> {
  // Note: Intentionally not wrapped in test.step to allow proper try-catch handling
  // by callers. test.step has special failure semantics that can interfere with
  // exception handling when this function is used in "try and see" patterns.
  const dialog = page.getByRole('dialog', {
    name: dialogTitle,
    ...(typeof dialogTitle === 'string' && { exact: true }),
  });
  await dialog.waitFor({ state: 'visible', timeout, signal });

  const button = dialog.getByRole('button', { name: buttonName });
  await playExpect(button).toBeEnabled({ timeout, signal });
  await button.click({ signal });

  if (followUpButton) {
    const nextButton = dialog.getByRole('button', { name: followUpButton });
    await playExpect(nextButton).toBeEnabled({ timeout, signal });
    await nextButton.click({ signal });
  }

  await dialog.waitFor({ state: 'hidden', timeout, signal });
}

/**
 * Handles optional Podman confirmation dialogs that may appear after machine operations.
 * Pass a signal to cancel early if the dialogs don't appear.
 */
export async function handlePodmanConfirmationDialogs(page: Page, signal?: AbortSignal): Promise<void> {
  try {
    await handleConfirmationDialog({ page, dialogTitle: 'Podman', signal });
    await handleConfirmationDialog({ page, dialogTitle: 'Podman', buttonName: 'OK', signal });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('Podman confirmation dialogs did not appear (aborted)');
    } else {
      console.log('No handling dialog displayed', error);
    }
  }
}

/**
 * Handles the Update Network dialog by filling DNS server fields and clicking Cancel or Update button.
 * @param page playwright's page object
 * @param networkName name of the network being updated
 * @param options optional configuration for DNS servers and action
 */
export async function handleEditNetworkDialog(
  page: Page,
  networkName: string,
  options?: {
    dnsServersToAdd?: string;
    dnsServersToRemove?: string;
    action?: 'Cancel' | 'Update';
  },
): Promise<void> {
  return test.step(`Handle Update Network dialog for: ${networkName}`, async () => {
    const dialogTitle = `Update Network ${networkName}`;
    const updateDialog = page.getByRole('dialog', { name: dialogTitle });
    await playExpect(updateDialog).toBeVisible();

    // Get the two input fields (both have placeholder "8.8.8.8 1.1.1.1")
    const inputFields = updateDialog.getByPlaceholder('8.8.8.8 1.1.1.1');
    const dnsServersToAddInput = inputFields.nth(0);
    const dnsServersToRemoveInput = inputFields.nth(1);

    const cancelButton = updateDialog.getByRole('button', { name: 'Cancel', exact: true });
    const updateButton = updateDialog.getByRole('button', { name: 'Update', exact: true });

    if (options?.dnsServersToAdd !== undefined) {
      await dnsServersToAddInput.clear();
      await playExpect(dnsServersToAddInput).toHaveValue('');

      await dnsServersToAddInput.fill(options.dnsServersToAdd);
      await playExpect(dnsServersToAddInput).toHaveValue(options.dnsServersToAdd);
    }

    if (options?.dnsServersToRemove !== undefined) {
      await dnsServersToRemoveInput.clear();
      await playExpect(dnsServersToRemoveInput).toHaveValue('');

      await dnsServersToRemoveInput.fill(options.dnsServersToRemove);
      await playExpect(dnsServersToRemoveInput).toHaveValue(options.dnsServersToRemove);
    }

    const action = options?.action ?? 'Update';
    if (action === 'Cancel') {
      await playExpect(cancelButton).toBeEnabled();
      await cancelButton.click();
    } else {
      await playExpect(updateButton).toBeEnabled();
      await updateButton.click();
    }

    await playExpect(updateDialog).not.toBeVisible();
  });
}

/**
 * Async function that stops and deletes Podman Machine through Settings -> Resources page
 * @param page playwright's page object
 * @param machineVisibleName Name of the Podman Machine to delete
 */
export async function deletePodmanMachine(page: Page, machineVisibleName: string): Promise<void> {
  return test.step('Delete Podman machine', async () => {
    const RESOURCE_NAME: string = 'podman';

    // Navigate to resources page
    const navigationBar = new NavigationBar(page);
    const dashboardPage = await navigationBar.openDashboard();
    await playExpect(dashboardPage.heading).toBeVisible();

    const settingsBar = await navigationBar.openSettings();
    const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
    await playExpect(resourcesPage.heading).toBeVisible({ timeout: 10_000 });

    await playExpect
      .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), { timeout: 15_000 })
      .toBeTruthy();

    const podmanResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineVisibleName);
    await playExpect(podmanResourceCard.providerConnections).toBeVisible({ timeout: 10_000 });

    // Wait for resource element to be visible
    const isResourceVisible = await waitUntil(async () => await podmanResourceCard.resourceElement.isVisible(), {
      timeout: 30_000,
    })
      .then(() => true)
      .catch(() => false);

    if (!isResourceVisible) {
      console.log(`Podman machine [${machineVisibleName}] not present, skipping deletion.`);
      return;
    }

    // Ensure connection actions and status are visible
    await playExpect(podmanResourceCard.resourceElementConnectionActions).toBeVisible();
    await playExpect(podmanResourceCard.resourceElementConnectionStatus).toBeVisible();

    // Handle machine state and stop if needed
    await ensurePodmanMachineStopped(podmanResourceCard, machineVisibleName);

    // Delete the machine
    await podmanResourceCard.performConnectionAction(ResourceElementActions.Delete);
    await playExpect(podmanResourceCard.resourceElement).toBeHidden({ timeout: 60_000 });
  });
}

async function ensurePodmanMachineStopped(
  podmanResourceCard: ResourceConnectionCardPage,
  machineVisibleName: string,
): Promise<void> {
  const currentStatus = await podmanResourceCard.resourceElementConnectionStatus.innerText();

  if (currentStatus === ResourceElementState.Off) {
    console.log('Podman machine already stopped');
    return;
  }

  // Handle Starting state - use CLI immediately
  if (currentStatus === ResourceElementState.Starting) {
    console.log('Podman machine is starting, will stop via CLI');
    await stopPodmanMachineViaCLI(machineVisibleName);
    await waitForPodmanMachineStoppedState(podmanResourceCard);
    return;
  }

  // Handle Running state - try UI first, fallback to CLI
  if (currentStatus === ResourceElementState.Running) {
    try {
      await podmanResourceCard.performConnectionAction(ResourceElementActions.Stop);
      await waitForPodmanMachineStoppedState(podmanResourceCard);
    } catch (error) {
      console.log(
        'Podman machine stop via UI failed, trying CLI:',
        error instanceof Error ? error.message : String(error),
      );
      await stopPodmanMachineViaCLI(machineVisibleName);
      await waitForPodmanMachineStoppedState(podmanResourceCard);
    }
  }
}

async function stopPodmanMachineViaCLI(machineVisibleName: string): Promise<void> {
  // eslint-disable-next-line sonarjs/os-command, n/no-sync
  const stopOutput = execSync(`podman machine stop ${machineVisibleName}`).toString();
  console.log(`podman machine stop output: ${stopOutput}`);
}

async function waitForPodmanMachineStoppedState(podmanResourceCard: ResourceConnectionCardPage): Promise<void> {
  await playExpect(podmanResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
    timeout: 30_000,
  });
}

export async function getVolumeNameForContainer(page: Page, containerName: string): Promise<string> {
  return test.step('Get volume name for container', async () => {
    let volumeName: string | null;
    let volumeSummaryContent: string[];
    try {
      const navigationBar = new NavigationBar(page);
      const volumePage = await navigationBar.openVolumes();
      await playExpect(volumePage.heading).toBeVisible({ timeout: 10_000 });
      const rows = await volumePage.getAllTableRows();

      for (let i = rows.length - 1; i > 0; i--) {
        volumeName = await rows[i].getByRole('cell').nth(3).getByRole('button').textContent();
        if (volumeName) {
          const volumeDetails = await volumePage.openVolumeDetails(volumeName);
          await volumeDetails.activateTab(VolumeDetailsPage.SUMMARY_TAB);
          volumeSummaryContent = await volumeDetails.tabContent.allTextContents();
          for (const content of volumeSummaryContent) {
            if (content.includes(containerName)) {
              await volumeDetails.backLink.click();
              return volumeName;
            }
          }
          await volumeDetails.backLink.click();
        }
      }
      return '';
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Page is empty, there is no content' || error.message.includes('does not exist'))
      ) {
        return '';
      }
      throw error;
    }
  });
}

export async function ensureCliInstalled(page: Page, resourceName: string, timeout = 60_000): Promise<void> {
  return test.step(`Ensure ${resourceName} CLI is installed`, async () => {
    const cliToolsPage = new CLIToolsPage(page);
    await playExpect(cliToolsPage.toolsTable).toBeVisible({ timeout: 10_000 });
    await playExpect.poll(async () => await cliToolsPage.toolsTable.count()).toBeGreaterThan(0);
    await playExpect(cliToolsPage.getToolRow(resourceName)).toBeVisible({ timeout: 10_000 });

    if (!(await cliToolsPage.getCurrentToolVersion(resourceName))) {
      await cliToolsPage.installTool(resourceName, timeout);
    }

    await playExpect
      .poll(async () => await cliToolsPage.getCurrentToolVersion(resourceName), { timeout: timeout })
      .toBeTruthy();
  });
}

export async function createPodmanMachineFromCLI(): Promise<void> {
  return test.step('Create Podman machine from CLI', async () => {
    if (isLinux) return;

    const podmanMachineMode = process.env.PODMAN_ROOTFUL === '0' ? '' : '--rootful';
    const userModeNetworking = process.env.PODMAN_NETWORKING === '1' ? '--user-networking' : '';

    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path, sonarjs/os-command, n/no-sync
      const initOutput = execSync(`podman machine init ${podmanMachineMode} ${userModeNetworking}`).toString();
      console.log(`podman machine init output: ${initOutput}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('VM already exists')) {
        console.log('Podman machine already exists, skipping creation.');
      }
    }

    try {
      // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
      const startOutput = execSync('podman machine start').toString();
      console.log(`podman machine start output: ${startOutput}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already running')) {
        console.log('Default podman machine already started, skipping start.');
      }
    }
  });
}

export async function deletePodmanMachineFromCLI(podmanMachineName: string): Promise<void> {
  return test.step('Delete Podman machine from CLI', () => {
    try {
      // eslint-disable-next-line sonarjs/os-command, n/no-sync
      const rmOutput = execSync(`podman machine rm ${podmanMachineName} -f`).toString();
      console.log(`podman machine rm output: ${rmOutput}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('VM does not exist')) {
        console.log(`Podman machine [${podmanMachineName}] does not exist, skipping deletion.`);
      }
    }
  });
}

export async function resetPodmanMachinesFromCLI(): Promise<void> {
  return test.step('Reset Podman machine from CLI', () => {
    // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
    execSync('podman machine reset -f');
    console.log('podman machine reset completed successfully');
  });
}

export async function fillTextbox(textbox: Locator, text: string): Promise<void> {
  return test.step(`Fill textbox with ${text}`, async () => {
    await playExpect(textbox).toBeVisible({ timeout: 15_000 });
    await textbox.fill(text);
    await playExpect(textbox).toHaveValue(text);
  });
}

export async function runComposeUpFromCLI(composeFilePath: string): Promise<void> {
  return test.step('Run Compose up from CLI', async () => {
    try {
      // eslint-disable-next-line sonarjs/os-command, n/no-sync
      const composeOutput = execSync(`podman compose -f ${composeFilePath} up -d`).toString();
      console.log(`podman compose up output: ${composeOutput}`);
    } catch (error) {
      throw new Error(`Error running podman compose up from CLI: ${error}`);
    }
  });
}

export async function removeAllImagesCLI(engine: 'podman' | 'docker' = 'podman', timeout = 120_000): Promise<void> {
  return test.step(`Remove all ${engine} images via CLI`, () => {
    if (process.env.CI !== 'true') {
      console.log(`Skipping ${engine} image cleanup (CI is not set to true)`);
      return;
    }

    try {
      const command = engine === 'podman' ? 'podman rmi --all --force' : 'docker image prune --all --force';
      // eslint-disable-next-line sonarjs/os-command, n/no-sync
      const rmiOutput = execSync(command, { timeout }).toString();
      console.log(`${engine} image removal output: ${rmiOutput}`);
    } catch (error) {
      console.log(
        `No ${engine} images to remove or command not available:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  });
}

export async function ensureNoImagesPresentCLI(page: Page): Promise<void> {
  return test.step('Ensure no images are present', async () => {
    if (process.env.CI !== 'true') {
      console.log('Skipping image cleanup and validation (CI is not set to true)');
      return;
    }

    await removeAllImagesCLI('podman');
    await removeAllImagesCLI('docker');

    const navigationBar = new NavigationBar(page);
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();
    await playExpect.poll(async () => await imagesPage.countRowsFromTable(), { timeout: 30_000 }).toBe(0);
  });
}

export async function untagImagesFromPodman(name: string, tag = ''): Promise<void> {
  return test.step('Untag images from Podman', async () => {
    try {
      const command = tag ? `podman untag ${name}:${tag}` : `podman untag ${name}`;
      // eslint-disable-next-line sonarjs/os-command, n/no-sync
      const untagOutput = execSync(command).toString();
      console.log(`podman untag output: ${untagOutput}`);
    } catch (error) {
      throw new Error(`Error untagging images from Podman: ${error}`);
    }
  });
}

export async function setDockerCompatibilityFeature(page: Page, enable: boolean): Promise<void> {
  //Open the preferences bar and verify DC preferences page
  const settingsBar = new SettingsBar(page);

  if (await settingsBar.preferencesTab.isHidden()) {
    //Open settings if not opened already
    const navigationBar = new NavigationBar(page);
    await navigationBar.openSettings();
  }

  await settingsBar.expandPreferencesTab();

  const DCPreferencesLink = settingsBar.getLinkLocatorByHref('/preferences/default/preferences.dockerCompatibility');
  await playExpect(DCPreferencesLink).toBeVisible();
  await DCPreferencesLink.click();
  const DCPreferencesPage = new PreferencesPage(page);

  await playExpect(DCPreferencesPage.heading).toBeVisible();
  const experimentalTitle = DCPreferencesPage.content.getByText('Docker Compatibility', { exact: true });
  await playExpect(experimentalTitle).toBeVisible();

  //Set the feature
  const dockerCompatibilityCheckbox = DCPreferencesPage.content.getByRole('checkbox', {
    name: 'Enable the section for Docker compatibility.',
  });
  await playExpect(dockerCompatibilityCheckbox).toBeVisible();
  const isEnabled = await dockerCompatibilityCheckbox.isChecked();
  if (isEnabled !== enable) {
    await dockerCompatibilityCheckbox.locator('..').setChecked(enable);
    const isEnabled = await dockerCompatibilityCheckbox.isChecked();
    playExpect(isEnabled).toEqual(enable);
  }

  //Verify the main docker compatibility page (dis)appeared
  const DCSettingsLink = settingsBar.getLinkLocatorByHref('/preferences/docker-compatibility');
  if (enable) {
    await playExpect(DCSettingsLink).toBeVisible();
  } else {
    await playExpect(DCSettingsLink).not.toBeVisible();
  }

  //Close the preferences bar
  await settingsBar.collapsePreferencesTab();
}

export async function setStatusBarProvidersFeature(
  page: Page,
  navigationBar: NavigationBar,
  enable: boolean,
): Promise<void> {
  await navigationBar.openSettings();
  const settingsBar = new SettingsBar(page);
  const experimentalPage = await settingsBar.openTabPage(ExperimentalPage);
  await experimentalPage.setExperimentalCheckbox(experimentalPage.statusBarProvidersCheckbox, enable);
}

export async function setEnhancedDashboardFeature(
  page: Page,
  navigationBar: NavigationBar,
  enable: boolean,
): Promise<void> {
  await navigationBar.openSettings();
  const settingsBar = new SettingsBar(page);
  const experimentalPage = await settingsBar.openTabPage(ExperimentalPage);
  await experimentalPage.setExperimentalCheckbox(experimentalPage.enhancedDashboardCheckbox, enable);
}

export async function waitForDashboardState(navigationBar: NavigationBar, enable: boolean): Promise<DashboardPage> {
  // Assets in the dashboard take a bit to load, poll until they do.
  // If the enhanced dashboard feature is enabled -> systemOverviewButton is expected.
  // If the enhanced dashboard feature is disabled -> podmanProvider card is expected.
  const getExpectedElement = (dashboard: DashboardPage): Locator =>
    enable ? dashboard.systemOverviewButton : dashboard.podmanProvider;
  let dashboardPage!: DashboardPage;
  await playExpect
    .poll(
      async () => {
        dashboardPage = await navigationBar.openDashboard();
        if (await getExpectedElement(dashboardPage).isVisible()) {
          return true;
        }
        await navigationBar.openContainers();
        return false;
      },
      { timeout: 30_000 },
    )
    .toBeTruthy();
  return dashboardPage;
}

export async function readFileInVolumeFromCLI(volumeName: string, fileName: string): Promise<string> {
  return test.step('Read file in volume from CLI', async () => {
    try {
      // Use a temporary container to read the file directly from the volume.
      // This avoids platform-specific path resolution and SSH access issues
      // (e.g., rootful vs rootless paths, HyperV admin context, CI runner environments).
      const command = `podman run --rm -v ${volumeName}:/volume-read:ro alpine cat /volume-read/${fileName}`;

      // eslint-disable-next-line sonarjs/os-command, n/no-sync
      const output = execSync(command).toString();
      console.log(`readFileInVolume output: ${output}`);
      return output;
    } catch (error) {
      throw new Error(`Error reading file: ${fileName} in volume: ${volumeName} from CLI: ${error}`);
    }
  });
}

/**
 * Verifies that a Podman machine has the specified virtualization provider type.
 * This method checks that the machine card exists and displays the correct connection type.
 *
 * @param resourceConnectionCardPage - The resource connection card page to verify
 * @param virtualizationProvider - The expected virtualization provider type (e.g., PodmanVirtualizationProviders.WSL, PodmanVirtualizationProviders.HyperV...)
 * @returns A Promise that resolves when the verification is complete
 * @throws Will throw an error if the expected virtualization provider is not found or doesn't match
 */
export async function verifyVirtualizationProvider(
  resourceConnectionCardPage: ResourceConnectionCardPage,
  virtualizationProvider: PodmanVirtualizationProviders,
): Promise<void> {
  return test.step(`Verify Podman Provider is ${virtualizationProvider}`, async () => {
    await playExpect
      .poll(async () => await resourceConnectionCardPage.doesResourceElementExist(), { timeout: 15_000 })
      .toBeTruthy();
    // Check against all possible variants to handle version differences
    const connectionTypeText = await resourceConnectionCardPage.connectionType.textContent();
    if (!connectionTypeText) {
      throw new Error('Connection type text is empty');
    }
    const matchesVariant = matchesProviderVariant(virtualizationProvider, connectionTypeText);
    playExpect(matchesVariant).toBeTruthy();
  });
}

/**
 * Verifies that a Podman machine has the specified machine privileges (rootful or rootless).
 * This method checks that the machine card exists and displays the correct machine privileges.
 *
 * @param resourceConnectionCardPage - The resource connection card page to verify
 * @param machinePrivileges - The expected machine privileges (e.g., PodmanMachinePrivileges.Rootful, PodmanMachinePrivileges.Rootless)
 * @returns A Promise that resolves when the verification is complete
 * @throws Will throw an error if the expected machine privileges are not found or doesn't match
 */
export async function verifyMachinePrivileges(
  resourceConnectionCardPage: ResourceConnectionCardPage,
  machinePrivileges: PodmanMachinePrivileges,
): Promise<void> {
  return test.step(`Verify Podman Machine Privileges are ${machinePrivileges === PodmanMachinePrivileges.Rootful ? 'rootful' : 'rootless'}`, async () => {
    await playExpect
      .poll(async () => await resourceConnectionCardPage.doesResourceElementExist(), { timeout: 15_000 })
      .toBeTruthy();
    await playExpect(resourceConnectionCardPage.machinePrivileges).toContainText(machinePrivileges, {
      ignoreCase: true,
    });
  });
}

/**
 * Parses a version string into an array of numeric components.
 * Handles versions like "5.7.0", "5.7", "6.0", "5.4.1"
 * @param version - Version string to parse
 * @returns Array of numeric version components [major, minor, patch]
 */
function parseVersion(version: string): number[] {
  return version.split('.').map(part => Number.parseInt(part, 10));
}

/**
 * Compares two version arrays to determine if the first is >= the second.
 * @param current - Current version components array
 * @param reference - Reference version components array
 * @returns true if current >= reference
 */
function compareVersions(current: number[], reference: number[]): boolean {
  console.log(`Current podman CLI version: ${current.join('.')}`);
  console.log(`Reference podman CLI version: ${reference.join('.')}`);

  const maxLength = Math.max(current.length, reference.length);

  for (let i = 0; i < maxLength; i++) {
    const currentPart = current[i] ?? 0;
    const referencePart = reference[i] ?? 0;

    if (currentPart > referencePart) {
      return true;
    }
    if (currentPart < referencePart) {
      return false;
    }
  }

  return true; // versions are equal
}

/**
 * Gets the current Podman CLI version by running `podman -v`.
 * @returns The version string (e.g., "5.7.0")
 * @throws Error if the version cannot be determined
 */
export function getPodmanCliVersion(): string {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
    const output = execSync('podman -v').toString().trim();
    // Output format: "podman version 5.7.0"
    const versionRegex = /podman version (\d+(?:\.\d+)*)/i;
    const match = versionRegex.exec(output);
    if (!match?.[1]) {
      throw new Error(`Unable to parse Podman version from output: ${output}`);
    }
    return match[1];
  } catch (error) {
    throw new Error(`Failed to get Podman CLI version: ${error}`);
  }
}

/**
 * Checks if the installed Podman CLI version is equal to or greater than the reference version.
 * @param referenceVersion - The minimum required version (e.g., "5.7.0", "5.7", "6.0")
 * @returns true if the installed version is >= the reference version, false if podman is not available or version cannot be determined
 */
export function isPodmanCliVersionAtLeast(referenceVersion: string): boolean {
  try {
    const currentVersion = getPodmanCliVersion();
    const currentVersionArray = parseVersion(currentVersion);
    const referenceVersionArray = parseVersion(referenceVersion);

    return compareVersions(currentVersionArray, referenceVersionArray);
  } catch {
    // If podman is not available or version cannot be determined, return false
    return false;
  }
}
