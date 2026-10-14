/**********************************************************************
 * Copyright (C) 2025 - 2026 Red Hat, Inc.
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

import fs from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import type { Locator } from '@playwright/test';

import { extensionsExternalList, podmanExtension } from '/@/model/core/extensions';
import { ExtensionCardPage } from '/@/model/pages/extension-card-page';
import { ExtensionCatalogCardPage } from '/@/model/pages/extension-catalog-card-page';
import type { StatusBar } from '/@/model/workbench/status-bar';
import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';
import { isLinux, isMac, isWindows } from '/@/utility/platform';

const installExtensions = process.env.INSTALLATION_TYPE === 'custom-extensions' ? true : false;
const activeExtensionStatus = 'ACTIVE';
let sBar: StatusBar;
let updateAvailableDialog: Locator;
let updateDialog: Locator;
let updateDownloadedDialog: Locator;

test.skip(isLinux, 'Update is not supported on Linux');

test.use({
  runnerOptions: new RunnerOptions({
    /**
     * For performance reasons, disable extensions which are not necessary for the e2e
     */
    customSettings: {
      'preferences.update.appUpdate': true,
      'extensions.disabled': installExtensions
        ? []
        : [
            'podman-desktop.compose',
            'podman-desktop.docker',
            'podman-desktop.kind',
            'podman-desktop.kube-context',
            'podman-desktop.kubectl-cli',
            'podman-desktop.lima',
            'podman-desktop.registries',
          ],
    },
  }),
});

test.beforeAll(async ({ runner, page, statusBar }) => {
  runner.setVideoAndTraceName('update-e2e');

  sBar = statusBar;
  updateAvailableDialog = page.getByRole('dialog', { name: /Update .*Podman Desktop\?/ });
  updateDialog = page.getByRole('dialog', { name: /Update .*Podman Desktop/ });
  updateDownloadedDialog = page.getByRole('dialog', { name: /Restart .*Podman Desktop\?/ });
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);
  await runner.close(45_000);
});

test.describe('Podman Desktop Update installation', { tag: '@update-install' }, () => {
  test.describe.configure({ mode: 'serial', retries: 1 });
  test('Update is offered automatically on startup', async ({ welcomePage }) => {
    await playExpect(updateAvailableDialog).toBeVisible({ timeout: 20_000 });
    const updateNowButton = updateAvailableDialog.getByRole('button', { name: 'Update Now' });
    await playExpect(updateNowButton).toBeVisible();
    const laterDropdownButton = updateAvailableDialog.getByRole('button', { name: 'Later' });
    await playExpect(laterDropdownButton).toBeVisible();
    await laterDropdownButton.click();
    const remindLaterOption = updateAvailableDialog.getByRole('button', { name: 'Remind me later' });
    await playExpect(remindLaterOption).toBeVisible();
    const doNotShowAgainOption = updateAvailableDialog.getByRole('button', { name: `Don't show again` });
    await playExpect(doNotShowAgainOption).toBeVisible();
    const closeButton = updateAvailableDialog.getByRole('button', { name: 'Close' });
    await closeButton.click();
    await playExpect(updateAvailableDialog).not.toBeVisible();
    // handle welcome page now
    await welcomePage.handleWelcomePage(true);
  });

  test.describe('External Extensions installation', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(!installExtensions || isMac, 'Skipping extension installation, testing fresh/vanilla update');

    test('Podman Extension is activated', async ({ navigationBar, page }) => {
      const extensions = await navigationBar.openExtensions();
      await playExpect(async () => {
        await extensions.openInstalledTab();
        const podmanExtensionCard = new ExtensionCardPage(
          page,
          podmanExtension.extensionName,
          podmanExtension.extensionFullLabel,
        );
        await podmanExtensionCard.card.scrollIntoViewIfNeeded();
        await playExpect(podmanExtensionCard.status).toHaveText(activeExtensionStatus);
      }).toPass({ timeout: 30_000 });
    });

    extensionsExternalList.forEach(extension => {
      test(`Installation of ${extension.extensionFullName}`, async ({ navigationBar, page }) => {
        test.setTimeout(200_000);
        const extensionsPage = await navigationBar.openExtensions();
        await extensionsPage.openCatalogTab();
        const extensionCatalogCard = new ExtensionCatalogCardPage(page, extension.extensionName);
        await playExpect(extensionCatalogCard.parent).toBeVisible();
        await extensionCatalogCard.install(180_000);
        await test.step('Extension is installed', async () => {
          await extensionsPage.openInstalledTab();
          await playExpect
            .poll(async () => await extensionsPage.extensionIsInstalled(extension.extensionFullLabel))
            .toBeTruthy();
          const extensionDetailsPage = await extensionsPage.openExtensionDetails(
            extension.extensionLabel,
            extension.extensionFullLabel,
            extension.extensionFullName,
          );
          await playExpect(extensionDetailsPage.heading).toBeVisible();
          await test.step
            .skip('Extension is active - unstable on windows now', async () => {
              await playExpect.soft(extensionDetailsPage.status).toHaveText(activeExtensionStatus, { timeout: 20_000 });
            });
        });
      });
    });
  });

  test('Version button is visible', async () => {
    await playExpect(sBar.content).toBeVisible();
    await playExpect(sBar.versionButton).toBeVisible();
  });

  test('User initiated update option is available', async ({ page }) => {
    await playExpect(sBar.updateButtonTitle).toHaveText(await sBar.versionButton.innerText());
    await sBar.updateButtonTitle.click();
    await handleConfirmationDialog({ page, dialogTitle: /Update .*Podman Desktop\?/, buttonName: 'Cancel' });
  });

  test('Update can be initiated', async () => {
    await sBar.updateButtonTitle.click();
    await playExpect(updateAvailableDialog).toBeVisible();
    const updateNowButton = updateAvailableDialog.getByRole('button', { name: 'Update now' });
    await playExpect(updateNowButton).toBeVisible();
    await updateNowButton.click();
    await playExpect(updateAvailableDialog).not.toBeVisible();
  });

  test('Update is progressing until restart is offered', async ({ page }) => {
    test.setTimeout(150000);
    await sBar.updateButtonTitle.click();
    await playExpect(updateDialog).toBeVisible();
    // the dialog might change in meantime from Update (in progress) to Update downloaded.
    // now it takes some time to perform, in case of failure, PD gets closed
    await playExpect(updateDownloadedDialog).toBeVisible({ timeout: 120000 });
    // some buttons
    await handleConfirmationDialog({ page, dialogTitle: /Restart .*Podman Desktop\?/, buttonName: 'Cancel' });
    await playExpect(updateDownloadedDialog).not.toBeVisible();
  });

  // Running the test to make sure we download correct architecture of the installer file
  // setup.exe should contain both installers (for x64 and arm64) so that option is always valid
  // or depending on what process.arch returns
  test(`Correct Podman Desktop installer file is downloaded for ${process.arch} architecture during update`, async () => {
    test.skip(isLinux, 'This test runs only on Windows and Mac platform');
    const fileFormatRegexp = isWindows ? 'exe' : 'zip|dmg';
    const generalInstallerPattern = isWindows ? 'setup' : 'universal';
    // get installer path - windows should be on %LocalAppData%/podman-desktop-updater/pending/
    const cacheDir = isWindows
      ? (process.env['LOCALAPPDATA'] ?? path.join(homedir(), 'AppData', 'Local'))
      : path.join(homedir(), 'Library', 'Caches');
    const installerPath = path.join(cacheDir, 'podman-desktop-updater', 'pending');
    playExpect(
      fs.existsSync(installerPath),
      `Directory with installer files (${installerPath}) does not exist`,
    ).toBeTruthy();
    const files = await fs.promises.readdir(installerPath);
    const findFiles = files.filter(file => new RegExp(`^podman-desktop.*\\.(${fileFormatRegexp})$`).exec(file));
    playExpect(
      findFiles.length,
      `No files with ${fileFormatRegexp} were found during update on ${installerPath}`,
    ).toBeGreaterThanOrEqual(1);
    playExpect(findFiles.length, `More than one installer files were found: ${findFiles.join()}`).toEqual(1);
    // on windows it is valid to get general setup.exe or setup-$arch.exe file
    if (process.arch === 'x64') {
      playExpect(findFiles[0]).toMatch(
        new RegExp(`podman-desktop.*-(x64|${generalInstallerPattern}).${fileFormatRegexp}`),
      );
    } else if (process.arch === 'arm64') {
      playExpect(findFiles[0]).toMatch(
        new RegExp(`podman-desktop.*-(arm64|${generalInstallerPattern}).${fileFormatRegexp}`),
      );
    } else {
      throw new Error(`Unsupported architecture: ${process.arch}`);
    }
  });
});
