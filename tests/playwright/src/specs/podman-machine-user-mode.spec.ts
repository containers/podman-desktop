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

import { CreateMachinePage } from '../model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { deletePodmanMachine } from '../utility/operations';
import { isWindows } from '../utility/platform';

const PODMAN_MACHINE_NAME: string = 'podman-machine-user-mode';
const MACHINE_VISIBLE_NAME: string = 'Podman Machine user-mode';

test.skip(!isWindows, 'Test should run only on Windows');

test.beforeAll(async ({ pdRunner, welcomePage }) => {
  pdRunner.setVideoAndTraceName('podman-machine-user-mode');
  await welcomePage.handleWelcomePage(true);
});

test.describe.serial('Podman machine user mode Verification', () => {
  test('Create a rootless machine with user mode enabled', async ({ navigationBar, page }) => {
    test.setTimeout(200_000);
    await navigationBar.openSettings();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman');

    await podmanResources.createButton.click();

    const createMachinePage = new CreateMachinePage(page);
    await createMachinePage.createMachine({
      machineName: PODMAN_MACHINE_NAME,
      isRootful: false,
      enableUserNet: true,
      setAsDefault: false,
    });

    const machineBox = new ResourceConnectionCardPage(page, 'podman', MACHINE_VISIBLE_NAME);
    const connectionStatusLabel = await machineBox.resourceElementConnectionStatus.textContent();
    playExpect(connectionStatusLabel === 'RUNNING').toBeTruthy();
    await deletePodmanMachine(page, MACHINE_VISIBLE_NAME);
  });

  test('Create a rootfull machine with user mode enabled', async ({ navigationBar, page }) => {
    test.setTimeout(200_000);
    await navigationBar.openSettings();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman');

    await podmanResources.createButton.click();

    const createMachinePage = new CreateMachinePage(page);
    await createMachinePage.createMachine({
      machineName: PODMAN_MACHINE_NAME,
      enableUserNet: true,
      setAsDefault: false,
    });

    const machineBox = new ResourceConnectionCardPage(page, 'podman', MACHINE_VISIBLE_NAME);
    const connectionStatusLabel = await machineBox.resourceElementConnectionStatus.textContent();
    playExpect(connectionStatusLabel === 'RUNNING').toBeTruthy();
    await deletePodmanMachine(page, MACHINE_VISIBLE_NAME);
  });
});
