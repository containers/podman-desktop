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

import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';

test.use({ runnerOptions: new RunnerOptions({ customFolder: 'welcome-podman-desktop' }) });
test.beforeAll(async ({ runner }) => {
  runner.setVideoAndTraceName('welcome-page-e2e');
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Basic e2e verification of podman desktop start', {
  tag: ['@smoke', '@windows_sanity', '@macos_sanity'],
}, () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('Welcome page handling', () => {
    test.describe.configure({ mode: 'serial' });
    test('Check the Welcome page is displayed', async ({ welcomePage }) => {
      await playExpect(welcomePage.welcomeMessage).toBeVisible();
    });

    test('Welcome page overlays the navigation resize handle', async ({ page, welcomePage }) => {
      await playExpect(welcomePage.welcomeMessage).toBeVisible();

      const resizeHandle = page.getByRole('separator', { name: 'Resize navigation bar' });
      const resizeHandleIsTopmost = await resizeHandle.evaluate(element => {
        const { left, top, width, height } = element.getBoundingClientRect();
        return document.elementFromPoint(left + width / 2, top + height / 2) === element;
      });

      playExpect(resizeHandleIsTopmost).toBeFalsy();
    });

    test('Telemetry checkbox is present, set to true, consent can be changed', async ({ welcomePage }) => {
      await playExpect(welcomePage.telemetryConsent).toBeVisible();
      await playExpect(welcomePage.telemetryConsent).toBeChecked();
      await welcomePage.turnOffTelemetry();
    });

    test('Redirection from Welcome page to Dashboard works', async ({ welcomePage }) => {
      const dashboardPage = await welcomePage.closeWelcomePage();
      await playExpect(dashboardPage.heading).toBeVisible();
    });
  });

  test.describe('Navigation Bar test', () => {
    test.describe.configure({ mode: 'serial' });
    test('Verify navigation items are visible', async ({ navigationBar }) => {
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
