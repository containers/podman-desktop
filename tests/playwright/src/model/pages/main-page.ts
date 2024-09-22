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

import { waitUntil } from '../../utility/wait';
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

  constructor(page: Page, title: string) {
    super(page);
    this.title = title;
    this.mainPage = page.getByRole('region', { name: this.title });
    this.header = this.mainPage.getByRole('region', { name: 'header' });
    this.search = this.mainPage.getByRole('region', { name: 'search' });
    this.content = this.mainPage.getByRole('region', { name: 'content' });
    this.additionalActions = this.header.getByRole('group', { name: 'additionalActions' });
    this.bottomAdditionalActions = this.header.getByRole('group', { name: 'bottomAdditionalActions' });
    this.heading = this.header.getByRole('heading', { name: this.title });
    this.noContainerEngineHeading = this.content.getByRole('heading', { name: 'No Container Engine', exact: true });
    this.noImagesHeading = this.content.getByRole('heading', { name: `No ${this.title}`, exact: true });
  }

  /**
   * Check the presence of items in main page's content.
   * @returns true, if there are any items present in the content's table, false otherwise
   */
  async pageIsEmpty(): Promise<boolean> {
    return await test.step('Check if the page is empty', async () => {
      if (await this.noContainerEngine()) return true;
      return (await this.noImagesHeading.count()) > 0;
    });
  }

  async noContainerEngine(): Promise<boolean> {
    return await test.step('Check if there is no container engine', async () => {
      return (await this.noContainerEngineHeading.count()) > 0;
    });
  }

  async getTable(): Promise<Locator> {
    return this.content.getByRole('table');
  }

  async rowsAreVisible(): Promise<boolean> {
    return await this.page.getByRole('row').first().isVisible();
  }

  async getAllTableRows(): Promise<Locator[]> {
    return await (await this.getTable()).getByRole('row').all();
  }

  async getRowFromTableByName(name: string): Promise<Locator | undefined> {
    return await test.step(`Get row from ${this.title} page table by name: ${name}`, async () => {
      if (await this.pageIsEmpty()) {
        return undefined;
      }

      try {
        const rows = await this.getAllTableRows();
        for (let i = rows.length - 1; i >= 0; i--) {
          const nameCell = await rows[i].getByRole('cell').nth(3).getByText(name, { exact: true }).count();
          if (nameCell) {
            return rows[i];
          } else if (this.title === 'containers') {
            const subRow = await rows[i].getByLabel(name, { exact: true }).count();
            if (subRow) {
              return rows[i];
            }
          }
        }
      } catch (err) {
        console.log(`Exception caught on ${this.title} page with message: ${err}`);
      }
      return undefined;
    });
  }

  async getRowsFromTableByStatus(status: string): Promise<Locator[]> {
    return await test.step(`Get rows from ${this.title} page table by status: ${status}`, async () => {
      await waitUntil(async () => await this.rowsAreVisible(), { sendError: false });

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
    return await test.step(`Count rows from ${this.title} page table`, async () => {
      await waitUntil(async () => await this.rowsAreVisible(), { sendError: false });
      const table = this.content.getByRole('table');
      const rows = await table.getByRole('row').all();
      return rows.length > 1 ? rows.length - 1 : 0;
    });
  }
}
