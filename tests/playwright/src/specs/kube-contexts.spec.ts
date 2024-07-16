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

import type { Page } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { KubeContextPage } from '../model/pages/kube-context-page';
import { PreferencesPage } from '../model/pages/preferences-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navBar: NavigationBar;

const testContexts = ['context-1', 'context-2', 'context-3'];

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();

  // copy testing kubeconfig file to the expected location
  const kubeConfigPathSrc = path.resolve(__dirname, '..', '..', 'resources', 'test-kube-config');
  const kubeConfigPathDst = path.resolve(__dirname, '..', '..', 'resources', 'kube-config');
  fs.copyFileSync(kubeConfigPathSrc, kubeConfigPathDst);

  pdRunner.setVideoAndTraceName('kube-context-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  navBar = new NavigationBar(page);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
}, 90000);

describe('Verification of kube context management', async () => {
  test('Load custom kubeconfig in Preferences', async () => {
    // open preferences page
    const settingsBar = await navBar.openSettings();
    await settingsBar.expandPreferencesTab();
    const preferencesPage = await settingsBar.openTabPage(PreferencesPage);
    await playExpect(preferencesPage.heading).toBeVisible();

    const kubeConfigPathDst = path.resolve(__dirname, '..', '..', 'resources', 'kube-config');
    await preferencesPage.selectKubeFile(kubeConfigPathDst);
    await playExpect(preferencesPage.heading).toBeVisible();
  }, 12000);

  test('Can load kube contexts in Kubernetes page', async () => {
    const settingsBar = await navBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    await playExpect.poll(async () => await kubePage.pageIsEmpty(), { timeout: 10000 }).toBeFalsy();
    for (const context of testContexts) {
      const row = await kubePage.getContextRowByName(context);
      if (row === undefined) {
        throw Error(`Context: '${context}' not found`);
      }
      await playExpect(row.getByLabel('Context Name', { exact: true })).toHaveText(context);
      await playExpect(row.getByLabel('Context Cluster')).toHaveText(context + '-cluster');
      await playExpect(row.getByLabel('Context Server')).toHaveText(context + '-server');
      await playExpect(row.getByLabel('Context User')).toHaveText(context + '-user');

      if (context === 'context-1') {
        // check if the context is default
        playExpect(await kubePage.contextDefault(context)).toBeTruthy();
        await playExpect(row.getByLabel('Set as Current Context')).not.toBeVisible();
        await playExpect(row.getByLabel('Context Namespace')).toHaveText(context + '-namespace');
      } else {
        await playExpect(row.getByLabel('Set as Current Context')).toBeVisible();
      }
    }
  });

  test('Can switch default context', async () => {
    const settingsBar = await navBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    await kubePage.setDefaultContext('context-2');
    // check that switch worked - current context banner should be visible
    playExpect(await kubePage.contextDefault('context-1')).toBeFalsy();
    playExpect(await kubePage.contextDefault('context-2')).toBeTruthy();
    playExpect(await kubePage.contextDefault('context-3')).toBeFalsy();
  }, 12000);

  test('Can delete all contexts from Kubernetes Contexts page', async () => {
    const settingsBar = await navBar.openSettings();
    const kubePage = await settingsBar.openTabPage(KubeContextPage);
    await playExpect(kubePage.heading).toBeVisible();

    for (const context of testContexts) {
      await kubePage.deleteContext(context);
      await playExpect(kubePage.heading).toBeVisible();
    }

    for (const context of testContexts) {
      await playExpect
        .poll(async () => await kubePage.getContextRowByName(context), { timeout: 10000 })
        .toBeUndefined();
    }

    // check that the page is empty
    await playExpect(kubePage.heading).toBeVisible();
    playExpect(await kubePage.pageIsEmpty()).toBeTruthy();
  }, 12000);
});
