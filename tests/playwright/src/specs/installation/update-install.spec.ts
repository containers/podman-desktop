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

import type { StatusBar } from '../../model/workbench/status-bar';
import { expect as playExpect, test } from '../../utility/fixtures';
import { handleConfirmationDialog } from '../../utility/operations';
import { isLinux } from '../../utility/platform';

let sBar: StatusBar;
let updateAvailableDialog: Locator;
let updateDialog: Locator;
let updateDownloadedDialog: Locator;
const performUpdate = process.env.UPDATE_PODMAN_DESKTOP ? process.env.UPDATE_PODMAN_DESKTOP : false;

test.skip(isLinux, 'Update is not supported on Linux');

test.beforeAll(async ({ runner, page, statusBar }) => {
  runner.setVideoAndTraceName('update-e2e');

  sBar = statusBar;
  updateAvailableDialog = page.getByRole('dialog', { name: 'Update Available now' });
  updateDialog = page.getByRole('dialog', { name: 'Update', exact: true });
  updateDownloadedDialog = page.getByRole('dialog', { name: 'Update Downloaded', exact: true });
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial('Podman Desktop Update Update installation offering @update-install', () => {
  test('Update is offered automatically on startup', async ({ welcomePage }) => {
    await playExpect(updateAvailableDialog).toBeVisible();
    const updateNowButton = updateAvailableDialog.getByRole('button', { name: 'Update Now' });
    await playExpect(updateNowButton).toBeVisible();
    const doNotshowButton = updateAvailableDialog.getByRole('button', { name: 'Do not show again' });
    await playExpect(doNotshowButton).toBeVisible();
    const cancelButton = updateAvailableDialog.getByRole('button', { name: 'Cancel' });
    await playExpect(cancelButton).toBeVisible();
    await cancelButton.click();
    await playExpect(updateAvailableDialog).not.toBeVisible();
    // handle welcome page now
    await welcomePage.handleWelcomePage(true);
  });

  test('Version button is visible', async () => {
    await playExpect(sBar.content).toBeVisible();
    await playExpect(sBar.versionButton).toBeVisible();
  });

  test('User initiated update option is available', async ({ page }) => {
    await playExpect(sBar.updateButtonTitle).toHaveText(await sBar.versionButton.innerText());
    await sBar.updateButtonTitle.click();
    await handleConfirmationDialog(page, 'Update Available now', false, '', 'Cancel');
  });
});
test.describe.serial('Podman Desktop Update installation can be performed', () => {
  test.skip(!performUpdate, 'Update test does not run as UPDATE_PODMAN_DESKTOP env. var. is not set');
  test('Update can be initiated', async () => {
    await sBar.updateButtonTitle.click();
    await playExpect(updateAvailableDialog).toBeVisible();
    const updateNowButton = updateAvailableDialog.getByRole('button', { name: 'Update now' });
    await playExpect(updateNowButton).toBeVisible();
    await updateNowButton.click();
    await playExpect(updateAvailableDialog).not.toBeVisible();
  });

  test('Update is in progress', async ({ page }) => {
    await sBar.updateButtonTitle.click();
    await playExpect(updateDialog).toBeVisible();
    await handleConfirmationDialog(page, 'Update', true, 'OK', 'Cancel');
  });

  test('Update is performed and restart offered', async ({ page }) => {
    test.setTimeout(150000);
    // now it takes some time to perform, in case of failure, PD gets closed
    await playExpect(updateDownloadedDialog).toBeVisible({ timeout: 120000 });
    // some buttons
    await handleConfirmationDialog(page, 'Update Downloaded', false, 'Restart', 'Cancel');
  });
});
