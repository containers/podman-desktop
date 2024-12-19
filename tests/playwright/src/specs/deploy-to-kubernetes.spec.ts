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

import { ContainerState } from '../model/core/states';
import type { ContainerInteractiveParams } from '../model/core/types';
import { ContainerDetailsPage } from '../model/pages/container-details-page';
import { expect as playExpect, test } from '../utility/fixtures';
import {
  createKindCluster,
  deleteContainer,
  deleteImage,
  deleteKindCluster,
  ensureCliInstalled,
} from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const CLUSTER_NAME: string = 'kind-cluster';
const CLUSTER_CREATION_TIMEOUT: number = 300_000;
const KIND_CONTAINER_NAME: string = `${CLUSTER_NAME}-control-plane`;
const KUBERNETES_CONTEXT: string = `kind-${CLUSTER_NAME}`;
const IMAGE_TO_PULL: string = 'ghcr.io/linuxcontainers/alpine';
const IMAGE_TAG: string = 'latest';
const CONTAINER_NAME: string = 'alpine-container';
const NAMESPACE: string = 'default';
const DEPLOYED_POD_NAME: string = `${CONTAINER_NAME} ${KIND_CONTAINER_NAME} ${NAMESPACE}`;
const CONTAINER_START_PARAMS: ContainerInteractiveParams = {
  attachTerminal: false,
};

const skipKindInstallation = process.env.SKIP_KIND_INSTALL === 'true';

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  test.setTimeout(350_000);
  runner.setVideoAndTraceName('deploy-to-k8s-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  if (!skipKindInstallation) {
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.cliToolsTab.click();

    await ensureCliInstalled(page, 'Kind');
  }

  if (process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux') {
    await createKindCluster(page, CLUSTER_NAME, false, CLUSTER_CREATION_TIMEOUT, { useIngressController: false });
  } else {
    await createKindCluster(page, CLUSTER_NAME, true, CLUSTER_CREATION_TIMEOUT);
  }
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(90000);
  try {
    await deleteContainer(page, CONTAINER_NAME);
    await deleteImage(page, IMAGE_TO_PULL);
    await deleteKindCluster(page, KIND_CONTAINER_NAME, CLUSTER_NAME);
  } finally {
    await runner.close();
    console.log('Runner closed');
  }
});

test.describe.serial('Deploy a container to the Kind cluster', { tag: '@k8s_e2e' }, () => {
  test('Pull an image and start a container', async ({ navigationBar }) => {
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
  });

  test('Deploy the container ', async ({ page, navigationBar }) => {
    const containerDetailsPage = new ContainerDetailsPage(page, CONTAINER_NAME);
    await playExpect(containerDetailsPage.heading).toBeVisible();
    const deployToKubernetesPage = await containerDetailsPage.openDeployToKubernetesPage();
    await deployToKubernetesPage.deployPod(CONTAINER_NAME, { useKubernetesServices: true }, KUBERNETES_CONTEXT);

    const podsPage = await navigationBar.openPods();
    await playExpect.poll(async () => podsPage.deployedPodExists(DEPLOYED_POD_NAME, 'kubernetes')).toBeTruthy();
  });
});
