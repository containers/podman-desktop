/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Preferences } from '/@/model/core/settings/preferences';
import { PreferencesPage } from '/@/model/pages/preferences-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const THEMES = ['light', 'dark', 'hc-light', 'hc-dark'] as const;
const CONTAINERFILE_PATH = fileURLToPath(new URL('../../resources/staged_build.yaml', import.meta.url));

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('build-image-options');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Build image settings', () => {
  test.describe.configure({ mode: 'serial' });

  for (const theme of THEMES) {
    test(`Keyboard access and advanced settings in ${theme}`, async ({ navigationBar, page }) => {
      const settings = await navigationBar.openSettings();
      const preferences = await settings.openTabPage(PreferencesPage);
      await preferences.setPreferenceDropdownValue(Preferences.Labels.APPEARANCE, theme);
      playExpect(await preferences.getPreferenceDropdownValue(Preferences.Labels.APPEARANCE)).toBe(theme);
      await playExpect(page.locator('html')).toHaveCSS('color-scheme', theme.endsWith('dark') ? 'dark' : 'light');

      const images = await navigationBar.openImages();
      const buildPage = await images.openBuildImage();
      await playExpect(buildPage.basicTab).toHaveAttribute('href', '/images/build/basic');
      await buildPage.containerFilePathInput.fill(CONTAINERFILE_PATH);
      await buildPage.buildContextDirectoryInput.fill(path.dirname(CONTAINERFILE_PATH));
      await buildPage.imageNameInput.fill('build-options-preview');
      await buildPage.screenshot({ name: `build-image-basic-${theme}` });

      await buildPage.basicTab.focus();
      await page.keyboard.press('Tab');
      await playExpect(buildPage.advancedTab).toBeFocused();
      await page.keyboard.press('Enter');
      await playExpect(page.getByRole('region', { name: 'Advanced', exact: true })).toBeVisible();
      await playExpect(buildPage.containerFilePathInput).not.toBeVisible();

      await buildPage.targetDropdownButton.click();
      await page.getByRole('button', { name: 'stage2', exact: true }).click();
      await playExpect(buildPage.targetDropdownButton).toHaveText(/stage2/i);
      await buildPage.toggleRegistryValidation(false);
      await buildPage.advancedTab.click();
      await playExpect(buildPage.registryValidationCheckbox).not.toBeChecked();

      await buildPage.basicTab.click();
      await playExpect(buildPage.containerFilePathInput).toHaveValue(CONTAINERFILE_PATH);
      await playExpect(buildPage.imageNameInput).toHaveValue('build-options-preview');

      await buildPage.advancedTab.click();
      await playExpect(buildPage.targetDropdownButton).toHaveText(/stage2/i);
      await playExpect(buildPage.registryValidationCheckbox).not.toBeChecked();
      await buildPage.screenshot({ name: `build-image-advanced-${theme}` });
    });
  }
});
