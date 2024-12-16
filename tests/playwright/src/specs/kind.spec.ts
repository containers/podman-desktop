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

import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import {
  checkClusterResources,
  clusterOperations,
  createKindCluster,
  deleteCluster,
} from '../utility/cluster-operations';
import { expect as playExpect, test } from '../utility/fixtures';
import { ensureCliInstalled } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const RESOURCE_NAME: string = 'kind';
const EXTENSION_LABEL: string = 'podman-desktop.kind';
const CLUSTER_NAME: string = 'kind-cluster';
const KIND_CONTAINER_NAME: string = `${CLUSTER_NAME}-control-plane`;
const CLUSTER_CREATION_TIMEOUT: number = 300_000;
let resourcesPage: ResourcesPage;

let kindResourceCard: ResourceConnectionCardPage;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

test.beforeAll(async ({ runner, page, welcomePage }) => {
  runner.setVideoAndTraceName('kind-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  resourcesPage = new ResourcesPage(page);
  kindResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
});

test.afterAll(async ({ runner, page }) => {
  try {
    await deleteCluster(page, KIND_CONTAINER_NAME, CLUSTER_NAME);
  } finally {
    await runner.close();
  }
});

test.describe.serial('Kind End-to-End Tests', { tag: '@k8s_e2e' }, () => {
  test.describe
    .serial('Kind installation', () => {
      test('Install Kind CLI', async ({ page, navigationBar }) => {
        test.skip(!!skipKindInstallation, 'Skipping Kind installation');
        const settingsBar = await navigationBar.openSettings();
        await settingsBar.cliToolsTab.click();

        await ensureCliInstalled(page, 'Kind');
      });

      test('Kind extension lifecycle', async ({ navigationBar }) => {
        const extensionsPage = await navigationBar.openExtensions();
        const kindExtension = await extensionsPage.getInstalledExtension('Kind extension', EXTENSION_LABEL);
        await playExpect
          .poll(async () => await extensionsPage.extensionIsInstalled(EXTENSION_LABEL), { timeout: 10000 })
          .toBeTruthy();
        await playExpect(kindExtension.status).toHaveText('ACTIVE');
        await kindExtension.disableExtension();
        await navigationBar.openSettings();
        await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeFalsy();
        await navigationBar.openExtensions();
        await kindExtension.enableExtension();
        await navigationBar.openSettings();
        await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      });
    });
  test.describe('Kind cluster validation tests', () => {
    test.skip(
      !!process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux',
      'Tests suite should not run on Linux platform',
    );
    test('Create a Kind cluster', async ({ page }) => {
      test.setTimeout(CLUSTER_CREATION_TIMEOUT);
      await createKindCluster(page, CLUSTER_NAME, true, CLUSTER_CREATION_TIMEOUT);
    });

    test('Check resources added with the Kind cluster', async ({ page }) => {
      await checkClusterResources(page, KIND_CONTAINER_NAME);
    });

    test('Kind cluster operations', async ({ page }) => {
      await clusterOperations(page, kindResourceCard, KIND_CONTAINER_NAME, CLUSTER_NAME);
    });
  });
});
