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

import type { Locator, Page } from 'playwright';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import { SettingsBar } from './model/pages/settings-bar';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import { DashboardPage } from './model/pages/dashboard-page';
import { OpenshiftLocalExtensionPage } from './model/pages/openshift-local-extension-page';
import { SandboxExtensionPage } from './model/pages/sandbox-extension-page';
import type { RunnerTestContext } from './testContext/runner-test-context';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let extensionDashboardStatus: Locator;
let extensionDashboardBox: Locator;
let extensionDashboardProvider: Locator;
let extensionSettingsBox: Locator;
let installButtonLabel: string;
let settingsLink: string;

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

describe.each([
  {
    extensionType: 'Developer Sandbox',
    extensionPageType: SandboxExtensionPage,
  },
  {
    extensionType: 'Openshift Local',
    extensionPageType: OpenshiftLocalExtensionPage,
  },
])('$extensionType installation verification', async ({ extensionType, extensionPageType }) => {
  beforeAll(_startup);
  afterAll(_shutdown);

  test('Initialize extension type', async () => {
    await initializeLocators(extensionType);
  });

  describe('Check installation availability', async () => {
    test('Check Dashboard extension component for installation availability', async () => {
      const installButton = extensionDashboardBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });

    test('Check Settings extension component for installation availability', async () => {
      await goToSettings();
      const settingsBar = new SettingsBar(page);
      await settingsBar.openTabPage(SettingsExtensionsPage);

      const installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();
    });
  });

  test('Install extension through Settings', async () => {
    const installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });
    await installButton.click();
    const installedLabel = extensionSettingsBox.getByText('installed');
    await playExpect(installedLabel).toBeVisible({ timeout: 180000 });
  }, 200000);

  describe('Verify UI components after installation', async () => {
    test('Verify Settings components', async () => {
      const installedLabel = extensionSettingsBox.getByText('installed');
      await playExpect(installedLabel).toBeVisible();

      const settingsBar = new SettingsBar(page);
      await playExpect(settingsBar.settingsNavBar.getByRole('link', { name: settingsLink })).toBeVisible();

      const extensionPage = await settingsBar.openTabPage(extensionPageType);
      await playExpect(extensionPage.heading).toBeVisible();
      await playExpect(extensionPage.status).toHaveText('ENABLED');
    });

    describe('Toggle and verify extension status', async () => {
      test('Disable extension and verify Dashboard components', async () => {
        const extensionPage = new extensionPageType(page);

        await extensionPage.disableButton.click();
        await playExpect(extensionPage.status).toHaveText('DISABLED');

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeHidden();
        await playExpect(extensionDashboardStatus).toBeHidden();
      });

      test('Enable extension and verify Dashboard components', async () => {
        await goToSettings();
        const settingsBar = new SettingsBar(page);
        await settingsBar.openTabPage(SettingsExtensionsPage);
        const extensionPage = await settingsBar.openTabPage(extensionPageType);

        await extensionPage.enableButton.click();
        await playExpect(extensionPage.status).toHaveText('ENABLED', { timeout: 10000 });

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeVisible();
        await playExpect(extensionDashboardStatus).toBeVisible();
      });
    });
  });

  describe('Remove extension and verify UI', async () => {
    test('Remove extension and verify Settings components', async () => {
      await goToSettings();
      const settingsBar = new SettingsBar(page);
      await settingsBar.openTabPage(SettingsExtensionsPage);
      const extensionPage = await settingsBar.openTabPage(extensionPageType);

      await extensionPage.disableButton.click();
      await extensionPage.removeExtensionButton.click();

      const installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });
      await playExpect(installButton).toBeVisible();

      await playExpect(settingsBar.settingsNavBar.getByRole('link', { name: settingsLink })).toBeHidden();
    });

    test('Verify Dashboard components', async () => {
      await goToDashboard();
      const dashboardInstallButton = extensionDashboardBox.getByRole('button', { name: installButtonLabel });
      await playExpect(dashboardInstallButton).toBeVisible();
    });
  });
});

async function initializeLocators(extensionType: string) {
  const dashboardPage = new DashboardPage(page);
  const settingsExtensionsPage = new SettingsExtensionsPage(page);
  switch (extensionType) {
    case 'Developer Sandbox': {
      extensionDashboardStatus = dashboardPage.devSandboxEnabledStatus;
      extensionDashboardBox = dashboardPage.devSandboxBox;
      extensionDashboardProvider = dashboardPage.devSandboxProvider;
      extensionSettingsBox = settingsExtensionsPage.devSandboxBox;
      installButtonLabel = 'Install redhat.redhat-sandbox Extension';
      settingsLink = 'Red Hat OpenShift Sandbox';
      break;
    }
    case 'Openshift Local': {
      extensionDashboardStatus = dashboardPage.openshiftLocalEnabledStatus;
      extensionDashboardBox = dashboardPage.openshiftLocalBox;
      extensionDashboardProvider = dashboardPage.openshiftLocalProvider;
      extensionSettingsBox = settingsExtensionsPage.openshiftLocalBox;
      installButtonLabel = 'Install redhat.openshift-local Extension';
      settingsLink = 'Red Hat OpenShift Local';
      break;
    }
  }
}

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
