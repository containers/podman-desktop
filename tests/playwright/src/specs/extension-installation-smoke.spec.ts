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
import { expect as playExpect, test } from '@playwright/test';

import { DashboardPage } from '../model/pages/dashboard-page';
import { ExtensionCatalogCardPage } from '../model/pages/extension-catalog-card-page';
import { ExtensionsPage } from '../model/pages/extensions-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { SettingsBar } from '../model/pages/settings-bar';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { Runner } from '../runner/podman-desktop-runner';

const DISABLED = 'DISABLED';
const ACTIVE = 'ACTIVE';
const RUNNING = 'RUNNING';
const NOT_INSTALLED = 'NOT-INSTALLED';
const DOWNLOADABLE = 'DOWNLOADABLE';
const OPENSHIFT_LOCAL = 'Red Hat Openshift Local';
const OPENSHIFT_SANDBOX = 'Red Hat OpenShift Sandbox';
const OPENSHIFT_CHECKER = 'Red Hat Openshift Checker';

let pdRunner: Runner;
let page: Page;

let extensionDashboardStatus: Locator | undefined;
let extensionDashboardProvider: Locator | undefined;
let installButtonLabel: string;
let extensionLabel: string;
let resourceLabel: string | undefined;
let ociImageUrl: string;

let navigationBar: NavigationBar;

async function _startup(extensionName: string): Promise<void> {
  pdRunner = await Runner.getInstance();
  page = pdRunner.getPage();
  pdRunner.setVideoAndTraceName(`${extensionName}-installation-e2e`);

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);

  navigationBar = new NavigationBar(page);
}

const extentionTypes = [
  {
    extensionName: 'redhat-sandbox',
    extensionType: OPENSHIFT_SANDBOX,
  },
  {
    extensionName: 'openshift-local',
    extensionType: OPENSHIFT_LOCAL,
  },
  {
    extensionName: 'openshift-checker',
    extensionType: OPENSHIFT_CHECKER,
  },
];

for (const { extensionName, extensionType } of extentionTypes) {
  test.describe.serial(`Extension installation for ${extensionType}`, { tag: '@smoke' }, () => {
    test.beforeAll(async () => {
      await _startup(extensionName);
    });
    test.afterAll(async () => {
      await pdRunner.close();
    });

    test('Initialize extension type', async () => {
      initializeLocators(extensionType);
      await navigationBar.openExtensions();
    });

    test('Install extension through Extensions Catalog', async () => {
      test.skip(extensionType === OPENSHIFT_CHECKER);
      test.setTimeout(200000);

      const extensionsPage = new ExtensionsPage(page);

      await extensionsPage.openCatalogTab();
      const extensionCatalog = new ExtensionCatalogCardPage(page, extensionType);
      await playExpect(extensionCatalog.parent).toBeVisible();

      await playExpect.poll(async () => await extensionCatalog.isInstalled()).toBeFalsy();
      await extensionCatalog.install(180000);

      await extensionsPage.openInstalledTab();
      await playExpect.poll(async () => await extensionsPage.extensionIsInstalled(extensionLabel)).toBeTruthy();
    });

    test('Install extension from OCI Image', async () => {
      test.skip(extensionType !== OPENSHIFT_CHECKER);
      test.setTimeout(200_000);

      const extensionsPage = new ExtensionsPage(page);

      await extensionsPage.installExtensionFromOCIImage(ociImageUrl);
      await extensionsPage.openCatalogTab();
      const extensionCatalog = new ExtensionCatalogCardPage(page, extensionType);
      await playExpect(extensionCatalog.parent).toBeVisible();
      await playExpect.poll(async () => await extensionCatalog.isInstalled()).toBeTruthy();

      await extensionsPage.openInstalledTab();
      await playExpect.poll(async () => await extensionsPage.extensionIsInstalled(extensionLabel)).toBeTruthy();
    });

    test.describe
      .serial('Extension verification after installation', () => {
        test('Extension details can be opened', async () => {
          const extensionsPage = await navigationBar.openExtensions();

          const extensionDetailsPage = await extensionsPage.openExtensionDetails(
            extensionName,
            extensionLabel,
            extensionType,
          );
          await playExpect(extensionDetailsPage.status).toBeVisible({ timeout: 15000 });
        });

        test('Extension is active and there are not errors', async () => {
          const extensionsPage = await navigationBar.openExtensions();
          const extensionPage = await extensionsPage.openExtensionDetails(extensionName, extensionLabel, extensionType);
          await playExpect(extensionPage.heading).toBeVisible();
          await playExpect(extensionPage.status).toHaveText(ACTIVE);
          // tabs are empty in case there is no error. If there is error, there are two tabs' buttons present
          const errorTab = extensionPage.tabs.getByRole('button', { name: 'Error' });
          // we would like to propagate the error's stack trace into test failure message
          let stackTrace = '';
          if ((await errorTab.count()) > 0) {
            stackTrace = await errorTab.innerText();
          }
          await playExpect(errorTab, `Error Tab was present with stackTrace: ${stackTrace}`).not.toBeVisible();
        });

        test.describe
          .serial('Extension can be disabled and reenabled', () => {
            test('Disable extension and verify Dashboard and Resources components if present', async () => {
              const extensionsPage = await navigationBar.openExtensions();
              const extensionPage = await extensionsPage.openExtensionDetails(
                extensionName,
                extensionLabel,
                extensionType,
              );

              await extensionPage.disableExtension();
              await playExpect(extensionPage.status).toHaveText(DISABLED);

              // check that dashboard card provider is hidden/shown
              if (extensionDashboardProvider && extensionDashboardStatus) {
                await goToDashboard();
                await playExpect(extensionDashboardProvider).toBeHidden();
              }

              // check that thr provider card is on Resources Page
              if (resourceLabel) {
                const settingsBar = await goToSettings();
                const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
                const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
                  name: resourceLabel,
                });
                await playExpect(extensionResourceBox).toBeHidden();
              }
            });

            test('Enable extension and verify Dashboard and Resources components', async () => {
              const extensionsPage = await navigationBar.openExtensions();
              const extensionPage = await extensionsPage.openExtensionDetails(
                extensionName,
                extensionLabel,
                extensionType,
              );

              await extensionPage.enableExtension();
              await playExpect(extensionPage.status).toHaveText(ACTIVE, { timeout: 10000 });

              // check that dashboard card provider is hidden/shown
              if (extensionDashboardProvider && extensionDashboardStatus) {
                await goToDashboard();
                await playExpect(extensionDashboardProvider).toBeVisible();
                await playExpect(extensionDashboardStatus).toBeVisible();
                if (extensionType === 'Red Hat OpenShift Sandbox') {
                  await playExpect(extensionDashboardStatus).toHaveText(RUNNING);
                } else {
                  await playExpect(extensionDashboardStatus).toHaveText(NOT_INSTALLED);
                }
              }

              // check that thr provider card is on Resources Page
              if (resourceLabel) {
                const settingsBar = await goToSettings();
                const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
                const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
                  name: resourceLabel,
                });
                await playExpect(extensionResourceBox).toBeVisible();
              }
            });
          });
      });

    test.describe
      .serial('Remove extension and verify UI', () => {
        test('Remove extension and verify components', async () => {
          let extensionsPage = await navigationBar.openExtensions();

          const extensionDetails = await extensionsPage.openExtensionDetails(
            extensionName,
            extensionLabel,
            extensionType,
          );

          await extensionDetails.disableExtension();
          await extensionDetails.removeExtension();

          // now if deleted from extension details, the page details still there, just different
          await playExpect(extensionDetails.status).toHaveText(DOWNLOADABLE);
          await playExpect(extensionDetails.page.getByRole('button', { name: installButtonLabel })).toBeVisible();

          await goToDashboard();
          extensionsPage = await navigationBar.openExtensions();
          playExpect(await extensionsPage.extensionIsInstalled(extensionLabel)).toBeFalsy();
        });
      });
  });
}

function initializeLocators(extensionType: string): void {
  const dashboardPage = new DashboardPage(page);
  switch (extensionType) {
    case OPENSHIFT_SANDBOX: {
      extensionDashboardStatus = dashboardPage.devSandboxStatusLabel;
      extensionDashboardProvider = dashboardPage.devSandboxProvider;
      installButtonLabel = 'Install redhat.redhat-sandbox Extension';
      extensionLabel = 'redhat.redhat-sandbox';
      resourceLabel = 'redhat.sandbox';
      ociImageUrl = '';
      break;
    }
    case OPENSHIFT_LOCAL: {
      extensionDashboardStatus = dashboardPage.openshiftLocalStatusLabel;
      extensionDashboardProvider = dashboardPage.openshiftLocalProvider;
      installButtonLabel = 'Install redhat.openshift-local Extension';
      extensionLabel = 'redhat.openshift-local';
      resourceLabel = 'crc';
      ociImageUrl = '';
      break;
    }
    case OPENSHIFT_CHECKER: {
      extensionDashboardStatus = undefined;
      extensionDashboardProvider = undefined;
      installButtonLabel = 'Install redhat.openshift-checker Extension';
      extensionLabel = 'redhat.openshift-checker';
      resourceLabel = undefined;
      ociImageUrl = 'ghcr.io/redhat-developer/podman-desktop-image-checker-openshift-ext:0.1.5';
      break;
    }
  }
}

async function goToDashboard(): Promise<void> {
  const navigationBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const dashboardLink = navigationBar.getByRole('link', { name: 'Dashboard' });
  await playExpect(dashboardLink).toBeVisible();
  await dashboardLink.click();
}

async function goToSettings(): Promise<SettingsBar> {
  const navigationBar = page.getByRole('navigation', { name: 'AppNavigation' });
  const settingsLink = navigationBar.getByRole('link', { name: 'Settings' });
  await playExpect(settingsLink).toBeVisible();
  await settingsLink.click();
  return new SettingsBar(page);
}
