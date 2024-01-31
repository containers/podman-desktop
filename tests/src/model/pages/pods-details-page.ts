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
import { PodsPage } from './pods-page';
import { waitUntil, waitWhile } from '../../utility/wait';
import { PodState } from '../core/states';
import { handleConfirmationDialog } from '../../utility/operations';

export class PodDetailsPage extends BasePage {
  readonly labelName: Locator;
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly backToPodsLink: Locator;
  readonly podName: string;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly LOGS_TAB = 'Logs';
  static readonly INSPECT_TAB = 'Inspect';
  static readonly KUBE_TAB = 'Kube';

  constructor(page: Page, name: string) {
    super(page);
    this.podName = name;
    this.labelName = page.getByLabel('name').and(page.getByText('Pod Details'));
    this.heading = page.getByRole('heading', { name: this.podName });
    this.closeLink = page.getByRole('link', { name: 'Close Details' });
    this.backToPodsLink = page.getByRole('link', { name: 'Go back to Pods' });
  }

  async activateTab(tabName: string) {
    const tabItem = this.page.getByRole('link', { name: tabName });
    await tabItem.waitFor({ state: 'visible', timeout: 2000 });
    await tabItem.click();
  }

  async getState(): Promise<string> {
    for (const state in PodState) {
      const stateDiv = this.getPage().getByTitle(state.toUpperCase(), { exact: true });
      if ((await stateDiv.count()) > 0) return state.toUpperCase();
    }
    return PodState.Unknown;
  }

  async stopPod(failIfStopped = false): Promise<void> {
    try {
      await waitUntil(async () => (await this.getState()) === PodState.Running, 3000, 900);
      const stopButton = this.page.getByRole('button').and(this.page.getByLabel('Stop Pod'));
      await stopButton.waitFor({ state: 'visible', timeout: 2000 });
      await stopButton.click();
    } catch (error) {
      if (failIfStopped) {
        throw Error(`Pod is not running, its state is: ${await this.getState()}, stop button not available: ${error}`);
      }
    }
  }

  async deletePod(timeout: number): Promise<PodsPage> {
    const deleteButton = this.page.getByRole('button').and(this.page.getByLabel('Delete Pod'));
    await deleteButton.click();
    await handleConfirmationDialog(this.page);
    await waitWhile(
      async () => await this.heading.isVisible(),
      timeout,
      5000,
      true,
      `Pod was not deleted in ${timeout / 1000}s`,
    );
    // after delete is successful we expect to see Pods page
    return new PodsPage(this.page);
  }
}
