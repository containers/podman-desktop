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

import { ResourceElementState } from '../model/core/states';
import { CreateMachinePage } from '../model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { deletePodmanMachine, handleConfirmationDialog } from '../utility/operations';
import { isLinux } from '../utility/platform';

const PODMAN_MACHINE_NAME: string = 'podman-machine-rootless';

test.skip(
  isLinux || process.env.TEST_PODMAN_MACHINE !== 'true',
  'Tests suite should not run on Linux platform or if TEST_PODMAN_MACHINE is not true',
);

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('podman-rootless-machine-e2e');
  process.env.KEEP_TRACES_ON_PASS = 'true';

  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Rootless Podman machine Verification', () => {
  test('Create a rootless machine', async ({ page, navigationBar }) => {
    test.setTimeout(200_000);

    await navigationBar.openSettings();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman');
    await podmanResources.createButton.click();

    const createMachinePage = new CreateMachinePage(page);
    await createMachinePage.createMachine(PODMAN_MACHINE_NAME, { isRootful: false, setAsDefault: false });

    const machineBox = new ResourceConnectionCardPage(page, 'podman', PODMAN_MACHINE_NAME); //does not work with visible name
    await playExpect(machineBox.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running);

    await handleConfirmationDialog(page, 'Podman', true, 'Yes');
    await handleConfirmationDialog(page, 'Podman', true, 'OK');
  });
  test('Clean up rootless machine', async ({ page }) => {
    test.setTimeout(150_000);
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);

    try {
      await handleConfirmationDialog(page, 'Podman', true, 'Yes');
      await handleConfirmationDialog(page, 'Podman', true, 'OK');
    } catch (error) {
      console.log('No handing dialog displayed', error);
    }
  });
});
