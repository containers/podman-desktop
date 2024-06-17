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
import { ExtensionsPage } from './extensions-page';

export class ExtensionCardPage extends BasePage {
  readonly parent: Locator;
  readonly card: Locator;
  readonly leftActions: Locator;
  readonly rightActions: Locator;
  readonly detailsLink: Locator;
  readonly extensionName: string;
  readonly extensionLabel: string;
  readonly extensionActions: Locator;
  readonly onboardingButton: Locator;
  readonly editButton: Locator;
  readonly status: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page, extensionName: string, extensionLabel: string) {
    super(page);
    this.parent = this.page.getByRole('region', { name: 'content' });
    this.extensionName = extensionName;
    this.extensionLabel = extensionLabel;
    this.card = this.parent.getByRole('region', { name: this.extensionLabel, exact: true });
    this.leftActions = this.card.getByRole('region', { name: 'left actions' });
    this.rightActions = this.card.getByRole('region', { name: 'right actions' });
    this.detailsLink = this.rightActions.getByRole('button', {
      name: `${this.extensionName} extension details`,
      exact: true,
    });
    this.extensionActions = this.leftActions.getByRole('group', { name: 'Extension Actions' });
    this.onboardingButton = this.leftActions.getByRole('button', { name: 'Onboarding bootc' });
    this.editButton = this.leftActions.getByRole('button', { name: `Edit properties of ${extensionName} extension` });
    this.status = this.leftActions.getByLabel('Extension Status Label');
    this.enableButton = this.extensionActions.getByRole('button', { name: 'Start' });
    this.disableButton = this.extensionActions.getByRole('button', { name: 'Stop' });
    this.removeButton = this.extensionActions.getByRole('button', { name: 'Delete' });
  }

  public async openExtensionDetails(heading: string): Promise<ExtensionDetailsPage> {
    await playExpect(this.card).toBeVisible();
    await this.card.scrollIntoViewIfNeeded();
    await playExpect(this.detailsLink).toBeVisible();
    await this.detailsLink.click();
    return new ExtensionDetailsPage(this.page, heading);
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
    await this.removeButton.click();
    return new ExtensionsPage(this.page);
  }
}
