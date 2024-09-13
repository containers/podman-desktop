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
  readonly header: Locator;
  readonly tabs: Locator;
  readonly tabContent: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly removeExtensionButton: Locator;
  readonly status: Locator;
  readonly heading: Locator;
  readonly errorStackTrace: Locator;

  constructor(
    page: Page,
    public readonly extensionName: string,
  ) {
    super(page);
    this.header = page.getByRole('region', { name: 'Header' });
    this.tabs = page.getByRole('region', { name: 'Tabs' });
    this.tabContent = page.getByRole('region', { name: 'Tab Content' });
    this.heading = this.header.getByRole('heading', { name: extensionName });
    this.enableButton = this.header.getByRole('button', { name: 'Start' });
    this.disableButton = this.header.getByRole('button', { name: 'Stop' });
    this.removeExtensionButton = this.header.getByRole('button', { name: 'Delete' });
    this.status = this.header.getByLabel('Extension Status Label');
    this.errorStackTrace = this.tabContent.getByRole('group', { name: 'Stack Trace', exact: true });
  }

  async disableExtension(): Promise<this> {
    if ((await this.status.innerText()) === 'DISABLED') return this;

    await this.disableButton.click();
    await playExpect(this.status).toHaveText('DISABLED', { timeout: 30000 });
    return this;
  }

  async enableExtension(): Promise<this> {
    if ((await this.status.innerText()) === 'ACTIVE') return this;

    await this.enableButton.click();
    await playExpect(this.status).toHaveText('ACTIVE', { timeout: 30000 });
    return this;
  }

  async removeExtension(): Promise<ExtensionsPage> {
    await this.disableExtension();
    await this.removeExtensionButton.click();
    return new ExtensionsPage(this.page);
  }

  async activateTab(tabName: string): Promise<this> {
    const tabItem = this.tabs.getByRole('button', { name: tabName, exact: true });
    await playExpect(tabItem).toBeVisible();
    await tabItem.click();
    return this;
  }
}
