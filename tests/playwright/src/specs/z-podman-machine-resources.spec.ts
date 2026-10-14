/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { ResourceElementActions } from '/@/model/core/operations';
import { ResourceElementState } from '/@/model/core/states';
import { PodmanMachinePrivileges, PodmanVirtualizationProviders } from '/@/model/core/types';
import { CreateMachinePage } from '/@/model/pages/create-machine-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { NavigationBar } from '/@/model/workbench/navigation';
import { expect as playExpect, test } from '/@/utility/fixtures';
import {
  createPodmanMachineFromCLI,
  deletePodmanMachine,
  handlePodmanConfirmationDialogs,
  resetPodmanMachinesFromCLI,
  verifyMachinePrivileges,
  verifyVirtualizationProvider,
} from '/@/utility/operations';
import { isCI, isLinux, isWindows } from '/@/utility/platform';
import { getDefaultVirtualizationProvider, getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup, waitUntil } from '/@/utility/wait';

const DEFAULT_PODMAN_MACHINE_NAME = 'podman-machine-default';
const RESOURCE_NAME = 'podman';

// Timeout constants
const TIMEOUT_SHORT = 30_000;
const TIMEOUT_MEDIUM = 60_000;
const TIMEOUT_LONG = 120_000;
const TIMEOUT_MACHINE_CREATION = 200_000;
const TIMEOUT_MACHINE_DELETION = 150_000;

let dialog: Locator;

/**
 * Waits for a machine's connection status to reach a target state. If the status appears
 * stuck (still shows a stale value after the initial timeout), navigates to the Dashboard
 * and back to Settings → Resources to force a UI refresh, then re-checks.
 */
async function waitForMachineStatus(
  page: Page,
  machineName: string,
  targetState: ResourceElementState,
  {
    initialTimeout = TIMEOUT_SHORT,
    retryTimeout = TIMEOUT_SHORT,
  }: { initialTimeout?: number; retryTimeout?: number } = {},
): Promise<void> {
  const machineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineName);

  await waitUntil(async () => (await machineCard.resourceElementConnectionStatus.innerText()).includes(targetState), {
    timeout: initialTimeout,
    sendError: false,
  });

  const currentStatus = await machineCard.resourceElementConnectionStatus.innerText();
  if (currentStatus.includes(targetState)) return;

  console.log(
    `Machine ${machineName} status is "${currentStatus}" after ${initialTimeout}ms, expected "${targetState}". ` +
      'Navigating away and back to force UI refresh.',
  );

  const navigationBar = new NavigationBar(page);
  await navigationBar.openDashboard();
  const settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();

  const resourcesPage = new ResourcesPage(page);
  await playExpect(resourcesPage.heading).toBeVisible();

  const refreshedCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, machineName);
  await waitUntil(async () => (await refreshedCard.resourceElementConnectionStatus.innerText()).includes(targetState), {
    timeout: retryTimeout,
    sendError: true,
  });
}

const machineTypes = [
  {
    PODMAN_MACHINE_NAME: 'podman-machine-rootless',
    MACHINE_VISIBLE_NAME: 'Podman Machine rootless',
    isRoot: false,
    userNet: false,
  },
  {
    PODMAN_MACHINE_NAME: 'podman-machine-rootful',
    MACHINE_VISIBLE_NAME: 'Podman Machine rootful',
    isRoot: true,
    userNet: false,
  },
  {
    PODMAN_MACHINE_NAME: 'podman-machine-usermode',
    MACHINE_VISIBLE_NAME: 'Podman Machine usermode',
    isRoot: true,
    userNet: true,
  },
];

test.skip(
  isLinux || process.env.TEST_PODMAN_MACHINE !== 'true',
  'Tests suite should not run on Linux platform or if TEST_PODMAN_MACHINE is not true',
);

test.skip(
  getVirtualizationProvider() === PodmanVirtualizationProviders.HyperV,
  'Podman Desktop is not able to have 2 HyperV machines running at the same time',
);

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  runner.setVideoAndTraceName('podman-machine-resources-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  dialog = page.getByRole('dialog', { name: 'Podman', exact: true });

  // Check for default machine and stop
  const settingsBar = await navigationBar.openSettings();
  await settingsBar.resourcesTab.click();

  const resourcesPage = new ResourcesPage(page);
  await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
  const defaultMachineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, DEFAULT_PODMAN_MACHINE_NAME);

  playExpect(await defaultMachineCard.resourceElementConnectionStatus.innerText()).toContain(
    ResourceElementState.Running,
  );
  await defaultMachineCard.performConnectionAction(ResourceElementActions.Stop);
  await waitUntil(
    async () =>
      (await defaultMachineCard.resourceElementConnectionStatus.innerText()).includes(ResourceElementState.Off),
    { timeout: TIMEOUT_SHORT, sendError: true },
  );
});

test.afterAll(async ({ runner, page, navigationBar }) => {
  test.setTimeout(TIMEOUT_LONG);

  try {
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.resourcesTab.click();

    const resourcesPage = new ResourcesPage(page);
    await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
    const defaultMachineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, DEFAULT_PODMAN_MACHINE_NAME);

    try {
      playExpect(await defaultMachineCard.resourceElementConnectionStatus.innerText()).toContain(
        ResourceElementState.Off,
      );
      await defaultMachineCard.performConnectionAction(ResourceElementActions.Start);
      await handlePodmanConfirmationDialogs(page);
    } catch (error) {
      console.log('No handling dialog displayed', error);
    }

    await waitUntil(
      async () =>
        (await defaultMachineCard.resourceElementConnectionStatus.innerText()).includes(ResourceElementState.Running),
      { timeout: TIMEOUT_MEDIUM, sendError: true },
    );
  } finally {
    await runner.close();
  }
});

// eslint-disable-next-line no-empty-pattern
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

for (const { PODMAN_MACHINE_NAME, MACHINE_VISIBLE_NAME, isRoot, userNet } of machineTypes) {
  test.describe(`${MACHINE_VISIBLE_NAME} Resources workflow Verification`, { tag: '@pdmachine' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      PODMAN_MACHINE_NAME === 'podman-machine-usermode' && !isWindows,
      'Testing user networking machine only on Windows',
    );

    test('Create machine through Resources page', async ({ page, navigationBar }) => {
      test.setTimeout(TIMEOUT_MACHINE_CREATION);

      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();

      const podmanResources = new ResourceConnectionCardPage(page, RESOURCE_NAME);
      await podmanResources.createButton.click();

      const createMachinePage = new CreateMachinePage(page);

      const resourcePage = await createMachinePage.createMachine(PODMAN_MACHINE_NAME, {
        isRootful: isRoot,
        enableUserNet: userNet,
        setAsDefault: false,
        startNow: false,
        virtualizationProvider: getVirtualizationProvider(),
      });

      await playExpect(resourcePage.heading).toBeVisible();
      const machineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, PODMAN_MACHINE_NAME);
      await verifyMachinePrivileges(
        machineCard,
        isRoot ? PodmanMachinePrivileges.Rootful : PodmanMachinePrivileges.Rootless,
      );
      await verifyVirtualizationProvider(
        machineCard,
        getVirtualizationProvider() ?? getDefaultVirtualizationProvider(),
      );
      playExpect(await machineCard.doesResourceElementExist()).toBeTruthy();
      playExpect(await machineCard.resourceElementConnectionStatus.innerText()).toContain(ResourceElementState.Off);
    });

    test('Start the machine', async ({ page }) => {
      test.setTimeout(TIMEOUT_MACHINE_CREATION);
      const machineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, PODMAN_MACHINE_NAME);
      await machineCard.performConnectionAction(ResourceElementActions.Start);

      await playExpect(dialog).toBeVisible({ timeout: TIMEOUT_LONG });
      await handlePodmanConfirmationDialogs(page);

      await waitForMachineStatus(page, PODMAN_MACHINE_NAME, ResourceElementState.Running, {
        initialTimeout: TIMEOUT_MEDIUM,
        retryTimeout: TIMEOUT_SHORT,
      });
    });

    test('Restart the machine', async ({ page }) => {
      test.skip(
        isCI && userNet,
        'Restarting podman machine is flaky in cicd pipeline with usermode networking. This issue is tracked in https://github.com/podman-desktop/podman-desktop/issues/15889',
      );

      const machineCard = new ResourceConnectionCardPage(page, RESOURCE_NAME, PODMAN_MACHINE_NAME);
      await machineCard.performConnectionAction(ResourceElementActions.Restart);

      await waitForMachineStatus(page, PODMAN_MACHINE_NAME, ResourceElementState.Off, {
        initialTimeout: TIMEOUT_MEDIUM,
        retryTimeout: TIMEOUT_SHORT,
      });

      await waitForMachineStatus(page, PODMAN_MACHINE_NAME, ResourceElementState.Running, {
        initialTimeout: TIMEOUT_MEDIUM,
        retryTimeout: TIMEOUT_SHORT,
      });
    });

    test('Stop and delete the machine', async ({ page }) => {
      test.setTimeout(TIMEOUT_MACHINE_DELETION);
      await deletePodmanMachine(page, PODMAN_MACHINE_NAME);
      await handlePodmanConfirmationDialogs(page);
    });
  });
}
