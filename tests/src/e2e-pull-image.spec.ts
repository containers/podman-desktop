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
import { afterAll, beforeAll, test, describe } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { ImagesPage } from './model/pages/images-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage();
});

afterAll(async () => {
  await pdRunner.close();
});

describe('Image pull verification', async () => {
  test('Pull image', async () => {
    const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
    const imageLink = navBar.getByRole('link', { name: 'Images' });
    await playExpect(imageLink).toBeVisible();
    await imageLink.click();

    const imagesPage = new ImagesPage(page);
    const pullImagePage = await imagesPage.pullImage();
    const updatedImages = await pullImagePage.pullImage('quay.io/podman/hello');

    playExpect(updatedImages.imageExists('quay.io/podman/hello')).toBeTruthy();
  });

  test('Check image details', async () => {
    const imagesPage = new ImagesPage(page);
    const imageDetailPage = await imagesPage.openImageDetails('quay.io/podman/hello');

    await playExpect(imageDetailPage.summaryTab).toBeVisible();
    await playExpect(imageDetailPage.historyTab).toBeVisible();
    await playExpect(imageDetailPage.inspectTab).toBeVisible();
  });
});
