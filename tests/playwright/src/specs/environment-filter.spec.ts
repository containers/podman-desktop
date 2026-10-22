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

import { ResourceElementState } from '/@/model/core/states';
import { type ContainerInteractiveParams, PodmanVirtualizationProviders } from '/@/model/core/types';
import { CreateMachinePage } from '/@/model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { deleteContainer, deleteImage, deletePod, deletePodmanMachine, deleteVolume } from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup, waitUntil, waitWhile } from '/@/utility/wait';

const secondMachineVisibleName = 'podman-machine-second';
const secondMachineDisplayName = 'Podman Machine second';
const defaultMachineDisplayName = 'Podman Machine';
const defaultMachineConnectionName = 'podman-machine-default';
const environmentFilterImage = 'ghcr.io/linuxcontainers/alpine';
const environmentFilterContainer = 'environment-filter-container';
const environmentFilterPod = 'environment-filter-pod';
const environmentFilterVolume = 'environment-filter-volume';
const containerStartParams: ContainerInteractiveParams = { attachTerminal: false };

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  runner.setVideoAndTraceName('environment-filter-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  const images = await navigationBar.openImages();
  await waitWhile(async () => await images.pageIsEmpty(), {
    sendError: false,
    message: 'Images page is empty, there are no images present',
  });
});

test.describe
  .serial('Verification of resource filtering by environment', { tag: '@pdmachine' }, () => {
    test.skip(
      isLinux ||
        process.env.TEST_PODMAN_MACHINE !== 'true' ||
        getVirtualizationProvider() === PodmanVirtualizationProviders.HyperV,
      'Test suite requires a second Podman machine; skipped on Linux, when TEST_PODMAN_MACHINE is not set, or when running with Hyper-V (only one Podman machine allowed)',
    );

    test.beforeAll(async ({ page }) => {
      // The "set as default?" Podman dialog fires asynchronously when the
      // second machine finishes starting — potentially in the middle of a
      // later test. Register a locator handler so Playwright auto-dismisses
      // it whenever it appears, before it can block any UI interaction.
      const podmanDialog = page.getByRole('dialog', { name: 'Podman', exact: true });
      await page.addLocatorHandler(podmanDialog, async () => {
        await podmanDialog.getByRole('button', { name: 'Ignore' }).click();
      });
    });

    test.afterAll(async ({ page, runner }) => {
      test.setTimeout(120_000);

      try {
        // Run every cleanup step regardless of individual failures, then re-throw.
        const errors: unknown[] = [];
        for (const cleanup of [
          (): Promise<void> => deletePod(page, environmentFilterPod),
          (): Promise<void> => deleteVolume(page, environmentFilterVolume),
          (): Promise<void> => deleteContainer(page, environmentFilterContainer),
          (): Promise<void> => deleteImage(page, environmentFilterImage),
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

      // createMachine() waits for "Successful operation" and clicks "Go back to
      // resources". The machine may still be STARTING at this point — and the
      // Resources page can stall showing STARTING even after the machine has
      // fully started, because the Svelte component does not always re-render
      // when the underlying state changes. Poll first; if the status has not
      // reached RUNNING within the initial window, navigate away and back to
      // force the UI to pick up the current machine state.
      await playExpect(resourcesPageAfterCreation.heading).toBeVisible();
      let secondMachineCard = new ResourceConnectionCardPage(page, 'podman', secondMachineVisibleName);

      await waitUntil(
        async () =>
          (await secondMachineCard.resourceElementConnectionStatus.innerText()).includes(ResourceElementState.Running),
        { timeout: 60_000, sendError: false },
      );

      const currentStatus = await secondMachineCard.resourceElementConnectionStatus.innerText();
      if (!currentStatus.includes(ResourceElementState.Running)) {
        // Navigate away and back to force the Resources page to refresh the
        // machine connection status from the main process.
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
      const pods = await navigationBar.openPods();
      await playExpect.poll(async () => await pods.isEnvironmentFilterVisible(), { timeout: 30_000 }).toBeTruthy();
    });

    test('Filtering pods by environment', async ({ navigationBar }) => {
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

      const createPodPage = await containers.openCreatePodPage([environmentFilterContainer]);
      const pods = await createPodPage.createPod(environmentFilterPod);
      await playExpect(pods.heading).toBeVisible({ timeout: 60_000 });
      await playExpect.poll(async () => await pods.podExists(environmentFilterPod), { timeout: 15_000 }).toBeTruthy();

      await test.step(`Filter by ${secondMachineDisplayName} shows no pods`, async () => {
        await pods.filterByEnvironment(secondMachineDisplayName);
        await playExpect.poll(async () => await pods.countRowsFromTable(), { timeout: 10_000 }).toBe(0);
      });

      await test.step(`Filter by ${defaultMachineDisplayName} shows the created pod`, async () => {
        await pods.filterByEnvironment(defaultMachineDisplayName);
        await playExpect
          .poll(async () => await pods.countRowsFromTable(), { timeout: 10_000 })
          .toBeGreaterThanOrEqual(1);
        await playExpect.poll(async () => await pods.podExists(environmentFilterPod), { timeout: 10_000 }).toBeTruthy();
      });

      await pods.clearFilterByEnvironment();
    });

    test('Environment filter is visible on the Volumes page', async ({ navigationBar }) => {
      const volumes = await navigationBar.openVolumes();
      await playExpect(volumes.heading).toBeVisible();
      await playExpect.poll(async () => await volumes.isEnvironmentFilterVisible(), { timeout: 30_000 }).toBeTruthy();
    });

    test('Filtering volumes by environment', async ({ navigationBar }) => {
      test.setTimeout(120_000);

      let volumes = await navigationBar.openVolumes();
      await playExpect(volumes.heading).toBeVisible();

      const createVolumePage = await volumes.openCreateVolumePage(environmentFilterVolume);
      volumes = await createVolumePage.createVolume(environmentFilterVolume, defaultMachineConnectionName);
      await playExpect(volumes.heading).toBeVisible({ timeout: 30_000 });
      await playExpect
        .poll(async () => await volumes.waitForVolumeExists(environmentFilterVolume), { timeout: 25_000 })
        .toBeTruthy();

      await test.step(`Filter by ${secondMachineDisplayName} shows no volumes`, async () => {
        await volumes.filterByEnvironment(secondMachineDisplayName);
        await playExpect
          .poll(async () => (await volumes.getVolumeRowByName(environmentFilterVolume)) === undefined, {
            timeout: 15_000,
          })
          .toBeTruthy();
      });

      await test.step(`Filter by ${defaultMachineDisplayName} shows the created volume`, async () => {
        await volumes.filterByEnvironment(defaultMachineDisplayName);
        await playExpect
          .poll(async () => await volumes.countVolumesFromTable(), { timeout: 10_000 })
          .toBeGreaterThanOrEqual(1);
        await playExpect
          .poll(async () => (await volumes.getVolumeRowByName(environmentFilterVolume)) !== undefined, {
            timeout: 10_000,
          })
          .toBeTruthy();
      });

      await volumes.clearFilterByEnvironment();
    });
  });
