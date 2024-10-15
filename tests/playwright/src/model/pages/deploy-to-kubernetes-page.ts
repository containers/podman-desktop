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

import type { DeployPodOptions } from '../core/types';
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
  readonly deploymentStatus: Locator;

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
    this.deploymentStatus = this.content.getByRole('region', { name: 'Pod Deployment Status Info' });
  }

  public async deployPod(
    name: string,
    {
      useKubernetesServices,
      useRestrictedSecurityContext,
      useKubernetesIngress,
      containerExposedPort,
    }: DeployPodOptions = {},
    context: string,
    namespace: string = 'default',
    timeout: number = 100_000,
  ): Promise<void> {
    await playExpect(this.podName).toBeVisible();
    await this.podName.clear();
    await this.podName.fill(name);

    await playExpect(this.servicesCheckbox).toBeEnabled();
    if (useKubernetesServices) {
      await this.servicesCheckbox.check();
      await playExpect(this.servicesCheckbox).toBeChecked();
    } else {
      await this.servicesCheckbox.uncheck();
      await playExpect(this.servicesCheckbox).not.toBeChecked();
    }

    await playExpect(this.restrictedContextCheckbox).toBeEnabled();
    if (useRestrictedSecurityContext) {
      await this.restrictedContextCheckbox.check();
      await playExpect(this.restrictedContextCheckbox).toBeChecked();
    } else {
      await this.restrictedContextCheckbox.uncheck();
      await playExpect(this.restrictedContextCheckbox).not.toBeChecked();
    }

    await playExpect(this.createIngressCheckbox).toBeEnabled();
    if (useKubernetesIngress) {
      await this.createIngressCheckbox.check();
      await playExpect(this.createIngressCheckbox).toBeChecked();
      if (containerExposedPort) {
        await this.selectExposedPort(containerExposedPort);
      }
    } else {
      await this.createIngressCheckbox.uncheck();
      await playExpect(this.createIngressCheckbox).not.toBeChecked();
    }

    await this.kubernetesContext.scrollIntoViewIfNeeded();
    await playExpect(this.kubernetesContext).toHaveValue(context);
    await playExpect(this.namespaceCombobox).toBeVisible();
    const currentNamespace = await this.namespaceCombobox.inputValue();
    if (currentNamespace !== namespace) {
      const namespaceOptions = await this.namespaceCombobox.locator('option').allInnerTexts();
      if (!namespaceOptions.includes(namespace)) {
        throw new Error(`${namespace} doesn't exist`);
      }
      await this.namespaceCombobox.selectOption({ value: namespace });
      await playExpect(this.namespaceCombobox).toHaveValue(namespace);
    }

    await playExpect(this.deployButton).toBeEnabled();
    await this.deployButton.click();
    await playExpect(this.deploymentStatus).toBeVisible();
    await this.deploymentStatus.scrollIntoViewIfNeeded();
    await playExpect(this.doneButton).toBeVisible({ timeout: timeout });
  }

  private async selectExposedPort(containerExposedPort: string): Promise<void> {
    await playExpect(this.selectPortCombobox).toBeVisible();
    const exposedPorts = await this.selectPortCombobox.locator('option').allInnerTexts();
    if (!exposedPorts.includes(containerExposedPort)) {
      throw new Error(`Port: ${containerExposedPort} doesn't exist`);
    }
    await this.selectPortCombobox.selectOption({ value: containerExposedPort });
    await playExpect(this.selectPortCombobox).toHaveValue(containerExposedPort);
  }
}
