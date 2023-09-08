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

import type { Page } from 'playwright';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach, expect } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { NavigationBar } from './model/workbench/navigation';
import { waitUntil, waitWhile } from './utility/wait';
import { deleteContainer, deleteImage, deletePod } from './utility/operations';
import { ContainerState, PodState } from './model/core/states';

let pdRunner: PodmanDesktopRunner;
let page: Page;

const imageToPull = 'docker.io/library/nginx';
const imageTag = 'latest';
const containerToRun = 'nginx-container';
const podToRun = 'nginx-pod';

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('pods-e2e');
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
  await deleteContainer(page, containerToRun);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await deletePod(page, podToRun);
  await deleteContainer(page, containerToRun);
  await deleteImage(page, imageToPull);
  await pdRunner.close();
}, 90000);

describe.skipIf(process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux')(
  'Verification of pod creation workflow',
  async () => {
    test(`Pulling of '${imageToPull}:${imageTag}' image`, async () => {
      const navigationBar = new NavigationBar(page);
      let images = await navigationBar.openImages();
      const pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(imageToPull, imageTag, 60000);

      const exists = await images.waitForImageExists(imageToPull);
      expect(exists, `${imageToPull} image is not present in the list of images`).toBeTruthy();
      await pdRunner.screenshot('pods-pull-image.png');
    }, 60000);

    test(`Starting a container '${containerToRun}'`, async () => {
      const navigationBar = new NavigationBar(page);
      const images = await navigationBar.openImages();
      const imageDetails = await images.openImageDetails(imageToPull);
      const runImage = await imageDetails.openRunImage();
      await pdRunner.screenshot('pods-run-image.png');
      const containers = await runImage.startContainer(containerToRun);
      await waitUntil(async () => containers.containerExists(containerToRun), 10000, 1000);
      await pdRunner.screenshot('pods-container-exists.png');
      const containerDetails = await containers.openContainersDetails(containerToRun);
      await waitUntil(async () => {
        return (await containerDetails.getState()) === ContainerState.Running;
      }, 5000);
    });

    test(`Podify container '${containerToRun}'`, async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      const createPodPage = await containers.openCreatePodPage(containerToRun);
      await pdRunner.screenshot('pods-creation-page.png');
      const pods = await createPodPage.createPod(podToRun);

      await pods.heading.waitFor({ state: 'visible', timeout: 6000 });
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

    test(`Checking pod details`, async () => {
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

    test(`Checking pod '${podToRun}' under containers`, async () => {
      const navigationBar = new NavigationBar(page);
      const containers = await navigationBar.openContainers();
      expect(await containers.containerExists(`${podToRun} (pod)`)).toBeTruthy();
      expect(await containers.containerExists(`${containerToRun}-podified`)).toBeTruthy();
      await pdRunner.screenshot('pods-pod-containers-exist.png');
    });

    test(`Stopping pod '${podToRun}'`, async () => {
      // skipped because it is already stopped for some pods
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
        10000,
        1500,
      );
      const startButton = podDetails.getPage().getByRole('button', { name: 'Start Pod', exact: true });
      await playExpect(startButton).toBeVisible();
      await pdRunner.screenshot('pods-pod-stopped.png');
    });

    test(`Deleting pod '${podToRun}'`, async () => {
      const navigationBar = new NavigationBar(page);
      const pods = await navigationBar.openPods();
      const podDetails = await pods.openPodDetails(podToRun);
      await playExpect(podDetails.heading).toContainText(podToRun);
      const podsPage = await podDetails.deletePod(10000);
      playExpect(podsPage).toBeDefined();
      playExpect(await podsPage.podExists(podToRun)).toBeFalsy();
      await pdRunner.screenshot('pods-pod-deleted.png');
    });
  },
);
