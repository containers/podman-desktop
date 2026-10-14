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

import { ProxyPage } from '/@/model/pages/proxy-page';
import { RunnerOptions } from '/@/runner/runner-options';
import { test } from '/@/utility/fixtures';

let proxyPage: ProxyPage;

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
    customSettings: {
      'proxy.enabled': 1, // Manual proxy mode
      'proxy.http': 'http://user-proxy.local:3128', // should be overridden by locked default
      'proxy.no': 'user-defined-no-proxy.local',
    },
  }),
});

test.beforeAll(async ({ runner, welcomePage, navigationBar }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('managed-configuration-proxy-e2e');
  await welcomePage.handleWelcomePage(true);
  const settingsBar = await navigationBar.openSettings();
  proxyPage = await settingsBar.openTabPage(ProxyPage);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Managed Configuration - proxy', { tag: '@managed-configuration' }, () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('Unlocked setting: Proxy Configuration dropdown', () => {
    test.describe.configure({ mode: 'serial' });
    test('Dropdown is not managed', async () => {
      await playExpect(proxyPage.heading).toBeVisible();

      const isManaged = await proxyPage.isProxyConfigurationManaged();
      playExpect(isManaged).toBeFalsy();
    });

    test('Dropdown is enabled when not locked', async () => {
      await playExpect(proxyPage.toggleProxyButton).toBeEnabled();
    });
  });

  test.describe('Defaults + Locked setting: Web Proxy (HTTP)', () => {
    test.describe.configure({ mode: 'serial' });
    test('Expected settings value from managed configuration', async () => {
      await playExpect(proxyPage.httpProxy).toBeVisible();

      const isManaged = await proxyPage.isHttpProxyManaged();
      playExpect(isManaged).toBeTruthy();

      await playExpect(proxyPage.httpProxy).toHaveValue('http://managed-proxy.example.com:8080');
    });

    test('Locked default overrides user preference', async () => {
      // customSettings sets proxy.http to 'http://user-proxy.local:3128'
      // but the locked managed default must take precedence
      await playExpect(proxyPage.httpProxy).not.toHaveValue('http://user-proxy.local:3128');
    });

    test('Field is disabled when locked', async () => {
      await playExpect(proxyPage.httpProxy).toBeDisabled();
    });
  });

  test.describe('Defaults + Locked setting: Secure Web Proxy (HTTPS)', () => {
    test.describe.configure({ mode: 'serial' });
    test('Expected settings value from managed configuration', async () => {
      await playExpect(proxyPage.httpsProxy).toBeVisible();

      const isManaged = await proxyPage.isHttpsProxyManaged();
      playExpect(isManaged).toBeTruthy();

      await playExpect(proxyPage.httpsProxy).toHaveValue('https://managed-proxy.example.com:8443');
    });

    test('Field is disabled when locked', async () => {
      await playExpect(proxyPage.httpsProxy).toBeDisabled();
    });
  });

  test.describe('Defaults setting: Bypass proxy (No Proxy)', () => {
    test.describe.configure({ mode: 'serial' });
    test('Field is not managed (not locked)', async () => {
      await playExpect(proxyPage.noProxy).toBeVisible();

      const isManaged = await proxyPage.isNoProxyManaged();
      playExpect(isManaged).toBeFalsy();
    });

    test('User preference takes precedence over default', async () => {
      await playExpect(proxyPage.noProxy).toHaveValue('user-defined-no-proxy.local');
    });
  });
});
