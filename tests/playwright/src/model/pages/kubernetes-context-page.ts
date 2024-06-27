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

import { handleConfirmationDialog } from '../../utility/operations';
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

  async getContextRowByName(name: string): Promise<Locator> {
    return this.contextTable.getByLabel(name, { exact: true });
  }

  async isContextDefault(name: string): Promise<boolean> {
    const row = await this.getContextRowByName(name);
    if (row === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const bannerText = await row.getByLabel('Current Context').textContent();

    return bannerText === 'Current Context';
  }

  async isContextReachable(name: string): Promise<boolean> {
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

  async deleteContext(name: string, handleConfirmation: boolean = true): Promise<void> {
    const contextRow = await this.getContextRowByName(name);
    if (contextRow === undefined) {
      throw Error(`Context: '${name}' does not exist`);
    }
    const deleteButton = contextRow.getByLabel('Delete Context');
    await playExpect(deleteButton).toBeEnabled();
    await deleteButton.click();
    if (handleConfirmation) {
      await handleConfirmationDialog(this.page, 'Delete Context');
    }
  }
  async getContextName(context: string): Promise<string> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Context Name', { exact: true }).innerText();
  }

  async getContextCluster(context: string): Promise<string> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Context Cluster').innerText();
  }

  async getContextServer(context: string): Promise<string> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Context Server').innerText();
  }

  async getContextUser(context: string): Promise<string> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Context User').innerText();
  }

  async getContextNamespace(context: string): Promise<string> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Context Namespace').innerText();
  }

  async getSetCurrentContextButton(context: string): Promise<Locator> {
    const row = await this.getContextRowByName(context);
    return row.getByLabel('Set as Current Context');
  }
}
