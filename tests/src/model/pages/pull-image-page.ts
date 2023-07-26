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
import { ImagesPage } from './images-page';

export class PullImagePage extends PodmanDesktopPage {
  readonly heading: Locator;
  readonly imageInput: Locator;
  readonly pullButton: Locator;
  readonly doneButton: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly manageRegistriesButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    this.imageInput = page.getByLabel('imageName');
    this.pullButton = page.getByRole('button', { name: 'Pull image' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
  }

  async pullImage(image: string): Promise<ImagesPage> {
    await this.imageInput.fill(image);

    if (await this.pullButton.isEnabled()) {
      await this.pullButton.click();
    } else {
      throw Error('Pull image button is not enabled, verify image name');
    }

    await this.doneButton.waitFor({ state: 'visible' });
    await this.doneButton.click();

    return new ImagesPage(this.page);
  }
}
