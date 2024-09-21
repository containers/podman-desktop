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

import { ContainerState } from '../model/core/states';
import type { ContainerInteractiveParams } from '../model/core/types';
import { ContainersPage } from '../model/pages/containers-page';
import { ImageDetailsPage } from '../model/pages/image-details-page';
import type { ImagesPage } from '../model/pages/images-page';
import { NavigationBar } from '../model/workbench/navigation';
import { expect as playExpect, test } from '../utility/fixtures';
import { deleteContainer, deleteImage } from '../utility/operations';
import { waitForPodmanMachineStartup, waitWhile } from '../utility/wait';

const imageToPull = 'ghcr.io/linuxcontainers/alpine';
const imageTag = 'latest';
const containerToRun = 'alpine-container';
const containerList = ['first', 'second', 'third'];
const containerStartParams: ContainerInteractiveParams = { attachTerminal: false };

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('containers-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  // wait giving a time to podman desktop to load up
  let images: ImagesPage;
  try {
    images = await new NavigationBar(page).openImages();
  } catch (error) {
    await runner.screenshot('error-on-open-images.png');
    throw error;
  }
  await waitWhile(async () => await images.pageIsEmpty(), {
    sendError: false,
    message: 'Images page is empty, there are no images present',
  });
  try {
    await deleteContainer(page, containerToRun);
  } catch (error) {
    await runner.screenshot('error-on-open-containers.png');
    throw error;
  }
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(90000);

  try {
    await deleteContainer(page, containerToRun);
    for (const container of containerList) {
      await deleteContainer(page, container);
    }

    await deleteImage(page, imageToPull);
  } finally {
    await runner.close();
  }
});

test.describe.serial('Verification of container creation workflow @smoke', () => {
  test.describe.configure({ retries: 2 });

  test(`Pulling of '${imageToPull}:${imageTag}' image`, async ({ navigationBar }) => {
    test.setTimeout(90_000);

    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(imageToPull, imageTag);

    await playExpect.poll(async () => await images.waitForImageExists(imageToPull), { timeout: 10_000 }).toBeTruthy();
  });

  test(`Start a container '${containerToRun}' from image`, async ({ navigationBar }) => {
    let images = await navigationBar.openImages();
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    const containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible();
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), { timeout: 15_000 })
      .toBeTruthy();
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => await containerDetails.getState(), { timeout: 15_000 })
      .toContain(ContainerState.Running);

    images = await navigationBar.openImages();
    playExpect(await images.getCurrentStatusOfImage(imageToPull)).toBe('USED');
  });

  test('Test navigation between pages', async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();

    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await containersDetails.backLink.click();
    await playExpect(containers.heading).toBeVisible();

    await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await containersDetails.closeButton.click();
    await playExpect(containers.heading).toBeVisible();
  });
  test('Open a container details', async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    const containerState = await containersDetails.getState();
    playExpect(containerState).toContain(ContainerState.Running);
    // check Logs output
    await containersDetails.activateTab('Logs');
    const helloWorldMessage = containersDetails.getPage().getByText('No Log');
    await playExpect(helloWorldMessage).toBeVisible();
    // Switch between various other tabs, no checking of the content
    await containersDetails.activateTab('Inspect');
    await containersDetails.activateTab('Kube');
    await containersDetails.activateTab('Terminal');
    // TODO: After updating of accessibility of various element in containers pages, we can extend test
  });
  test('Redirecting to image details from a container details', async ({ page, navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    await playExpect(containersDetails.imageLink).toBeVisible();
    await containersDetails.imageLink.click();
    const imageDetails = new ImageDetailsPage(page, imageToPull);
    await playExpect(imageDetails.heading).toBeVisible();
    await playExpect(imageDetails.heading).toContainText(imageToPull);
  });
  test('Stopping a container from Container details', async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    playExpect(await containersDetails.getState()).toContain(ContainerState.Running);
    await containersDetails.stopContainer();

    await playExpect
      .poll(async () => await containersDetails.getState(), { timeout: 30_000 })
      .toContain(ContainerState.Exited);
    await playExpect(containersDetails.startButton).toBeVisible();
  });

  test(`Start a container from the Containers page`, async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    await navigationBar.openContainers();
    await playExpect.poll(async () => await containers.containerExists(containerToRun)).toBeTruthy();

    await containers.startContainer(containerToRun);

    await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => containersDetails.getState(), { timeout: 30_000 })
      .toContain(ContainerState.Running);
  });

  test(`Stop a container from the Containers page`, async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    await navigationBar.openContainers();
    await playExpect.poll(async () => await containers.containerExists(containerToRun)).toBeTruthy();

    await containers.stopContainer(containerToRun);

    await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => containersDetails.getState(), { timeout: 30_000 })
      .toContain(ContainerState.Exited);
  });

  test('Deleting a container from Container details', async ({ navigationBar }) => {
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    const containersPage = await containersDetails.deleteContainer();
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPage.containerExists(containerToRun), { timeout: 10_000 })
      .toBeFalsy();
  });

  test(`Deleting a container from the Containers page`, async ({ navigationBar }) => {
    //re-start the container from an image
    let images = await navigationBar.openImages();
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    const containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible();
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), { timeout: 10_000 })
      .toBeTruthy();
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => await containerDetails.getState(), { timeout: 15_000 })
      .toContain(ContainerState.Running);

    images = await navigationBar.openImages();
    playExpect(await images.getCurrentStatusOfImage(imageToPull)).toBe('USED');

    //delete it from containers page
    await navigationBar.openContainers();
    const containersPage = await containers.deleteContainer(containerToRun);
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPage.containerExists(containerToRun), { timeout: 30_000 })
      .toBeFalsy();
  });

  test('Prune containers', async ({ page, navigationBar }) => {
    test.setTimeout(200_000);

    //Start 3 containers
    for (const container of containerList) {
      const images = await navigationBar.openImages();
      const containersPage = await images.startContainerWithImage(imageToPull, container, containerStartParams);
      await playExpect(containersPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15_000 })
        .toBeTruthy();
    }
    //Stop a container, prune, and repeat
    for (const container of containerList) {
      let containersPage = new ContainersPage(page);
      const containersDetails = await containersPage.stopContainerFromDetails(container);
      await playExpect
        .poll(async () => await containersDetails.getState(), { timeout: 20_000 })
        .toBe(ContainerState.Exited);
      containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();
      await containersPage.pruneContainers();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15_000 })
        .toBeFalsy();
    }

    //Start and stop 3 containers
    for (const container of containerList) {
      const images = await navigationBar.openImages();
      const containersPage = await images.startContainerWithImage(imageToPull, container, containerStartParams);
      await playExpect(containersPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15_000 })
        .toBeTruthy();
      const containersDetails = await containersPage.stopContainerFromDetails(container);
      await playExpect
        .poll(async () => await containersDetails.getState(), { timeout: 20_000 })
        .toBe(ContainerState.Exited);
    }
    //Prune the 3 stopped containers at the same time
    const containersPage = await navigationBar.openContainers();
    await playExpect(containersPage.heading).toBeVisible();
    await containersPage.pruneContainers();
    for (const container of containerList) {
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 30_000 })
        .toBeFalsy();
    }
  });
});
