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

import { BasePage } from './base-page';

export class DeployToKubernetesPage extends BasePage {
  readonly content: Locator;
  readonly podName: Locator;
  readonly kubernetesContext: Locator;
  readonly deployButton: Locator;
  readonly doneButton: Locator;
  readonly namespaceCombobox: Locator;
  readonly servicesCheckbox: Locator;
  readonly restrictedContextCheckbox: Locator;
  readonly createIngressCheckbox: Locator;
  readonly selectPortCombobox: Locator;

  constructor(page: Page) {
    super(page);
    this.content = this.page.getByRole('region', { name: 'Tab Content' });
    this.podName = this.content.getByRole('textbox', { name: 'Pod Name' });
    this.kubernetesContext = this.content.getByRole('textbox', { name: 'Kubernetes Context' });
    this.namespaceCombobox = this.content.getByRole('combobox', { name: 'Select a Kubernetes Namespace' });
    this.deployButton = this.content.getByRole('button', { name: 'Deploy' });
    this.doneButton = this.content.getByRole('button', { name: 'Done' });
    this.servicesCheckbox = this.content.getByRole('checkbox', { name: 'Use Services' });
    this.restrictedContextCheckbox = this.content.getByRole('checkbox', { name: 'Use restricted security context' });
    this.createIngressCheckbox = this.content.getByRole('checkbox', { name: 'Create Ingress' });
    this.selectPortCombobox = this.content.getByRole('combobox', { name: 'Select a Port' });
  }

  public async deployPod(name: string, context: string, namespace: string = 'default'): Promise<void> {
    await playExpect(this.podName).toBeVisible();
    await this.podName.fill(name);
    await playExpect(this.kubernetesContext).toHaveValue(context);

    await playExpect(this.namespaceCombobox).toBeVisible();
    const currentNamespace = await this.namespaceCombobox.inputValue();
    if (currentNamespace !== namespace) {
      const namespaceOptions = await this.namespaceCombobox.locator('option').allInnerTexts();
      if (namespaceOptions.includes(namespace)) {
        await this.namespaceCombobox.selectOption({ value: namespace });
        await playExpect(this.namespaceCombobox).toHaveValue(namespace);
      } else {
        throw new Error(`${namespace} doesn't exist`);
      }
    }

    await playExpect(this.deployButton).toBeEnabled();
    await this.deployButton.click();
    await playExpect(this.doneButton).toBeVisible({ timeout: 30000 });
  }
}
