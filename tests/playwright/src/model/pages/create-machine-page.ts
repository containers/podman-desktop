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

import { BasePage } from './base-page';
import { MachineCreationForm } from './forms/machine-creation-form';
import { ResourcesPage } from './resources-page';

export class CreateMachinePage extends BasePage {
  readonly heading: Locator;
  readonly machineCreationForm: MachineCreationForm;
  readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Create Podman Machine' });
    this.machineCreationForm = new MachineCreationForm(this.page);
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
  }

  async createMachine(
    machineName: string,
    { isRootful = true, enableUserNet = false, startNow = true, setAsDefault = true },
  ): Promise<ResourcesPage> {
    await this.machineCreationForm.setupAndCreateMachine(machineName, { isRootful, enableUserNet, startNow });

    const successfulCreationMessage = this.page.getByText('Successful operation');
    const goBackToResourcesButton = this.page.getByRole('button', { name: 'Go back to resources' });

    await playExpect(successfulCreationMessage).toBeVisible({ timeout: 120_000 });
    await playExpect(goBackToResourcesButton).toBeVisible();

    try {
      await this.handleConnectionDialog(machineName, setAsDefault);
    } catch (error) {
      console.log('No handling dialog displayed', error);
    }

    await playExpect(goBackToResourcesButton).toBeEnabled();
    await goBackToResourcesButton.click();
    return new ResourcesPage(this.page);
  }

  async handleConnectionDialog(machineName: string, setAsDefault: boolean): Promise<void> {
    const connectionDialog = this.page.getByRole('dialog', { name: 'Podman' });
    await playExpect(connectionDialog).toBeVisible({ timeout: 10_000 });

    const dialogMessage = connectionDialog.getByLabel('Dialog Message');
    await playExpect(dialogMessage).toHaveText(
      new RegExp(
        `Podman Machine '${machineName}' is running but not the default machine .+ Do you want to set it as default?`,
      ),
    );

    const handleButtonName = setAsDefault ? 'Yes' : 'Ignore';
    const handleButton = connectionDialog.getByRole('button', { name: handleButtonName });
    await handleButton.click();
  }
}
