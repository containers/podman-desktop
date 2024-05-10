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

import { BasePage } from './base-page';
import { ImagesPage } from './images-page';

export class BuildImagePage extends BasePage {
  readonly heading: Locator;
  readonly containerFilePathInput: Locator;
  readonly buildContextDirectoryInput: Locator;
  readonly imageNameInput: Locator;
  readonly buildButton: Locator;
  readonly doneButton: Locator;
  readonly containerFilePathButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Build Image from Containerfile' });
    this.containerFilePathInput = page.getByPlaceholder('Containerfile to build');
    this.buildContextDirectoryInput = page.getByPlaceholder('Folder to build in');
    this.imageNameInput = page.getByPlaceholder('my-custom-image');
    this.buildButton = page.getByRole('button', { name: 'Build' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.containerFilePathButton = page.getByRole('button', { name: 'Browse...' }).first();
  }

  async buildImage(imageName: string, containerFilePath: string, contextDirectory: string): Promise<ImagesPage> {
    if (!containerFilePath) {
      throw Error(`Path to containerfile is incorrect or not provided!`);
    }

    await this.containerFilePathInput.fill(containerFilePath);

    if (contextDirectory) await this.buildContextDirectoryInput.fill(contextDirectory);
    if (imageName) {
      await this.imageNameInput.clear();
      await this.imageNameInput.fill(imageName);
    }

    await playExpect(this.buildButton).toBeEnabled();
    await this.buildButton.click();
    await playExpect(this.doneButton).toBeEnabled({ timeout: 120000 });
    await this.doneButton.click();
    return new ImagesPage(this.page);
  }
}
