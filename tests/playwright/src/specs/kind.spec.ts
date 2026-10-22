/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ResourceElementActions } from '/@/model/core/operations';
import { ContainerState, ExtensionState, ResourceElementState } from '/@/model/core/states';
import { type ContainerInteractiveParams, PodmanVirtualizationProviders } from '/@/model/core/types';
import { ResourceConnectionCardPage } from '/@/model/pages/resource-connection-card-page';
import { ResourcesPage } from '/@/model/pages/resources-page';
import { canRunKindTests } from '/@/setupFiles/setup-kind';
import {
  checkClusterResources,
  createKindCluster,
  deleteCluster,
  deleteClusterFromDetails,
  resourceConnectionAction,
  resourceConnectionActionDetails,
} from '/@/utility/cluster-operations';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { deployContainerToCluster } from '/@/utility/kubernetes';
import { deleteContainer, deleteImage, ensureCliInstalled } from '/@/utility/operations';
import { getVirtualizationProvider } from '/@/utility/provider';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const RESOURCE_NAME: string = 'kind';
const EXTENSION_LABEL: string = 'podman-desktop.kind';
const CLUSTER_NAME: string = 'kind-cluster';
const KIND_CONTAINER: string = `${CLUSTER_NAME}-control-plane`;
const CUSTOM_CONFIG_CLUSTER_NAME: string = 'test-cluster';
const CUSTOM_CONFIG_KIND_CONTAINER: string = `${CUSTOM_CONFIG_CLUSTER_NAME}-control-plane`;
const CLUSTER_CREATION_TIMEOUT: number = 300_000;
const KUBERNETES_CONTEXT: string = `kind-${CLUSTER_NAME}`;

const IMAGE_TO_PULL: string = 'ghcr.io/linuxcontainers/alpine';
const IMAGE_TAG: string = 'latest';
const CONTAINER_NAME: string = 'alpine-container';
const DEPLOYED_POD_NAME: string = CONTAINER_NAME;
const CONTAINER_START_PARAMS: ContainerInteractiveParams = {
  attachTerminal: false,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CUSTOM_CONFIG_FILE_PATH: string = path.resolve(
  __dirname,
  '..',
  '..',
  'resources',
  'kubernetes',
  'test-kind-config-file.yaml',
);

let resourcesPage: ResourcesPage;
let kindResourceCard: ResourceConnectionCardPage;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL === 'true';
const providerTypeGHA = process.env.KIND_PROVIDER_GHA ?? '';

const skipKindClusterLifecycleOnWsl =
  'Kind cluster stop/start/restart is not working on Podman/WSL -> https://github.com/podman-desktop/podman-desktop/issues/4801 ';

test.skip(!canRunKindTests(), `This test can't run on a windows rootless machine`);

test.beforeAll(async ({ runner, page, welcomePage }) => {
  runner.setVideoAndTraceName('kind-e2e');
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  resourcesPage = new ResourcesPage(page);
  kindResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
});

test.afterAll(async ({ runner, page }) => {
  try {
    await deleteContainer(page, CONTAINER_NAME);
    await deleteImage(page, IMAGE_TO_PULL);
    await deleteCluster(page, RESOURCE_NAME, KIND_CONTAINER, CLUSTER_NAME);
  } finally {
    await runner.close();
  }
});

test.describe('Kind End-to-End Tests', { tag: '@k8s_e2e' }, () => {
  test.describe('Kind installation', () => {
    test.describe.configure({ mode: 'serial' });
    test('Install Kind CLI', async ({ page, navigationBar }) => {
      test.skip(!!skipKindInstallation, 'Skipping Kind cluster installation');
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
      await playExpect(kindExtension.status).toHaveText(ExtensionState.Installed);
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
    test.describe.configure({ mode: 'serial' });
    test('Create a Kind cluster - With Ingress controller', async ({ page }) => {
      test.setTimeout(CLUSTER_CREATION_TIMEOUT);

      await createKindCluster(page, CLUSTER_NAME, CLUSTER_CREATION_TIMEOUT, {
        providerType: providerTypeGHA,
        useIngressController: true,
      });
    });

    test('Check resources added with the Kind cluster', async ({ page }) => {
      await checkClusterResources(page, KIND_CONTAINER);
    });

    test('Deploy a container to the Kind cluster', async ({ page, navigationBar }) => {
      const imagesPage = await navigationBar.openImages();
      const pullImagePage = await imagesPage.openPullImage();
      await pullImagePage.pullImage(IMAGE_TO_PULL, IMAGE_TAG);
      await playExpect.poll(async () => imagesPage.waitForImageExists(IMAGE_TO_PULL, 10_000)).toBeTruthy();
      const containersPage = await imagesPage.startContainerWithImage(
        IMAGE_TO_PULL,
        CONTAINER_NAME,
        CONTAINER_START_PARAMS,
      );
      await playExpect
        .poll(async () => containersPage.containerExists(CONTAINER_NAME), {
          timeout: 15_000,
        })
        .toBeTruthy();
      const containerDetails = await containersPage.openContainersDetails(CONTAINER_NAME);
      await playExpect(containerDetails.heading).toBeVisible();
      await playExpect.poll(async () => containerDetails.getState()).toBe(ContainerState.Running);
      await deployContainerToCluster(page, CONTAINER_NAME, KUBERNETES_CONTEXT, DEPLOYED_POD_NAME);
    });

    test.describe('Kind cluster lifecycle', () => {
      test.describe.configure({ mode: 'serial' });
      test.skip(() => getVirtualizationProvider() === PodmanVirtualizationProviders.WSL, skipKindClusterLifecycleOnWsl);

      test('Kind cluster operations - STOP', async ({ page }) => {
        await resourceConnectionAction(page, kindResourceCard, ResourceElementActions.Stop, ResourceElementState.Off);
      });

      test('Kind cluster operations - START', async ({ page }) => {
        await resourceConnectionAction(
          page,
          kindResourceCard,
          ResourceElementActions.Start,
          ResourceElementState.Running,
        );
      });

      test('Kind cluster operations - RESTART', async ({ page }) => {
        await resourceConnectionAction(
          page,
          kindResourceCard,
          ResourceElementActions.Restart,
          ResourceElementState.Running,
        );
      });
    });

    test('Kind cluster operations - DELETE', async ({ page }) => {
      await deleteCluster(page, RESOURCE_NAME, KIND_CONTAINER, CLUSTER_NAME);
    });
  });
  test.describe('Kind cluster operations - Details', () => {
    test.describe.configure({ mode: 'serial' });
    test('Create a Kind cluster - Without Ingress controller', async ({ page }) => {
      test.setTimeout(CLUSTER_CREATION_TIMEOUT);

      await createKindCluster(page, CLUSTER_NAME, CLUSTER_CREATION_TIMEOUT, {
        providerType: providerTypeGHA,
        useIngressController: false,
      });
    });

    test.describe('Kind cluster lifecycle details', () => {
      test.describe.configure({ mode: 'serial' });
      test.skip(() => getVirtualizationProvider() === PodmanVirtualizationProviders.WSL, skipKindClusterLifecycleOnWsl);

      test('Kind cluster operations details - STOP', async ({ page }) => {
        await resourceConnectionActionDetails(
          page,
          kindResourceCard,
          CLUSTER_NAME,
          ResourceElementActions.Stop,
          ResourceElementState.Off,
        );
      });

      test('Kind cluster operations details - START', async ({ page }) => {
        await resourceConnectionActionDetails(
          page,
          kindResourceCard,
          CLUSTER_NAME,
          ResourceElementActions.Start,
          ResourceElementState.Running,
        );
      });

      test('Kind cluster operations details - RESTART', async ({ page }) => {
        await resourceConnectionActionDetails(
          page,
          kindResourceCard,
          CLUSTER_NAME,
          ResourceElementActions.Restart,
          ResourceElementState.Running,
        );
      });
    });

    test('Kind cluster operations details - DELETE', async ({ page }) => {
      await deleteClusterFromDetails(page, RESOURCE_NAME, KIND_CONTAINER, CLUSTER_NAME);
    });
  });
  test.describe('Kind cluster creation with custom config file', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      process.env.DEBUGGING_PORT !== undefined && process.env.PODMAN_DESKTOP_BINARY !== undefined,
      'Test is not supported with CDP runner — custom config file requires mocking the file dialog via Electron main process evaluation',
    );
    test('Create a Kind cluster using the custom config file', async ({ page }) => {
      test.setTimeout(CLUSTER_CREATION_TIMEOUT);

      await createKindCluster(page, CUSTOM_CONFIG_CLUSTER_NAME, CLUSTER_CREATION_TIMEOUT, {
        configFilePath: CUSTOM_CONFIG_FILE_PATH,
        providerType: providerTypeGHA,
        useIngressController: false,
      });
      await checkClusterResources(page, CUSTOM_CONFIG_KIND_CONTAINER);
    });
    test('Delete the Kind cluster', async ({ page }) => {
      await deleteClusterFromDetails(page, RESOURCE_NAME, CUSTOM_CONFIG_KIND_CONTAINER, CUSTOM_CONFIG_CLUSTER_NAME);
    });
  });
});
