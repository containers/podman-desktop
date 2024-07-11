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

import { type Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { ExtensionsPage } from '../model/pages/extensions-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { StatusBar } from '../model/workbench/status-bar';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { waitForPodmanMachineStartup } from '../utility/wait';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navigationBar: NavigationBar;
let resourcesPage: ResourcesPage;
let statusBar: StatusBar;
const extensionLabel: string = 'podman-desktop.kind';
const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('kind-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  navigationBar = new NavigationBar(page);
  resourcesPage = new ResourcesPage(page);
  statusBar = new StatusBar(page);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
});

describe('Kind End-to-End Tests', async () => {
  test.skipIf(skipKindInstallation)('Install Kind CLI', async () => {
    await navigationBar.openSettings();
    await playExpect(resourcesPage.kindResources).not.toBeVisible();
    await statusBar.installKindCLI();
    await playExpect(statusBar.kindInstallationButton).not.toBeVisible();
  });
  test('Verify that Kind CLI is installed', async () => {
    await navigationBar.openSettings();
    await playExpect(resourcesPage.kindResources).toBeVisible();
  });
  test('Kind extension lifecycle', async () => {
    const extensionsPage = new ExtensionsPage(page);
    await navigationBar.openExtensions();
    const kindExtension = await extensionsPage.getInstalledExtension('Kind extension', extensionLabel);
    await playExpect
      .poll(async () => await extensionsPage.extensionIsInstalled(extensionLabel), { timeout: 10000 })
      .toBeTruthy();
    await playExpect(kindExtension.status).toHaveText('ACTIVE');
    await kindExtension.disableExtension();
    await navigationBar.openSettings();
    await playExpect(resourcesPage.kindResources).not.toBeVisible();
    await navigationBar.openExtensions();
    await kindExtension.enableExtension();
    await navigationBar.openSettings();
    await playExpect(resourcesPage.kindResources).toBeVisible();
  });
});
