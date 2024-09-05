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

import { delay } from '/@/utility/wait';

import { BasePage } from './base-page';
import { MachineCreationForm } from './forms/machine-creation-form';
import { ResourcesPage } from './resources-page';

export class CreateMachinePage extends BasePage {
  readonly heading: Locator;
  readonly closeButton: Locator;
  readonly createMachineButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole('heading', { name: 'Create Podman Machine' });
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
    this.createMachineButton = this.page.getByRole('button', { name: 'Create' });
  }

  async createMachine(
    machineName: string,
    isRootful?: boolean,
    enableUserNet?: boolean,
    startNow?: boolean,
    setAsDefault: boolean = true,
  ): Promise<ResourcesPage> {
    const machineCreationForm = new MachineCreationForm(this.page);
    await machineCreationForm.configureMachine(machineName, isRootful, enableUserNet, startNow);

    await this.createMachineButton.click();
    await this.page.waitForTimeout(60_000);

    const successfulCreationMessage = this.page.getByText('Successful operation');
    const goBackToResourcesButton = this.page.getByRole('button', { name: 'Go back to resources' });

    await delay(5000);
    await this.handleConnectionDialog(machineName, setAsDefault);

    await playExpect(successfulCreationMessage).toBeVisible({ timeout: 10_000 });
    await playExpect(goBackToResourcesButton).toBeVisible();
    await goBackToResourcesButton.click();

    return new ResourcesPage(this.page);
  }

  async handleConnectionDialog(machineName: string, setAsDefault: boolean): Promise<void> {
    const connectionDialog = this.page.getByRole('dialog', { name: 'Podman' });
    const dialogMessage = connectionDialog.getByText(
      new RegExp(
        `Podman Machine '${machineName}' is running but not the default machine .+ Do you want to set it as default?`,
      ),
    );
    if ((await connectionDialog.isVisible()) && (await dialogMessage.isVisible())) {
      let handleButtonName = 'Yes';
      if (!setAsDefault) {
        handleButtonName = 'Ignore';
      }
      const handleButton = connectionDialog.getByRole('button', { name: handleButtonName });
      await handleButton.click();
    }
  }
}
