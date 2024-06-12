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

import { afterEach } from 'node:test';

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { CLIToolsPage } from '../model/pages/cli-tools-page';
import { ComposeOnboardingPage } from '../model/pages/compose-onboarding-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { SettingsBar } from '../model/pages/settings-bar';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { isCI, isLinux } from '../utility/platform';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let composeVersion: string;
// property that will make sure that on linux we can run only partial tests, by default this is turned off
const composePartialInstallation = process.env.COMPOSE_PARTIAL_INSTALL ? process.env.COMPOSE_PARTIAL_INSTALL : false;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('compose-onboarding-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe.skipIf(isCI && isLinux)('Compose onboarding workflow verification', async () => {
  afterEach(async () => {
    await navBar.openDashboard();
  });

  test('Compose onboarding button Setup is available', async () => {
    await navBar.openSettings();
    const settingsBar = new SettingsBar(page);
    const resourcesPage = await settingsBar.openTabPage(ResourcesPage);

    await playExpect(resourcesPage.composeResources).toBeVisible();
    await resourcesPage.composeResources.scrollIntoViewIfNeeded();

    const setupButton = resourcesPage.composeResources.getByRole('button', { name: 'Setup Compose' });
    await playExpect(
      setupButton,
      'Compose Setup button is not present, perhaps compose is already installed',
    ).toBeVisible({ timeout: 10000 });
  });

  test('Can enter Compose onboarding', async () => {
    const onboardingPage = await openComposeOnboarding(page);

    await playExpect(onboardingPage.heading).toBeVisible();
    await playExpect(onboardingPage.onboardingStatusMessage).toHaveText('Compose download');

    const downloadAvailableText = page.getByText(
      /Compose will be downloaded in the next step \(Version v[0-9.]+\). Want to download/,
      { exact: true },
    );
    await playExpect(downloadAvailableText).toBeVisible();

    const versionInfoFullText = await downloadAvailableText.textContent();
    const matches = versionInfoFullText?.match(/v\d+(\.\d+)+/);
    if (matches) {
      composeVersion = matches[0];
    }
  });

  test('Can install Compose locally', async () => {
    const onboardingPage = await openComposeOnboarding(page);
    await onboardingPage.nextStepButton.click();

    await playExpect(onboardingPage.onboardingStatusMessage).toHaveText('Compose successfully Downloaded', {
      timeout: 50000,
    });

    await onboardingPage.cancelSetupButtion.click();

    const skipDialog = page.getByRole('dialog', { name: 'Skip Setup Popup', exact: true });
    const skipOkButton = skipDialog.getByRole('button', { name: 'Ok' });
    await skipOkButton.click();
  });

  test('Can resume Compose onboarding and it can be canceled', async () => {
    const onboardingPage = await openComposeOnboarding(page);

    await playExpect(onboardingPage.onboardingStatusMessage).toHaveText('Compose successfully Downloaded');
    const downloadAvailableText = page.getByText(
      'The next step will install Compose system-wide. You will be prompted for system',
    );
    await playExpect(downloadAvailableText).toBeVisible();
    await playExpect(onboardingPage.nextStepButton).toBeVisible();
    await onboardingPage.cancelSetupButtion.click();

    const skipDialog = page.getByRole('dialog', { name: 'Skip Setup Popup', exact: true });
    const skipOkButton = skipDialog.getByRole('button', { name: 'Ok' });
    await skipOkButton.click();
  });

  test.skipIf(composePartialInstallation)('Can install Compose system-wide', async () => {
    const onboardingPage = await openComposeOnboarding(page);
    await onboardingPage.nextStepButton.click();

    await playExpect(onboardingPage.onboardingStatusMessage).toHaveText('Compose installed', { timeout: 50000 });
    await playExpect(onboardingPage.mainPage.getByRole('heading', { name: 'How To Use Compose' })).toBeVisible();
    await playExpect(onboardingPage.nextStepButton).toBeEnabled();
    await onboardingPage.nextStepButton.click();
    // expects redirection to the Resources page
    const resourcesPage = new ResourcesPage(page);
    await playExpect(resourcesPage.heading).toBeVisible();
  });

  test.skipIf(composePartialInstallation)('Verify Compose was installed', async () => {
    await navBar.openSettings();
    const resourcesPage = new ResourcesPage(page);
    const composeBox = resourcesPage.featuredProviderResources.getByRole('region', { name: 'Compose' });
    const setupButton = composeBox.getByRole('button', { name: 'Setup Compose' });
    await playExpect(setupButton).toBeHidden();

    const settingsBar = new SettingsBar(page);
    const cliToolsPage = await settingsBar.openTabPage(CLIToolsPage);
    const composeRow = cliToolsPage.toolsTable.getByLabel('Compose');
    const composeVersionInfo = composeRow.getByLabel('cli-version');
    await playExpect(composeVersionInfo).toHaveText('docker-compose ' + composeVersion);
  });
});

async function openComposeOnboarding(page: Page): Promise<ComposeOnboardingPage> {
  await navBar.openSettings();
  const settingsBar = new SettingsBar(page);
  const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
  await playExpect(resourcesPage.heading).toBeVisible();
  await playExpect(resourcesPage.composeResources).toBeVisible();
  await resourcesPage.composeResources.scrollIntoViewIfNeeded();
  const setupButton = resourcesPage.composeResources.getByRole('button', { name: 'Setup Compose' });
  await playExpect(
    setupButton,
    'Compose Setup button is not present, perhaps compose is already installed',
  ).toBeVisible({ timeout: 10000 });
  await setupButton.click();
  return new ComposeOnboardingPage(page);
}
