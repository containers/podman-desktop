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

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ResourceElementState } from '/@/model/core/states';
import { PodmanOnboardingPage } from '/@/model/pages/podman-onboarding-page';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { createPodmanMachineFromCLI, deletePodmanMachine, resetPodmanMachinesFromCLI } from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';
import { getVirtualizationProvider } from '/@/utility/provider';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESOURCE_NAME = 'podman';
// Both scenarios share the same machine name — only one can run at a time since
// each suite is independently skip-gated by its own precondition.
const LOCAL_IMAGE_MACHINE_NAME = 'podman-machine-local-image';

// Resolve the airgap asset path relative to the repository root.
// This file lives at tests/playwright/src/specs/, so four levels up is the root.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../');
const AIRGAP_ASSETS_DIR = path.join(REPO_ROOT, 'extensions/podman/packages/extension/assets');
const AIRGAP_IMAGE_ARCH = process.arch === 'arm64' ? 'arm64' : 'x64';
const AIRGAP_IMAGE_PATH = path.join(AIRGAP_ASSETS_DIR, `podman-image-${AIRGAP_IMAGE_ARCH}.zst`);

// Externally downloaded image path provided via environment variable.
const EXTERNAL_IMAGE_PATH = process.env.MACHINE_IMAGE_PATH ?? '';

// Timeout constants
const TIMEOUT_SHORT = 10_000;
const TIMEOUT_MEDIUM = 30_000;
const TIMEOUT_LONG = 60_000;
const TIMEOUT_MACHINE_CREATION = 360_000;
const TIMEOUT_AFTER_ALL = 180_000;

// Whether user-mode networking should be enabled for new machines. Derived
// from the same env var used by createPodmanMachineFromCLI so the creation
// form matches the job's default machine configuration.
const enableUserNet = process.env.PODMAN_NETWORKING === '1';

// ---------------------------------------------------------------------------
// Common skip condition: Linux is always excluded and TEST_PODMAN_MACHINE must
// be set, matching the convention used in the other machine test suites.
// ---------------------------------------------------------------------------
const baseSkipCondition = isLinux || process.env.TEST_PODMAN_MACHINE !== 'true';

// ---------------------------------------------------------------------------
// Shared beforeAll / afterAll
// ---------------------------------------------------------------------------

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('podman-machine-local-image-e2e');
  await welcomePage.handleWelcomePage(true);
  // Do NOT start the default machine here. Starting a default machine before
  // creating the local-image machine (with startNow: true) would leave two
  // active VMs, which fails on providers that allow only one at a time (e.g.
  // HyperV, some WSL configurations). Best-effort cleanup of any leftover
  // machine from a previous failed run instead.
  await deletePodmanMachine(page, LOCAL_IMAGE_MACHINE_NAME);
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(TIMEOUT_AFTER_ALL);

  try {
    if (test.info().status === 'failed') {
      // Reset any machines left in a broken state before recreating the default.
      await resetPodmanMachinesFromCLI();
    }
    // Always ensure the default machine is initialised and started so that
    // subsequent suites in the same CI run have a clean running environment.
    // Starting the local-image machine with startNow=true deactivates the
    // previously active machine on single-active-VM providers (e.g. WSL),
    // so we need to restore it unconditionally — not only on failure.
    await createPodmanMachineFromCLI();
  } catch (error) {
    console.log('Error during teardown cleanup:', error);
  }

  await runner.close();
});

// ---------------------------------------------------------------------------
// Scenario A — Airgap-embedded image
//
// Requires:
//   - Non-Linux platform
//   - TEST_PODMAN_MACHINE=true
//   - The podman-image-{arch}.zst asset file to exist (i.e. the app was built
//     with AIRGAP_DOWNLOAD=1)
// ---------------------------------------------------------------------------

test.describe('Podman machine creation with airgap-embedded image', { tag: ['@pdmachine'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(
    baseSkipCondition || !existsSync(AIRGAP_IMAGE_PATH),
    `Skipped: requires non-Linux platform, TEST_PODMAN_MACHINE=true, and airgap image at ${AIRGAP_IMAGE_PATH}`,
  );

  test('Create podman machine using airgap-embedded image', async ({ page, navigationBar }) => {
    test.setTimeout(TIMEOUT_MACHINE_CREATION + TIMEOUT_MEDIUM);

    await test.step('Navigate to Resources and open machine creation page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();

      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), {
          timeout: TIMEOUT_MEDIUM,
        })
        .toBeTruthy();
      await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
    });

    await test.step(`Fill in machine name and airgap image path (${AIRGAP_IMAGE_PATH})`, async () => {
      const creationPage = new PodmanOnboardingPage(page);
      await creationPage.machineCreationForm.setupAndCreateMachine(LOCAL_IMAGE_MACHINE_NAME, {
        isRootful: true,
        enableUserNet,
        startNow: true,
        virtualizationProvider: getVirtualizationProvider(),
        imagePath: AIRGAP_IMAGE_PATH,
      });
    });

    await test.step('Wait for machine creation to complete', async () => {
      const creationPage = new PodmanOnboardingPage(page);
      await playExpect(creationPage.goBackButton).toBeEnabled({ timeout: TIMEOUT_MACHINE_CREATION });
      await creationPage.goBackButton.click();
    });
  });

  test('Verify airgap machine reaches Running state', async ({ page, navigationBar }) => {
    test.setTimeout(TIMEOUT_LONG + TIMEOUT_MEDIUM);

    await test.step('Navigate to Resources page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    await test.step('Confirm machine is Running', async () => {
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), {
          timeout: TIMEOUT_MEDIUM,
        })
        .toBeTruthy();

      const podmanResources = new ResourceConnectionCardPage(page, RESOURCE_NAME, LOCAL_IMAGE_MACHINE_NAME);
      await playExpect(podmanResources.resourceElement).toBeVisible({ timeout: TIMEOUT_SHORT });
      await playExpect(podmanResources.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
        timeout: TIMEOUT_LONG,
      });
    });
  });

  test('Delete airgap machine', async ({ page }) => {
    test.setTimeout(TIMEOUT_AFTER_ALL);
    await deletePodmanMachine(page, LOCAL_IMAGE_MACHINE_NAME);
  });
});

// ---------------------------------------------------------------------------
// Scenario B — Externally provided image
//
// Requires:
//   - Non-Linux platform
//   - TEST_PODMAN_MACHINE=true
//   - MACHINE_IMAGE_PATH env var pointing to a locally downloaded FCOS image
// ---------------------------------------------------------------------------

test.describe('Podman machine creation with externally provided image path', { tag: ['@pdmachine'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test.skip(
    baseSkipCondition || !EXTERNAL_IMAGE_PATH,
    'Skipped: requires non-Linux platform, TEST_PODMAN_MACHINE=true, and MACHINE_IMAGE_PATH env var to be set',
  );

  test('Create podman machine using externally provided image path', async ({ page, navigationBar }) => {
    test.setTimeout(TIMEOUT_MACHINE_CREATION + TIMEOUT_MEDIUM);

    await test.step('Navigate to Resources and open machine creation page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();

      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), {
          timeout: TIMEOUT_MEDIUM,
        })
        .toBeTruthy();
      await resourcesPage.goToCreateNewResourcePage(RESOURCE_NAME);
    });

    await test.step(`Fill in machine name and external image path (${EXTERNAL_IMAGE_PATH})`, async () => {
      const creationPage = new PodmanOnboardingPage(page);
      await creationPage.machineCreationForm.setupAndCreateMachine(LOCAL_IMAGE_MACHINE_NAME, {
        isRootful: true,
        enableUserNet,
        startNow: true,
        virtualizationProvider: getVirtualizationProvider(),
        imagePath: EXTERNAL_IMAGE_PATH,
      });
    });

    await test.step('Wait for machine creation to complete', async () => {
      const creationPage = new PodmanOnboardingPage(page);
      await playExpect(creationPage.goBackButton).toBeEnabled({ timeout: TIMEOUT_MACHINE_CREATION });
      await creationPage.goBackButton.click();
    });
  });

  test('Verify externally-imaged machine reaches Running state', async ({ page, navigationBar }) => {
    test.setTimeout(TIMEOUT_LONG + TIMEOUT_MEDIUM);

    await test.step('Navigate to Resources page', async () => {
      const settingsBar = await navigationBar.openSettings();
      await settingsBar.resourcesTab.click();
    });

    await test.step('Confirm machine is Running', async () => {
      const resourcesPage = new ResourcesPage(page);
      await playExpect(resourcesPage.heading).toBeVisible();
      await playExpect
        .poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME), {
          timeout: TIMEOUT_MEDIUM,
        })
        .toBeTruthy();

      const podmanResources = new ResourceConnectionCardPage(page, RESOURCE_NAME, LOCAL_IMAGE_MACHINE_NAME);
      await playExpect(podmanResources.resourceElement).toBeVisible({ timeout: TIMEOUT_SHORT });
      await playExpect(podmanResources.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
        timeout: TIMEOUT_LONG,
      });
    });
  });

  test('Delete externally-imaged machine', async ({ page }) => {
    test.setTimeout(TIMEOUT_AFTER_ALL);
    await deletePodmanMachine(page, LOCAL_IMAGE_MACHINE_NAME);
  });
});
