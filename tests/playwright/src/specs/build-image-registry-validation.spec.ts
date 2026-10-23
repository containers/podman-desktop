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

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RegistriesPage } from '/@/model/pages/registries-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { deleteImage } from '/@/utility/operations';
import {
  backupAuthFile,
  ensureAuthFileExists,
  getAuthFileLocation,
  injectInvalidCredentials,
  removeRegistryCredentials,
  restoreAuthFile,
} from '/@/utility/registry-auth-config';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

// Workaround for https://github.com/podman-desktop/podman-desktop/issues/17610:
// auth.json must exist before Electron starts, otherwise registry-setup.ts skips
// setting up its file watcher and credentials added later are never detected.
// Must run at module scope — the runner fixture launches Electron during fixture
// resolution, before any beforeAll body executes. Remove when #17610 is fixed.
const authFileExisted = fs.existsSync(getAuthFileLocation());
ensureAuthFileExists();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bad credentials for ghcr.io — the registry the Containerfile pulls from.
// With validation enabled the bad credentials are excluded → build succeeds.
// With validation disabled the bad credentials are sent → build fails (403).
const TEST_REGISTRY_URL = 'ghcr.io';
const TEST_REGISTRY_DISPLAY_NAME = 'GitHub';
const INVALID_USERNAME = 'admin';
// eslint-disable-next-line sonarjs/no-hardcoded-passwords
const INVALID_PASSWORD = 'sha256~fakeTokenForTestingPurposesOnly';

const CONTAINERFILE_PATH = path.resolve(__dirname, '..', '..', 'resources', 'test-containerfile');
const CONTEXT_DIR = path.resolve(__dirname, '..', '..', 'resources');

const BASE_IMAGE = 'ghcr.io/linuxcontainers/alpine';
const BUILD_IMAGE_TAG = 'registry-validation-test';
const BUILD_IMAGE = 'docker.io/library/registry-validation-test';

let authBackupPath: string | undefined;

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('build-image-registry-validation-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  authBackupPath = await backupAuthFile();
  await removeRegistryCredentials(TEST_REGISTRY_URL);
});

test.afterAll(async ({ runner, page }) => {
  try {
    await deleteImage(page, BUILD_IMAGE);
    await deleteImage(page, BASE_IMAGE);
    await removeRegistryCredentials(TEST_REGISTRY_URL);
    if (authBackupPath) {
      if (authFileExisted) {
        await restoreAuthFile(authBackupPath);
      } else {
        await fs.promises.unlink(authBackupPath).catch(() => {});
        await fs.promises.unlink(getAuthFileLocation()).catch(() => {});
      }
    }
  } finally {
    await runner.close();
  }
});

test.afterEach(async ({ page }) => {
  await deleteImage(page, BUILD_IMAGE);
  await deleteImage(page, BASE_IMAGE);
});

test.describe('Build image registry validation verification', () => {
  test.describe.configure({ mode: 'serial' });
  test('Build succeeds with validation disabled and no credentials', async ({ navigationBar }) => {
    test.setTimeout(120_000);

    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();

    await buildImagePage.advancedTab.click();
    await playExpect(buildImagePage.registryValidationCheckbox).toBeChecked();
    await buildImagePage.toggleRegistryValidation(false);
    await buildImagePage.toggleRegistryValidation(true);
    await buildImagePage.toggleRegistryValidation(false);

    const updatedImagesPage = await buildImagePage.buildImage(BUILD_IMAGE_TAG, CONTAINERFILE_PATH, CONTEXT_DIR);

    await playExpect
      .poll(async () => updatedImagesPage.waitForImageExists(BUILD_IMAGE, 30_000), {
        timeout: 0,
      })
      .toBeTruthy();
  });

  test('Build succeeds with bad credentials when validation is enabled', async ({ navigationBar }) => {
    test.setTimeout(120_000);

    let imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    let buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();

    await buildImagePage.advancedTab.click();
    await playExpect(buildImagePage.registryValidationCheckbox).toBeChecked();

    await injectInvalidCredentials(TEST_REGISTRY_URL, INVALID_USERNAME, INVALID_PASSWORD);
    const settingsBar = await navigationBar.openSettings();
    const registriesPage = await settingsBar.openTabPage(RegistriesPage);
    await playExpect(registriesPage.heading).toBeVisible();
    await playExpect
      .poll(async () => (await registriesPage.getRegistryRowByName(TEST_REGISTRY_DISPLAY_NAME)).isVisible(), {
        timeout: 30_000,
      })
      .toBe(true);

    imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();

    await buildImagePage.advancedTab.click();
    await playExpect(buildImagePage.registryValidationCheckbox).toBeChecked();

    const updatedImagesPage = await buildImagePage.buildImage(BUILD_IMAGE_TAG, CONTAINERFILE_PATH, CONTEXT_DIR);

    await playExpect
      .poll(async () => updatedImagesPage.waitForImageExists(BUILD_IMAGE, 30_000), {
        timeout: 0,
      })
      .toBeTruthy();
  });

  test('Build fails with bad credentials when validation is disabled', async ({ navigationBar }) => {
    test.setTimeout(120_000);

    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const buildImagePage = await imagesPage.openBuildImage();
    await playExpect(buildImagePage.heading).toBeVisible();

    await buildImagePage.toggleRegistryValidation(false);

    const updatedImagesPage = await buildImagePage.buildImage(BUILD_IMAGE_TAG, CONTAINERFILE_PATH, CONTEXT_DIR);

    await playExpect
      .poll(async () => await updatedImagesPage.getImageRowByName(BUILD_IMAGE), {
        timeout: 30_000,
      })
      .toBeFalsy();
  });
});
