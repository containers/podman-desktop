/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { TroubleshootingPage } from '/@/model/pages/troubleshooting-page';
import { StatusBar } from '/@/model/workbench/status-bar';
import { expect as playExpect, test } from '/@/utility/fixtures';

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('troubleshooting-e2e');

  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Troubleshooting page verification', { tag: '@smoke' }, () => {
  test.describe.configure({ mode: 'serial' });
  let troubleshootingPage: TroubleshootingPage;

  test('Troubleshooting page is available', async ({ page }) => {
    const statusBar = new StatusBar(page);
    await playExpect(statusBar.troubleshootingButton).toBeEnabled();
    await statusBar.troubleshootingButton.click();
    troubleshootingPage = new TroubleshootingPage(page);
    await playExpect(troubleshootingPage.heading).toBeVisible();
  });

  test('Can reconnect providers', async () => {
    await troubleshootingPage.openRepairConnections();
    await playExpect
      .poll(async () => troubleshootingPage.getContainerConnectionsStatus(), { timeout: 15_000 })
      .toMatch(/[1-9]\d* running/);
    const status = await troubleshootingPage.reconnectProviders();
    playExpect(status).toContain('Done');
  });

  test('Content of the application Log', async () => {
    await troubleshootingPage.openLogs();
    const logs = await troubleshootingPage.getLogs();
    for (const logEntry of [
      /System ready. Loading extensions/,
      /PluginSystem: received dom-ready event from the UI/,
      /Delayed startup, flushing/,
      /PluginSystem: initialization done/,
    ]) {
      await playExpect(logs).toContainText(logEntry, { timeout: 10_000 });
    }
  });

  test('Refresh auth providers store', async () => {
    await troubleshootingPage.openStores();
    await troubleshootingPage.refreshStore('auth providers');
  });
});
