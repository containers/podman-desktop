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
import { ContainersPage } from './containers-page';
import { DeployToKubernetesPage } from './deploy-to-kubernetes-page';
import { DetailsPage } from './details-page';

export class ContainerDetailsPage extends DetailsPage {
  readonly stopButton: Locator;
  readonly deleteButton: Locator;
  readonly imageLink: Locator;
  readonly deployButton: Locator;
  readonly startButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly LOGS_TAB = 'Logs';
  static readonly KUBE_TAB = 'Kube';
  static readonly TERMINAL_TAB = 'Terminal';
  static readonly INSPECT_TAB = 'Inspect';

  constructor(page: Page, name: string) {
    super(page, name);
    this.stopButton = this.controlActions.getByRole('button').and(this.page.getByLabel('Stop Container'));
    this.deleteButton = this.controlActions.getByRole('button').and(this.page.getByLabel('Delete Container'));
    this.imageLink = this.header.getByRole('link', { name: 'Image Details' });
    this.deployButton = this.controlActions.getByRole('button', { name: 'Deploy to Kubernetes' });
    this.startButton = this.controlActions.getByRole('button', { name: 'Start Container', exact: true });
  }

  async getState(): Promise<string> {
    const currentState = await this.header.getByRole('status').getAttribute('title');
    for (const state of Object.values(ContainerState)) {
      if (currentState === state) return state;
    }

    return ContainerState.Unknown;
  }

  async stopContainer(): Promise<void> {
    await playExpect(this.stopButton).toBeEnabled();
    await this.stopButton.click();
  }

  async deleteContainer(): Promise<ContainersPage> {
    await playExpect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new ContainersPage(this.page);
  }

  async getContainerPort(): Promise<string> {
    await this.activateTab(ContainerDetailsPage.SUMMARY_TAB);
    const summaryTable = this.tabContent.getByRole('table');
    const portsRow = summaryTable.locator('tr:has-text("Ports")');
    const portsCell = portsRow.getByRole('cell').nth(1);
    await playExpect(portsCell).toBeVisible();
    return await portsCell.innerText();
  }

  async openDeployToKubernetesPage(): Promise<DeployToKubernetesPage> {
    await playExpect(this.deployButton).toBeVisible();
    await this.deployButton.click();
    return new DeployToKubernetesPage(this.page);
  }
}
