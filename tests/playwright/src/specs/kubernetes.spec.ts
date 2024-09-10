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

import { KubernetesResourceState } from '../model/core/states';
import { KubernetesResources } from '../model/core/types';
import { expect as playExpect, test } from '../utility/fixtures';
import { createKindCluster, deleteKindCluster, ensureKindCliInstalled } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const CLUSTER_NAME: string = 'kind-cluster';
const CLUSTER_CREATION_TIMEOUT: number = 200000;
const KIND_NODE: string = `${CLUSTER_NAME}-control-plane`;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

test.beforeAll(async ({ runner, welcomePage, page }) => {
  test.setTimeout(250000);
  runner.setVideoAndTraceName('kubernetes-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  if (!skipKindInstallation) {
    await ensureKindCliInstalled(page);
  }
  await createKindCluster(page, CLUSTER_NAME, true, CLUSTER_CREATION_TIMEOUT);
});

test.afterAll(async ({ runner, page }) => {
  test.setTimeout(90000);
  try {
    await deleteKindCluster(page, KIND_NODE);
  } finally {
    await runner.close();
  }
});

test.describe('Kubernetes resources End-to-End test', () => {
  test('Kubernetes Nodes test', async ({ navigationBar }) => {
    const nodesPage = await navigationBar.openKubernetesResources(KubernetesResources.Nodes);
    const nodeRow = await nodesPage.getResourceRowByName(KIND_NODE);
    await playExpect(nodeRow).toBeVisible();

    const nodeDetails = await nodesPage.openResourceDetails(KIND_NODE);
    await playExpect
      .poll(async () => nodeDetails.getState(), { timeout: 25000 })
      .toEqual(KubernetesResourceState.Running);
  });
});
