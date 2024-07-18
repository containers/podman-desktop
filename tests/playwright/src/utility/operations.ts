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

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import type { TaskResult } from 'vitest';

import { RegistriesPage } from '../model/pages/registries-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { ResourcesPodmanConnections } from '../model/pages/resources-podman-connections-page';
import { NavigationBar } from '../model/workbench/navigation';
import type { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
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
      await playExpect.poll(async () => await containers.getContainerRowByName(name), { timeout: 10000 }).toBeFalsy();
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
  await dialog.waitFor({ state: 'visible', timeout: 3000 });
  const button = confirm
    ? dialog.getByRole('button', { name: confirmationButton })
    : dialog.getByRole('button', { name: cancelButton });
  await button.click();
}

/**
 * Async function that stops and deletes Podman Machine through Settings -> Resources page
 * @param page playwright's page object
 * @param machineVisibleName Name of the Podman Machine to delete
 */
export async function deletePodmanMachine(page: Page, machineVisibleName: string): Promise<void> {
  const navigationBar = new NavigationBar(page);
  const dashboardPage = await navigationBar.openDashboard();
  await playExpect(dashboardPage.mainPage).toBeVisible({ timeout: 3000 });
  const settingsBar = await navigationBar.openSettings();
  const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
  await playExpect(resourcesPage.podmanResources).toBeVisible({ timeout: 10_000 });
  const resourcesPodmanConnections = new ResourcesPodmanConnections(page, machineVisibleName);
  await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: 10_000 });
  await waitUntil(
    async () => {
      return await resourcesPodmanConnections.podmanMachineElement.isVisible();
    },
    { timeout: 15000 },
  );
  if (await resourcesPodmanConnections.podmanMachineElement.isVisible()) {
    await playExpect(resourcesPodmanConnections.machineConnectionActions).toBeVisible({ timeout: 3000 });
    await playExpect(resourcesPodmanConnections.machineConnectionStatus).toBeVisible({ timeout: 3000 });
    if ((await resourcesPodmanConnections.machineConnectionStatus.innerText()) === 'RUNNING') {
      await playExpect(resourcesPodmanConnections.machineStopButton).toBeVisible({ timeout: 3000 });
      await resourcesPodmanConnections.machineStopButton.click();
      await playExpect(resourcesPodmanConnections.machineConnectionStatus).toHaveText('OFF', { timeout: 30_000 });
    }
    await playExpect(resourcesPodmanConnections.machineDeleteButton).toBeVisible({ timeout: 3000 });
    await waitWhile(() => resourcesPodmanConnections.machineDeleteButton.isDisabled(), { timeout: 10000 });
    await resourcesPodmanConnections.machineDeleteButton.click();
    await playExpect(resourcesPodmanConnections.podmanMachineElement).toBeHidden({ timeout: 30_000 });
  } else {
    console.log(`Podman machine [${machineVisibleName}] not present, skipping deletion.`);
  }
}

export function checkForFailedTest(result: TaskResult, runner: PodmanDesktopRunner): void {
  if (result.errors && result.errors.length > 0) runner.setTestPassed(false);
}
