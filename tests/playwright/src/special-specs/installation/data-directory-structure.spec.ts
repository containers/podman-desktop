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

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { APPLICATION_DATA_SUBDIRECTORIES } from '/@/model/core/data-subdirectories';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';

test.beforeAll(async ({ page, runner, welcomePage }) => {
  runner.setVideoAndTraceName('data-directory-structure-e2e');
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

test.describe('Application data directory structure', { tag: '@update-install' }, () => {
  test.describe.configure({ mode: 'serial' });

  for (const subdirectory of APPLICATION_DATA_SUBDIRECTORIES) {
    test(`creates the "${subdirectory}" data subdirectory on startup`, ({ runnerOptions }) => {
      // Mirrors how Runner (podman-desktop-runner.ts) derives the directory it
      // points PODMAN_DESKTOP_HOME_DIR at, so this checks the same location the
      // running app actually used, not product.json's unoverridden default.
      const dataDirectory = join(
        runnerOptions._customOutputFolder,
        runnerOptions._profile,
        runnerOptions._customFolder,
      );
      const target = join(dataDirectory, subdirectory);
      playExpect(existsSync(target), { message: `Expected directory not found: ${target}` }).toBeTruthy();
    });
  }
});
