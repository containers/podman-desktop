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

import type { BrowserWindow } from 'electron';
import type { JSHandle, Page } from 'playwright';
import { afterAll, beforeAll, expect, test, describe } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podmanDesktopRunner';
import { WelcomePage } from './model/page/welcomePage';
import { DashboardPage } from './model/page/dashboardPage';

const navBarItems = ['Dashboard', 'Containers', 'Images', 'Pods', 'Volumes', 'Settings'];
let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  const env: { [key: string]: string } = Object.assign({}, process.env as { [key: string]: string });
  env.PODMAN_DESKTOP_HOME_DIR = 'tests/output/podman-desktop';
  const properties = {
    env,
    recordVideo: {
      dir: 'tests/output/videos',
      size: {
        width: 1050,
        height: 700,
      },
    },
  };

  pdRunner = new PodmanDesktopRunner('.', properties);
  await pdRunner.startApp();

  page = await pdRunner.getPage();
});

afterAll(async () => {
  await pdRunner.closeApp();
});

describe('Basic e2e verification of podman desktop start', async () => {
  describe('Welcome page handling', async () => {
    test('Check the Welcome page is displayed', async () => {
      // Direct Electron console to Node terminal.
      page.on('console', console.log);

      const window: JSHandle<BrowserWindow> = await pdRunner.app.browserWindow(page);

      const windowState = await window.evaluate(
        (mainWindow): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean }> => {
          const getState = () => ({
            isVisible: mainWindow.isVisible(),
            isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
            isCrashed: mainWindow.webContents.isCrashed(),
          });

          return new Promise(resolve => {
            /**
             * The main window is created hidden, and is shown only when it is ready.
             * See {@link ../packages/main/src/mainWindow.ts} function
             */
            if (mainWindow.isVisible()) {
              resolve(getState());
            } else mainWindow.once('ready-to-show', () => resolve(getState()));
          });
        },
      );
      expect(windowState.isCrashed, 'The app has crashed').toBeFalsy();
      expect(windowState.isVisible, 'The main window was not visible').toBeTruthy();

      await page.screenshot({ path: 'tests/output/screenshots/screenshot-welcome-page-init.png', fullPage: true });

      const welcomePage = new WelcomePage(page);
      await playExpect(welcomePage.welcomeMessage).toBeVisible();
    });

    test('Telemetry checkbox is present, set to true, consent can be changed', async () => {
      // wait for the initial screen to be loaded
      const welcomePage = new WelcomePage(page);
      await playExpect(welcomePage.telemetryConsent).toBeVisible();
      playExpect(await welcomePage.telemetryConsent.isChecked()).toBeTruthy();

      await welcomePage.turnOffTelemetry();
      playExpect(await welcomePage.telemetryConsent.isChecked()).toBeFalsy();
    });

    test('Redirection from Welcome page to Dashboard works', async () => {
      const welcomePage = new WelcomePage(page);
      // wait for visibility
      await welcomePage.goToPodmanDesktopButton.waitFor({ state: 'visible' });

      await page.screenshot({ path: 'tests/output/screenshots/screenshot-welcome-page-display.png', fullPage: true });

      // click on the button
      await welcomePage.goToPodmanDesktopButton.click();

      await page.screenshot({
        path: 'tests/output/screenshots/screenshot-welcome-page-redirect-to-dashboard.png',
        fullPage: true,
      });

      // check we have the dashboard page
      const dashboardPage = new DashboardPage(page);
      await playExpect(dashboardPage.heading).toBeVisible();
    });
  });

  describe('Navigation Bar test', async () => {
    test('Verify navigation items are present', async () => {
      const navBar = page.getByRole('navigation', { name: 'AppNavigation' });
      await playExpect(navBar).toBeVisible();
      for (const item of navBarItems) {
        const locator = navBar.getByRole('link', { name: item, exact: true });
        await playExpect(locator).toBeVisible();
      }
    });
  });
});
