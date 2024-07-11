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

import { expect as playExpect } from '@playwright/test';
import type { Page } from 'playwright';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import type { DashboardPage } from '../model/pages/dashboard-page';
import type { ExtensionDetailsPage } from '../model/pages/extension-details-page';
import type { SettingsBar } from '../model/pages/settings-bar';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';

const extensionLabel = 'podman-desktop.podman';
const extensionLabelName = 'podman';
const extensionHeading = 'podman';
const PODMAN_EXTENSION_STATUS_ACTIVE: string = 'ACTIVE';
const PODMAN_EXTENSION_STATUS_DISABLED: string = 'DISABLED';
const SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION: string = 'Extension: Podman';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let dashboardPage: DashboardPage;
let settingsBar: SettingsBar;
let navigationBar: NavigationBar;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('podman-extensions-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navigationBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
}, 120000);

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Verification of Podman extension', async () => {
  test('Podman is enabled and present', async () => {
    await verifyPodmanExtensionStatus(true);
  });
  test('Podman extension can be disabled from Podman Extension Page', async () => {
    const podmanExtensionPage = await openExtensionsPodmanPage();
    await podmanExtensionPage.disableExtension();
    await verifyPodmanExtensionStatus(false);
  });
  test('Podman extension can be re-enabled from Extension Page', async () => {
    const podmanExtensionPage = await openExtensionsPodmanPage(); // enable the extension
    await podmanExtensionPage.enableExtension();
    await verifyPodmanExtensionStatus(true);
  });
});

async function verifyPodmanExtensionStatus(enabled: boolean): Promise<void> {
  dashboardPage = await navigationBar.openDashboard();

  if (enabled) {
    await playExpect(dashboardPage.getPodmanStatusLocator()).toBeVisible();
  } else {
    await playExpect(dashboardPage.getPodmanStatusLocator()).not.toBeVisible();
  }
  // always present and visible
  // go to the details of the extension
  const extensionsPage = await navigationBar.openExtensions();
  const extensionDetailsPage = await extensionsPage.openExtensionDetails(
    extensionLabelName,
    extensionLabel,
    extensionHeading,
  );

  const extensionStatusLabel = extensionDetailsPage.status;

  await playExpect(extensionStatusLabel).toBeVisible();
  await extensionStatusLabel.scrollIntoViewIfNeeded();
  // --------------------------

  if (enabled) {
    await playExpect(extensionStatusLabel).toContainText(PODMAN_EXTENSION_STATUS_ACTIVE, { timeout: 10000 });
  } else {
    await playExpect(extensionStatusLabel).toContainText(PODMAN_EXTENSION_STATUS_DISABLED, { timeout: 10000 });
  }
  // always present and visible
  const extensionsPageAfter = await navigationBar.openExtensions();
  const podmanExtensionPage = await extensionsPageAfter.openExtensionDetails(
    extensionLabelName,
    extensionLabel,
    extensionHeading,
  );

  // --------------------------
  if (enabled) {
    await playExpect(podmanExtensionPage.enableButton).not.toBeVisible({ timeout: 10000 });
    await playExpect(podmanExtensionPage.disableButton).toBeVisible({ timeout: 10000 });
    await playExpect(podmanExtensionPage.status.getByText(PODMAN_EXTENSION_STATUS_ACTIVE)).toBeVisible();
  } else {
    await playExpect(podmanExtensionPage.enableButton).toBeVisible({ timeout: 10000 });
    await playExpect(podmanExtensionPage.disableButton).not.toBeVisible({ timeout: 10000 });
    await playExpect(podmanExtensionPage.status.getByText(PODMAN_EXTENSION_STATUS_DISABLED)).toBeVisible();
  }

  // expand Settings -> Preferences menu
  settingsBar = await navigationBar.openSettings();
  await settingsBar.preferencesTab.click();

  if (enabled) {
    await playExpect(
      settingsBar.getSettingsNavBarTabLocator(SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION),
    ).toBeVisible();
  } else {
    await playExpect(
      settingsBar.getSettingsNavBarTabLocator(SETTINGS_NAVBAR_PREFERENCES_PODMAN_EXTENSION),
    ).not.toBeVisible();
  }
  // collapse Settings -> Preferences menu
  await settingsBar.preferencesTab.click();
}

async function openExtensionsPodmanPage(): Promise<ExtensionDetailsPage> {
  const extensionsPage = await navigationBar.openExtensions();
  return extensionsPage.openExtensionDetails(extensionLabelName, extensionLabel, extensionHeading);
}
