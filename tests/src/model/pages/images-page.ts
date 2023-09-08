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

import type { Locator, Page } from 'playwright';
import { MainPage } from './main-page';
import { ImageDetailsPage } from './image-details-page';
import { PullImagePage } from './pull-image-page';
import { waitUntil, waitWhile } from '../../utility/wait';

export class ImagesPage extends MainPage {
  readonly pullImageButton: Locator;
  readonly pruneImagesButton: Locator;
  readonly buildImageButton: Locator;

  constructor(page: Page) {
    super(page, 'images');
    this.pullImageButton = this.additionalActions.getByRole('button', { name: 'Pull an image' });
    this.pruneImagesButton = this.additionalActions.getByRole('button', { name: 'Prune images' });
    this.buildImageButton = this.additionalActions.getByRole('button', { name: 'Build an image' });
  }

  async openPullImage(): Promise<PullImagePage> {
    if (await this.noContainerEngine()) {
      throw Error('No Container Engine is present, cannot pull an image');
    }
    await this.pullImageButton.click();
    return new PullImagePage(this.page);
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

  async getImageRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    const table = await this.getTable();
    const rows = await table.getByRole('row').all();
    for (const row of rows) {
      // test on empty row - contains on 0th position &nbsp; character (ISO 8859-1 character set: 160)
      const zeroCell = await row.getByRole('cell').nth(0).innerText();
      if (zeroCell.indexOf(String.fromCharCode(160)) === 0) {
        continue;
      }
      const thirdCell = await row.getByRole('cell').nth(3).innerText();
      const index = thirdCell.indexOf(name);
      if (index >= 0) {
        return row;
      }
    }
  }

  protected async imageExists(name: string): Promise<boolean> {
    const result = await this.getImageRowByName(name);
    return result !== undefined;
  }

  async waitForImageExists(name: string): Promise<boolean> {
    await waitUntil(async () => await this.imageExists(name), 3000, 900);
    return true;
  }

  async waitForImageDelete(name: string): Promise<boolean> {
    await waitWhile(async () => await this.imageExists(name), 3000, 900);
    return true;
  }
}
