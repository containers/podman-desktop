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

import type { Page } from '@playwright/test';

import { ResourceElementActions } from '/@/model/core/operations';
import { ResourceElementState } from '/@/model/core/states';
import { type ContainerInteractiveParams, PodmanVirtualizationProviders } from '/@/model/core/types';
import { CreateMachinePage } from '/@/model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import type { NavigationBar } from '/@/model/workbench/navigation';
import { expect as playExpect, test } from '/@/utility/fixtures';
import {
  deleteContainer,
  deleteImage,
  deletePodmanMachine,
  handleConfirmationDialog,
  waitForMachineStatus,
} from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup, waitWhile } from '/@/utility/wait';

const defaultMachineVisibleName = 'podman-machine-default';
const secondMachineVisibleName = 'podman-machine-second';
const secondMachineDisplayName = 'Podman Machine second';
const defaultMachineDisplayName = 'Podman Machine';
const environmentFilterImage = 'ghcr.io/linuxcontainers/alpine';
const environmentFilterContainer = 'environment-filter-container';
const containerStartParams: ContainerInteractiveParams = { attachTerminal: false };

async function openPodmanResources(navigationBar: NavigationBar, page: Page): Promise<ResourcesPage> {
  const settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();
  const resourcesPage = new ResourcesPage(page);
  await playExpect(resourcesPage.heading).toBeVisible();
  await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible('podman')).toBeTruthy();
  return resourcesPage;
}

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  runner.setVideoAndTraceName('containers-environment-filter-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  const images = await navigationBar.openImages();
  await waitWhile(async () => await images.pageIsEmpty(), {
    sendError: false,
    message: 'Images page is empty, there are no images present',
  });
});

test.describe
  .serial('Verification of container filtering by environment', { tag: '@pdmachine' }, () => {
    let secondMachineCreated = false;
    let cleanedUp = false;

    test.skip(
      isLinux ||
        process.env.TEST_PODMAN_MACHINE !== 'true' ||
        getVirtualizationProvider() === PodmanVirtualizationProviders.HyperV,
      'Test suite requires a second Podman machine; skipped on Linux, when TEST_PODMAN_MACHINE is not set, or when running with Hyper-V (only one Podman machine allowed)',
    );

    // The regular cleanup is the last test of the suite. This hook is only a safety net
    // for runs where an earlier test failed and the remaining tests (including the cleanup) were skipped.
    test.afterAll(async ({ page, runner, navigationBar }) => {
      test.setTimeout(360_000);

      try {
        if (cleanedUp) return;

        // Run every cleanup step regardless of individual failures, then re-throw.
        const errors: unknown[] = [];
        const cleanups: Array<() => Promise<void>> = [
          // The default machine is stopped during the suite, make sure it is running again.
          async (): Promise<void> => {
            await openPodmanResources(navigationBar, page);
            const defaultMachineCard = new ResourceConnectionCardPage(page, 'podman', defaultMachineVisibleName);
            const status = await defaultMachineCard.resourceElementConnectionStatus.innerText();
            if (status.includes(ResourceElementState.Off)) {
              await defaultMachineCard.performConnectionAction(ResourceElementActions.Start);
              await waitForMachineStatus(page, defaultMachineVisibleName, ResourceElementState.Running, {
                initialTimeout: 60_000,
              });
            }
          },
          // An active environment filter can hide the container, so reset it first.
          async (): Promise<void> => {
            const containers = await navigationBar.openContainers();
            if (await containers.isEnvironmentFilterVisible()) {
              await containers.clearFilterByEnvironment();
            }
          },
          (): Promise<void> => deleteContainer(page, environmentFilterContainer),
          (): Promise<void> => deleteImage(page, environmentFilterImage),
        ];
        // Only delete the machine if this suite created it, to never remove a pre-existing one.
        if (secondMachineCreated) {
          cleanups.push((): Promise<void> => deletePodmanMachine(page, secondMachineVisibleName));
        }
        for (const cleanup of cleanups) {
          try {
            await cleanup();
          } catch (e) {
            errors.push(e);
          }
        }

        if (errors.length > 0) {
          throw new AggregateError(errors, 'One or more cleanup steps failed');
        }
      } finally {
        await runner.close();
      }
    });

    test('Stopping the default Podman machine', async ({ navigationBar, page }) => {
      test.setTimeout(150_000);

      await openPodmanResources(navigationBar, page);
      const defaultMachineCard = new ResourceConnectionCardPage(page, 'podman', defaultMachineVisibleName);
      await playExpect(defaultMachineCard.resourceElementConnectionStatus).toContainText(ResourceElementState.Running);

      await defaultMachineCard.performConnectionAction(ResourceElementActions.Stop);
      await waitForMachineStatus(page, defaultMachineVisibleName, ResourceElementState.Off, {
        initialTimeout: 60_000,
      });
    });

    test('Creating a second Podman machine without starting it', async ({ navigationBar, page }) => {
      test.setTimeout(200_000);

      const resourcesPage = await openPodmanResources(navigationBar, page);
      await resourcesPage.goToCreateNewResourcePage('podman');

      const createMachinePage = new CreateMachinePage(page);
      const resourcesPageAfterCreation = await createMachinePage.createMachine(secondMachineVisibleName, {
        isRootful: true,
        startNow: false,
        setAsDefault: false,
        virtualizationProvider: getVirtualizationProvider(),
      });
      secondMachineCreated = true;

      await playExpect(resourcesPageAfterCreation.heading).toBeVisible();
      const secondMachineCard = new ResourceConnectionCardPage(page, 'podman', secondMachineVisibleName);
      await playExpect(secondMachineCard.resourceElementConnectionStatus).toContainText(ResourceElementState.Off);
    });

    test('Starting the second Podman machine', async ({ navigationBar, page }) => {
      test.setTimeout(300_000);

      await openPodmanResources(navigationBar, page);
      const secondMachineCard = new ResourceConnectionCardPage(page, 'podman', secondMachineVisibleName);
      await secondMachineCard.performConnectionAction(ResourceElementActions.Start);

      // The default machine is stopped, so the second one is reported as running but not default.
      await handleConfirmationDialog({ page, dialogTitle: 'Podman', buttonName: 'Ignore', timeout: 120_000 });

      await waitForMachineStatus(page, secondMachineVisibleName, ResourceElementState.Running, {
        initialTimeout: 60_000,
      });
    });

    test('Starting the default Podman machine again', async ({ navigationBar, page }) => {
      test.setTimeout(210_000);

      await openPodmanResources(navigationBar, page);
      const defaultMachineCard = new ResourceConnectionCardPage(page, 'podman', defaultMachineVisibleName);
      await defaultMachineCard.performConnectionAction(ResourceElementActions.Start);

      await waitForMachineStatus(page, defaultMachineVisibleName, ResourceElementState.Running, {
        initialTimeout: 90_000,
      });
    });

    test('Environment filter becomes visible with two running machines', async ({ navigationBar }) => {
      const containers = await navigationBar.openContainers();
      await playExpect
        .poll(async () => await containers.isEnvironmentFilterVisible(), { timeout: 30_000 })
        .toBeTruthy();
    });

    test('Filtering containers by environment', async ({ navigationBar }) => {
      test.setTimeout(120_000);

      let images = await navigationBar.openImages();
      const pullImagePage = await images.openPullImage();
      images = await pullImagePage.pullImage(environmentFilterImage, 'latest', 60_000, 'podman-machine-default');
      await playExpect
        .poll(async () => await images.waitForImageExists(environmentFilterImage), { timeout: 10_000 })
        .toBeTruthy();

      const imageDetails = await images.openImageDetails(environmentFilterImage);
      const runImage = await imageDetails.openRunImage();
      const containers = await runImage.startContainer(environmentFilterContainer, containerStartParams);
      await playExpect(containers.header).toBeVisible();
      await playExpect
        .poll(async () => await containers.containerExists(environmentFilterContainer), { timeout: 15_000 })
        .toBeTruthy();

      await test.step(`Filter by ${secondMachineDisplayName} shows no containers`, async () => {
        await containers.filterByEnvironment(secondMachineDisplayName);
        await playExpect.poll(async () => await containers.countRowsFromTable(), { timeout: 10_000 }).toBe(0);
      });

      await test.step(`Filter by ${defaultMachineDisplayName} shows the started container`, async () => {
        await containers.filterByEnvironment(defaultMachineDisplayName);
        await playExpect
          .poll(async () => await containers.countRowsFromTable(), { timeout: 10_000 })
          .toBeGreaterThanOrEqual(1);
        await playExpect
          .poll(async () => await containers.containerExists(environmentFilterContainer), { timeout: 10_000 })
          .toBeTruthy();
      });

      await containers.clearFilterByEnvironment();
    });

    test('Cleaning up the test resources', async ({ page }) => {
      test.setTimeout(200_000);

      await deleteContainer(page, environmentFilterContainer);
      await deleteImage(page, environmentFilterImage);
      await deletePodmanMachine(page, secondMachineVisibleName);
      cleanedUp = true;
    });
  });
