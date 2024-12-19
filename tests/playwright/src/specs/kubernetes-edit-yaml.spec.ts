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
import { KubernetesResourceDetailsPage } from '../model/pages/kubernetes-resource-details-page';
import { expect as playExpect, test } from '../utility/fixtures';
import {
  createKindCluster,
  deleteKindCluster,
  ensureCliInstalled,
  handleConfirmationDialog,
} from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const CLUSTER_NAME: string = 'kind-cluster';
const CLUSTER_CREATION_TIMEOUT: number = 300_000;
const KIND_NODE: string = `${CLUSTER_NAME}-control-plane`;
const KUBERNETES_CONTEXT = `kind-${CLUSTER_NAME}`;
const KUBERNETES_NAMESPACE = 'default';
const DEPLOYMENT_NAME = 'test-deployment-resource';
const KUBERNETS_RUNTIME = {
  runtime: PlayYamlRuntime.Kubernetes,
  kubernetesContext: KUBERNETES_CONTEXT,
  kubernetesNamespace: KUBERNETES_NAMESPACE,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEPLOYMENT_YAML_PATH = path.resolve(__dirname, '..', '..', 'resources', 'kubernetes', `${DEPLOYMENT_NAME}.yaml`);

const skipKindInstallation = process.env.SKIP_KIND_INSTALL === 'true';

test.beforeAll(async ({ runner, welcomePage, page, navigationBar }) => {
  test.setTimeout(350_000);
  runner.setVideoAndTraceName('kubernetes-edit-yaml');

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
    await deleteKindCluster(page, KIND_NODE, CLUSTER_NAME);
  } finally {
    await runner.close();
  }
});

test.describe.serial('Kubernetes Edit YAML Feature E2E Test', { tag: '@k8s_e2e' }, () => {
  test('Create a Kubernetes deployment resource', async ({ navigationBar }) => {
    test.setTimeout(80_000);
    const podsPage = await navigationBar.openPods();
    await playExpect(podsPage.heading).toBeVisible();
    const playYamlPage = await podsPage.openPlayKubeYaml();
    await playExpect(playYamlPage.heading).toBeVisible();
    await playYamlPage.playYaml(DEPLOYMENT_YAML_PATH, KUBERNETS_RUNTIME);

    const kubernetesBar = await navigationBar.openKubernetes();
    const deploymentsPage = await kubernetesBar.openTabPage(KubernetesResources.Deployments);
    await playExpect(deploymentsPage.heading).toBeVisible();
    await playExpect(deploymentsPage.getResourceRowByName(DEPLOYMENT_NAME)).toBeVisible();
    const deploymentDetails = await deploymentsPage.openResourceDetails(
      DEPLOYMENT_NAME,
      KubernetesResources.Deployments,
    );
    await playExpect(deploymentDetails.heading).toBeVisible();
    await playExpect
      .poll(async () => deploymentDetails.getState(), { timeout: 80_000 })
      .toEqual(KubernetesResourceState.Running);
  });
  test('Change the Kubernetes deployment YAML file', async ({ navigationBar }) => {
    test.setTimeout(120_000);
    const podsPage = await navigationBar.openPods();
    await playExpect
      .poll(async () => await podsPage.countPodReplicas(DEPLOYMENT_NAME), {
        timeout: 60_000,
      })
      .toBe(3);

    const kubernetesBar = await navigationBar.openKubernetes();
    const deploymentsPage = await kubernetesBar.openTabPage(KubernetesResources.Deployments);
    await playExpect(deploymentsPage.heading).toBeVisible();
    await playExpect(deploymentsPage.getResourceRowByName(DEPLOYMENT_NAME)).toBeVisible();
    const deploymentDetails = await deploymentsPage.openResourceDetails(
      DEPLOYMENT_NAME,
      KubernetesResources.Deployments,
    );
    await playExpect(deploymentDetails.heading).toBeVisible();
    await deploymentDetails.editKubernetsYamlFile('replicas: 3', 'replicas: 5');

    await navigationBar.openPods();
    await playExpect
      .poll(async () => await podsPage.countPodReplicas(DEPLOYMENT_NAME), {
        timeout: 60_000,
      })
      .toBe(5);
    await navigationBar.openKubernetes();
    await kubernetesBar.openTabPage(KubernetesResources.Deployments);
    await playExpect(deploymentsPage.heading).toBeVisible();
    await playExpect(deploymentsPage.getResourceRowByName(DEPLOYMENT_NAME)).toBeVisible();
    await deploymentsPage.openResourceDetails(DEPLOYMENT_NAME, KubernetesResources.Deployments);
    await playExpect(deploymentDetails.heading).toBeVisible();
    await playExpect
      .poll(async () => deploymentDetails.getState(), { timeout: 80_000 })
      .toEqual(KubernetesResourceState.Running);
  });
  test('Delete the Kubernetes deployment resource', async ({ page, navigationBar }) => {
    const deploymentDetails = new KubernetesResourceDetailsPage(page, DEPLOYMENT_NAME);
    await deploymentDetails.deleteButton.click();
    await handleConfirmationDialog(page);
    const kubernetesBar = await navigationBar.openKubernetes();
    const deploymentsPage = await kubernetesBar.openTabPage(KubernetesResources.Deployments);
    await playExpect(deploymentsPage.heading).toBeVisible();
    await playExpect(deploymentsPage.getResourceRowByName(DEPLOYMENT_NAME)).not.toBeVisible();
  });
});
