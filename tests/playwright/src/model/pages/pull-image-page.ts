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
import { ImageDetailsPage } from './image-details-page';
import { ImagesPage } from './images-page';
import { RunImagePage } from './run-image-page';

export class PullImagePage extends BasePage {
  readonly heading: Locator;
  readonly pullImageButton: Locator;
  readonly closeLink: Locator;
  readonly backToImagesLink: Locator;
  readonly manageRegistriesButton: Locator;
  readonly imageNameInput: Locator;
  readonly tabContent: Locator;
  readonly searchResultsTable: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly viewDetailsButton: Locator;
  readonly runButton: Locator;
  readonly pullErrorMessage: Locator;
  readonly containerEngineDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {
      name: 'Pull an Image From a Registry',
    });
    this.pullImageButton = page.getByRole('button', { name: 'Pull' });
    this.closeLink = page.getByRole('link', { name: 'Close' });
    this.backToImagesLink = page.getByRole('link', {
      name: 'Go back to Images',
    });
    this.manageRegistriesButton = page.getByRole('button', {
      name: 'Manage registries',
    });
    this.imageNameInput = page.getByLabel('Image to Pull');
    this.tabContent = page.getByRole('region', {
      name: 'Tab Content',
      exact: true,
    });
    this.searchResultsTable = this.tabContent.getByRole('row');
    this.closeButton = this.tabContent.getByRole('button', { name: 'Close', exact: true });
    this.cancelButton = this.tabContent.getByRole('button', { name: 'Cancel', exact: true });
    this.viewDetailsButton = this.tabContent.getByRole('button', { name: 'View details', exact: true });
    this.runButton = this.tabContent.getByRole('button', { name: 'Run', exact: true });
    this.pullErrorMessage = page.getByRole('alert').filter({ hasText: 'no running provider' });
    this.containerEngineDropdown = this.tabContent.getByLabel('Container Engine');
  }

  async pullImage(imageName: string, tag = '', timeout = 60_000, connectionName?: string): Promise<ImagesPage> {
    return test.step(`Pulling image ${imageName}:${tag}`, async () => {
      if (connectionName) await this.selectContainerEngine(connectionName);
      await this.startPull(imageName, tag);
      await this.waitForPullCompletion(timeout);
      await this.closeButton.click();
      return new ImagesPage(this.page);
    });
  }

  async selectContainerEngine(connectionName: string): Promise<void> {
    return test.step(`Select container engine: ${connectionName}`, async () => {
      await playExpect(this.containerEngineDropdown).toBeVisible();
      await this.containerEngineDropdown.click();
      const option = this.page.getByRole('button', { name: connectionName, exact: true });
      await playExpect(option).toBeVisible();
      await option.click();
    });
  }

  async pullImageAndViewDetails(imageName: string, tag = '', timeout = 60_000): Promise<ImageDetailsPage> {
    return test.step(`Pull image and view details ${imageName}:${tag}`, async () => {
      const fullImageName = this.buildFullImageName(imageName, tag);
      await this.startPull(imageName, tag);
      await this.waitForPullCompletion(timeout);
      await this.viewDetailsButton.click();
      return new ImageDetailsPage(this.page, fullImageName);
    });
  }

  async pullImageAndRun(imageName: string, tag = '', timeout = 60_000): Promise<RunImagePage> {
    return test.step(`Pull image and run ${imageName}:${tag}`, async () => {
      const fullImageName = this.buildFullImageName(imageName, tag);
      await this.startPull(imageName, tag);
      await this.waitForPullCompletion(timeout);
      await this.runButton.click();
      return new RunImagePage(this.page, fullImageName);
    });
  }

  /**
   * Starts a pull without waiting for it to complete. Useful when the pull is expected to
   * never finish (e.g. a stub proxy that never forwards traffic to the real registry).
   */
  async startPullOnly(imageName: string, tag = ''): Promise<void> {
    return test.step(`Starting pull of image ${imageName}:${tag} without waiting for completion`, async () => {
      await this.startPull(imageName, tag);
    });
  }

  async cancelPullImage(imageName: string, tag = ''): Promise<PullImagePage> {
    return test.step(`Cancel pulling image ${imageName}:${tag}`, async () => {
      await this.startPull(imageName, tag);
      await playExpect(this.cancelButton).toBeEnabled();
      await this.cancelButton.click();
      await playExpect(this.pullImageButton).toBeEnabled();
      await playExpect(this.cancelButton).not.toBeVisible();
      return this;
    });
  }

  async getAllSearchResultsFor(
    imageName: string,
    searchForVersion: boolean,
    imageTag = '',
    resultsExpected = true,
  ): Promise<string[]> {
    return test.step(`Get all search results for ${imageName}:${imageTag}`, async () => {
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
    return test.step(`Get first search result for ${imageName}:${imageTag}`, async () => {
      await this.handleFormAndResultSearchString(imageName, searchForVersion, imageTag, resultsExpected);
      return await this.getFirstSearchResultInstantly();
    });
  }

  async refineSearchResults(stringToAppend: string, resultsExpected = true): Promise<string[]> {
    return test.step(`Refine search results by appending: ${stringToAppend}`, async () => {
      await this.imageNameInput.pressSequentially(stringToAppend, {
        delay: 10,
      });
      const searchString = await this.imageNameInput.inputValue();

      if (resultsExpected) {
        await playExpect(this.searchResultsTable).toBeVisible({
          timeout: 15_000,
        });
        await playExpect
          .poll(async () => await this.getFirstSearchResultInstantly(), {
            timeout: 10_000,
          })
          .toContain(searchString);
      } else {
        await playExpect(this.searchResultsTable).not.toBeVisible({
          timeout: 15_000,
        });
      }

      return await this.getAllSearchResultsInstantly(searchString);
    });
  }

  async getAllSearchResultsInstantly(searchString: string): Promise<string[]> {
    return test.step(`Get search results instantly for ${searchString}`, async () => {
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
    return test.step('Get first search result from the results table', async () => {
      const resultRow = this.getFirstResultButtonLocator();
      return await resultRow.innerText();
    });
  }

  async pullImageFromSearchResults(pattern: string, timeout = 60_000): Promise<ImagesPage> {
    return test.step(`Pull image from search results: ${pattern}`, async () => {
      await this.startPullFromSearchResults(pattern);
      await this.waitForPullCompletion(timeout);
      await this.closeButton.click();
      return new ImagesPage(this.page);
    });
  }

  async pullImageFromSearchResultsAndViewDetails(pattern: string, timeout = 60_000): Promise<ImageDetailsPage> {
    return test.step(`Pull image from search results and view details: ${pattern}`, async () => {
      await this.startPullFromSearchResults(pattern);
      await this.waitForPullCompletion(timeout);
      await this.viewDetailsButton.click();
      return new ImageDetailsPage(this.page, this.extractImageName(pattern));
    });
  }

  async pullImageFromSearchResultsAndRun(pattern: string, timeout = 60_000): Promise<RunImagePage> {
    return test.step(`Pull image from search results and run: ${pattern}`, async () => {
      await this.startPullFromSearchResults(pattern);
      await this.waitForPullCompletion(timeout);
      await this.runButton.click();
      return new RunImagePage(this.page, this.extractImageName(pattern));
    });
  }

  async selectValueFromSearchResults(pattern: string): Promise<void> {
    return test.step(`Select value from search results: ${pattern}`, async () => {
      const getExactButtonLocator = this.searchResultsTable.getByRole('button', { name: pattern, exact: true }).first();

      await getExactButtonLocator.scrollIntoViewIfNeeded();
      await getExactButtonLocator.focus();

      await playExpect(getExactButtonLocator).toBeEnabled();
      await getExactButtonLocator.click();

      await playExpect(this.imageNameInput).toHaveValue(pattern);
    });
  }

  async clearImageSearch(): Promise<void> {
    return test.step('Clear image search', async () => {
      await this.imageNameInput.clear();
      await playExpect(this.imageNameInput).toHaveValue('');
      await playExpect(this.searchResultsTable).not.toBeVisible();
    });
  }

  private buildFullImageName(imageName: string, tag: string): string {
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    return `${imageName}${tag.length === 0 ? '' : `:${tag}`}`;
  }

  private extractImageName(pattern: string): string {
    const lastColon = pattern.lastIndexOf(':');
    if (lastColon === -1 || pattern.indexOf('/', lastColon) !== -1) {
      return pattern;
    }
    return pattern.substring(0, lastColon);
  }

  private async startPull(imageName: string, tag: string): Promise<void> {
    const fullImageName = this.buildFullImageName(imageName, tag);
    await this.imageNameInput.fill(fullImageName);
    await playExpect(this.imageNameInput).toHaveValue(fullImageName);
    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();
  }

  private async startPullFromSearchResults(pattern: string): Promise<void> {
    await this.selectValueFromSearchResults(pattern);
    await playExpect(this.pullImageButton).toBeEnabled();
    await this.pullImageButton.click();
  }

  private async waitForPullCompletion(timeout: number, maxRetries = 3): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      await this.page.waitForTimeout(2_000);
      const errorAppeared = await this.pullErrorMessage.isVisible();

      if (!errorAppeared) break;

      console.log(`Pull failed with "no running provider" error (attempt ${attempt + 1}/${maxRetries}), retrying...`);
      await playExpect(this.pullImageButton).toBeEnabled();
      await this.pullImageButton.click();
    }

    await playExpect(this.closeButton).toBeEnabled({ timeout });
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
    return test.step(`Handle form and result search string for ${imageName}:${imageTag}`, async () => {
      if (!imageName || imageName.length === 0) {
        throw new Error('Image name is invalid');
      }

      let searchString: string;

      if (searchForVersion) {
        searchString = `${imageName}:${imageTag}`;
      } else {
        searchString = imageName;
      }

      await this.clearImageSearch();
      await this.imageNameInput.fill(searchString);

      if (resultsExpected) {
        await playExpect(this.searchResultsTable).toBeVisible({
          timeout: 30_000,
        });
      } else {
        await playExpect(this.searchResultsTable).not.toBeVisible({
          timeout: 15_000,
        });
      }
      return searchString;
    });
  }
}
