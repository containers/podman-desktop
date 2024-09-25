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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ImageDetailsPage } from '../model/pages/image-details-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { waitForPodmanMachineStartup } from '../utility/wait';

const helloContainer = 'quay.io/podman/hello';
const imageList = ['quay.io/podman/image1', 'quay.io/podman/image2'];
const imageToSearch = 'ghcr.io/linuxcontainers/alpine';
const imageTagToSearch = 'latest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('pull-image-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial('Image workflow verification @smoke', () => {
  test('Pull image', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    const updatedImages = await pullImagePage.pullImage(helloContainer);

    const exists = await updatedImages.waitForImageExists(helloContainer);
    playExpect(exists, `${helloContainer} image not present in the list of images`).toBeTruthy();
    playExpect(await updatedImages.getCurrentStatusOfImage(helloContainer)).toBe('UNUSED');
  });

  test('Pull image from search results', async ({ navigationBar }) => {
    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();

    const searchResults = await pullImagePage.getAllSearchResultsFor(imageToSearch, true);
    playExpect(searchResults.length).toBeGreaterThan(0);

    imagesPage = await pullImagePage.pullImageFromSearchResults(imageToSearch + ':' + imageTagToSearch);
    await playExpect(imagesPage.heading).toBeVisible();
    await playExpect.poll(async () => await imagesPage.waitForImageExists(imageToSearch)).toBeTruthy();

    const imageDetailPage = await imagesPage.openImageDetails(imageToSearch);
    await playExpect(imageDetailPage.heading).toBeVisible();

    imagesPage = await imageDetailPage.deleteImage();
    await playExpect(imagesPage.heading).toBeVisible({ timeout: 30_000 });

    await playExpect
      .poll(async () => await imagesPage.waitForImageDelete(imageToSearch, 60_000), { timeout: 0 })
      .toBeTruthy();
  });

  test('Test navigation between pages', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    const imageDetailPage = await imagesPage.openImageDetails(helloContainer);
    await playExpect(imageDetailPage.heading).toBeVisible();
    await imageDetailPage.backLink.click();
    await playExpect(imagesPage.heading).toBeVisible();

    await imagesPage.openImageDetails(helloContainer);
    await playExpect(imageDetailPage.heading).toBeVisible();
    await imageDetailPage.closeButton.click();
    await playExpect(imagesPage.heading).toBeVisible();
  });

  test('Check image details', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    const imageDetailPage = await imagesPage.openImageDetails(helloContainer);

    await playExpect(imageDetailPage.summaryTab).toBeVisible();
    await playExpect(imageDetailPage.historyTab).toBeVisible();
    await playExpect(imageDetailPage.inspectTab).toBeVisible();
  });

  test('Rename image', async ({ page }) => {
    const imageDetailsPage = new ImageDetailsPage(page, helloContainer);
    const editPage = await imageDetailsPage.openEditImage();
    const imagesPage = await editPage.renameImage('quay.io/podman/hi');
    playExpect(await imagesPage.waitForImageExists('quay.io/podman/hi')).toBe(true);
  });

  test('Delete image', async ({ navigationBar }) => {
    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    await imagesPage.pullImage(helloContainer);
    await playExpect(imagesPage.heading).toBeVisible();
    await playExpect.poll(async () => await imagesPage.waitForImageExists(helloContainer)).toBeTruthy();

    const imageDetailPage = await imagesPage.openImageDetails(helloContainer);
    imagesPage = await imageDetailPage.deleteImage();

    await playExpect
      .poll(async () => await imagesPage.waitForImageDelete(helloContainer, 60_000), { timeout: 0 })
      .toBeTruthy();
    playExpect(await imagesPage.waitForImageExists('quay.io/podman/hi')).toBe(true);
  });

  test('Build image', async ({ navigationBar }) => {
    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();
    const dockerfilePath = path.resolve(__dirname, '..', '..', 'resources', 'test-containerfile');
    const contextDirectory = path.resolve(__dirname, '..', '..', 'resources');

    imagesPage = await buildImagePage.buildImage('build-image-test', dockerfilePath, contextDirectory);
    playExpect(await imagesPage.waitForImageExists('docker.io/library/build-image-test')).toBeTruthy();

    const imageDetailsPage = await imagesPage.openImageDetails('docker.io/library/build-image-test');
    await playExpect(imageDetailsPage.heading).toBeVisible();
    imagesPage = await imageDetailsPage.deleteImage();
    playExpect(await imagesPage.waitForImageDelete('docker.io/library/build-image-test')).toBeTruthy();
  });

  test('Prune images', async ({ navigationBar }) => {
    test.setTimeout(240_000);

    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    for (const image of imageList) {
      await imagesPage.pullImage(helloContainer);
      await playExpect(imagesPage.heading).toBeVisible();
      await playExpect.poll(async () => await imagesPage.waitForImageExists(helloContainer)).toBeTruthy();

      await imagesPage.renameImage(helloContainer, image);
      await playExpect(imagesPage.heading).toBeVisible();
      await playExpect.poll(async () => await imagesPage.waitForImageExists(image)).toBeTruthy();
    }

    await imagesPage.pruneImages();
    await playExpect(imagesPage.heading).toBeVisible();

    for (const image of imageList) {
      await playExpect
        .poll(async () => await imagesPage.waitForImageDelete(image, 180_000), { timeout: 0 })
        .toBeTruthy();
    }
  });
});
