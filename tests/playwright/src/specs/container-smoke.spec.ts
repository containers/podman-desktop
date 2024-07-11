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
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { ContainerState } from '../model/core/states';
import type { ContainerInteractiveParams } from '../model/core/types';
import { ContainersPage } from '../model/pages/containers-page';
import type { ImagesPage } from '../model/pages/images-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { deleteContainer, deleteImage } from '../utility/operations';
import { waitForPodmanMachineStartup, waitWhile } from '../utility/wait';

let pdRunner: PodmanDesktopRunner;
let page: Page;
const imageToPull = 'ghcr.io/linuxcontainers/alpine';
const imageTag = 'latest';
const containerToRun = 'alpine-container';
const containerList = ['first', 'second', 'third'];
const containerStartParams: ContainerInteractiveParams = { attachTerminal: false };

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('containers-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  // wait giving a time to podman desktop to load up
  let images: ImagesPage;
  try {
    images = await new NavigationBar(page).openImages();
  } catch (error) {
    await pdRunner.screenshot('error-on-open-images.png');
    throw error;
  }
  await waitWhile(async () => await images.pageIsEmpty(), {
    sendError: false,
    message: 'Images page is empty, there are no images present',
  });
  try {
    await deleteContainer(page, containerToRun);
  } catch (error) {
    await pdRunner.screenshot('error-on-open-containers.png');
    throw error;
  }
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  try {
    await deleteContainer(page, containerToRun);
    for (const container of containerList) {
      await deleteContainer(page, container);
    }

    await deleteImage(page, imageToPull);
  } finally {
    await pdRunner.close();
  }
}, 90000);

describe('Verification of container creation workflow', async () => {
  test(`Pulling of '${imageToPull}:${imageTag}' image`, { retry: 2, timeout: 90000 }, async () => {
    const navigationBar = new NavigationBar(page);
    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(imageToPull, imageTag);

    await playExpect.poll(async () => await images.waitForImageExists(imageToPull)).toBeTruthy();
  });

  test(`Start a container '${containerToRun}' from image`, async () => {
    const navigationBar = new NavigationBar(page);
    let images = await navigationBar.openImages();
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    await pdRunner.screenshot('containers-run-image.png');
    const containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible();
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), { timeout: 10000 })
      .toBeTruthy();
    await pdRunner.screenshot('containers-container-exists.png');
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => await containerDetails.getState(), { timeout: 10000 })
      .toContain(ContainerState.Running.toLowerCase());

    images = await navigationBar.openImages();
    playExpect(await images.getCurrentStatusOfImage(imageToPull)).toBe('USED');
  });

  test('Open a container details', async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    await pdRunner.screenshot('containers-container-details.png');
    const containerState = await containersDetails.getState();
    playExpect(containerState).toContain(ContainerState.Running.toLowerCase());
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

  test('Stopping a container from Container details', async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    playExpect(await containersDetails.getState()).toContain(ContainerState.Running.toLowerCase());
    await containersDetails.stopContainer();

    await playExpect
      .poll(async () => await containersDetails.getState(), { timeout: 20000 })
      .toContain(ContainerState.Exited.toLowerCase());
    await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited.toLowerCase());

    const startButton = containersDetails.getPage().getByRole('button', { name: 'Start Container', exact: true });
    await playExpect(startButton).toBeVisible();
  });

  test(`Start a container from the Containers page`, async () => {
    const navigationBar = new NavigationBar(page);
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
      .poll(async () => containersDetails.getState(), { timeout: 20000 })
      .toContain(ContainerState.Running.toLowerCase());
    await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Running.toLowerCase());
  });

  test(`Stop a container from the Containers page`, async () => {
    const navigationBar = new NavigationBar(page);
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
      .poll(async () => containersDetails.getState(), { timeout: 20000 })
      .toContain(ContainerState.Exited.toLowerCase());
    await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited.toLowerCase());
  });

  test('Deleting a container from Container details', async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    const containersPage = await containersDetails.deleteContainer();
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect.poll(async () => await containersPage.containerExists(containerToRun)).toBeFalsy();
  });

  test(`Deleting a container from the Containers page`, async () => {
    //re-start the container from an image
    const navigationBar = new NavigationBar(page);
    let images = await navigationBar.openImages();
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    const containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible();
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), { timeout: 10000 })
      .toBeTruthy();
    await pdRunner.screenshot('containers-container-exists.png');
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => await containerDetails.getState(), { timeout: 10000 })
      .toContain(ContainerState.Running.toLowerCase());

    images = await navigationBar.openImages();
    playExpect(await images.getCurrentStatusOfImage(imageToPull)).toBe('USED');

    //delete it from containers page
    await navigationBar.openContainers();
    const containersPage = await containers.deleteContainer(containerToRun);
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPage.containerExists(containerToRun), { timeout: 15000 })
      .toBeFalsy();
  });

  test('Prune containers', async () => {
    const navigationBar = new NavigationBar(page);
    //Start 3 containers
    for (const container of containerList) {
      const images = await navigationBar.openImages();
      const containersPage = await images.startContainerWithImage(imageToPull, container, containerStartParams);
      await playExpect(containersPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeTruthy();
    }
    //Stop a container, prune, and repeat
    for (const container of containerList) {
      let containersPage = new ContainersPage(page);
      const containersDetails = await containersPage.stopContainerFromDetails(container);
      await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited.toLowerCase(), {
        timeout: 20000,
      });
      containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();
      await containersPage.pruneContainers();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeFalsy();
    }

    //Start and stop 3 containers
    for (const container of containerList) {
      const images = await navigationBar.openImages();
      const containersPage = await images.startContainerWithImage(imageToPull, container, containerStartParams);
      await playExpect(containersPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeTruthy();
      const containersDetails = await containersPage.stopContainerFromDetails(container);
      await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited.toLowerCase(), {
        timeout: 20000,
      });
    }
    //Prune the 3 stopped containers at the same time
    const containersPage = await navigationBar.openContainers();
    await playExpect(containersPage.heading).toBeVisible();
    await containersPage.pruneContainers();
    for (const container of containerList) {
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeFalsy();
    }
  }, 120000);
});
