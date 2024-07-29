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

import { waitUntil } from '../../utility/wait';
import { BasePage } from './base-page';
import { ImagesPage } from './images-page';

export class PullImagePage extends BasePage {
  readonly heading: Locator;
  readonly pullImageButton: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly manageRegistriesButton: Locator;
  readonly imageToPullLabel: Locator;
  readonly imageNameInput: Locator;
  readonly imageTagInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    this.pullImageButton = page.getByRole('button', { name: 'Pull' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
    this.imageToPullLabel = page.getByPlaceholder('Image to Pull');
    this.imageNameInput = page.getByPlaceholder('Registry name / Image name');
    this.imageTagInput = page.getByPlaceholder('Image tag');
  }

  async pullImage(searchTerm: string, imageName: string, tag = '', timeout = 60000): Promise<ImagesPage> {
    await this.imageNameInput.fill(searchTerm);
    await this.selectItem(imageName);
    await this.imageNameInput.press('Tab');

    if (tag) {
      await this.imageTagInput.fill(tag);
      await this.selectItem(tag);
      await this.imageTagInput.press('Tab');
    }

    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();

    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await playExpect(doneButton).toBeEnabled({ timeout: timeout });
    await doneButton.click();
    return new ImagesPage(this.page);
  }

  async selectItem(text: string, timeout: number = 60000): Promise<void> {
    await waitUntil(
      async () => {
        return await this.page.locator('.list-open').isVisible();
      },
      { timeout: timeout },
    );
    let initial: boolean = true;
    for (;;) {
      // we stop when we come back to the beginning
      if (!initial) {
        const firstSelected = await this.page.locator('.list-open').locator('.item.first.hover').isVisible();
        playExpect(firstSelected).toBeFalsy();
      }
      initial = false;
      const imageSelected = await this.page.locator('.list-open').locator('.item.hover', { hasText: text }).isVisible();
      if (imageSelected) {
        return;
      }
      await this.imageNameInput.press('ArrowDown');
    }
  }
}
