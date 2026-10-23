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

import { composeExtension } from '/@/model/core/extensions';
import { CLIToolsPage } from '/@/model/pages/cli-tools-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import type { SettingsBar } from '/@/model/pages/settings-bar';
import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { isLinux, isMac } from '/@/utility/platform';

/**
 * `providers.allowUpdate` is set to `["podman-desktop.podman"]` in
 * resources/managed-configuration/default-settings.json, so every other extension
 * is blocked from registering a provider engine update.
 *
 * Compose is used as the blocked provider because it is the only one we can
 * reliably force into an "update available" state: installing it and then
 * downgrading makes the extension call `provider.registerUpdate()`, which is
 * exactly the call the managed configuration is supposed to reject. Without the
 * downgrade the call never happens and the assertions below would pass for the
 * wrong reason.
 */
// Compose uses the same label for the CLI Tools table row and the Resources card.
const COMPOSE_TOOL = composeExtension.extensionName;
const COMPOSE_PROVIDER_CARD = composeExtension.extensionName;
const blockedUpdateRegexp = new RegExp(
  `Provider update registration blocked for extension '${composeExtension.extensionFullLabel}' by providers.allowUpdate configuration`,
);

let settingsBar: SettingsBar;
let cliToolsPage: CLIToolsPage;

// Installing a CLI tool system wide needs elevation, which is only unattended on Windows.
// This mirrors the constraint in specs/cli-tools-smoke.spec.ts.
test.skip(!!isLinux || !!isMac, 'CLI tool installation is not supported unattended on Linux or macOS');

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
  }),
});

test.beforeAll(async ({ runner, page, welcomePage, navigationBar }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('managed-configuration-providers-e2e');
  await welcomePage.handleWelcomePage(true);

  settingsBar = await navigationBar.openSettings();
  await settingsBar.cliToolsTab.click();

  cliToolsPage = new CLIToolsPage(page);
  await playExpect(cliToolsPage.toolsTable).toBeVisible({ timeout: 10_000 });
  await playExpect.poll(async () => await cliToolsPage.toolsTable.count()).toBeGreaterThan(0);

  await cliToolsPage.uninstallTool(COMPOSE_TOOL);
  await playExpect
    .poll(async () => await cliToolsPage.getCurrentToolVersion(COMPOSE_TOOL), { timeout: 60_000 })
    .toBeFalsy();
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);
  try {
    // the last test navigates to Resources, go back so the CLI Tools locators resolve
    await settingsBar?.cliToolsTab.click();
    await cliToolsPage?.uninstallTool(COMPOSE_TOOL);
  } catch (err: unknown) {
    console.log(`Could not clean up ${COMPOSE_TOOL}: ${err}`);
  } finally {
    await runner.close();
  }
});

test.beforeEach(async () => {
  if (cliToolsPage.wasRateLimitReached()) {
    test.info().annotations.push({ type: 'skip', description: 'Rate limit exceeded for current environment' });
    test.skip(true, 'Rate limit exceeded; skipping remaining provider update checks');
  }
});

test.describe
  .serial('Managed Configuration - providers', { tag: '@managed-configuration' }, () => {
    test.describe
      .serial('Defaults + Locked setting: providers.allowUpdate excludes Compose', () => {
        test('Compose can be installed and downgraded to make an update available', async () => {
          test.setTimeout(180_000);

          await cliToolsPage.installTool(COMPOSE_TOOL);
          await cliToolsPage.downgradeTool(COMPOSE_TOOL);

          // `providers.allowUpdate` is only enforced in ProviderRegistry.registerUpdate();
          // CliToolRegistry.registerUpdate() has no such check, so the CLI Tools row still
          // offers the update even though Compose is not in the allow list. Asserting it here
          // proves a newer version really was found, which is what keeps the "no update
          // button" assertion on the Resources card below from passing vacuously.
          //
          // TODO(https://github.com/podman-desktop/podman-desktop/issues/19379): this only
          // covers the blocked path, so a deny-all regression would still pass. Add an
          // allowed extension (kind) to the fixture and assert its update button IS rendered.
          await playExpect(cliToolsPage.getUpdateButton(COMPOSE_TOOL)).toBeVisible({ timeout: 30_000 });
        });

        test('Provider update registration is blocked in the logs', async ({ runner }) => {
          await playExpect
            .poll(() => runner.getConsoleMessages().some((msg: string) => blockedUpdateRegexp.test(msg)), {
              timeout: 30_000,
              intervals: [500],
            })
            .toBeTruthy();
        });

        test('Update button is not rendered on the Compose resource card', async ({ page }) => {
          await settingsBar.resourcesTab.click();
          const resourcesPage = new ResourcesPage(page);
          await playExpect(resourcesPage.heading).toBeVisible({ timeout: 10_000 });

          // guard against a false pass: the card must exist, otherwise the update button
          // would be missing simply because the whole Compose resource is not rendered
          await playExpect
            .poll(async () => await resourcesPage.resourceCardIsVisible(COMPOSE_PROVIDER_CARD), { timeout: 10_000 })
            .toBeTruthy();

          await playExpect(resourcesPage.getProviderUpdateButton(COMPOSE_PROVIDER_CARD)).not.toBeAttached();
        });
      });
  });
