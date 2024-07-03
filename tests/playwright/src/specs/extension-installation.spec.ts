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
import { ExtensionCatalogCardPage } from '../model/pages/extension-catalog-card-page';
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
const DOWNLOADABLE = 'DOWNLOADABLE';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let extensionDashboardStatus: Locator;
let extensionDashboardProvider: Locator;
let installButtonLabel: string;
let extensionName: string;
let extensionLabel: string;
let resourceLabel: string;

let navBar: NavigationBar;

const _startup = async function (): Promise<void> {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName(`${extensionName}-installation-e2e`);

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
    extensionType: 'Red Hat OpenShift Sandbox',
  },
  {
    extensionType: 'Red Hat Openshift Local',
  },
])('$extensionType installation verification', async ({ extensionType }) => {
  beforeAll(_startup);
  afterAll(_shutdown);

  test('Initialize extension type', async () => {
    initializeLocators(extensionType);
    await navBar.openExtensions();
  });

  test('Install extension through Extensions Catalog', async () => {
    const extensionsPage = new ExtensionsPage(page);

    await extensionsPage.openCatalogTab();
    const extensionCatalog = new ExtensionCatalogCardPage(page, extensionType);
    await playExpect(extensionCatalog.parent).toBeVisible();

    await playExpect.poll(async () => await extensionCatalog.isInstalled()).toBeFalsy();
    await extensionCatalog.install(180000);

    await extensionsPage.openInstalledTab();
    await playExpect.poll(async () => await extensionsPage.extensionIsInstalled(extensionLabel)).toBeTruthy();
  }, 200000);

  describe('Extension verification after installation', async () => {
    test('Extension details can be opened', async () => {
      const extensionsPage = await navBar.openExtensions();

      const extensionDetailsPage = await extensionsPage.openExtensionDetails(
        extensionName,
        extensionLabel,
        extensionType,
      );
      await playExpect(extensionDetailsPage.status).toBeVisible({ timeout: 15000 });
    });

    test('Extension is active', async () => {
      const extensionsPage = await navBar.openExtensions();
      const extensionPage = await extensionsPage.openExtensionDetails(extensionName, extensionLabel, extensionType);
      await playExpect(extensionPage.status).toHaveText(ACTIVE);
    });

    describe('Extension can be disabled and reenabled', async () => {
      test('Disable extension and verify Dashboard and Resources components', async () => {
        const extensionsPage = await navBar.openExtensions();
        const extensionPage = await extensionsPage.openExtensionDetails(extensionName, extensionLabel, extensionType);

        await extensionPage.disableExtension();
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
        const extensionPage = await extensionsPage.openExtensionDetails(extensionName, extensionLabel, extensionType);

        await extensionPage.enableExtension();
        await playExpect(extensionPage.status).toHaveText(ACTIVE, { timeout: 10000 });

        await goToDashboard();
        await playExpect(extensionDashboardProvider).toBeVisible();
        await playExpect(extensionDashboardStatus).toBeVisible();
        if (extensionType === 'Red Hat OpenShift Sandbox') {
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
      let extensionsPage = await navBar.openExtensions();

      const extensionDetails = await extensionsPage.openExtensionDetails(extensionName, extensionLabel, extensionType);

      await extensionDetails.disableExtension();
      await extensionDetails.removeExtension();

      // now if deleted from extension details, the page details still there, just different
      await playExpect(extensionDetails.status).toHaveText(DOWNLOADABLE);
      await playExpect(extensionDetails.page.getByRole('button', { name: installButtonLabel })).toBeVisible();

      await goToDashboard();
      extensionsPage = await navBar.openExtensions();
      playExpect(await extensionsPage.extensionIsInstalled(extensionLabel)).toBeFalsy();
    });
  });
});

function initializeLocators(extensionType: string): void {
  const dashboardPage = new DashboardPage(page);
  switch (extensionType) {
    case 'Red Hat OpenShift Sandbox': {
      extensionDashboardStatus = dashboardPage.devSandboxStatusLabel;
      extensionDashboardProvider = dashboardPage.devSandboxProvider;
      installButtonLabel = 'Install redhat.redhat-sandbox Extension';
      extensionName = 'redhat-sandbox';
      extensionLabel = 'redhat.redhat-sandbox';
      resourceLabel = 'redhat.sandbox';
      break;
    }
    case 'Red Hat Openshift Local': {
      extensionDashboardStatus = dashboardPage.openshiftLocalStatusLabel;
      extensionDashboardProvider = dashboardPage.openshiftLocalProvider;
      installButtonLabel = 'Install redhat.openshift-local Extension';
      extensionName = 'openshift-local';
      extensionLabel = 'redhat.openshift-local';
      resourceLabel = 'crc';
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
