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

import test, { expect as playExpect, type Locator, type Page } from '@playwright/test';

import { handleConfirmationDialog } from '/@/utility/operations';
import { isMac } from '/@/utility/platform';

import { KubernetesResourceState } from '../core/states';
import { DetailsPage } from './details-page';

export class KubernetesResourceDetailsPage extends DetailsPage {
  readonly applyChangesButton: Locator;
  readonly revertChagesButton: Locator;
  readonly deleteButton: Locator;
  readonly editorWidget: Locator;
  readonly toggleButton: Locator;
  readonly findTextArea: Locator;
  readonly replaceTextArea: Locator;
  readonly replaceButton: Locator;

  static readonly SUMMARY_TAB = 'Summary';
  static readonly INSPECT_TAB = 'Inspect';
  static readonly KUBE_TAB = 'Kube';

  constructor(page: Page, title: string) {
    super(page, title);
    this.applyChangesButton = this.tabContent.getByRole('button', {
      name: 'Apply changes to cluster',
    });
    this.revertChagesButton = this.tabContent.getByRole('button', {
      name: 'Revert Changes',
    });
    this.deleteButton = this.controlActions.getByRole('button', {
      name: 'Delete',
      exact: false,
    });
    this.editorWidget = this.page.getByRole('dialog', {
      name: 'Find / Replace',
    });
    this.toggleButton = this.editorWidget.getByRole('button', {
      name: 'Toggle Replace',
    });
    this.findTextArea = this.editorWidget.getByPlaceholder('Find');
    this.replaceTextArea = this.editorWidget.getByPlaceholder('Replace');
    this.replaceButton = this.editorWidget.getByRole('button', {
      name: 'Replace All',
    });
  }

  async getState(): Promise<string> {
    return test.step('Get resource state', async () => {
      const currentState = await this.header.getByRole('status').getAttribute('title');
      for (const state of Object.values(KubernetesResourceState)) {
        if (currentState === state) return state;
      }

      return KubernetesResourceState.Unknown;
    });
  }

  public async editKubernetsYamlFile(textToBeChanged: string, newText: string): Promise<void> {
    return test.step('Edit Kubernetes YAML file', async () => {
      await this.activateTab(KubernetesResourceDetailsPage.KUBE_TAB);
      await this.tabContent.click();
      if (isMac) {
        await this.page.keyboard.press('Meta+F');
      } else {
        await this.page.keyboard.press('Control+F');
      }
      await playExpect(this.editorWidget).toBeVisible();
      await playExpect(this.findTextArea).toBeVisible();
      await this.findTextArea.fill(textToBeChanged);
      await playExpect(this.toggleButton).toBeVisible();
      await this.toggleButton.click();
      await playExpect(this.replaceTextArea).toBeVisible();
      await this.replaceTextArea.fill(newText);
      await playExpect(this.replaceButton).toBeVisible();
      await this.replaceButton.click();
      await playExpect(this.revertChagesButton).toBeEnabled();
      await playExpect(this.applyChangesButton).toBeEnabled();
      await this.applyChangesButton.click();
      await handleConfirmationDialog(this.page, 'Kubernetes', true, 'OK');
    });
  }
}
