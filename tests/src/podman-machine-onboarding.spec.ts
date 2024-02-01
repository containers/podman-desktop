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

import type { Page } from 'playwright';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import type { DashboardPage } from './model/pages/dashboard-page';
import type { Locator } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { NavigationBar } from './model/workbench/navigation';
import type { SettingsBar } from './model/pages/settings-bar';
import { ResourcesPage } from './model/pages/resources-page';

const PODMAN_MACHINE_STARTUP_TIMEOUT: number = 360_000;

let pdRunner: PodmanDesktopRunner;
let page: Page;
let dashboardPage: DashboardPage;
let resourcesPage: ResourcesPage;
let settingsBar: SettingsBar;
let navigationBar: NavigationBar;

let notificationPodmanSetup: Locator;
let onboardingStepBody: Locator;
let podmanMachineConfiguration: Locator;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-machine-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navigationBar = new NavigationBar(page);

  // Delete machine if it already exists
  await deletePodmanMachine('Podman Machine');
});

afterAll(async () => {
  await pdRunner.close();
}, 120000);

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Podman Machine verification', async () => {
  describe('Podman Machine onboarding workflow', async () => {
    test('Setup Podman push notification is present', async () => {
      dashboardPage = await navigationBar.openDashboard();
      await playExpect(dashboardPage.mainPage).toBeVisible();
      await playExpect(dashboardPage.notificationsBox).toBeVisible();
      notificationPodmanSetup = dashboardPage.notificationsBox
        .getByRole('region')
        .filter({ hasText: 'Podman needs to be set up' });
      await playExpect(notificationPodmanSetup).toBeVisible();
    });
    describe('Onboarding navigation', async () => {
      test('Open Podman Machine Onboarding through Setup Notification', async () => {
        await notificationPodmanSetup.getByTitle('Set up Podman').click();
        await playExpect(page.getByRole('heading', { name: 'Podman Setup Header' })).toBeVisible();
      });
      test('Podman onboarding first page', async () => {
        await playExpect(page.getByRole('heading', { name: 'Podman Setup Header' })).toBeVisible();
      });
      test('Return to Dashboard', async () => {
        dashboardPage = await navigationBar.openDashboard();
        await playExpect(dashboardPage.mainPage).toBeVisible();
      });
      test('Re-Open Podman Machine Onboarding through Settings Resources page', async () => {
        settingsBar = await navigationBar.openSettings();
        await settingsBar.resourcesTab.click();
        resourcesPage = new ResourcesPage(page);
        const podmanResourcesSectionLocator: Locator = resourcesPage.getPage().getByLabel('podman', { exact: true });
        await playExpect(podmanResourcesSectionLocator).toBeVisible();
        await podmanResourcesSectionLocator.getByLabel('Setup Podman').click();
        await playExpect(page.getByRole('heading', { name: 'Podman Setup Header' })).toBeVisible();
        onboardingStepBody = page.locator('//*[@id="stepBody"]');
        await playExpect(onboardingStepBody).toBeVisible();
      });
    });
    test('Verify Podman Autostart is enabled and proceed to next page', async () => {
      const podmanAutostartToggle: Locator = onboardingStepBody.getByLabel(
        'Autostart Podman engine when launching Podman Desktop',
      );
      await playExpect(podmanAutostartToggle).toBeChecked();
      await onboardingStepBody.getByLabel('Next Step').click();
    });
    test('Expect no machine created message and proceed to next page', async () => {
      await playExpect(onboardingStepBody.getByLabel('Onboarding Status Message')).toHaveText(
        `We could not find any Podman machine. Let's create one!`,
      );
      await onboardingStepBody.getByLabel('Next Step').click();
    });
    test('Verify default podman machine settings', async () => {
      await playExpect(onboardingStepBody.getByLabel('title')).toHaveText(`Create a Podman machine`);
      podmanMachineConfiguration = onboardingStepBody.getByLabel('Properties Information');
      await playExpect(podmanMachineConfiguration).toBeVisible();
      const podmanMachineName: Locator = podmanMachineConfiguration.getByLabel('Name');
      await playExpect(podmanMachineName).toHaveValue('podman-machine-default');
      const podmanMachineCPUs: Locator = podmanMachineConfiguration.getByLabel('CPU(s)');
      await playExpect(podmanMachineCPUs).toBeVisible();
      const podmanMachineMemory: Locator = podmanMachineConfiguration.getByLabel('Memory');
      await playExpect(podmanMachineMemory).toBeVisible();
      const podmanMachineDiskSize: Locator = podmanMachineConfiguration.getByLabel('Disk size');
      await playExpect(podmanMachineDiskSize).toBeVisible();
      const podmanMachineImage: Locator = podmanMachineConfiguration.getByLabel('Image Path (Optional)', {
        exact: true,
      });
      await playExpect(podmanMachineImage).toHaveValue('');
      const podmanMachineRootful: Locator = podmanMachineConfiguration.getByLabel('Machine with root privileges');
      await playExpect(podmanMachineRootful).toBeChecked();
      const podmanMachineUserModeNetworking: Locator = podmanMachineConfiguration.getByLabel(
        'User mode networking (traffic relayed by a user process)',
        { exact: false },
      );
      playExpect(await podmanMachineUserModeNetworking.isChecked()).toBeFalsy();
      const podmanMachineStartAfterCreation: Locator = podmanMachineConfiguration.getByLabel('Start the machine now');
      playExpect(await podmanMachineStartAfterCreation.isChecked()).toBeTruthy();
    });
  });
  describe('Podman Machine creation and operations', async () => {
    test('Create a default Podman machine', async () => {
      const createMachineButton: Locator = podmanMachineConfiguration.getByRole('button', { name: 'Create' });
      await createMachineButton.click();
      const expandLogsButton: Locator = onboardingStepBody.getByRole('button', { name: 'Show Logs' });
      await playExpect(expandLogsButton).toBeVisible();
      await expandLogsButton.click();
      const machineCreationStatusMessage: Locator = onboardingStepBody.getByLabel('Onboarding Status Message');
      await playExpect(machineCreationStatusMessage).toBeVisible({ timeout: PODMAN_MACHINE_STARTUP_TIMEOUT });
      await playExpect(machineCreationStatusMessage).toHaveText('Podman successfully setup');
      await onboardingStepBody.getByLabel('Next Step').click();
    });
    describe('Podman machine operations', async () => {
      let podmanMachineStatus: Locator;
      let podmanMachineStartButton: Locator;
      let podmanMachineRestartButton: Locator;
      let podmanMachineStopButton: Locator;
      let podmanMachineDeleteButton: Locator;
      test('Open podman machine details', async () => {
        dashboardPage = await navigationBar.openDashboard();
        await playExpect(dashboardPage.mainPage).toBeVisible();
        settingsBar = await navigationBar.openSettings();
        await settingsBar.resourcesTab.click();
        resourcesPage = new ResourcesPage(page);
        const podmanResourcesSectionLocator: Locator = resourcesPage.getPage().getByLabel('podman', { exact: true });
        await playExpect(podmanResourcesSectionLocator).toBeVisible();
        const podmanConnections: Locator = podmanResourcesSectionLocator.getByRole('region', {
          name: 'Provider Connections',
        });
        await playExpect(podmanConnections).toBeVisible();
        const podmanMachineDetails: Locator = podmanConnections.getByRole('button', { name: 'Podman details' });
        await playExpect(podmanMachineDetails).toBeVisible();
        await podmanMachineDetails.click();
        podmanMachineStatus = page.getByLabel('Connection Status Label');
        await playExpect(podmanMachineStatus).toBeVisible();
        const podmanMachineControls: Locator = page.getByRole('group', { name: 'Connection Actions' });
        await playExpect(podmanMachineControls).toBeVisible();
        podmanMachineStartButton = podmanMachineControls.getByRole('button', { name: 'Start', exact: true });
        await playExpect(podmanMachineStartButton).toBeVisible();
        podmanMachineRestartButton = podmanMachineControls.getByRole('button', { name: 'Restart' });
        await playExpect(podmanMachineRestartButton).toBeVisible();
        podmanMachineStopButton = podmanMachineControls.getByRole('button', { name: 'Stop' });
        await playExpect(podmanMachineStopButton).toBeVisible();
        podmanMachineDeleteButton = podmanMachineControls.getByRole('button', { name: 'Delete' });
        await playExpect(podmanMachineDeleteButton).toBeVisible();
      });
      test('Podman machine operations - STOP', async () => {
        await playExpect(podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
        await podmanMachineStopButton.click();
        await playExpect(podmanMachineStatus).toHaveText('OFF', { timeout: 30_000 });
      });
      test('Podman machine operations - START', async () => {
        await podmanMachineStartButton.click();
        await playExpect(podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
      });
      test('Podman machine operations - RESTART', async () => {
        await podmanMachineRestartButton.click();
        await playExpect(podmanMachineStatus).toHaveText('OFF', { timeout: 30_000 });
        await playExpect(podmanMachineStatus).toHaveText('RUNNING', { timeout: 30_000 });
      });
    });
    test('Clean Up Podman Machine', async () => {
      if (process.env.MACHINE_CLEANUP !== undefined && process.env.MACHINE_CLEANUP === 'true') {
        await deletePodmanMachine('Podman Machine');
      } else {
        console.log('MACHINE_CLEANUP is undefined or false, Skipping machine cleanup');
      }
    });
  });
});

async function deletePodmanMachine(machineVisibleName: string): Promise<void> {
  dashboardPage = await navigationBar.openDashboard();
  await playExpect(dashboardPage.mainPage).toBeVisible();
  settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();
  resourcesPage = new ResourcesPage(page);
  const podmanResourcesSectionLocator: Locator = resourcesPage.getPage().getByLabel('podman', { exact: true });
  await playExpect(podmanResourcesSectionLocator).toBeVisible();
  const podmanConnections: Locator = podmanResourcesSectionLocator.getByRole('region', {
    name: 'Provider Connections',
  });
  await playExpect(podmanConnections).toBeVisible();
  const podmanMachineElement: Locator = podmanConnections.getByRole('region', { name: machineVisibleName });
  if (await podmanMachineElement.isVisible()) {
    await playExpect(podmanMachineElement).toBeVisible();
    const podmanMachineControls: Locator = podmanConnections.getByRole('group', { name: 'Connection Actions' });
    await playExpect(podmanMachineControls).toBeVisible();
    const podmanMachineStatus: Locator = podmanResourcesSectionLocator.getByLabel('Connection Status Label');
    await playExpect(podmanMachineStatus).toBeVisible();
    if ((await podmanMachineStatus.innerText()) === 'RUNNING') {
      const podmanMachineStopButton: Locator = podmanMachineControls.getByRole('button', { name: 'Stop' });
      await playExpect(podmanMachineStopButton).toBeVisible();
      await podmanMachineStopButton.click();
      await playExpect(podmanMachineStatus).toHaveText('OFF', { timeout: 30_000 });
    }
    const podmanMachineDeleteButton: Locator = podmanMachineControls.getByRole('button', { name: 'Delete' });
    await playExpect(podmanMachineDeleteButton).toBeVisible();
    playExpect(await podmanMachineDeleteButton.isEnabled()).toBeTruthy();
    await podmanMachineDeleteButton.click();
    await playExpect(podmanMachineElement).not.toBeVisible({ timeout: 30_000 });
  } else {
    console.log(`Podman machine [${machineVisibleName}] not present, skipping deletion.`);
  }
}
