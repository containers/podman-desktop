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

import type { Locator, Page } from '@playwright/test';

import type { DashboardPage } from '../model/pages/dashboard-page';
import { PodmanMachineDetails } from '../model/pages/podman-machine-details-page';
import { PodmanOnboardingPage } from '../model/pages/podman-onboarding-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import type { SettingsBar } from '../model/pages/settings-bar';
import { expect as playExpect, test } from '../utility/fixtures';
import { createPodmanMachineFromCLI, deletePodmanMachine } from '../utility/operations';
import { isLinux } from '../utility/platform';
import { waitForPodmanMachineStartup } from '../utility/wait';

const PODMAN_MACHINE_STARTUP_TIMEOUT: number = 360_000;
const PODMAN_FULL_STARTUP_TIMEOUT = PODMAN_MACHINE_STARTUP_TIMEOUT + 30000;
const PODMAN_MACHINE_NAME: string = 'podman-machine-default';
const RESOURCE_NAME: string = 'podman';

let dashboardPage: DashboardPage;
let resourcesPage: ResourcesPage;
let settingsBar: SettingsBar;
let podmanOnboardingPage: PodmanOnboardingPage;

let notificationPodmanSetup: Locator;

test.skip(
  isLinux || process.env.TEST_PODMAN_MACHINE !== 'true',
  'Tests suite should not run on Linux platform or if TEST_PODMAN_MACHINE is not true',
);

test.beforeAll(async ({ runner, welcomePage, page }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('podman-machine-e2e');

  await welcomePage.handleWelcomePage(true);

  // Delete machine if it already exists
  if (
    (process.env.TEST_PODMAN_MACHINE !== undefined && process.env.TEST_PODMAN_MACHINE === 'true') ||
    (process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true')
  ) {
    await waitForPodmanMachineStartup(page);
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
  }
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);

  if (test.info().status === 'failed') {
    await createPodmanMachineFromCLI();
  }

  await runner.close();
});

test.describe
  .serial('Podman Machine verification', () => {
    test.describe
      .serial('Podman Machine onboarding workflow', () => {
        test('Setup Podman push notification is present', async ({ navigationBar }) => {
          dashboardPage = await navigationBar.openDashboard();
          await playExpect(dashboardPage.mainPage).toBeVisible();
          await playExpect(dashboardPage.notificationsBox).toBeVisible();
          notificationPodmanSetup = dashboardPage.notificationsBox
            .getByRole('region', { name: 'id:' })
            .filter({ hasText: 'Podman needs to be set up' });
          await playExpect(notificationPodmanSetup).toBeVisible();
        });

        test.describe
          .serial('Onboarding navigation', () => {
            test('Open Podman Machine Onboarding through Setup Notification', async ({ page }) => {
              await notificationPodmanSetup.getByTitle('Set up Podman').click();
              podmanOnboardingPage = await checkPodmanMachineOnboardingPage(page);
            });

            test('Return to Dashboard', async ({ navigationBar }) => {
              dashboardPage = await navigationBar.openDashboard();
              await playExpect(dashboardPage.mainPage).toBeVisible();
            });

            test('Re-Open Podman Machine Onboarding through Settings Resources page', async ({
              page,
              navigationBar,
            }) => {
              settingsBar = await navigationBar.openSettings();
              await settingsBar.resourcesTab.click();
              resourcesPage = new ResourcesPage(page);
              await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
              const podmanResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
              await podmanResourceCard.setupButton.click();
              podmanOnboardingPage = await checkPodmanMachineOnboardingPage(page);
            });
          });
        test('Verify Podman Autostart is enabled and proceed to next page', async () => {
          await playExpect(podmanOnboardingPage.podmanAutostartToggle).toBeChecked({ timeout: 30_000 });
          await podmanOnboardingPage.nextStepButton.click();
        });

        test('Expect no machine created message and proceed to next page', async () => {
          await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText(
            `We could not find any Podman machine. Let's create one!`,
            { timeout: 30_000 },
          );
          await podmanOnboardingPage.nextStepButton.click();
        });

        test('Verify default podman machine settings', async () => {
          await playExpect(podmanOnboardingPage.createMachinePageTitle).toHaveText(`Create a Podman machine`, {
            timeout: 30_000,
          });
          await playExpect(podmanOnboardingPage.machineCreationForm.podmanMachineConfiguration).toBeVisible();
          await playExpect(podmanOnboardingPage.machineCreationForm.podmanMachineName).toHaveValue(
            'podman-machine-default',
          );
          await playExpect(podmanOnboardingPage.machineCreationForm.imagePathBox).toHaveValue('');
          await playExpect(podmanOnboardingPage.machineCreationForm.rootPriviledgesCheckbox).toBeChecked();
          await playExpect(podmanOnboardingPage.machineCreationForm.startNowCheckbox).toBeChecked();

          if (os.platform() === 'win32') {
            await playExpect(podmanOnboardingPage.machineCreationForm.userModeNetworkingCheckbox).not.toBeChecked({
              timeout: 30_000,
            });
          } else {
            await playExpect(podmanOnboardingPage.machineCreationForm.podmanMachineCPUs).toBeVisible({
              timeout: 30_000,
            });
            await playExpect(podmanOnboardingPage.machineCreationForm.podmanMachineMemory).toBeVisible();
            await playExpect(podmanOnboardingPage.machineCreationForm.podmanMachineDiskSize).toBeVisible();
          }
        });
      });
    test.describe
      .serial('Podman Machine creation and operations', () => {
        test.skip(process.env.TEST_PODMAN_MACHINE !== 'true');

        test('Create a default Podman machine', async () => {
          test.setTimeout(PODMAN_FULL_STARTUP_TIMEOUT);
          await podmanOnboardingPage.machineCreationForm.createMachineButton.click();
          await playExpect(podmanOnboardingPage.podmanMachineShowLogsButton).toBeVisible();
          await podmanOnboardingPage.podmanMachineShowLogsButton.click();
          await playExpect(podmanOnboardingPage.onboardingStatusMessage).toBeVisible({
            timeout: PODMAN_MACHINE_STARTUP_TIMEOUT,
          });
          await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText('Podman installed');
          await podmanOnboardingPage.nextStepButton.click();
        });

        test.describe
          .serial('Podman machine operations', () => {
            test.describe.configure({ timeout: 120000 });

            test('Open podman machine details', async ({ page, navigationBar }) => {
              dashboardPage = await navigationBar.openDashboard();
              await playExpect(dashboardPage.mainPage).toBeVisible();
              settingsBar = await navigationBar.openSettings();
              await settingsBar.resourcesTab.click();
              resourcesPage = new ResourcesPage(page);
              await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
              const resourcesPodmanConnections = new ResourceConnectionCardPage(
                page,
                RESOURCE_NAME,
                PODMAN_MACHINE_NAME,
              );
              await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: 10_000 });
              await playExpect(resourcesPodmanConnections.resourceElement).toBeVisible({ timeout: 20_000 });
              await playExpect(resourcesPodmanConnections.resourceElementDetailsButton).toBeVisible();
              await resourcesPodmanConnections.resourceElementDetailsButton.click();
              const podmanMachineDetails = new PodmanMachineDetails(page, PODMAN_MACHINE_NAME);
              await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
              await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
              await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
              await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
              await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
              await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
            });

            test('Podman machine operations - STOP', async ({ page }) => {
              const podmanMachineDetails = new PodmanMachineDetails(page, PODMAN_MACHINE_NAME);
              await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 60_000 });
              await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeEnabled();
              await podmanMachineDetails.podmanMachineStopButton.click();
              await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 60_000 });
            });

            test('Podman machine operations - START', async ({ page }) => {
              const podmanMachineDetails = new PodmanMachineDetails(page, PODMAN_MACHINE_NAME);
              await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeEnabled();
              await podmanMachineDetails.podmanMachineStartButton.click();
              await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 90_000 });
            });

            test('Podman machine operations - RESTART', async ({ page }) => {
              const podmanMachineDetails = new PodmanMachineDetails(page, PODMAN_MACHINE_NAME);
              await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeEnabled();
              await podmanMachineDetails.podmanMachineRestartButton.click();
              await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 60_000 });
              await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 90_000 });
            });
          });
      });

    test('Clean Up Podman Machine', async ({ page }) => {
      test.skip(process.env.MACHINE_CLEANUP !== 'true', 'Machine cleanup is disabled');
      await deletePodmanMachine(page, 'Podman Machine');
    });
  });

async function checkPodmanMachineOnboardingPage(page: Page): Promise<PodmanOnboardingPage> {
  const onboardingPage = new PodmanOnboardingPage(page);
  await playExpect(onboardingPage.header).toBeVisible();
  await playExpect(onboardingPage.mainPage).toBeVisible();
  return onboardingPage;
}
