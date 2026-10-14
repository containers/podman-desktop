/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { BasePage } from './base-page';
import { ContainersPage } from './containers-page';
import { RunImagePage } from './run-image-page';

export class SelectImagePage extends BasePage {
  readonly heading: Locator;
  readonly imageNameInput: Locator;
  readonly cancelButton: Locator;
  readonly runImageButton: Locator;
  readonly pullImageAndRunButton: Locator;
  readonly manageRegistriesButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {
      name: 'Select an image',
      exact: true,
    });
    this.imageNameInput = page.getByPlaceholder('Select or enter an image to run');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.runImageButton = page.getByRole('button', { name: 'Run Image' });
    this.pullImageAndRunButton = page.getByRole('button', { name: 'Pull Image and Run' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
    // scoped to the footer: the latest-tag WarningMessage is also an unnamed alert
    this.errorMessage = page.locator('footer').getByRole('alert');
  }

  async selectImage(imageName: string): Promise<SelectImagePage> {
    return test.step(`Select image: ${imageName}`, async () => {
      await playExpect(this.imageNameInput).toBeVisible();
      await this.imageNameInput.fill(imageName);
      await playExpect(this.imageNameInput).toHaveValue(imageName);
      return this;
    });
  }

  async cancel(): Promise<ContainersPage> {
    return test.step('Cancel and return to Containers page', async () => {
      await playExpect(this.cancelButton).toBeEnabled();
      await this.cancelButton.click();
      return new ContainersPage(this.page);
    });
  }

  async runImage(imageName: string): Promise<RunImagePage> {
    return test.step('Run image', async () => {
      await this.selectImage(imageName);
      // The UI conditionally shows either "Pull Image and Run" or "Run Image" button
      // depending on whether the image exists locally
      const actionButton = this.pullImageAndRunButton.or(this.runImageButton);
      await playExpect(actionButton).toBeEnabled({ timeout: 10_000 });
      await actionButton.click();
      return new RunImagePage(this.page, imageName);
    });
  }

  async openManageRegistries(): Promise<void> {
    return test.step('Open Manage registries', async () => {
      await playExpect(this.manageRegistriesButton).toBeEnabled();
      await this.manageRegistriesButton.click();
    });
  }
}
