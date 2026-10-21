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

import { type Locator, type Page, test } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { waitUntil } from '/@/utility/wait';

import { BasePage } from './base-page';

/**
 * Abstract representation of a visual page objects of the main content pages of Podman Desktop app: Images,
 * Containers, Volumes and Pods.
 * Is not intended to be directly used, but rather by particular page's implementation.
 */
export abstract class MainPage extends BasePage {
  readonly title: string;
  readonly mainPage: Locator;
  readonly header: Locator;
  readonly search: Locator;
  readonly content: Locator;
  readonly additionalActions: Locator;
  readonly bottomAdditionalActions: Locator;
  readonly heading: Locator;
  readonly noContainerEngineHeading: Locator;
  readonly noImagesHeading: Locator;
  readonly rowTable: Locator;
  readonly searchInput: Locator;
  readonly environmentDropdown: Locator;

  constructor(page: Page, title: string) {
    super(page);
    this.title = title;
    this.mainPage = page.getByRole('region', { name: this.title });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.search = this.mainPage.getByRole('region', { name: 'search' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.additionalActions = this.header.getByRole('group', {
      name: 'additionalActions',
    });
    this.bottomAdditionalActions = this.search.getByRole('group', {
      name: 'bottomAdditionalActions',
    });
    this.heading = this.header.getByRole('heading', { name: this.title });
    this.noContainerEngineHeading = this.content.getByRole('heading', {
      name: 'No Container Engine',
      exact: true,
    });
    this.noImagesHeading = this.content.getByRole('heading', {
      name: `No ${this.title}`,
      exact: true,
    });
    this.rowTable = this.content.getByRole('table');
    this.searchInput = this.search.getByLabel(`search ${this.title}`);
    this.environmentDropdown = this.bottomAdditionalActions.getByLabel('Environment');
  }

  /**
   * Check the presence of items in main page's content.
   * @returns true, if there are any items present in the content's table, false otherwise
   */
  async pageIsEmpty(): Promise<boolean> {
    return test.step('Check if the page is empty', async () => {
      if (await this.noContainerEngine()) return true;
      return (await this.noImagesHeading.count()) > 0;
    });
  }

  async noContainerEngine(): Promise<boolean> {
    return test.step('Check if there is no container engine', async () => {
      return (await this.noContainerEngineHeading.count()) > 0;
    });
  }

  async rowsAreVisible(): Promise<boolean> {
    return await this.page.getByRole('row').first().isVisible();
  }

  async getAllTableRows(): Promise<Locator[]> {
    return await this.rowTable.getByRole('row').all();
  }

  async getRowsFromTableByStatus(status: string): Promise<Locator[]> {
    return test.step(`Get rows from ${this.title} page table by status: ${status}`, async () => {
      await waitUntil(async () => await this.rowsAreVisible(), {
        sendError: false,
      });

      const rows = await this.getAllTableRows();
      const filteredRows = [];
      for (let rowNum = 1; rowNum < rows.length; rowNum++) {
        //skip header
        const statusCount = await rows[rowNum].getByRole('cell').nth(2).getByTitle(status, { exact: true }).count();
        if (statusCount > 0) filteredRows.push(rows[rowNum]);
      }
      return filteredRows;
    });
  }

  async countRowsFromTable(): Promise<number> {
    return test.step(`Count rows from ${this.title} page table`, async () => {
      await waitUntil(async () => await this.rowsAreVisible(), {
        sendError: false,
      });
      const table = this.content.getByRole('table');
      const rows = await table.getByRole('row').all();
      return rows.length > 1 ? rows.length - 1 : 0;
    });
  }

  async getRowByName(name: string, exact = true): Promise<Locator | undefined> {
    return test.step(`Get row from ${this.title} page table by name: ${name}`, async () => {
      const locator = this.page
        .getByRole('row')
        .and(this.page.getByLabel(name, { exact: exact }))
        .first();

      return (await locator.count()) > 0 ? locator : undefined;
    });
  }

  async waitForRowToExists(name: string, timeout = 5_000): Promise<boolean> {
    return test.step(`Wait for row with name: ${name} to exist`, async () => {
      await waitUntil(async () => (await this.getRowByName(name)) !== undefined, { timeout: timeout });
      return true;
    });
  }

  async waitForRowToBeDelete(name: string, timeout = 5_000): Promise<boolean> {
    return test.step(`Wait for row with name: ${name} to be deleted`, async () => {
      await waitUntil(async () => (await this.getRowByName(name)) === undefined, { timeout: timeout });
      return true;
    });
  }

  async uncheckAllRows(): Promise<void> {
    return test.step(`Uncheck all rows on ${this.title} page`, async () => {
      try {
        const toggle = await this.getToggleLocator();

        if ((await toggle.innerHTML()).includes('pd-input-checkbox-indeterminate')) {
          await toggle.click();
        }

        if ((await toggle.innerHTML()).includes('pd-input-checkbox-checked')) {
          await toggle.click();
        }

        await playExpect
          .poll(async () => await toggle.innerHTML(), { timeout: 15_000 })
          .toContain('pd-input-checkbox-unchecked');
      } catch (err) {
        console.log(`Exception caught on ${this.title} page when checking cells for unchecking with message: ${err}`);
        throw err;
      }
    });
  }

  async checkAllRows(): Promise<void> {
    return test.step(`Checks all rows on ${this.title} page`, async () => {
      try {
        const toggle = await this.getToggleLocator();

        if ((await toggle.innerHTML()).includes('pd-input-checkbox-unchecked')) {
          await toggle.click();
        }

        await playExpect
          .poll(async () => toggle.innerHTML(), { timeout: 15_000 })
          .toContain('pd-input-checkbox-checked');
      } catch (err) {
        console.log(`Exception caught on containers page when checking cells with message: ${err}`);
        throw err;
      }
    });
  }

  private async getToggleLocator(): Promise<Locator> {
    await playExpect(this.rowTable).toBeVisible();
    const controlRow = this.rowTable.getByRole('row').first();
    await playExpect(controlRow).toBeAttached();
    const checkboxColumnHeader = controlRow.getByRole('columnheader').nth(1);
    await playExpect(checkboxColumnHeader).toBeAttached();
    const toggle = checkboxColumnHeader.getByTitle('Toggle all');
    await playExpect(toggle).toBeAttached();

    return toggle;
  }

  async filterByName(name: string): Promise<void> {
    return test.step(`Filter ${this.title} by name: ${name}`, async () => {
      await playExpect(this.searchInput).toBeVisible();
      await this.searchInput.fill(name);
      await playExpect(this.searchInput).toHaveValue(name);
    });
  }

  async clearFilterByName(): Promise<void> {
    return test.step(`Clear name filter on ${this.title} page`, async () => {
      await playExpect(this.searchInput).toBeVisible();
      await this.searchInput.clear();
      await playExpect(this.searchInput).toHaveValue('');
    });
  }

  async filterByEnvironment(environment: string): Promise<void> {
    return test.step(`Filter ${this.title} by environment: ${environment}`, async () => {
      await playExpect(this.environmentDropdown).toBeVisible();
      await this.environmentDropdown.click();
      const option = this.environmentDropdown.getByRole('button', { name: environment, exact: true });
      await playExpect(option).toBeVisible();
      await option.click();
    });
  }

  async clearFilterByEnvironment(): Promise<void> {
    return test.step(`Clear environment filter on ${this.title} page`, async () => {
      await this.filterByEnvironment('All');
    });
  }

  async isEnvironmentFilterVisible(): Promise<boolean> {
    return test.step(`Check if environment filter is visible on ${this.title} page`, async () => {
      return await this.environmentDropdown.isVisible();
    });
  }
}
