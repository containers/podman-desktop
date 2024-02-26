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

import { expect as playExpect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { afterAll, beforeAll, beforeEach, test, describe } from 'vitest';
import { WelcomePage } from './model/pages/welcome-page';
import { NavigationBar } from './model/workbench/navigation';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { SettingsBar } from './model/pages/settings-bar';
import { ResourcesPage } from './model/pages/resources-page';
import { ComposeOnboardingPage } from './model/pages/compose-onboarding-page';
import { CLIToolsPage } from './model/pages/cli-tools-page';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let composeVersion: string;

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

describe('Compose onboarding workflow verification', async () => {
  test('Can enter Compose onboarding', async () => {
    await navBar.openSettings();
    const settingsBar = new SettingsBar(page);
    const resourcesPage = await settingsBar.openTabPage(ResourcesPage);

    const composeBox = resourcesPage.featuredProviderResources.getByRole('region', { name: 'Compose' });
    await playExpect(composeBox).toBeVisible();
    await composeBox.scrollIntoViewIfNeeded();

    const setupButton = composeBox.getByRole('button', { name: 'Setup Compose' });
    await playExpect(setupButton).toBeVisible({ timeout: 50000 });

    await setupButton.click();

    const onboardingPage = new ComposeOnboardingPage(page);

    await playExpect(onboardingPage.heading).toBeVisible();
    await playExpect(onboardingPage.statusMessage).toHaveText('Compose Download');

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
    const onboardingPage = new ComposeOnboardingPage(page);
    await onboardingPage.nextButton.click();

    await playExpect(onboardingPage.statusMessage).toHaveText('Compose Successfully Downloaded', { timeout: 50000 });

    await onboardingPage.cancelButton.click();

    const skipDialog = page.getByRole('dialog', { name: 'Skip Setup Popup', exact: true });
    const skipOkButton = skipDialog.getByRole('button', { name: 'Ok' });
    await skipOkButton.click();
  });

  test('Can install Compose system-wide', async () => {
    const resourcesPage = new ResourcesPage(page);
    const composeBox = resourcesPage.featuredProviderResources.getByRole('region', { name: 'Compose' });
    const setupButton = composeBox.getByRole('button', { name: 'Setup Compose' });
    await setupButton.click();

    const onboardingPage = new ComposeOnboardingPage(page);
    await playExpect(onboardingPage.statusMessage).toHaveText('Compose Successfully Downloaded');
    const downloadAvailableText = page.getByText(
      'The next step will install Compose system-wide. You will be prompted for system',
    );
    await playExpect(downloadAvailableText).toBeVisible();

    await onboardingPage.nextButton.click();

    await playExpect(onboardingPage.statusMessage).toHaveText('Compose Installed', { timeout: 50000 });
    let downloadFinishedText = page.locator('p');
    downloadFinishedText = downloadFinishedText.filter({ hasText: 'Compose is installed system-wide!' });
    await playExpect(downloadFinishedText).toBeVisible();

    await onboardingPage.nextButton.click();
  });

  test('Verify Compose was installed', async () => {
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
