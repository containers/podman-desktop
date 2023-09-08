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

import type { Locator, Page } from 'playwright';
import { MainPage } from './main-page';
import { ContainerDetailsPage } from './container-details-page';

export class ContainersPage extends MainPage {
  readonly pruneContainersButton: Locator;
  readonly createContainerButton: Locator;
  readonly playKubernetesYAMLButton: Locator;

  constructor(page: Page) {
    super(page, 'containers');
    this.pruneContainersButton = this.additionalActions.getByRole('button', { name: 'Prune containers' });
    this.createContainerButton = this.additionalActions.getByRole('button', { name: 'Create a container' });
    this.playKubernetesYAMLButton = this.additionalActions.getByRole('button', { name: 'Play Kubernetes YAML' });
  }

  async openContainersDetails(name: string): Promise<ContainerDetailsPage> {
    const containerRow = await this.getContainerRowByName(name);
    if (containerRow === undefined) {
      throw Error(`Container: '${name}' does not exist`);
    }
    const containerRowName = containerRow.getByRole('cell').nth(3);
    await containerRowName.click();
    return new ContainerDetailsPage(this.page, name);
  }

  async getContainerRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    const containersTable = await this.getTable();
    const rows = await containersTable.getByRole('row').all();
    for (const row of rows) {
      // test on empty row - contains on 0th position &nbsp; character (ISO 8859-1 character set: 160)
      const zeroCell = await row.getByRole('cell').nth(0).innerText({ timeout: 500 });
      if (zeroCell.indexOf(String.fromCharCode(160)) === 0) {
        continue;
      }
      let thirdCell = undefined;
      try {
        thirdCell = await row.getByRole('cell').nth(3).innerText({ timeout: 1000 });
      } catch (error) {
        thirdCell = await row.getByRole('cell').nth(3).allInnerTexts();
        console.log(`We got an timeout error on innertext, allinnerTexts: ${thirdCell}`);
      }
      const index = thirdCell.indexOf(name);
      if (index >= 0) {
        return row;
      }
    }
  }

  async containerExists(name: string): Promise<boolean> {
    return (await this.getContainerRowByName(name)) !== undefined ? true : false;
  }
}
