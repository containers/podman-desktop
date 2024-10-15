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

import { KubernetesResources } from '../core/types';
import { KubernetesResourceDetailsPage } from './kubernetes-resource-details-page';
import { MainPage } from './main-page';

export class KubernetesResourcePage extends MainPage {
  readonly applyYamlButton: Locator;

  constructor(page: Page, name: KubernetesResources) {
    super(page, name);
    this.applyYamlButton = this.additionalActions.getByRole('button', { name: 'Apply YAML' });
  }

  getResourceRowByName(resourceName: string): Locator {
    const resourceRow = this.content.getByRole('row', { name: resourceName });
    return resourceRow;
  }

  async openResourceDetails(
    resourceName: string,
    resourceType: KubernetesResources,
  ): Promise<KubernetesResourceDetailsPage> {
    const resourceRow = this.getResourceRowByName(resourceName);
    if (resourceRow === undefined) {
      throw Error(`Resource: ${resourceName} does not exist`);
    }

    let resourceRowName;
    if (resourceType === KubernetesResources.Nodes) {
      resourceRowName = resourceRow.getByRole('cell').nth(2);
    } else {
      resourceRowName = resourceRow.getByRole('cell').nth(3);
    }

    await playExpect(resourceRowName).toBeEnabled();
    await resourceRowName.click();

    return new KubernetesResourceDetailsPage(this.page, resourceName);
  }

  async deleteKubernetesResource(resourceName: string): Promise<void> {
    const resourceRow = this.getResourceRowByName(resourceName);
    const deleteButton = resourceRow.getByRole('button', { name: 'Delete', exact: false });
    await playExpect(deleteButton).toBeVisible();
    await deleteButton.click();
  }
}
