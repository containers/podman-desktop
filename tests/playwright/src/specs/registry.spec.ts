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

import { RegistriesPage } from '../model/pages/registries-page';
import { canTestRegistry, setupRegistry } from '../setupFiles/setup-registry';
import { expect as playExpect, test } from '../utility/fixtures';
import { waitForPodmanMachineStartup } from '../utility/wait';

let registryUrl: string;
let registryUsername: string;
let registryPswdSecret: string;
let registryName: string;

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('registry-e2e');

  [registryUrl, registryUsername, registryPswdSecret] = setupRegistry();
  registryName = 'GitHub';

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial('Registries handling verification', { tag: '@smoke' }, () => {
  test('Check Registries page components and presence of default registries', async ({ navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);

    await playExpect(registryPage.heading).toBeVisible({ timeout: 10_000 });
    await playExpect(registryPage.addRegistryButton).toBeEnabled();
    await playExpect(registryPage.registriesTable).toBeVisible({
      timeout: 10_000,
    });

    const defaultRegistries = ['Docker Hub', 'Red Hat Quay', 'GitHub', 'Google Container Registry'];
    for (const registryName of defaultRegistries) {
      const registryBox = registryPage.registriesTable.getByLabel(registryName);
      await playExpect(registryBox).toBeVisible({ timeout: 30_000 });
    }
  });

  test('Cannot add invalid registry', async ({ page, navigationBar }) => {
    await navigationBar.openDashboard();
    const settingsBar = await navigationBar.openSettings();
    const registryPage = await settingsBar.openTabPage(RegistriesPage);

    await registryPage.createRegistry('invalidUrl', 'invalidName', 'invalidPswd');
    const urlErrorMsg = page.getByText(
      /Unable to find auth info for https:\/\/invalidUrl\/v2\/\. Error: RequestError: getaddrinfo [A-Z_]+ invalidurl$/,
    );
    await playExpect(urlErrorMsg).toBeVisible({ timeout: 50000 });
    await playExpect(registryPage.cancelDialogButton).toBeEnabled();
    await registryPage.cancelDialogButton.click();

    await registryPage.createRegistry(registryUrl, 'invalidName', 'invalidPswd');
    const credsErrorMsg = page.getByText('Wrong Username or Password.');
    await playExpect(credsErrorMsg).toBeVisible();
    await playExpect(registryPage.cancelDialogButton).toBeEnabled();
    await registryPage.cancelDialogButton.click();
  });

  test.describe
    .serial('Registry addition workflow verification', () => {
      test.skip(!canTestRegistry(), 'Registry tests are disabled');

      test('Valid registry addition verification', async ({ page }) => {
        const registryPage = new RegistriesPage(page);

        await registryPage.createRegistry(registryUrl, registryUsername, registryPswdSecret);

        const registryBox = registryPage.registriesTable.getByLabel(registryName);
        const username = registryBox.getByText(registryUsername);
        await playExpect(username).toBeVisible({ timeout: 50000 });
      });

      test('Registry editing availability and invalid credentials verification', async ({ page }) => {
        const registryPage = new RegistriesPage(page);

        await registryPage.editRegistry(registryName, 'invalidName', 'invalidPswd');
        const errorMsg = page.getByText('Wrong Username or Password.');
        await playExpect(errorMsg).toBeVisible();

        const cancelButton = page.getByRole('button', { name: 'Cancel' });
        await cancelButton.click();
      });

      test('Registry removal verification', async ({ page }) => {
        const registryPage = new RegistriesPage(page);

        await registryPage.removeRegistry(registryName);
        const registryBox = registryPage.registriesTable.getByLabel(registryName);
        const username = registryBox.getByText(registryUsername);
        await playExpect(username).toBeHidden();
      });
    });
});
