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
import { expect as playExpect } from '@playwright/test';

import { BasePage } from './base-page';
import { ImagesPage } from './images-page';

export class PullImagePage extends BasePage {
  readonly heading: Locator;
  readonly pullImageButton: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly manageRegistriesButton: Locator;
  readonly imageNameInput: Locator;
  readonly tabContent: Locator;
  readonly searchResultsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    this.pullImageButton = page.getByRole('button', { name: 'Pull' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
    this.imageNameInput = page.getByLabel('Image to Pull');
    this.tabContent = page.getByRole('region', { name: 'Tab content', exact: true });
    this.searchResultsTable = this.tabContent.getByRole('row');
  }

  async pullImage(imageName: string, tag = '', timeout = 60_000): Promise<ImagesPage> {
    const fullImageName = `${imageName}${tag.length === 0 ? '' : ':' + tag}`;
    await this.imageNameInput.fill(fullImageName);
    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();

    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await playExpect(doneButton).toBeEnabled({ timeout: timeout });
    await doneButton.click();
    return new ImagesPage(this.page);
  }

  async getAllSearchResultsFor(imageName: string, searchForVersion: boolean, imageTag = ''): Promise<string[]> {
    if (!imageName || imageName.length === 0) {
      throw new Error('Image name is invalid');
    }

    let searchString;

    if (searchForVersion) {
      searchString = `${imageName}:${imageTag}`;
    } else {
      searchString = imageName;
    }

    await this.imageNameInput.fill(searchString);
    await playExpect(this.searchResultsTable).toBeVisible({ timeout: 15_000 });

    const resultList: string[] = [];
    const resultRows = await this.getAllResultButtonLocators(searchString);
    for (const row of resultRows) {
      const result = await row.innerText();
      resultList.push(result);
    }

    return resultList;
  }

  async pullImageFromSearchResults(pattern: string, timeout = 60_000): Promise<ImagesPage> {
    const getExactButtonLocator = this.searchResultsTable.getByRole('button', { name: pattern, exact: true }).first();

    await getExactButtonLocator.scrollIntoViewIfNeeded();
    await getExactButtonLocator.focus();

    await playExpect(getExactButtonLocator).toBeEnabled();
    await getExactButtonLocator.click();

    await playExpect(this.imageNameInput).toHaveText(pattern);
    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();

    const doneButton = this.page.getByRole('button', { name: 'Done' });
    await playExpect(doneButton).toBeEnabled({ timeout: timeout });
    await doneButton.click();
    return new ImagesPage(this.page);
  }

  private getAllResultButtonLocators(pattern: string): Promise<Locator[]> {
    return this.searchResultsTable.getByRole('button', { name: pattern }).all();
  }
}
