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

import type { Locator } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import type { Page } from 'playwright';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import type { DashboardPage } from '../model/pages/dashboard-page';
import { PodmanMachineDetails } from '../model/pages/podman-machine-details-page';
import { PodmanOnboardingPage } from '../model/pages/podman-onboarding-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { ResourcesPodmanConnections } from '../model/pages/resources-podman-connections-page';
import type { SettingsBar } from '../model/pages/settings-bar';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { deletePodmanMachine } from '../utility/operations';

const PODMAN_MACHINE_STARTUP_TIMEOUT: number = 360_000;
const PODMAN_MACHINE_NAME: string = 'Podman Machine';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let dashboardPage: DashboardPage;
let resourcesPage: ResourcesPage;
let settingsBar: SettingsBar;
let navigationBar: NavigationBar;
let podmanOnboardingPage: PodmanOnboardingPage;

let notificationPodmanSetup: Locator;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-machine-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navigationBar = new NavigationBar(page);

  // Delete machine if it already exists
  if (
    (process.env.TEST_PODMAN_MACHINE !== undefined && process.env.TEST_PODMAN_MACHINE === 'true') ||
    (process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true')
  ) {
    await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
  }
});

afterAll(async () => {
  await pdRunner.close();
}, 120000);

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe.skipIf(os.platform() === 'linux')('Podman Machine verification', async () => {
  describe('Podman Machine onboarding workflow', async () => {
    test('Setup Podman push notification is present', async () => {
      dashboardPage = await navigationBar.openDashboard();
      await playExpect(dashboardPage.mainPage).toBeVisible();
      await playExpect(dashboardPage.notificationsBox).toBeVisible();
      notificationPodmanSetup = dashboardPage.notificationsBox
        .getByRole('region', { name: 'id:' })
        .filter({ hasText: 'Podman needs to be set up' });
      await playExpect(notificationPodmanSetup).toBeVisible();
    });
    describe('Onboarding navigation', async () => {
      test('Open Podman Machine Onboarding through Setup Notification', async () => {
        await notificationPodmanSetup.getByTitle('Set up Podman').click();
        podmanOnboardingPage = await checkPodmanMachineOnboardingPage(page);
      });
      test('Return to Dashboard', async () => {
        dashboardPage = await navigationBar.openDashboard();
        await playExpect(dashboardPage.mainPage).toBeVisible();
      });
      test('Re-Open Podman Machine Onboarding through Settings Resources page', async () => {
        settingsBar = await navigationBar.openSettings();
        await settingsBar.resourcesTab.click();
        resourcesPage = new ResourcesPage(page);
        await playExpect(resourcesPage.podmanResources).toBeVisible();
        await resourcesPage.podmanResources.getByLabel('Setup Podman').click();
        podmanOnboardingPage = await checkPodmanMachineOnboardingPage(page);
      });
    });
    test('Verify Podman Autostart is enabled and proceed to next page', async () => {
      await playExpect(podmanOnboardingPage.podmanAutostartToggle).toBeChecked();
      await podmanOnboardingPage.nextStepButton.click();
    });
    test('Expect no machine created message and proceed to next page', async () => {
      await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText(
        `We could not find any Podman machine. Let's create one!`,
      );
      await podmanOnboardingPage.nextStepButton.click();
    });
    test('Verify default podman machine settings', async () => {
      await playExpect(podmanOnboardingPage.createMachinePageTitle).toHaveText(`Create a Podman machine`);
      await playExpect(podmanOnboardingPage.podmanMachineConfiguration).toBeVisible();
      await playExpect(podmanOnboardingPage.podmanMachineName).toHaveValue('podman-machine-default');
      await playExpect(podmanOnboardingPage.podmanMachineCPUs).toBeVisible();
      await playExpect(podmanOnboardingPage.podmanMachineMemory).toBeVisible();
      await playExpect(podmanOnboardingPage.podmanMachineDiskSize).toBeVisible();
      await playExpect(podmanOnboardingPage.podmanMachineImage).toHaveValue('');
      await playExpect(podmanOnboardingPage.podmanMachineRootfulCheckbox).toBeChecked();
      await playExpect(podmanOnboardingPage.podmanMachineUserModeNetworkingCheckbox).not.toBeChecked();
      await playExpect(podmanOnboardingPage.podmanMachineStartAfterCreationCheckbox).toBeChecked();
    });
  });
  describe.runIf(process.env.TEST_PODMAN_MACHINE !== undefined && process.env.TEST_PODMAN_MACHINE === 'true')(
    'Podman Machine creation and operations',
    async () => {
      test('Create a default Podman machine', async () => {
        await podmanOnboardingPage.podmanMachineCreateButton.click();
        await playExpect(podmanOnboardingPage.podmanMachineShowLogsButton).toBeVisible();
        await podmanOnboardingPage.podmanMachineShowLogsButton.click();
        await playExpect(podmanOnboardingPage.onboardingStatusMessage).toBeVisible({
          timeout: PODMAN_MACHINE_STARTUP_TIMEOUT,
        });
        await playExpect(podmanOnboardingPage.onboardingStatusMessage).toHaveText('Podman successfully setup');
        await podmanOnboardingPage.nextStepButton.click();
      });
      describe('Podman machine operations', async () => {
        let podmanMachineDetails: PodmanMachineDetails;
        test('Open podman machine details', async () => {
          dashboardPage = await navigationBar.openDashboard();
          await playExpect(dashboardPage.mainPage).toBeVisible();
          settingsBar = await navigationBar.openSettings();
          await settingsBar.resourcesTab.click();
          resourcesPage = new ResourcesPage(page);
          await playExpect(resourcesPage.podmanResources).toBeVisible();
          const resourcesPodmanConnections = new ResourcesPodmanConnections(page, PODMAN_MACHINE_NAME);
          await playExpect(resourcesPodmanConnections.providerConnections).toBeVisible({ timeout: 10_000 });
          await playExpect(resourcesPodmanConnections.podmanMachineElement).toBeVisible();
          await playExpect(resourcesPodmanConnections.machineDetailsButton).toBeVisible();
          await resourcesPodmanConnections.machineDetailsButton.click();
          podmanMachineDetails = new PodmanMachineDetails(page);
          await playExpect(podmanMachineDetails.podmanMachineStatus).toBeVisible();
          await playExpect(podmanMachineDetails.podmanMachineConnectionActions).toBeVisible();
          await playExpect(podmanMachineDetails.podmanMachineStartButton).toBeVisible();
          await playExpect(podmanMachineDetails.podmanMachineRestartButton).toBeVisible();
          await playExpect(podmanMachineDetails.podmanMachineStopButton).toBeVisible();
          await playExpect(podmanMachineDetails.podmanMachineDeleteButton).toBeVisible();
        });
        test('Podman machine operations - STOP', async () => {
          await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
          await podmanMachineDetails.podmanMachineStopButton.click();
          await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 30_000 });
        });
        test('Podman machine operations - START', async () => {
          await podmanMachineDetails.podmanMachineStartButton.click();
          await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
        });
        test('Podman machine operations - RESTART', async () => {
          await podmanMachineDetails.podmanMachineRestartButton.click();
          await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('OFF', { timeout: 30_000 });
          await playExpect(podmanMachineDetails.podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
        });
      });
    },
  );
  test.runIf(process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true')(
    'Clean Up Podman Machine',
    async () => {
      await deletePodmanMachine(page, 'Podman Machine');
    },
  );
});

async function checkPodmanMachineOnboardingPage(page: Page): Promise<PodmanOnboardingPage> {
  const onboardingPage = new PodmanOnboardingPage(page);
  await playExpect(onboardingPage.header).toBeVisible();
  await playExpect(onboardingPage.mainPage).toBeVisible();
  return onboardingPage;
}
