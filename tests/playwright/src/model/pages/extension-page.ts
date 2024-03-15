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

import { SettingsExtensionsPage } from './settings-extensions-page';
import { SettingsPage } from './settings-page';

export class ExtensionPage extends SettingsPage {
  readonly heading: Locator;
  readonly enableButton: Locator;
  readonly disableButton: Locator;
  readonly removeExtensionButton: Locator;
  readonly status: Locator;

  constructor(page: Page, extensionTitle: string, heading: string) {
    super(page, extensionTitle);
    this.heading = page.getByText(heading);
    this.enableButton = page.getByRole('button', { name: 'Enable' });
    this.disableButton = page.getByRole('button', { name: 'Disable' });
    this.removeExtensionButton = page.getByRole('button', { name: 'Remove' });
    this.status = page.getByLabel('Connection Status Label');
  }

  async disableExtension(): Promise<this> {
    if ((await this.status.innerText()) === 'DISABLED') return this;

    await this.disableButton.click();
    await playExpect(this.status).toHaveText('DISABLED');
    return this;
  }

  async removeExtension(): Promise<SettingsExtensionsPage> {
    await this.disableExtension();
    await this.removeExtensionButton.click();
    return new SettingsExtensionsPage(this.page);
  }
}
