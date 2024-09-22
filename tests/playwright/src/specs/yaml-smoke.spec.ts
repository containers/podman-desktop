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
import { fileURLToPath } from 'node:url';

import { expect as playExpect, test } from '../utility/fixtures';
import { deleteImage, deletePod } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const podAppName = 'primary-podify-demo';
const podName = 'podify-demo-pod';
const frontendImage = 'quay.io/podman-desktop-demo/podify-demo-frontend';
const backendImage = 'quay.io/podman-desktop-demo/podify-demo-backend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.skip(
  !!process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux',
  'Tests suite should not run on Linux platform',
);

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('play-yaml-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner, page }) => {
  try {
    await deletePod(page, podName);
    await deleteImage(page, backendImage);
    await deleteImage(page, frontendImage);
  } finally {
    await runner.close();
  }
});

test.describe.serial(`Play yaml file to pull images and create pod for app ${podAppName} @smoke`, () => {
  test.describe.configure({ timeout: 150_000 });

  test('Playing yaml', async ({ navigationBar }) => {
    let podsPage = await navigationBar.openPods();
    await playExpect(podsPage.heading).toBeVisible();

    const playYamlPage = await podsPage.openPlayKubeYaml();
    await playExpect(playYamlPage.heading).toBeVisible();

    const yamlFilePath = path.resolve(__dirname, '..', '..', 'resources', `${podAppName}.yaml`);
    podsPage = await playYamlPage.playYaml(yamlFilePath);
    await playExpect(podsPage.heading).toBeVisible();
  });

  test('Checking that created pod from yaml is correct', async ({ page, navigationBar }) => {
    test.setTimeout(120_000);
    const podsPage = await navigationBar.openPods();
    await playExpect(podsPage.heading).toBeVisible();

    await playExpect.poll(async () => await podsPage.podExists(podName), { timeout: 60_000 }).toBeTruthy();
    await deletePod(page, podName);
    await playExpect.poll(async () => await podsPage.podExists(podName), { timeout: 60_000 }).toBeFalsy();
  });

  test('Checking that pulled images from yaml are correct', async ({ navigationBar }) => {
    test.setTimeout(120_000);

    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    await test.step('Checking that images are pulled', async () => {
      await playExpect.poll(async () => await imagesPage.waitForImageExists(backendImage)).toBeTruthy();
      await playExpect.poll(async () => await imagesPage.waitForImageExists(frontendImage)).toBeTruthy();
      await playExpect
        .poll(async () => await imagesPage.getCurrentStatusOfImage(backendImage), { timeout: 15_000 })
        .toBe('UNUSED');
      await playExpect
        .poll(async () => await imagesPage.getCurrentStatusOfImage(frontendImage), { timeout: 15_000 })
        .toBe('UNUSED');
    });

    await test.step(`Deleting image ${backendImage}`, async () => {
      const imageDetailsPage = await imagesPage.openImageDetails(backendImage);
      await playExpect(imageDetailsPage.heading).toContainText(backendImage);
      imagesPage = await imageDetailsPage.deleteImage();
      await playExpect(imagesPage.heading).toBeVisible({ timeout: 30_000 });
      await playExpect
        .poll(async () => await imagesPage.waitForImageDelete(backendImage), { timeout: 10_000 })
        .toBeTruthy();
    });

    await test.step(`Deleting image ${frontendImage}`, async () => {
      const imageDetailsPage = await imagesPage.openImageDetails(frontendImage);
      await playExpect(imageDetailsPage.heading).toContainText(frontendImage);
      imagesPage = await imageDetailsPage.deleteImage();
      await playExpect(imagesPage.heading).toBeVisible({ timeout: 30_000 });
      await playExpect
        .poll(async () => await imagesPage.waitForImageDelete(frontendImage), { timeout: 10_000 })
        .toBeTruthy();
    });
  });
});
