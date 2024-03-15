/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { handleConfirmationDialog } from '../../utility/operations';
import { ContainerState } from '../core/states';
import { ContainerDetailsPage } from './container-details-page';
import { CreatePodsPage } from './create-pod-page';
import { MainPage } from './main-page';

export class ContainersPage extends MainPage {
  readonly pruneContainersButton: Locator;
  readonly createContainerButton: Locator;
  readonly playKubernetesYAMLButton: Locator;
  readonly pruneConfirmationButton: Locator;

  constructor(page: Page) {
    super(page, 'containers');
    this.pruneContainersButton = this.additionalActions.getByRole('button', { name: 'Prune' });
    this.createContainerButton = this.additionalActions.getByRole('button', { name: 'Create' });
    this.playKubernetesYAMLButton = this.additionalActions.getByRole('button', { name: 'Play Kubernetes YAML' });
    this.pruneConfirmationButton = this.page.getByRole('button', { name: 'Yes' });
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

  async stopContainer(container: string): Promise<ContainerDetailsPage> {
    const containerDetailsPage = await this.openContainersDetails(container);
    await playExpect(containerDetailsPage.heading).toBeVisible();
    await playExpect(containerDetailsPage.heading).toContainText(container);
    playExpect(await containerDetailsPage.getState()).toContain(ContainerState.Running);
    await containerDetailsPage.stopContainer();
    return containerDetailsPage;
  }

  async getContainerRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    let containersTable;
    try {
      containersTable = await this.getTable();
      const rows = await containersTable.getByRole('row').all();

      for (let i = rows.length - 1; i >= 0; i--) {
        const thirdCell = await rows[i].getByRole('cell').nth(3).getByText(name, { exact: true }).count();

        if (thirdCell) {
          return rows[i];
        }
      }
    } catch (err) {
      console.log(`Exception caught on containers page with message: ${err}`);
    }
    return undefined;
  }

  async uncheckAllContainers(): Promise<void> {
    let containersTable;
    try {
      containersTable = await this.getTable();
      const rows = await containersTable.getByRole('row').all();

      for (let i = rows.length - 1; i >= 0; i--) {
        const zeroCell = await rows[i].getByRole('cell').nth(0).innerText({ timeout: 1000 });
        if (zeroCell.indexOf(String.fromCharCode(160)) === 0) continue;

        if (await rows[i].getByRole('checkbox').isChecked()) await rows[i].getByRole('cell').nth(1).click();
      }
    } catch (err) {
      console.log(`Exception caught on containers page when checking cells for unchecking with message: ${err}`);
    }
  }

  async containerExists(name: string): Promise<boolean> {
    return (await this.getContainerRowByName(name)) !== undefined;
  }

  async openCreatePodPage(names: string[]): Promise<CreatePodsPage> {
    for await (const containerName of names) {
      const row = await this.getContainerRowByName(containerName);
      if (row === undefined) {
        throw Error('Container cannot be podified');
      }
      await row.getByRole('cell').nth(1).click();
    }
    await this.page.getByRole('button', { name: `Create Pod` }).click();
    return new CreatePodsPage(this.page);
  }

  async pruneContainers(): Promise<ContainersPage> {
    await this.pruneContainersButton.click();
    await handleConfirmationDialog(this.page, 'Prune');
    return this;
  }
}
