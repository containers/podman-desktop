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

import { execSync } from 'node:child_process';

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { ResourceElementActions } from '../model/core/operations';
import { ResourceElementState } from '../model/core/states';
import type { KindClusterOptions } from '../model/core/types';
import { CLIToolsPage } from '../model/pages/cli-tools-page';
import { CreateKindClusterPage } from '../model/pages/create-kind-cluster-page';
import { RegistriesPage } from '../model/pages/registries-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { VolumeDetailsPage } from '../model/pages/volume-details-page';
import { NavigationBar } from '../model/workbench/navigation';
import { StatusBar } from '../model/workbench/status-bar';
import { waitUntil, waitWhile } from './wait';

/**
 * Stop and delete container defined by its name
 * @param page playwright's page object
 * @param name name of container to be removed
 */
export async function deleteContainer(page: Page, name: string): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const containers = await navigationBar.openContainers();
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
    await handleConfirmationDialog(page);
    // wait for container to disappear
    try {
      console.log('Waiting for container to get deleted ...');
      await playExpect.poll(async () => await containers.getContainerRowByName(name), { timeout: 30000 }).toBeFalsy();
    } catch (error) {
      if (!(error as Error).message.includes('Page is empty')) {
        throw Error(`Error waiting for container '${name}' to get removed, ${error}`);
      }
    }
  }
}

/**
 * Delete image defined by its name
 * @param page playwright's page object
 * @param name name of image to be removed
 */
export async function deleteImage(page: Page, name: string): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const images = await navigationBar.openImages();
  const row = await images.getImageRowByName(name);
  if (row === undefined) {
    console.log(`image '${name}' does not exist, skipping...`);
  } else {
    const deleteButton = row.getByRole('button', { name: 'Delete Image' });
    if (await deleteButton.isEnabled({ timeout: 2000 })) {
      await deleteButton.click();
      await handleConfirmationDialog(page);
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
        { timeout: 10000, sendError: false },
      );
    } catch (error) {
      if (!(error as Error).message.includes('Page is empty')) {
        throw Error(`Error waiting for image '${name}' to get removed, ${error}`);
      }
    }
  }
}

export async function deleteRegistry(page: Page, name: string, failIfNotExist = false): Promise<void> {
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
}

export async function deletePod(page: Page, name: string): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const pods = await navigationBar.openPods();
  const pod = await pods.getPodRowByName(name);
  // check if pod exists
  if (pod === undefined) {
    console.log(`pod '${name}' does not exist, skipping...`);
  } else {
    // delete the pod
    const deleteButton = pod.getByRole('button').and(pod.getByLabel('Delete Pod'));
    await deleteButton.click();
    // config delete dialog
    await handleConfirmationDialog(page);
    // wait for pod to disappear
    try {
      console.log('Waiting for pod to get deleted ...');
      await waitWhile(
        async () => {
          return !!(await pods.getPodRowByName(name));
        },
        { timeout: 20000 },
      );
    } catch (error) {
      if (!(error as Error).message.includes('Page is empty')) {
        throw Error(`Error waiting for pod '${name}' to get removed, ${error}`);
      }
    }
  }
}

// Handles dialog that has accessible name `dialogTitle` and either confirms or rejects it.
export async function handleConfirmationDialog(
  page: Page,
  dialogTitle = 'Confirmation',
  confirm = true,
  confirmationButton = 'Yes',
  cancelButton = 'Cancel',
): Promise<void> {
  // wait for dialog to appear using waitFor
  const dialog = page.getByRole('dialog', { name: dialogTitle, exact: true });
  await playExpect(dialog).toBeVisible();
  const button = confirm
    ? dialog.getByRole('button', { name: confirmationButton })
    : dialog.getByRole('button', { name: cancelButton });
  await playExpect(button).toBeEnabled();
  await button.click();
}

/**
 * Async function that stops and deletes Podman Machine through Settings -> Resources page
 * @param page playwright's page object
 * @param machineVisibleName Name of the Podman Machine to delete
 */
export async function deletePodmanMachine(page: Page, machineVisibleName: string): Promise<void> {
  const RESOURCE_NAME: string = 'podman';
  const navigationBar = new NavigationBar(page);
  const dashboardPage = await navigationBar.openDashboard();
  await playExpect(dashboardPage.heading).toBeVisible();
  const settingsBar = await navigationBar.openSettings();
  const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
  await playExpect
    .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), { timeout: 10000 })
    .toBeTruthy();
  const podmanResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineVisibleName);
  await playExpect(podmanResourceCard.providerConnections).toBeVisible({ timeout: 10_000 });
  await waitUntil(
    async () => {
      return await podmanResourceCard.resourceElement.isVisible();
    },
    { timeout: 15000 },
  );
  if (await podmanResourceCard.resourceElement.isVisible()) {
    await playExpect(podmanResourceCard.resourceElementConnectionActions).toBeVisible({ timeout: 3000 });
    await playExpect(podmanResourceCard.resourceElementConnectionStatus).toBeVisible({ timeout: 3000 });
    if ((await podmanResourceCard.resourceElementConnectionStatus.innerText()) === ResourceElementState.Starting) {
      console.log('Podman machine is in starting currently, will send stop command via CLI');
      // eslint-disable-next-line sonarjs/os-command
      execSync(`podman machine stop ${machineVisibleName}`);
      await playExpect(podmanResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
        timeout: 30_000,
      });
      console.log('Podman machine stopped via CLI');
    }
    if ((await podmanResourceCard.resourceElementConnectionStatus.innerText()) === ResourceElementState.Running) {
      await podmanResourceCard.performConnectionAction(ResourceElementActions.Stop);
      await playExpect(podmanResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
        timeout: 30_000,
      });
    }
    await podmanResourceCard.performConnectionAction(ResourceElementActions.Delete);
    await playExpect(podmanResourceCard.resourceElement).toBeHidden({ timeout: 30_000 });
  } else {
    console.log(`Podman machine [${machineVisibleName}] not present, skipping deletion.`);
  }
}

export async function getVolumeNameForContainer(page: Page, containerName: string): Promise<string | undefined> {
  try {
    const navigationBar = new NavigationBar(page);
    const volumePage = await navigationBar.openVolumes();
    const rows = await volumePage.getAllTableRows();
    for (let i = rows.length - 1; i > 0; i--) {
      const volumeName = await rows[i].getByRole('cell').nth(3).getByRole('button').textContent();
      if (volumeName) {
        const volumeDetails = await volumePage.openVolumeDetails(volumeName);
        await volumeDetails.activateTab(VolumeDetailsPage.SUMMARY_TAB);
        const volumeSummaryContent = await volumeDetails.tabContent.allTextContents();
        for (const content of volumeSummaryContent) {
          if (content.includes(containerName)) {
            await volumeDetails.backLink.click();
            return volumeName;
          }
        }
        await volumeDetails.backLink.click();
      }
    }
    return undefined;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === 'Page is empty, there is no content' || error.message.includes('does not exist'))
    ) {
      return undefined;
    } else {
      throw error;
    }
  }
}

export async function ensureKindCliInstalled(page: Page, timeout = 60000): Promise<void> {
  const cliToolsPage = new CLIToolsPage(page);
  await playExpect(cliToolsPage.toolsTable).toBeVisible({ timeout: 10000 });
  await playExpect.poll(async () => await cliToolsPage.toolsTable.count()).toBeGreaterThan(0);
  await playExpect(cliToolsPage.getToolRow('Kind')).toBeVisible();

  if (!(await cliToolsPage.getCurrentToolVersion('Kind'))) {
    await cliToolsPage.installTool('Kind');
  }

  await playExpect
    .poll(async () => await cliToolsPage.getCurrentToolVersion('Kind'), { timeout: timeout })
    .toBeTruthy();
}

export async function createKindCluster(
  page: Page,
  clusterName: string,
  usedefaultOptions: boolean,
  timeout: number = 200000,
  { providerType, httpPort, httpsPort, useIngressController, containerImage }: KindClusterOptions = {},
): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const statusBar = new StatusBar(page);
  const kindResourceCard = new ResourceConnectionCardPage(page, 'kind');
  const createKindClusterPage = new CreateKindClusterPage(page);

  const settingsPage = await navigationBar.openSettings();
  const resourcesPage = await settingsPage.openTabPage(ResourcesPage);
  await playExpect.poll(async () => resourcesPage.resourceCardIsVisible('kind')).toBeTruthy();
  await playExpect(kindResourceCard.markdownContent).toBeVisible();
  await playExpect(kindResourceCard.createButton).toBeVisible();
  await kindResourceCard.createButton.click();
  if (usedefaultOptions) {
    await createKindClusterPage.createClusterDefault(clusterName, timeout);
  } else {
    await createKindClusterPage.createClusterParametrized(
      clusterName,
      {
        providerType: providerType,
        httpPort: httpPort,
        httpsPort: httpsPort,
        useIngressController: useIngressController,
        containerImage: containerImage,
      },
      timeout,
    );
  }
  await playExpect(kindResourceCard.resourceElement).toBeVisible();
  await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
    timeout: 15000,
  });
  await statusBar.validateKubernetesContext(`kind-${clusterName}`);
}

export async function deleteKindCluster(
  page: Page,
  containerName: string = 'kind-cluster-control-plane',
): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const kindResourceCard = new ResourceConnectionCardPage(page, 'kind');

  await navigationBar.openSettings();
  await kindResourceCard.performConnectionAction(ResourceElementActions.Stop);
  await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
    timeout: 50000,
  });
  await kindResourceCard.performConnectionAction(ResourceElementActions.Delete);
  await playExpect(kindResourceCard.markdownContent).toBeVisible({ timeout: 50000 });
  const containersPage = await navigationBar.openContainers();
  await playExpect.poll(async () => containersPage.containerExists(containerName), { timeout: 10000 }).toBeFalsy();

  await playExpect
    .poll(async () => await getVolumeNameForContainer(page, containerName), { timeout: 20000 })
    .toBeFalsy();
}
