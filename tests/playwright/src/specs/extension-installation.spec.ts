/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { DashboardPage } from '../model/pages/dashboard-page';
import { ExtensionsPage } from '../model/pages/extensions-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { SettingsBar } from '../model/pages/settings-bar';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';

const DISABLED = 'DISABLED';
const ACTIVE = 'ACTIVE';
const RUNNING = 'RUNNING';
const NOT_INSTALLED = 'NOT-INSTALLED';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let extensionDashboardStatus: Locator;
let extensionDashboardBox: Locator;
let extensionDashboardProvider: Locator;
let extensionSettingsBox: Locator;
let installButtonLabel: string;
let extensionName: string;
let resourceLabel: string;
let imageLink: string;

let extensionBoxVisible: boolean;

let navBar: NavigationBar;

const _startup = async function (): Promise<void> {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);

  navBar = new NavigationBar(page);
};

const _shutdown = async function (): Promise<void> {
  await pdRunner.close();
};

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe.each([
  {
    extensionType: 'Developer Sandbox',
  },
  {
    extensionType: 'Openshift Local',
  },
])('$extensionType installation verification', async ({ extensionType }) => {
  beforeAll(_startup);
  afterAll(_shutdown);

  test('Initialize extension type', async () => {
    initializeLocators(extensionType);
    extensionBoxVisible = await extensionDashboardBox.isVisible();
  });

  describe('Check installation availability', async () => {
    test.runIf(extensionBoxVisible)('Check Dashboard extension component for installation availability', async () => {
      const installButton = extensionDashboardBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });

    test('Go to extensions', async () => {
      await navBar.openExtensions();
    });

    test.runIf(extensionBoxVisible)('Check Settings extension component for installation availability', async () => {
      const installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });
  });

  test('Install extension through Extensions page', async () => {
    const extensionsPage = new ExtensionsPage(page);

    await extensionsPage.installExtensionFromOCIImage(imageLink);
    const extensionDetailsPage = await extensionsPage.openExtensionDetails(extensionName);

    const extensionStatusLabel = extensionDetailsPage.status;
    await playExpect(extensionStatusLabel).toBeVisible({ timeout: 180000 });
  }, 200000);

  describe('Verify UI components after installation', async () => {
    test('Verify Settings components', async () => {
      const extensionsPage = await navBar.openExtensions();
      const extensionPage = await extensionsPage.openExtensionDetails(extensionName);
      await playExpect(extensionPage.status).toHaveText(ACTIVE);
    });

    describe('Toggle and verify extension status', async () => {
      test('Disable extension and verify Dashboard and Resources components', async () => {
        const extensionsPage = await navBar.openExtensions();
        const extensionPage = await extensionsPage.openExtensionDetails(extensionName);

        await extensionPage.disableButton.click();
        await playExpect(extensionPage.status).toHaveText(DISABLED);

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeHidden();
        await playExpect(extensionDashboardStatus).toBeHidden();

        const settingsBar = await goToSettings();
        const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
        const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
          name: resourceLabel,
        });
        await playExpect(extensionResourceBox).toBeHidden();
      });

      test('Enable extension and verify Dashboard and Resources components', async () => {
        const extensionsPage = await navBar.openExtensions();
        const extensionPage = await extensionsPage.openExtensionDetails(extensionName);

        await extensionPage.enableButton.click();
        await playExpect(extensionPage.status).toHaveText(ACTIVE, { timeout: 10000 });

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeVisible();
        await playExpect(extensionDashboardStatus).toBeVisible();
        if (extensionType === 'Developer Sandbox') {
          await playExpect(extensionDashboardStatus).toHaveText(RUNNING);
        } else {
          await playExpect(extensionDashboardStatus).toHaveText(NOT_INSTALLED);
        }

        const settingsBar = await goToSettings();
        const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
        const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
          name: resourceLabel,
        });
        await playExpect(extensionResourceBox).toBeVisible();
      });
    });
  });

  describe('Remove extension and verify UI', async () => {
    test('Remove extension and verify components', async () => {
      const extensionsPage = await navBar.openExtensions();

      const extensionPage = await extensionsPage.openExtensionDetails(extensionName);

      await extensionPage.disableButton.click();
      await extensionPage.removeExtensionButton.click();

      const settingsBar = await goToSettings();
      const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
      const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', { name: resourceLabel });
      await playExpect(extensionResourceBox).toBeHidden();
    });

    test.runIf(extensionBoxVisible)('Verify Dashboard components', async () => {
      await goToDashboard();
      const dashboardInstallButton = extensionDashboardBox.getByRole('button', { name: installButtonLabel });
      await playExpect(dashboardInstallButton).toBeVisible();
    });
  });
});

function initializeLocators(extensionType: string): void {
  const dashboardPage = new DashboardPage(page);
  switch (extensionType) {
    case 'Developer Sandbox': {
      extensionDashboardStatus = dashboardPage.devSandboxStatusLabel;
      extensionDashboardBox = dashboardPage.devSandboxBox;
      extensionDashboardProvider = dashboardPage.devSandboxProvider;
      installButtonLabel = 'Install redhat.redhat-sandbox Extension';
      extensionName = 'redhat-sandbox';
      resourceLabel = 'redhat.sandbox';
      imageLink = 'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:0.0.2';
      break;
    }
    case 'Openshift Local': {
      extensionDashboardStatus = dashboardPage.openshiftLocalStatusLabel;
      extensionDashboardBox = dashboardPage.openshiftLocalBox;
      extensionDashboardProvider = dashboardPage.openshiftLocalProvider;
      installButtonLabel = 'Install redhat.openshift-local Extension';
      extensionName = 'openshift-local';
      resourceLabel = 'crc';
      imageLink = 'quay.io/redhat-developer/openshift-local-extension:v1.3.0';
      break;
    }
  }
}

async function goToDashboard(): Promise<void> {
  const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const dashboardLink = navBar.getByRole('link', { name: 'Dashboard' });
  await playExpect(dashboardLink).toBeVisible();
  await dashboardLink.click();
}

async function goToSettings(): Promise<SettingsBar> {
  const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const settingsLink = navBar.getByRole('link', { name: 'Settings' });
  await playExpect(settingsLink).toBeVisible();
  await settingsLink.click();
  return new SettingsBar(page);
}
