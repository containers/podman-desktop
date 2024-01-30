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
import { MainPage } from './main-page';
import { ImageDetailsPage } from './image-details-page';
import { PullImagePage } from './pull-image-page';
import { waitUntil, waitWhile } from '../../utility/wait';
import { BuildImagePage } from './build-image-page';
import { expect as playExpect } from '@playwright/test';
import type { ContainersPage } from './containers-page';
import { handleConfirmationDialog } from '../../utility/operations';

export class ImagesPage extends MainPage {
  readonly pullImageButton: Locator;
  readonly pruneImagesButton: Locator;
  readonly buildImageButton: Locator;
  readonly pruneConfirmationButton: Locator;

  constructor(page: Page) {
    super(page, 'images');
    this.pullImageButton = this.additionalActions.getByRole('button', { name: 'Pull' });
    this.pruneImagesButton = this.additionalActions.getByRole('button', { name: 'Prune' });
    this.buildImageButton = this.additionalActions.getByRole('button', { name: 'Build' });
    this.pruneConfirmationButton = this.page.getByRole('button', { name: 'Yes' });
  }

  async openPullImage(): Promise<PullImagePage> {
    await waitWhile(
      () => this.noContainerEngine(),
      5000,
      1000,
      true,
      'No Container Engine is available, cannot pull an image',
    );
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

  async startContainerWithImage(image: string, containerName: string): Promise<ContainersPage> {
    const imageDetails = await this.openImageDetails(image);
    const runImage = await imageDetails.openRunImage();
    return await runImage.startContainer(containerName);
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
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    try {
      const table = await this.getTable();
      const rows = await table.getByRole('row').all();
      for (let i = rows.length - 1; i > 0; i--) {
        const thirdCell = await rows[i].getByRole('cell').nth(3).getByText(name, { exact: true }).count();
        if (thirdCell) {
          return rows[i];
        }
      }
    } catch (err) {
      console.log(`Exception caught on image page with message: ${err}`);
    }
    return undefined;
  }

  protected async imageExists(name: string): Promise<boolean> {
    const result = await this.getImageRowByName(name);
    return result !== undefined;
  }

  async waitForImageExists(name: string, timeout = 5000): Promise<boolean> {
    await waitUntil(async () => await this.imageExists(name), timeout, 500);
    return true;
  }

  async waitForImageDelete(name: string, timeout = 5000): Promise<boolean> {
    await waitWhile(async () => await this.imageExists(name), timeout, 500);
    return true;
  }
}
