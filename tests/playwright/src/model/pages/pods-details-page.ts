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
import { PodState } from '../core/states';
import { NavigationBar } from '../workbench/navigation';
import { BasePage } from './base-page';
import { PodsPage } from './pods-page';

export class PodDetailsPage extends BasePage {
  readonly labelName: Locator;
  readonly heading: Locator;
  readonly closeLink: Locator;
  readonly backToPodsLink: Locator;
  readonly podName: string;
  readonly startButton: Locator;
  readonly stopButton: Locator;
  readonly restartButton: Locator;
  readonly deleteButton: Locator;

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
    this.startButton = this.page.getByRole('button').and(this.page.getByLabel('Start Pod', { exact: true }));
    this.stopButton = this.page.getByRole('button').and(this.page.getByLabel('Stop Pod', { exact: true }));
    this.restartButton = this.page.getByRole('button').and(this.page.getByLabel('Restart Pod', { exact: true }));
    this.deleteButton = this.page.getByRole('button').and(this.page.getByLabel('Delete Pod', { exact: true }));
  }

  async activateTab(tabName: string): Promise<void> {
    const tabItem = this.page.getByRole('link', { name: tabName });
    await playExpect(tabItem).toBeEnabled();
    await tabItem.click();
  }

  async getState(): Promise<string> {
    const currentState = await this.page.getByRole('status').getAttribute('title');
    for (const state of Object.values(PodState)) {
      if (currentState === state) return state;
    }

    return PodState.Unknown;
  }

  async startPod(failIfStarted = false): Promise<void> {
    try {
      await playExpect(this.startButton).toBeEnabled();
      await this.startButton.click();
    } catch (error) {
      if (failIfStarted) {
        throw Error(`Pod is not stopped, its state is: ${await this.getState()}, start button not available: ${error}`);
      }
    }
  }

  async stopPod(podToRun: string, failIfStopped = false): Promise<void> {
    const navigationBar = new NavigationBar(this.page);
    const pods = await navigationBar.openPods();
    const podDetails = await pods.openPodDetails(podToRun);

    await playExpect(podDetails.heading).toBeVisible();
    await playExpect(podDetails.heading).toContainText(podToRun);

    try {
      await playExpect.poll(async () => await this.getState()).toBe(PodState.Running);
      await playExpect(this.stopButton).toBeVisible();
      await this.stopButton.click();
    } catch (error) {
      if (failIfStopped) {
        throw Error(`Pod is not running, its state is: ${await this.getState()}, stop button not available: ${error}`);
      }
    }
  }

  async restartPod(): Promise<void> {
    await playExpect(this.restartButton).toBeEnabled({ timeout: 20000 });
    await this.restartButton.click();
  }

  async deletePod(): Promise<PodsPage> {
    await playExpect(this.deleteButton).toBeEnabled();
    await this.deleteButton.click();
    await handleConfirmationDialog(this.page);
    return new PodsPage(this.page);
  }
}
