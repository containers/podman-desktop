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
import { afterAll, beforeAll, test, describe, beforeEach, expect } from 'vitest';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { expect as playExpect } from '@playwright/test';
import { SettingsExtensionsPage } from './model/pages/settings-extensions-page';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { NavigationBar } from './model/workbench/navigation';
import { SettingsBar } from './model/pages/settings-bar';
import { BootcExtensionPage } from './model/pages/bootc-extension-page';
import path from 'path';
import { ImageDetailsPage } from './model/pages/image-details-page';
import { deleteImage } from './utility/operations';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;
let extensionInstalled = false;
const imageName = 'quay.io/centos-bootc/fedora-bootc';

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
  try {
    await deleteImage(page, imageName);
  } finally {
    await pdRunner.close();
  }
});

describe('bootc installation verification', async () => {
  test('Go to settings and check if extension is already installed', async () => {
    const settingsBar = await navBar.openSettings();
    const extensions = await settingsBar.getCurrentExtensions();
    if (await checkForBootcInExtensions(extensions)) extensionInstalled = true;
  });

  test.runIf(extensionInstalled)(
    'Uninstalled previous version of bootc extension',
    async () => {
      await ensureBootcIsRemoved();
    },
    200000,
  );

  test('Install extension through Settings', async () => {
    const settingsExtensionPage = new SettingsExtensionsPage(page);
    await settingsExtensionPage.installExtensionFromOCIImage('ghcr.io/containers/podman-desktop-extension-bootc');

    const settingsBar = new SettingsBar(page);
    const extensions = await settingsBar.getCurrentExtensions();
    await playExpect.poll(async () => await checkForBootcInExtensions(extensions), { timeout: 30000 }).toBeTruthy();
  }, 200000);

  test('Build bootc image', async () => {
    let imagesPage = await navBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();
    const containerFilePath = path.resolve(__dirname, '..', 'resources', 'bootable-containerfile');
    const contextDirectory = path.resolve(__dirname, '..', 'resources');

    imagesPage = await buildImagePage.buildImage(`${imageName}:eln`, containerFilePath, contextDirectory);
    expect(await imagesPage.waitForImageExists(imageName)).toBeTruthy();

    const imageDetailPage = await imagesPage.openImageDetails(imageName);
    await playExpect(imageDetailPage.heading).toBeVisible();
  }, 150000);

  test.each([
    ['QCOW2', 'ARM64'],
    ['QCOW2', 'AMD64'],
    ['AMI', 'ARM64'],
    ['AMI', 'AMD64'],
    ['RAW', 'ARM64'],
    ['RAW', 'AMD64'],
    ['ISO', 'ARM64'],
    ['ISO', 'AMD64'],
  ])(
    'Building bootable image type: %s for architecture: %s',
    async (type, architecture) => {
      const imageDetailsPage = new ImageDetailsPage(page, imageName);
      await playExpect(imageDetailsPage.heading).toBeVisible();
      const pathToStore = path.resolve(__dirname, '..', 'output', 'images', `${type}-${architecture}`);

      const result = await imageDetailsPage.buildDiskImage(type, architecture, pathToStore);
      playExpect(result).toBeTruthy();
    },
    320000,
  );

  test('Remove bootc extension through Settings', async () => {
    await ensureBootcIsRemoved();
  });
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

async function ensureBootcIsRemoved(): Promise<void> {
  const settingsBar = await navBar.openSettings();
  let extensions = await settingsBar.getCurrentExtensions();
  const bootcPage = await settingsBar.openTabPage(BootcExtensionPage);
  const settingsExtensionPage = await bootcPage.removeExtension();
  await playExpect(settingsExtensionPage.heading).toBeVisible();

  extensions = await settingsBar.getCurrentExtensions();
  await playExpect.poll(async () => await checkForBootcInExtensions(extensions), { timeout: 30000 }).toBeFalsy();
}
