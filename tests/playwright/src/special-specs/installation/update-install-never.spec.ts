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

import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { handleConfirmationDialog } from '/@/utility/operations';
import { isLinux } from '/@/utility/platform';

test.skip(isLinux, 'Applicaton update is not supported on Linux');

test.use({
  runnerOptions: new RunnerOptions({
    /**
     * For performance reasons, disable extensions which are not necessary for the e2e
     */
    customSettings: {
      'preferences.update.reminder': 'never',
      'extensions.disabled': [
        'podman-desktop.compose',
        'podman-desktop.docker',
        'podman-desktop.kind',
        'podman-desktop.kube-context',
        'podman-desktop.kubectl-cli',
        'podman-desktop.lima',
        'podman-desktop.minikube',
        'podman-desktop.registries',
      ],
    },
  }),
});

test.beforeAll(async ({ runner }) => {
  runner.setVideoAndTraceName('reminder-never-update-e2e');
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);
  await runner.close(45_000);
});

test.describe('Application update reminder preferences set to Never', { tag: '@update-install' }, () => {
  test.describe.configure({ mode: 'serial', retries: 1 });
  test('No update on startup', async ({ page, welcomePage }) => {
    const updateAvailableDialog = page.getByRole('dialog', { name: /Update .*Podman Desktop\?/ });
    await playExpect(updateAvailableDialog).not.toBeVisible({ timeout: 20_000 });
    await welcomePage.handleWelcomePage(true);
  });
  test('Version button is visible', async ({ statusBar }) => {
    await playExpect(statusBar.content).toBeVisible();
    await playExpect(statusBar.versionButton).toBeVisible();
  });

  test('User initiated update option is available', async ({ page, statusBar }) => {
    await playExpect(statusBar.updateButtonTitle).toHaveText(await statusBar.versionButton.innerText());
    await statusBar.updateButtonTitle.click();
    await handleConfirmationDialog({ page, dialogTitle: /Update .*Podman Desktop\?/, buttonName: 'Cancel' });
  });
});
