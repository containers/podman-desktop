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

import type { KubernetesResources } from '../core/types';
import { KubernetesResourceDetailsPage } from './kubernetes-resource-details-page';
import { MainPage } from './main-page';

export class KubernetesResourcePage extends MainPage {
  readonly applyYamlButton: Locator;

  constructor(page: Page, name: KubernetesResources) {
    super(page, name);
    this.applyYamlButton = this.additionalActions.getByRole('button', { name: 'Apply YAML' });
  }

  async getRowFromTableByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }

    try {
      const rows = await this.getAllTableRows();
      for (let i = rows.length - 1; i >= 0; i--) {
        const nameCell = await rows[i].getByRole('cell').nth(2).getByText(name, { exact: true }).count();
        if (nameCell) {
          return rows[i];
        }
      }
    } catch (err) {
      console.log(`Exception caught on ${this.title} page with message: ${err}`);
    }
    return undefined;
  }

  async openResourceDetails(resourceName: string): Promise<KubernetesResourceDetailsPage> {
    const resourceRow = await this.getRowFromTableByName(resourceName);
    if (resourceRow === undefined) {
      throw Error(`Resource: ${resourceName} does not exist`);
    }
    const resourceRowName = resourceRow.getByRole('cell').nth(2);
    await resourceRowName.click();

    return new KubernetesResourceDetailsPage(this.page, resourceName);
  }
}
