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

import { ArchitectureType } from '../core/platforms';
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
  readonly platformRegion: Locator;
  readonly arm64Button: Locator;
  readonly amd64Button: Locator;
  readonly arm64checkbox: Locator;
  readonly amd64checkbox: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Build Image from Containerfile' });
    this.containerFilePathInput = page.getByPlaceholder('Containerfile to build');
    this.buildContextDirectoryInput = page.getByPlaceholder('Directory to build in');
    this.imageNameInput = page.getByPlaceholder('my-custom-image');
    this.buildButton = page.getByRole('button', { name: 'Build', exact: true });
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.containerFilePathButton = page.getByRole('button', { name: 'Browse...' }).first();
    this.platformRegion = page.getByRole('region', { name: 'Build Platform Options' });
    this.arm64Button = this.platformRegion.getByLabel('linux/arm64');
    this.amd64Button = this.platformRegion.getByLabel('linux/amd64');
    this.arm64checkbox = this.platformRegion.getByLabel('ARM® aarch64 systems');
    this.amd64checkbox = this.platformRegion.getByLabel('Intel and AMD x86_64 systems');
  }

  async buildImage(
    imageName: string,
    containerFilePath: string,
    contextDirectory: string,
    archType = ArchitectureType.Default,
  ): Promise<ImagesPage> {
    console.log(
      `Building image ${imageName} from ${containerFilePath} in ${contextDirectory} with ${archType} architecture`,
    );

    if (!containerFilePath) {
      throw Error(`Path to containerfile is incorrect or not provided!`);
    }

    await this.containerFilePathInput.fill(containerFilePath);

    if (contextDirectory) await this.buildContextDirectoryInput.fill(contextDirectory);
    if (imageName) {
      await this.imageNameInput.clear();
      await this.imageNameInput.pressSequentially(imageName, { delay: 50 });
    }

    if (archType !== ArchitectureType.Default) {
      await this.uncheckedAllCheckboxes();

      switch (archType) {
        case ArchitectureType.ARM64:
          await this.arm64Button.click();
          await playExpect(this.arm64checkbox).toBeChecked();
          break;
        case ArchitectureType.AMD64:
          await this.amd64Button.click();
          await playExpect(this.amd64checkbox).toBeChecked();
          break;
      }
    }

    await playExpect(this.buildButton).toBeEnabled();
    await this.buildButton.scrollIntoViewIfNeeded();
    await this.buildButton.click();

    await playExpect(this.doneButton).toBeEnabled({ timeout: 120000 });
    await this.doneButton.scrollIntoViewIfNeeded();
    await this.doneButton.click();
    console.log(`Image ${imageName} has been built successfully!`);

    return new ImagesPage(this.page);
  }

  async uncheckedAllCheckboxes(): Promise<void> {
    if (await this.arm64checkbox.isChecked()) {
      await this.arm64Button.click();
      await playExpect(this.arm64checkbox).not.toBeChecked();
    }
    if (await this.amd64checkbox.isChecked()) {
      await this.amd64Button.click();
      await playExpect(this.amd64checkbox).not.toBeChecked();
    }
  }
}
