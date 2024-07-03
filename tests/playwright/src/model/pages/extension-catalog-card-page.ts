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
import { expect as playExpect } from '@playwright/test';

import { BasePage } from './base-page';
import { ExtensionDetailsPage } from './extension-details-page';

export class ExtensionCatalogCardPage extends BasePage {
  readonly parent: Locator;
  readonly extensionName: string;
  readonly detailsButton: Locator;
  readonly downloadButton: Locator;
  readonly alreadyInstalledText: Locator;

  constructor(page: Page, extensionName: string) {
    super(page);
    this.extensionName = extensionName;
    this.parent = this.page.getByRole('group', { name: this.extensionName });
    this.detailsButton = this.parent.getByRole('button', { name: 'More details' });
    this.downloadButton = this.parent.getByRole('button', { name: 'Install' });
    this.alreadyInstalledText = this.parent.getByText('Already installed', { exact: true });
  }

  public async openDetails(): Promise<ExtensionDetailsPage> {
    await this.parent.scrollIntoViewIfNeeded();
    await playExpect(this.detailsButton).toBeVisible();
    await this.detailsButton.click();
    return new ExtensionDetailsPage(this.page, this.extensionName);
  }

  public async isInstalled(): Promise<boolean> {
    await this.parent.scrollIntoViewIfNeeded();
    const downloadButton = this.parent.getByRole('button', { name: 'Install' });
    return (await this.alreadyInstalledText.count()) > 0 && (await downloadButton.count()) === 0;
  }

  public async install(timeout: number): Promise<void> {
    if (await this.isInstalled()) {
      console.log(`Extension ${this.extensionName} is already installed`);
      return;
    }
    await playExpect(this.downloadButton).toBeEnabled();
    await this.downloadButton.click();
    await playExpect(this.alreadyInstalledText).toBeVisible({ timeout: timeout });
  }
}
