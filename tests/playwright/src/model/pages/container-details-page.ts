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

import { handleConfirmationDialog } from '../../utility/operations';
import { ContainerState } from '../core/states';
import { BasePage } from './base-page';
import { ContainersPage } from './containers-page';

export class ContainerDetailsPage extends BasePage {
  readonly labelName: Locator;
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly backToContainersLink: Locator;
  readonly containerName: string;
  readonly stopButton: Locator;
  readonly deleteButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly LOGS_TAB = 'Logs';
  static readonly KUBE_TAB = 'Kube';
  static readonly TERMINAL_TAB = 'Terminal';
  static readonly INSPECT_TAB = 'Inspect';

  constructor(page: Page, name: string) {
    super(page);
    this.containerName = name;
    this.labelName = page.getByLabel('name').and(page.getByText('Container Details'));
    this.heading = page.getByRole('heading', { name: this.containerName });
    this.closeLink = page.getByRole('link', { name: 'Close Details' });
    this.backToContainersLink = page.getByRole('link', { name: 'Go back to Containers' });
    this.stopButton = this.page.getByRole('button').and(this.page.getByLabel('Stop Container'));
    this.deleteButton = this.page.getByRole('button').and(this.page.getByLabel('Delete Container'));
  }

  async activateTab(tabName: string): Promise<void> {
    const tabItem = this.page.getByRole('link', { name: tabName, exact: true });
    await playExpect(tabItem).toBeVisible();
    await tabItem.click();
  }

  async getStateLocator(): Promise<Locator> {
    await this.activateTab(ContainerDetailsPage.SUMMARY_TAB);
    const summaryTable = this.getPage().getByRole('table');
    const stateRow = summaryTable.locator('tr:has-text("State")');
    const stateCell = stateRow.getByRole('cell').nth(1);
    await playExpect(stateCell).toBeVisible();
    return stateCell;
  }

  async getState(): Promise<string> {
    const stateCell = await this.getStateLocator();
    return await stateCell.innerText();
  }

  async stopContainer(failIfStopped = false): Promise<void> {
    try {
      await playExpect.poll(async () => await this.getState()).toBe(ContainerState.Running.toLowerCase());
      await playExpect(this.stopButton).toBeEnabled();
      await this.stopButton.click();
    } catch (error) {
      if (failIfStopped) {
        throw Error(
          `Container is not running, its state is: ${await this.getState()}, stop button not available: ${error}`,
        );
      }
    }
  }

  async deleteContainer(): Promise<ContainersPage> {
    await playExpect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new ContainersPage(this.page);
  }

  async getContainerPort(): Promise<string> {
    await this.activateTab(ContainerDetailsPage.SUMMARY_TAB);
    const summaryTable = this.getPage().getByRole('table');
    const portsRow = summaryTable.locator('tr:has-text("Ports")');
    const portsCell = portsRow.getByRole('cell').nth(1);
    await playExpect(portsCell).toBeVisible();
    return await portsCell.innerText();
  }
}
