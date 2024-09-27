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

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PlayYamlRuntime } from '../model/core/operations';
import { KubernetesResourceState } from '../model/core/states';
import { KubernetesResources } from '../model/core/types';
import { expect as playExpect, test } from '../utility/fixtures';
import {
  createKindCluster,
  deleteKindCluster,
  deletePod,
  ensureKindCliInstalled,
  handleConfirmationDialog,
} from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const CLUSTER_NAME: string = 'kind-cluster';
const CLUSTER_CREATION_TIMEOUT: number = 300_000;
const KIND_NODE: string = `${CLUSTER_NAME}-control-plane`;
const KUBERNETES_CONTEXT = `kind-${CLUSTER_NAME}`;
const KUBERNETES_NAMESPACE = 'default';
const PVC_NAME = 'my-pvc';
const POD_NAME = 'pod-pvc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  test.setTimeout(250000);
  runner.setVideoAndTraceName('kubernetes-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  if (!skipKindInstallation) {
    const settingsBar = await navigationBar.openSettings();
    await settingsBar.cliToolsTab.click();

    await ensureKindCliInstalled(page);
  }
  await createKindCluster(page, CLUSTER_NAME, true, CLUSTER_CREATION_TIMEOUT);
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(90000);
  try {
    await deleteKindCluster(page, KIND_NODE, CLUSTER_NAME);
  } finally {
    await runner.close();
  }
});

test.describe('Kubernetes resources End-to-End test', () => {
  test.skip(
    !!process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux',
    'Tests suite should not run on Linux platform',
  );
  test('Kubernetes Nodes test', async ({ navigationBar }) => {
    const kubernetesBar = await navigationBar.openKubernetes();
    const nodesPage = await kubernetesBar.openTabPage(KubernetesResources.Nodes);
    await playExpect(nodesPage.heading).toBeVisible();
    await playExpect(nodesPage.getResourceRowByName(KIND_NODE)).toBeVisible();

    const nodeDetails = await nodesPage.openResourceDetails(KIND_NODE, KubernetesResources.Nodes);
    await playExpect(nodeDetails.heading).toBeVisible();
    await playExpect
      .poll(async () => nodeDetails.getState(), { timeout: 40000 })
      .toEqual(KubernetesResourceState.Running);
  });
  test.describe.serial('PVC lifecycle test', () => {
    test('Create a new PVC resource', async ({ navigationBar }) => {
      const podsPage = await navigationBar.openPods();
      await playExpect(podsPage.heading).toBeVisible();
      const playYamlPage = await podsPage.openPlayKubeYaml();
      await playExpect(playYamlPage.heading).toBeVisible();
      const yamlFilePath = path.resolve(__dirname, '..', '..', 'resources', 'kubernetes', `${PVC_NAME}.yaml`);
      await playYamlPage.playYaml(yamlFilePath, {
        runtime: PlayYamlRuntime.Kubernetes,
        kubernetesContext: KUBERNETES_CONTEXT,
        kubernetesNamespace: KUBERNETES_NAMESPACE,
      });

      const kubernetesBar = await navigationBar.openKubernetes();
      const pvcsPage = await kubernetesBar.openTabPage(KubernetesResources.PVCs);
      await playExpect(pvcsPage.heading).toBeVisible();
      await playExpect(pvcsPage.getResourceRowByName(PVC_NAME)).toBeVisible();
      const pvcDetails = await pvcsPage.openResourceDetails(PVC_NAME, KubernetesResources.PVCs);
      await playExpect(pvcDetails.heading).toBeVisible();
      await playExpect
        .poll(async () => pvcDetails.getState(), { timeout: 40_000 })
        .toEqual(KubernetesResourceState.Starting);
    });
    test('Bind the PVC to a pod', async ({ navigationBar }) => {
      const podsPage = await navigationBar.openPods();
      await playExpect(podsPage.heading).toBeVisible();
      const playYamlPage = await podsPage.openPlayKubeYaml();
      await playExpect(playYamlPage.heading).toBeVisible();
      const yamlFilePath = path.resolve(__dirname, '..', '..', 'resources', 'kubernetes', `${POD_NAME}.yaml`);
      await playYamlPage.playYaml(yamlFilePath, {
        runtime: PlayYamlRuntime.Kubernetes,
        kubernetesContext: KUBERNETES_CONTEXT,
        kubernetesNamespace: KUBERNETES_NAMESPACE,
      });

      const kubernetesBar = await navigationBar.openKubernetes();
      const pvcsPage = await kubernetesBar.openTabPage(KubernetesResources.PVCs);
      const pvcDetails = await pvcsPage.openResourceDetails(PVC_NAME, KubernetesResources.PVCs);
      await playExpect(pvcDetails.heading).toBeVisible();
      await playExpect
        .poll(async () => pvcDetails.getState(), { timeout: 40_000 })
        .toEqual(KubernetesResourceState.Running);
    });
    test('Delete the PVC resource', async ({ page, navigationBar }) => {
      await deletePod(page, POD_NAME);
      const kubernetesBar = await navigationBar.openKubernetes();
      const pvcsPage = await kubernetesBar.openTabPage(KubernetesResources.PVCs);
      await pvcsPage.deleteKubernetesResource(PVC_NAME);
      await handleConfirmationDialog(page);
      await playExpect(pvcsPage.getResourceRowByName(PVC_NAME)).not.toBeVisible();
    });
  });
});
