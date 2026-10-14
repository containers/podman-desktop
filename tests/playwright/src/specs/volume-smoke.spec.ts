/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import { ContainerState, VolumeState } from '/@/model/core/states';
import type { ContainerInteractiveParams } from '/@/model/core/types';
import { ContainerDetailsPage } from '/@/model/pages/container-details-page';
import { VolumesPage } from '/@/model/pages/volumes-page';
import { expect as playExpect, test } from '/@/utility/fixtures';
import { deleteContainer, deleteImage, readFileInVolumeFromCLI } from '/@/utility/operations';
import { waitForPodmanMachineStartup } from '/@/utility/wait';

const imageToPull = 'ghcr.io/osbuild/bootc-image-builder';
const imageTag = 'latest';
const noVolumeImageToPull = 'ghcr.io/linuxcontainers/alpine';
const containerName = 'alpine';
const containerToRun = 'bootc-image-builder';
const volumeName = 'e2eVolume';
const volumeList = ['e2e-vol-first', 'e2e-vol-second', 'e2e-vol-third'];
const containerVolumePath = '/tmp/mount';
const fileName = 'test.txt';
const textContent = 'This is a test file created in the volume.';
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

test.describe('Volume workflow verification', { tag: ['@smoke', '@windows_sanity'] }, () => {
  test.describe.configure({ mode: 'serial' });
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
    await playExpect(volumesPage.heading).toBeVisible({ timeout: 10_000 });

    await playExpect
      .poll(async () => await volumesPage.waitForVolumeDelete(volumeName), {
        timeout: 35_000,
      })
      .toBeTruthy();
  });

  test('Filter and prune volumes', async ({ page, navigationBar }) => {
    test.setTimeout(120_000);

    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();

    for (const volume of volumeList) {
      const createVolumePage = await volumesPage.openCreateVolumePage(volume);
      volumesPage = await createVolumePage.createVolume(volume);
      await playExpect
        .poll(async () => await volumesPage.waitForVolumeExists(volume), { timeout: 25_000 })
        .toBeTruthy();
    }

    volumesPage = new VolumesPage(page);
    await test.step('Verify search filtering works for each volume', async () => {
      for (const volume of volumeList) {
        await volumesPage.filterByName(volume);
        await playExpect
          .poll(async () => await volumesPage.countRowsFromTable(), { timeout: 10_000 })
          .toBeGreaterThanOrEqual(1);
        await playExpect
          .poll(async () => await volumesPage.getVolumeRowByName(volume), { timeout: 5_000 })
          .toBeDefined();
      }
      await volumesPage.clearFilterByName();
      await playExpect
        .poll(async () => await volumesPage.countRowsFromTable(), { timeout: 10_000 })
        .toBeGreaterThanOrEqual(volumeList.length);
    });

    volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    volumesPage = await volumesPage.pruneVolumes();
    for (const volume of volumeList) {
      await playExpect
        .poll(async () => await volumesPage.waitForVolumeDelete(volume), { timeout: 35_000 })
        .toBeTruthy();
    }
  });
});

test.describe('Volume container integration', { tag: ['@smoke'] }, () => {
  test.describe.configure({ mode: 'serial' });
  test.afterAll(async ({ page }) => {
    await deleteContainer(page, containerName);
    await deleteImage(page, noVolumeImageToPull);
  });

  test('Create volumes from bootc-image-builder', async ({ navigationBar }) => {
    test.setTimeout(300_000);

    //count the number of existing volumes
    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible({ timeout: 10_000 });

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

    //pull image from ghcr.io/osbuild/bootc-image-builder
    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(imageToPull, imageTag, 240_000);
    await playExpect
      .poll(async () => await images.waitForImageExists(imageToPull, 30_000), { timeout: 0 })
      .toBeTruthy();

    //start a container from the image (generates 4 new volumes)
    const imageDetails = await images.openImageDetails(imageToPull);
    await playExpect(imageDetails.heading).toBeVisible({ timeout: 10_000 });

    const runImage = await imageDetails.openRunImage();
    await playExpect(runImage.heading).toBeVisible({ timeout: 10_000 });

    let containers = await runImage.startContainer(containerToRun, containerStartParams);
    await playExpect(containers.header).toBeVisible({ timeout: 60_000 });
    await playExpect
      .poll(async () => await containers.containerExists(containerToRun), {
        timeout: 60_000,
      })
      .toBeTruthy();

    //check that four volumes are created (in addition to the existing ones)
    volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    await playExpect
      .poll(async () => (await volumesPage.countVolumesFromTable()) - previousVolumes, { timeout: 30_000 })
      .toBe(4);

    //check the container is stopped and delete it
    containers = await navigationBar.openContainers();
    await playExpect(containers.heading).toBeVisible();

    const stopStatusArray = [ContainerState.Stopped, ContainerState.Exited];
    const stopStatusRegex = new RegExp(`${stopStatusArray.join('|')}`);

    const containerDetails = await containers.openContainersDetails(containerToRun);
    await playExpect(containerDetails.heading).toBeVisible({ timeout: 10_000 });
    await playExpect.poll(async () => containerDetails.getState(), { timeout: 30_000 }).toMatch(stopStatusRegex);

    containers = await navigationBar.openContainers();
    await playExpect(containers.heading).toBeVisible();

    const containersPage = await containers.deleteContainer(containerToRun);
    await playExpect(containersPage.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPage.containerExists(containerToRun), {
        timeout: 60_000,
        intervals: [1_000],
      })
      .toBeFalsy();

    //prune unused volumes
    volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible({ timeout: 10_000 });
    await playExpect
      .poll(async () => (await volumesPage.getRowsFromTableByStatus(VolumeState.Unused)).length, { timeout: 30_000 })
      .toBeGreaterThanOrEqual(1);

    volumesPage = await volumesPage.pruneVolumes();
    await playExpect
      .poll(async () => volumesPage.getRowsFromTableByStatus(VolumeState.Unused), { timeout: 30_000 })
      .toHaveLength(0);
    const finalVolumes = await volumesPage.countVolumesFromTable();
    playExpect(finalVolumes - previousVolumes).toBe(0);
  });

  test('Create volume on the system mapped into container', async ({ navigationBar, page }) => {
    //create a new volume
    let volumesPage = await navigationBar.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
    const createVolumePage = await volumesPage.openCreateVolumePage(volumeName);
    volumesPage = await createVolumePage.createVolume(volumeName);
    await playExpect
      .poll(async () => await volumesPage.waitForVolumeExists(volumeName), {
        timeout: 25_000,
      })
      .toBeTruthy();

    //pull image from ghcr.io/linuxcontainers/alpine
    let images = await navigationBar.openImages();
    const pullImagePage = await images.openPullImage();
    images = await pullImagePage.pullImage(noVolumeImageToPull, imageTag, 120_000);
    await playExpect
      .poll(async () => await images.waitForImageExists(noVolumeImageToPull, 30_000), { timeout: 0 })
      .toBeTruthy();

    //start a container from the image and map the volume into it
    const imageDetails = await images.openImageDetails(noVolumeImageToPull);
    const runImage = await imageDetails.openRunImage();
    const containerStartParams: ContainerInteractiveParams = {
      attachTerminal: true,
      attachVolumeName: volumeName,
      attachVolumePath: containerVolumePath,
    };
    await runImage.startContainer(containerName, containerStartParams);
    const containerDetailsPage = new ContainerDetailsPage(page, containerName);
    await playExpect(containerDetailsPage.heading).toBeVisible({ timeout: 60_000 });

    //access the container's terminal and create a file inside the volume's path to confirm that it is mounted and has write permissions
    const containers = await navigationBar.openContainers();
    const containersDetails = await containers.openContainersDetails(containerName);
    await playExpect(containersDetails.heading).toContainText(containerName);
    await playExpect.poll(async () => containersDetails.getState()).toContain(ContainerState.Running);
    await containersDetails.activateTab('Terminal');
    await playExpect(containersDetails.terminalInput).toBeVisible();
    await containersDetails.executeCommandInTerminal(`cd ${containerVolumePath}`);
    await containersDetails.executeCommandInTerminal('pwd');
    await playExpect(containersDetails.terminalContent).toContainText(containerVolumePath);
    await containersDetails.executeCommandInTerminal(`echo ${textContent} > ${fileName}`);
    await containersDetails.executeCommandInTerminal('ls');
    await playExpect(containersDetails.terminalContent).toContainText(fileName);

    //read the file from the volume using CLI
    const fileContent = await readFileInVolumeFromCLI(volumeName, fileName);
    console.log(`Successfully read file. Content: "${fileContent}"`);
    playExpect(fileContent).toContain(textContent); // Check if the file is not empty
    console.log(`File "${fileName}" exists in volume "${volumeName}"`);

    //delete the volume
    await containersDetails.deleteContainer();
    const containersPageAfterDelete = await navigationBar.openContainers();
    await playExpect(containersPageAfterDelete.heading).toBeVisible();
    await playExpect
      .poll(async () => await containersPageAfterDelete.containerExists(containerName), { timeout: 60_000 })
      .toBeFalsy();
    volumesPage = await navigationBar.openVolumes();
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
});
