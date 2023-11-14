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

let pdRunner: PodmanDesktopRunner;
let page: Page;
let registryUrl: string;
let registryUsername: string;
let registryPswdSecret: string;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('registry-e2e');

  registryUrl = '';
  registryUsername = '';
  registryPswdSecret = process.env.registryPswdSecret ? process.env.registryPswdSecret : 'invalidPswd';

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Registry workflow verification', async () => {
  test('Create registry', async () => {
    const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
    const settingsLink = navBar.getByRole('link', { name: 'Settings' });
    await playExpect(settingsLink).toBeVisible();
    await settingsLink.click();
    const settingsBar = new SettingsBar(page);
    const registryPage = await settingsBar.openTabPage(RegistriesPage);

    await playExpect(registryPage.addRegistryButton).toBeVisible();
    await playExpect(registryPage.addRegistryButton).isEnabled();

    await registryPage.createRegistry('invalidUrl', 'invalidName', 'invalidPswd');
    const errorMsg =
      'Unable to find auth info for https://invalidUrl/v2/. Error: RequestError: getaddrinfo ENOTFOUND invalidUrl';
    await playExpect(errorMsg).isVisible();
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();

    await registryPage.createRegistry(registryUrl, 'invalidName', 'invalidPswd');
    errorMsg = 'Wrong Username or Password.';
    await playExpect(errorMsg).isVisible();
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();

    await registryPage.createRegistry(registryUrl, registryUsername, registryPswdSecret);

    const registryBox = registryPage.registriesTable.getByLabel(registryUrl);
    await playExpect(registryBox).isVisible();
  });
  test('Edit registry', async () => {
    const registryPage = new RegistriesPage(page);

    await registryPage.editRegistry(registryUrl, 'invalidName', 'invalidPswd');
    const errorMsg = 'Wrong Username or Password.';
    await playExpect(errorMsg).isVisible();
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
  });
  test('Remove registry', async () => {
    const registryPage = new RegistriesPage(page);
    const registryBox = registryPage.registriesTable.getByLabel('x');
    const dropdownMenu = registryBox.getByLabel('Dropdown menu');
    await dropdownMenu.click();
    const editButton = registryBox.getByLabel('Remove');
    await editButton.click();

    await playExpect(registryBox).toBeHidden();
  });
});
