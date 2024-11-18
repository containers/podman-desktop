/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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
import { VolumesPage } from './volumes-page';

export class CreateVolumePage extends BasePage {
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly volumeNameBox: Locator;
  readonly doneButton: Locator;
  readonly closeButton: Locator;
  readonly createVolumeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Create a volume' });
    this.closeLink = this.page.getByRole('link', { name: 'Close' });
    this.volumeNameBox = this.page.getByRole('textbox', {
      name: 'Volume name',
    });
    this.doneButton = this.page.getByRole('button', { name: 'Done' });
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.createVolumeButton = this.page.getByRole('button', { name: 'Create' });
  }

  async createVolume(name: string): Promise<VolumesPage> {
    return test.step(`Create volume ${name}`, async () => {
      await this.volumeNameBox.fill(name);
      await playExpect(this.createVolumeButton).toBeEnabled();
      await this.createVolumeButton.click();
      await playExpect(this.doneButton).toBeEnabled({ timeout: 30000 });
      await this.doneButton.click();
      return new VolumesPage(this.page);
    });
  }
}
