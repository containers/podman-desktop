/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { afterAll, beforeAll, test, describe } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import { SettingsBar } from './model/pages/settings-bar';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import { DashboardPage } from './model/pages/dashboard-page';
import { SandboxExtensionPage } from './model/pages/sandbox-extension-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('sandbox-installation-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
});

afterAll(async () => {
  await pdRunner.close();
}, 90000);

describe('Developer Sandbox installation verification', async () => {
  describe('Check installation availability', async () => {
    test('Check Dashboard extension component for installation availability', async () => {
      const dashboardPage = new DashboardPage(page);

      const installButton = dashboardPage.devSandboxBox.getByRole('button', {
        name: 'Install redhat.redhat-sandbox Extension',
      });
      await playExpect(installButton).toBeVisible();
    });

    test('Check Settings extension component for installation availability', async () => {
      await goToSettings();
      const settingsBar = new SettingsBar(page);
      const extensionsPage = await settingsBar.openTabPage(SettingsExtensionsPage);

      const installButton = extensionsPage.devSandboxBox.getByRole('button', {
        name: 'Install redhat.redhat-sandbox Extension',
      });
      await playExpect(installButton).toBeVisible();
    });
  });

  test('Install Developer Sandbox through Settings', async () => {
    const extensionsPage = new SettingsExtensionsPage(page);
    const installButton = extensionsPage.devSandboxBox.getByRole('button', {
      name: 'Install redhat.redhat-sandbox Extension',
    });
    await installButton.click();
    const installedLabel = extensionsPage.devSandboxBox.getByText('installed');
    await playExpect(installedLabel).toBeVisible({ timeout: 180000 });
  }, 200000);

  describe('Verify UI components after installation', async () => {
    test('Verify Settings components', async () => {
      const settingsBar = new SettingsBar(page);
      await playExpect(
        settingsBar.settingsNavBar.getByRole('link', { name: 'Red Hat OpenShift Sandbox' }),
      ).toBeVisible();

      const sandboxPage = await settingsBar.openTabPage(SandboxExtensionPage);
      await playExpect(sandboxPage.heading).toBeVisible();
      await playExpect(sandboxPage.status).toHaveText('ENABLED');
    });

    describe('Toggle and verify extension status', async () => {
      test('Disable extension and verify Dashboard components', async () => {
        const sandboxPage = new SandboxExtensionPage(page);

        await sandboxPage.disableButton.click();
        await playExpect(sandboxPage.status).toHaveText('DISABLED');

        await goToDashboard();
        const dashboardPage = new DashboardPage(page);
        await playExpect(dashboardPage.devSandboxStatus).toBeHidden();
      });

      test('Enable extension and verify Dashboard components', async () => {
        await goToSettings();
        const settingsBar = new SettingsBar(page);
        await settingsBar.openTabPage(SettingsExtensionsPage);
        const sandboxPage = await settingsBar.openTabPage(SandboxExtensionPage);

        await sandboxPage.enableButton.click();
        await playExpect(sandboxPage.status).toHaveText('ENABLED');

        await goToDashboard();
        const dashboardPage = new DashboardPage(page);
        await playExpect(dashboardPage.devSandboxStatus).toBeVisible();
      });
    });
  });

  describe('Remove extension and verify UI', async () => {
    test('Remove extension and verify Settings components', async () => {
      await goToSettings();
      const settingsBar = new SettingsBar(page);
      await settingsBar.openTabPage(SettingsExtensionsPage);
      const sandboxPage = await settingsBar.openTabPage(SandboxExtensionPage);

      await sandboxPage.disableButton.click();
      await sandboxPage.removeExtensionButton.click();

      const extensionsPage = new SettingsExtensionsPage(page);

      const installButton = extensionsPage.devSandboxBox.getByRole('button', {
        name: 'Install redhat.redhat-sandbox Extension',
      });
      await playExpect(installButton).toBeVisible();

      await playExpect(
        settingsBar.settingsNavBar.getByRole('link', { name: 'Red Hat OpenShift Sandbox' }),
      ).toBeHidden();
    });

    test('Verify Dashboard components', async () => {
      await goToDashboard();
      const dashboardPage = new DashboardPage(page);
      const dashboardInstallButton = dashboardPage.devSandboxBox.getByRole('button', {
        name: 'Install redhat.redhat-sandbox Extension',
      });
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
