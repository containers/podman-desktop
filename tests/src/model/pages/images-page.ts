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
import { PodmanDesktopPage } from './base-page';
import { PullImagePage } from './pull-image-page';
import { ImageDetailsPage } from './image-details-page';

export class ImagesPage extends PodmanDesktopPage {
  readonly heading: Locator;
  readonly pullButton: Locator;
  readonly pruneButton: Locator;
  readonly buildButton: Locator;
  readonly imagesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'images', exact: true });
    this.pullButton = page.getByRole('button', { name: 'Pull an image' });
    this.pruneButton = page.getByRole('button', { name: 'Prune images' });
    this.buildButton = page.getByRole('button', { name: 'Build an image' });
    this.imagesTable = page.getByRole('table');
  }

  async pullImage(): Promise<PullImagePage> {
    await this.pullButton.click();
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
    await this.imagesTable.waitFor({ state: 'visible', timeout: 3000 });
    const rows = await this.imagesTable.getByRole('row').all();

    for (const row of rows) {
      // test on empty row - contains on 0th position &nbsp; character (ISO 8859-1 character set: 160)
      const zeroCell = await row.getByRole('cell').nth(0).innerText();
      if (zeroCell.indexOf(String.fromCharCode(160)) === 0) {
        continue;
      }
      const thirdCell = await row.getByRole('cell').nth(3).innerText();
      if (thirdCell.indexOf(name) >= 0) {
        return row;
      }
    }
  }

  async imageExists(name: string): Promise<boolean> {
    return (await this.getImageRowByName(name)) !== undefined ? true : false;
  }
}
