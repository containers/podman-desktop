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
import { expect as playExpect, test } from '/@/utility/fixtures';

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('screenshots');
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner, navigationBar }) => {
  test.setTimeout(180_000);

  // Go to containers page
  const containersPage = await navigationBar.openContainers();
  await playExpect(containersPage.heading).toBeVisible();

  try {
    playExpect.poll(
      async () => {
        return await containersPage.pageIsEmpty();
      },
      { timeout: 10_000 },
    );
  } catch (err) {
    console.log('We have some containers');
    await containersPage.pruneContainers();
    playExpect.poll(
      async () => {
        return await containersPage.pageIsEmpty();
      },
      { timeout: 20_000 },
    );
  }

  await runner.close(45_000);
});

test.describe('Podman Desktop visual testing', { tag: [] }, () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(
    !process.env.PLAYWRIGHT_SCREENSHOTS_PATH,
    'Skipping screenshots if PLAYWRIGHT_SCREENSHOTS_PATH is not set.',
  );

  /**
   * Containers
   */
  test.describe('containers', () => {
    test.describe.configure({ mode: 'serial' });
    test('containers empty', async ({ navigationBar }) => {
      const containersPage = await navigationBar.openContainers();
      await playExpect(containersPage.heading).toBeVisible();

      // Screenshot empty containers list
      await containersPage.screenshot({
        name: 'containers-empty',
      });
    });
  });
});
