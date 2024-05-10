/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { waitUntil } from '../../utility/wait';
import { BasePage } from './base-page';
import { ImageEditPage } from './image-edit-page';
import { ImagesPage } from './images-page';
import { RunImagePage } from './run-image-page';

export class ImageDetailsPage extends BasePage {
  readonly name: Locator;
  readonly imageName: string;
  readonly heading: Locator;
  readonly runImageButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly summaryTab: Locator;
  readonly historyTab: Locator;
  readonly inspectTab: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly actionsButton: Locator;
  readonly buildDiskImageButton: Locator;

  constructor(page: Page, name: string) {
    super(page);
    this.name = page.getByLabel('name').and(page.getByText('Image Details'));
    this.imageName = name;
    this.heading = page.getByRole('heading', { name: this.imageName });
    this.runImageButton = page.getByRole('button', { name: 'Run Image' });
    this.deleteButton = page.getByRole('button', { name: 'Delete Image' });
    this.editButton = page.getByRole('button', { name: 'Edit Image' });
    this.summaryTab = page.getByText('Summary');
    this.historyTab = page.getByText('History');
    this.inspectTab = page.getByText('Inspect');
    this.closeLink = page.getByRole('link', { name: 'Close Details' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.actionsButton = page.getByRole('button', { name: 'kebab menu' });
    this.buildDiskImageButton = page.getByTitle('Build Disk Image');
  }

  async openRunImage(): Promise<RunImagePage> {
    await waitUntil(async () => await this.runImageButton.isEnabled(), 5000, 500);
    await this.runImageButton.click();
    return new RunImagePage(this.page, this.imageName);
  }

  async openEditImage(): Promise<ImageEditPage> {
    await this.editButton.click();
    return new ImageEditPage(this.page, this.imageName);
  }

  async deleteImage(): Promise<ImagesPage> {
    await waitUntil(async () => await this.deleteButton.isEnabled(), 15000, 500);
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new ImagesPage(this.page);
  }

  async buildDiskImage(type: string, architecture: string, pathToStore: string): Promise<boolean> {
    let result = false;

    try {
      await this.actionsButton.click();
      await playExpect(this.buildDiskImageButton).toBeEnabled();
      await this.buildDiskImageButton.click();

      const typeButtonLocator = this.page.getByRole('button', { name: type });
      await playExpect(typeButtonLocator).toBeEnabled();
      await typeButtonLocator.click();

      const architectureButtonLocator = this.page.getByRole('button', { name: architecture });
      await playExpect(architectureButtonLocator).toBeEnabled();
      await architectureButtonLocator.click();

      const pathInputLocator = this.page.locator(`input[type='text']`);
      await playExpect(pathInputLocator).toBeVisible();
      await pathInputLocator.clear();
      await pathInputLocator.fill(pathToStore);
      await pathInputLocator.press('Enter');

      const dialogLocator = this.page.getByRole('dialog', { name: 'Bootable Container', exact: true });
      await playExpect.poll(async () => (await dialogLocator.count()) > 0, { timeout: 300000 }).toBeTruthy();

      const dialogMessageLocator = this.page.getByLabel('Dialog Message');
      result = (await dialogMessageLocator.innerText()).includes('Success!');
    } finally {
      const okButtonLocator = this.page.getByRole('button', { name: 'OK' });
      await playExpect(okButtonLocator).toBeEnabled();
      await okButtonLocator.click();
    }

    return result;
  }
}
