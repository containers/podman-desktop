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

import type { Locator, Page } from '@playwright/test';
import { afterAll, beforeAll, test, describe, beforeEach } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { NavigationBar } from './model/workbench/navigation';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let navBar: NavigationBar;
let extensionSettingsBox: Locator;
let installButtonLabel: string;
let imageLink: string;
let settingsTableLabel: string;

let extensionAlreadyInstalled = false;

beforeEach<RunnerTestContext>(async ctx => {
  console.log('running before each');
  ctx.pdRunner = pdRunner;
});

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('bootc-e2e');

  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

afterAll(async () => {
  await pdRunner.close();
});

describe('bootc installation verification', async () => {
  describe('Check installation availability', async () => {
    test.only('Go to settings and check if extension is already installed', async () => {
      const settingsBar = await navBar.openSettings();
      const extensions = await settingsBar.getCurrentExtensions();
      for (const extension of extensions) {
        if ((await extension.getByLabel('Bootable Container').count()) > 0) {
          extensionAlreadyInstalled = true;
        }
      }
    });

    test.runIf(extensionAlreadyInstalled)('Uninstalled previous version of bootc extension', async () => {});
  });

  test('Install extension through Settings', async () => {
    const settingsPage = new SettingsExtensionsPage(page);
    let installButton = extensionSettingsBox.getByRole('button', { name: installButtonLabel });

    const imageInstallBox = settingsPage.imageInstallBox;
    const imageInput = imageInstallBox.getByLabel('OCI Image Name');
    await imageInput.fill(imageLink);

    installButton = imageInstallBox.getByRole('button', { name: 'Install extension from the OCI image' });
    await installButton.isEnabled();

    await installButton.click();

    const installedExtensionRow = settingsPage.getExtensionRowFromTable(settingsTableLabel);
    const extensionRunningLabel = installedExtensionRow.getByText('RUNNING');
    await playExpect(extensionRunningLabel).toBeVisible({ timeout: 180000 });
  }, 200000);
});
