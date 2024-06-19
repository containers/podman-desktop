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

import { expect as playExpect } from '@playwright/test';
import type { Page } from 'playwright';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { RegistriesPage } from '../model/pages/registries-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import { canTestRegistry, setupRegistry } from '../setupFiles/setup-registry';
import type { RunnerTestContext } from '../testContext/runner-test-context';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let registryUrl: string;
let registryUsername: string;
let registryPswdSecret: string;
let registryName: string;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('registry-e2e');

  [registryUrl, registryUsername, registryPswdSecret] = setupRegistry();
  registryName = 'GitHub';

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

describe('Registries handling verification', async () => {
  test('Check Registries page components and presence of default registries', async () => {
    const settingsBar = await navBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);

    await playExpect(registryPage.addRegistryButton).toBeEnabled();

    const defaultRegistries = ['Docker Hub', 'Red Hat Quay', 'GitHub', 'Google Container Registry'];
    for (const registryName of defaultRegistries) {
      const registryBox = registryPage.registriesTable.getByLabel(registryName);
      await playExpect(registryBox).toBeVisible();
    }
  });
  describe('Registry addition workflow verification', async () => {
    test('Cannot add invalid registry', async () => {
      await navBar.openDashboard();
      const settingsBar = await navBar.openSettings();
      const registryPage = await settingsBar.openTabPage(RegistriesPage);

      await registryPage.createRegistry('invalidUrl', 'invalidName', 'invalidPswd');
      const urlErrorMsg = page.getByText(
        /Unable to find auth info for https:\/\/invalidUrl\/v2\/\. Error: RequestError: getaddrinfo [A-Z_]+ invalidurl$/,
      );
      await playExpect(urlErrorMsg).toBeVisible({ timeout: 50000 });
      await playExpect(registryPage.cancelAddRegistryButton).toBeEnabled();
      await registryPage.cancelAddRegistryButton.click();

      await registryPage.createRegistry(registryUrl, 'invalidName', 'invalidPswd');
      const credsErrorMsg = page.getByText('Wrong Username or Password.');
      await playExpect(credsErrorMsg).toBeVisible();
      await playExpect(registryPage.cancelAddRegistryButton).toBeEnabled();
      await registryPage.cancelAddRegistryButton.click();
    });
    test.runIf(canTestRegistry())('Valid registry addition verification', async () => {
      const registryPage = new RegistriesPage(page);

      await registryPage.createRegistry(registryUrl, registryUsername, registryPswdSecret);
      await pdRunner.screenshot('registry-addition.png');

      const registryBox = registryPage.registriesTable.getByLabel(registryName);
      const username = registryBox.getByText(registryUsername);
      await playExpect(username).toBeVisible({ timeout: 50000 });
    });
  });
  test.runIf(canTestRegistry())('Registry editing availability and invalid credentials verification', async () => {
    const registryPage = new RegistriesPage(page);

    await registryPage.editRegistry(registryName, 'invalidName', 'invalidPswd');
    const errorMsg = page.getByText('Wrong Username or Password.');
    await playExpect(errorMsg).toBeVisible();

    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
  });
  test.runIf(canTestRegistry())('Registry removal verification', async () => {
    const registryPage = new RegistriesPage(page);

    await registryPage.removeRegistry(registryName);
    const registryBox = registryPage.registriesTable.getByLabel(registryName);
    const username = registryBox.getByText(registryUsername);
    await playExpect(username).toBeHidden();
  });
});
