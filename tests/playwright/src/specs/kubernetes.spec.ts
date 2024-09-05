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

import { type Page } from '@playwright/test';
import { expect as playExpect, test } from '@playwright/test';

import { ResourcesPage } from '../model/pages/resources-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import { createKindCluster, deleteKindCluster, ensureKindCliInstalled } from '../utility/operations';
import { waitForPodmanMachineStartup } from '../utility/wait';

const CLUSTER_NAME: string = 'kind-cluster';
const CLUSTER_CREATION_TIMEOUT: number = 200000;
const KIND_CONTAINER_NAME: string = `${CLUSTER_NAME}-control-plane`;

let pdRunner: PodmanDesktopRunner;
let page: Page;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

test.beforeAll(async () => {
  test.setTimeout(250000);

  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('kind-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  if (!skipKindInstallation) {
    await ensureKindCliInstalled(page);
  }

  //to-do ensure kubectl is installed
  await createKindCluster(page, CLUSTER_NAME, true, CLUSTER_CREATION_TIMEOUT);
});

test.afterAll(async () => {
  test.setTimeout(90000);
  try {
    await deleteKindCluster(page, KIND_CONTAINER_NAME);
  } finally {
    await pdRunner.close();
  }
});

test.describe('QE coverage for Kubernetes resources', () => {
  test('Ensure kubectl is installed', async () => {
    const navigationBar = new NavigationBar(page);

    const settingsPage = await navigationBar.openSettings();
    const resourcesPage = await settingsPage.openTabPage(ResourcesPage);
    await playExpect.poll(async () => resourcesPage.resourceCardIsVisible('kubectl')).toBeTruthy();
  });
});
