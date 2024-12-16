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

import test, { expect as playExpect, type Locator, type Page } from '@playwright/test';

import { BasePage } from './base-page';

export abstract class CreateClusterBasePage extends BasePage {
  readonly header: Locator;
  readonly content: Locator;
  readonly clusterPropertiesInformation: Locator;
  readonly clusterCreationButton: Locator;
  readonly goBackButton: Locator;
  readonly logsButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.header = this.page.getByRole('region', { name: 'Header' });
    this.content = this.page.getByRole('region', { name: 'Tab Content' });
    this.clusterPropertiesInformation = this.content.getByRole('form', {
      name: 'Properties Information',
    });
    this.clusterCreationButton = this.clusterPropertiesInformation.getByRole('button', { name: 'Create', exact: true });
    this.logsButton = this.content.getByRole('button', { name: 'Show Logs' });
    this.goBackButton = this.page.getByRole('button', {
      name: 'Go back to resources',
    });
    this.errorMessage = this.content.getByRole('alert', {
      name: 'Error Message Content',
    });
  }

  async createCluster(timeout: number = 300_000): Promise<void> {
    return test.step('Create cluster', async () => {
      await Promise.race([
        (async (): Promise<void> => {
          await playExpect(this.clusterCreationButton).toBeVisible();
          await this.clusterCreationButton.click();
          await this.logsButton.scrollIntoViewIfNeeded();
          await this.logsButton.click();
          await playExpect(this.goBackButton).toBeVisible({ timeout: timeout });
          await this.goBackButton.click();
        })(),
        this.errorMessage.waitFor({ state: 'visible', timeout: timeout }).then(async () => {
          throw new Error(`${await this.errorMessage.textContent()}`);
        }),
      ]);
    });
  }
}
