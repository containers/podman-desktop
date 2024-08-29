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

import type { Page } from '@playwright/test';
import { expect as playExpect, test } from '@playwright/test';

import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';

let pdRunner: PodmanDesktopRunner;
let page: Page;

test.beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner({ customFolder: 'welcome-podman-desktop' });
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('welcome-page-e2e');
});

test.afterAll(async () => {
  await pdRunner.close();
});

test.describe('Basic e2e verification of podman desktop start', () => {
  test.describe('Welcome page handling', () => {
    test('Check the Welcome page is displayed', async () => {
      const welcomePage = new WelcomePage(page);
      await playExpect(welcomePage.welcomeMessage).toBeVisible();
    });

    test('Telemetry checkbox is present, set to true, consent can be changed', async () => {
      const welcomePage = new WelcomePage(page);
      await playExpect(welcomePage.telemetryConsent).toBeVisible();
      await playExpect(welcomePage.telemetryConsent).toBeChecked();
      await welcomePage.turnOffTelemetry();
    });

    test('Redirection from Welcome page to Dashboard works', async () => {
      const welcomePage = new WelcomePage(page);
      const dashboardPage = await welcomePage.closeWelcomePage();
      await playExpect(dashboardPage.heading).toBeVisible();
    });
  });

  test.describe('Navigation Bar test', () => {
    test('Verify navigation items are visible', async () => {
      const navigationBar = new NavigationBar(page);
      await playExpect(navigationBar.navigationLocator).toBeVisible();
      await playExpect(navigationBar.dashboardLink).toBeVisible();
      await playExpect(navigationBar.imagesLink).toBeVisible();
      await playExpect(navigationBar.podsLink).toBeVisible();
      await playExpect(navigationBar.containersLink).toBeVisible();
      await playExpect(navigationBar.volumesLink).toBeVisible();
      await playExpect(navigationBar.settingsLink).toBeVisible();
    });
  });
});
