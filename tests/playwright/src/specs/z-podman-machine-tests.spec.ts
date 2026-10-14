/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { Locator, Page } from '@playwright/test';

import { ResourceElementState } from '/@/model/core/states';
import { PodmanMachinePrivileges } from '/@/model/core/types';
import { PodmanMachineDetails } from '/@/model/pages/podman-machine-details-page';
import { PodmanOnboardingPage } from '/@/model/pages/podman-onboarding-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourceCreationPage } from '/@/model/pages/resource-creation-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import type { NavigationBar } from '/@/model/workbench/navigation';
import { expect as playExpect, test } from '/@/utility/fixtures';
import {
  createPodmanMachineFromCLI,
  deletePodmanMachine,
  handlePodmanConfirmationDialogs,
  resetPodmanMachinesFromCLI,
  verifyMachinePrivileges,
  verifyVirtualizationProvider,
} from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getDefaultVirtualizationProvider, getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const DEFAULT_PODMAN_MACHINE = 'Podman Machine';
const DEFAULT_PODMAN_MACHINE_VISIBLE = 'podman-machine-default';
const ROOTLESS_PODMAN_MACHINE_VISIBLE = 'podman-machine-rootless';
const ROOTLESS_PODMAN_MACHINE = 'Podman Machine rootless';
const RESOURCE_NAME = 'podman';

// Timeout constants
const TIMEOUT_SHORT = 10_000;
const TIMEOUT_MEDIUM = 30_000;
const TIMEOUT_LONG = 60_000;
const TIMEOUT_VERY_LONG = 90_000;
const TIMEOUT_MACHINE_CREATION = 200_000;
const TIMEOUT_AFTER_ALL = 180_000;

let dialog: Locator;

test.skip(
  isLinux || process.env.TEST_PODMAN_MACHINE !== 'true',
  'Tests suite should not run on Linux platform or if TEST_PODMAN_MACHINE is not true',
);

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('podman-machine-tests');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  dialog = page.getByRole('dialog', { name: 'Podman', exact: true });
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(TIMEOUT_AFTER_ALL);

  try {
    if (test.info().status === 'failed') {
      await resetPodmanMachinesFromCLI();
      await createPodmanMachineFromCLI();
      await waitForPodmanMachineStartup(page);
    }

    await handlePodmanConfirmationDialogs(page);
  } catch (error) {
    console.log('No handling dialog displayed', error);
  }

  await runner.close();
});

test.describe('Podman provider creation page navigation', { tag: ['@pdmachine'] }, () => {
  test.describe.configure({ mode: 'serial' });
  test('Resources breadcrumb navigates back to Resources page', async ({ page, navigationBar }) => {
    await openPodmanCreationPage(page, navigationBar);
    const creationPage = new ResourceCreationPage(page);
    await creationPage.navigateToResourcesViaBreadcrumb();
  });

  test('Close button navigates back to Resources page', async ({ page, navigationBar }) => {
    await openPodmanCreationPage(page, navigationBar);
    const creationPage = new ResourceCreationPage(page);
    await creationPage.navigateToResourcesViaCloseButton();
  });
});

test.describe('Podman machine switching validation ', { tag: '@pdmachine' }, () => {
  test.describe.configure({ mode: 'serial', timeout: TIMEOUT_AFTER_ALL });

  test('Check data for available Podman Machine and stop machine', async ({ page, navigationBar }) => {
    await test.step('Open resources page', async () => {
      await openResourcesPage(navigationBar);
    });

    await test.step('Check default podman machine', async () => {
      await navigateToMachineDetailsPage(page, DEFAULT_PODMAN_MACHINE_VISIBLE);
    });

    await test.step('Check default podman machine details', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);
      await test.step('Ensure default podman machine is RUNNING', async () => {
        await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
          timeout: TIMEOUT_LONG,
        });
      });

      await test.step('Check terminal tab for podman machine', async () => {
        await playExpect(podmanMachineDetails.terminalTab).toBeVisible();
        await podmanMachineDetails.terminalTab.click();
        await playExpect(podmanMachineDetails.terminalContent).toBeVisible();
        await playExpect(podmanMachineDetails.terminalContent).toContainText('@', {
          timeout: TIMEOUT_MEDIUM,
        });
        await podmanMachineDetails.terminalInput.pressSequentially('pwd', { delay: 15 });
        await podmanMachineDetails.terminalInput.press('Enter');
        await playExpect(podmanMachineDetails.terminalContent).toContainText('/home/', {
          timeout: TIMEOUT_MEDIUM,
        });
      });

      await test.step('Stop default podman machine', async () => {
        await stopMachineAndVerifyLogs(podmanMachineDetails, DEFAULT_PODMAN_MACHINE_VISIBLE, 'stopped successfully');
      });
    });
  });

  test('Create rootless podman machine', async ({ page, navigationBar }) => {
    test.setTimeout(TIMEOUT_MACHINE_CREATION);

    await test.step('Open resources page', async () => {
      await openResourcesPage(navigationBar);
    });

    const resourcesPage = new ResourcesPage(page);
    await test.step('Go to create new podman machine page', async () => {
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
    });

    const podmanMachineCreatePage = new PodmanOnboardingPage(page);

    await test.step('Create podman machine', async () => {
      await podmanMachineCreatePage.machineCreationForm.setupAndCreateMachine(ROOTLESS_PODMAN_MACHINE_VISIBLE, {
        isRootful: false,
        enableUserNet: false,
        startNow: false,
        virtualizationProvider: getVirtualizationProvider(),
      });
      await playExpect(podmanMachineCreatePage.goBackButton).toBeEnabled({ timeout: TIMEOUT_MACHINE_CREATION });
      await podmanMachineCreatePage.goBackButton.click();
    });

    await playExpect(resourcesPage.heading).toBeVisible();
    const podmanResources = new ResourceConnectionCardPage(page, 'podman', ROOTLESS_PODMAN_MACHINE_VISIBLE);
    await verifyMachinePrivileges(podmanResources, PodmanMachinePrivileges.Rootless);
    await verifyVirtualizationProvider(
      podmanResources,
      getVirtualizationProvider() ?? getDefaultVirtualizationProvider(),
    );
  });

  test('Switch to rootless podman machine', async ({ page }) => {
    await test.step('Go to rootless podman machine details page', async () => {
      await navigateToMachineDetailsPage(page, ROOTLESS_PODMAN_MACHINE_VISIBLE, TIMEOUT_MEDIUM);
    });

    await test.step('Check rootless podman machine details', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, ROOTLESS_PODMAN_MACHINE);
      await test.step('Ensure rootless podman machine is OFF', async () => {
        await playExpect(podmanMachineDetails.podmanMachineName).toBeVisible();
        await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off);
      });

      await test.step('Start rootless podman machine', async () => {
        await startMachineAndVerifyLogs(
          page,
          podmanMachineDetails,
          ROOTLESS_PODMAN_MACHINE_VISIBLE,
          'started successfully',
        );
      });

      await test.step('Restart rootless podman machine', async () => {
        await restartMachineAndVerifyLogs(
          podmanMachineDetails,
          ROOTLESS_PODMAN_MACHINE_VISIBLE,
          'stopped successfully',
        );
      });
    });
  });

  test('Stop rootless podman machine', async ({ page }) => {
    const podmanMachineDetails = new PodmanMachineDetails(page, ROOTLESS_PODMAN_MACHINE);
    await test.step('Ensure rootless podman machine is RUNNING', async () => {
      await playExpect(podmanMachineDetails.podmanMachineName).toBeVisible();
      await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running);
    });

    await test.step('Stop rootless podman machine', async () => {
      await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
      await podmanMachineDetails.podmanMachineStopButton.click();
      await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off, {
        timeout: TIMEOUT_LONG,
      });
    });
  });

  test('Restart default podman machine', async ({ page, navigationBar }) => {
    await test.step('Open resources page', async () => {
      await openResourcesPage(navigationBar);
    });

    await test.step('Go to default podman machine details page', async () => {
      await navigateToMachineDetailsPage(page, DEFAULT_PODMAN_MACHINE_VISIBLE);
    });

    await test.step('Turn default podman machine on', async () => {
      const podmanMachineDetails = new PodmanMachineDetails(page, DEFAULT_PODMAN_MACHINE);

      await startMachineAndVerifyLogs(
        page,
        podmanMachineDetails,
        DEFAULT_PODMAN_MACHINE_VISIBLE,
        'started successfully',
      );
    });
  });

  test('Clean up rootless podman machine', async ({ page }) => {
    await deletePodmanMachine(page, ROOTLESS_PODMAN_MACHINE_VISIBLE);
    await handlePodmanConfirmationDialogs(page);
  });
});

// Helper functions

/**
 * Opens the Resources page from the navigation bar
 */
async function openResourcesPage(navigationBar: NavigationBar): Promise<void> {
  const settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();
}

/**
 * Navigates to the Podman machine creation page from the Resources page
 */
async function openPodmanCreationPage(page: Page, navigationBar: NavigationBar): Promise<void> {
  await test.step('Open resources page and go to podman creation page', async () => {
    await openResourcesPage(navigationBar);
    const resourcesPage = new ResourcesPage(page);
    await playExpect(resourcesPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), { timeout: 25_000 })
      .toBeTruthy();
    await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
  });
}

/**
 * Navigates to a Podman machine details page from the Resources page
 */
async function navigateToMachineDetailsPage(
  page: Page,
  machineVisibleName: string,
  timeout: number = TIMEOUT_SHORT,
): Promise<void> {
  const resourcesPage = new ResourcesPage(page);
  await playExpect(resourcesPage.heading).toBeVisible();
  await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
  const resourcesPodmanConnections = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineVisibleName);
  await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: TIMEOUT_SHORT });
  await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: TIMEOUT_MEDIUM });
  await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible({ timeout });
  await resourcesPodmanConnections.resourceElementDetailsButton.click();
}

/**
 * Starts a Podman machine and verifies it's running with logs
 */
async function startMachineAndVerifyLogs(
  page: Page,
  podmanMachineDetails: PodmanMachineDetails,
  machineVisibleName: string,
  expectedLogMessage: string,
): Promise<void> {
  await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
  await podmanMachineDetails.podmanMachineStartButton.click();

  await playExpect(dialog).toBeVisible({ timeout: TIMEOUT_LONG });
  await handlePodmanConfirmationDialogs(page);

  await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
    timeout: TIMEOUT_VERY_LONG,
  });
  await playExpect(podmanMachineDetails.logsTab).toBeEnabled();
  await podmanMachineDetails.logsTab.click();
  await playExpect(
    podmanMachineDetails.tabContent.getByText(`Machine "${machineVisibleName}" ${expectedLogMessage}`).last(),
  ).toBeVisible({ timeout: TIMEOUT_SHORT });
}

/**
 * Stops a Podman machine and verifies it's stopped with logs
 */
async function stopMachineAndVerifyLogs(
  podmanMachineDetails: PodmanMachineDetails,
  machineVisibleName: string,
  expectedLogMessage: string,
): Promise<void> {
  await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
  await podmanMachineDetails.podmanMachineStopButton.click();
  await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off, {
    timeout: TIMEOUT_LONG,
  });
  await playExpect(podmanMachineDetails.logsTab).toBeEnabled();
  await podmanMachineDetails.logsTab.click();
  await playExpect(
    podmanMachineDetails.tabContent.getByText(`Machine "${machineVisibleName}" ${expectedLogMessage}`).last(),
  ).toBeVisible({ timeout: TIMEOUT_SHORT });
}

/**
 * Restarts a Podman machine and verifies the restart cycle with logs
 */
async function restartMachineAndVerifyLogs(
  podmanMachineDetails: PodmanMachineDetails,
  machineVisibleName: string,
  expectedLogMessage: string,
): Promise<void> {
  await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeEnabled();
  await podmanMachineDetails.podmanMachineRestartButton.click();
  await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Off, {
    timeout: TIMEOUT_VERY_LONG,
  });
  await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText(ResourceElementState.Running, {
    timeout: TIMEOUT_VERY_LONG,
  });
  await playExpect(podmanMachineDetails.logsTab).toBeEnabled();
  await podmanMachineDetails.logsTab.click();
  await playExpect(
    podmanMachineDetails.tabContent.getByText(`Machine "${machineVisibleName}" ${expectedLogMessage}`).last(),
  ).toBeVisible({ timeout: TIMEOUT_SHORT });
}
