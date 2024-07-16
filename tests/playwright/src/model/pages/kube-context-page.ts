/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { SettingsPage } from './settings-page';

export class KubeContextPage extends SettingsPage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly contextTable: Locator;

  constructor(page: Page) {
    super(page, 'Kubernetes');
    this.heading = this.page.getByLabel('Title', { exact: true });
    this.content = this.page.getByLabel('Content');
    this.contextTable = this.content.getByLabel('Contexts');
  }

  async pageIsEmpty(): Promise<boolean> {
    const emptyHeading = this.page.getByRole('heading', { name: 'No Kubernetes contexts found', exact: true });
    return (await emptyHeading.count()) > 0;
  }

  async getContextRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    return this.contextTable.getByLabel(name, { exact: true });
  }

  async contextDefault(name: string): Promise<boolean> {
    const row = await this.getContextRowByName(name);
    if (row === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const defaultContextBanner = row.getByLabel('Current Context');
    const bannerText = await defaultContextBanner.textContent();

    return bannerText === 'Current Context';
  }

  async contextReachable(name: string): Promise<boolean> {
    const row = await this.getContextRowByName(name);
    if (row === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const contextReachable = row.getByLabel('Context Reachable');

    return (await contextReachable.count()) > 0;
  }

  async setDefaultContext(name: string): Promise<void> {
    const contextRow = await this.getContextRowByName(name);
    if (contextRow === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const switchButton = contextRow.getByLabel('Set as Current Context');
    await playExpect(switchButton).toBeEnabled();
    await switchButton.click();
  }

  async handleConfirmationDialog(): Promise<void> {
    const confirmationDialog = this.page.getByLabel('Delete Context').filter({ hasText: 'Continue' });
    if ((await confirmationDialog.count()) > 0) {
      const confirmationButton = confirmationDialog.getByRole('button').nth(2);
      await playExpect(confirmationButton).toBeEnabled();
      await confirmationButton.click();
    }
  }

  async deleteContext(name: string): Promise<void> {
    const contextRow = await this.getContextRowByName(name);
    if (contextRow === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const deleteButton = contextRow.getByLabel('Delete Context');
    await playExpect(deleteButton).toBeEnabled();
    await deleteButton.click();
    await this.handleConfirmationDialog();
  }
}
