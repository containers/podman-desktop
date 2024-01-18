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
import { ImageDetailsPage } from './model/pages/image-details-page';
import path from 'path';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('pull-image-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page); // always present on the left side of the page
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Image workflow verification', async () => {
  async function pullImageByName(imageName: string) {
    let imagesPage = await navBar.openImages();
    const pullImagePage = await imagesPage.openPullImage();
    imagesPage = await pullImagePage.pullImage(imageName);
    await imagesPage.waitForImageExists(imageName);
    return imagesPage;
  }

  test('Pull image', async () => {
    const imagesPage = await navBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    const updatedImages = await pullImagePage.pullImage('quay.io/podman/hello');

    const exists = await updatedImages.waitForImageExists('quay.io/podman/hello');
    expect(exists, 'quay.io/podman/hello image not present in the list of images').toBeTruthy();
  });

  test('Check image details', async () => {
    const imagesPage = await navBar.openImages();
    const imageDetailPage = await imagesPage.openImageDetails('quay.io/podman/hello');

    await playExpect(imageDetailPage.summaryTab).toBeVisible();
    await playExpect(imageDetailPage.historyTab).toBeVisible();
    await playExpect(imageDetailPage.inspectTab).toBeVisible();
  });

  test('Rename image', async () => {
    const imageDetailsPage = new ImageDetailsPage(page, 'quay.io/podman/hello');
    const editPage = await imageDetailsPage.openEditImage();
    const imagesPage = await editPage.renameImage('quay.io/podman/hi');
    expect(await imagesPage.waitForImageExists('quay.io/podman/hi')).equals(true);
  });

  test('Delete image', async () => {
    const imagesPage = await pullImageByName('quay.io/podman/hello');
    expect(await imagesPage.waitForImageExists('quay.io/podman/hello')).equals(true);

    const imageDetailPage = await imagesPage.openImageDetails('quay.io/podman/hello');
    await playExpect(imageDetailPage.deleteButton).toBeVisible();
    await imageDetailPage.deleteButton.click();

    const imageDeleted = await imagesPage.waitForImageDelete('quay.io/podman/hello');
    expect(imageDeleted).equals(true);
    expect(await imagesPage.waitForImageExists('quay.io/podman/hi')).equals(true);
  });

  test('Build image', async () => {
    let imagesPage = await navBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();
    const dockerfilePath = path.resolve(__dirname, '..', 'resources', 'test-containerfile');
    const contextDirectory = path.resolve(__dirname, '..', 'resources');

    imagesPage = await buildImagePage.buildImage('build-test-image', dockerfilePath, contextDirectory);
    expect(await imagesPage.waitForImageExists('build-test-image')).toBeTruthy();

    const imageDetailsPage = await imagesPage.openImageDetails('build-test-image');
    await playExpect(imageDetailsPage.heading).toBeVisible();
    imagesPage = await imageDetailsPage.deleteImage();
    expect(await imagesPage.waitForImageDelete('build-test-image')).toBeTruthy();
  });

  test('Prune images', async () => {
    const imageList = ['quay.io/podman/image1', 'quay.io/podman/image2'];

    let imagesPage = await navBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    for (const image of imageList) {
      const pullImagePage = await imagesPage.openPullImage();
      await playExpect(pullImagePage.heading).toBeVisible();
      imagesPage = await pullImagePage.pullImage('quay.io/podman/hello');
      await playExpect(imagesPage.heading).toBeVisible();
      await playExpect.poll(async () => await imagesPage.waitForImageExists('quay.io/podman/hello')).toBeTruthy();

      const imageDetailsPage = await imagesPage.openImageDetails('quay.io/podman/hello');
      await playExpect(imageDetailsPage.heading).toContainText('quay.io/podman/hello');
      const editImagePage = await imageDetailsPage.openEditImage();
      imagesPage = await editImagePage.renameImage(image);
      await playExpect(imagesPage.heading).toBeVisible();
      await playExpect.poll(async () => await imagesPage.waitForImageExists(image)).toBeTruthy();
    }

    await imagesPage.pruneImages();
    await playExpect(imagesPage.heading).toBeVisible();

    await playExpect
      .poll(async () => await imagesPage.waitForImageDelete(imageList[0]), { timeout: 30000 })
      .toBeTruthy();
    await playExpect
      .poll(async () => await imagesPage.waitForImageDelete(imageList[1]), { timeout: 30000 })
      .toBeTruthy();
  }, 120000);
});
