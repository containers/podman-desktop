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

import { ContainerState } from '/@/model/core/states';
import { withMockedSaveFileDialog } from '/@/utility/dialog';
import { handleConfirmationDialog } from '/@/utility/operations';

import { ContainersPage } from './containers-page';
import { DeployToKubernetesPage } from './deploy-to-kubernetes-page';
import { DetailsPage } from './details-page';

export class ContainerDetailsPage extends DetailsPage {
  readonly stopButton: Locator;
  readonly deleteButton: Locator;
  readonly imageLink: Locator;
  readonly deployButton: Locator;
  readonly startButton: Locator;
  readonly exportButton: Locator;
  readonly terminalInput: Locator;
  readonly terminalContent: Locator;
  readonly findInLogsInput: Locator;
  readonly searchResults: Locator;
  readonly clearLogsButton: Locator;
  readonly exportPathInput: Locator;
  readonly exportBrowseButton: Locator;
  readonly confirmExportButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly LOGS_TAB = 'Logs';
  static readonly KUBE_TAB = 'Kube';
  static readonly TERMINAL_TAB = 'Terminal';
  static readonly INSPECT_TAB = 'Inspect';
  static readonly TTY_TAB = 'TTY';

  constructor(page: Page, name: string) {
    super(page, name);
    this.stopButton = this.controlActions.getByRole('button').and(this.page.getByLabel('Stop Container'));
    this.deleteButton = this.controlActions.getByRole('button').and(this.page.getByLabel('Delete Container'));
    this.imageLink = this.header.getByRole('link', { name: 'Image Details' });
    this.deployButton = this.controlActions.getByRole('button', {
      name: 'Deploy to Kubernetes',
    });
    this.startButton = this.controlActions.getByRole('button', {
      name: 'Start Container',
      exact: true,
    });
    this.exportButton = this.controlActions.getByRole('button', {
      name: 'Export Container',
      exact: true,
    });

    this.terminalInput = this.tabContent.getByLabel('Terminal input');
    this.terminalContent = this.tabContent.locator('.xterm-rows');
    this.findInLogsInput = this.tabContent.getByLabel('Find');
    this.searchResults = this.tabContent.locator('div.xterm-selection > div');
    this.clearLogsButton = this.tabContent.getByTitle('Clear logs');

    this.exportPathInput = page.locator('#input-export-container-name');
    this.exportBrowseButton = page.getByLabel('Browse... output file');
    this.confirmExportButton = page.getByRole('button', { name: 'Export container', exact: true });
  }

  async getState(): Promise<string> {
    return test.step('Get container state', async () => {
      const currentState = await this.header.getByRole('status').getAttribute('title');
      for (const state of Object.values(ContainerState)) {
        if (currentState === state) return state;
      }

      return ContainerState.Unknown;
    });
  }

  async stopContainer(): Promise<void> {
    return test.step('Stop container', async () => {
      await playExpect(this.stopButton).toBeEnabled();
      await this.stopButton.click();
    });
  }

  async deleteContainer(): Promise<ContainersPage> {
    return test.step('Delete container', async () => {
      await playExpect(this.deleteButton).toBeEnabled();
      await this.deleteButton.click();
      await handleConfirmationDialog({ page: this.page, dialogTitle: 'Delete Container?', buttonName: 'Delete' });
      return new ContainersPage(this.page);
    });
  }

  async getContainerPort(): Promise<string> {
    return test.step('Get container port', async () => {
      await this.activateTab(ContainerDetailsPage.SUMMARY_TAB);
      const summaryTable = this.tabContent.getByRole('table');
      const portsRow = summaryTable.locator('tr:has-text("Ports")');
      const portsCell = portsRow.getByRole('cell').nth(1);
      await playExpect(portsCell).toBeVisible();
      return await portsCell.innerText();
    });
  }

  async openDeployToKubernetesPage(): Promise<DeployToKubernetesPage> {
    return test.step('Open Deploy to Kubernetes page', async () => {
      await playExpect(this.deployButton).toBeVisible();
      await this.deployButton.click();
      return new DeployToKubernetesPage(this.page);
    });
  }

  async executeCommandInTerminal(command: string): Promise<void> {
    await this.activateTab(ContainerDetailsPage.TERMINAL_TAB);

    await playExpect(this.terminalInput).toBeVisible();
    await this.page.waitForTimeout(500); // Wait for terminal to be ready
    await this.terminalInput.pressSequentially(command, { delay: 10 });
    await this.terminalInput.press('Enter');
  }

  async executeCommandInTty(command: string): Promise<void> {
    return test.step('Execute command in TTY terminal', async () => {
      await this.activateTab(ContainerDetailsPage.TTY_TAB);

      await this.terminalInput.pressSequentially(command, { delay: 10 });
      await this.terminalInput.press('Enter');
    });
  }

  async findInLogs(text: string): Promise<void> {
    return test.step('Find text in logs', async () => {
      await this.activateTab(ContainerDetailsPage.LOGS_TAB);
      await playExpect(this.findInLogsInput).toBeVisible();
      await this.findInLogsInput.clear();
      await playExpect(this.findInLogsInput).toHaveValue('');

      await this.findInLogsInput.fill(text);
      await playExpect(this.findInLogsInput).toHaveValue(text);
    });
  }

  async getCountOfSearchResults(): Promise<number> {
    return test.step('Get count of search results', async () => {
      await this.activateTab(ContainerDetailsPage.LOGS_TAB);
      await playExpect(this.findInLogsInput).toBeVisible();

      return await this.searchResults.count();
    });
  }

  async clearLogs(): Promise<void> {
    return test.step('Clear logs', async () => {
      await playExpect(this.clearLogsButton).toBeVisible();
      await this.clearLogsButton.click();
    });
  }

  async searchInInspectEditor(text: string): Promise<boolean> {
    return this.searchInEditor(ContainerDetailsPage.INSPECT_TAB, text);
  }

  async exportContainer(outputPath: string): Promise<ContainersPage> {
    return test.step(`Export container to ${outputPath}`, async () => {
      await playExpect(this.exportButton).toBeEnabled();
      await this.exportButton.click();
      await playExpect(this.exportPathInput).toBeVisible();
      await playExpect(this.exportBrowseButton).toBeVisible();

      await withMockedSaveFileDialog(outputPath, async () => {
        await this.exportBrowseButton.click();
      });
      await playExpect(this.exportPathInput).toHaveValue(outputPath);
      await playExpect(this.confirmExportButton).toBeEnabled();
      await this.confirmExportButton.click();

      return new ContainersPage(this.page);
    });
  }
}
