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
import { expect as playExpect } from '@playwright/test';

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

  constructor(page: Page) {
    super(page, 'images');
    this.pullImageButton = this.additionalActions.getByRole('button', { name: 'Pull', exact: true });
    this.pruneImagesButton = this.additionalActions.getByRole('button', { name: 'Prune', exact: true });
    this.buildImageButton = this.additionalActions.getByRole('button', { name: 'Build', exact: true });
    this.pruneConfirmationButton = this.page.getByRole('button', { name: 'Yes', exact: true });
    this.loadImagesFromTarButton = this.additionalActions.getByLabel('Load Images', { exact: true });
    this.addArchiveButton = this.page.getByRole('button', { name: 'Add archive', exact: true });
    this.confirmLoadImagesButton = this.page.getByRole('button', { name: 'Load Images', exact: true });
  }

  async openPullImage(): Promise<PullImagePage> {
    await waitWhile(() => this.noContainerEngine(), {
      timeout: 50000,
      message: 'No Container Engine is available, cannot pull an image',
    });
    await this.pullImageButton.click();
    return new PullImagePage(this.page);
  }

  async pullImage(image: string): Promise<ImagesPage> {
    const pullImagePage = await this.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();
    return await pullImagePage.pullImage(image);
  }

  async renameImage(oldname: string, newname: string): Promise<ImagesPage> {
    const imageDetailsPage = await this.openImageDetails(oldname);
    await playExpect(imageDetailsPage.heading).toContainText(oldname);
    const editImagePage = await imageDetailsPage.openEditImage();
    return await editImagePage.renameImage(newname);
  }

  async startContainerWithImage(
    image: string,
    containerName: string,
    containersParams?: ContainerInteractiveParams,
  ): Promise<ContainersPage> {
    const imageDetails = await this.openImageDetails(image);
    const runImage = await imageDetails.openRunImage();
    return await runImage.startContainer(containerName, containersParams);
  }

  async openImageDetails(name: string): Promise<ImageDetailsPage> {
    const imageRow = await this.getImageRowByName(name);
    if (imageRow === undefined) {
      throw Error(`Image: '${name}' does not exist`);
    }
    const imageRowName = imageRow.getByRole('cell').nth(3);
    await imageRowName.click();
    return new ImageDetailsPage(this.page, name);
  }

  async pruneImages(): Promise<ImagesPage> {
    await this.pruneImagesButton.click();
    await handleConfirmationDialog(this.page, 'Prune');
    return this;
  }

  async openBuildImage(): Promise<BuildImagePage> {
    await this.buildImageButton.click();
    return new BuildImagePage(this.page);
  }

  async getImageRowByName(name: string): Promise<Locator | undefined> {
    return this.getRowFromTableByName(name);
  }

  protected async imageExists(name: string): Promise<boolean> {
    const result = await this.getImageRowByName(name);
    return result !== undefined;
  }

  async waitForImageExists(name: string, timeout = 5000): Promise<boolean> {
    await waitUntil(async () => await this.imageExists(name), { timeout: timeout });
    return true;
  }

  async waitForImageDelete(name: string, timeout = 5000): Promise<boolean> {
    await waitWhile(async () => await this.imageExists(name), { timeout: timeout });
    return true;
  }

  async getCurrentStatusOfImage(name: string): Promise<string> {
    let status = '';
    const row = await this.getImageRowByName(name);

    if (row === undefined) throw new Error(`Image: '${name}' does not exist`);

    status = status + (await row.getByRole('status').getAttribute('title'));
    return status;
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
}
