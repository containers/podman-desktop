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
import { PodDetailsPage } from './pods-details-page';
import { PlayKubeYamlPage } from './play-kube-yaml-page';
import { handleConfirmationDialog } from '../../utility/operations';

export class PodsPage extends BasePage {
  readonly heading: Locator;
  readonly playKubernetesYAMLButton: Locator;
  readonly prunePodsButton: Locator;
  readonly pruneConfirmationButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'pods', exact: true });
    this.playKubernetesYAMLButton = this.page.getByRole('button', { name: 'Play Kubernetes YAML' });
    this.prunePodsButton = this.page.getByRole('button', { name: 'Prune' });
    this.pruneConfirmationButton = this.page.getByRole('button', { name: 'Yes' });
  }

  async getTable(): Promise<Locator> {
    if (await this.pageIsEmpty()) throw Error('Page is empty, there are no pods');

    return this.page.getByRole('table');
  }

  async pageIsEmpty(): Promise<boolean> {
    const noPodsHeading = await this.page.getByRole('heading', { name: 'No Pods', exact: true }).count();
    return noPodsHeading > 0;
  }

  async openPodDetails(name: string): Promise<PodDetailsPage> {
    const podRow = await this.getPodRowByName(name);
    if (podRow === undefined) {
      throw Error(`Pod: ${name} does not exist`);
    }
    await podRow.getByText(name).click();
    return new PodDetailsPage(this.page, name);
  }

  async getPodRowByName(name: string): Promise<Locator | undefined> {
    if (await this.pageIsEmpty()) {
      return undefined;
    }
    try {
      const podsTable = await this.getTable();
      const rows = await podsTable.getByRole('row').all();
      for (let i = rows.length - 1; i > 0; i--) {
        const nameCell = await rows[i].getByRole('cell').nth(3).getByText(name, { exact: true }).count();
        if (nameCell) {
          return rows[i];
        }
      }
    } catch (err) {
      console.log(`Exception caught on pod page with message: ${err}`);
    }
    return undefined;
  }

  async podExists(name: string): Promise<boolean> {
    return (await this.getPodRowByName(name)) !== undefined ? true : false;
  }

  async openPlayKubeYaml(): Promise<PlayKubeYamlPage> {
    await this.playKubernetesYAMLButton.click();
    return new PlayKubeYamlPage(this.page);
  }

  async prunePods(): Promise<PodsPage> {
    await this.prunePodsButton.click();
    await handleConfirmationDialog(this.page, 'Prune');
    return this;
  }
}
