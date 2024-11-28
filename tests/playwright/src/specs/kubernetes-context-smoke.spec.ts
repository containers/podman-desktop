/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { KubeContextPage } from '../model/pages/kubernetes-context-page';
import { PreferencesPage } from '../model/pages/preferences-page';
import { expect as playExpect, test } from '../utility/fixtures';

const testContexts = ['context-1', 'context-2', 'context-3'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('kube-context-e2e');

  // copy testing kubeconfig file to the expected location
  const kubeConfigPathSrc = path.resolve(__dirname, '..', '..', 'resources', 'test-kube-config');
  const kubeConfigPathDst = path.resolve(__dirname, '..', '..', 'resources', 'kube-config');
  fs.copyFileSync(kubeConfigPathSrc, kubeConfigPathDst);

  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  test.setTimeout(120_000);
  await runner.close();
});

test.describe.serial('Verification of kube context management', { tag: '@smoke' }, () => {
  test('Load custom kubeconfig in Preferences', async ({ navigationBar }) => {
    // open preferences page
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.expandPreferencesTab();
    const preferencesPage = await settingsBar.openTabPage(PreferencesPage);
    await playExpect(preferencesPage.heading).toBeVisible();

    const kubeConfigPathDst = path.resolve(__dirname, '..', '..', 'resources', 'kube-config');
    await preferencesPage.selectKubeFile(kubeConfigPathDst);
  });

  test('Can load kube contexts in Kubernetes page', async ({ navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    await playExpect.poll(async () => await kubePage.pageIsEmpty(), { timeout: 30_000 }).toBeFalsy();
    for (const context of testContexts) {
      const row = await kubePage.getContextRowByName(context);
      await playExpect(row).toBeVisible();
      playExpect(await kubePage.getContextName(context)).toBe(context);
      playExpect(await kubePage.getContextCluster(context)).toBe(context + '-cluster');
      playExpect(await kubePage.getContextServer(context)).toBe(context + '-server');
      playExpect(await kubePage.getContextUser(context)).toBe(context + '-user');

      if (context === 'context-1') {
        // check if the context is default
        await playExpect
          .poll(async () => await kubePage.isContextDefault(context), {
            timeout: 10000,
          })
          .toBeTruthy();
        await playExpect(await kubePage.getSetCurrentContextButton(context)).not.toBeVisible();
        playExpect(await kubePage.getContextNamespace(context)).toBe(context + '-namespace');
      } else {
        await playExpect(await kubePage.getSetCurrentContextButton(context)).toBeVisible();
      }
    }
  });

  test('Can switch default context', async ({ navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    await kubePage.setDefaultContext('context-2');
    // check that switch worked - current context banner should be visible
    playExpect(await kubePage.isContextDefault('context-1')).toBeFalsy();
    await playExpect
      .poll(async () => await kubePage.isContextDefault('context-2'), {
        timeout: 10_000,
      })
      .toBeTruthy();
    playExpect(await kubePage.isContextDefault('context-3')).toBeFalsy();
  });

  test('Can delete all contexts from Kubernetes Contexts page', async ({ navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    for (const context of testContexts) {
      // confirmation only pops up if the context is default
      if (await kubePage.isContextDefault(context)) {
        await kubePage.deleteContext(context);
      } else {
        await kubePage.deleteContext(context, false);
      }
    }

    for (const context of testContexts) {
      await playExpect(await kubePage.getContextRowByName(context)).not.toBeVisible({ timeout: 10_000 });
    }
    // check that the page is empty
    await playExpect.poll(async () => await kubePage.pageIsEmpty(), { timeout: 10_000 }).toBeTruthy();
  });
});
