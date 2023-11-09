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
import { BasePage } from './base-page';
import { PodDetailsPage } from './pods-details-page';

export class PodsPage extends BasePage {
  readonly heading: Locator;
  readonly playKubernetesYAMLButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'pods', exact: true });
    this.playKubernetesYAMLButton = this.page.getByRole('button', { name: 'Play Kubernetes YAML' });
  }

  async getTable(): Promise<Locator> {
    if (!(await this.pageIsEmpty())) {
      return this.page.getByRole('table');
    } else {
      throw Error('Pods page is empty, there are no pods');
    }
  }

  async pageIsEmpty(): Promise<boolean> {
    const noPodsHeading = this.page.getByRole('heading', { name: 'No Pods', exact: true });
    try {
      await noPodsHeading.waitFor({ state: 'visible', timeout: 500 });
    } catch (err) {
      return false;
    }
    return true;
  }

  async openPodDetails(name: string): Promise<PodDetailsPage> {
    const podRow = await this.getPodRowByName(name);
    if (podRow === undefined) {
      throw Error(`Pod: ${name} does not exist`);
    }
    await podRow.getByText(name).click();
    return new PodDetailsPage(this.page, name);
  }

  async getPodRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    const podsTable = await this.getTable();
    const rows = await podsTable.getByRole('row').all();
    for (const row of rows) {
      // test on empty row - contains on 0th position &nbsp; character (ISO 8859-1 character set: 160)
      const zeroCell = await row.getByRole('cell').nth(0).innerText();
      if (zeroCell.indexOf(String.fromCharCode(160)) === 0) {
        continue;
      }
      const nameCell = await row.getByRole('cell').nth(3).innerText();
      const index = nameCell.indexOf(name);
      if (index >= 0) {
        return row;
      }
    }
  }

  async podExists(name: string): Promise<boolean> {
    return (await this.getPodRowByName(name)) !== undefined ? true : false;
  }
}
