/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { ResourceElementActions } from '/@/model/core/operations';
import { ResourceElementState } from '/@/model/core/states';
import { PodmanVirtualizationProviders } from '/@/model/core/types';
import { CreateMachinePage } from '/@/model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import {
  createPodmanMachineFromCLI,
  deleteImage,
  deletePodmanMachine,
  handleConfirmationDialog,
  resetPodmanMachinesFromCLI,
  waitForMachineStatus,
} from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const RESOURCE_NAME = 'podman';
const defaultMachineVisibleName = 'podman-machine-default';
const secondMachineVisibleName = 'podman-machine-second';
const secondMachineDisplayName = 'Podman Machine second';
const defaultMachineDisplayName = 'Podman Machine';
const environmentFilterImage = 'ghcr.io/linuxcontainers/alpine';

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('images-environment-filter-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe
  .serial('Verification of image filtering by environment', { tag: '@pdmachine' }, () => {
    test.skip(
      isLinux ||
        process.env.TEST_PODMAN_MACHINE !== 'true' ||
        getVirtualizationProvider() === PodmanVirtualizationProviders.HyperV,
      'Test suite requires a second Podman machine; skipped on Linux, when TEST_PODMAN_MACHINE is not set, or when running with Hyper-V (only one Podman machine allowed)',
    );

    // Serial mode skips the remaining tests after a failure, so bring back the default machine as the only one.
    test.afterEach(async ({ page }, testInfo) => {
      if (testInfo.status !== testInfo.expectedStatus) {
        console.log(`Test "${testInfo.title}" has status ${testInfo.status}... Performing podman machine cleanup`);

        try {
          await resetPodmanMachinesFromCLI();
          await createPodmanMachineFromCLI();
          await waitForPodmanMachineStartup(page);
        } catch (error) {
          console.log('Error occurred while resetting podman machines', error);
        }
      }
    });

    test('Creating and starting a second Podman machine', async ({ navigationBar, page }) => {
      test.setTimeout(400_000);

      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();

      // With the default machine stopped, the "set as default?" dialog is always shown when the second one starts.
      const defaultMachineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, defaultMachineVisibleName);
      await defaultMachineCard.performConnectionAction(ResourceElementActions.Stop);
      await waitForMachineStatus(page, defaultMachineVisibleName, ResourceElementState.Off);

      await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
      const createMachinePage = new CreateMachinePage(page);
      const resourcesPageAfterCreation = await createMachinePage.createMachine(secondMachineVisibleName, {
        isRootful: true,
        startNow: false,
        setAsDefault: false,
        virtualizationProvider: getVirtualizationProvider(),
      });
      await playExpect(resourcesPageAfterCreation.heading).toBeVisible();
      await waitForMachineStatus(page, secondMachineVisibleName, ResourceElementState.Off);

      const secondMachineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, secondMachineVisibleName);
      await secondMachineCard.performConnectionAction(ResourceElementActions.Start);
      await handleConfirmationDialog({
        page,
        dialogTitle: 'Podman',
        buttonName: 'Ignore',
        timeout: 120_000,
      });
      await waitForMachineStatus(page, secondMachineVisibleName, ResourceElementState.Running, {
        initialTimeout: 60_000,
        retryTimeout: 120_000,
      });

      await defaultMachineCard.performConnectionAction(ResourceElementActions.Start);
      await waitForMachineStatus(page, defaultMachineVisibleName, ResourceElementState.Running, {
        initialTimeout: 60_000,
        retryTimeout: 120_000,
      });
    });

    test('Environment filter becomes visible with two running machines', async ({ navigationBar }) => {
      const images = await navigationBar.openImages();
      await playExpect.poll(async () => await images.isEnvironmentFilterVisible(), { timeout: 30_000 }).toBeTruthy();
    });

    test('Filtering images by environment', async ({ navigationBar }) => {
      test.setTimeout(120_000);

      let images = await navigationBar.openImages();
      const pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(environmentFilterImage, 'latest', 60_000, defaultMachineVisibleName);
      await playExpect
        .poll(async () => await images.waitForImageExists(environmentFilterImage), { timeout: 10_000 })
        .toBeTruthy();

      await test.step(`Filter by ${secondMachineDisplayName} shows no images`, async () => {
        await images.filterByEnvironment(secondMachineDisplayName);
        await playExpect.poll(async () => await images.countRowsFromTable(), { timeout: 10_000 }).toBe(0);
      });

      await test.step(`Filter by ${defaultMachineDisplayName} shows the pulled image`, async () => {
        await images.filterByEnvironment(defaultMachineDisplayName);
        await playExpect
          .poll(async () => await images.countRowsFromTable(), { timeout: 10_000 })
          .toBeGreaterThanOrEqual(1);
        await playExpect
          .poll(async () => await images.waitForImageExists(environmentFilterImage), { timeout: 10_000 })
          .toBeTruthy();
      });

      await test.step('Clearing the filter shows all environments', async () => {
        await images.clearFilterByEnvironment();
        await playExpect(images.environmentDropdown).toContainText('All');
        await playExpect
          .poll(async () => await images.waitForImageExists(environmentFilterImage), { timeout: 10_000 })
          .toBeTruthy();
      });
    });

    test('Cleaning up the pulled image and the second Podman machine', async ({ page }) => {
      test.setTimeout(150_000);

      await deleteImage(page, environmentFilterImage);
      await deletePodmanMachine(page, secondMachineVisibleName);
    });
  });
