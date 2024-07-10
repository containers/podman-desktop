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

  async startContainer(containerName: string): Promise<ContainersPage> {
    const containerRow = await this.getContainerRowByName(containerName);
    if (containerRow === undefined) {
      throw Error(`Container: '${containerName}' does not exist`);
    }
    const containerRowStartButton = containerRow.getByRole('button', { name: 'Start Container' });
    await playExpect(containerRowStartButton).toBeVisible();
    await containerRowStartButton.click();
    return this;
  }

  async stopContainer(containerName: string): Promise<ContainersPage> {
    const containerRow = await this.getContainerRowByName(containerName);
    if (containerRow === undefined) {
      throw Error(`Container: '${containerName}' does not exist`);
    }
    const containerRowStopButton = containerRow.getByRole('button', { name: 'Stop Container' });
    await playExpect(containerRowStopButton).toBeVisible();
    await containerRowStopButton.click();
    return this;
  }

  async deleteContainer(containerName: string): Promise<ContainersPage> {
    const containerRow = await this.getContainerRowByName(containerName);
    if (containerRow === undefined) {
      throw Error(`Container: '${containerName}' does not exist`);
    }
    const containerRowDeleteButton = containerRow.getByRole('button', { name: 'Delete Container' });
    await playExpect(containerRowDeleteButton).toBeVisible();
    await playExpect(containerRowDeleteButton).toBeEnabled();
    await containerRowDeleteButton.click();
    await handleConfirmationDialog(this.page);
    return new ContainersPage(this.page);
  }

  async stopContainerFromDetails(container: string): Promise<ContainerDetailsPage> {
    const containerDetailsPage = await this.openContainersDetails(container);
    await playExpect(containerDetailsPage.heading).toBeVisible();
    await playExpect(containerDetailsPage.heading).toContainText(container);
    playExpect(await containerDetailsPage.getState()).toContain(ContainerState.Running.toLowerCase());
    await containerDetailsPage.stopContainer();
    return containerDetailsPage;
  }

  async getContainerRowByName(name: string): Promise<Locator | undefined> {
    return this.getRowFromTableByName(name);
  }

  async uncheckAllContainers(): Promise<void> {
    let containersTable;
    try {
      containersTable = await this.getTable();
      await playExpect(containersTable).toBeVisible();
      const controlRow = containersTable.getByRole('row').first();
      await playExpect(controlRow).toBeAttached();
      const checkboxColumnHeader = controlRow.getByRole('columnheader').nth(1);
      await playExpect(checkboxColumnHeader).toBeAttached();
      const containersToggle = checkboxColumnHeader.getByTitle('Toggle all');
      await playExpect(containersToggle).toBeAttached();
      // <svg> cannot be resolved using getByRole('img') ; const containersToggleSvg = containersToggle.getByRole('img');

      if ((await containersToggle.innerHTML()).includes('pd-input-checkbox-indeterminate')) {
        await containersToggle.click();
      }

      if ((await containersToggle.innerHTML()).includes('pd-input-checkbox-checked')) {
        await containersToggle.click();
      }

      playExpect(await containersToggle.innerHTML()).toContain('pd-input-checkbox-unchecked');
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
