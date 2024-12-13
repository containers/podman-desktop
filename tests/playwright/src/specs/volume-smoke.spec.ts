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

import { ContainerState, VolumeState } from '../model/core/states';
import type { ContainerInteractiveParams } from '../model/core/types';
import { expect as playExpect, test } from '../utility/fixtures';
import { waitForPodmanMachineStartup } from '../utility/wait';

const imageToPull = 'quay.io/centos-bootc/bootc-image-builder';
const imageTag = 'latest';
const containerToRun = 'bootc-image-builder';
const containerStartParams: ContainerInteractiveParams = {
  attachTerminal: false,
};

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('volume-e2e');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

const volumeName = 'e2eVolume';

test.describe.serial('Volume workflow verification', { tag: '@smoke' }, () => {
  test('Create new Volume', async ({ navigationBar }) => {
    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const createVolumePage = await volumesPage.openCreateVolumePage(volumeName);
    volumesPage = await createVolumePage.createVolume(volumeName);
    await playExpect
      .poll(async () => await volumesPage.waitForVolumeExists(volumeName), {
        timeout: 25_000,
      })
      .toBeTruthy();
  });

  test('Test navigation between pages', async ({ navigationBar }) => {
    const volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const volumeRow = await volumesPage.getVolumeRowByName(volumeName);
    playExpect(volumeRow).not.toBeUndefined();

    const volumeDetails = await volumesPage.openVolumeDetails(volumeName);
    await playExpect(volumeDetails.heading).toBeVisible();
    await volumeDetails.backLink.click();
    await playExpect(volumesPage.heading).toBeVisible();

    await volumesPage.openVolumeDetails(volumeName);
    await playExpect(volumeDetails.heading).toBeVisible();
    await volumeDetails.closeButton.click();
    await playExpect(volumesPage.heading).toBeVisible();
  });

  test('Delete volume from Volumes page', async ({ navigationBar }) => {
    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const volumeRow = await volumesPage.getVolumeRowByName(volumeName);
    playExpect(volumeRow).not.toBeUndefined();
    volumesPage = await volumesPage.deleteVolume(volumeName);
    await playExpect
      .poll(async () => await volumesPage.waitForVolumeDelete(volumeName), {
        timeout: 35_000,
      })
      .toBeTruthy();
  });

  test('Delete volume through details page', async ({ navigationBar }) => {
    //re-create a new volume
    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();

    const createVolumePage = await volumesPage.openCreateVolumePage(volumeName);
    volumesPage = await createVolumePage.createVolume(volumeName);

    await playExpect
      .poll(async () => await volumesPage.waitForVolumeExists(volumeName), {
        timeout: 35_000,
      })
      .toBeTruthy();

    //delete it from the details page
    volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const volumeRow = await volumesPage.getVolumeRowByName(volumeName);
    playExpect(volumeRow).not.toBeUndefined();

    const volumeDetails = await volumesPage.openVolumeDetails(volumeName);
    volumesPage = await volumeDetails.deleteVolume();

    await playExpect
      .poll(async () => await volumesPage.waitForVolumeDelete(volumeName), {
        timeout: 35_000,
      })
      .toBeTruthy();
  });

  test('Create volumes from bootc-image-builder', async ({ navigationBar }) => {
    test.setTimeout(210_000);

    //count the number of existing volumes
    let volumesPage = await navigationBar.openVolumes();
    let previousVolumes = await volumesPage.countVolumesFromTable();

    //if there are volumes, check how many are used
    if (previousVolumes > 0) {
      const usedVolumes = await volumesPage.countUsedVolumesFromTable();
      //if there are unused volumes, prune them
      if (previousVolumes - usedVolumes > 0) {
        volumesPage = await volumesPage.pruneVolumes();
        await playExpect
          .poll(async () => (await volumesPage.getRowsFromTableByStatus(VolumeState.Unused)).length, {
            timeout: 10_000,
          })
          .toBe(0);
        previousVolumes = await volumesPage.countVolumesFromTable();
      }
    }

    //pull image from quay.io/centos-bootc/bootc-image-builder
    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(imageToPull, imageTag, 120_000);
    await playExpect.poll(async () => await images.waitForImageExists(imageToPull)).toBeTruthy();

    //start a container from the image (generates 4 new volumes)
    const imageDetails = await images.openImageDetails(imageToPull);
    const runImage = await imageDetails.openRunImage();
    let containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible();
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), {
        timeout: 60_000,
      })
      .toBeTruthy();
    await containers.startContainer(containerToRun);

    //check that four volumes are created (in addition to the existing ones)
    volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const newVolumes = await volumesPage.countVolumesFromTable();
    playExpect(newVolumes - previousVolumes).toBe(4);

    //check the container is stopped and delete it
    containers = await navigationBar.openContainers();
    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect
      .poll(async () => containerDetails.getState(), { timeout: 30_000 })
      .toContain(ContainerState.Exited);
    containers = await navigationBar.openContainers();
    const containersPage = await containers.deleteContainer(containerToRun);
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPage.containerExists(containerToRun), {
        timeout: 30_000,
      })
      .toBeFalsy();

    //prune unused volumes
    volumesPage = await navigationBar.openVolumes();
    volumesPage = await volumesPage.pruneVolumes();
    await playExpect
      .poll(async () => (await volumesPage.getRowsFromTableByStatus(VolumeState.Unused)).length, { timeout: 10_000 })
      .toBe(0);
    const finalVolumes = await volumesPage.countVolumesFromTable();
    playExpect(finalVolumes - previousVolumes).toBe(0);
  });
});
