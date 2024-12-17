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

import { fillTextbox } from '/@/utility/operations';

import type { KindClusterOptions } from '../core/types';
import { CreateClusterBasePage } from './cluster-creation-base-page';

export class CreateKindClusterPage extends CreateClusterBasePage {
  readonly clusterNameField: Locator;
  readonly controllerCheckbox: Locator;
  readonly providerTypeCombobox: Locator;
  readonly httpPort: Locator;
  readonly httpsPort: Locator;
  readonly containerImage: Locator;

  constructor(page: Page) {
    super(page);
    this.clusterNameField = this.clusterPropertiesInformation.getByRole('textbox', { name: 'Name', exact: true });
    // Locator for the parent element of the ingress controller checkbox, used to change its value
    this.controllerCheckbox = this.clusterPropertiesInformation
      .getByRole('checkbox', {
        name: 'Setup an ingress controller',
      })
      .locator('..');
    this.providerTypeCombobox = this.clusterPropertiesInformation.getByLabel('Provider Type');
    this.httpPort = this.clusterPropertiesInformation.getByLabel('HTTP Port');
    this.httpsPort = this.clusterPropertiesInformation.getByLabel('HTTPS Port');
    this.containerImage = this.clusterPropertiesInformation.getByPlaceholder('Leave empty for using latest.');
  }

  public async createClusterDefault(clusterName: string = 'kind-cluster', timeout?: number): Promise<void> {
    return test.step('Create default cluster', async () => {
      await fillTextbox(this.clusterNameField, clusterName);
      await playExpect(this.providerTypeCombobox).toContainText('podman');
      await playExpect(this.httpPort).toHaveValue('9090');
      await playExpect(this.httpsPort).toHaveValue('9443');
      await playExpect(this.controllerCheckbox).toBeChecked();
      await playExpect(this.containerImage).toBeEmpty();
      await this.createCluster(timeout);
    });
  }

  public async createClusterParametrized(
    clusterName: string = 'kind-cluster',
    { providerType, httpPort, httpsPort, useIngressController, containerImage }: KindClusterOptions = {},
    timeout?: number,
  ): Promise<void> {
    return test.step('Create parametrized cluster', async () => {
      await fillTextbox(this.clusterNameField, clusterName);

      if (providerType) {
        await playExpect(this.providerTypeCombobox).toBeVisible();
        const providerTypeOptions = await this.providerTypeCombobox.locator('option').allInnerTexts();
        if (providerTypeOptions.includes(providerType)) {
          await this.providerTypeCombobox.selectOption({ value: providerType });
          await playExpect(this.providerTypeCombobox).toHaveValue(providerType);
        } else {
          throw new Error(`${providerType} doesn't exist`);
        }
      }

      if (httpPort) {
        await fillTextbox(this.httpPort, httpPort);
      }
      if (httpsPort) {
        await fillTextbox(this.httpsPort, httpsPort);
      }

      await playExpect(this.controllerCheckbox).toBeEnabled();
      if (!useIngressController) {
        await this.controllerCheckbox.uncheck();
        await playExpect(this.controllerCheckbox).not.toBeChecked();
      } else {
        await this.controllerCheckbox.check();
        await playExpect(this.controllerCheckbox).toBeChecked();
      }

      if (containerImage) {
        await fillTextbox(this.containerImage, containerImage);
      }
      await this.createCluster(timeout);
    });
  }
}
