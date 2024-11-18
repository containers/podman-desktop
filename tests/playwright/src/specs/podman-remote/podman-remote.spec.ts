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

import type { Locator } from '@playwright/test';

import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';

import { PreferencesPage } from '../../model/pages/preferences-page';
import { expect as playExpect, test } from '../../utility/fixtures';

// Image is pulled onto the podman machine before the test execution
const IMAGE = 'ghcr.io/podmandesktop-ci/alpine-remote';
const REMOTE_MACHINE = 'remote-machine';
const PODMAN = 'podman';

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('podman-remote-e2e');

  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);
  await runner.close();
});

test.describe.serial('Verification of Podman Remote', { tag: ['@podman-remote'] }, () => {
  test('Check Remote Podman Connection is not available', async ({ page, navigationBar }) => {
    // open preferences page
    const settingsBar = await navigationBar.openSettings();
    const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
    await playExpect(resourcesPage.heading).toBeVisible();
    const podmanResource = new ResourceConnectionCardPage(page, 'podman');
    await playExpect(podmanResource.card).toBeVisible();
    await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible('podman')).toBeTruthy();
    const resourcesPodmanConnections = new ResourceConnectionCardPage(page, PODMAN, REMOTE_MACHINE);
    await playExpect.poll(async () => await resourcesPodmanConnections.doesResourceElementExist()).toBeFalsy();
  });
  test('Image on the remote machine is not visible in Podman Desktop', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(async () => await imagesPage.waitForImageExists(IMAGE)).rejects.toThrow();
  });

  test('Podman Remote can be enabled in Preferences', async ({ page, navigationBar }) => {
    // open preferences page
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.expandPreferencesTab();
    const podmanExtensionLink = settingsBar.getPreferencesLinkLocator('Extension: Podman');
    await playExpect(podmanExtensionLink).toBeVisible();
    await podmanExtensionLink.click();
    const preferencesPage = new PreferencesPage(page);
    await playExpect(preferencesPage.heading).toBeVisible();
    await playExpect(preferencesPage.content).toHaveText(/Extension.*Podman/, { ignoreCase: true, useInnerText: true });
    const podmanRemoteCheckbox = preferencesPage.content.getByRole('checkbox', {
      name: 'Load remote system connections (ssh)',
    });
    await playExpect(podmanRemoteCheckbox).toBeEnabled();
    await toggleCheckbox(podmanRemoteCheckbox, true);
  });

  test('Check Remote Podman Connection is available', async ({ page, navigationBar }) => {
    // open preferences page
    const settingsBar = await navigationBar.openSettings();
    const resourcesPage = await settingsBar.openTabPage(ResourcesPage);
    await playExpect(resourcesPage.heading).toBeVisible();
    await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(PODMAN)).toBeTruthy();
    const resourcesPodmanConnections = new ResourceConnectionCardPage(page, PODMAN, REMOTE_MACHINE);
    await playExpect
      .poll(async () => await resourcesPodmanConnections.doesResourceElementExist(), { timeout: 15_000 })
      .toBeTruthy();
    await playExpect(resourcesPodmanConnections.resourceElementConnectionStatus).toHaveText('RUNNING');
  });
  test('Image on the remote machine is now visible', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect.poll(async () => imagesPage.waitForImageExists(IMAGE, 8_000), { timeout: 10_000 }).toBeTruthy();
  });
});

export async function toggleCheckbox(checkbox: Locator, checked: boolean): Promise<void> {
  return test.step(`Ensure checkbox is ${checked ? 'checked' : 'unchecked'}`, async () => {
    if (checked !== (await checkbox.isChecked())) {
      await checkbox.locator('..').click();
      playExpect(await checkbox.isChecked()).toBe(checked);
    }
  });
}
