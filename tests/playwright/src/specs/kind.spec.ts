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
import { expect as playExpect } from '@playwright/test';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

import { CheckboxOperations, ResourceElementActions } from '../model/core/operations';
import { ContainerState, ResourceElementState } from '../model/core/states';
import { CreateKindClusterPage } from '../model/pages/create-kind-cluster-page';
import { ResourceConnectionCardPage } from '../model/pages/resource-connection-card-page';
import { ResourcesPage } from '../model/pages/resources-page';
import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { StatusBar } from '../model/workbench/status-bar';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';
import type { RunnerTestContext } from '../testContext/runner-test-context';
import { waitForPodmanMachineStartup } from '../utility/wait';

const RESOURCE_NAME: string = 'kind';
const EXTENSION_LABEL: string = 'podman-desktop.kind';
const KIND_CLUSTER: string = 'kind-cluster';
const CONTAINER_NAME: string = 'kind-cluster-control-plane';
const KUBERNETES_CONTEXT: string = `kind-${KIND_CLUSTER}`;

let pdRunner: PodmanDesktopRunner;
let page: Page;
let navigationBar: NavigationBar;
let resourcesPage: ResourcesPage;
let kindResourceCard: ResourceConnectionCardPage;
let statusBar: StatusBar;

const skipKindInstallation = process.env.SKIP_KIND_INSTALL ? process.env.SKIP_KIND_INSTALL : false;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoAndTraceName('kind-e2e');
  const welcomePage = new WelcomePage(page);
  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
  navigationBar = new NavigationBar(page);
  resourcesPage = new ResourcesPage(page);
  kindResourceCard = new ResourceConnectionCardPage(page, RESOURCE_NAME);
  statusBar = new StatusBar(page);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
});

describe('Kind End-to-End Tests', async () => {
  describe('Kind Installation', async () => {
    test.skipIf(skipKindInstallation)('Install Kind CLI', async () => {
      await navigationBar.openSettings();
      await playExpect.poll(async () => await resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeFalsy();
      await statusBar.installKindCLI();
      await playExpect(statusBar.kindInstallationButton).not.toBeVisible();
    });
    test('Verify that Kind CLI is installed', async () => {
      await navigationBar.openSettings();
      await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
    });
    test('Kind extension lifecycle', async () => {
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
  describe.skipIf(process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux')(
    'Kind cluster creation',
    async () => {
      test('Create a Kind cluster', async () => {
        await navigationBar.openSettings();
        await playExpect.poll(async () => resourcesPage.resourceCardIsVisible(RESOURCE_NAME)).toBeTruthy();
        await playExpect(kindResourceCard.markdownContent).toBeVisible();
        const createButton = kindResourceCard.createButton;
        await playExpect(createButton).toBeVisible();
        await createButton.click();
        const createKindClusterPage = new CreateKindClusterPage(page);
        await createKindClusterPage.manageCheckboxState(CheckboxOperations.Check);
        await createKindClusterPage.createCluster(KIND_CLUSTER);
        await playExpect(kindResourceCard.resourceElement).toBeVisible();
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
          timeout: 15000,
        });
      }, 120000);
      test('Check for resources added with the Kind cluster', async () => {
        const containersPage = await navigationBar.openContainers();
        await playExpect.poll(async () => containersPage.containerExists(CONTAINER_NAME)).toBeTruthy();
        const containerDetailsPage = await containersPage.openContainersDetails(CONTAINER_NAME);
        playExpect(await containerDetailsPage.getState()).toEqual(ContainerState.Running);

        const volumesPage = await navigationBar.openVolumes();
        const volumeName = await volumesPage.getVolumeNameForContainer(CONTAINER_NAME);
        if (volumeName) {
          const volumeDetailsPage = await volumesPage.openVolumeDetails(volumeName);
          await playExpect.poll(async () => await volumeDetailsPage.isUsed()).toBeTruthy();
        }
      });
      test('Validate the right Kubernetes context is chosen', async () => {
        await statusBar.validateKubernetesContext(KUBERNETES_CONTEXT);
      });
      test('Verify Kind cluster basic operations', async () => {
        await navigationBar.openSettings();
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running);
        await kindResourceCard.performConnectionAction(ResourceElementActions.Stop);
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
          timeout: 20000,
        });
        await kindResourceCard.performConnectionAction(ResourceElementActions.Start);
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
          timeout: 20000,
        });
        await kindResourceCard.performConnectionAction(ResourceElementActions.Restart);
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Running, {
          timeout: 20000,
        });
        await kindResourceCard.performConnectionAction(ResourceElementActions.Stop);
        await playExpect(kindResourceCard.resourceElementConnectionStatus).toHaveText(ResourceElementState.Off, {
          timeout: 20000,
        });
        await kindResourceCard.performConnectionAction(ResourceElementActions.Delete);
        await playExpect(kindResourceCard.markdownContent).toBeVisible({ timeout: 20000 });
      });
    },
  );
});
