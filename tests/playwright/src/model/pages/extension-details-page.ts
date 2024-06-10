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

import { BasePage } from './base-page';
import { ExtensionsPage } from './extensions-page';

export class ExtensionDetailsPage extends BasePage {
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly removeExtensionButton: Locator;
  readonly status: Locator;
  readonly heading: Locator;

  constructor(
    page: Page,
    public readonly extensionName: string,
  ) {
    super(page);
    this.heading = page.getByRole('heading', { name: extensionName });
    this.enableButton = page.getByRole('button', { name: 'Start' });
    this.disableButton = page.getByRole('button', { name: 'Stop' });
    this.removeExtensionButton = page.getByRole('button', { name: 'Delete' });
    this.status = page.getByLabel('Extension Status Label');
  }

  async disableExtension(): Promise<this> {
    if ((await this.status.innerText()) === 'DISABLED') return this;

    await this.disableButton.click();
    await playExpect(this.status).toHaveText('DISABLED');
    return this;
  }

  async enableExtension(): Promise<this> {
    if ((await this.status.innerText()) === 'ACTIVE') return this;

    await this.enableButton.click();
    await playExpect(this.status).toHaveText('ACTIVE');
    return this;
  }

  async removeExtension(): Promise<ExtensionsPage> {
    await this.disableExtension();
    await this.removeExtensionButton.click();
    return new ExtensionsPage(this.page);
  }
}
