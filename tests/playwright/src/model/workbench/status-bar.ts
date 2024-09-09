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

import { expect as playExpect, type Locator, type Page } from '@playwright/test';

import { handleConfirmationDialog } from '../../utility/operations';
import { BasePage } from '../pages/base-page';

export class StatusBar extends BasePage {
  readonly content: Locator;
  readonly kindInstallationButton: Locator;
  readonly kubernetesContext: Locator;
  readonly versionButton: Locator;
  readonly updateButtonTitle: Locator;
  readonly shareYourFeedbackButton: Locator;
  readonly troubleshootingButton: Locator;
  readonly tasksButton: Locator;
  readonly helpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.getByRole('contentinfo', { name: 'Status Bar' });
    this.kindInstallationButton = this.content.getByTitle(
      'Kind not found on your system, click to download and install it',
    );
    this.kubernetesContext = this.content.getByTitle('Current Kubernetes Context');
    this.versionButton = this.content.getByRole('button', { name: /^v\d+\.\d+\.\d+(-\w+)?$/ });
    this.updateButtonTitle = this.content.getByRole('button').and(this.content.getByTitle('Update available'));
    this.shareYourFeedbackButton = this.content.getByRole('button').and(this.content.getByTitle('Share your feedback'));
    this.troubleshootingButton = this.content.getByRole('button').and(this.content.getByTitle('Troubleshooting'));
    this.tasksButton = this.content.getByRole('button').and(this.content.getByTitle('Tasks'));
    this.helpButton = this.content.getByRole('button').and(this.content.getByTitle('Help'));
  }

  public async installKindCLI(): Promise<void> {
    await playExpect(this.kindInstallationButton).toBeVisible();
    await this.kindInstallationButton.click();
    await handleConfirmationDialog(this.page, 'Kind');
    await handleConfirmationDialog(this.page, 'Kind');
    await handleConfirmationDialog(this.page, 'Kind', true, 'OK');
  }

  public async validateKubernetesContext(context: string): Promise<void> {
    await playExpect(this.kubernetesContext).toBeVisible();
    await playExpect(this.kubernetesContext).toHaveText(context);
  }

  public async kindInstallationButtonIsVisible(): Promise<boolean> {
    return (await this.kindInstallationButton.count()) > 0;
  }
}
