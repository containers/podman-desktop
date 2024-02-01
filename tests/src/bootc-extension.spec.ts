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
import { SettingsBar } from './model/pages/settings-bar';

let pdRunner: PodmanDesktopRunner;
let page: Page;

let navBar: NavigationBar;

let extensionInstalled = false;

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
  test('Go to settings and check if extension is already installed', async () => {
    const settingsBar = await navBar.openSettings();
    const extensions = await settingsBar.getCurrentExtensions();
    if (await checkForBootcInExtensions(extensions)) extensionInstalled = true;
  });

  test.runIf(extensionInstalled)('Uninstalled previous version of bootc extension', async () => {
    throw new Error('not implemented');
  });

  test('Install extension through Settings', async () => {
    const settingsExtensionPage = new SettingsExtensionsPage(page);
    await settingsExtensionPage.installExtensionFromOCIImage('ghcr.io/containers/podman-desktop-extension-bootc');

    const settingsBar = new SettingsBar(page);
    const extensions = await settingsBar.getCurrentExtensions();
    await playExpect.poll(async () => await checkForBootcInExtensions(extensions), { timeout: 30000 }).toBeTruthy();
  }, 200000);
});

async function checkForBootcInExtensions(extensionList: Locator[]): Promise<boolean> {
  for (const extension of extensionList) {
    if ((await extension.getByText('Bootable Container', { exact: true }).count()) > 0) {
      console.log('bootc extension found installed');
      return true;
    }
  }

  console.log('bootc extension not found to be installed');
  return false;
}
