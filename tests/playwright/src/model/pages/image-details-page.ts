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

import type { PodmanDesktopRunner } from '../../runner/podman-desktop-runner';
import { handleConfirmationDialog } from '../../utility/operations';
import { waitUntil } from '../../utility/wait';
import { BasePage } from './base-page';
import { BootcPage } from './bootc-page';
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

  async buildDiskImage(
    pdRunner: PodmanDesktopRunner,
    type: string,
    architecture: string,
    pathToStore: string,
  ): Promise<boolean> {
    await this.actionsButton.click();
    await playExpect(this.buildDiskImageButton).toBeEnabled();
    await this.buildDiskImageButton.click();

    const webView = this.page.getByRole('document', { name: 'Bootable Containers' });
    await playExpect(webView).toBeVisible();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const [mainPage, webViewPage] = pdRunner.getElectronApp().windows();
    await mainPage.evaluate(() => {
      const element = document.querySelector('webview');
      if (element) {
        element.focus();
      } else {
        console.log(`element is null`);
      }
    });
    return await new BootcPage(mainPage, webViewPage).buildDiskImage(pathToStore, type, architecture);
  }
}
