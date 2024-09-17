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
import { SettingsBar } from '../model/pages/settings-bar';
import { canTestRegistry, setupRegistry } from '../setupFiles/setup-registry';
import { expect as playExpect, test } from '../utility/fixtures';
import { deleteImage, deleteRegistry } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

let registryUrl: string;
let registryUsername: string;
let registryPswdSecret: string;
let imageName: string;
let imageTag: string;
let imageUrl: string;

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('registry-image-e2e');

  [registryUrl, registryUsername, registryPswdSecret] = setupRegistry();
  imageName = process.env.REGISTRY_IMAGE_NAME ? process.env.REGISTRY_IMAGE_NAME : 'alpine-hello';
  imageTag = process.env.REGISTRY_IMAGE_TAG ? process.env.REGISTRY_IMAGE_TAG : 'latest';
  imageUrl = registryUrl + '/' + registryUsername + '/' + imageName;

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner, page }) => {
  try {
    await deleteImage(page, imageUrl);
    await deleteRegistry(page, 'GitHub');
  } finally {
    await runner.close();
  }
});

test.describe.serial('Pulling image from authenticated registry workflow verification', () => {
  test('Cannot pull image from unauthenticated registry', async ({ page, navigationBar }) => {
    const imagesPage = await navigationBar.openImages();

    const fullImageTitle = imageUrl.concat(':' + imageTag);
    const errorAlert = page.getByLabel('Error Message Content');

    const pullImagePage = await imagesPage.openPullImage();
    await pullImagePage.imageNameInput.fill(fullImageTitle);
    await pullImagePage.pullImageButton.click();

    await playExpect(errorAlert).toBeVisible({ timeout: 10000 });
    await playExpect(errorAlert).toContainText('Error while pulling image from');
    await playExpect(errorAlert).toContainText(fullImageTitle);
    await playExpect(errorAlert).toContainText('Can also be that the registry requires authentication');
  });

  test.describe.serial(() => {
    test.skip(!canTestRegistry(), 'Registry tests are disabled');

    test('Add registry', async ({ page, navigationBar }) => {
      await navigationBar.openSettings();
      const settingsBar = new SettingsBar(page);
      const registryPage = await settingsBar.openTabPage(RegistriesPage);

      await registryPage.createRegistry(registryUrl, registryUsername, registryPswdSecret);

      const registryBox = registryPage.registriesTable.getByLabel('GitHub');
      const username = registryBox.getByText(registryUsername);
      await playExpect(username).toBeVisible();
    });

    test('Image pulling from authenticated registry verification', async ({ navigationBar }) => {
      const imagesPage = await navigationBar.openImages();

      const fullImageTitle = imageUrl.concat(':' + imageTag);
      const pullImagePage = await imagesPage.openPullImage();
      const updatedImages = await pullImagePage.pullImage(fullImageTitle);

      const exists = await updatedImages.waitForImageExists(imageUrl);
      playExpect(exists, fullImageTitle + ' image not present in the list of images').toBeTruthy();
    });
  });
});
