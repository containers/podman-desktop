/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import path from 'node:path';

import type { Page } from '@playwright/test';
import { expect as playExpect, test } from '@playwright/test';

import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import { deleteImage, deletePod } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

let pdRunner: PodmanDesktopRunner;
let page: Page;
const podAppName = 'primary-podify-demo';
const podName = 'podify-demo-pod';
const frontendImage = 'quay.io/podman-desktop-demo/podify-demo-frontend';
const backendImage = 'quay.io/podman-desktop-demo/podify-demo-backend';

test.skip(
  !!process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux',
  'Tests suite should not run on Linux platform',
);

test.beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('play-yaml-e2e');

  await new WelcomePage(page).handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async () => {
  try {
    await deletePod(page, podName);
    await deleteImage(page, backendImage);
    await deleteImage(page, frontendImage);
  } finally {
    await pdRunner.close();
  }
});

test.describe.serial(`Play yaml file to pull images and create pod for app ${podAppName}`, () => {
  test.describe.configure({ timeout: 150000 });

  test('Playing yaml', async () => {
    const navigationBar = new NavigationBar(page);
    let podsPage = await navigationBar.openPods();
    await playExpect(podsPage.heading).toBeVisible();

    const playYamlPage = await podsPage.openPlayKubeYaml();
    await playExpect(playYamlPage.heading).toBeVisible();

    const yamlFilePath = path.resolve(__dirname, '..', '..', 'resources', `${podAppName}.yaml`);
    podsPage = await playYamlPage.playYaml(yamlFilePath);
    await playExpect(podsPage.heading).toBeVisible({ timeout: 10000 });
  });

  test('Checking that created pod from yaml is correct', async () => {
    const navigationBar = new NavigationBar(page);
    const podsPage = await navigationBar.openPods();
    await playExpect(podsPage.heading).toBeVisible();

    await playExpect.poll(async () => await podsPage.podExists(podName), { timeout: 60000 }).toBeTruthy();
    await deletePod(page, podName);
    await playExpect.poll(async () => await podsPage.podExists(podName), { timeout: 60000 }).toBeFalsy();
  });

  test('Checking that pulled images from yaml are correct', async () => {
    const navigationBar = new NavigationBar(page);
    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    await playExpect.poll(async () => await imagesPage.waitForImageExists(backendImage)).toBeTruthy();
    await playExpect.poll(async () => await imagesPage.waitForImageExists(frontendImage)).toBeTruthy();
    await playExpect
      .poll(async () => await imagesPage.getCurrentStatusOfImage(backendImage), { timeout: 15000 })
      .toBe('UNUSED');
    await playExpect
      .poll(async () => await imagesPage.getCurrentStatusOfImage(frontendImage), { timeout: 15000 })
      .toBe('UNUSED');

    let imageDetailsPage = await imagesPage.openImageDetails(backendImage);
    await playExpect(imageDetailsPage.heading).toContainText(backendImage);
    imagesPage = await imageDetailsPage.deleteImage();
    await playExpect(imagesPage.heading).toBeVisible({ timeout: 20000 });
    await playExpect.poll(async () => await imagesPage.waitForImageDelete(backendImage)).toBeTruthy();

    imageDetailsPage = await imagesPage.openImageDetails(frontendImage);
    await playExpect(imageDetailsPage.heading).toContainText(frontendImage);
    imagesPage = await imageDetailsPage.deleteImage();
    await playExpect(imagesPage.heading).toBeVisible({ timeout: 20000 });
    await playExpect.poll(async () => await imagesPage.waitForImageDelete(frontendImage)).toBeTruthy();
  });
});
