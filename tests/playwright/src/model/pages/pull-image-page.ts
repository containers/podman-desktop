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
import test, { expect as playExpect } from '@playwright/test';

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
  readonly doneButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Pull Image From a Registry' });
    this.pullImageButton = page.getByRole('button', { name: 'Pull' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', { name: 'Go back to Images' });
    this.manageRegistriesButton = page.getByRole('button', { name: 'Manage registries' });
    this.imageNameInput = page.getByLabel('Image to Pull');
    this.tabContent = page.getByRole('region', { name: 'Tab Content', exact: true });
    this.searchResultsTable = this.tabContent.getByRole('row');
    this.doneButton = page.getByRole('button', { name: 'Done', exact: true });
  }

  async pullImage(imageName: string, tag = '', timeout = 60_000): Promise<ImagesPage> {
    return test.step(`Pulling image ${imageName}:${tag}`, async () => {
      const fullImageName = `${imageName}${tag.length === 0 ? '' : ':' + tag}`;
      await this.imageNameInput.fill(fullImageName);
      await playExpect(this.pullImageButton).toBeEnabled();
      await this.pullImageButton.click();

      await playExpect(this.doneButton).toBeEnabled({ timeout: timeout });
      await this.doneButton.click();
      return new ImagesPage(this.page);
    });
  }

  async getAllSearchResultsFor(
    imageName: string,
    searchForVersion: boolean,
    imageTag = '',
    resultsExpected = true,
  ): Promise<string[]> {
    return await test.step(`Get all search results for ${imageName}:${imageTag}`, async () => {
      const searchString = await this.handleFormAndResultSearchString(
        imageName,
        searchForVersion,
        imageTag,
        resultsExpected,
      );
      return await this.getAllSearchResultsInstantly(searchString);
    });
  }

  async getFirstSearchResultFor(
    imageName: string,
    searchForVersion: boolean,
    imageTag = '',
    resultsExpected = true,
  ): Promise<string> {
    return await test.step(`Get first search result for ${imageName}:${imageTag}`, async () => {
      await this.handleFormAndResultSearchString(imageName, searchForVersion, imageTag, resultsExpected);
      return await this.getFirstSearchResultInstantly();
    });
  }

  async refineSearchResults(stringToAppend: string, resultsExpected = true): Promise<string[]> {
    return await test.step(`Refine search results by appending: ${stringToAppend}`, async () => {
      await this.imageNameInput.pressSequentially(stringToAppend, { delay: 10 });
      const searchString = await this.imageNameInput.inputValue();

      if (resultsExpected) {
        await playExpect(this.searchResultsTable).toBeVisible({ timeout: 15_000 });
        await playExpect
          .poll(async () => await this.getFirstSearchResultInstantly(), { timeout: 10_000 })
          .toContain(searchString);
      } else {
        await playExpect(this.searchResultsTable).not.toBeVisible({ timeout: 15_000 });
      }

      return await this.getAllSearchResultsInstantly(searchString);
    });
  }

  async getAllSearchResultsInstantly(searchString: string): Promise<string[]> {
    return await test.step(`Get search results instantly for ${searchString}`, async () => {
      const resultList: string[] = [];
      const resultRows = await this.getAllResultButtonLocators(searchString);
      for (const row of resultRows) {
        const result = await row.innerText();
        resultList.push(result);
      }
      console.log(`Found ${resultList.length} results for ${searchString}`);
      return resultList;
    });
  }

  async getFirstSearchResultInstantly(): Promise<string> {
    return await test.step(`Get first search result from the results table`, async () => {
      const resultRow = this.getFirstResultButtonLocator();
      return await resultRow.innerText();
    });
  }

  async pullImageFromSearchResults(pattern: string, timeout = 60_000): Promise<ImagesPage> {
    return await test.step(`Pull image from search results: ${pattern}`, async () => {
      await this.selectValueFromSearchResults(pattern);
      await playExpect(this.pullImageButton).toBeEnabled();
      await this.pullImageButton.click();

      await playExpect(this.doneButton).toBeEnabled({ timeout: timeout });
      await this.doneButton.click();
      return new ImagesPage(this.page);
    });
  }

  async selectValueFromSearchResults(pattern: string): Promise<void> {
    await test.step(`Select value from search results: ${pattern}`, async () => {
      const getExactButtonLocator = this.searchResultsTable.getByRole('button', { name: pattern, exact: true }).first();

      await getExactButtonLocator.scrollIntoViewIfNeeded();
      await getExactButtonLocator.focus();

      await playExpect(getExactButtonLocator).toBeEnabled();
      await getExactButtonLocator.click();

      await playExpect(this.imageNameInput).toHaveValue(pattern);
    });
  }

  async clearImageSearch(): Promise<void> {
    await test.step('Clear image search', async () => {
      await this.imageNameInput.clear();
      await playExpect(this.imageNameInput).toHaveValue('');
      await playExpect(this.searchResultsTable).not.toBeVisible();
    });
  }

  private getAllResultButtonLocators(pattern: string): Promise<Locator[]> {
    return this.searchResultsTable.getByRole('button', { name: pattern }).all();
  }

  private getFirstResultButtonLocator(): Locator {
    return this.searchResultsTable.getByRole('button').first();
  }

  private async handleFormAndResultSearchString(
    imageName: string,
    searchForVersion: boolean,
    imageTag = '',
    resultsExpected = true,
  ): Promise<string> {
    if (!imageName || imageName.length === 0) {
      throw new Error('Image name is invalid');
    }

    let searchString;

    if (searchForVersion) {
      searchString = `${imageName}:${imageTag}`;
    } else {
      searchString = imageName;
    }

    await this.clearImageSearch();
    await this.imageNameInput.fill(searchString);

    if (resultsExpected) {
      await playExpect(this.searchResultsTable).toBeVisible({ timeout: 15_000 });
    } else {
      await playExpect(this.searchResultsTable).not.toBeVisible({ timeout: 15_000 });
    }
    return searchString;
  }
}
