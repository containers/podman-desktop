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
  }

  /**
   * Check the presence of items in main page's content.
   * @returns true, if there are any items present in the content's table, false otherwise
   */
  async pageIsEmpty(): Promise<boolean> {
    if (await this.noContainerEngine()) return true;

    const noImagesHeading = this.content.getByRole('heading', { name: `No ${this.title}`, exact: true });
    return (await noImagesHeading.count()) > 0;
  }

  async noContainerEngine(): Promise<boolean> {
    const noContainerEngineHeading = this.content.getByRole('heading', { name: 'No Container Engine', exact: true });

    return (await noContainerEngineHeading.count()) > 0;
  }

  async getTable(): Promise<Locator> {
    if (await this.pageIsEmpty()) throw Error('Page is empty, there is no content');

    return this.content.getByRole('table');
  }

  async getRowFromTableByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }

    try {
      const table = await this.getTable();
      const rows = await table.getByRole('row').all();
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
  }
}
