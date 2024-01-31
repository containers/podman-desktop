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
import { deleteContainer, deleteImage, deletePod } from './utility/operations';
import { ContainerState, PodState } from './model/core/states';
import * as os from 'node:os';
import { PodsPage } from './model/pages/pods-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

const backendImage = 'quay.io/podman-desktop-demo/podify-demo-backend';
const frontendImage = 'quay.io/podman-desktop-demo/podify-demo-frontend';
const imagesTag = 'v1';
const backendContainer = 'backend';
const frontendContainer = 'frontend';
const podToRun = 'frontend-app-pod';
const isMac = os.platform() === 'darwin';
const containerNames = ['container1', 'container2', 'container3'];
const podNames = ['pod1', 'pod2', 'pod3'];

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('pods-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  // wait giving a time to podman desktop to load up
  const images = await new NavigationBar(page).openImages();
  await waitWhile(
    async () => await images.pageIsEmpty(),
    5000,
    1000,
    false,
    'Images page is empty, there are no images present',
  );
  await deletePod(page, podToRun);
  await deleteContainer(page, backendContainer);
  await deleteContainer(page, frontendContainer);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  try {
    for (const pod of podNames) {
      await deletePod(page, pod);
    }
    await deletePod(page, podToRun);

    for (const container of containerNames) {
      await deleteContainer(page, container);
    }
    await deleteContainer(page, backendContainer);
    await deleteContainer(page, frontendContainer);
    await deleteImage(page, backendImage);
    await deleteImage(page, frontendImage);
  } finally {
    await pdRunner.close();
  }
}, 90000);

describe.skipIf(process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux')(
  'Verification of pod creation workflow',
  async () => {
    test('Pulling images', async () => {
      const navigationBar = new NavigationBar(page);
      let images = await navigationBar.openImages();
      let pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(backendImage, imagesTag, 60000);
      const backendExists = await images.waitForImageExists(backendImage);
      expect(backendExists, `${backendImage} image is not present in the list of images`).toBeTruthy();
      await pdRunner.screenshot('pods-pull-image-backend.png');

      await navigationBar.openImages();
      pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(frontendImage, imagesTag, 60000);
      const frontendExists = await images.waitForImageExists(frontendImage);
      expect(frontendExists, `${frontendImage} image is not present in the list of images`).toBeTruthy();
      await pdRunner.screenshot('pods-pull-image-both.png');
    }, 60000);

    test('Starting containers', async () => {
      const navigationBar = new NavigationBar(page);
      let images = await navigationBar.openImages();
      let imageDetails = await images.openImageDetails(backendImage);
      let runImage = await imageDetails.openRunImage();
      await pdRunner.screenshot('pods-run-backend-image.png');
      await runImage.setCustomPortMapping('6379:6379');
      let containers = await runImage.startContainer(backendContainer, false);
      await waitUntil(async () => containers.containerExists(backendContainer), 10000, 1000);
      await pdRunner.screenshot('pods-backend-container-exists.png');
      let containerDetails = await containers.openContainersDetails(backendContainer);
      await waitUntil(async () => {
        return (await containerDetails.getState()) === ContainerState.Running;
      }, 5000);
      await waitUntil(async () => {
        await pdRunner.screenshot('pods-backend-container-port-set.png');
        return await containerDetails.checkMappedPort('6379');
      }, 5000);
      images = await navigationBar.openImages();
      imageDetails = await images.openImageDetails(frontendImage);
      runImage = await imageDetails.openRunImage();
      if (isMac) {
        await runImage.setHostPortToExposedContainerPort('5000', '5101');
      }
      await pdRunner.screenshot('pods-run-frontend-image.png');
      await pdRunner.screenshot('pods-run-frontend-image.png');
      containers = await runImage.startContainer(frontendContainer, false);
      await waitUntil(async () => containers.containerExists(frontendContainer), 10000, 1000);
      await pdRunner.screenshot('pods-frontend-container-exists.png');
      containerDetails = await containers.openContainersDetails(frontendContainer);
      await waitUntil(async () => {
        return (await containerDetails.getState()) === ContainerState.Running;
      }, 5000);
    });

    test('Podify containers', async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      const createPodPage = await containers.openCreatePodPage(Array.of(backendContainer, frontendContainer));
      await pdRunner.screenshot('pods-creation-page.png');
      const pods = await createPodPage.createPod(podToRun);

      await playExpect(pods.heading).toBeVisible();
      await waitUntil(async () => await pods.podExists(podToRun), 10000, 1000);
      const podDetails = await pods.openPodDetails(podToRun);
      await waitUntil(
        async () => {
          return (await podDetails.getState()) === PodState.Running;
        },
        10000,
        1000,
      );
      await pdRunner.screenshot('pods-pod-created.png');
    });

    test('Checking pod details', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      await waitUntil(async () => await pods.podExists(podToRun), 5000, 500);
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toBeVisible();
      await playExpect(podDetails.heading).toContainText(podToRun);
      await pdRunner.screenshot('pods-pod-details.png');
      await podDetails.activateTab('Logs');
      await pdRunner.screenshot('pods-pod-details-logs.png');
      await podDetails.activateTab('Summary');
      const row = podDetails.getPage().getByRole('table').getByRole('row');
      const nameText = await row.getByRole('cell').allInnerTexts();
      playExpect(nameText).toContain(podToRun);
      await pdRunner.screenshot('pods-pod-details-summary.png');
      await podDetails.activateTab('Inspect');
      await pdRunner.screenshot('pods-pod-details-inspect.png');
      await podDetails.activateTab('Kube');
      await pdRunner.screenshot('pods-pod-details-kube.png');
    });

    test(`Checking pods under containers`, async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      expect(await containers.containerExists(`${podToRun} (pod)`)).toBeTruthy();
      expect(await containers.containerExists(`${backendContainer}-podified`)).toBeTruthy();
      expect(await containers.containerExists(`${frontendContainer}-podified`)).toBeTruthy();
      await pdRunner.screenshot('pods-pod-containers-exist.png');
    });

    test('Stopping pods', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toBeVisible();
      await playExpect(podDetails.heading).toContainText(podToRun);
      await podDetails.stopPod();
      await waitUntil(
        async () => {
          return (await podDetails.getState()) === PodState.Exited;
        },
        20000,
        1500,
      );
      const startButton = podDetails.getPage().getByRole('button', { name: 'Start Pod', exact: true });
      await playExpect(startButton).toBeVisible();
      await pdRunner.screenshot('pods-pod-stopped.png');
    });

    test('Deleting pods', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toContainText(podToRun);
      const podsPage = await podDetails.deletePod(10000);
      playExpect(podsPage).toBeDefined();
      playExpect(await podsPage.podExists(podToRun)).toBeFalsy();
      await pdRunner.screenshot('pods-pod-deleted.png');
    });

    test('Pruning pods', async () => {
      const navigationBar = new NavigationBar(page);
      const portsList = [5001, 5002, 5003];

      for (let i = 0; i < 3; i++) {
        const imagesPage = await navigationBar.openImages();
        await playExpect(imagesPage.heading).toBeVisible();
        const imageDetailsPage = await imagesPage.openImageDetails(backendImage);
        await playExpect(imageDetailsPage.heading).toContainText(backendImage);
        const runImagePage = await imageDetailsPage.openRunImage();
        await playExpect(runImagePage.heading).toContainText(backendImage);
        await runImagePage.setCustomPortMapping(`${portsList[i]}:${portsList[i]}`);
        const containersPage = await runImagePage.startContainer(containerNames[i]);
        await playExpect(containersPage.heading).toBeVisible();
        await playExpect
          .poll(async () => containersPage.containerExists(containerNames[i]), { timeout: 15000 })
          .toBeTruthy();
        await containersPage.uncheckAllContainers();
        const createPodPage = await containersPage.openCreatePodPage(Array.of(containerNames[i]));
        const podsPage = await createPodPage.createPod(podNames[i]);
        await playExpect(podsPage.heading).toBeVisible();
        await playExpect.poll(async () => await podsPage.podExists(podNames[i]), { timeout: 15000 }).toBeTruthy();
      }

      for (const pod of podNames) {
        const podDetailsPage = await new PodsPage(page).openPodDetails(pod);
        await playExpect(podDetailsPage.heading).toContainText(pod);
        await podDetailsPage.stopPod();
        await playExpect
          .poll(async () => (await podDetailsPage.getState()) === PodState.Exited, { timeout: 25000 })
          .toBeTruthy();

        const podsPage = await navigationBar.openPods();
        await playExpect(podsPage.heading).toBeVisible();
        await podsPage.prunePods();
        await playExpect.poll(async () => await podsPage.podExists(pod), { timeout: 15000 }).toBeFalsy();
      }
    }, 90000);
  },
);
