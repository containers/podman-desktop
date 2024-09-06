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

import * as os from 'node:os';

import { PodmanMachineDetails } from '../model/pages/podman-machine-details-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { expect as playExpect, test } from '../utility/fixtures';
import { deletePodmanMachine } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const DEFAULT_PODMAN_MACHINE = 'Podman Machine';
const DEFAULT_PODMAN_MACHINE_VISIBLE = 'podman-machine-default';
const ROOTLESS_PODMAN_MACHINE_VISIBLE = 'podman-machine-rootless';
const RESOURCE_NAME = 'podman';

test.skip(os.platform() === 'linux', 'Tests suite should not run on Linux platform');

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('podman-machine-tests');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial(`Podman machine switching validation `, () => {
  test('Check data for available Podman Machine and stop machine', async ({ page, navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.resourcesTab.click();
    const resourcesPage = new ResourcesPage(page);
    await playExpect(resourcesPage.heading).toBeVisible();
    await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
    const resourcesPodmanConnections = new ResourceConnectionCardPage(
      page,
      RESOURCE_NAME,
      DEFAULT_PODMAN_MACHINE_VISIBLE,
    );
    await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: 10_000 });
    await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: 20_000 });
    await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
    await resourcesPodmanConnections.resourceElementDetailsButton.click();
    const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);
    await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 50_000 });
    await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
    await podmanMachineDetails.podmanMachineStopButton.click();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 50_000 });
  });

  test('Clean up rootless podman machine', async ({ page }) => {
    await deletePodmanMachine(page, ROOTLESS_PODMAN_MACHINE_VISIBLE);
  });

  test('Restart default podman machine', async ({ page }) => {
    const resourcesPodmanConnections = new ResourceConnectionCardPage(
      page,
      RESOURCE_NAME,
      DEFAULT_PODMAN_MACHINE_VISIBLE,
    );
    await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
    await resourcesPodmanConnections.resourceElementDetailsButton.click();
    const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);
    await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
    await podmanMachineDetails.podmanMachineStartButton.click();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 50_000 });
  });
});
