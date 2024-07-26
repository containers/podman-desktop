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
import { DetailsPage } from './details-page';
import { ImageEditPage } from './image-edit-page';
import { ImagesPage } from './images-page';
import { RunImagePage } from './run-image-page';

export class ImageDetailsPage extends DetailsPage {
  readonly runImageButton: Locator;
  readonly deleteButton: Locator;
  readonly editButton: Locator;
  readonly summaryTab: Locator;
  readonly historyTab: Locator;
  readonly inspectTab: Locator;
  readonly actionsButton: Locator;
  readonly buildDiskImageButton: Locator;
  readonly saveImagebutton: Locator;
  readonly saveImageInput: Locator;
  readonly confirmSaveImages: Locator;
  readonly browseButton: Locator;

  constructor(page: Page, name: string) {
    super(page, name);
    this.runImageButton = this.controlActions.getByRole('button', { name: 'Run Image' });
    this.deleteButton = this.controlActions.getByRole('button', { name: 'Delete Image' });
    this.editButton = this.controlActions.getByRole('button', { name: 'Edit Image' });
    this.summaryTab = this.tabs.getByText('Summary');
    this.historyTab = this.tabs.getByText('History');
    this.inspectTab = this.tabs.getByText('Inspect');
    this.actionsButton = page.getByRole('button', { name: 'kebab menu' });
    this.buildDiskImageButton = page.getByTitle('Build Disk Image');
    this.saveImagebutton = this.controlActions.getByRole('button', { name: 'Save Image', exact: true });
    this.saveImageInput = page.locator('#input-output-directory');
    this.confirmSaveImages = page.getByLabel('Save images', { exact: true });
    this.browseButton = page.getByLabel('Select output folder');
  }

  async openRunImage(): Promise<RunImagePage> {
    await playExpect(this.runImageButton).toBeEnabled({ timeout: 30000 });
    await this.runImageButton.click();
    return new RunImagePage(this.page, this.resourceName);
  }

  async openEditImage(): Promise<ImageEditPage> {
    await playExpect(this.editButton).toBeEnabled({ timeout: 30000 });
    await this.editButton.click();
    return new ImageEditPage(this.page, this.resourceName);
  }

  async deleteImage(): Promise<ImagesPage> {
    await playExpect(this.deleteButton).toBeEnabled({ timeout: 30000 });
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new ImagesPage(this.page);
  }

  async buildDiskImage(pdRunner: PodmanDesktopRunner): Promise<[Page, Page]> {
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
        (element as HTMLElement).focus();
      } else {
        console.log(`element is null`);
      }
    });

    return [mainPage, webViewPage];
  }

  async saveImage(outputPath: string): Promise<ImagesPage> {
    if (!outputPath) {
      throw Error(`Path is incorrect or not provided!`);
    }
    // TODO: Will probably require refactoring when https://github.com/containers/podman-desktop/issues/7620 is done
    await playExpect(this.saveImagebutton).toBeEnabled();
    await this.saveImagebutton.click();
    await playExpect(this.saveImageInput).toBeVisible();
    await playExpect(this.confirmSaveImages).toBeVisible();

    await this.saveImageInput.evaluate(node => node.removeAttribute('readonly'));
    await this.confirmSaveImages.evaluate(node => node.removeAttribute('disabled'));

    await this.saveImageInput.pressSequentially(outputPath, { delay: 10 });
    await this.confirmSaveImages.click();

    return new ImagesPage(this.page);
  }
}
