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

import type { Page } from '@playwright/test';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach, expect } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { NavigationBar } from './model/workbench/navigation';
import { waitUntil, waitWhile } from './utility/wait';
import { deleteContainer, deleteImage } from './utility/operations';
import { ContainerState } from './model/core/states';
import type { ImagesPage } from './model/pages/images-page';
import { ContainersPage } from './model/pages/containers-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;
const imageToPull = 'ghcr.io/linuxcontainers/alpine';
const imageTag = 'latest';
const containerToRun = 'alpine-container';
const containerList = ['first', 'second', 'third'];

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('containers-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  // wait giving a time to podman desktop to load up
  let images: ImagesPage;
  try {
    images = await new NavigationBar(page).openImages();
  } catch (error) {
    await pdRunner.screenshot('error-on-open-images.png');
    throw error;
  }
  await waitWhile(
    async () => await images.pageIsEmpty(),
    5000,
    1000,
    false,
    'Images page is empty, there are no images present',
  );
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
  test(`Pulling of '${imageToPull}:${imageTag}' image`, async () => {
    const navigationBar = new NavigationBar(page);
    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(imageToPull, imageTag, 45000);

    const exists = await images.waitForImageExists(imageToPull);
    expect(exists, `${imageToPull} image is not present in the list of images`).toBeTruthy();
    await pdRunner.screenshot('containers-pull-image.png');
  }, 60000);

  test(`Start a container '${containerToRun}'`, async () => {
    const navigationBar = new NavigationBar(page);
    const images = await navigationBar.openImages();
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    await pdRunner.screenshot('containers-run-image.png');
    const containers = await runImage.startContainer(containerToRun);
    await waitUntil(
      async () => await containers.containerExists(containerToRun),
      10000,
      1000,
      true,
      'Failed to start a container',
    );
    await pdRunner.screenshot('containers-container-exists.png');
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await waitUntil(async () => {
      return (await containerDetails.getState()) === ContainerState.Running;
    }, 5000);
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

  test('Stopping a container', async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toBeVisible();
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    // test state of container in summary tab
    playExpect(await containersDetails.getState()).toContain(ContainerState.Running);
    await containersDetails.stopContainer();
    try {
      await waitUntil(async () => (await containersDetails.getState()) === ContainerState.Exited, 15000);
      await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited);
    } catch (error) {
      await pdRunner.screenshot('containers--container-stop-failed.png');
      throw error;
    }
    const startButton = containersDetails.getPage().getByRole('button', { name: 'Start Container', exact: true });
    await playExpect(startButton).toBeVisible();
    await pdRunner.screenshot('containers-container-stopped.png');
  });

  test('Deleting a container', async () => {
    const navigationBar = new NavigationBar(page);
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containersDetails.heading).toContainText(containerToRun);
    const containersPage = await containersDetails.deleteContainer();
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect.poll(async () => await containersPage.containerExists(containerToRun)).toBeFalsy();
    await pdRunner.screenshot('containers-container-deleted.png');
  });

  test('Prune containers', async () => {
    const navigationBar = new NavigationBar(page);

    for (const container of containerList) {
      const images = await navigationBar.openImages();
      const containersPage = await images.startContainerWithImage(imageToPull, container);
      await playExpect(containersPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeTruthy();
    }

    for (const container of containerList) {
      let containersPage = new ContainersPage(page);
      const containersDetails = await containersPage.stopContainer(container);
      await playExpect(await containersDetails.getStateLocator()).toHaveText(ContainerState.Exited, { timeout: 20000 });
      containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();
      await containersPage.pruneContainers();
      await playExpect
        .poll(async () => await containersPage.containerExists(container), { timeout: 15000 })
        .toBeFalsy();
    }
  }, 120000);
});
