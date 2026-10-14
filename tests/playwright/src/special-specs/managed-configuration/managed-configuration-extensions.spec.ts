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

import { expect as playExpect } from '@playwright/test';

import type { ExtensionsPage } from '/@/model/pages/extensions-page';
import { RunnerOptions } from '/@/runner/runner-options';
import { test } from '/@/utility/fixtures';

let extensionsPage: ExtensionsPage;

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
  }),
});

test.beforeAll(async ({ runner, welcomePage, navigationBar }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('managed-configuration-extensions-e2e');
  await welcomePage.handleWelcomePage(true);
  extensionsPage = await navigationBar.openExtensions();
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Managed Configuration - extensions', { tag: '@managed-configuration' }, () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('Defaults + Locked setting: Extensions Catalog disabled', () => {
    test.describe.configure({ mode: 'serial' });
    test('Installed tab is still visible', async () => {
      await playExpect(extensionsPage.heading).toBeVisible();
      await playExpect(extensionsPage.installedTab).toBeVisible();
    });

    test('Catalog tab is not rendered when extensions.catalog.enabled is false', async () => {
      // ExtensionList.svelte conditionally renders the Catalog tab
      // with {#if enableCatalog}, so the button should not exist in the DOM
      await playExpect(extensionsPage.catalogTab).not.toBeAttached();
    });
  });

  test.describe('Defaults + Locked setting: Local extensions disabled', () => {
    test.describe.configure({ mode: 'serial' });
    test('Local extensions tab is not rendered when extensions.localExtensions.enabled is false', async () => {
      // ExtensionList.svelte conditionally renders the Local extensions tab
      // with {#if enableLocalExtensions}, so the button should not exist in the DOM
      await playExpect(extensionsPage.localExtensionsTab).not.toBeAttached();
    });
  });

  test.describe('Defaults + Locked setting: Custom Extensions disabled', () => {
    test.describe.configure({ mode: 'serial' });
    test('Install custom button is not rendered when extensions.customExtensions.enabled is false', async () => {
      await playExpect(extensionsPage.installExtensionFromOCIImageButton).not.toBeAttached();
    });
  });
});
