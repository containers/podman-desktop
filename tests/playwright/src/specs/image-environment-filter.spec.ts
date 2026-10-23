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

import { ResourceElementState } from '/@/model/core/states';
import { PodmanVirtualizationProviders } from '/@/model/core/types';
import { CreateMachinePage } from '/@/model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { deleteImage, deletePodmanMachine } from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup, waitUntil } from '/@/utility/wait';

const secondMachineVisibleName = 'podman-machine-second';
const secondMachineDisplayName = 'Podman Machine second';
const defaultMachineDisplayName = 'Podman Machine';
const environmentFilterImage = 'ghcr.io/linuxcontainers/alpine';

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('images-environment-filter-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.describe
  .serial('Verification of image filtering by environment', { tag: '@pdmachine' }, () => {
    test.skip(
      isLinux ||
        process.env.TEST_PODMAN_MACHINE !== 'true' ||
        getVirtualizationProvider() === PodmanVirtualizationProviders.HyperV,
      'Test suite requires a second Podman machine; skipped on Linux, when TEST_PODMAN_MACHINE is not set, or when running with Hyper-V (only one Podman machine allowed)',
    );

    test.beforeAll(async ({ page }) => {
      // The "set as default?" Podman dialog fires asynchronously when the
      // second machine finishes starting, potentially in the middle of a
      // later test. Register a locator handler so Playwright auto-dismisses
      // it whenever it appears, before it can block any UI interaction.
      const podmanDialog = page.getByRole('dialog', { name: 'Podman', exact: true });
      await page.addLocatorHandler(podmanDialog, async () => {
        await podmanDialog.getByRole('button', { name: 'Ignore' }).click();
      });
    });

    test.afterAll(async ({ page, runner, navigationBar }) => {
      test.setTimeout(120_000);

      try {
        // Run every cleanup step regardless of individual failures, then re-throw.
        const errors: unknown[] = [];
        for (const cleanup of [
          async (): Promise<void> => {
            // A failed assertion can leave the filter set, which would hide the image from deleteImage().
            const images = await navigationBar.openImages();
            if (await images.isEnvironmentFilterVisible()) {
              await images.clearFilterByEnvironment();
            }
            await deleteImage(page, environmentFilterImage);
          },
          (): Promise<void> => deletePodmanMachine(page, secondMachineVisibleName),
        ]) {
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

    test('Creating a second Podman machine', async ({ navigationBar, page }) => {
      test.setTimeout(200_000);

      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible('podman')).toBeTruthy();
      await resourcesPage.goToCreateNewResourcePage('podman');

      const createMachinePage = new CreateMachinePage(page);
      const resourcesPageAfterCreation = await createMachinePage.createMachine(secondMachineVisibleName, {
        isRootful: true,
        startNow: true,
        setAsDefault: false,
        virtualizationProvider: getVirtualizationProvider(),
      });

      // The Resources page can stall showing STARTING even after the machine has
      // fully started. Poll first; if the status has not reached RUNNING within
      // the initial window, navigate away and back to force a refresh.
      await playExpect(resourcesPageAfterCreation.heading).toBeVisible();
      let secondMachineCard = new ResourceConnectionCardPage(page, 'podman', secondMachineVisibleName);

      await waitUntil(
        async () =>
          (await secondMachineCard.resourceElementConnectionStatus.innerText()).includes(ResourceElementState.Running),
        { timeout: 60_000, sendError: false },
      );

      const currentStatus = await secondMachineCard.resourceElementConnectionStatus.innerText();
      if (!currentStatus.includes(ResourceElementState.Running)) {
        await navigationBar.openDashboard();
        const refreshedSettingsBar = await navigationBar.openSettings();
        await refreshedSettingsBar.resourcesTab.click();
        await playExpect(resourcesPageAfterCreation.heading).toBeVisible();
        secondMachineCard = new ResourceConnectionCardPage(page, 'podman', secondMachineVisibleName);
      }

      await playExpect(secondMachineCard.resourceElementConnectionStatus).toContainText(ResourceElementState.Running, {
        timeout: 120_000,
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
      images = await pullImagePage.pullImage(environmentFilterImage, 'latest', 60_000, 'podman-machine-default');
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

      await images.clearFilterByEnvironment();
    });
  });
