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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { expect as playExpect } from '@playwright/test';

import { RegistriesPage } from '/@/model/pages/registries-page';
import { RunnerOptions } from '/@/runner/runner-options';
import { test } from '/@/utility/fixtures';
import { isLinux } from '/@/utility/platform';

let registriesPage: RegistriesPage;

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
  }),
});

test.beforeAll(async ({ runner, welcomePage, navigationBar }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('managed-configuration-registries-e2e');
  await welcomePage.handleWelcomePage(true);
  const settingsBar = await navigationBar.openSettings();
  registriesPage = await settingsBar.openTabPage(RegistriesPage);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Managed Configuration - registries', { tag: '@managed-configuration' }, () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('Defaults + Locked setting: Preferred Repositories', () => {
    test.describe.configure({ mode: 'serial' });
    test('Expected settings value from managed configuration', async () => {
      await playExpect(registriesPage.heading).toBeVisible();
      await playExpect(registriesPage.preferredRepositoriesField).toBeVisible();

      // Verify the field is managed (checks for scoped "Managed" label)
      const isManaged = await registriesPage.isPreferredManaged();
      playExpect(isManaged).toBeTruthy();

      await playExpect(registriesPage.preferredRepositoriesField).toHaveValue('docker.io, quay.io');
    });

    test('Field is readonly when locked', async () => {
      // Locked fields are set to readonly (not disabled) in StringItem.svelte
      await playExpect(registriesPage.preferredRepositoriesField).toHaveAttribute('readonly');

      // Field should still be enabled (readonly !== disabled)
      await playExpect(registriesPage.preferredRepositoriesField).toBeEnabled();
    });
  });

  test.describe('Registries configuration file verification', () => {
    test.describe.configure({ mode: 'serial' });
    test('registries.conf contains expected default registries from managed configuration', async () => {
      test.skip(
        !isLinux,
        'Skipping file content verification on Windows and Mac due to different config file handling',
      );
      const homeDir = os.homedir();
      const registriesConfPath = path.join(homeDir, '.config', 'containers', 'registries.conf');

      // Wait for the file to exist (created during extension initialization)
      // Poll with timeout to avoid race conditions on slower machines/CI
      await playExpect
        .poll(() => fs.existsSync(registriesConfPath), {
          timeout: 10_000,
          message: `registries.conf was not created at ${registriesConfPath}`,
        })
        .toBeTruthy();

      const fileContent = fs.readFileSync(registriesConfPath, 'utf-8');

      // Verify TOML format with registry sections
      const registryCount = (fileContent.match(/\[\[registry\]\]/g) ?? []).length;
      playExpect(registryCount).toBeGreaterThanOrEqual(2);

      // Verify expected registries with proper structure
      const expectedRegistries = ['docker.io', 'quay.io'];
      const foundRegistries = new Set<string>();

      // Split into [[registry]] blocks and check each independently of key order/spacing
      const registryBlocks = fileContent.split('[[registry]]').slice(1);
      for (const block of registryBlocks) {
        for (const registry of expectedRegistries) {
          // Dynamically build the regex for each expected registry
          const prefixRegex = new RegExp(`prefix\\s*=\\s*"${registry}"`);
          const locationRegex = new RegExp(`location\\s*=\\s*"${registry}"`);

          if (prefixRegex.test(block) && locationRegex.test(block)) {
            foundRegistries.add(registry);
          }
        }
      }

      playExpect(foundRegistries).toContain('docker.io');
      playExpect(foundRegistries).toContain('quay.io');
    });
  });
});
