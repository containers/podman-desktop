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
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { WelcomePage } from './model/pages/welcome-page';
import { SettingsBar } from './model/pages/settings-bar';
import { RegistriesPage } from './model/pages/registries-page';
import { NavigationBar } from './model/workbench/navigation';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let registryUrl: string;
let registryUsername: string;
let registryPswdSecret: string;
let imageName: string;
let imageTag: string;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('registry-image-e2e');

  registryUrl = 'ghcr.io';
  registryUsername = 'podmandesktop-ci';
  registryPswdSecret = process.env.REGISTRY_PSWD_SECRET ? process.env.REGISTRY_PSWD_SECRET : 'invalidPswd';
  imageName = 'ghcr.io/' + registryUsername + '/alpine-hello';
  imageTag = ':latest';

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Registry image workflow verification', async () => {
  test('Try pulling unauthentified image', async () => {
    const imagesPage = await navBar.openImages();

    const fullImageTitle = imageName.concat(imageTag);
    const errorMessage = page.getByText(
      'initializing source docker://' +
        fullImageTitle +
        ': unable to retrieve auth token: invalid username/password: unauthorized',
    );
    const pullImagePage = await imagesPage.openPullImage();
    await pullImagePage.pullImage(fullImageTitle);

    await playExpect(errorMessage).isVisible();
  });
  test('Create and authenticate registry', async () => {
    await navBar.openSettings();
    const settingsBar = new SettingsBar(page);
    const registryPage = await settingsBar.openTabPage(RegistriesPage);

    await registryPage.createRegistry(registryUrl, registryUsername, registryPswdSecret);

    const registryBox = registryPage.registriesTable.getByLabel(registryUrl);
    await playExpect(registryBox).isVisible();
  });
  test('Pull image from registry', async () => {
    const imagesPage = await navBar.openImages();

    const fullImageTitle = imageName.concat(imageTag);
    const pullImagePage = await imagesPage.openPullImage();
    const updatedImages = await pullImagePage.pullImage(fullImageTitle);

    const exists = await updatedImages.waitForImageExists(fullImageTitle);
    playExpect(exists, fullImageTitle + ' image not present in the list of images').toBeTruthy();
  });
});
