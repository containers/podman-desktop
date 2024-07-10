/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { handleConfirmationDialog } from '../../utility/operations';
import { MainPage } from './main-page';
import { PlayKubeYamlPage } from './play-kube-yaml-page';
import { PodDetailsPage } from './pods-details-page';

export class PodsPage extends MainPage {
  readonly playKubernetesYAMLButton: Locator;
  readonly prunePodsButton: Locator;
  readonly pruneConfirmationButton: Locator;

  constructor(page: Page) {
    super(page, 'pods');
    this.playKubernetesYAMLButton = this.page.getByRole('button', { name: 'Play Kubernetes YAML' });
    this.prunePodsButton = this.page.getByRole('button', { name: 'Prune' });
    this.pruneConfirmationButton = this.page.getByRole('button', { name: 'Yes' });
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
    return this.getRowFromTableByName(name);
  }

  async podExists(name: string): Promise<boolean> {
    return (await this.getPodRowByName(name)) !== undefined;
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

  async selectPod(names: string[]): Promise<void> {
    for await (const containerName of names) {
      const row = await this.getPodRowByName(containerName);
      if (row === undefined) {
        throw Error('Pod cannot be selected');
      }
      await row.getByRole('cell').nth(1).click();
    }
  }

  async getPodActionsMenu(name: string): Promise<Locator> {
    const row = await this.getPodRowByName(name);
    if (row === undefined) {
      throw Error('Cannot select actions menu, pod does not exist');
    }
    return row.getByRole('button', { name: 'kebab menu', exact: true });
  }
}
