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

import type { Page } from '@playwright/test';

import { ResourceElementActions } from '/@/model/core/operations';
import { ResourceElementState } from '/@/model/core/states';
import { PodmanMachinePrivileges, PodmanVirtualizationProviders } from '/@/model/core/types';
import { PodmanMachineDetails } from '/@/model/pages/podman-machine-details-page';
import { PodmanOnboardingPage } from '/@/model/pages/podman-onboarding-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import type { NavigationBar } from '/@/model/workbench/navigation';
import { expect as playExpect, test } from '/@/utility/fixtures';
import {
  createPodmanMachineFromCLI,
  deletePodmanMachine,
  resetPodmanMachinesFromCLI,
  verifyMachinePrivileges,
  verifyVirtualizationProvider,
} from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getDefaultVirtualizationProvider, getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const PODMAN_MACHINE_NAME = 'podman-machine-default';
const PODMAN_MACHINE_VISIBLE_NAME = 'Podman Machine';
const RESOURCE_NAME = 'podman';

const TIMEOUT_SHORT = 10_000;
const TIMEOUT_MEDIUM = 20_000;
const TIMEOUT_STANDARD = 30_000;
const TIMEOUT_LONG = 60_000;
const TIMEOUT_SETUP = 120_000;
const PODMAN_MACHINE_STARTUP_TIMEOUT = 360_000;

test.skip(
  isLinux || process.env.TEST_PODMAN_MACHINE !== 'true',
  'Tests suite should not run on Linux platform or if TEST_PODMAN_MACHINE is not true',
);

test.beforeAll(async ({ runner, welcomePage, page }) => {
  test.setTimeout(TIMEOUT_SETUP);
  runner.setVideoAndTraceName('podman-machine-e2e');
  await welcomePage.handleWelcomePage(true);

  if (process.env.TEST_PODMAN_MACHINE === 'true' || process.env.MACHINE_CLEANUP === 'true') {
    await waitForPodmanMachineStartup(page);
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
  }
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(TIMEOUT_SETUP);

  try {
    if (test.info().status === 'failed') {
      await resetPodmanMachinesFromCLI();
      await createPodmanMachineFromCLI();
      await waitForPodmanMachineStartup(page);
    }
  } catch (error) {
    console.log('Error during cleanup:', error);
  }

  await runner.close();
});

test.describe('Podman Machine verification', { tag: '@pdmachine' }, () => {
  test.describe.configure({ mode: 'serial' });
  test('Setup Podman push notification is present', async ({ page, navigationBar }) => {
    await test.step('Open dashboard and verify notification', async () => {
      const dashboardPage = await navigationBar.openDashboard();
      await playExpect(dashboardPage.mainPage).toBeVisible();
      await playExpect(dashboardPage.notificationsBox).toBeVisible();

      const notificationPodmanSetup = dashboardPage.notificationsBox
        .getByRole('region', { name: 'id:' })
        .filter({ hasText: 'Podman needs to be set up' });
      await playExpect(notificationPodmanSetup).toBeVisible();
      await notificationPodmanSetup.getByTitle('Set up Podman').click();
    });

    await verifyPodmanOnboardingPageVisible(page);
  });

  test('Return to Dashboard and re-open Onboarding through Settings Resources', async ({ page, navigationBar }) => {
    await test.step('Return to dashboard', async () => {
      const dashboardPage = await navigationBar.openDashboard();
      await playExpect(dashboardPage.heading).toBeVisible({ timeout: TIMEOUT_SHORT });
    });

    await test.step('Open onboarding through Settings Resources page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();

      const resourcesPage = new ResourcesPage(page);
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();

      const podmanResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
      await podmanResourceCard.setupButton.click();
    });

    await verifyPodmanOnboardingPageVisible(page);
  });

  test('Verify Podman Autostart is enabled and proceed', async ({ page }) => {
    const podmanOnboardingPage = new PodmanOnboardingPage(page);
    await playExpect(podmanOnboardingPage.podmanAutostartToggle).toBeChecked({ timeout: TIMEOUT_STANDARD });
    await podmanOnboardingPage.nextStepButton.click();
  });

  test('Expect no machine created message and proceed', async ({ page }) => {
    const podmanOnboardingPage = new PodmanOnboardingPage(page);
    await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText(
      `We could not find any Podman machine. Let's create one!`,
      { timeout: TIMEOUT_STANDARD },
    );
    await podmanOnboardingPage.nextStepButton.click();
  });

  test('Verify default podman machine settings', async ({ page }) => {
    const podmanOnboardingPage = new PodmanOnboardingPage(page);
    const { machineCreationForm } = podmanOnboardingPage;

    await test.step('Verify page title and form visibility', async () => {
      await playExpect(podmanOnboardingPage.createMachinePageTitle).toHaveText('Create a Podman machine', {
        timeout: TIMEOUT_STANDARD,
      });
      await playExpect(machineCreationForm.podmanMachineConfiguration).toBeVisible();
    });

    await test.step('Verify default form values', async () => {
      await playExpect(machineCreationForm.podmanMachineName).toHaveValue(PODMAN_MACHINE_NAME);
      await playExpect(machineCreationForm.imagePathBox).toHaveValue('');
      await playExpect(machineCreationForm.rootPrivilegesCheckbox).toBeChecked();
      await playExpect(machineCreationForm.startNowCheckbox).toBeChecked();
    });

    await machineCreationForm.specifyVirtualizationProvider(getVirtualizationProvider());

    await test.step('Verify platform-specific settings', async () => {
      if (os.platform() === 'win32') {
        if (getVirtualizationProvider() !== PodmanVirtualizationProviders.HyperV) {
          await playExpect(machineCreationForm.userModeNetworkingCheckbox).not.toBeChecked({
            timeout: TIMEOUT_STANDARD,
          });
        }
      } else {
        await playExpect(machineCreationForm.podmanMachineCPUs).toBeVisible({ timeout: TIMEOUT_STANDARD });
        await playExpect(machineCreationForm.podmanMachineMemory).toBeVisible();
        await playExpect(machineCreationForm.podmanMachineDiskSize).toBeVisible();
      }
    });
  });

  test('Create a default Podman machine', async ({ page }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(PODMAN_MACHINE_STARTUP_TIMEOUT + TIMEOUT_STANDARD);

    const podmanOnboardingPage = new PodmanOnboardingPage(page);

    await test.step('Initiate machine creation', async () => {
      await podmanOnboardingPage.machineCreationForm.createMachineButton.click();
      await playExpect(podmanOnboardingPage.podmanMachineShowLogsButton).toBeVisible();
      await podmanOnboardingPage.podmanMachineShowLogsButton.click();
    });

    await test.step('Wait for machine creation to complete', async () => {
      await playExpect(podmanOnboardingPage.onboardingStatusMessage).toBeVisible({
        timeout: PODMAN_MACHINE_STARTUP_TIMEOUT,
      });
      await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText('Podman installed');
      await podmanOnboardingPage.nextStepButton.click();
    });
  });

  test('Open and verify podman machine details', async ({ page, navigationBar }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(TIMEOUT_SETUP);

    await test.step('Verify machine configuration on resource card', async () => {
      await navigationBar.openDashboard();
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();

      const resourcesPage = new ResourcesPage(page);
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();

      const resourcesPodmanConnections = new ResourceConnectionCardPage(page, RESOURCE_NAME, PODMAN_MACHINE_NAME);
      await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: TIMEOUT_SHORT });
      await verifyMachinePrivileges(resourcesPodmanConnections, PodmanMachinePrivileges.Rootful);
      await verifyVirtualizationProvider(
        resourcesPodmanConnections,
        getVirtualizationProvider() ?? getDefaultVirtualizationProvider(),
      );
    });

    const podmanMachineDetails = await openMachineDetailsPage(page, navigationBar);

    await test.step('Verify details page elements', async () => {
      await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
    });
  });

  test('Podman machine operations - STOP', async ({ page, navigationBar }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(TIMEOUT_SETUP + TIMEOUT_LONG);

    const podmanMachineDetails = await openMachineDetailsPage(page, navigationBar);

    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
      timeout: TIMEOUT_SETUP,
    });
    await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
    await podmanMachineDetails.podmanMachineStopButton.click();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off, {
      timeout: TIMEOUT_LONG,
    });
  });

  test('Podman machine operations - START', async ({ page, navigationBar }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(PODMAN_MACHINE_STARTUP_TIMEOUT + TIMEOUT_STANDARD);

    const podmanMachineDetails = await openMachineDetailsPage(page, navigationBar);

    await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
    await podmanMachineDetails.podmanMachineStartButton.click();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
      timeout: PODMAN_MACHINE_STARTUP_TIMEOUT,
    });
  });

  test('Podman machine operations - RESTART', async ({ page, navigationBar }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(PODMAN_MACHINE_STARTUP_TIMEOUT + TIMEOUT_STANDARD);

    const podmanMachineDetails = await openMachineDetailsPage(page, navigationBar);

    await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeEnabled();
    await podmanMachineDetails.podmanMachineRestartButton.click();
    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off, {
      timeout: TIMEOUT_LONG,
    });

    await openMachineDetailsPage(page, navigationBar);

    await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
      timeout: PODMAN_MACHINE_STARTUP_TIMEOUT,
    });
  });

  test('Podman machine operations - EDIT privileges', async ({ page, navigationBar }) => {
    test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');
    test.setTimeout(TIMEOUT_SETUP + TIMEOUT_LONG);

    const TOGGLE_TIMEOUT = 120_000;

    await test.step('Navigate to resources page', async () => {
      await navigationBar.openDashboard();
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    const resourcesPage = new ResourcesPage(page);
    await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();

    const resourcesPodmanConnections = new ResourceConnectionCardPage(page, RESOURCE_NAME, PODMAN_MACHINE_NAME);
    await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: TIMEOUT_MEDIUM });

    await test.step('Toggle machine privileges to rootless', async () => {
      await resourcesPodmanConnections.performConnectionAction(ResourceElementActions.Edit);
      await resourcesPodmanConnections.toggleMachinePrivileges(PodmanMachinePrivileges.Rootless, TOGGLE_TIMEOUT);
    });

    await test.step('Wait for machine to restart and verify rootless', async () => {
      const restartButton = resourcesPodmanConnections.resourceElementConnectionActions.getByRole('button', {
        name: ResourceElementActions.Restart,
        exact: true,
      });
      await playExpect(restartButton).toBeEnabled({ timeout: TOGGLE_TIMEOUT });
      await verifyMachinePrivileges(resourcesPodmanConnections, PodmanMachinePrivileges.Rootless);
    });

    await test.step('Toggle machine privileges back to rootful', async () => {
      await resourcesPodmanConnections.performConnectionAction(ResourceElementActions.Edit);
      await resourcesPodmanConnections.toggleMachinePrivileges(PodmanMachinePrivileges.Rootful, TOGGLE_TIMEOUT);
    });

    await test.step('Wait for machine to restart and verify rootful', async () => {
      const restartButton = resourcesPodmanConnections.resourceElementConnectionActions.getByRole('button', {
        name: ResourceElementActions.Restart,
        exact: true,
      });
      await playExpect(restartButton).toBeEnabled({ timeout: TOGGLE_TIMEOUT });
      await verifyMachinePrivileges(resourcesPodmanConnections, PodmanMachinePrivileges.Rootful);
    });
  });

  test('Clean Up Podman Machine', async ({ page }) => {
    test.skip(process.env.MACHINE_CLEANUP !== 'true', 'Machine cleanup is disabled');
    await deletePodmanMachine(page, PODMAN_MACHINE_VISIBLE_NAME);
  });
});

async function verifyPodmanOnboardingPageVisible(page: Page): Promise<void> {
  const onboardingPage = new PodmanOnboardingPage(page);
  await playExpect(onboardingPage.header).toBeVisible();
  await playExpect(onboardingPage.mainPage).toBeVisible();
}

async function openMachineDetailsPage(
  page: Page,
  navigationBar: NavigationBar,
  machineName: string = PODMAN_MACHINE_NAME,
): Promise<PodmanMachineDetails> {
  const dashboardPage = await navigationBar.openDashboard();
  await playExpect(dashboardPage.heading).toBeVisible({ timeout: TIMEOUT_SHORT });
  const settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();

  const resourcesPage = new ResourcesPage(page);
  await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();

  const resourcesPodmanConnections = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineName);
  await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: TIMEOUT_MEDIUM });
  await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
  await resourcesPodmanConnections.resourceElementDetailsButton.click();

  return new PodmanMachineDetails(page, machineName);
}
