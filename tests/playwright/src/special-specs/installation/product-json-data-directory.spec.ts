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
import os from 'node:os';
import path from 'node:path';

import { APPLICATION_DATA_SUBDIRECTORIES } from '/@/model/core/data-subdirectories';
import { ElectronRunner } from '/@/runner/electron-runner';
import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';
import { isMac, isWindows } from '/@/utility/platform';

// Only meaningful against a real installed artifact: skips the PODMAN_DESKTOP_HOME_DIR
// sandbox (see RunnerOptions.useDefaultHomeDirectory) so the real product.json-derived
// default-directory logic actually runs, against the real host home directory, instead
// of a path this test harness chose itself. Requires a disposable test host -- it writes
// into that host's real home directory.
test.skip(!process.env.PODMAN_DESKTOP_BINARY, 'Requires PODMAN_DESKTOP_BINARY pointing at a real installed binary');
// LegacyDirectories' ~/.local/share/<paths.config> formula is shared by macOS, Windows,
// and the Linux fallback -- but on Linux a fresh host with no prior install also qualifies
// for the XDG strategy (directory-strategy.ts), which uses a different base. Keeping this
// spec to macOS/Windows avoids needing to replicate that extra heuristic.
test.skip(!isMac && !isWindows, 'Legacy directory structure formula is only verified here for macOS and Windows');

test.use({
  runnerOptions: new RunnerOptions({ useDefaultHomeDirectory: true }),
});

test.beforeAll(async ({ page, runner, welcomePage }) => {
  runner.setVideoAndTraceName('product-json-data-directory-e2e');
  const dialogTitle = new RegExp('Update .*Podman Desktop.*');
  try {
    await handleConfirmationDialog({ page, dialogTitle, buttonName: 'Close' });
  } catch (err) {
    console.log(
      `Update dialog handler threw an error: ${(err as Error).message}, might be that dialog did not appear.`,
    );
  }
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Application data directory derived from product.json', { tag: '@update-install' }, () => {
  test.describe.configure({ mode: 'serial' });

  test('creates the data directory structure at the real, unoverridden product.json-derived location', async ({
    runner,
  }) => {
    let electronBinary: string;
    if (runner instanceof ElectronRunner) {
      electronBinary = await runner.getElectronApp().evaluate(async ({ app }) => app.getPath('exe'));
    } else {
      electronBinary = process.env.PODMAN_DESKTOP_BINARY ?? '';
    }
    playExpect(electronBinary, { message: 'Application executable binary is not defined' }).not.toBe('');

    const resourcesPath = isWindows
      ? path.join(electronBinary, '..', 'resources')
      : path.join(electronBinary, '..', '..', 'Resources');
    // eslint-disable-next-line n/no-sync
    const product = JSON.parse(fs.readFileSync(path.join(resourcesPath, 'product.json'), 'utf-8')) as {
      paths: { config: string };
    };

    // Mirrors LegacyDirectories' formula (packages/main/src/plugin/directories-legacy.ts):
    // the same ~/.local/share/<paths.config> base applies on macOS, Windows, and the Linux
    // fallback, so this one computation works unmodified for both upstream and RH builds.
    const expectedDataDirectory = path.join(os.homedir(), '.local', 'share', product.paths.config);

    for (const subdirectory of APPLICATION_DATA_SUBDIRECTORIES) {
      const target = path.join(expectedDataDirectory, subdirectory);
      playExpect(fs.existsSync(target), { message: `Expected directory not found: ${target}` }).toBeTruthy();
    }
  });
});
