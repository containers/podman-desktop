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

import * as os from 'node:os';

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { ContainerState, PodState } from '../model/core/states';
import type { ContainerInteractiveParams } from '../model/core/types';
import { PodsPage } from '../model/pages/pods-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { deleteContainer, deleteImage, deletePod } from '../utility/operations';
import { waitForPodmanMachineStartup, waitUntil, waitWhile } from '../utility/wait';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let backendPort: string;
let frontendPort: string;

const backendImage = 'quay.io/podman-desktop-demo/podify-demo-backend';
const frontendImage = 'quay.io/podman-desktop-demo/podify-demo-frontend';
const imagesTag = 'v1';
const backendContainer = 'backend';
const frontendContainer = 'frontend';
const podToRun = 'frontend-app-pod';
const isMac = os.platform() === 'darwin';
const containerNames = ['container1', 'container2', 'container3'];
const podNames = ['pod1', 'pod2', 'pod3'];
const containerStartParams: ContainerInteractiveParams = { attachTerminal: false };

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('pods-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  // wait giving a time to podman desktop to load up
  const images = await new NavigationBar(page).openImages();
  await waitWhile(async () => await images.pageIsEmpty(), {
    sendError: false,
    message: 'Images page is empty, there are no images present',
  });
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
}, 120000);

describe.skipIf(process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux')(
  'Verification of pod creation workflow',
  async () => {
    test('Pulling images', async () => {
      const navigationBar = new NavigationBar(page);
      let images = await navigationBar.openImages();
      let pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(backendImage, imagesTag, 60000);
      const backendExists = await images.waitForImageExists(backendImage);
      playExpect(backendExists, `${backendImage} image is not present in the list of images`).toBeTruthy();

      await navigationBar.openImages();
      pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(frontendImage, imagesTag, 60000);
      const frontendExists = await images.waitForImageExists(frontendImage);
      playExpect(frontendExists, `${frontendImage} image is not present in the list of images`).toBeTruthy();
    }, 60000);

    test('Starting containers', async () => {
      const navigationBar = new NavigationBar(page);
      let images = await navigationBar.openImages();
      let imageDetails = await images.openImageDetails(backendImage);
      let runImage = await imageDetails.openRunImage();
      await runImage.setCustomPortMapping('6379:6379');
      let containers = await runImage.startContainer(backendContainer, containerStartParams);
      await playExpect(containers.header).toBeVisible();
      await playExpect
        .poll(async () => await containers.containerExists(backendContainer), { timeout: 15000 })
        .toBeTruthy();
      let containerDetails = await containers.openContainersDetails(backendContainer);
      await playExpect
        .poll(async () => await containerDetails.getState(), { timeout: 15000 })
        .toBe(ContainerState.Running.toLowerCase());
      await waitUntil(async () => {
        backendPort = await containerDetails.getContainerPort();
        return backendPort.includes('6379');
      });
      images = await navigationBar.openImages();
      imageDetails = await images.openImageDetails(frontendImage);
      runImage = await imageDetails.openRunImage();
      if (isMac) {
        await runImage.setHostPortToExposedContainerPort('5000', '5101');
      }
      containers = await runImage.startContainer(frontendContainer, containerStartParams);
      await playExpect(containers.header).toBeVisible();
      await playExpect
        .poll(async () => await containers.containerExists(frontendContainer), { timeout: 15000 })
        .toBeTruthy();
      containerDetails = await containers.openContainersDetails(frontendContainer);
      frontendPort = await containerDetails.getContainerPort();
      const expectedPort = isMac ? '5101' : '5000';
      playExpect(frontendPort).toContain(expectedPort);
      await playExpect
        .poll(async () => await containerDetails.getState(), { timeout: 15000 })
        .toBe(ContainerState.Running.toLowerCase());
    });

    test('Podify containers', async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      const createPodPage = await containers.openCreatePodPage(Array.of(backendContainer, frontendContainer));
      const pods = await createPodPage.createPod(podToRun);
      await playExpect(pods.heading).toBeVisible({ timeout: 60000 });
      await playExpect.poll(async () => await pods.podExists(podToRun), { timeout: 15000 }).toBeTruthy();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect.poll(async () => await podDetails.getState(), { timeout: 15000 }).toBe(PodState.Running);
    }, 90000);

    test('Checking pod details', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      await playExpect.poll(async () => await pods.podExists(podToRun), { timeout: 10000 }).toBeTruthy();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toBeVisible();
      await playExpect(podDetails.heading).toContainText(podToRun);
      await podDetails.activateTab('Logs');
      await podDetails.activateTab('Summary');
      const row = podDetails.getPage().getByRole('table').getByRole('row');
      const nameText = await row.getByRole('cell').allInnerTexts();
      playExpect(nameText).toContain(podToRun);
      await podDetails.activateTab('Inspect');
      await podDetails.activateTab('Kube');
    });

    test('Checking original containers stopped', async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      const backendContainerDetails = await containers.openContainersDetails(backendContainer);
      await playExpect
        .poll(async () => await backendContainerDetails.getState(), { timeout: 15000 })
        .toBe(ContainerState.Exited.toLowerCase());
      await navigationBar.openContainers();
      const frontendContainerDetails = await containers.openContainersDetails(frontendContainer);
      await playExpect
        .poll(async () => await frontendContainerDetails.getState(), { timeout: 15000 })
        .toBe(ContainerState.Exited.toLowerCase());
    });

    test('Checking pods page options buttons', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      await pods.selectPod([podToRun]);
      const deleteButton = pods.getPage().getByRole('button', { name: 'Delete 1 selected items', exact: true });
      await playExpect(deleteButton).toBeVisible();

      const actionsMenuButton = await pods.getPodActionsMenu(podToRun);
      await playExpect(actionsMenuButton).toBeVisible();
      await actionsMenuButton.click();
      const kubeButton = pods.getPage().getByTitle('Generate Kube');
      const kubernetesButton = pods.getPage().getByTitle('Deploy to Kubernetes');
      const restartButton = pods.getPage().getByTitle('Restart Pod');
      await playExpect(kubeButton).toBeVisible();
      await playExpect(kubernetesButton).toBeVisible();
      await playExpect(restartButton).toBeVisible();
    });

    test(`Checking pods under containers`, async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      await playExpect
        .poll(async () => containers.containerExists(`${podToRun} (pod)`), { timeout: 10000 })
        .toBeTruthy();
      await playExpect
        .poll(async () => containers.containerExists(`${backendContainer}-podified`), { timeout: 10000 })
        .toBeTruthy();
      await playExpect
        .poll(async () => containers.containerExists(`${frontendContainer}-podified`), { timeout: 10000 })
        .toBeTruthy();
    });

    test('Checking deployed application', async () => {
      // fetch the application page
      // this might not work on macos
      const address = 'http://localhost:' + frontendPort;
      await playExpect.poll(async () => await appRunningOnPort(address), { timeout: 60000 }).toBeTruthy();

      for (let i = 2; i < 5; i++) {
        const response: Response = await fetch(address);
        const blob: Blob = await response.blob();
        const text: string = await blob.text();
        playExpect(text).toContain('Hello World!');
        // regex for div with number of visits
        const regex = /<div[^>]*>(\d+)<\/div>/i;
        const matches = RegExp(regex).exec(text);
        playExpect(matches![1]).toEqual(i.toString());
        playExpect(matches).toBeDefined();
        playExpect(text).toContain('time(s)');
      }
    }, 75000);

    test('Restarting pod', { retry: 2 }, async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toBeVisible();
      await playExpect(podDetails.heading).toContainText(podToRun);
      await podDetails.restartPod();
      await playExpect.poll(async () => await podDetails.getState(), { timeout: 15000 }).toBe(PodState.Restarting);
      await playExpect.poll(async () => await podDetails.getState(), { timeout: 30000 }).toBe(PodState.Running);
      await playExpect(podDetails.stopButton).toBeVisible();
    });

    test('Stopping and starting pod', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetailsPage = await pods.openPodDetails(podToRun);
      await podDetailsPage.stopPod(podToRun, true);
      await playExpect.poll(async () => await podDetailsPage.getState(), { timeout: 30000 }).toBe(PodState.Exited);

      await podDetailsPage.startPod(true);
      await playExpect.poll(async () => await podDetailsPage.getState(), { timeout: 30000 }).toBe(PodState.Running);
      await playExpect(podDetailsPage.stopButton).toBeVisible();
    });

    test('Stopping and deleting pod', async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetailsPage = await pods.openPodDetails(podToRun);
      await podDetailsPage.stopPod(podToRun, true);
      await playExpect.poll(async () => await podDetailsPage.getState(), { timeout: 30000 }).toBe(PodState.Exited);

      await playExpect(podDetailsPage.heading).toContainText(podToRun);
      const podsPage = await podDetailsPage.deletePod();
      await playExpect(podsPage.heading).toBeVisible();
      await playExpect.poll(async () => await podsPage.podExists(podToRun), { timeout: 20000 }).toBeFalsy();
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
        const containersPage = await runImagePage.startContainer(containerNames[i], containerStartParams);
        await playExpect(containersPage.heading).toBeVisible();
        await playExpect
          .poll(async () => containersPage.containerExists(containerNames[i]), { timeout: 15000 })
          .toBeTruthy();
        await containersPage.uncheckAllContainers();
        const createPodPage = await containersPage.openCreatePodPage(Array.of(containerNames[i]));
        const podsPage = await createPodPage.createPod(podNames[i]);
        await playExpect(podsPage.heading).toBeVisible({ timeout: 60000 });
        await playExpect.poll(async () => await podsPage.podExists(podNames[i]), { timeout: 15000 }).toBeTruthy();
      }

      for (const pod of podNames) {
        const podDetailsPage = await new PodsPage(page).openPodDetails(pod);
        await podDetailsPage.stopPod(pod, true);
        await playExpect.poll(async () => await podDetailsPage.getState(), { timeout: 30000 }).toBe(PodState.Exited);

        const podsPage = await navigationBar.openPods();
        await playExpect(podsPage.heading).toBeVisible();
        await podsPage.prunePods();
        await playExpect.poll(async () => await podsPage.podExists(pod), { timeout: 15000 }).toBeFalsy();
      }
    }, 90000);

    async function appRunningOnPort(address: string): Promise<boolean> {
      return await fetch(address)
        .then(response => {
          return response.ok;
        })
        .catch(() => {
          return false;
        });
    }
  },
);
