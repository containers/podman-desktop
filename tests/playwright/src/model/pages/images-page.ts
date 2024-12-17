/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { Locator, Page } from '@playwright/test';
import test, { expect as playExpect } from '@playwright/test';

import { handleConfirmationDialog } from '../../utility/operations';
import { waitUntil, waitWhile } from '../../utility/wait';
import type { ContainerInteractiveParams } from '../core/types';
import { BuildImagePage } from './build-image-page';
import type { ContainersPage } from './containers-page';
import { ImageDetailsPage } from './image-details-page';
import { MainPage } from './main-page';
import { PullImagePage } from './pull-image-page';

export class ImagesPage extends MainPage {
  readonly pullImageButton: Locator;
  readonly pruneImagesButton: Locator;
  readonly buildImageButton: Locator;
  readonly pruneConfirmationButton: Locator;
  readonly loadImagesFromTarButton: Locator;
  readonly addArchiveButton: Locator;
  readonly confirmLoadImagesButton: Locator;
  readonly deleteAllUnusedImagesCheckbox: Locator;
  readonly deleteAllSelectedButton: Locator;

  constructor(page: Page) {
    super(page, 'images');
    this.pullImageButton = this.additionalActions.getByRole('button', {
      name: 'Pull',
      exact: true,
    });
    this.pruneImagesButton = this.additionalActions.getByRole('button', {
      name: 'Prune',
      exact: true,
    });
    this.buildImageButton = this.additionalActions.getByRole('button', {
      name: 'Build',
      exact: true,
    });
    this.pruneConfirmationButton = this.page.getByRole('button', {
      name: 'All unused images',
      exact: true,
    });
    this.loadImagesFromTarButton = this.additionalActions.getByLabel('Load Images', { exact: true });
    this.addArchiveButton = this.page.getByRole('button', {
      name: 'Add archive',
      exact: true,
    });
    this.confirmLoadImagesButton = this.page.getByRole('button', {
      name: 'Load Images',
      exact: true,
    });
    this.deleteAllUnusedImagesCheckbox = this.page.getByRole('checkbox', {
      name: 'Toggle all',
      exact: true,
    });
    this.deleteAllSelectedButton = this.bottomAdditionalActions.getByRole('button', { name: 'Delete' });
  }

  async openPullImage(): Promise<PullImagePage> {
    return test.step('Open pull image page', async () => {
      await waitWhile(() => this.noContainerEngine(), {
        timeout: 50_000,
        message: 'No Container Engine is available, cannot pull an image',
      });
      await this.pullImageButton.click();
      return new PullImagePage(this.page);
    });
  }

  async pullImage(image: string): Promise<ImagesPage> {
    return test.step(`Pull image: ${image}`, async () => {
      const pullImagePage = await this.openPullImage();
      await playExpect(pullImagePage.heading).toBeVisible();
      return await pullImagePage.pullImage(image);
    });
  }

  async renameImage(oldname: string, newname: string): Promise<ImagesPage> {
    return test.step(`Rename ${oldname} to ${newname}`, async () => {
      const imageDetailsPage = await this.openImageDetails(oldname);
      await playExpect(imageDetailsPage.heading).toContainText(oldname);
      const editImagePage = await imageDetailsPage.openEditImage();
      return await editImagePage.renameImage(newname);
    });
  }

  async startContainerWithImage(
    image: string,
    containerName: string,
    containersParams?: ContainerInteractiveParams,
  ): Promise<ContainersPage> {
    return test.step(`Start container with image: ${image}`, async () => {
      const imageDetails = await this.openImageDetails(image);
      const runImage = await imageDetails.openRunImage();
      return await runImage.startContainer(containerName, containersParams);
    });
  }

  async openImageDetails(name: string): Promise<ImageDetailsPage> {
    return test.step(`Open image details page for image: ${name}`, async () => {
      const imageRow = await this.getImageRowByName(name);
      if (imageRow === undefined) {
        throw Error(`Image: '${name}' does not exist`);
      }
      const imageRowName = imageRow.getByRole('cell').nth(3);
      await imageRowName.click();
      return new ImageDetailsPage(this.page, name);
    });
  }

  async pruneImages(): Promise<ImagesPage> {
    return test.step('Prune images', async () => {
      await this.pruneImagesButton.click();
      await handleConfirmationDialog(this.page, 'Prune', true, 'All unused images');
      return this;
    });
  }

  async openBuildImage(): Promise<BuildImagePage> {
    return test.step(`Open build image page`, async () => {
      await this.buildImageButton.click();
      return new BuildImagePage(this.page);
    });
  }

  async getImageRowByName(name: string): Promise<Locator | undefined> {
    return this.getRowFromTableByName(name);
  }

  private async imageExists(name: string): Promise<boolean> {
    return test.step(`Check if image: ${name} exists`, async () => {
      const result = await this.getImageRowByName(name);
      return result !== undefined;
    });
  }

  async waitForImageExists(name: string, timeout = 5_000): Promise<boolean> {
    return test.step(`Wait for image: ${name} to exist`, async () => {
      await waitUntil(async () => await this.imageExists(name), {
        timeout: timeout,
      });
      return true;
    });
  }

  async waitForImageDelete(name: string, timeout = 5_000): Promise<boolean> {
    return test.step(`Wait for image: ${name} to be deleted`, async () => {
      await waitWhile(async () => await this.imageExists(name), {
        timeout: timeout,
      });
      return true;
    });
  }

  async getCurrentStatusOfImage(name: string): Promise<string> {
    return test.step(`Get current status of image: ${name}`, async () => {
      let status = '';
      const row = await this.getImageRowByName(name);

      if (row === undefined) throw new Error(`Image: '${name}' does not exist`);
      status = status + (await row.getByRole('status').getAttribute('title'));
      return status;
    });
  }

  async loadImages(archivePath: string): Promise<ImagesPage> {
    // TODO: Will probably require refactoring when https://github.com/containers/podman-desktop/issues/7620 is done

    await playExpect(this.loadImagesFromTarButton).toBeEnabled();
    await this.loadImagesFromTarButton.click();
    await playExpect(this.addArchiveButton).toBeEnabled();
    await this.addArchiveButton.setInputFiles(archivePath);
    await playExpect(this.confirmLoadImagesButton).toBeEnabled();
    await this.confirmLoadImagesButton.click();
    return this;
  }

  async markAllUnusedImages(): Promise<boolean> {
    return test.step('Mark all unused images', async () => {
      if (!(await this.deleteAllUnusedImagesCheckbox.isVisible())) {
        console.log('No images available on the page');
        return false;
      }

      if (!(await this.deleteAllUnusedImagesCheckbox.isEnabled())) {
        console.log('No unused images available on the page');
        return false;
      }

      await playExpect(this.deleteAllUnusedImagesCheckbox).not.toBeChecked();
      await this.deleteAllUnusedImagesCheckbox.locator('..').click();
      await playExpect(this.deleteAllUnusedImagesCheckbox).toBeChecked();
      return true;
    });
  }

  async deleteAllUnusedImages(): Promise<void> {
    return test.step('Delete all unused images', async () => {
      if (!(await this.markAllUnusedImages())) {
        console.log('No images available to delete');
        return;
      }

      await playExpect(this.deleteAllSelectedButton).toBeEnabled();
      await this.deleteAllSelectedButton.click();
      await handleConfirmationDialog(this.page);
    });
  }

  async getCountOfImagesByStatus(status: string): Promise<number> {
    return test.step(`Get count from ${this.title} for images with status: ${status}`, async () => {
      const currentRows = await this.getAllTableRows();
      let count = 0;
      if (currentRows.length < 2) return 0;

      for (let rowNum = 1; rowNum < currentRows.length; rowNum++) {
        //skip header
        const statusCount = await currentRows[rowNum].getByRole('status').getByTitle(status, { exact: true }).count();
        if (statusCount > 0) ++count;
      }
      return count;
    });
  }
}
