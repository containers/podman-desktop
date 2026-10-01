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
import { expect as playExpect, test } from '@playwright/test';

import type { ExtensionInstallConfig } from '/@/model/core/extensions';
import {
  bootcExtension,
  extensionInstallConfigs,
  extensionsAllExternalList,
  extensionsInstallationSmokeList,
  openshiftDockerExtension,
} from '/@/model/core/extensions';
import { ExtensionState } from '/@/model/core/states';
import { ExtensionCatalogCardPage } from '/@/model/pages/extension-catalog-card-page';
import { ExtensionsPage } from '/@/model/pages/extensions-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { SettingsBar } from '/@/model/pages/settings-bar';
import { WelcomePage } from '/@/model/pages/welcome-page';
import { NavigationBar } from '/@/model/workbench/navigation';
import type { Runner } from '/@/runner/podman-desktop-runner';
import { RunnerFactory } from '/@/runner/runner-factory';
import { isWindows } from '/@/utility/platform';

let pdRunner: Runner;
let page: Page;

let extensionNavigationBarIcon: Locator | undefined;
let resourceLabel: string | undefined;
let ociImageUrl: string | undefined;

let navigationBar: NavigationBar;
const skipExtensionsTest = process.env.SKIP_EXTENSIONS_TEST === 'true';

test.skip(skipExtensionsTest, 'Skip test suite based on env. variable');

// Set PODMAN_DESKTOP_EXTENSIONS env var to a comma-separated list of extension names to run only specific extensions.
// Available extension names:
//   minikube, Podman AI Lab, Red Hat Extension Pack, Bootable Container, Developer Sandbox,
//   Image Layers Explorer, Podman Quadlet, Red Hat Authentication, Red Hat OpenShift Checker,
//   Red Hat OpenShift Local, Headlamp, OpenShift
const requestedExtensions = process.env.PODMAN_DESKTOP_EXTENSIONS;
const extensionsToTest = requestedExtensions
  ? extensionsAllExternalList.filter(ext => {
      const extName = ext.extensionName.toLowerCase();
      return requestedExtensions
        .split(',')
        .map(name => name.trim().toLowerCase())
        .some(requested => extName.startsWith(requested) || requested.startsWith(extName));
    })
  : extensionsInstallationSmokeList;

if (requestedExtensions && extensionsToTest.length === 0) {
  test('PODMAN_DESKTOP_EXTENSIONS matched at least one known extension', () => {
    throw new Error(
      `PODMAN_DESKTOP_EXTENSIONS="${requestedExtensions}" matched no known extensions. ` +
        `Available: ${extensionsAllExternalList.map(e => e.extensionName).join(', ')}`,
    );
  });
}

async function _startup(extensionLabel: string): Promise<void> {
  pdRunner = await RunnerFactory.getInstance();
  page = pdRunner.getPage();
  pdRunner.setVideoAndTraceName(`${extensionLabel}-installation-e2e`);

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);

  navigationBar = new NavigationBar(page);
}

for (const { extensionLabel, extensionFullLabel, extensionName, extensionFullName } of extensionsToTest) {
  test.describe(`Extension installation for ${extensionName}`, { tag: '@smoke' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(extensionName === openshiftDockerExtension.extensionName && !!isWindows); // Currently timing out in azure cicd https://github.com/podman-desktop/e2e/issues/396

    test.beforeAll(async () => {
      await _startup(extensionLabel);
    });
    test.afterAll(async () => {
      await pdRunner.close();
    });

    test('Initialize extension type', async () => {
      initializeLocators(extensionName);
      await navigationBar.openExtensions();
    });

    test('Install extension through Extensions Catalog', async () => {
      test.skip(!!ociImageUrl, 'Extension has OCI image configured, skipping catalog install');
      test.setTimeout(200_000);

      const extensionsPage = new ExtensionsPage(page);
      await playExpect(extensionsPage.heading).toBeVisible();

      await extensionsPage.openCatalogTab();
      const extensionCatalog = new ExtensionCatalogCardPage(page, extensionName);
      await playExpect(extensionCatalog.parent).toBeVisible();

      await playExpect.poll(async () => await extensionCatalog.isInstalled()).toBeFalsy();
      await extensionCatalog.install(180_000);

      await extensionsPage.openInstalledTab();
      await playExpect.poll(async () => await extensionsPage.extensionIsInstalled(extensionFullLabel)).toBeTruthy();
    });

    test('Install extension from OCI Image', async () => {
      test.skip(!ociImageUrl, 'No OCI image configured, skipping OCI install');
      test.setTimeout(200_000);

      const extensionsPage = new ExtensionsPage(page);

      if (!ociImageUrl) throw new Error('ociImageUrl is required for OCI install');
      await extensionsPage.installExtensionFromOCIImage(ociImageUrl, 180_000);
      if (extensionName !== openshiftDockerExtension.extensionName) {
        await extensionsPage.openCatalogTab();
        const extensionCatalog = new ExtensionCatalogCardPage(page, extensionName);
        await playExpect(extensionCatalog.parent).toBeVisible();
        await playExpect.poll(async () => await extensionCatalog.isInstalled()).toBeTruthy();
      }

      await extensionsPage.openInstalledTab();
      await playExpect
        .poll(async () => await extensionsPage.extensionIsInstalled(extensionFullLabel), { timeout: 15_000 })
        .toBeTruthy();
    });

    test.describe('Extension verification after installation', () => {
      test.describe.configure({ mode: 'serial' });
      test('Extension details can be opened', async () => {
        const extensionsPage = await navigationBar.openExtensions();

        const extensionDetailsPage = await extensionsPage.openExtensionDetails(
          extensionLabel,
          extensionFullLabel,
          extensionFullName,
        );
        await playExpect(extensionDetailsPage.status).toBeVisible({ timeout: 15_000 });
      });

      test('Extension is active and there are not errors', async () => {
        const extensionsPage = await navigationBar.openExtensions();
        const extensionPage = await extensionsPage.openExtensionDetails(
          extensionLabel,
          extensionFullLabel,
          extensionFullName,
        );
        await playExpect(extensionPage.heading).toBeVisible();
        await playExpect(extensionPage.status).toHaveText(ExtensionState.Installed, { timeout: 15_000 });
        // tabs are empty in case there is no error. If there is error, there are two tabs' buttons present
        const errorTab = extensionPage.tabs.getByRole('button', { name: 'Error' });
        // we would like to propagate the error's stack trace into test failure message
        let stackTrace = '';
        if ((await errorTab.count()) > 0) {
          stackTrace = await errorTab.innerText();
        }
        await playExpect(errorTab, `Error Tab was present with stackTrace: ${stackTrace}`).not.toBeVisible();
      });

      test.describe('Extension can be disabled and reenabled', () => {
        test.describe.configure({ mode: 'serial' });
        test.skip(
          extensionName === openshiftDockerExtension.extensionName,
          'OpenShift Docker extension cannot be disabled',
        );

        test('Disable extension and verify Navbar and Resources components if present', async () => {
          const extensionsPage = await navigationBar.openExtensions();
          const extensionPage = await extensionsPage.openExtensionDetails(
            extensionLabel,
            extensionFullLabel,
            extensionFullName,
          );

          await extensionPage.disableExtension();
          await playExpect(extensionPage.status).toHaveText(ExtensionState.Disabled);

          // check that extension navbar icon is hidden/shown
          if (extensionNavigationBarIcon) {
            await playExpect(extensionNavigationBarIcon).toBeHidden();
          }

          // check that the provider card is on Resources Page -> bootc require binary installation, docker doesn't have
          if (
            resourceLabel &&
            extensionName !== openshiftDockerExtension.extensionName &&
            extensionName !== bootcExtension.extensionName
          ) {
            const settingsBar = await goToSettings();
            const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
            const extensionResourceBox = resourcesPage.featuredProviderResources.getByRole('region', {
              name: resourceLabel,
            });
            await playExpect(extensionResourceBox).toBeHidden();
          }
        });

        test('Enable extension and verify Navbar and Resources components', async () => {
          const extensionsPage = await navigationBar.openExtensions();
          const extensionPage = await extensionsPage.openExtensionDetails(
            extensionLabel,
            extensionFullLabel,
            extensionFullName,
          );

          await extensionPage.enableExtension();
          await playExpect(extensionPage.status).toHaveText(ExtensionState.Installed, { timeout: 10_000 });

          // check that extension navbar icon is hidden/shown
          if (extensionNavigationBarIcon) {
            await playExpect(extensionNavigationBarIcon).toBeVisible();
          }

          // check that the provider card is on Resources Page -> bootc requires binary installation
          if (
            resourceLabel &&
            extensionName !== openshiftDockerExtension.extensionName &&
            extensionName !== bootcExtension.extensionName
          ) {
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

    test.describe('Remove extension and verify UI', () => {
      test.describe.configure({ mode: 'serial' });
      test('Remove extension and verify components', async () => {
        let extensionsPage = await navigationBar.openExtensions();

        const extensionDetails = await extensionsPage.openExtensionDetails(
          extensionLabel,
          extensionFullLabel,
          extensionFullName,
        );
        if (extensionName !== openshiftDockerExtension.extensionName) {
          await extensionDetails.disableExtension();
        }
        await extensionDetails.removeExtension(false);

        if (extensionName !== openshiftDockerExtension.extensionName) {
          // now if deleted from extension details, the page details are still there, just different
          await playExpect(extensionDetails.status).toHaveText(ExtensionState.Downloadable);
          await playExpect(
            extensionDetails.page.getByRole('button', { name: `Install ${extensionFullLabel} Extension` }),
          ).toBeVisible();
        }

        await goToDashboard();
        extensionsPage = await navigationBar.openExtensions();
        await playExpect
          .poll(async () => extensionsPage.extensionIsInstalled(extensionFullLabel), { timeout: 15_000 })
          .toBeFalsy();
      });
    });
  });
}

test.describe('Install extension via SHA digest', { tag: '@smoke' }, () => {
  test.describe.configure({ mode: 'serial' });
  const ext = openshiftDockerExtension;
  const config: ExtensionInstallConfig | undefined = extensionInstallConfigs[ext.extensionName];
  const shaDigestUrl = config?.shaDigestImageUrl;

  test.skip(!shaDigestUrl, 'No SHA digest URL configured');
  test.skip(!!isWindows, 'OpenShift Docker extension times out on Windows');

  test.beforeAll(async () => {
    await _startup(ext.extensionLabel);
  });

  test.afterAll(async () => {
    await pdRunner.close();
  });

  test('Install extension from OCI image using SHA digest', async () => {
    test.setTimeout(200_000);

    const extensionsPage = await navigationBar.openExtensions();
    await playExpect(extensionsPage.heading).toBeVisible();

    if (!shaDigestUrl) throw new Error('shaDigestUrl is required');
    await extensionsPage.installExtensionFromOCIImage(shaDigestUrl, 180_000);

    await extensionsPage.openInstalledTab();
    await playExpect
      .poll(async () => await extensionsPage.extensionIsInstalled(ext.extensionFullLabel), { timeout: 15_000 })
      .toBeTruthy();
  });

  test('Extension installed via digest is active with no errors', async () => {
    const extensionsPage = await navigationBar.openExtensions();
    const extensionPage = await extensionsPage.openExtensionDetails(
      ext.extensionLabel,
      ext.extensionFullLabel,
      ext.extensionFullName,
    );
    await playExpect(extensionPage.heading).toBeVisible();
    await playExpect(extensionPage.status).toHaveText(ExtensionState.Installed, { timeout: 15_000 });

    const errorTab = extensionPage.tabs.getByRole('button', { name: 'Error' });
    let stackTrace = '';
    if ((await errorTab.count()) > 0) {
      stackTrace = await errorTab.innerText();
    }
    await playExpect(errorTab, `Error Tab was present with stackTrace: ${stackTrace}`).not.toBeVisible();
  });

  test('Remove extension installed via digest', async () => {
    const extensionsPage = await navigationBar.openExtensions();
    const extensionDetails = await extensionsPage.openExtensionDetails(
      ext.extensionLabel,
      ext.extensionFullLabel,
      ext.extensionFullName,
    );
    await extensionDetails.removeExtension(false);

    await goToDashboard();
    const extensionsPageAfter = await navigationBar.openExtensions();
    await playExpect
      .poll(async () => extensionsPageAfter.extensionIsInstalled(ext.extensionFullLabel), { timeout: 15_000 })
      .toBeFalsy();
  });
});

function initializeLocators(extensionName: string): void {
  const nav = new NavigationBar(page);
  const config = extensionInstallConfigs[extensionName];

  ociImageUrl = config?.ociImageUrl;
  resourceLabel = config?.resourceLabel;
  extensionNavigationBarIcon = config?.navigationBarIconName
    ? nav.navigationLocator.getByRole('link', { name: config.navigationBarIconName, exact: true })
    : undefined;
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
