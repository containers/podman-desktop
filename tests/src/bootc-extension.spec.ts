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

import type { Locator, Page } from '@playwright/test';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import { SettingsBar } from './model/pages/settings-bar';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { ResourcesPage } from './model/pages/resources-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let extensionDashboardStatus: Locator;
let extensionDashboardBox: Locator;
let extensionDashboardProvider: Locator;
let extensionSettingsBox: Locator;
let installButtonLabel: string;
let settingsLink: string;
let resourceLabel: string;
let imageLink: string;
let settingsTableLabel: string;

let extensionBoxVisible: boolean;

const _startup = async function () {
  console.log('running before all');
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
};

const _shutdown = async function () {
  console.log('running after all');
  await pdRunner.close();
};

beforeEach<RunnerTestContext>(async ctx => {
  console.log('running before each');
  ctx.pdRunner = pdRunner;
});

describe('$extensionType installation verification', async () => {
  beforeAll(_startup);
  afterAll(_shutdown);

  test('Initialize extension type', async () => {
    extensionBoxVisible = await extensionDashboardBox.isVisible();
  });

  describe('Check installation availability', async () => {
    test.runIf(extensionBoxVisible)('Check Dashboard extension component for installation availability', async () => {
      const installButton = extensionDashboardBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });

    test('Go to settings', async () => {
      await goToSettings();
      const settingsBar = new SettingsBar(page);
      await settingsBar.openTabPage(SettingsExtensionsPage);
    });

    test.runIf(extensionBoxVisible)('Check Settings extension component for installation availability', async () => {
      const installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });
  });

  test('Install extension through Settings', async () => {
    const settingsPage = new SettingsExtensionsPage(page);
    let installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });

    if (!extensionBoxVisible) {
      const imageInstallBox = settingsPage.imageInstallBox;
      const imageInput = imageInstallBox.getByLabel('OCI Image Name');
      await imageInput.fill(imageLink);

      installButton = imageInstallBox.getByRole('button', { name: 'Install extension from the OCI image' });
      await installButton.isEnabled();
    }

    await installButton.click();

    const installedExtensionRow = settingsPage.getExtensionRowFromTable(settingsTableLabel);
    const extensionRunningLabel = installedExtensionRow.getByText('RUNNING');
    await playExpect(extensionRunningLabel).toBeVisible({ timeout: 180000 });
  }, 200000);

  describe('Verify UI components after installation', async () => {
    test('Verify Settings components', async () => {
      const settingsBar = new SettingsBar(page);
      await playExpect(settingsBar.settingsNavBar.getByRole('link', { name: settingsLink })).toBeVisible();

      const extensionPage = await settingsBar.openTabPage(extensionPageType);
      await playExpect(extensionPage.heading).toBeVisible();
      await playExpect(extensionPage.status).toHaveText('ENABLED');
    });

    describe('Toggle and verify extension status', async () => {
      test('Disable extension and verify Dashboard and Resources components', async () => {
        const extensionPage = new extensionPageType(page);

        await extensionPage.disableButton.click();
        await playExpect(extensionPage.status).toHaveText('DISABLED');

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeHidden();
        await playExpect(extensionDashboardStatus).toBeHidden();

        await goToSettings();
        const settingsBar = new SettingsBar(page);
        const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
        const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
          name: resourceLabel,
        });
        await playExpect(extensionResourceBox).toBeHidden();
      });

      test('Enable extension and verify Dashboard and Resources components', async () => {
        const settingsBar = new SettingsBar(page);
        await settingsBar.openTabPage(SettingsExtensionsPage);
        const extensionPage = await settingsBar.openTabPage(extensionPageType);

        await extensionPage.enableButton.click();
        await playExpect(extensionPage.status).toHaveText('ENABLED', { timeout: 10000 });

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeVisible();
        await playExpect(extensionDashboardStatus).toBeVisible();

        await goToSettings();
        const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
        const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
          name: resourceLabel,
        });
        await playExpect(extensionResourceBox).toBeVisible();
      });
    });
  });

  describe('Remove extension and verify UI', async () => {
    test('Remove extension and verify Settings components', async () => {
      const settingsBar = new SettingsBar(page);
      await settingsBar.openTabPage(SettingsExtensionsPage);
      const extensionPage = await settingsBar.openTabPage(extensionPageType);

      await extensionPage.disableButton.click();
      await extensionPage.removeExtensionButton.click();

      await playExpect(settingsBar.settingsNavBar.getByRole('link', { name: settingsLink })).toBeHidden();

      const settingsPage = new SettingsExtensionsPage(page);
      const installedExtensionRow = settingsPage.getExtensionRowFromTable(settingsTableLabel);
      await playExpect(installedExtensionRow).toBeHidden();

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

async function goToDashboard() {
  const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const dashboardLink = navBar.getByRole('link', { name: 'Dashboard' });
  await playExpect(dashboardLink).toBeVisible();
  await dashboardLink.click();
}

async function goToSettings() {
  const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const settingsLink = navBar.getByRole('link', { name: 'Settings' });
  await playExpect(settingsLink).toBeVisible();
  await settingsLink.click();
}
