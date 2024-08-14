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

import { expect as playExpect, type Locator, type Page } from '@playwright/test';

import { CheckboxOperations } from '../core/operations';
import { BasePage } from './base-page';

export class CreateKindClusterPage extends BasePage {
  readonly clusterPropertiesInformation: Locator;
  readonly clusterNameField: Locator;
  readonly controllerCheckbox: Locator;
  readonly clusterCreationButton: Locator;
  readonly goBackButton: Locator;
  readonly checkboxHolder: Locator;
  readonly logsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.clusterPropertiesInformation = this.page.getByRole('form', { name: 'Properties Information' });
    this.clusterNameField = this.clusterPropertiesInformation.getByRole('textbox', { name: 'Name', exact: true });
    this.controllerCheckbox = this.clusterPropertiesInformation.getByRole('checkbox', {
      name: 'Setup an ingress controller',
    });
    // Locator for the parent element of the ingress controller checkbox, used to change its value
    this.checkboxHolder = this.controllerCheckbox.locator('..');
    this.clusterCreationButton = this.clusterPropertiesInformation.getByRole('button', { name: 'Create', exact: true });
    this.goBackButton = this.page.getByRole('button', { name: 'Go back to resources' });
    this.logsButton = this.page.getByRole('button', { name: 'Show Logs' });
  }

  public async createCluster(clusterName: string): Promise<void> {
    await playExpect(this.clusterNameField).toBeVisible();
    if ((await this.clusterNameField.textContent()) !== clusterName) {
      await this.clusterNameField.fill('');
      await this.clusterNameField.fill(clusterName);
    }
    await playExpect(this.clusterCreationButton).toBeVisible();
    await this.clusterCreationButton.click();
    await playExpect(this.goBackButton).toBeVisible({ timeout: 120000 });
    await this.goBackButton.click();
  }

  public async manageCheckboxState(operation: CheckboxOperations): Promise<void> {
    await playExpect(this.controllerCheckbox).toBeVisible();

    const isChecked = await this.checkboxHolder.isChecked();
    if (
      (operation === CheckboxOperations.Check && isChecked) ||
      (operation === CheckboxOperations.Uncheck && !isChecked)
    ) {
      return;
    }

    switch (operation) {
      case CheckboxOperations.Check:
        await this.checkboxHolder.check();
        await playExpect(this.controllerCheckbox).toBeChecked();
        break;
      case CheckboxOperations.Uncheck:
        await this.checkboxHolder.uncheck();
        await playExpect(this.controllerCheckbox).not.toBeChecked();
        break;
    }
  }
}
