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

    const checkImagePage = page.getByRole('heading', { name: 'images', exact: true });
    await playExpect(checkImagePage).toBeVisible();

    const pullImageButton = page.getByRole('button', { name: 'Pull an image' });
    await pullImageButton.waitFor({ state: 'visible' });
    await pullImageButton.click();

    const checkPullingPage = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    await playExpect(checkPullingPage).toBeVisible();

    const imageInput = page.getByLabel('imageName');
    await imageInput.fill('quay.io/podman/hello');

    const pullButton = page.getByRole('button', { name: 'Pull image' });
    await pullButton.waitFor({ state: 'visible' });
    await pullButton.click();

    const doneButton = page.getByRole('button', { name: 'Done' });
    await doneButton.waitFor({ state: 'visible' });
    await doneButton.click();
  });

  test('Check image appears', async () => {
    const checkImagePage = page.getByRole('heading', { name: 'images', exact: true });
    await playExpect(checkImagePage).toBeVisible();

    const table = page.getByRole('table');
    const imageRow = table.locator('tr:has-text("quay.io/podman/hello")');
    await imageRow.waitFor({ state: 'visible' });
    await imageRow.click();

    await playExpect(page.getByText('Summary')).toBeVisible();
    await playExpect(page.getByText('History')).toBeVisible();
    await playExpect(page.getByText('Inspect')).toBeVisible();
  });
});
