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

import { expect as playExpect } from '@playwright/test';
import type { Locator, Page } from 'playwright';

import { SettingsPage } from './settings-page';

export class CLIToolsPage extends SettingsPage {
  readonly main: Locator;
  readonly header: Locator;
  readonly content: Locator;
  readonly heading: Locator;
  readonly toolsTable: Locator;
  readonly dropDownDialog: Locator;
  readonly versionInputField: Locator;

  constructor(page: Page) {
    super(page, 'CLI Tools');
    this.main = page.getByRole('region', { name: 'CLI Tools' }); //check name
    this.header = this.main.getByRole('region', { name: 'Header' });
    this.heading = this.header.getByRole('heading', { name: 'CLI Tools', exact: true });
    this.content = this.main.getByRole('region', { name: 'Content' });
    this.toolsTable = this.content.getByRole('table', { name: 'cli-tools' });
    this.dropDownDialog = page.getByRole('dialog', {
      name: 'drop-down-dialog',
    });
    this.versionInputField = this.dropDownDialog.getByRole('textbox');
  }

  public getToolRow(toolName: string): Locator {
    return this.toolsTable.getByRole('row', { name: toolName, exact: true });
  }

  public getInstallButton(toolName: string): Locator {
    return this.getToolRow(toolName).getByLabel('Install', { exact: true });
  }

  public getUninstallButton(toolName: string): Locator {
    return this.getToolRow(toolName).getByLabel('Uninstall', { exact: true });
  }

  public getUpdateButton(toolName: string): Locator {
    return this.getToolRow(toolName).getByLabel('Update', { exact: true });
  }

  public getVersionSelectionButton(version: string): Locator {
    return this.dropDownDialog.getByRole('button', { name: version });
  }

  public async getCurrentToolVersion(toolName: string): Promise<string> {
    if ((await this.getToolRow(toolName).getByLabel('no-cli-version', { exact: true }).count()) > 0) {
      return '';
    }

    return await this.getToolRow(toolName).getByLabel('cli-version', { exact: true }).innerText();
  }

  public async installTool(toolName: string, version: string = ''): Promise<this> {
    await playExpect(this.getInstallButton(toolName)).toBeEnabled();
    await this.getInstallButton(toolName).click();
    await playExpect(this.dropDownDialog).toBeVisible();
    if (!version) {
      version = await this.getLatestVersionNumber();
    }

    await playExpect(this.getVersionSelectionButton(version)).toBeEnabled();
    await this.getVersionSelectionButton(version).click();
    return this;
  }

  private async getLatestVersionNumber(): Promise<string> {
    return await this.dropDownDialog.getByRole('button').first().innerText();
  }
}
