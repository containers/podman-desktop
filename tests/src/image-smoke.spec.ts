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
import { ImagesPage } from './model/pages/images-page';
import { NavigationBar } from './model/workbench/navigation';
import { ImageDetailsPage } from './model/pages/image-details-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('pull-image-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Image pull verification', async () => {
  test('Pull image', async () => {
    const navBar = new NavigationBar(page);
    const imagesPage = await navBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    const updatedImages = await pullImagePage.pullImage('quay.io/podman/hello');

    const exists = await updatedImages.waitForImageExists('quay.io/podman/hello');
    expect(exists, 'quay.io/podman/hello image not present in the list of images').toBeTruthy();
  });

  test('Check image details', async () => {
    const imagesPage = new ImagesPage(page);
    const imageDetailPage = await imagesPage.openImageDetails('quay.io/podman/hello');

    await playExpect(imageDetailPage.summaryTab).toBeVisible();
    await playExpect(imageDetailPage.historyTab).toBeVisible();
    await playExpect(imageDetailPage.inspectTab).toBeVisible();
  });
});

describe('Image delete verification', async () => {
  test('Delete image from image details', async () => {
    const imageDetailPage = new ImageDetailsPage(page, 'quay.io/podman/hello');

    await playExpect(imageDetailPage.deleteButton).toBeVisible();
    await imageDetailPage.deleteButton.click();
  });

  test('Verify image was deleted', async () => {
    const imagesPage = new ImagesPage(page);
    await playExpect(imagesPage.heading).toBeVisible();

    const imageExists = await imagesPage.imageExists('quay.io/podman/hello');
    playExpect(imageExists).toBeFalsy();
  });
});
