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

import { ResourceElementActions } from '../model/core/operations';
import { ContainerState, ResourceElementState } from '../model/core/states';
import { CreateKindClusterPage } from '../model/pages/create-kind-cluster-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { VolumesPage } from '../model/pages/volumes-page';
import { StatusBar } from '../model/workbench/status-bar';
import { expect as playExpect, test } from '../utility/fixtures';
import { getVolumeNameForContainer } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const RESOURCE_NAME: string = 'kind';
const EXTENSION_LABEL: string = 'podman-desktop.kind';
const CLUSTER_NAME: string = 'kind-cluster';
const CONTAINER_NAME: string = `${CLUSTER_NAME}-control-plane`;
const KUBERNETES_CONTEXT: string = `kind-${CLUSTER_NAME}`;
const CLUSTER_CREATION_TIMEOUT: number = 150000;

let resourcesPage: ResourcesPage;
let kindResourceCard: ResourceConnectionCardPage;
let statusBar: StatusBar;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

test.beforeAll(async ({ pdRunner, page, welcomePage }) => {
  pdRunner.setVideoAndTraceName('kind-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  resourcesPage = new ResourcesPage(page);
  kindResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
  statusBar = new StatusBar(page);
});

test.afterAll(async ({ pdRunner }) => {
  await pdRunner.close();
});

test.describe.serial('Kind End-to-End Tests', () => {
  test.describe.serial('Kind installation', () => {
    test('Install Kind CLI', async ({ navigationBar }) => {
      test.skip(!!skipKindInstallation, 'Skipping Kind installation');

      await navigationBar.openSettings();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeFalsy();
      await statusBar.installKindCLI();
      await playExpect(statusBar.kindInstallationButton).not.toBeVisible();
    });

    test('Verify that Kind CLI is installed', async ({ navigationBar }) => {
      await navigationBar.openSettings();
      await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
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
  test.describe('Kind cluster operations', () => {
    test.skip(
      !!process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux',
      'Tests suite should not run on Linux platform',
    );
    test('Create a Kind cluster', async ({ page, navigationBar }) => {
      test.setTimeout(CLUSTER_CREATION_TIMEOUT);

      await navigationBar.openSettings();
      await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
      await playExpect(kindResourceCard.markdownContent).toBeVisible();
      await playExpect(kindResourceCard.createButton).toBeVisible();
      await kindResourceCard.createButton.click();
      const createKindClusterPage = new CreateKindClusterPage(page);
      await createKindClusterPage.createClusterDefault(CLUSTER_NAME, CLUSTER_CREATION_TIMEOUT);
      await playExpect(kindResourceCard.resourceElement).toBeVisible();
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
        timeout: 15000,
      });
    });

    test('Check resources added with the Kind cluster', async ({ page, navigationBar }) => {
      const containersPage = await navigationBar.openContainers();
      await playExpect.poll(async () => containersPage.containerExists(CONTAINER_NAME)).toBeTruthy();
      const containerDetailsPage = await containersPage.openContainersDetails(CONTAINER_NAME);
      await playExpect.poll(async () => await containerDetailsPage.getState()).toEqual(ContainerState.Running);

      const volumesPage = new VolumesPage(page);
      const volumeName = await getVolumeNameForContainer(page, CONTAINER_NAME);
      if (!volumeName) {
        throw new Error(`Volume name for container "${CONTAINER_NAME}" is not defined.`);
      }
      const volumeDetailsPage = await volumesPage.openVolumeDetails(volumeName);
      await playExpect.poll(async () => await volumeDetailsPage.isUsed()).toBeTruthy();
    });

    test('Validate correct Kubernetes context is selected', async () => {
      await statusBar.validateKubernetesContext(KUBERNETES_CONTEXT);
    });

    test('Kind cluster operations - STOP', async ({ navigationBar }) => {
      await navigationBar.openSettings();
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running);
      await kindResourceCard.performConnectionAction(ResourceElementActions.Stop);
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
        timeout: 50000,
      });
    });

    test('Kind cluster operations - START', async () => {
      await kindResourceCard.performConnectionAction(ResourceElementActions.Start);
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
        timeout: 50000,
      });
    });

    test('Kind cluster operatioms - RESTART', async () => {
      await kindResourceCard.performConnectionAction(ResourceElementActions.Restart);
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
        timeout: 50000,
      });
    });

    test('Kind cluster operations - DELETE', async ({ page, navigationBar }) => {
      await kindResourceCard.performConnectionAction(ResourceElementActions.Stop);
      await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
        timeout: 50000,
      });
      await kindResourceCard.performConnectionAction(ResourceElementActions.Delete);
      await playExpect(kindResourceCard.markdownContent).toBeVisible({ timeout: 50000 });
      const containersPage = await navigationBar.openContainers();
      await playExpect.poll(async () => containersPage.containerExists(CONTAINER_NAME)).toBeFalsy();

      await page.waitForTimeout(2000);
      const volumeName = await getVolumeNameForContainer(page, CONTAINER_NAME);
      await playExpect.poll(async () => volumeName).toBeFalsy();
    });
  });
});
