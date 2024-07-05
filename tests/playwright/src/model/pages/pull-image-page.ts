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

export class PullImagePage extends BasePage {
  readonly heading: Locator;
  readonly pullImageButton: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly manageRegistriesButton: Locator;
  readonly imageToPullLabel: Locator;
  readonly imageNameInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    this.pullImageButton = page.getByRole('button', { name: 'Pull' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
    this.imageToPullLabel = page.getByLabel('Image to Pull');
    this.imageNameInput = page.getByLabel('imageName');
  }

  async pullImage(imageName: string, tag = '', timeout = 60000): Promise<ImagesPage> {
    const fullImageName = `${imageName}${tag.length === 0 ? '' : ':' + tag}`;
    await this.imageNameInput.fill(fullImageName);
    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();

    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await playExpect(doneButton).toBeEnabled({ timeout: timeout });
    await doneButton.click();
    return new ImagesPage(this.page);
  }
}
