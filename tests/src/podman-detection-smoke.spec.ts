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

import type { Page } from '@playwright/test';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import type { SettingsBar } from './model/pages/settings-bar';
import type { DashboardPage } from './model/pages/dashboard-page';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { ResourcesPage } from './model/pages/resources-page';
import { NavigationBar } from './model/workbench/navigation';
import { platform } from 'os';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let dashboardPage: DashboardPage;
let settingsBar: SettingsBar;
const os = platform();

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('podman-detection');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page); // always present on the left side of the page
  dashboardPage = await navBar.openDashboard();
});

afterAll(async () => {
  await pdRunner.close();
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

describe('Podman Detection verification', async () => {
  // TODO: add skipif in case where we expect podman to be installed, not running
  describe.runIf(os === 'linux')('On Linux', async () => {
    test('Podman is installed and running on Dashboard', async () => {
      const podmanProvider = dashboardPage.getPodmanStatusLocator();
      await playExpect(podmanProvider).toBeVisible();

      // TODO: missing ARIA functionality
      const actualState = podmanProvider.getByLabel('Actual State');
      await playExpect(actualState).toBeVisible();
      await playExpect(actualState).toContainText('running', { ignoreCase: true });
      const providerVersion = podmanProvider.getByLabel('Provider Version');
      await playExpect(providerVersion).toBeVisible();
      await playExpect(providerVersion).toContainText(/v\d.\d.\d/, { ignoreCase: true });
    });

    test('Podman provider is running in Resources', async () => {
      settingsBar = await navBar.openSettings();
      const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
      const podmanBox = resourcesPage.featuredProviderResources.getByRole('region', {
        name: 'podman',
      });
      await playExpect(podmanBox).toBeVisible();

      const setupButton = podmanBox.getByRole('button', { name: 'Setup Podman' });
      await playExpect(setupButton).toBeVisible();
      const connectionStatusLabel = podmanBox.getByLabel('connection-status-label');
      await playExpect(connectionStatusLabel).toBeVisible();
      await playExpect(connectionStatusLabel).toContainText('RUNNING');
      const podmanTypeLabel = podmanBox.getByLabel('Podman type');
      await playExpect(podmanTypeLabel).toBeVisible();
      await playExpect(podmanTypeLabel).toContainText('Podman endpoint');
      const podmanEndpointLabel = podmanBox.getByLabel('Podman endpoint');
      await playExpect(podmanEndpointLabel).toBeVisible();
      await playExpect(podmanEndpointLabel).toContainText('podman.sock');
    });
  });
  describe.runIf(os === 'win32')('On Windows', async () => {
    test('Podman is installed and machine started', async () => {
      // TODO add windows and mac specific test
    });
  });
});
